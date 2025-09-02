import { assertIsAddress } from 'gill'
import { useMemo, useEffect } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { CreateJournal, JournalList } from './journal-ui'

export default function JournalFeatureDetail() {
  const { account } = useWalletUi()
  const router = useRouter()
  useEffect(() => {
    if (!account) {
      router.replace('/account')
    }
  }, [account, router])

  const params = useParams()
  const address = useMemo(() => {
    if (!params.address || typeof params.address !== 'string') {
      return
    }
    assertIsAddress(params.address)
    return params.address
  }, [params])

  if (!address) {
    return <div>Error loading account</div>
  }

  return (
    <div>
      <CreateJournal address={address} />
      <JournalList address={address} />
    </div>
  )
}
