import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import '../../../../styles/admin-shared.css';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils';
import { generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
	FaArrowLeft,
	FaHome,
	FaRedoAlt,
	FaSave,
	FaUsers,
} from 'react-icons/fa';
import LoadingLogo from '../../../components/molecules/LoadingLogo';

const DataWargaImport = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListDataSheet, setListDataSheet] = useState([]);
	const [LoadingPreview, setLoadingPreview] = useState(false);
	const [LoadingInsert, setLoadingInsert] = useState(false);

	const [ShowAlert, setShowAlert] = useState(false);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const getCookie = useCallback((tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== '' && SecretCookie != null && typeof SecretCookie === 'string') {
			var LongSecretCookie = SecretCookie.split('|');
			var username = LongSecretCookie[0];
			var paramKey = LongSecretCookie[1];
			var accessLogin = parseInt(LongSecretCookie[2]);
			var accessName = LongSecretCookie[3];
			var cluster = LongSecretCookie[4];
			var clusterId = LongSecretCookie[5];
			var sheetId = LongSecretCookie[6];
			var sheetName = LongSecretCookie[7];

			if (tipe === 'username') return username;
			if (tipe === 'paramkey') return paramKey;
			if (tipe === 'access') return accessLogin;
			if (tipe === 'access_name') return accessName;
			if (tipe === 'cluster') return cluster;
			if (tipe === 'cluster_id') return clusterId;
			if (tipe === 'sheet_id') return sheetId;
			if (tipe === 'sheet_name') return sheetName;
			return null;
		}
		return null;
	}, [cookies.varCookie]);

	const logout = useCallback(() => {
		removeCookie('varCookie', { path: '/' });
		removeCookie('varMerchantId', { path: '/' });
		removeCookie('varIdVoucher', { path: '/' });
		dispatch(setForm('ParamKey', ''));
		dispatch(setForm('Username', ''));
		dispatch(setForm('Name', ''));
		dispatch(setForm('Role', ''));
		if (window) { sessionStorage.clear(); }
	}, [dispatch, removeCookie]);

	const getSheetData = useCallback(async () => {
		const sheetId = getCookie('sheet_id');
		const sheetName = getCookie('sheet_name');

		if (!sheetId || !sheetName) {
			setErrorMessageAlert('Sheet ID atau Sheet Name tidak ditemukan.');
			setShowAlert(true);
			return;
		}

		setLoadingPreview(true);

		try {
			const urlSheet = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
			const responseSheet = await fetch(urlSheet);
			const dataSheet = await responseSheet.json();

			var cookieUsername = getCookie('username');
			var cookieParamKey = getCookie('paramkey');

			var requestBody = JSON.stringify({
				username: cookieUsername,
				paramkey: cookieParamKey,
				method: 'PREVIEW',
				list_data_warga: dataSheet,
			});

			var url = paths.URL_API_ADMIN + 'DataWarga';
			var Signature = generateSignature(requestBody);

			const response = await fetch(url, {
				method: 'POST',
				body: requestBody,
				headers: { 'Content-Type': 'application/json', Signature: Signature },
			});

			const data = await response.json();
			setLoadingPreview(false);

			if (data.error_code === '0' || data.error_code === 0) {
				setListDataSheet(data.result || []);
			} else {
				if (data.error_code === '2' || data.error_code === 2) {
					setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
					setShowAlert(true);
				} else {
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
				}
			}
		} catch (error) {
			setLoadingPreview(false);
			setErrorMessageAlert(AlertMessage.failedConnect);
			setShowAlert(true);
		}
	}, [getCookie]);

	const handleInsertDataWarga = useCallback(() => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'INSERT',
			list_data_warga: ListDataSheet,
		});

		setLoadingInsert(true);

		var url = paths.URL_API_ADMIN + 'DataWarga';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingInsert(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListDataSheet([]);
					setSuccessMessage('Data warga berhasil disimpan');
					setShowAlert(true);
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
						setShowAlert(true);
					} else {
						setErrorMessageAlert(data.error_message);
						setShowAlert(true);
					}
				}
			})
			.catch((error) => {
				setLoadingInsert(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [getCookie, ListDataSheet]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');

		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'DATA_WARGA'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getSheetData();
	}, [getSheetData]);

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const summaryCards = [
		{ title: 'Total Data Import', value: formatNumber(ListDataSheet.length), description: 'Data dari Google Sheets', icon: <FaUsers />, tone: 'blue' },
		{ title: 'Cluster', value: getCookie('cluster') || '-', description: 'Cluster aktif', icon: <FaHome />, tone: 'green' },
	];

	return (
		<>
			{(LoadingPreview || LoadingInsert) && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">
						{SessionMessage}
					</SweetAlert>
				)}
				{SuccessMessage !== '' && (
					<SweetAlert success show={ShowAlert} onConfirm={() => { setShowAlert(false); setSuccessMessage(''); history.replace('/admin/data-warga'); }} btnSize="sm">
						{SuccessMessage}
					</SweetAlert>
				)}
				{ErrorMessageAlert !== '' && (
					<SweetAlert danger show={ShowAlert} onConfirm={() => { setShowAlert(false); setErrorMessageAlert(''); }} btnSize="sm">
						{ErrorMessageAlert}
					</SweetAlert>
				)}
				{ErrorMessageAlertLogout !== '' && (
					<SweetAlert danger show={ShowAlert} onConfirm={() => { setShowAlert(false); setErrorMessageAlertLogout(''); history.push('/admin/login'); }} btnSize="sm">
						{ErrorMessageAlertLogout}
					</SweetAlert>
				)}

				<div className="admin-header">
					<div>
						<button
							onClick={() => history.push('/admin/data-warga')}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 8,
								background: 'none',
								border: 'none',
								color: '#2563eb',
								fontSize: 14,
								fontWeight: 600,
								cursor: 'pointer',
								padding: 0,
								marginBottom: 8,
							}}
						>
							<FaArrowLeft /> Kembali ke Data Warga
						</button>
						<div className="admin-eyebrow">Import Data</div>
						<h1>Import Data Warga</h1>
						<p>Preview dan simpan data warga dari Google Sheets.</p>
					</div>
					<div style={{ display: 'flex', gap: 10 }}>
						<button className="admin-btn-secondary" onClick={getSheetData} disabled={LoadingPreview}>
							<FaRedoAlt /> Refresh Data
						</button>
						{ListDataSheet.length > 0 && (
							<button className="admin-btn-primary" onClick={handleInsertDataWarga} disabled={LoadingInsert}>
								<FaSave /> Simpan Data Warga
							</button>
						)}
					</div>
				</div>

				<div className="admin-summary-grid">
					{summaryCards.map((item) => (
						<div className={`admin-summary-card ${item.tone}`} key={item.title}>
							<div>
								<span>{item.title}</span>
								<strong>{item.value}</strong>
								<small>{item.description}</small>
							</div>
							<div className="admin-summary-icon">{item.icon}</div>
						</div>
					))}
				</div>

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Preview Data Import</h2>
							<p>Total data: {formatNumber(ListDataSheet.length)}</p>
						</div>
					</div>

					<div className="table-responsive admin-table-wrap">
						<table className="table admin-table align-middle">
							<thead>
								<tr>
									<th>Cluster</th>
									<th>Nama</th>
									<th>Nomor HP</th>
									<th>Email</th>
									<th>Tgl Lahir</th>
									<th>Role</th>
									<th>Alamat</th>
									<th>No Rumah</th>
									<th>Luas Tanah</th>
									<th>Luas Bangunan</th>
									<th>Agama</th>
									<th>Pekerjaan</th>
									<th>JK</th>
									<th>Serah Terima</th>
									<th>Ditempati</th>
								</tr>
							</thead>
							<tbody>
								{ListDataSheet?.length > 0 ? ListDataSheet.map((item, index) => (
									<tr key={index}>
										<td><strong>{item.cluster || '-'}</strong></td>
										<td>{item.nama || '-'}</td>
										<td>{item.nomor_hp || '-'}</td>
										<td>{item.email || '-'}</td>
										<td>{item.tanggal_lahir || '-'}</td>
										<td>{item.role || '-'}</td>
										<td>{item.alamat || '-'}</td>
										<td>{item.nomor_rumah || '-'}</td>
										<td>{item.luas_tanah || '-'}</td>
										<td>{item.luas_bangunan || '-'}</td>
										<td>{item.agama || '-'}</td>
										<td>{item.pekerjaan || '-'}</td>
										<td>{item.jenis_kelamin || '-'}</td>
										<td>
											{item.status_serah_terima_teks
												? <span className="admin-status-badge active">{item.status_serah_terima_teks}</span>
												: <span style={{ color: '#64748b' }}>-</span>}
										</td>
										<td>
											{item.status_ditempati_teks
												? <span className="admin-status-badge info">{item.status_ditempati_teks}</span>
												: <span style={{ color: '#64748b' }}>-</span>}
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={15}>
											<div className="admin-empty-state">
												<strong>Belum ada data terbaru</strong>
												<span>Data dari Google Sheets akan muncul di sini setelah Anda klik Refresh Data.</span>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
};

export default DataWargaImport;
