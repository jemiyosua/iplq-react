import md5 from 'md5';
import React, { useState } from 'react';
import { AlertMessage, paths } from '../../utils';
import { fetchStatus, generateSignature } from '../../utils/functions';
import { useCookies } from 'react-cookie';
import { IconLogoIPLQ } from '../assets';

const Login = ({ onLogin }) => {
	const [cookies, setCookie, removeCookie] = useCookies(['user']);
	
	const [Username, setUsername] = useState('');
	const [Password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [Loading, setLoading] = useState(false);

	const [ShowAlert, setShowAlert] = useState(false);
	const [ErrorMessage, setErrorMessage] = useState('');

	// const handleLogin = (e) => {
	// 	e.preventDefault();
	// 	if (!Username || !Password) {
	// 	setErrorMessage('Username dan password tidak boleh kosong.');
	// 	return;
	// 	}
	// 	setLoading(true);
	// 	// Simulasi login (ganti dengan API call sesungguhnya)
	// 	setTimeout(() => {
	// 	if (Username === 'marketing' && Password === '123456') {
	// 		onLogin({ Username, role: 'marketing' });
	// 	} else {
	// 		setErrorMessage('Username atau password salah.');
	// 	}
	// 	setLoading(false);
	// 	}, 800);
	// };

  	const handleLogin = (e) => {
		e.preventDefault();
		if (Loading) return;
	
		if (!Username || !Password) {
			setErrorMessage('Username dan password tidak boleh kosong.');
			setShowAlert(true);
			return;
		}
	
		var requestBody = JSON.stringify({
			Username: Username,
			Password: md5(Password),
		});
	
		var url = paths.URL_API_MARKETING + 'Login';
		var Signature = generateSignature(requestBody);
	
		setLoading(true);
	
		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: {
				'Content-Type': 'application/json',
				Signature: Signature,
			},
		})
		.then(fetchStatus)
		.then((response) => response.json())
		.then((data) => {
			setLoading(false);
	
			if (data.error_code === '0' || data.error_code === 0) {
				const date = new Date();
				date.setDate(date.getDate() + 1);
				setCookie(
				'varCookie',
				data.username + '|' + data.paramkey + '|' + data.access + '|' + data.marketing_name,
				{ path: '/', expires: new Date(date) }
				);
				onLogin({ Username, role: 'marketing' });
				// window.location.href = '/marketing/dashboard';
			} else {
				setErrorMessage(data.error_message || 'Login gagal.');
				setShowAlert(true);
			}
		})
		.catch((error) => {
			setLoading(false);
			if (error.message === 401) {
				setErrorMessage('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
			} else {
				setErrorMessage(AlertMessage.failedConnect);
			}
			setShowAlert(true);
		});
    };

	return (
		<div className="mkt-login-page">
			<div className="mkt-login-card">
				<div className="mkt-login-header">
					<img src={IconLogoIPLQ} alt="IPL-Q Logo" className="login-logo" />
					<h1 className="login-app-name">IPL-Q Marekting</h1>
					<p>Sistem Follow Up Prospek Cluster</p>
				</div>
				
				{ErrorMessage && <div className="mkt-alert">{ErrorMessage}</div>}
				<form onSubmit={handleLogin}>
					<div className="mkt-field">
						<label>Username</label>
						<input
						type="text"
						value={Username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Masukkan username"
						/>
					</div>
					<div className="mkt-field">
						<label>Password</label>
						<div className="mkt-password-wrap">
						<input
							type={showPassword ? 'text' : 'password'}
							value={Password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Masukkan password"
						/>
						<button
							type="button"
							className="mkt-eye-btn"
							onClick={() => setShowPassword(!showPassword)}
						>
							{/* {showPassword ? '🙈' : '👁'} */}
						</button>
						</div>
					</div>
					<button type="submit" className="mkt-submit-btn" disabled={Loading}>
						{Loading ? 'Memverifikasi...' : 'Masuk'}
					</button>
				</form>
				<p className="mkt-login-footer">© {new Date().getFullYear()} IPL-Q Marketing</p>
			</div>
		</div>
	);
};

export default Login;
