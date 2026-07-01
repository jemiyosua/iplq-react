import React from 'react';

export default function FormInput({
	label,
	value,
	onChange,
	placeholder,
	type = "text",
	disabled = false
}) {
	return (
		<div className="form-group">
			<label>{label}</label>

			<input
				type={type}
				value={value}
				disabled={disabled}
				placeholder={placeholder}
				onChange={onChange}
				style={{ color:'#111111' }}
			/>
		</div>
	);
}