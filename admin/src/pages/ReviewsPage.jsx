import { useState } from 'react'
import SimpleCrudTable from '../components/SimpleCrudTable'
import { useAdminData } from '../context/AdminDataContext'

export default function ReviewsPage() {
  const { reviews, setReviews } = useAdminData()
  const [form, setForm] = useState({ landlord: '', comment: '' })

  const addReview = () => {
    if (!form.landlord || !form.comment) return
    setReviews((prev) => [
      ...prev,
      {
        id: `rv-${Date.now()}`,
        landlord: form.landlord,
        rating: 0,
        comment: form.comment,
        status: 'Visible',
      },
    ])
    setForm({ landlord: '', comment: '' })
  }

  const deleteReview = (id) => setReviews((prev) => prev.filter((item) => item.id !== id))

  const quickAction = (action, id) => {
    setReviews((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        if (action === 'spam') return { ...item, status: 'Flagged' }
        if (action === 'restore') return { ...item, status: 'Visible' }
        return item
      }),
    )
  }

  const lowRatedCount = reviews.filter((item) => Number(item.rating) < 2.5).length

  return (
    <>
      <h1>Reviews & Ratings</h1>
      <section className="card glass">
        <p className="label">Low-rated landlords monitored: {lowRatedCount}</p>
      </section>
      <SimpleCrudTable
        title="Review moderation and spam removal"
        columns={[
          { key: 'landlord', label: 'Landlord' },
          { key: 'rating', label: 'Rating' },
          { key: 'comment', label: 'Comment' },
          { key: 'status', label: 'Status' },
        ]}
        rows={reviews}
        formFields={[
          { key: 'landlord', placeholder: 'Landlord name' },
          { key: 'comment', placeholder: 'Comment' },
        ]}
        formData={form}
        setFormData={setForm}
        onAdd={addReview}
        onDelete={deleteReview}
        onQuickAction={quickAction}
        quickActions={[
          { key: 'spam', label: 'Mark Spam' },
          { key: 'restore', label: 'Restore' },
        ]}
      />
    </>
  )
}
