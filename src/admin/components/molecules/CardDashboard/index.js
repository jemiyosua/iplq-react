import React from "react";

export default function CardDashboard({ title, value, bg, icon }) {
	return (
		<div className="col-md-4 mb-3">
			<div className="card shadow-sm border-0 rounded-4">
				<div className="card-body d-flex justify-content-between align-items-center">
					<div>
						<p className="text-muted mb-1">{title}</p>
						<h4 className="fw-bold">{value}</h4>
					</div>
					{/* <div className={`p-3 rounded-3 text-white ${bg}`}> */}
					<div style={{ color:'#84cc16' }}>{icon}</div>
					{/* </div> */}
				</div>
			</div>
		</div>
	);
}