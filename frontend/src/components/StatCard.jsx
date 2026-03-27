export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={`card h-100 ${color}`}>
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <p className="mb-2 text-uppercase fw-semibold" style={{ fontSize: "0.8rem", opacity: 0.85 }}>
            {title}
          </p>
          <h2 className="mb-0 fw-bold">{value}</h2>
        </div>

        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.15)",
            fontSize: "1.5rem"
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}