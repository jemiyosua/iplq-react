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
	FaChartLine,
	FaCheckCircle,
	FaExclamationTriangle,
	FaFileDownload,
	FaFilter,
	FaMoneyBillWave,
	FaRedoAlt,
	FaSearch,
	FaTimesCircle,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const Iuran = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListIuran, setListIuran] = useState([]);
	const [ListTunggakan, setListTunggakan] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [Total, setTotal] = useState(0);
	const [Terkumpul, setTerkumpul] = useState(0);
	const [BelumTerkumpul, setBelumTerkumpul] = useState(0);
	const [CollectionRate, setCollectionRate] = useState(0);

	const [LoadingIuran, setLoadingIuran] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');

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

	const getListIuran = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');
		var cookieAccessLogin = getCookie('access');
		var cookieClusterId = getCookie('cluster_id');

		let globalSearch = GlobalSearch;
		let filterStatus = FilterStatus;
		let filterBulan = FilterBulan;
		if (posisi === 'reset') {
			globalSearch = '';
			filterStatus = '';
			filterBulan = '';
		}

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			jenis_tagihan: 2,
			access: cookieAccessLogin,
			cluster_id: parseInt(cookieClusterId),
			global_search: globalSearch,
			transaction_status: filterStatus,
			bulan_invoice: filterBulan,
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoadingIuran(true);

		var url = paths.URL_API_ADMIN + 'BillsAnnual';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingIuran(false);
				if (data.error_code === '0' || data.error_code === 0) {
					const collectionRate = data.result_summary.total > 0
						? (data.result_summary.terkumpul / data.result_summary.total) * 100
						: 0;
					setListIuran(data.result || []);
					setListTunggakan(data.result_top_tunggakan || []);
					setTotalPage(Number(data.total_page) || 1);
					setTotalRecords(Number(data.total_record) || 0);
					setTotal(Number(data.result_summary.total) || 0);
					setTerkumpul(Number(data.result_summary.terkumpul) || 0);
					setBelumTerkumpul(Number(data.result_summary.belum) || 0);
					setCollectionRate(collectionRate);
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
					} else {
						setErrorMessageAlert(data.error_message);
					}
					setShowAlert(true);
				}
			})
			.catch((error) => {
				setLoadingIuran(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [CurrentPage, FilterBulan, FilterStatus, GlobalSearch, RowPage, getCookie]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');
		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'TAGIHAN_IURAN'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListIuran('');
	}, [getListIuran]);

	const formatRupiah = (value) => {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
	};

	const formatNumber = (value) => {
		return new Intl.NumberFormat('id-ID').format(value || 0);
	};

	const formatBulan = (val) => {
		if (!val) return '-';
		const [year, month] = val.split('-');
		const date = new Date(year, month - 1);
		return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
	};

	const statusBadge = (status) => {
		if (status === 'settlement') return <span className="admin-status-badge settlement">Settlement</span>;
		if (status === 'pending') return <span className="admin-status-badge pending">Pending</span>;
		return <span className="admin-status-badge">-</span>;
	};

	const exportToExcel = (data, fileName = 'data') => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Iuran');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListIuran.map((item) => ({
			'Order ID': item.order_id || '-',
			'Transaksi ID': item.transaction_id || '-',
			Nama: item.nama_user || '-',
			'No Rumah': item.nomor_rumah || '-',
			Cluster: item.cluster || '-',
			'Bulan Invoice': formatBulan(item.bulan_invoice),
			Tagihan: item.tagihan || 0,
			'Biaya Aplikasi': item.margin || 0,
			'Tanggal Bayar': item.tanggal_bayar || '-',
			'Status Transaksi': item.transaction_status || '-',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-iuran-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListIuran([]);
		if (CurrentPage === 1) { getListIuran(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setFilterBulan('');
		setListIuran([]);
		if (CurrentPage === 1) { getListIuran('reset'); } else { setCurrentPage(1); }
	};

	const summaryCards = [
		{ title: 'Total Tagihan', value: formatRupiah(Total), description: 'Keseluruhan iuran', icon: <FaMoneyBillWave />, tone: 'blue' },
		{ title: 'Terkumpul', value: formatRupiah(Terkumpul), description: 'Dana masuk', icon: <FaCheckCircle />, tone: 'green' },
		{ title: 'Belum Terkumpul', value: formatRupiah(BelumTerkumpul), description: 'Dana tertunda', icon: <FaTimesCircle />, tone: 'red' },
		{ title: 'Collection Rate', value: `${CollectionRate.toFixed(1)}%`, description: 'Kolektibilitas', icon: <FaChartLine />, tone: 'yellow' },
	];

	return (
		<>
			{LoadingIuran && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">{SessionMessage}</SweetAlert>
				)}
				{SuccessMessage !== '' && (
					<SweetAlert success show={ShowAlert} onConfirm={() => { setShowAlert(false); setSuccessMessage(''); }} btnSize="sm">{SuccessMessage}</SweetAlert>
				)}
				{ErrorMessageAlert !== '' && (
					<SweetAlert danger show={ShowAlert} onConfirm={() => { setShowAlert(false); setErrorMessageAlert(''); }} btnSize="sm">{ErrorMessageAlert}</SweetAlert>
				)}
				{ErrorMessageAlertLogout !== '' && (
					<SweetAlert danger show={ShowAlert} onConfirm={() => { setShowAlert(false); setErrorMessageAlertLogout(''); history.push('/admin/login'); }} btnSize="sm">{ErrorMessageAlertLogout}</SweetAlert>
				)}

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Tagihan Warga</div>
						<h1>Iuran Warga</h1>
						<p>Pantau tagihan iuran, status pembayaran, dan tunggakan warga.</p>
					</div>
					<button className="admin-btn-primary" onClick={handleExport} disabled={ListIuran.length === 0}>
						<FaFileDownload /> Export Data
					</button>
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

				{ListTunggakan.length > 0 && (
					<div className="admin-panel" style={{ marginBottom: 14 }}>
						<div className="admin-panel-header">
							<div>
								<h2><FaExclamationTriangle style={{ marginRight: 8, color: '#dc2626' }} />Top Tunggakan</h2>
							</div>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
							{ListTunggakan.map((item, i) => (
								<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: 8, background: '#f8fafc' }}>
									<div>
										<strong style={{ color: '#0f172a' }}>{item.nama || '-'}</strong>
										<span style={{ display: 'block', fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.cluster || '-'}</span>
									</div>
									<strong style={{ color: '#dc2626' }}>{formatRupiah(item.total)}</strong>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Tagihan Iuran</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari order ID, nama warga, atau cluster"
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
							/>
						</div>

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

					<div className="table-responsive admin-table-wrap">
						<table className="table admin-table align-middle" style={{ minWidth: 1100 }}>
							<thead>
								<tr>
									<th>Order ID</th>
									<th>Transaksi ID</th>
									<th>Tagihan</th>
									<th>Biaya App</th>
									<th>Nama</th>
									<th>No Rumah</th>
									<th>Cluster</th>
									<th>Bulan Tagihan</th>
									<th>Tgl Bayar</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{ListIuran?.length > 0 ? ListIuran.map((item, index) => (
									<tr key={item.order_id || index}>
										<td>{item.order_id || '-'}</td>
										<td>{item.transaction_id || '-'}</td>
										<td><strong>{formatRupiah(item.tagihan)}</strong></td>
										<td>{formatRupiah(item.margin)}</td>
										<td><strong>{item.nama_user || '-'}</strong></td>
										<td>{item.nomor_rumah || '-'}</td>
										<td>{item.cluster || '-'}</td>
										<td>{formatBulan(item.bulan_invoice)}</td>
										<td>{item.tanggal_bayar || '-'}</td>
										<td>{statusBadge(item.transaction_status)}</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={10}>
											<div className="admin-empty-state">
												<strong>Data iuran tidak ditemukan</strong>
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
							onPageChange={(page) => { if (!LoadingIuran) setCurrentPage(page); }}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Iuran;
