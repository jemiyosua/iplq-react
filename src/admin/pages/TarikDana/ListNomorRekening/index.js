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
	FaCreditCard,
	FaEdit,
	FaFileDownload,
	FaPlus,
	FaSearch,
	FaTrash,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination, ModalInputNomorRekening } from '../../../components';

const ListNomorRekening = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, setCookie, removeCookie] = useCookies(['user']);

	const [ListRekening, setListRekening] = useState([]);
	const [ListBank, setListBank] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);

	const [LoadingRekening, setLoadingRekening] = useState(false);
	const [ShowModalInput, setShowModalInput] = useState(false);

	const [GlobalSearch, setGlobalSearch] = useState('');

	// Alert state
	const [AlertState, setAlertState] = useState('');
	const [ShowAlert, setShowAlert] = useState(false);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');
	const [ConfirmMessage, setConfirmMessage] = useState('');

	// Form state
	const [IdRekening, setIdRekening] = useState('');
	const [NomorRekening, setNomorRekening] = useState('');
	const [NamaRekening, setNamaRekening] = useState('');
	const [NamaBank, setNamaBank] = useState('');
	const [IdBank, setIdBank] = useState('');

	const [MethodAPI, setMethodAPI] = useState('');

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

	const getListNomorRekening = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		let globalSearch = GlobalSearch;
		if (posisi === 'reset') {
			globalSearch = '';
		}

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			global_search: globalSearch,
			status: '',
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoadingRekening(true);

		var url = paths.URL_API_ADMIN + 'RekeningTarikDana';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingRekening(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListRekening(data.result || []);
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
				setLoadingRekening(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [CurrentPage, GlobalSearch, RowPage, getCookie]);

	const getListBank = () => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			page: 1,
			row_page: -1,
			order_by: '',
			order: '',
		});

		// setLoadingRekening(true);

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
				// setLoadingRekening(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListBank(data.result || []);
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
				// setLoadingRekening(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	};

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');
		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'NOMOR_REKENING'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListNomorRekening('');
		getListBank('');
	}, [getListNomorRekening]);

	const handleInputNomorRekening = () => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: MethodAPI,
			id: IdRekening,
			nomor_rekening: NomorRekening,
			nama_rekening: NamaRekening,
			nama_bank: NamaBank
		});

		var url = paths.URL_API_ADMIN + 'RekeningTarikDana';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				if (data.error_code === '0' || data.error_code === 0) {
					getListNomorRekening('');
					setShowModalInput(false);
					resetForm();
					setAlertState('success');
					setSuccessMessage('Data berhasil diinput');
					setShowAlert(true);
				} else {
					if (data.error_code === 2) {
						setAlertState('session');
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
				setAlertState('error');
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	};

	const handleDeleteNomorRekening = () => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'DELETE',
			id: parseInt(IdRekening),
		});

		var url = paths.URL_API_ADMIN + 'RekeningTarikDana';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				if (data.error_code === '0' || data.error_code === 0) {
					getListNomorRekening('');
					setAlertState('success');
					setSuccessMessage('Data berhasil dihapus');
					setShowAlert(true);
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setAlertState('session');
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
				setAlertState('error');
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	};

	const resetForm = () => {
		setIdRekening('');
		setNomorRekening('');
		setNamaRekening('');
		setNamaBank('');
	};

	const handleOpenInput = () => {
		setMethodAPI("INSERT")
		resetForm();
		setShowModalInput(true);
	};

	const handleOpenEdit = (item) => {
		setMethodAPI("UPDATE")
		setIdRekening(item.id);
		setIdBank(item.id_bank);
		setNomorRekening(item.nomor_rekening || '');
		setNamaRekening(item.nama_rekening || '');
		setNamaBank(item.nama_bank || '');
		setShowModalInput(true);
	};

	const handleConfirmDelete = (item) => {
		setAlertState('confirm');
		setIdRekening(item.id);
		setConfirmMessage(`Apakah Anda yakin ingin menghapus rekening ${item.nama_rekening || ''}?`);
		setShowAlert(true);
	};

	const handleFilter = () => {
		setListRekening([]);
		if (CurrentPage === 1) { getListNomorRekening(''); } else { setCurrentPage(1); }
	};

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const exportToExcel = (data, fileName = 'data') => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Nomor Rekening');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListRekening.map((item) => ({
			'Cluster': item.cluster || '-',
			'Nomor Rekening': item.nomor_rekening || '-',
			'Nama Bank': item.nama_bank || '-',
			'Nama Rekening': item.nama_rekening || '-',
			'Tanggal Input': item.tanggal_input || '-',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-nomor-rekening-${day}-${month}-${year}`);
	};

	const summaryCards = [
		{
			title: 'Jumlah Rekening',
			value: formatNumber(TotalRecords),
			description: 'Jumlah nomor rekening aktif',
			icon: <FaCreditCard />,
			tone: 'blue',
		},
	];

	return (
		<>
			{LoadingRekening && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">
						{SessionMessage}
					</SweetAlert>
				)}
				{SuccessMessage !== '' && (
					<SweetAlert success show={ShowAlert} onConfirm={() => { setShowAlert(false); setSuccessMessage(''); }} btnSize="sm">
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
				{ConfirmMessage !== '' && AlertState === 'confirm' && (
					<SweetAlert
						warning
						showCancel
						show={ShowAlert}
						confirmBtnText="Ya, Hapus"
						cancelBtnText="Batal"
						onConfirm={() => { setShowAlert(false); setConfirmMessage(''); handleDeleteNomorRekening(); }}
						onCancel={() => { setShowAlert(false); setConfirmMessage(''); }}
						btnSize="sm"
					>
						{ConfirmMessage}
					</SweetAlert>
				)}

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Manajemen Rekening</div>
						<h1>Nomor Rekening</h1>
						<p>Kelola daftar rekening untuk pencairan dana.</p>
					</div>
					<div style={{ display: 'flex', gap: 10 }}>
						{ListRekening.length < 4 && (
							<button className="admin-btn-primary" onClick={handleOpenInput}>
								<FaPlus /> Input Nomor Rekening
							</button>
						)}
						<button className="admin-btn-primary" onClick={handleExport} disabled={ListRekening.length === 0}>
							<FaFileDownload /> Export Data
						</button>
					</div>
				</div>

				<div className="admin-summary-grid cols-3">
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
							<h2>Daftar Nomor Rekening</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari cluster, nama bank, atau nama rekening"
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
							/>
						</div>
					</div>

					<div className="table-responsive admin-table-wrap">
						<table className="table admin-table align-middle">
							<thead>
								<tr>
									<th>Cluster</th>
									<th>Nama Bank</th>
									<th>Nama Rekening</th>
									<th>Tanggal Input</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListRekening?.length > 0 ? ListRekening.map((item, index) => (
									<tr key={item.id || index}>
										<td><strong>{item.cluster || '-'}</strong></td>
										<td>{item.nomor_rekening || '-'}</td>
										<td>{item.nama_bank || '-'}</td>
										<td>{item.nama_rekening || '-'}</td>
										<td>{item.tanggal_input || '-'}</td>
										<td>
											<div style={{ display: 'flex', gap: 8 }}>
												<button
													className="admin-btn-icon"
													onClick={() => handleOpenEdit(item)}
													title="Edit"
												>
													<FaEdit />
												</button>
												<button
													className="admin-btn-icon danger"
													onClick={() => handleConfirmDelete(item)}
													title="Hapus"
												>
													<FaTrash />
												</button>
											</div>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={6}>
											<div className="admin-empty-state">
												<strong>Belum ada nomor rekening</strong>
												<span>Nomor rekening penarikan dana akan muncul di sini setelah Anda melakukan input.</span>
												{ListRekening.length < 4 && (
													<button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={handleOpenInput}>
														<FaPlus /> Input Nomor Rekening
													</button>
												)}
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
							onPageChange={(page) => { if (!LoadingRekening) setCurrentPage(page); }}
						/>
					</div>
				</div>

				<ModalInputNomorRekening
					showModal={ShowModalInput}
					nomorRekening={NomorRekening}
					onChangeNomorRekening={(event) => setNomorRekening(event.target.value)}
					namaRekening={NamaRekening}
					onChangeNamaRekening={(event) => setNamaRekening(event.target.value)}
					listBank={ListBank}
					idBank={IdBank}
					namaBank={NamaBank}
					onChangeNamaBank={(event) => {
						setIdBank(event.target.value)
						setNamaBank(event.target.value)
					}}
					onClose={() => setShowModalInput(false)}
					onInsert={() => handleInputNomorRekening()}
				/>
			</div>
		</>
	);
};

export default ListNomorRekening;
