import { useState } from 'react'
import SimpleCrudTable from '../components/SimpleCrudTable'
import { useAdminData } from '../context/AdminDataContext'

export default function ReportsPage() {
  const { reports, setReports } = useAdminData()
  const [form, setForm] = useState({ targetType: '', reason: '' })

  const addReport = () => {
    if (!form.targetType || !form.reason) return
    setReports((prev) => [
      ...prev,
      {
        id: `rep-${Date.now()}`,
        targetType: form.targetType,
        target: 'new-target',
        reason: form.reason,
        status: 'Pending',
      },
    ])
    setForm({ targetType: '', reason: '' })
  }

  const deleteReport = (id) => setReports((prev) => prev.filter((item) => item.id !== id))

  const quickAction = (action, id) => {
    setReports((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        if (action === 'warn') return { ...item, status: 'Under Review' }
        if (action === 'suspend') return { ...item, status: 'Under Review' }
        if (action === 'resolve') return { ...item, status: 'Resolved' }
        return item
      }),
    )
  }

  return (
    <>
      <h1>Reports & Disputes</h1>
      <SimpleCrudTable
        title="Admin-managed dispute resolution queue"
        columns={[
          { key: 'targetType', label: 'Target Type' },
          { key: 'target', label: 'Target' },
          { key: 'reason', label: 'Complaint' },
          { key: 'status', label: 'Status' },
        ]}
        rows={reports}
        formFields={[
          { key: 'targetType', placeholder: 'User or Property' },
          { key: 'reason', placeholder: 'Complaint details' },
        ]}
        formData={form}
        setFormData={setForm}
        onAdd={addReport}
        onDelete={deleteReport}
        onQuickAction={quickAction}
        quickActions={[
          { key: 'warn', label: 'Warn User' },
          { key: 'suspend', label: 'Suspend' },
          { key: 'resolve', label: 'Resolve' },
        ]}
      />
    </>
  )
}
