import { createContext, useContext, useMemo, useState } from 'react'
import {
  analyticsSeed,
  propertiesSeed,
  reportsSeed,
  reviewsSeed,
  roommatesSeed,
  settingsSeed,
  usersSeed,
} from '../data/mockData'

const AdminDataContext = createContext(null)

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function AdminDataProvider({ children }) {
  const [users, setUsers] = useState(usersSeed)
  const [properties, setProperties] = useState(propertiesSeed)
  const [roommates, setRoommates] = useState(roommatesSeed)
  const [reports, setReports] = useState(reportsSeed)
  const [reviews, setReviews] = useState(reviewsSeed)
  const [settings, setSettings] = useState(settingsSeed)

  const [calendarEvents, setCalendarEvents] = useState([
    { id: 'evt-1', title: 'Moderation Review', date: '2026-05-02' },
  ])
  const [tasks, setTasks] = useState([
    { id: 'tsk-1', title: 'Verify pending landlords', priority: 'High' },
  ])
  const [messages, setMessages] = useState([
    { id: 'msg-1', from: 'Support Bot', text: '3 new reports need review.' },
  ])
  const [files, setFiles] = useState([
    { id: 'file-1', name: 'weekly-admin-report.pdf', size: '1.2 MB' },
  ])
  const [notes, setNotes] = useState([
    { id: 'note-1', text: 'Improve dispute workflow UX for final demo.' },
  ])
  const [supportTickets, setSupportTickets] = useState([])
  const [generatedReports, setGeneratedReports] = useState([])
  const [maintenance, setMaintenance] = useState([])

  const stats = useMemo(() => {
    const verifiedCount = users.filter((user) => user.verified).length
    return {
      users: users.length,
      properties: properties.length,
      activeListings: properties.filter((item) => item.status === 'Approved').length,
      roommatePosts: roommates.length,
      reportedIssues: reports.filter((item) => item.status !== 'Resolved').length,
      verifiedUsers: verifiedCount,
      unverifiedUsers: users.length - verifiedCount,
    }
  }, [users, properties, roommates, reports])

  const value = {
    users,
    setUsers,
    properties,
    setProperties,
    roommates,
    setRoommates,
    reports,
    setReports,
    reviews,
    setReviews,
    settings,
    setSettings,
    analytics: analyticsSeed,
    calendarEvents,
    tasks,
    messages,
    files,
    notes,
    supportTickets,
    generatedReports,
    maintenance,
    stats,
    addUser: (payload) =>
      setUsers((prev) => [
        ...prev,
        {
          id: makeId('u'),
          name: payload.name,
          email: payload.email,
          verified: false,
          status: 'Active',
          complaints: 0,
          listings: 0,
          reviews: 0,
        },
      ]),
    addGeneratedReport: (payload) =>
      setGeneratedReports((prev) => [
        ...prev,
        { id: makeId('report'), name: payload.name, format: payload.format, date: new Date().toISOString() },
      ]),
    addMaintenance: (payload) =>
      setMaintenance((prev) => [
        ...prev,
        { id: makeId('mnt'), service: payload.service, startAt: payload.startAt, status: 'Scheduled' },
      ]),
    addCalendarEvent: (payload) =>
      setCalendarEvents((prev) => [...prev, { id: makeId('evt'), title: payload.title, date: payload.date }]),
    addTask: (payload) =>
      setTasks((prev) => [...prev, { id: makeId('tsk'), title: payload.title, priority: payload.priority }]),
    addMessage: (payload) =>
      setMessages((prev) => [...prev, { id: makeId('msg'), from: payload.from, text: payload.text }]),
    addFile: (payload) =>
      setFiles((prev) => [...prev, { id: makeId('file'), name: payload.name, size: payload.size }]),
    addNote: (payload) => setNotes((prev) => [...prev, { id: makeId('note'), text: payload.text }]),
    addSupportTicket: (payload) =>
      setSupportTickets((prev) => [...prev, { id: makeId('ticket'), topic: payload.topic, message: payload.message }]),
  }

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider')
  }
  return context
}
