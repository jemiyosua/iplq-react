import React from 'react';

export default function FormTextArea({
	label, value, onChange, placeholder
}) {
	return (
		<div className="form-group">
			<label>{label}</label>

			<textarea
				value={value}
				placeholder={placeholder}
				onChange={onChange}
			/>
		</div>
	);
}