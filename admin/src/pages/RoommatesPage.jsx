import { useState } from 'react'
import SimpleCrudTable from '../components/SimpleCrudTable'
import { useAdminData } from '../context/AdminDataContext'

export default function RoommatesPage() {
  const { roommates, setRoommates } = useAdminData()
  const [form, setForm] = useState({ title: '', gender: '', lifestyle: '' })

  const addPost = () => {
    if (!form.title || !form.gender || !form.lifestyle) return
    setRoommates((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        title: form.title,
        gender: form.gender,
        lifestyle: form.lifestyle,
        studentFriendly: false,
        trendScore: 0,
        status: 'Active',
      },
    ])
    setForm({ title: '', gender: '', lifestyle: '' })
  }

  const deletePost = (id) => setRoommates((prev) => prev.filter((item) => item.id !== id))

  const quickAction = (action, id) => {
    setRoommates((prev) =>
      prev.map((post) => {
        if (post.id !== id) return post
        if (action === 'remove') return { ...post, status: 'Removed' }
        if (action === 'feature') return { ...post, studentFriendly: true }
        if (action === 'flag') return { ...post, status: 'Flagged' }
        if (action === 'active') return { ...post, status: 'Active' }
        return post
      }),
    )
  }

  return (
    <>
      <h1>Roommate (Bodima) Management</h1>
      <SimpleCrudTable
        title="Roommate posts, gender/lifestyle filters, trending monitor"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'gender', label: 'Gender' },
          { key: 'lifestyle', label: 'Lifestyle' },
          { key: 'studentFriendly', label: 'Student Friendly' },
          { key: 'trendScore', label: 'Trend Score' },
          { key: 'status', label: 'Status' },
        ]}
        rows={roommates}
        formFields={[
          { key: 'title', placeholder: 'Post title' },
          {
            key: 'gender',
            type: 'select',
            placeholder: 'Select gender',
            options: [
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Any', label: 'Any' },
            ],
          },
          { key: 'lifestyle', placeholder: 'Lifestyle' },
        ]}
        formData={form}
        setFormData={setForm}
        onAdd={addPost}
        onDelete={deletePost}
        onQuickAction={quickAction}
        quickActions={[
          { key: 'feature', label: 'Student Friendly' },
          { key: 'flag', label: 'Flag' },
          { key: 'remove', label: 'Remove' },
          { key: 'active', label: 'Active' },
        ]}
      />
    </>
  )
}
