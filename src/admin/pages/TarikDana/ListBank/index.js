import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import '../../../../styles/admin-shared.css';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils';
import { generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
	FaCheckCircle,
	FaEdit,
	FaFileDownload,
	FaFilter,
	FaPlus,
	FaRedoAlt,
	FaSearch,
	FaTimesCircle,
	FaToggleOn,
	FaToggleOff,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Pagination } from '../../../components';

const ListBank = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListData, setListData] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [TotalAktif, setTotalAktif] = useState(0);
	const [TotalTidakAktif, setTotalTidakAktif] = useState(0);

	const [Loading, setLoading] = useState(false);

	const [ShowAlert, setShowAlert] = useState(false);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');
	const [ConfirmMessage, setConfirmMessage] = useState('');
	const [AlertState, setAlertState] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');

	// State untuk confirm update status
	const [SelectedItem, setSelectedItem] = useState(null);
	const [UpdateType, setUpdateType] = useState('');

	// State untuk modal input/edit bank
	const [ShowModalBank, setShowModalBank] = useState(false);
	const [ModalMode, setModalMode] = useState('insert'); // 'insert' atau 'update'
	const [IdBank, setIdBank] = useState('');
	const [NamaBank, setNamaBank] = useState('');

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
		if (window) { sessionStorage.clear(); }
	}, [dispatch, removeCookie]);

	const getListBank = useCallback((posisi = '') => {
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
			status: filterStatus,
			page: CurrentPage,
			row_page: RowPage,
			order_by: 'nama_bank',
			order: 'ASC',
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'Bank';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoading(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListData(data.result || []);
					setTotalAktif(Number(data.total_aktif) || 0);
					setTotalTidakAktif(Number(data.total_tidak_aktif) || 0);
					setTotalPage(Number(data.total_page) || 1);
					setTotalRecords(Number(data.total_record) || 0);
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
				setLoading(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [CurrentPage, FilterStatus, GlobalSearch, RowPage, getCookie]);

	const handleInputBank = useCallback(() => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'INSERT',
			nama_bank: NamaBank,
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'Bank';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoading(false);
				if (data.error_code === '0' || data.error_code === 0) {
					getListBank('');
					setShowModalBank(false);
					resetFormBank();
					setAlertState('success');
					setSuccessMessage('Bank baru berhasil ditambahkan');
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
				setLoading(false);
				setAlertState('error');
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [getCookie, NamaBank, getListBank]);

	const handleUpdateNamaBank = useCallback(() => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'UPDATE',
			id: parseInt(IdBank),
			nama_bank: NamaBank,
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'Bank';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoading(false);
				if (data.error_code === '0' || data.error_code === 0) {
					getListBank('');
					setShowModalBank(false);
					resetFormBank();
					setAlertState('success');
					setSuccessMessage('Nama bank berhasil diupdate');
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
				setLoading(false);
				setAlertState('error');
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [getCookie, IdBank, NamaBank, getListBank]);

	const handleUpdateStatusAktif = useCallback(() => {
		if (!SelectedItem) return;
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');
		const newStatus = Number(SelectedItem.status) === 1 ? "0" : "1";

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'UPDATE',
			id: parseInt(SelectedItem.id),
			status: newStatus,
		});

		setLoading(true);
		var url = paths.URL_API_ADMIN + 'Bank';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoading(false);
				if (data.error_code === '0' || data.error_code === 0) {
					getListBank('');
					setAlertState('success');
					setSuccessMessage('Status aktif berhasil diupdate');
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
				setLoading(false);
				setAlertState('error');
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [SelectedItem, getCookie, getListBank]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');
		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'LIST_BANK'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListBank('');
	}, [getListBank]);

	const resetFormBank = () => {
		setIdBank('');
		setNamaBank('');
		setModalMode('insert');
	};

	const handleOpenInputBank = () => {
		resetFormBank();
		setModalMode('insert');
		setShowModalBank(true);
	};

	const handleOpenEditBank = (item) => {
		setIdBank(item.id);
		setNamaBank(item.nama_bank || '');
		setModalMode('update');
		setShowModalBank(true);
	};

	const handleSubmitBank = () => {
		if (!NamaBank.trim()) {
			setAlertState('error');
			setErrorMessageAlert('Nama bank tidak boleh kosong');
			setShowAlert(true);
			return;
		}
		if (ModalMode === 'insert') {
			handleInputBank();
		} else {
			handleUpdateNamaBank();
		}
	};

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const statusAktifBadge = (status) => {
		if (Number(status) === 1) {
			return <span className="admin-status-badge active">Aktif</span>;
		}
		return <span className="admin-status-badge inactive">Tidak Aktif</span>;
	};

	const handleConfirmUpdateAktif = (item) => {
		setSelectedItem(item);
		setUpdateType('aktif');
		const newStatusLabel = Number(item.status) === 1 ? 'Tidak Aktif' : 'Aktif';
		setAlertState('confirm');
		setConfirmMessage(`Ubah status bank "${item.nama_bank}" menjadi "${newStatusLabel}"?`);
		setShowAlert(true);
	};

	const handleConfirmAction = () => {
		setShowAlert(false);
		setConfirmMessage('');
		if (UpdateType === 'aktif') {
			handleUpdateStatusAktif();
		}
		setSelectedItem(null);
		setUpdateType('');
	};

	const exportToExcel = (data, fileName = 'data') => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'List Bank');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListData.map((item) => ({
			'Nama Bank': item.nama_bank || '-',
			'Status Aktif': Number(item.status) === 1 ? 'Aktif' : 'Tidak Aktif',
			'Tanggal Input': item.tanggal_input || '-',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-list-bank-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListData([]);
		if (CurrentPage === 1) { getListBank(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setListData([]);
		if (CurrentPage === 1) { getListBank('reset'); } else { setCurrentPage(1); }
	};

	const summaryCards = [
		{ title: 'Bank Aktif', value: formatNumber(TotalAktif), description: 'Bank yang sedang aktif', icon: <FaCheckCircle />, tone: 'green' },
		{ title: 'Tidak Aktif', value: formatNumber(TotalTidakAktif), description: 'Bank nonaktif', icon: <FaTimesCircle />, tone: 'red' },
	];

	return (
		<>
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
				{ErrorMessageAlert !== '' && AlertState === 'error' && (
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
						onCancel={() => { setShowAlert(false); setConfirmMessage(''); setSelectedItem(null); setUpdateType(''); }}
						btnSize="sm"
					>
						{ConfirmMessage}
					</SweetAlert>
				)}

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Manajemen Tarik Dana</div>
						<h1>List Bank</h1>
						<p>Kelola daftar bank untuk pencairan dana.</p>
					</div>
					<div style={{ display: 'flex', gap: 10 }}>
						<button className="admin-btn-primary" onClick={handleOpenInputBank}>
							<FaPlus /> Input Bank Baru
						</button>
						<button className="admin-btn-primary" onClick={handleExport} disabled={ListData.length === 0}>
							<FaFileDownload /> Export Data
						</button>
					</div>
				</div>

				{/* Summary Cards */}
				{Loading ? (
					<div className="admin-summary-grid">
						{[1, 2].map((i) => (
							<div className="admin-summary-card" key={i} style={{ padding: 20 }}>
								<Skeleton width={120} height={14} style={{ marginBottom: 8 }} />
								<Skeleton width={80} height={28} style={{ marginBottom: 6 }} />
								<Skeleton width={160} height={12} />
							</div>
						))}
					</div>
				) : (
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
				)}

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Bank</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari nama bank..."
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
						<table className="table admin-table align-middle">
							<thead>
								<tr>
									<th></th>
									<th>Nama Bank</th>
									<th>Status Aktif</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{Loading ? (
									Array.from({ length: RowPage }).map((_, index) => (
										<tr key={`skeleton-${index}`}>
											<td><Skeleton width={30} height={20} /></td>
											<td><Skeleton width={180} height={18} /></td>
											<td><Skeleton width={80} height={24} borderRadius={12} /></td>
											<td><Skeleton width={30} height={20} /></td>
										</tr>
									))
								) : ListData?.length > 0 ? ListData.map((item, index) => (
									<tr key={item.id || index}>
										<td>
											<button
												className="admin-btn-icon"
												onClick={() => handleConfirmUpdateAktif(item)}
												title={Number(item.status) === 1 ? 'Set Tidak Aktif' : 'Set Aktif'}
												style={{ color: Number(item.status) === 1 ? '#16a34a' : '#9ca3af' }}
											>
												{Number(item.status) === 1 ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
											</button>
										</td>
										<td><strong>{item.nama_bank || '-'}</strong></td>
										<td>{statusAktifBadge(item.status)}</td>
										<td>
											<button
												className="admin-btn-icon"
												onClick={() => handleOpenEditBank(item)}
												title="Edit Nama Bank"
											>
												<FaEdit />
											</button>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={4}>
											<div className="admin-empty-state">
												<strong>Belum ada data bank</strong>
												<span>Daftar bank untuk tarik dana akan muncul di sini.</span>
												<button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={handleOpenInputBank}>
													<FaPlus /> Input Bank Baru
												</button>
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
							onPageChange={(page) => { if (!Loading) setCurrentPage(page); }}
						/>
					</div>
				</div>

				{/* Modal Input / Edit Bank */}
				{ShowModalBank && (
					<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title">
										{ModalMode === 'insert' ? 'Input Bank Baru' : 'Update Nama Bank'}
									</h5>
									<button type="button" className="btn-close" onClick={() => { setShowModalBank(false); resetFormBank(); }}></button>
								</div>
								<div className="modal-body">
									<div className="mb-3">
										<label className="form-label">Nama Bank <span style={{ color: 'red' }}>*</span></label>
										<input
											type="text"
											className="form-control"
											placeholder="Masukkan nama bank"
											value={NamaBank}
											onChange={(e) => setNamaBank(e.target.value)}
										/>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-primary" onClick={handleSubmitBank}>
										{ModalMode === 'insert' ? 'Simpan' : 'Update'}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default ListBank;
