import { useAdminData } from '../context/AdminDataContext'

export default function AnalyticsPage() {
  const { analytics, generatedReports } = useAdminData()

  return (
    <>
      <h1>Analytics & Reports</h1>
      <section className="content-grid">
        <article className="card glass">
          <div className="card-head">
            <h3>Top locations</h3>
          </div>
          <ul className="health-list">
            {analytics.topLocations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card glass">
          <div className="card-head">
            <h3>Most active users</h3>
          </div>
          <ul className="health-list">
            {analytics.activeUsers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card glass">
          <div className="card-head">
            <h3>Property demand trends</h3>
          </div>
          <ul className="health-list">
            {analytics.demandTrends.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card glass">
          <div className="card-head">
            <h3>Roommate matching success rate</h3>
          </div>
          <h2>{analytics.matchRate}</h2>
          <p className="trend">Can be exported to PDF/Excel in next phase</p>
        </article>
      </section>

      <section className="card glass users-card">
        <div className="card-head">
          <h3>Generated reports</h3>
          <span>{generatedReports.length} created from quick actions</span>
        </div>
        <div className="table-list">
          {generatedReports.length === 0 ? (
            <div className="table-row">
              <span>No generated reports yet.</span>
            </div>
          ) : (
            generatedReports.map((report) => (
              <div key={report.id} className="table-row">
                <span>{report.name}</span>
                <span>{report.format}</span>
                <span>{new Date(report.date).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}
