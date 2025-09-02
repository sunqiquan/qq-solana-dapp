import {
  useGetJournalEntriesQuery,
  useCreateJournalMutation,
  useDeleteJournalMutation,
  useUpdateJournalMutation,
} from './journal-data-access'
import { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { RefreshCw } from 'lucide-react'
import { Address } from 'gill'

export function JournalList({ address }: { address: Address }) {
  const query = useGetJournalEntriesQuery({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  const deleteMutation = useDeleteJournalMutation({ address })
  async function handleDelete(title: string) {
    console.log(`Delete Journal(title: ${title})`)
    await deleteMutation.mutateAsync({ title })
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState('')
  const [selectedContent, setSelectedContent] = useState('')

  const handleOpenModal = (title: string, content: string) => {
    setSelectedTitle(title)
    setSelectedContent(content)
    setModalOpen(true)
  }

  const updateMutation = useUpdateJournalMutation({ address })
  const handleUpdate = async (title: string, content: string) => {
    console.log(`Update Journal(title: ${title}, content: ${content})`)
    await updateMutation.mutateAsync({ title, content })
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Journal Entries</h2>
        <div className="space-x-2">
          {query.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <Button variant="outline" onClick={() => query.refetch()}>
              <RefreshCw size={16} />
            </Button>
          )}
        </div>
      </div>
      {query.isError && <pre className="alert alert-error">Error: {query.error?.message.toString()}</pre>}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No journals found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.data.title}>
                    <TableCell className="font-mono">{item.data.title}</TableCell>
                    <TableCell>{item.data.content}</TableCell>
                    <TableCell>
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 mr-2"
                        onClick={() => handleOpenModal(item.data.title, item.data.content)}
                      >
                        Update
                      </button>
                      <button className="bg-red-500 text-white px-2 py-1" onClick={() => handleDelete(item.data.title)}>
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {(query.data?.length ?? 0) > 5 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
      <UpdateJournalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedTitle}
        content={selectedContent}
        address={address}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

export function CreateJournal({ address }: { address: Address }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const mutation = useCreateJournalMutation({ address })

  const handleCreate = async () => {
    setLoading(true)
    console.log(`Create Journal(title: ${title}, content: ${content})`)
    await mutation.mutateAsync(
      {
        title,
        content,
      },
      {
        onSuccess: () => {
          setTitle('')
          setContent('')
          setLoading(false)
        },
        onError: () => {
          setLoading(false)
        },
      },
    )
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Create Journal</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded p-2"
          rows={6}
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Submitting...' : 'Create Journal'}
      </button>
    </div>
  )
}

import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'

interface UpdateJournalModalProps {
  open: boolean
  onClose: () => void
  title: string
  content: string
  address: Address
  onUpdate: (title: string, newContent: string) => void
}

export function UpdateJournalModal({ open, onClose, title, content, onUpdate }: UpdateJournalModalProps) {
  const [newContent, setNewContent] = useState(content)

  useEffect(() => {
    if (open) setNewContent(content)
  }, [open, content])

  const handleSubmit = () => {
    onUpdate(title, newContent)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Update Journal</DialogTitle>
          <Label>Title: {title}</Label>
        </DialogHeader>

        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={6}
          className="w-full border rounded p-2"
        />

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
