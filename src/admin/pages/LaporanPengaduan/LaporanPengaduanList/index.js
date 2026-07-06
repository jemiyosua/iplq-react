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
	FaSearch,
	FaFilter,
	FaRedoAlt,
	FaFileDownload,
	FaClipboardList,
	FaCheckCircle,
	FaTimesCircle,
	FaExclamationTriangle,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const LaporanPengaduanList = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, setCookie, removeCookie] = useCookies(['user']);

	const [ListLaporan, setListLaporan] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [TotalAktif, setTotalAktif] = useState(0);
	const [TotalTidakAktif, setTotalTidakAktif] = useState(0);
	const [TotalTersedia, setTotalTersedia] = useState(0);
	const [TotalTidakTersedia, setTotalTidakTersedia] = useState(0);

	const [LoadingLaporan, setLoadingLaporan] = useState(false);

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

	const getListLaporanPengaduan = useCallback((posisi = '') => {
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
			order_by: '',
			order: '',
		});

		setLoadingLaporan(true);

		var url = paths.URL_API_ADMIN + 'LaporanPengaduan';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingLaporan(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListLaporan(data.result || []);
					setTotalAktif(Number(data.total_aktif) || 0);
					setTotalTidakAktif(Number(data.total_tidak_aktif) || 0);
					setTotalTersedia(Number(data.total_tersedia) || 0);
					setTotalTidakTersedia(Number(data.total_tidak_tersedia) || 0);
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
				setLoadingLaporan(false);
				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
				}
				setShowAlert(true);
			});
	}, [CurrentPage, FilterStatus, GlobalSearch, RowPage, getCookie]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');
		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'LAPORAN_PENGADUAN'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListLaporanPengaduan('');
	}, [getListLaporanPengaduan]);

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
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pengaduan');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListLaporan.map((item) => ({
			'Cluster': item.cluster || '-',
			'Judul Laporan': item.judul_laporan || '-',
			'ID Laporan': item.id_laporan_pengaduan || '-',
			'Detail Lokasi': item.detail_lokasi || '-',
			'Deskripsi Laporan': item.deskripsi_laporan || '-',
			'Nama Tukang': item.nama_tukang || '-',
			'Tanggal Mulai Pengerjaan': item.tanggal_mulai_pengerjaan || '-',
			'Tanggal Selesai Pengerjaan': item.tanggal_selesai_pengerjaan || '-',
			'Lama Pengerjaan': item.lama_pengerjaan || '-',
			'Perbaikan Tukang': item.perbaikan_tukang || '-',
			'Status': Number(item.status) === 1 ? 'Aktif' : 'Tidak Aktif',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-laporan-pengaduan-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListLaporan([]);
		if (CurrentPage === 1) { getListLaporanPengaduan(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setListLaporan([]);
		if (CurrentPage === 1) { getListLaporanPengaduan('reset'); } else { setCurrentPage(1); }
	};

	const handleDetailLaporan = (id) => {
		setCookie('varCookieFasilitasId', id, { path: '/' });
		history.push('/admin/laporan-booking');
	};

	const summaryCards = [
		{ title: 'Total Laporan', value: formatNumber(TotalRecords), description: 'Semua laporan pengaduan', icon: <FaClipboardList />, tone: 'blue' },
		{ title: 'Laporan Aktif', value: formatNumber(TotalAktif), description: 'Sedang ditangani', icon: <FaCheckCircle />, tone: 'green' },
		{ title: 'Laporan Tidak Aktif', value: formatNumber(TotalTidakAktif), description: 'Selesai / ditutup', icon: <FaTimesCircle />, tone: 'red' },
		{ title: 'Menunggu Penanganan', value: formatNumber(TotalTidakTersedia), description: 'Belum ditindaklanjuti', icon: <FaExclamationTriangle />, tone: 'yellow' },
	];

	return (
		<>
			{LoadingLaporan && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">
						{SessionMessage}
					</SweetAlert>
				)}
				{SuccessMessage !== '' && (
					<SweetAlert success show={ShowAlert} onConfirm={() => { setShowAlert(false); setSuccessMessage(''); history.replace('/admin/laporan-pengaduan'); }} btnSize="sm">
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
						<div className="admin-eyebrow">Manajemen Pengaduan</div>
						<h1>Laporan Pengaduan</h1>
						<p>Pantau laporan pengaduan dan status perbaikan.</p>
					</div>
					<button className="admin-btn-primary" onClick={handleExport} disabled={ListLaporan.length === 0}>
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

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Laporan Pengaduan</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari laporan pengaduan..."
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
									<th>Detail Laporan</th>
									<th>Foto Laporan</th>
									<th>Detail Pengerjaan</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{ListLaporan?.length > 0 ? ListLaporan.map((item, index) => (
									<tr key={item.id_laporan_pengaduan || index} onClick={() => handleDetailLaporan(item.id)} style={{ cursor: 'pointer' }}>
										<td><strong>{item.cluster || '-'}</strong></td>
										<td>
											<strong>{item.judul_laporan || '-'}</strong>
											<span>{item.id_laporan_pengaduan}</span>
											<small>Detail Lokasi: {item.detail_lokasi || '-'}</small>
											<small>Deskripsi: {item.deskripsi_laporan || '-'}</small>
											<small>Jumlah Foto: {item.foto_laporan ? item.foto_laporan.length : 0}</small>
										</td>
										<td>
											{item.foto_laporan && item.foto_laporan.length > 0 ? (
												<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
													{item.foto_laporan.map((foto, idx) => (
														<img
															key={idx}
															src={'https://api.ipl-q.com/api/v1/image/laporan/' + foto.image_name}
															alt={`Foto laporan ${idx + 1}`}
															style={{ height: 60, width: 100, objectFit: 'cover', borderRadius: 6 }}
														/>
													))}
												</div>
											) : (
												<small>Tidak ada foto</small>
											)}
										</td>
										<td>
											<small>Nama Tukang: {item.nama_tukang || '-'}</small>
											<small>Mulai: {item.tanggal_mulai_pengerjaan || '-'}</small>
											<small>Selesai: {item.tanggal_selesai_pengerjaan || '-'}</small>
											<small>Lama: {item.lama_pengerjaan || '-'}</small>
											<small>Perbaikan: {item.perbaikan_tukang || '-'}</small>
										</td>
										<td>{statusBadge(item.status)}</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={5}>
											<div className="admin-empty-state">
												<strong>Laporan pengaduan tidak ditemukan</strong>
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
							onPageChange={(page) => { if (!LoadingLaporan) setCurrentPage(page); }}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default LaporanPengaduanList;
