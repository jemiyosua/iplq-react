import React from "react";

export default function Pagination({ currentPage, totalPage, onPageChange }) {
  	const pages = [];

	for (let i = 1; i <= totalPage; i++) {
		pages.push(i);
	}

	return (
		<div style={styles.container}>
			<button
				disabled={currentPage === 1}
				onClick={() => onPageChange(currentPage - 1)}
				style={styles.btn}
			>
				Prev
			</button>

			{pages.map((page) => (
				<button
				key={page}
				onClick={() => onPageChange(page)}
				style={{
					...styles.btn,
					...(page === currentPage ? styles.active : {})
				}}
				>
				{page}
				</button>
			))}

			<button
				disabled={currentPage === totalPage}
				onClick={() => onPageChange(currentPage + 1)}
				style={styles.btn}
			>
				Next
			</button>
		</div>
	);
}

const styles = {
	container: {
		display: "flex",
		gap: "8px",
		marginTop: "20px"
	},
	btn: {
		padding: "8px 12px",
		border: "1px solid #ddd",
		background: "#fff",
		cursor: "pointer",
		borderRadius: "8px"
	},
	active: {
		background: "#84cc16",
		color: "#02140d",
		border: "none"
	}
};