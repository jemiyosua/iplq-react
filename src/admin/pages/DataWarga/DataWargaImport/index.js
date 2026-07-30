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
	FaCode,
	FaHome,
	FaRedoAlt,
	FaSave,
	FaTable,
	FaUpload,
	FaUsers,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import LoadingLogo from '../../../components/molecules/LoadingLogo';

const DataWargaImport = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListDataSheet, setListDataSheet] = useState([]);
	const [LoadingPreview, setLoadingPreview] = useState(false);
	const [LoadingInsert, setLoadingInsert] = useState(false);

	const [ViewMode, setViewMode] = useState('json');
	const [FileName, setFileName] = useState('');

	const [ShowAlert, setShowAlert] = useState(false);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const getCookie = useCallback((tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== '' && SecretCookie != null && typeof SecretCookie === 'string') {
			var LongSecretCookie = SecretCookie.split('|');
			if (tipe === 'username') return LongSecretCookie[0];
			if (tipe === 'paramkey') return LongSecretCookie[1];
			if (tipe === 'access') return parseInt(LongSecretCookie[2]);
			if (tipe === 'access_name') return LongSecretCookie[3];
			if (tipe === 'cluster') return LongSecretCookie[4];
			if (tipe === 'cluster_id') return LongSecretCookie[5];
			if (tipe === 'sheet_id') return LongSecretCookie[6];
			if (tipe === 'sheet_name') return LongSecretCookie[7];
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
				setFileName('Google Sheets');
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

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setFileName(file.name);
		const reader = new FileReader();

		reader.onload = (evt) => {
			const binaryData = new Uint8Array(evt.target.result);
			const workbook = XLSX.read(binaryData, { type: 'array' });
			const firstSheet = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheet];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);
			setListDataSheet(jsonData);
		};

		reader.readAsArrayBuffer(file);
	};

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
					setFileName('');
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

	const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

	const summaryCards = [
		{ title: 'Total Data Import', value: formatNumber(ListDataSheet.length), description: 'Data siap disimpan', icon: <FaUsers />, tone: 'blue' },
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
							style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#2563eb', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 8 }}
						>
							<FaArrowLeft /> Kembali ke Data Warga
						</button>
						<div className="admin-eyebrow">Import Data</div>
						<h1>Import Data Warga</h1>
						<p>Upload file Excel/CSV atau ambil dari Google Sheets, preview sebagai JSON lalu simpan.</p>
					</div>
					<div style={{ display: 'flex', gap: 10 }}>
						<label className="admin-btn-primary" style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
							<FaUpload /> Upload File
							<input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileUpload} />
						</label>
						<button className="admin-btn-secondary" onClick={getSheetData} disabled={LoadingPreview}>
							<FaRedoAlt /> Refresh Sheets
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
							<p>Total data: {formatNumber(ListDataSheet.length)} {FileName && <span style={{ color: '#6b7280' }}>— {FileName}</span>}</p>
						</div>
						<div style={{ display: 'flex', gap: 6 }}>
							<button
								className={`btn btn-sm ${ViewMode === 'json' ? 'btn-primary' : 'btn-outline-secondary'}`}
								onClick={() => setViewMode('json')}
							>
								<FaCode /> JSON
							</button>
							<button
								className={`btn btn-sm ${ViewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
								onClick={() => setViewMode('table')}
							>
								<FaTable /> Tabel
							</button>
						</div>
					</div>

					{/* JSON View */}
					{ViewMode === 'json' && (
						<div style={{ padding: '0 16px 16px' }}>
							<pre style={{
								background: '#1e293b',
								color: '#e2e8f0',
								padding: 16,
								borderRadius: 8,
								fontSize: 12,
								maxHeight: 500,
								overflow: 'auto',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-all',
							}}>
								{ListDataSheet.length > 0
									? JSON.stringify(ListDataSheet, null, 2)
									: '// Belum ada data. Upload file atau klik Refresh Sheets.'}
							</pre>
						</div>
					)}

					{/* Table View */}
					{ViewMode === 'table' && (
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
													<strong>Belum ada data</strong>
													<span>Upload file Excel/CSV atau klik Refresh Sheets untuk mengambil data.</span>
												</div>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default DataWargaImport;
