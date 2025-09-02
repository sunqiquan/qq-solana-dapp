import { TOKEN_2022_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS } from 'gill/programs/token'
import { getTransferSolInstruction } from 'gill/programs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import {
  type Address,
  Instruction,
  airdropFactory,
  createTransaction,
  getBase58Decoder,
  lamports,
  signAndSendTransactionMessageWithSigners,
  type SolanaClient,
  AccountRole,
} from 'gill'
import { toast } from 'sonner'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'
import idl from '@/../idl/voting_dapp.json'

function useGetBalanceQueryKey({ address }: { address: Address }) {
  const { cluster } = useWalletUi()

  return ['get-balance', { cluster, address }]
}

function useInvalidateGetBalanceQuery({ address }: { address: Address }) {
  const queryClient = useQueryClient()
  const queryKey = useGetBalanceQueryKey({ address })
  return async () => {
    await queryClient.invalidateQueries({ queryKey })
  }
}

export function useGetBalanceQuery({ address }: { address: Address }) {
  const { client } = useWalletUi()

  return useQuery({
    retry: false,
    queryKey: useGetBalanceQueryKey({ address }),
    queryFn: () => client.rpc.getBalance(address).send(),
  })
}

function useGetSignaturesQueryKey({ address }: { address: Address }) {
  const { cluster } = useWalletUi()

  return ['get-signatures', { cluster, address }]
}

function useInvalidateGetSignaturesQuery({ address }: { address: Address }) {
  const queryClient = useQueryClient()
  const queryKey = useGetSignaturesQueryKey({ address })
  return async () => {
    await queryClient.invalidateQueries({ queryKey })
  }
}

export function useGetSignaturesQuery({ address }: { address: Address }) {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useGetSignaturesQueryKey({ address }),
    queryFn: () => client.rpc.getSignaturesForAddress(address).send(),
  })
}

async function getTokenAccountsByOwner(
  rpc: SolanaClient['rpc'],
  { address, programId }: { address: Address; programId: Address },
) {
  return await rpc
    .getTokenAccountsByOwner(address, { programId }, { commitment: 'confirmed', encoding: 'jsonParsed' })
    .send()
    .then((res) => res.value ?? [])
}

export function useGetTokenAccountsQuery({ address }: { address: Address }) {
  const { client, cluster } = useWalletUi()

  return useQuery({
    queryKey: ['get-token-accounts', { cluster, address }],
    queryFn: async () =>
      Promise.all([
        getTokenAccountsByOwner(client.rpc, { address, programId: TOKEN_PROGRAM_ADDRESS }),
        getTokenAccountsByOwner(client.rpc, { address, programId: TOKEN_2022_PROGRAM_ADDRESS }),
      ]).then(([tokenAccounts, token2022Accounts]) => [...tokenAccounts, ...token2022Accounts]),
  })
}

export function useTransferSolMutation({ address }: { address: Address }) {
  const { client } = useWalletUi()
  const signer = useWalletUiSigner()
  const invalidateBalanceQuery = useInvalidateGetBalanceQuery({ address })
  const invalidateSignaturesQuery = useInvalidateGetSignaturesQuery({ address })

  return useMutation({
    mutationFn: async (input: { destination: Address; amount: number }) => {
      try {
        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [
            getTransferSolInstruction({
              amount: input.amount,
              destination: input.destination,
              source: signer,
            }),
          ],
        })

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const signature = getBase58Decoder().decode(signatureBytes)

        console.log(signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`)

        return
      }
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await Promise.all([invalidateBalanceQuery(), invalidateSignaturesQuery()])
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`)
    },
  })
}

export function useRequestAirdropMutation({ address }: { address: Address }) {
  const { client } = useWalletUi()
  const invalidateBalanceQuery = useInvalidateGetBalanceQuery({ address })
  const invalidateSignaturesQuery = useInvalidateGetSignaturesQuery({ address })
  const airdrop = airdropFactory(client)

  return useMutation({
    mutationFn: async (amount: number = 1) =>
      airdrop({
        commitment: 'confirmed',
        recipientAddress: address,
        lamports: lamports(BigInt(Math.round(amount * 1_000_000_000))),
      }),
    onSuccess: async (tx) => {
      toastTx(tx)
      await Promise.all([invalidateBalanceQuery(), invalidateSignaturesQuery()])
    },
  })
}

export function useVoteMutation({ address }: { address: Address }) {
  const { client } = useWalletUi()
  const signer = useWalletUiSigner()
  const PROGRAM_ID = new PublicKey(idl.address)
  const invalidateBalanceQuery = useInvalidateGetBalanceQuery({ address })
  const invalidateSignaturesQuery = useInvalidateGetSignaturesQuery({ address })

  return useMutation({
    mutationFn: async (input: { pollId: number; candidateName: string }) => {
      try {
        // PDAs
        const [pollAcc] = PublicKey.findProgramAddressSync(
          [Buffer.from('poll'), new BN(input.pollId).toArrayLike(Buffer, 'le', 8)],
          PROGRAM_ID,
        )
        const [candAcc] = PublicKey.findProgramAddressSync(
          [new BN(input.pollId).toArrayLike(Buffer, 'le', 8), Buffer.from(input.candidateName)],
          PROGRAM_ID,
        )

        const ix: Instruction = {
          programAddress: PROGRAM_ID.toBase58() as Address,
          accounts: [
            { address: pollAcc.toBase58() as Address, role: AccountRole.READONLY },
            { address: candAcc.toBase58() as Address, role: AccountRole.WRITABLE },
            { address: signer.address, role: AccountRole.WRITABLE_SIGNER },
          ],
          data: Buffer.concat([
            (() => {
              type VoteInstruction = { name: string; discriminator: number[] }
              const voteInstruction = idl.instructions.find((i: VoteInstruction) => i.name === 'vote')
              if (!voteInstruction) {
                throw new Error('Vote instruction not found in IDL')
              }
              return Buffer.from(voteInstruction.discriminator)
            })(),
            new BN(input.pollId).toArrayLike(Buffer, 'le', 8),
            (() => {
              const nameBuf = Buffer.from(input.candidateName)
              const lenBuf = Buffer.alloc(4)
              lenBuf.writeUInt32LE(nameBuf.length, 0)
              return Buffer.concat([lenBuf, nameBuf])
            })(),
          ]),
        }

        // 获取最新区块
        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [ix],
        })

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const signature = getBase58Decoder().decode(signatureBytes)

        console.log('Vote tx signature:', signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`)
        return
      }
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await Promise.all([invalidateBalanceQuery(), invalidateSignaturesQuery()])
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`)
    },
  })
}
