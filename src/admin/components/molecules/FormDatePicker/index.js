import React from 'react';

export default function FormDatePicker({
	label, value, onChange, type = "date"
}) {
	return (
		<div className="form-group">
			<label>{label}</label>

			<input
				type={type}
				value={value}
				onChange={onChange}
				style={{ color:'#111111' }}
			/>
		</div>
	);
}