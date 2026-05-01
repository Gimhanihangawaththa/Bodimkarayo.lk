export default function SimpleCrudTable({
  title,
  columns,
  rows,
  formFields,
  formData,
  setFormData,
  onAdd,
  onDelete,
  onQuickAction,
  quickActions = [],
}) {
  return (
    <section className="card glass users-card">
      <div className="card-head">
        <h3>{title}</h3>
      </div>

      <div className="crud-form">
        {formFields.map((field) =>
          field.type === 'select' ? (
            <select
              key={field.key}
              className="crud-input"
              value={formData[field.key] ?? ''}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
            >
              <option value="">{field.placeholder ?? 'Select an option'}</option>
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={field.key}
              className="crud-input"
              placeholder={field.placeholder}
              value={formData[field.key] ?? ''}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
            />
          ),
        )}
        <button type="button" className="primary-btn" onClick={onAdd}>
          Add
        </button>
      </div>

      <div className="table-list">
        <div className="table-row table-head">
          {columns.map((column) => (
            <span key={column.key}>{column.label}</span>
          ))}
          <span>Actions</span>
        </div>

        {rows.map((row) => (
          <div key={row.id} className="table-row">
            {columns.map((column) => (
              <span key={column.key}>{String(row[column.key])}</span>
            ))}
            <div className="action-wrap">
              {quickActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="mini-btn inline-btn"
                  onClick={() => onQuickAction(action.key, row.id)}
                >
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                className="mini-btn inline-btn danger-btn"
                onClick={() => onDelete(row.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
