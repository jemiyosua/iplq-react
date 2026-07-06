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
	FaArrowLeft,
	FaCalendarAlt,
	FaCheckCircle,
	FaFileDownload,
	FaFilter,
	FaRedoAlt,
	FaSearch,
	FaTimesCircle,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const FasilitasBooking = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListFasilitasBooking, setListFasilitasBooking] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [TotalAktif, setTotalAktif] = useState(0);
	const [TotalTidakAktif, setTotalTidakAktif] = useState(0);

	const [LoadingFasilitasBooking, setLoadingFasilitasBooking] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');

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
		removeCookie('varCookieFasilitasId', { path: '/' });
		removeCookie('varCookieDonasiId', { path: '/' });
		dispatch(setForm('ParamKey', ''));
		dispatch(setForm('Username', ''));
		dispatch(setForm('Name', ''));
		dispatch(setForm('Role', ''));
		if (window) { sessionStorage.clear(); }
	}, [dispatch, removeCookie]);

	const getListFasilitasBooking = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');
		let fasilitasId = cookies.varCookieFasilitasId;

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
			fasilitas_id: fasilitasId,
			global_search: globalSearch,
			status: filterStatus,
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoadingFasilitasBooking(true);

		var url = paths.URL_API_ADMIN + 'FasilitasBooking';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingFasilitasBooking(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListFasilitasBooking(data.result || []);
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
				setLoadingFasilitasBooking(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [CurrentPage, FilterStatus, GlobalSearch, RowPage, getCookie, cookies.varCookieFasilitasId]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');

		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			if (!cookies.varCookieFasilitasId) {
				history.push('/admin/fasilitas');
			} else {
				dispatch(setForm('ParamKey', cookieParamKey));
				dispatch(setForm('Username', cookieUsername));
				dispatch(setForm('PageActive', 'FASILITAS'));
			}
		}
	}, [dispatch, getCookie, history, cookies.varCookieFasilitasId]);

	useEffect(() => {
		if (cookies.varCookieFasilitasId) {
			getListFasilitasBooking('');
		}
	}, [getListFasilitasBooking]);

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const statusBadge = (status) => {
		if (Number(status) === 1) {
			return <span className="admin-status-badge active">Aktif</span>;
		}
		return <span className="admin-status-badge inactive">Tidak Aktif</span>;
	};

	const exportToExcel = (data, fileName = 'data') => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Booking Fasilitas');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListFasilitasBooking.map((item) => ({
			'Booking ID': item.booking_id || '-',
			'Cluster': item.cluster || '-',
			'Nama Pemesan': item.nama || '-',
			'Nama Fasilitas': item.nama_fasilitas || '-',
			'Jam Mulai': item.jam_mulai_booking || '-',
			'Jumlah Orang': item.jumlah_orang || 0,
			'Status': Number(item.status) === 1 ? 'Aktif' : 'Tidak Aktif',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-booking-fasilitas-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListFasilitasBooking([]);
		if (CurrentPage === 1) { getListFasilitasBooking(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setListFasilitasBooking([]);
		if (CurrentPage === 1) { getListFasilitasBooking('reset'); } else { setCurrentPage(1); }
	};

	const summaryCards = [
		{ title: 'Booking Aktif', value: formatNumber(TotalAktif), description: 'Booking yang sedang aktif', icon: <FaCheckCircle />, tone: 'green' },
		{ title: 'Booking Tidak Aktif', value: formatNumber(TotalTidakAktif), description: 'Booking nonaktif', icon: <FaTimesCircle />, tone: 'red' },
	];

	return (
		<>
			{LoadingFasilitasBooking && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">
						{SessionMessage}
					</SweetAlert>
				)}
				{SuccessMessage !== '' && (
					<SweetAlert success show={ShowAlert} onConfirm={() => { setShowAlert(false); setSuccessMessage(''); history.replace('/admin/fasilitas'); }} btnSize="sm">
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
							onClick={() => history.push('/admin/fasilitas')}
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
							<FaArrowLeft /> Kembali ke Daftar Fasilitas
						</button>
						<div className="admin-eyebrow">Booking Fasilitas</div>
						<h1>Booking Fasilitas</h1>
						<p>Pantau booking dan jadwal penggunaan fasilitas.</p>
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
							<h2><FaCalendarAlt /> Daftar Booking</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
						<button className="admin-btn-primary" onClick={handleExport} disabled={ListFasilitasBooking.length === 0}>
							<FaFileDownload /> Export Data
						</button>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari nama pemesan atau cluster"
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
							/>
						</div>

						<select value={FilterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
							<option value="">Status Booking</option>
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
									<th>Booking ID</th>
									<th>Cluster</th>
									<th>Nama Pemesan</th>
									<th>Nama Fasilitas</th>
									<th>Jam Mulai</th>
									<th>Jumlah Orang</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{ListFasilitasBooking?.length > 0 ? ListFasilitasBooking.map((item, index) => (
									<tr key={item.id || index}>
										<td><strong>{item.booking_id || '-'}</strong></td>
										<td>{item.cluster || '-'}</td>
										<td>{item.nama || '-'}</td>
										<td>{item.nama_fasilitas || '-'}</td>
										<td>{item.jam_mulai_booking || '-'}</td>
										<td>{item.jumlah_orang || '-'}</td>
										<td>{statusBadge(item.status)}</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={7}>
											<div className="admin-empty-state">
												<strong>Booking tidak ditemukan</strong>
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
							onPageChange={(page) => { if (!LoadingFasilitasBooking) setCurrentPage(page); }}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default FasilitasBooking;
