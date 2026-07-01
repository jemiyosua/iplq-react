import React from 'react';

export default function FormSelect({
	label,
	value,
	onChange,
	options = []
}) {
	return (
		<div className="form-group">
			<label>{label}</label>

			<select
				value={value}
				onChange={onChange}
			>
				<option value="">
					Pilih
				</option>

				{options.map((item, index) => (
					<option
						key={index}
						value={item.value}
					>
						{item.label}
					</option>
				))}
			</select>
		</div>
	);
}