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
	FaCheckCircle,
	FaEdit,
	FaFileDownload,
	FaFileImport,
	FaFilter,
	FaHome,
	FaRedoAlt,
	FaSearch,
	FaTimesCircle,
	FaToggleOn,
	FaToggleOff,
	FaUsers,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const DataWarga = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListDataWarga, setListDataWarga] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [TotalCluster, setTotalCluster] = useState(0);
	const [TotalWargaAktif, setTotalWargaAktif] = useState(0);
	const [TotalWargaTidakAktif, setTotalWargaTidakAktif] = useState(0);
	const [TotalWarga, setTotalWarga] = useState(0);

	const [LoadingDataWarga, setLoadingDataWarga] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');

	// State untuk confirm update status
	const [AlertState, setAlertState] = useState('');
	const [ConfirmMessage, setConfirmMessage] = useState('');
	const [SelectedWarga, setSelectedWarga] = useState(null);
	const [UpdateStatusType, setUpdateStatusType] = useState(''); // 'aktif', 'serah_terima', 'ditempati'

	// State untuk modal edit data warga
	const [ShowModalEdit, setShowModalEdit] = useState(false);
	const [FormEdit, setFormEdit] = useState({
		id: '',
		nama: '',
		no_hp: '',
		email: '',
		tanggal_lahir: '',
		jenis_kelamin: '',
		agama: '',
		alamat: '',
		nomor_rumah: '',
		luas_tanah: '',
		luas_bangunan: '',
	});

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

			if (tipe === 'username') return username;
			if (tipe === 'paramkey') return paramKey;
			if (tipe === 'access') return accessLogin;
			if (tipe === 'access_name') return accessName;
			if (tipe === 'cluster') return cluster;
			if (tipe === 'cluster_id') return clusterId;
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
		if (window) {
			sessionStorage.clear();
		}
	}, [dispatch, removeCookie]);

	const getListDataWarga = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		let globalSearch = GlobalSearch;
		let filterStatus = FilterStatus;
		if (posisi === 'reset') {
			globalSearch = '';
			filterStatus = '';
		}

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			global_search: globalSearch,
			status_aktif: filterStatus,
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoadingDataWarga(true);

		var url = paths.URL_API_ADMIN + 'DataWarga';
		var Signature = generateSignature(requestBody);

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
				setLoadingDataWarga(false);

				if (data.error_code === '0' || data.error_code === 0) {
					setListDataWarga(data.result || []);
					setTotalRecords(Number(data.total_record) || 0);
					setTotalPage(Number(data.total_page) || 1);
					setTotalCluster(Number(data.total_cluster) || 0);
					setTotalWargaAktif(Number(data.total_aktif) || 0);
					setTotalWargaTidakAktif(Number(data.total_tidak_aktif) || 0);
					setTotalWarga(Number(data.total_warga) || 0);
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
				setLoadingDataWarga(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
					setShowAlert(true);
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
					setShowAlert(true);
				}
			});
	}, [CurrentPage, FilterStatus, GlobalSearch, RowPage, getCookie]);

	const handleUpdateStatus = useCallback(() => {
		if (!SelectedWarga || !UpdateStatusType) return;

		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		let fieldName = '';
		let currentValue = 0;

		if (UpdateStatusType === 'aktif') {
			fieldName = 'status_aktif';
			currentValue = Number(SelectedWarga.status_aktif);
		} else if (UpdateStatusType === 'serah_terima') {
			fieldName = 'status_serah_terima';
			currentValue = Number(SelectedWarga.status_serah_terima);
		} else if (UpdateStatusType === 'ditempati') {
			fieldName = 'status_ditempati';
			currentValue = Number(SelectedWarga.status_ditempati);
		}

		const newValue = currentValue === 1 ? 0 : 1;

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'UPDATE_STATUS',
			id: parseInt(SelectedWarga.id),
			field: fieldName,
			value: newValue,
		});

		setLoadingDataWarga(true);

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
				setLoadingDataWarga(false);
				if (data.error_code === '0' || data.error_code === 0) {
					getListDataWarga('');
					setAlertState('success');
					setSuccessMessage('Status berhasil diupdate');
					setShowAlert(true);
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
						setShowAlert(true);
					} else {
						setAlertState('error');
						setErrorMessageAlert(data.error_message);
						setShowAlert(true);
					}
				}
			})
			.catch((error) => {
				setLoadingDataWarga(false);
				setAlertState('error');
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [SelectedWarga, UpdateStatusType, getCookie, getListDataWarga]);

	const handleConfirmToggle = (item, type) => {
		setSelectedWarga(item);
		setUpdateStatusType(type);

		let label = '';
		let currentVal = 0;
		if (type === 'aktif') {
			label = 'Status Aktif';
			currentVal = Number(item.status_aktif);
		} else if (type === 'serah_terima') {
			label = 'Status Serah Terima';
			currentVal = Number(item.status_serah_terima);
		} else if (type === 'ditempati') {
			label = 'Status Ditempati';
			currentVal = Number(item.status_ditempati);
		}

		const newLabel = currentVal === 1 ? 'Tidak Aktif' : 'Aktif';
		setAlertState('confirm');
		setConfirmMessage(`Ubah ${label} warga "${item.nama}" menjadi "${newLabel}"?`);
		setShowAlert(true);
	};

	const handleConfirmAction = () => {
		setShowAlert(false);
		setConfirmMessage('');
		handleUpdateStatus();
		setSelectedWarga(null);
		setUpdateStatusType('');
	};

	const handleOpenEditWarga = (item) => {
		setFormEdit({
			id: item.user_id || '',
			nama: item.nama || '',
			no_hp: item.no_hp || '',
			email: item.email || '',
			tanggal_lahir: item.tanggal_lahir || '',
			jenis_kelamin: item.jenis_kelamin || '',
			agama: item.agama || '',
			alamat: item.alamat || '',
			nomor_rumah: item.nomor_rumah || '',
			luas_tanah: item.luas_tanah || '',
			luas_bangunan: item.luas_bangunan || '',
		});
		setShowModalEdit(true);
	};

	const handleChangeFormEdit = (field, value) => {
		setFormEdit((prev) => ({ ...prev, [field]: value }));
	};

	const handleUpdateDataWarga = useCallback(() => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'UPDATE',
			user_id: parseInt(FormEdit.id),
			nama: FormEdit.nama,
			no_hp: FormEdit.no_hp,
			email: FormEdit.email,
			tanggal_lahir: FormEdit.tanggal_lahir,
			jenis_kelamin: FormEdit.jenis_kelamin,
			agama: FormEdit.agama,
			alamat: FormEdit.alamat,
			nomor_rumah: FormEdit.nomor_rumah,
			luas_tanah: FormEdit.luas_tanah,
			luas_bangunan: FormEdit.luas_bangunan,
		});

		setLoadingDataWarga(true);

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
				setLoadingDataWarga(false);
				setShowModalEdit(false);

				if (data.error_code === '0' || data.error_code === 0) {
					getListDataWarga('');
					setAlertState('success');
					setSuccessMessage('Data warga berhasil diupdate');
					setShowAlert(true);
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
						setShowAlert(true);
					} else {
						setAlertState('error');
						setErrorMessageAlert(data.error_message);
						setShowAlert(true);
					}
				}
			})
			.catch((error) => {
				setLoadingDataWarga(false);
				setAlertState('error');
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [FormEdit, getCookie, getListDataWarga]);

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
		getListDataWarga('');
	}, [getListDataWarga]);

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const exportToExcel = (data, fileName = 'data') => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Warga');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListDataWarga.map((item) => ({
			Cluster: item.cluster || '-',
			Nama: item.nama || '-',
			'Nomor HP': item.no_hp || '-',
			Email: item.email || '-',
			'Tanggal Lahir': item.tanggal_lahir || '-',
			'Jenis Kelamin': item.jenis_kelamin || '-',
			Agama: item.agama || '-',
			Role: item.role || '-',
			Alamat: item.alamat || '-',
			'Nomor Rumah': item.nomor_rumah || '-',
			'Luas Tanah': item.luas_tanah || '-',
			'Luas Bangunan': item.luas_bangunan || '-',
			Status: Number(item.status_aktif) === 1 ? 'Aktif' : 'Tidak Aktif',
		}));

		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-data-warga-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListDataWarga([]);
		if (CurrentPage === 1) {
			getListDataWarga('');
		} else {
			setCurrentPage(1);
		}
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setListDataWarga([]);
		if (CurrentPage === 1) {
			getListDataWarga('reset');
		} else {
			setCurrentPage(1);
		}
	};

	const statusBadge = (status) => {
		if (Number(status) === 1) {
			return <span className="admin-status-badge active">Aktif</span>;
		}
		return <span className="admin-status-badge inactive">Tidak Aktif</span>;
	};

	const summaryCards = [
		...(getCookie('username') === 'superadmin'
			? [{ title: 'Total Cluster', value: TotalCluster, description: 'Jumlah cluster', icon: <FaHome />, tone: 'purple' }]
			: []),
		{ title: 'Total Warga', value: TotalWarga, description: 'Seluruh data warga', icon: <FaUsers />, tone: 'blue' },
		{ title: 'Warga Aktif', value: TotalWargaAktif, description: 'Data pada halaman ini', icon: <FaCheckCircle />, tone: 'green' },
		{ title: 'Warga Tidak Aktif', value: TotalWargaTidakAktif, description: 'Data pada halaman ini', icon: <FaTimesCircle />, tone: 'red' },
	];

	return (
		<>
			{LoadingDataWarga && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">
						{SessionMessage}
					</SweetAlert>
				)}
				{SuccessMessage !== '' && AlertState === 'success' && (
					<SweetAlert success show={ShowAlert} onConfirm={() => { setShowAlert(false); setSuccessMessage(''); setAlertState(''); }} btnSize="sm">
						{SuccessMessage}
					</SweetAlert>
				)}
				{ErrorMessageAlert !== '' && (AlertState === 'error' || AlertState === '') && (
					<SweetAlert danger show={ShowAlert} onConfirm={() => { setShowAlert(false); setErrorMessageAlert(''); setAlertState(''); }} btnSize="sm">
						{ErrorMessageAlert}
					</SweetAlert>
				)}
				{ErrorMessageAlertLogout !== '' && (
					<SweetAlert danger show={ShowAlert} onConfirm={() => { setShowAlert(false); setErrorMessageAlertLogout(''); history.push('/admin/login'); }} btnSize="sm">
						{ErrorMessageAlertLogout}
					</SweetAlert>
				)}
				{ConfirmMessage !== '' && AlertState === 'confirm' && (
					<SweetAlert
						warning
						showCancel
						show={ShowAlert}
						confirmBtnText="Ya, Ubah"
						cancelBtnText="Batal"
						onConfirm={handleConfirmAction}
						onCancel={() => { setShowAlert(false); setConfirmMessage(''); setSelectedWarga(null); setUpdateStatusType(''); }}
						btnSize="sm"
					>
						{ConfirmMessage}
					</SweetAlert>
				)}

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Manajemen Warga</div>
						<h1>Data Warga</h1>
						<p>Kelola dan pantau seluruh data warga perumahan.</p>
					</div>
					<div className="admin-header-actions">
						{getCookie('access') !== 1 && (
							<button className="admin-btn-secondary" onClick={() => history.push('/admin/data-warga-import')}>
								<FaFileImport /> Import Sheets
							</button>
						)}
						<button className="admin-btn-primary" onClick={handleExport} disabled={ListDataWarga.length === 0}>
							<FaFileDownload /> Export Data
						</button>
					</div>
				</div>

				<div className={`admin-summary-grid ${getCookie('username') === 'superadmin' ? '' : 'cols-3'}`}>
					{summaryCards.map((item) => (
						<div className={`admin-summary-card ${item.tone}`} key={item.title}>
							<div>
								<span>{item.title}</span>
								<strong>{formatNumber(item.value)}</strong>
								<small>{item.description}</small>
							</div>
							<div className="admin-summary-icon">{item.icon}</div>
						</div>
					))}
				</div>

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Data Warga</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari cluster, nama warga, atau nomor rumah"
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
							/>
						</div>

						<select value={FilterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
							<option value="">Semua Status</option>
							<option value="1">Aktif</option>
							<option value="0">Tidak Aktif</option>
						</select>

						<button className="admin-btn-filter" onClick={handleFilter}>
							<FaFilter /> Filter
						</button>

						<button className="admin-btn-secondary" onClick={handleReset}>
							<FaRedoAlt /> Reset
						</button>
					</div>

					<div className="table-responsive admin-table-wrap">
						<table className="table admin-table align-top">
							<thead>
								<tr>
									<th>Cluster</th>
									<th>Detail Warga</th>
									<th>Detail Rumah</th>
									<th style={{ textAlign: 'center' }}>Status</th>
									<th style={{ textAlign: 'center' }}>Serah Terima</th>
									<th style={{ textAlign: 'center' }}>Ditempati</th>
									<th style={{ textAlign: 'center' }}>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListDataWarga?.length > 0 ? ListDataWarga.map((item, index) => (
									<tr key={item.id || index}>
										<td>
											<strong>{item.cluster || '-'}</strong>
										</td>
										<td>
											<strong>{item.nama || '-'}</strong>
											<span>HP: {item.no_hp || '-'}</span>
											<span>Email: {item.email || '-'}</span>
											<span>Tgl Lahir: {item.tanggal_lahir || '-'}</span>
											<span>JK: {item.jenis_kelamin || '-'}</span>
											<span>Agama: {item.agama || '-'}</span>
											<span>Role: {item.role || '-'}</span>
										</td>
										<td>
											<strong>No. {item.nomor_rumah || '-'}</strong>
											<span>Alamat: {item.alamat || '-'}</span>
											<span>Luas Tanah: {item.luas_tanah || '-'} m²</span>
											<span>Luas Bangunan: {item.luas_bangunan || '-'} m²</span>
										</td>
										<td style={{ textAlign: 'center' }}>
											<button
												className="admin-btn-icon"
												onClick={() => handleConfirmToggle(item, 'aktif')}
												title={Number(item.status_aktif) === 1 ? 'Set Tidak Aktif' : 'Set Aktif'}
												style={{ color: Number(item.status_aktif) === 1 ? '#16a34a' : '#9ca3af' }}
											>
												{Number(item.status_aktif) === 1 ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
											</button>
										</td>
										<td style={{ textAlign: 'center' }}>
											<button
												className="admin-btn-icon"
												onClick={() => handleConfirmToggle(item, 'serah_terima')}
												title={Number(item.status_serah_terima) === 1 ? 'Set Belum Serah Terima' : 'Set Sudah Serah Terima'}
												style={{ color: Number(item.status_serah_terima) === 1 ? '#2563eb' : '#9ca3af' }}
											>
												{Number(item.status_serah_terima) === 1 ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
											</button>
										</td>
										<td style={{ textAlign: 'center' }}>
											<button
												className="admin-btn-icon"
												onClick={() => handleConfirmToggle(item, 'ditempati')}
												title={Number(item.status_ditempati) === 1 ? 'Set Belum Ditempati' : 'Set Sudah Ditempati'}
												style={{ color: Number(item.status_ditempati) === 1 ? '#9333ea' : '#9ca3af' }}
											>
												{Number(item.status_ditempati) === 1 ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
											</button>
										</td>
										<td style={{ textAlign: 'center' }}>
											<button
												className="admin-btn-icon"
												onClick={() => handleOpenEditWarga(item)}
												title="Edit Data Warga"
											>
												<FaEdit />
											</button>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={7}>
											<div className="admin-empty-state">
												<strong>Data warga tidak ditemukan</strong>
												<span>Coba ubah filter atau kata pencarian.</span>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					<div className="admin-footer">
						<div>Total Data : {formatNumber(TotalRecords)}</div>
						<Pagination
							currentPage={CurrentPage}
							totalPage={Math.max(Number(TotalPage) || 1, 1)}
							onPageChange={(page) => {
								if (!LoadingDataWarga) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>

				{/* Modal Edit Data Warga */}
				{ShowModalEdit && (
					<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
						<div className="modal-dialog modal-dialog-centered modal-lg">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" style={{ fontWeight: 700 }}>Update Data Warga</h5>
									<button type="button" className="btn-close" onClick={() => setShowModalEdit(false)}></button>
								</div>
								<div className="modal-body">
									<div className="row">
										<div className="col-md-6 mb-3">
											<label className="form-label">Nama <span style={{ color: 'red' }}>*</span></label>
											<input type="text" className="form-control" value={FormEdit.nama} onChange={(e) => handleChangeFormEdit('nama', e.target.value)} />
										</div>
										<div className="col-md-6 mb-3">
											<label className="form-label">Nomor HP</label>
											<input type="text" className="form-control" value={FormEdit.no_hp} onChange={(e) => handleChangeFormEdit('no_hp', e.target.value)} disabled />
										</div>
										<div className="col-md-6 mb-3">
											<label className="form-label">Email</label>
											<input type="email" className="form-control" value={FormEdit.email} onChange={(e) => handleChangeFormEdit('email', e.target.value)} disabled />
										</div>
										<div className="col-md-6 mb-3">
											<label className="form-label">Tanggal Lahir</label>
											<input type="date" className="form-control" value={FormEdit.tanggal_lahir} onChange={(e) => handleChangeFormEdit('tanggal_lahir', e.target.value)} />
										</div>
										<div className="col-md-6 mb-3">
											<label className="form-label">Jenis Kelamin</label>
											<select className="form-select" value={FormEdit.jenis_kelamin} onChange={(e) => handleChangeFormEdit('jenis_kelamin', e.target.value)}>
												<option value="">-- Pilih --</option>
												<option value="L">Laki-laki</option>
												<option value="P">Perempuan</option>
											</select>
										</div>
										<div className="col-md-6 mb-3">
											<label className="form-label">Agama</label>
											<select className="form-select" value={FormEdit.agama} onChange={(e) => handleChangeFormEdit('agama', e.target.value)}>
												<option value="">-- Pilih --</option>
												<option value="Islam">Islam</option>
												<option value="Kristen">Kristen</option>
												<option value="Katolik">Katolik</option>
												<option value="Hindu">Hindu</option>
												<option value="Buddha">Buddha</option>
												<option value="Konghucu">Konghucu</option>
											</select>
										</div>
										<div className="col-md-12 mb-3">
											<label className="form-label">Alamat</label>
											<textarea className="form-control" rows={2} value={FormEdit.alamat} onChange={(e) => handleChangeFormEdit('alamat', e.target.value)} />
										</div>
										<div className="col-md-4 mb-3">
											<label className="form-label">Nomor Rumah</label>
											<input type="text" className="form-control" value={FormEdit.nomor_rumah} onChange={(e) => handleChangeFormEdit('nomor_rumah', e.target.value)} disabled />
										</div>
										<div className="col-md-4 mb-3">
											<label className="form-label">Luas Tanah (m²)</label>
											<input type="text" className="form-control" value={FormEdit.luas_tanah} onChange={(e) => handleChangeFormEdit('luas_tanah', e.target.value)} disabled />
										</div>
										<div className="col-md-4 mb-3">
											<label className="form-label">Luas Bangunan (m²)</label>
											<input type="text" className="form-control" value={FormEdit.luas_bangunan} onChange={(e) => handleChangeFormEdit('luas_bangunan', e.target.value)} disabled />
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-primary" onClick={handleUpdateDataWarga} disabled={!FormEdit.nama.trim()}>Update</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default DataWarga;
