import { useState } from 'react'
import SimpleCrudTable from '../components/SimpleCrudTable'
import { useAdminData } from '../context/AdminDataContext'

export default function UsersPage() {
  const { users, setUsers, addUser: createUser } = useAdminData()
  const [form, setForm] = useState({ name: '', email: '' })

  const handleAddUser = () => {
    if (!form.name || !form.email) return
    createUser({ name: form.name, email: form.email })
    setForm({ name: '', email: '' })
  }

  const deleteUser = (id) => setUsers((prev) => prev.filter((item) => item.id !== id))

  const quickAction = (action, id) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) return user
        if (action === 'verify') return { ...user, verified: true }
        if (action === 'suspend') return { ...user, status: 'Suspended' }
        if (action === 'activate') return { ...user, status: 'Active' }
        return user
      }),
    )
  }

  const suspiciousCount = users.filter((user) => user.complaints >= 3).length

  return (
    <>
      <h1>User Management</h1>
      <section className="card glass">
        <p className="label">Suspicious users (3+ complaints): {suspiciousCount}</p>
      </section>
      <SimpleCrudTable
        title="All users (View, verify, suspend, profile insights)"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'verified', label: 'Verified' },
          { key: 'status', label: 'Status' },
          { key: 'listings', label: 'Listings' },
          { key: 'reviews', label: 'Reviews' },
        ]}
        rows={users}
        formFields={[
          { key: 'name', placeholder: 'Name' },
          { key: 'email', placeholder: 'Email' },
        ]}
        formData={form}
        setFormData={setForm}
        onAdd={handleAddUser}
        onDelete={deleteUser}
        onQuickAction={quickAction}
        quickActions={[
          { key: 'verify', label: 'Verify' },
          { key: 'suspend', label: 'Suspend' },
          { key: 'activate', label: 'Activate' },
        ]}
      />
    </>
  )
}
