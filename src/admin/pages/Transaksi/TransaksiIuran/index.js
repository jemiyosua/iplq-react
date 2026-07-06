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
	FaExchangeAlt,
	FaFileDownload,
	FaFilter,
	FaRedoAlt,
	FaSearch,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination, ModalDetailTransaksiIuran } from '../../../components';

const TransaksiIuran = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListIuran, setListIuran] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);

	const [LoadingIuran, setLoadingIuran] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');
	const [FilterBeginDate, setFilterBeginDate] = useState('');
	const [FilterEndDate, setFilterEndDate] = useState('');

	// Modal Detail
	const [showModalDetailIuran, setShowModalDetailIuran] = useState(false);
	const [detailTransaksiIuran, setDetailTransaksiIuran] = useState([]);
	const [detailTransaksiID, setDetailTransaksiID] = useState('');
	const [detailOrderID, setDetailOrderID] = useState('');
	const [detailStatusTransaksi, setDetailStatusTransaksi] = useState('');

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
		let beginDate = FilterBeginDate;
		let endDate = FilterEndDate;

		if (posisi === 'reset') {
			globalSearch = '';
			filterStatus = '';
			beginDate = '';
			endDate = '';
		}

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			jenis_transaksi: 'iuran',
			global_search: globalSearch,
			transaction_status: filterStatus,
			start_date_bayar: beginDate,
			end_date_bayar: endDate,
			access: cookieAccessLogin,
			cluster_id: parseInt(cookieClusterId),
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoadingIuran(true);

		var url = paths.URL_API_ADMIN + 'TransaksiTagihan';
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
					setListIuran(data.result || []);
					setTotalPage(Number(data.total_page) || 1);
					setTotalRecords(Number(data.total_record) || 0);
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
	}, [CurrentPage, FilterBeginDate, FilterEndDate, FilterStatus, GlobalSearch, RowPage, getCookie]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');
		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'TRANSAKSI_IURAN'));
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

	const statusBadge = (status) => {
		if (status === 'settlement') return <span className="admin-status-badge settlement">Settlement</span>;
		if (status === 'pending') return <span className="admin-status-badge pending">Pending</span>;
		return <span className="admin-status-badge">-</span>;
	};

	const handleFilterBulan = (bulan) => {
		setFilterBulan(bulan);
		const [year, month] = bulan.split('-');
		const start = new Date(year, month - 1, 1);
		const end = new Date(year, month, 0);
		const format = (date) => {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const d = String(date.getDate()).padStart(2, '0');
			return `${y}-${m}-${d}`;
		};
		setFilterBeginDate(format(start));
		setFilterEndDate(format(end));
	};

	const exportToExcel = (data, fileName = 'data') => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi Iuran');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListIuran.map((item) => ({
			'Order ID': item.order_id || '-',
			'Transaksi ID': item.transaksi_id || '-',
			Tagihan: item.total_tagihan_nominal || 0,
			Nama: item.nama_user || '-',
			Cluster: item.cluster || '-',
			'Bulan Tagihan': item.jumlah_bulan_tagihan_bayar || 0,
			'Tanggal Bayar': item.tanggal_bayar || '-',
			Status: item.transaction_status || '-',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-transaksi-iuran-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListIuran([]);
		if (CurrentPage === 1) { getListIuran(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setFilterBulan('');
		setFilterBeginDate('');
		setFilterEndDate('');
		setListIuran([]);
		if (CurrentPage === 1) { getListIuran('reset'); } else { setCurrentPage(1); }
	};

	const handleOpenModal = (item) => {
		setDetailOrderID(item.order_id);
		setDetailTransaksiID(item.transaksi_id);
		setDetailStatusTransaksi(item.transaction_status);
		const sortedData = [...(item.payment_detail || [])].sort((a, b) => a.id - b.id);
		setDetailTransaksiIuran(sortedData);
		setShowModalDetailIuran(true);
	};

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
						<div className="admin-eyebrow">Transaksi</div>
						<h1>Transaksi Iuran</h1>
						<p>Pantau semua transaksi pembayaran iuran warga.</p>
					</div>
					<button className="admin-btn-primary" onClick={handleExport} disabled={ListIuran.length === 0}>
						<FaFileDownload /> Export Data
					</button>
				</div>

				<div className="admin-summary-grid cols-3">
					<div className="admin-summary-card blue">
						<div>
							<span>Total Transaksi</span>
							<strong>{formatNumber(TotalRecords)}</strong>
							<small>Keseluruhan data</small>
						</div>
						<div className="admin-summary-icon"><FaExchangeAlt /></div>
					</div>
				</div>

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Transaksi Iuran</h2>
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

						<input type="month" value={FilterBulan} onChange={(e) => handleFilterBulan(e.target.value)} />

						<button className="admin-btn-filter" onClick={handleFilter}>
							<FaFilter /> Filter
						</button>

						<button className="admin-btn-secondary" onClick={handleReset}>
							<FaRedoAlt /> Reset
						</button>
					</div>

					<div className="table-responsive admin-table-wrap">
						<table className="table admin-table align-middle" style={{ minWidth: 1000 }}>
							<thead>
								<tr>
									<th>Order ID</th>
									<th>Transaksi ID</th>
									<th>Tagihan</th>
									<th>Nama</th>
									<th>Cluster</th>
									<th>Bulan Tagihan</th>
									<th>Tgl Bayar</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{ListIuran?.length > 0 ? ListIuran.map((item, index) => (
									<tr key={item.order_id || index} onClick={() => handleOpenModal(item)} style={{ cursor: 'pointer' }}>
										<td>{item.order_id || '-'}</td>
										<td>{item.transaksi_id || '-'}</td>
										<td><strong>{formatRupiah(item.total_tagihan_nominal)}</strong></td>
										<td><strong>{item.nama_user || '-'}</strong></td>
										<td>{item.cluster || '-'}</td>
										<td>{item.jumlah_bulan_tagihan_bayar || '-'}</td>
										<td>{item.tanggal_bayar || '-'}</td>
										<td>{statusBadge(item.transaction_status)}</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={8}>
											<div className="admin-empty-state">
												<strong>Transaksi Iuran tidak ditemukan</strong>
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

				<ModalDetailTransaksiIuran
					showModal={showModalDetailIuran}
					listDetailTransaksiIuran={detailTransaksiIuran}
					orderID={detailOrderID}
					transaksiID={detailTransaksiID}
					statusTransaksi={detailStatusTransaksi}
					onClickClose={() => setShowModalDetailIuran(false)}
				/>
			</div>
		</>
	);
};

export default TransaksiIuran;
