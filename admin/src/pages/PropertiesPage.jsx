import { useState } from 'react'
import SimpleCrudTable from '../components/SimpleCrudTable'
import { useAdminData } from '../context/AdminDataContext'

export default function PropertiesPage() {
  const { properties, setProperties } = useAdminData()
  const [form, setForm] = useState({ title: '', owner: '', location: '', price: '' })

  const addProperty = () => {
    if (!form.title || !form.owner || !form.location || !form.price) return
    setProperties((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        title: form.title,
        owner: form.owner,
        status: 'Pending',
        location: form.location,
        price: Number(form.price),
        flagged: false,
      },
    ])
    setForm({ title: '', owner: '', location: '', price: '' })
  }

  const deleteProperty = (id) =>
    setProperties((prev) => prev.filter((property) => property.id !== id))

  const quickAction = (action, id) => {
    setProperties((prev) =>
      prev.map((property) => {
        if (property.id !== id) return property
        if (action === 'approve') return { ...property, status: 'Approved' }
        if (action === 'reject') return { ...property, status: 'Rejected' }
        if (action === 'flag') return { ...property, flagged: true }
        return property
      }),
    )
  }

  return (
    <>
      <h1>Property Management</h1>
      <section className="card glass">
        <p className="label">
          Includes listing moderation, fake listing removal, detail editing flow, and map preview.
        </p>
      </section>
      <SimpleCrudTable
        title="All properties"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'owner', label: 'Owner' },
          { key: 'status', label: 'Status' },
          { key: 'location', label: 'Location' },
          { key: 'price', label: 'Price (LKR)' },
          { key: 'flagged', label: 'Flagged' },
        ]}
        rows={properties}
        formFields={[
          { key: 'title', placeholder: 'Property title' },
          { key: 'owner', placeholder: 'Owner' },
          { key: 'location', placeholder: 'Location' },
          { key: 'price', placeholder: 'Price (LKR)' },
        ]}
        formData={form}
        setFormData={setForm}
        onAdd={addProperty}
        onDelete={deleteProperty}
        onQuickAction={quickAction}
        quickActions={[
          { key: 'approve', label: 'Approve' },
          { key: 'reject', label: 'Reject' },
          { key: 'flag', label: 'Mark Fake' },
        ]}
      />
    </>
  )
}
