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
	FaChartLine,
	FaFileDownload,
	FaFilter,
	FaHandHoldingHeart,
	FaMoneyBillWave,
	FaRedoAlt,
	FaSearch,
	FaUsers,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const DonasiDetail = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [DetailDonasi, setDetailDonasi] = useState(null);
	const [ListDonatur, setListDonatur] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);

	const [TotalTerkumpul, setTotalTerkumpul] = useState(0);
	const [TotalDonatur, setTotalDonatur] = useState(0);
	const [TotalPending, setTotalPending] = useState(0);
	const [CollectionRate, setCollectionRate] = useState(0);

	const [Loading, setLoading] = useState(false);
	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');

	const [ShowAlert, setShowAlert] = useState(false);
	const [SessionMessage, setSessionMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');

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

	const getDetailDonasi = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');
		var donasiId = cookies.varCookieDonasiId;

		if (!donasiId) {
			history.push('/admin/donasi');
			return;
		}

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
			id: parseInt(donasiId),
			global_search: globalSearch,
			status: filterStatus,
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoading(true);

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
				setLoading(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setDetailDonasi(data.detail || null);
					setListDonatur(data.result || []);
					setTotalTerkumpul(Number(data.total_terkumpul) || 0);
					setTotalDonatur(Number(data.total_donatur) || 0);
					setTotalPending(Number(data.total_pending) || 0);
					setCollectionRate(Number(data.collection_rate) || 0);
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
	}, [CurrentPage, FilterStatus, GlobalSearch, RowPage, cookies.varCookieDonasiId, getCookie, history]);

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
		getDetailDonasi('');
	}, [getDetailDonasi]);

	const formatRupiah = (value) => {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
	};

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const handleFilter = () => {
		setListDonatur([]);
		if (CurrentPage === 1) { getDetailDonasi(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setListDonatur([]);
		if (CurrentPage === 1) { getDetailDonasi('reset'); } else { setCurrentPage(1); }
	};

	const handleExport = () => {
		const formatted = ListDonatur.map((item) => ({
			'Nama Donatur': item.nama || '-',
			'Cluster': item.cluster || '-',
			'Nominal': item.nominal || 0,
			'Status': item.transaction_status || '-',
			'Tanggal': item.tanggal_bayar || '-',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		const worksheet = XLSX.utils.json_to_sheet(formatted);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Detail Donasi');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `export-detail-donasi-${day}-${month}-${year}.xlsx`);
	};

	const statusBadge = (status) => {
		if (status === 'settlement') return <span className="admin-status-badge active">Settlement</span>;
		if (status === 'pending') return <span className="admin-status-badge pending">Pending</span>;
		if (status === 'expire' || status === 'cancel') return <span className="admin-status-badge inactive">{status}</span>;
		return <span className="admin-status-badge info">{status || '-'}</span>;
	};

	const summaryCards = [
		{ title: 'Total Donasi Terkumpul', value: formatRupiah(TotalTerkumpul), description: 'Dana yang sudah masuk', icon: <FaHandHoldingHeart />, tone: 'green' },
		{ title: 'Total Donatur', value: formatNumber(TotalDonatur), description: 'Orang yang berdonasi', icon: <FaUsers />, tone: 'blue' },
		{ title: 'Donasi Pending', value: formatRupiah(TotalPending), description: 'Belum settlement', icon: <FaMoneyBillWave />, tone: 'yellow' },
		{ title: 'Collection Rate', value: `${CollectionRate.toFixed(1)}%`, description: 'Kolektibilitas donasi', icon: <FaChartLine />, tone: 'purple' },
	];

	return (
		<>
			{Loading && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">
						{SessionMessage}
					</SweetAlert>
				)}
				{ErrorMessageAlert !== '' && (
					<SweetAlert danger show={ShowAlert} onConfirm={() => { setShowAlert(false); setErrorMessageAlert(''); }} btnSize="sm">
						{ErrorMessageAlert}
					</SweetAlert>
				)}

				<div className="admin-header">
					<div>
						<button
							onClick={() => { removeCookie('varCookieDonasiId', { path: '/' }); history.push('/admin/donasi'); }}
							style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#2563eb', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 8 }}
						>
							<FaArrowLeft /> Kembali ke Daftar Donasi
						</button>
						<div className="admin-eyebrow">Detail Program Donasi</div>
						<h1>{DetailDonasi?.nama_donasi || 'Detail Donasi'}</h1>
						<p>{DetailDonasi?.keterangan_donasi || 'Lihat detail dan statistik program donasi.'}</p>
					</div>
					<button className="admin-btn-secondary" onClick={handleExport} disabled={ListDonatur.length === 0}>
						<FaFileDownload /> Export Data
					</button>
				</div>

				{/* Info Donasi */}
				{DetailDonasi && (
					<div className="admin-panel" style={{ marginBottom: 20 }}>
						<div style={{ padding: 16 }}>
							<div className="row">
								<div className="col-md-3 mb-2">
									<small style={{ color: '#6b7280' }}>Nama Donasi</small>
									<div style={{ fontWeight: 700 }}>{DetailDonasi.nama_donasi || '-'}</div>
								</div>
								<div className="col-md-3 mb-2">
									<small style={{ color: '#6b7280' }}>Keterangan</small>
									<div style={{ fontWeight: 600 }}>{DetailDonasi.keterangan_donasi || '-'}</div>
								</div>
								<div className="col-md-2 mb-2">
									<small style={{ color: '#6b7280' }}><FaCalendarAlt /> Tanggal Mulai</small>
									<div style={{ fontWeight: 600 }}>{DetailDonasi.tanggal_mulai_donasi || '-'}</div>
								</div>
								<div className="col-md-2 mb-2">
									<small style={{ color: '#6b7280' }}><FaCalendarAlt /> Tanggal Selesai</small>
									<div style={{ fontWeight: 600 }}>{DetailDonasi.tanggal_selesai_donasi || '-'}</div>
								</div>
								<div className="col-md-2 mb-2">
									<small style={{ color: '#6b7280' }}>Minimal Donasi</small>
									<div style={{ fontWeight: 700, color: '#2563eb' }}>{formatRupiah(DetailDonasi.donasi_minimal)}</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Summary Cards */}
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

				{/* Tabel Donatur */}
				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Donatur</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari nama donatur..."
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
							/>
						</div>

						<select value={FilterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
							<option value="">Semua Status</option>
							<option value="settlement">Settlement</option>
							<option value="pending">Pending</option>
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
									<th>No</th>
									<th>Order ID</th>
									<th>Nama Donatur</th>
									<th>Cluster</th>
									<th>Nominal</th>
									<th>Status</th>
									<th>Tanggal</th>
								</tr>
							</thead>
							<tbody>
								{ListDonatur?.length > 0 ? ListDonatur.map((item, index) => (
									<tr key={item.id || index}>
										<td>{(CurrentPage - 1) * RowPage + index + 1}</td>
										<td>{item.order_id || '-'}</td>
										<td><strong>{item.nama || '-'}</strong></td>
										<td>{item.cluster || '-'}</td>
										<td><strong style={{ color: '#16a34a' }}>{formatRupiah(item.nominal_donasi)}</strong></td>
										<td>{statusBadge(item.status_transaksi)}</td>
										<td>{item.tgl_bayar || '-'}</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={6}>
											<div className="admin-empty-state">
												<strong>Belum ada donatur</strong>
												<span>Data donatur akan muncul setelah ada warga yang berdonasi.</span>
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
			</div>
		</>
	);
};

export default DonasiDetail;
