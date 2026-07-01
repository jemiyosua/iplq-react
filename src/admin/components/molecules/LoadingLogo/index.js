import React from 'react';
import './loading-logo.css';
import { IconLogo1 } from '../../../assets';

export default function LoadingLogo() {
	return (
		<div className="loading-overlay">
      		{/* <div className="loading-box"> */}
				<img
					src={IconLogo1}
					alt="logo"
					className="loading-logo"
				/>

				{/* <p className="loading-text">
				Loading...
				</p> */}
			{/* </div> */}
		</div>
	);
}