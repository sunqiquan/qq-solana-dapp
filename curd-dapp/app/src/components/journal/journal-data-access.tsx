import {
  CURD_DAPP_PROGRAM_ADDRESS,
  decodeJournalEntry,
  getCreateJournalEntryInstructionAsync,
  getDeleteJournalEntryInstructionAsync,
  getUpdateJournalEntryInstructionAsync,
  JOURNAL_ENTRY_DISCRIMINATOR,
} from '@/../clients/js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Address, Base64EncodedBytes, Signature, SignatureBytes } from '@solana/kit'
import { useWalletUi } from '@wallet-ui/react'
import { createTransaction, getBase58Decoder, signAndSendTransactionMessageWithSigners, SolanaClient } from 'gill'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { createHash } from 'crypto'
import { PublicKey } from '@solana/web3.js'

export async function fetchJournalEntriesByOwner(rpc: SolanaClient['rpc'], address: Address) {
  const accounts = await rpc
    .getProgramAccounts(CURD_DAPP_PROGRAM_ADDRESS, {
      encoding: 'base64',
      commitment: 'confirmed',
      filters: [
        {
          memcmp: {
            encoding: 'base64',
            offset: BigInt(0),
            bytes: Buffer.from(JOURNAL_ENTRY_DISCRIMINATOR).toString('base64') as Base64EncodedBytes,
          },
        },
        {
          memcmp: {
            encoding: 'base64',
            offset: BigInt(8),
            bytes: Buffer.from(new PublicKey(address).toBytes()).toString('base64') as Base64EncodedBytes,
          },
        },
      ],
    })
    .send()

  const encodedAccounts = accounts.map((acc) => ({
    address: acc.pubkey as Address,
    data: Buffer.from(acc.account.data[0], 'base64'),
    lamports: acc.account.lamports,
    executable: acc.account.executable,
    programAddress: CURD_DAPP_PROGRAM_ADDRESS,
    space: BigInt(acc.account.data[0].length),
  }))

  return encodedAccounts.map((ea) => decodeJournalEntry(ea))
}

function useGetJournalEntriesQueryKey({ address }: { address: Address }) {
  const { cluster } = useWalletUi()
  return ['get-journal-entries', { cluster, address }]
}

function useInvalidateGetJournalEntriesQuery({ address }: { address: Address }) {
  const queryClient = useQueryClient()
  const queryKey = useGetJournalEntriesQueryKey({ address })
  return async () => {
    await queryClient.invalidateQueries({ queryKey })
  }
}

export function useGetJournalEntriesQuery({ address }: { address: Address }) {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useGetJournalEntriesQueryKey({ address }),
    queryFn: () => fetchJournalEntriesByOwner(client.rpc, address),
  })
}

async function waitForTransactionConfirmation(
  client: SolanaClient,
  signatureBytes: SignatureBytes,
  timeout = 30000, // 30秒超时
  interval = 1000, // 每秒轮询
): Promise<boolean> {
  const signature = getBase58Decoder().decode(signatureBytes) as Signature
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const { value } = await client.rpc.getSignatureStatuses([signature]).send()
      const status = value?.[0]
      if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
        console.log('Transaction confirmed:', status)
        return true
      }
    } catch (err) {
      console.warn('Error fetching signature status:', err)
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  console.warn('Transaction confirmation timed out')
  return false
}

export function useCreateJournalMutation({ address }: { address: Address }) {
  const { client } = useWalletUi()
  const signer = useWalletUiSigner()
  const invalidateGetJournalEntriesQuery = useInvalidateGetJournalEntriesQuery({ address })

  return useMutation({
    mutationFn: async (input: { title: string; content: string }) => {
      try {
        const ix = await getCreateJournalEntryInstructionAsync({
          signer,
          titleHash: createHash('sha256').update(input.title).digest(),
          title: input.title,
          content: input.content,
        })

        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [ix],
        })

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const confirmed = await waitForTransactionConfirmation(client, signatureBytes)

        if (!confirmed) {
          toast.error('Transaction not confirmed in time!')
          return
        }

        return getBase58Decoder().decode(signatureBytes)
      } catch (error: unknown) {
        console.error('Create journal error:', error)
        throw error
      }
    },
    onSuccess: async (tx) => {
      if (!tx) return
      console.log('Create journal tx:', tx)
      toastTx(tx)
      await invalidateGetJournalEntriesQuery()
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error.message}`)
    },
  })
}

export function useDeleteJournalMutation({ address }: { address: Address }) {
  const { client } = useWalletUi()
  const signer = useWalletUiSigner()
  const invalidateGetJournalEntriesQuery = useInvalidateGetJournalEntriesQuery({ address })

  return useMutation({
    mutationFn: async (input: { title: string }) => {
      try {
        const ix = await getDeleteJournalEntryInstructionAsync({
          signer,
          titleHash: createHash('sha256').update(input.title).digest(),
          title: input.title,
        })

        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [ix],
        })

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const confirmed = await waitForTransactionConfirmation(client, signatureBytes)

        if (!confirmed) {
          toast.error('Transaction not confirmed in time!')
          return
        }

        return getBase58Decoder().decode(signatureBytes)
      } catch (error: unknown) {
        console.error('Delete journal error:', error)
        throw error
      }
    },
    onSuccess: async (tx) => {
      if (!tx) return
      console.log('Delete journal tx:', tx)
      toastTx(tx)
      await invalidateGetJournalEntriesQuery()
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error.message}`)
    },
  })
}

export function useUpdateJournalMutation({ address }: { address: Address }) {
  const { client } = useWalletUi()
  const signer = useWalletUiSigner()
  const invalidateGetJournalEntriesQuery = useInvalidateGetJournalEntriesQuery({ address })

  return useMutation({
    mutationFn: async (input: { title: string; content: string }) => {
      try {
        const ix = await getUpdateJournalEntryInstructionAsync({
          signer,
          titleHash: createHash('sha256').update(input.title).digest(),
          title: input.title,
          content: input.content,
        })

        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [ix],
        })

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const confirmed = await waitForTransactionConfirmation(client, signatureBytes)

        if (!confirmed) {
          toast.error('Transaction not confirmed in time!')
          return
        }

        return getBase58Decoder().decode(signatureBytes)
      } catch (error: unknown) {
        console.error('Update journal error:', error)
        throw error
      }
    },
    onSuccess: async (tx) => {
      if (!tx) return
      console.log('Update journal tx:', tx)
      toastTx(tx)
      await invalidateGetJournalEntriesQuery()
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error.message}`)
    },
  })
}
