import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAdminData } from './context/AdminDataContext'

const sidebarItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Users', path: '/users' },
  { label: 'Properties', path: '/properties' },
  { label: 'Roommates', path: '/roommates' },
  { label: 'Reports', path: '/reports' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Map View', path: '/map-view' },
  { label: 'Settings', path: '/settings' },
]

const appPanelItems = ['Calendar', 'Tasks', 'Messages', 'File Manager', 'Notes', 'Support']

function ModalWindow({ title, body, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="ghost-btn" onClick={onClose}>
            x
          </button>
        </div>
        <div className="modal-content">{body}</div>
      </div>
    </div>
  )
}

export default function App() {
  const {
    addCalendarEvent,
    addGeneratedReport,
    addMaintenance,
    addMessage,
    addNote,
    addSupportTicket,
    addTask,
    addUser,
    calendarEvents,
    files,
    maintenance,
    messages,
    notes,
    supportTickets,
    tasks,
  } = useAdminData()
  const [activeModal, setActiveModal] = useState('')
  const [quickAction, setQuickAction] = useState('')
  const [form, setForm] = useState({})

  const modalContent = useMemo(() => {
    if (!activeModal) return null
    if (activeModal === 'Calendar') {
      return (
        <div className="modal-stack">
          <div className="crud-form">
            <input
              className="crud-input"
              placeholder="Event title"
              value={form.eventTitle ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, eventTitle: event.target.value }))}
            />
            <input
              className="crud-input"
              type="date"
              value={form.eventDate ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, eventDate: event.target.value }))}
            />
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (!form.eventTitle || !form.eventDate) return
                addCalendarEvent({ title: form.eventTitle, date: form.eventDate })
                setForm((prev) => ({ ...prev, eventTitle: '', eventDate: '' }))
              }}
            >
              Add Event
            </button>
          </div>
          <div className="table-list">
            {calendarEvents.map((event) => (
              <div key={event.id} className="table-row">
                <span>{event.title}</span>
                <span>{event.date}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeModal === 'Tasks') {
      return (
        <div className="modal-stack">
          <div className="crud-form">
            <input
              className="crud-input"
              placeholder="Task title"
              value={form.taskTitle ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, taskTitle: event.target.value }))}
            />
            <input
              className="crud-input"
              placeholder="Priority"
              value={form.taskPriority ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, taskPriority: event.target.value }))}
            />
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (!form.taskTitle || !form.taskPriority) return
                addTask({ title: form.taskTitle, priority: form.taskPriority })
                setForm((prev) => ({ ...prev, taskTitle: '', taskPriority: '' }))
              }}
            >
              Add Task
            </button>
          </div>
          <div className="table-list">
            {tasks.map((task) => (
              <div key={task.id} className="table-row">
                <span>{task.title}</span>
                <span>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeModal === 'Messages') {
      return (
        <div className="modal-stack">
          <div className="crud-form">
            <input
              className="crud-input"
              placeholder="Sender"
              value={form.msgFrom ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, msgFrom: event.target.value }))}
            />
            <input
              className="crud-input"
              placeholder="Message"
              value={form.msgText ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, msgText: event.target.value }))}
            />
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (!form.msgFrom || !form.msgText) return
                addMessage({ from: form.msgFrom, text: form.msgText })
                setForm((prev) => ({ ...prev, msgFrom: '', msgText: '' }))
              }}
            >
              Send
            </button>
          </div>
          <div className="table-list">
            {messages.map((message) => (
              <div key={message.id} className="table-row">
                <span>{message.from}</span>
                <span>{message.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeModal === 'File Manager') {
      return (
        <div className="table-list">
          {files.map((file) => (
            <div key={file.id} className="table-row">
              <span>{file.name}</span>
              <span>{file.size}</span>
            </div>
          ))}
        </div>
      )
    }

    if (activeModal === 'Notes') {
      return (
        <div className="modal-stack">
          <div className="crud-form">
            <input
              className="crud-input wide-input"
              placeholder="Add design/admin note"
              value={form.noteText ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, noteText: event.target.value }))}
            />
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (!form.noteText) return
                addNote({ text: form.noteText })
                setForm((prev) => ({ ...prev, noteText: '' }))
              }}
            >
              Save Note
            </button>
          </div>
          <div className="table-list">
            {notes.map((note) => (
              <div key={note.id} className="table-row">
                <span>{note.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="modal-stack">
        <div className="crud-form">
          <input
            className="crud-input"
            placeholder="Support topic"
            value={form.ticketTopic ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, ticketTopic: event.target.value }))}
          />
          <input
            className="crud-input wide-input"
            placeholder="Issue details"
            value={form.ticketMessage ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, ticketMessage: event.target.value }))}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!form.ticketTopic || !form.ticketMessage) return
              addSupportTicket({ topic: form.ticketTopic, message: form.ticketMessage })
              setForm((prev) => ({ ...prev, ticketTopic: '', ticketMessage: '' }))
            }}
          >
            Submit
          </button>
        </div>
        <div className="table-list">
          {supportTickets.length === 0 ? (
            <div className="table-row">
              <span>No support tickets yet.</span>
            </div>
          ) : (
            supportTickets.map((ticket) => (
              <div key={ticket.id} className="table-row">
                <span>{ticket.topic}</span>
                <span>{ticket.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }, [
    activeModal,
    addCalendarEvent,
    addMessage,
    addNote,
    addSupportTicket,
    addTask,
    calendarEvents,
    files,
    form,
    messages,
    notes,
    supportTickets,
    tasks,
  ])

  const quickActionBody = useMemo(() => {
    if (!quickAction) return null

    if (quickAction === 'Create New User') {
      return (
        <div className="crud-form">
          <input
            className="crud-input"
            placeholder="User name"
            value={form.quickUserName ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, quickUserName: event.target.value }))}
          />
          <input
            className="crud-input"
            placeholder="User email"
            value={form.quickUserEmail ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, quickUserEmail: event.target.value }))}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!form.quickUserName || !form.quickUserEmail) return
              addUser({ name: form.quickUserName, email: form.quickUserEmail })
              setForm((prev) => ({ ...prev, quickUserName: '', quickUserEmail: '' }))
              setQuickAction('')
            }}
          >
            Create User
          </button>
        </div>
      )
    }

    if (quickAction === 'Generate Report') {
      return (
        <div className="crud-form">
          <input
            className="crud-input"
            placeholder="Report name"
            value={form.reportName ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, reportName: event.target.value }))}
          />
          <select
            className="crud-input"
            value={form.reportFormat ?? 'PDF'}
            onChange={(event) => setForm((prev) => ({ ...prev, reportFormat: event.target.value }))}
          >
            <option>PDF</option>
            <option>CSV</option>
            <option>Excel</option>
          </select>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!form.reportName) return
              addGeneratedReport({ name: form.reportName, format: form.reportFormat ?? 'PDF' })
              setForm((prev) => ({ ...prev, reportName: '', reportFormat: 'PDF' }))
              setQuickAction('')
            }}
          >
            Generate
          </button>
        </div>
      )
    }

    return (
      <div className="modal-stack">
        <div className="crud-form">
          <input
            className="crud-input"
            placeholder="Service"
            value={form.service ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, service: event.target.value }))}
          />
          <input
            className="crud-input"
            type="datetime-local"
            value={form.startAt ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, startAt: event.target.value }))}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!form.service || !form.startAt) return
              addMaintenance({ service: form.service, startAt: form.startAt })
              setForm((prev) => ({ ...prev, service: '', startAt: '' }))
            }}
          >
            Schedule
          </button>
        </div>
        <div className="table-list">
          {maintenance.map((item) => (
            <div key={item.id} className="table-row">
              <span>{item.service}</span>
              <span>{item.startAt}</span>
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }, [quickAction, form, addGeneratedReport, addMaintenance, addUser, maintenance])

  return (
    <div className="app-shell">
      <div className="bg-glow bg-glow-left" />
      <div className="bg-glow bg-glow-right" />

      <aside className="sidebar glass">
        <div>
          <div className="brand">ADMIN PANEL</div>
          <nav className="nav-list">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="profile-box">
          <div className="avatar">D</div>
          <div>
            <p className="name">Devoryn</p>
            <p className="role">Super Admin</p>
          </div>
        </div>
      </aside>

      <main className="main-content glass">
        <header className="topbar">
          <p className="date">October 26, 2024 | 10:30 AM</p>
          <input className="search" placeholder="Search..." />
        </header>
        <Outlet />
      </main>

      <aside className="right-panel glass">
        <h3>App</h3>
        <div className="app-buttons">
          {appPanelItems.map((item) => (
            <button key={item} type="button" className="mini-btn" onClick={() => setActiveModal(item)}>
              {item}
            </button>
          ))}
        </div>

        <h3>Quick Actions</h3>
        <div className="app-buttons">
          <button type="button" className="mini-btn" onClick={() => setQuickAction('Create New User')}>
            Create New User
          </button>
          <button type="button" className="mini-btn" onClick={() => setQuickAction('Generate Report')}>
            Generate Report
          </button>
          <button type="button" className="mini-btn" onClick={() => setQuickAction('Schedule Maintenance')}>
            Schedule Maintenance
          </button>
        </div>
      </aside>

      {activeModal && <ModalWindow title={activeModal} body={modalContent} onClose={() => setActiveModal('')} />}
      {quickAction && <ModalWindow title={quickAction} body={quickActionBody} onClose={() => setQuickAction('')} />}
    </div>
  )
}
