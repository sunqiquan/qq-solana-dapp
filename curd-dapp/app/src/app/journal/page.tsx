'use client'
import { redirect } from 'next/navigation'
import JournalFeatureIndex from '@/components/journal/journal-feature-index'

export default function Page() {
  return <JournalFeatureIndex redirect={redirect} />
}
