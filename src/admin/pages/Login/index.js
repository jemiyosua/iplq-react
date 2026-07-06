import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import './Login.css';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../utils';
import { generateSignature, fetchStatus } from '../../utils/functions';
import md5 from 'md5';
import SweetAlert from 'react-bootstrap-sweetalert';
import { setForm } from '../../redux';
import { IconLogoIPLQ } from '../../assets';

const Login = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, setCookie, removeCookie] = useCookies(['user']);

	const [Username, setUsername] = useState('');
	const [Password, setPassword] = useState('');
	const [ShowPassword, setShowPassword] = useState(false);
	const [Loading, setLoading] = useState(false);

	const [ShowAlert, setShowAlert] = useState(false);
	const [ErrorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		window.scrollTo(0, 0);
		var CookieParamKey = getCookie('paramkey');
		var CookieUsername = getCookie('username');

		if (CookieParamKey && CookieUsername) {
			history.push('/admin/dashboard');
		}
	}, []);

	const logout = () => {
		removeCookie('varCookie', { path: '/' });
		removeCookie('varMerchantId', { path: '/' });
		removeCookie('varIdVoucher', { path: '/' });
		dispatch(setForm('ParamKey', ''));
		dispatch(setForm('Username', ''));
		dispatch(setForm('Role', ''));
		if (window) { sessionStorage.clear(); }
	};

	const getCookie = (tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== '' && SecretCookie != null && typeof SecretCookie === 'string') {
			var LongSecretCookie = SecretCookie.split('|');
			var username = LongSecretCookie[0];
			var paramKey = LongSecretCookie[1];

			if (tipe === 'username') return username;
			if (tipe === 'paramkey') return paramKey;
			return null;
		}
		return null;
	};

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

		var url = paths.URL_API_ADMIN + 'Login';
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
						data.username + '|' + data.paramkey + '|' + data.access + '|' + data.access_name + '|' + data.cluster + '|' + data.cluster_id + '|' + data.sheet_id + '|' + data.sheet_name,
						{ path: '/', expires: new Date(date) }
					);
					window.location.href = '/admin/dashboard';
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
		<div className="login-page">
			{ErrorMessage !== '' && (
				<SweetAlert
					danger
					show={ShowAlert}
					onConfirm={() => { setShowAlert(false); setErrorMessage(''); }}
					btnSize="sm"
				>
					{ErrorMessage}
				</SweetAlert>
			)}

			<div className="login-card">
				<div className="login-logo-section">
					<img src={IconLogoIPLQ} alt="IPL-Q Logo" className="login-logo" />
					<h1 className="login-app-name">IPL-Q Admin</h1>
					<p className="login-tagline">Platform Administrasi Cluster</p>
				</div>

				<form className="login-form" onSubmit={handleLogin}>
					<div className="login-field">
						<label htmlFor="username">Username</label>
						<input
							id="username"
							type="text"
							value={Username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Masukkan username"
							autoComplete="username"
						/>
					</div>

					<div className="login-field">
						<label htmlFor="password">Password</label>
						<div className="login-password-wrap">
							<input
								id="password"
								type={ShowPassword ? 'text' : 'password'}
								value={Password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Masukkan password"
								autoComplete="current-password"
							/>
							<button
								type="button"
								className="login-eye-btn"
								onClick={() => setShowPassword(!ShowPassword)}
								aria-label={ShowPassword ? 'Sembunyikan password' : 'Tampilkan password'}
							>
								{ShowPassword ? '🙈' : '👁'}
							</button>
						</div>
					</div>

					<button type="submit" className="login-submit" disabled={Loading}>
						{Loading ? 'Memverifikasi...' : 'Masuk'}
					</button>
				</form>

				<p className="login-footer">
					© {new Date().getFullYear()} IPL-Q. All rights reserved.
				</p>
			</div>
		</div>
	);
};

export default Login;
