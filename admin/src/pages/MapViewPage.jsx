import { useAdminData } from '../context/AdminDataContext'

export default function MapViewPage() {
  const { properties } = useAdminData()
  const approved = properties.filter((item) => item.status === 'Approved').length
  const flagged = properties.filter((item) => item.flagged).length

  return (
    <>
      <h1>Map-Based Monitoring</h1>
      <section className="card glass">
        <p className="label">
          Live summary: {approved} approved listings mapped, {flagged} flagged locations highlighted.
        </p>
      </section>
      <section className="content-grid">
        <article className="card glass">
          <div className="card-head">
            <h3>All properties map (Leaflet placeholder)</h3>
          </div>
          <div className="map-placeholder">Map canvas for all properties</div>
        </article>

        <article className="card glass">
          <div className="card-head">
            <h3>Heatmap of popular areas</h3>
          </div>
          <div className="map-placeholder heat">Heatmap preview for demand hotspots</div>
        </article>
      </section>
    </>
  )
}
