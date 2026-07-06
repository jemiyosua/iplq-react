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
	FaChartLine,
	FaCheckCircle,
	FaFileDownload,
	FaFilter,
	FaHandHoldingHeart,
	FaRedoAlt,
	FaSearch,
	FaTimesCircle,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const DonasiDetail = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, setCookie, removeCookie] = useCookies(['user']);

	const [ListDonasiDetail, setListDonasiDetail] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [TotalSettlement, setTotalSettlement] = useState(0);
	const [TotalPending, setTotalPending] = useState(0);
	const [CollectionRate, setCollectionRate] = useState(0);

	const [LoadingDonasiDetail, setLoadingDonasiDetail] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [FilterPembayaran, setFilterPembayaran] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');

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

	const getListDonasiDetail = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');
		let donasiId = cookies.varCookieDonasiId;

		let globalSearch = GlobalSearch;
		let filterStatus = FilterStatus;
		let filterPembayaran = FilterPembayaran;
		let filterBulan = FilterBulan;
		if (posisi === 'reset') {
			globalSearch = '';
			filterStatus = '';
			filterPembayaran = '';
			filterBulan = '';
		}

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			id_donasi: parseInt(donasiId),
			global_search: globalSearch,
			status_transaksi: filterStatus,
			metode_pembayaran: filterPembayaran,
			bulan_invoice: filterBulan,
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoadingDonasiDetail(true);

		var url = paths.URL_API_ADMIN + 'DonasiDetail';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingDonasiDetail(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListDonasiDetail(data.result || []);
					setTotalSettlement(Number(data.total_settlement) || 0);
					setTotalPending(Number(data.total_pending) || 0);
					setCollectionRate(Number(data.collection_rate) || 0);
					setTotalPage(Number(data.total_page) || 1);
					setTotalRecords(Number(data.total_record) || 0);
				} else {
					if (data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
						setShowAlert(true);
					} else {
						setErrorMessageAlert(data.error_message);
						setShowAlert(true);
					}
				}
			})
			.catch((error) => {
				setLoadingDonasiDetail(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [CurrentPage, FilterBulan, FilterPembayaran, FilterStatus, GlobalSearch, RowPage, getCookie, cookies.varCookieDonasiId]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');
		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			if (!cookies.varCookieDonasiId) {
				history.push('/admin/donasi');
			} else {
				dispatch(setForm('ParamKey', cookieParamKey));
				dispatch(setForm('Username', cookieUsername));
				dispatch(setForm('PageActive', 'DONASI'));
			}
		}
	}, [dispatch, getCookie, history, cookies.varCookieDonasiId]);

	useEffect(() => {
		if (cookies.varCookieDonasiId) {
			getListDonasiDetail('');
		}
	}, [getListDonasiDetail]);

	const formatRupiah = (value) => {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
	};

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const statusBadge = (status) => {
		switch (status) {
			case 'settlement':
				return <span className="admin-status-badge settlement">settlement</span>;
			case 'pending':
				return <span className="admin-status-badge pending">pending</span>;
			default:
				return <span className="admin-status-badge">{status || '-'}</span>;
		}
	};

	const exportToExcel = (data, fileName = 'data') => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'DonasiDetail');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListDonasiDetail.map((item) => ({
			'Order ID': item.order_id || '-',
			'Nominal Donasi': item.tagihan || 0,
			'Metode Pembayaran': item.metode_pembayaran || '-',
			Cluster: item.cluster || '-',
			Nama: item.nama_user || '-',
			'Tanggal Transaksi': item.tanggal_transaksi || '-',
			'Tanggal Bayar': item.tanggal_bayar || '-',
			'Status Transaksi': item.transaction_status || '-',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-data-DonasiDetail-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListDonasiDetail([]);
		if (CurrentPage === 1) { getListDonasiDetail(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setFilterPembayaran('');
		setFilterBulan('');
		setListDonasiDetail([]);
		if (CurrentPage === 1) { getListDonasiDetail('reset'); } else { setCurrentPage(1); }
	};

	const handleBack = () => {
		removeCookie('varCookieDonasiId', { path: '/' });
		history.push('/admin/donasi');
	};

	const summaryCards = [
		{ title: 'Total Donasi Terkumpul', value: formatRupiah(TotalSettlement), description: 'Saldo Dana Masuk', icon: <FaHandHoldingHeart />, tone: 'green' },
		{ title: 'Total Donasi Pending', value: formatRupiah(TotalPending), description: 'Total Dana Belum Masuk', icon: <FaTimesCircle />, tone: 'red' },
		{ title: 'Collection Rate', value: `${CollectionRate.toFixed(1)}%`, description: 'Kolektibilitas Dana Terkumpul', icon: <FaChartLine />, tone: 'blue' },
	];

	return (
		<>
			{LoadingDonasiDetail && <LoadingLogo />}

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

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Detail Donasi</div>
						<h1>Detail Transaksi Donasi</h1>
						<p>Lihat rincian transaksi dan status pembayaran donasi.</p>
					</div>
					<div className="admin-header-actions">
						<button className="admin-btn-secondary" onClick={handleBack}>
							<FaArrowLeft /> Kembali
						</button>
						<button className="admin-btn-primary" onClick={handleExport} disabled={ListDonasiDetail.length === 0}>
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
							<h2>Daftar Transaksi Donasi</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari nama warga"
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
							/>
						</div>

						<select value={FilterPembayaran} onChange={(e) => setFilterPembayaran(e.target.value)}>
							<option value="">Metode Pembayaran</option>
							<option value="qris">QRIS</option>
							<option value="va">Virtual Account</option>
						</select>

						<select value={FilterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
							<option value="">Status Transaksi</option>
							<option value="settlement">Settlement</option>
							<option value="pending">Pending</option>
						</select>

						<input type="month" value={FilterBulan} onChange={(e) => setFilterBulan(e.target.value)} />

						<button className="admin-btn-filter" onClick={handleFilter}>
							<FaFilter /> Filter
						</button>

						<button className="admin-btn-secondary" onClick={handleReset}>
							<FaRedoAlt /> Reset
						</button>
					</div>

					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>Order ID</th>
									<th>Nominal Donasi</th>
									<th>Metode Pembayaran</th>
									<th>Cluster</th>
									<th>Nama</th>
									<th>Tanggal Transaksi</th>
									<th>Tanggal Bayar</th>
									<th>Status Transaksi</th>
								</tr>
							</thead>
							<tbody>
								{ListDonasiDetail?.length > 0 ? ListDonasiDetail.map((item, index) => (
									<tr key={item.order_id || index}>
										<td><strong>{item.order_id || '-'}</strong></td>
										<td><strong>{formatRupiah(item.tagihan)}</strong></td>
										<td>{item.metode_pembayaran || '-'}</td>
										<td>{item.cluster || '-'}</td>
										<td><strong>{item.nama_user || '-'}</strong></td>
										<td>{item.tanggal_transaksi || '-'}</td>
										<td>{item.tanggal_bayar || '-'}</td>
										<td>{statusBadge(item.transaction_status)}</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={8}>
											<div className="admin-empty-state">
												<strong>Data tidak ditemukan</strong>
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
							onPageChange={(page) => { if (!LoadingDonasiDetail) setCurrentPage(page); }}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default DonasiDetail;
