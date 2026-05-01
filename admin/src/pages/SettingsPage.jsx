import { useState } from 'react'
import { useAdminData } from '../context/AdminDataContext'

function SettingList({ title, items, onDelete }) {
  return (
    <article className="card glass">
      <div className="card-head">
        <h3>{title}</h3>
      </div>
      <div className="table-list">
        {items.map((item) => (
          <div key={item} className="table-row two-col">
            <span>{item}</span>
            <button type="button" className="mini-btn inline-btn danger-btn" onClick={() => onDelete(item)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </article>
  )
}

export default function SettingsPage() {
  const { settings, setSettings } = useAdminData()
  const { propertyTypes, filters, rules } = settings
  const [input, setInput] = useState({ type: '', filter: '', rule: '' })

  return (
    <>
      <h1>System Settings</h1>
      <section className="card glass">
        <div className="crud-form">
          <input
            className="crud-input"
            placeholder="New property type"
            value={input.type}
            onChange={(event) => setInput((prev) => ({ ...prev, type: event.target.value }))}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!input.type) return
              setSettings((prev) => ({
                ...prev,
                propertyTypes: [...prev.propertyTypes, input.type],
              }))
              setInput((prev) => ({ ...prev, type: '' }))
            }}
          >
            Add Type
          </button>
          <input
            className="crud-input"
            placeholder="New filter (veg, pets...)"
            value={input.filter}
            onChange={(event) => setInput((prev) => ({ ...prev, filter: event.target.value }))}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!input.filter) return
              setSettings((prev) => ({
                ...prev,
                filters: [...prev.filters, input.filter],
              }))
              setInput((prev) => ({ ...prev, filter: '' }))
            }}
          >
            Add Filter
          </button>
          <input
            className="crud-input"
            placeholder="New platform rule"
            value={input.rule}
            onChange={(event) => setInput((prev) => ({ ...prev, rule: event.target.value }))}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!input.rule) return
              setSettings((prev) => ({
                ...prev,
                rules: [...prev.rules, input.rule],
              }))
              setInput((prev) => ({ ...prev, rule: '' }))
            }}
          >
            Add Rule
          </button>
        </div>
      </section>

      <section className="content-grid">
        <SettingList
          title="Property categories"
          items={propertyTypes}
          onDelete={(item) =>
            setSettings((prev) => ({
              ...prev,
              propertyTypes: prev.propertyTypes.filter((value) => value !== item),
            }))
          }
        />
        <SettingList
          title="Managed filters"
          items={filters}
          onDelete={(item) =>
            setSettings((prev) => ({
              ...prev,
              filters: prev.filters.filter((value) => value !== item),
            }))
          }
        />
      </section>

      <section className="users-card">
        <SettingList
          title="Platform rules"
          items={rules}
          onDelete={(item) =>
            setSettings((prev) => ({
              ...prev,
              rules: prev.rules.filter((value) => value !== item),
            }))
          }
        />
      </section>
    </>
  )
}
