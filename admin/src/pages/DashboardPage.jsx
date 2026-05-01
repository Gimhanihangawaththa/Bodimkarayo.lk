import { useAdminData } from '../context/AdminDataContext'

function OverviewChart({ title }) {
  return (
    <article className="card glass">
      <div className="card-head">
        <h3>{title}</h3>
      </div>
      <div className="chart-area">
        <div className="line line-a" />
        <div className="line line-b" />
      </div>
    </article>
  )
}

export default function DashboardPage() {
  const { stats } = useAdminData()
  const dashboardStats = [
    { label: 'Total Users', value: stats.users, trend: 'Live count' },
    { label: 'Total Properties', value: stats.properties, trend: 'Live count' },
    { label: 'Active Listings', value: stats.activeListings, trend: 'Approved only' },
    { label: 'Roommate Posts', value: stats.roommatePosts, trend: 'Live count' },
    { label: 'Reported Issues', value: stats.reportedIssues, trend: 'Pending + under review' },
    { label: 'Verified Users', value: stats.verifiedUsers, trend: `${stats.unverifiedUsers} unverified` },
  ]

  return (
    <>
      <h1>Platform Control Center</h1>
      <section className="stat-grid">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="card glass">
            <p className="label">{stat.label}</p>
            <h2>{stat.value}</h2>
            <p className="trend">{stat.trend}</p>
          </article>
        ))}
      </section>

      <section className="content-grid three-col">
        <OverviewChart title="New users per day" />
        <OverviewChart title="Listings growth" />
        <OverviewChart title="Most searched locations" />
      </section>

      <section className="card glass users-card">
        <div className="card-head">
          <h3>Verified vs Unverified Users</h3>
          <span>Supports management and reporting objectives</span>
        </div>
        <div className="donut-wrap">
          <div className="donut" />
          <div className="legend">
            <p>Verified: {stats.verifiedUsers}</p>
            <p>Unverified: {stats.unverifiedUsers}</p>
          </div>
        </div>
      </section>
    </>
  )
}
