import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import '../../../../styles/admin-shared.css';
import './donasi.css';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils';
import { generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
	FaChartLine,
	FaEdit,
	FaEye,
	FaFileDownload,
	FaFilter,
	FaHandHoldingHeart,
	FaPlus,
	FaRedoAlt,
	FaSearch,
	FaTimes,
	FaTimesCircle,
	FaTrash,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const Donasi = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, setCookie, removeCookie] = useCookies(['user']);

	const [ListDonasi, setListDonasi] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [TotalSettlement, setTotalSettlement] = useState(0);
	const [TotalPending, setTotalPending] = useState(0);
	const [CollectionRate, setCollectionRate] = useState(0);

	const [LoadingDonasi, setLoadingDonasi] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');

	// Modal Update State
	const [ShowModalUpdate, setShowModalUpdate] = useState(false);
	const [EditId, setEditId] = useState(null);
	const [EditNamaDonasi, setEditNamaDonasi] = useState('');
	const [EditKeterangan, setEditKeterangan] = useState('');
	const [EditDonasiMinimal, setEditDonasiMinimal] = useState('');
	const [EditTanggalMulai, setEditTanggalMulai] = useState('');
	const [EditTanggalSelesai, setEditTanggalSelesai] = useState('');
	const [EditStatus, setEditStatus] = useState('1');

	// Modal Input New Donasi State
	const [ShowModalInput, setShowModalInput] = useState(false);
	const [InputNamaDonasi, setInputNamaDonasi] = useState('');
	const [InputKeterangan, setInputKeterangan] = useState('');
	const [InputDonasiMinimal, setInputDonasiMinimal] = useState('');
	const [InputTanggalMulai, setInputTanggalMulai] = useState('');
	const [InputTanggalSelesai, setInputTanggalSelesai] = useState('');

	// Delete Confirmation State
	const [ShowConfirmDelete, setShowConfirmDelete] = useState(false);
	const [DeleteId, setDeleteId] = useState(null);
	const [DeleteName, setDeleteName] = useState('');

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

	const getListDonasi = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

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
			global_search: globalSearch,
			status: filterStatus,
			bulan_invoice: filterBulan,
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoadingDonasi(true);

		var url = paths.URL_API_ADMIN + 'Donasi';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingDonasi(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListDonasi(data.result || []);
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
				setLoadingDonasi(false);
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
			dispatch(setForm('PageActive', 'DONASI'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListDonasi('');
	}, [getListDonasi]);

	const formatRupiah = (value) => {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
	};

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
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Donasi');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListDonasi.map((item) => ({
			'Nama Donasi': item.nama_donasi || '-',
			Cluster: item.cluster || '-',
			'Tanggal Mulai': item.tanggal_mulai_donasi || '-',
			'Tanggal Selesai': item.tanggal_selesai_donasi || '-',
			Keterangan: item.keterangan_donasi || '-',
			'Donasi Minimal': item.donasi_minimal || 0,
			Status: Number(item.status) === 1 ? 'Aktif' : 'Tidak Aktif',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		exportToExcel(formatted, `export-donasi-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListDonasi([]);
		if (CurrentPage === 1) { getListDonasi(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setFilterBulan('');
		setListDonasi([]);
		if (CurrentPage === 1) { getListDonasi('reset'); } else { setCurrentPage(1); }
	};

	const handleDetailDonasi = (id) => {
		setCookie('varCookieDonasiId', id, { path: '/' });
		history.push('/admin/donasi-detail');
	};

	// --- Input New Donasi ---
	const handleOpenInput = () => {
		setInputNamaDonasi('');
		setInputKeterangan('');
		setInputDonasiMinimal('');
		setInputTanggalMulai('');
		setInputTanggalSelesai('');
		setShowModalInput(true);
	};

	const handleCloseInput = () => {
		setShowModalInput(false);
		setInputNamaDonasi('');
		setInputKeterangan('');
		setInputDonasiMinimal('');
		setInputTanggalMulai('');
		setInputTanggalSelesai('');
	};

	const handleSubmitInput = () => {
		if (!InputNamaDonasi.trim()) {
			setErrorMessageAlert('Nama donasi tidak boleh kosong');
			setShowAlert(true);
			return;
		}

		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'INSERT',
			nama_donasi: InputNamaDonasi,
			keterangan_donasi: InputKeterangan,
			donasi_minimal: parseInt(InputDonasiMinimal) || 0,
			tanggal_mulai_donasi: InputTanggalMulai,
			tanggal_selesai_donasi: InputTanggalSelesai,
		});

		setLoadingDonasi(true);

		var url = paths.URL_API_ADMIN + 'Donasi';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingDonasi(false);
				if (data.error_code === '0' || data.error_code === 0) {
					handleCloseInput();
					setSuccessMessage('Program donasi baru berhasil ditambahkan.');
					setShowAlert(true);
					getListDonasi('');
				} else {
					if (data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
					} else {
						setErrorMessageAlert(data.error_message || 'Gagal menambahkan donasi.');
					}
					setShowAlert(true);
				}
			})
			.catch(() => {
				setLoadingDonasi(false);
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			});
	};

	// --- Update Donasi ---
	const handleOpenUpdate = (item) => {
		setEditId(item.id);
		setEditNamaDonasi(item.nama_donasi || '');
		setEditKeterangan(item.keterangan_donasi || '');
		setEditDonasiMinimal(String(item.donasi_minimal || ''));
		setEditTanggalMulai(item.tanggal_mulai_donasi_raw || '');
		setEditTanggalSelesai(item.tanggal_selesai_donasi_raw || '');
		setEditStatus(String(item.status ?? '1'));
		setShowModalUpdate(true);
	};

	const handleCloseUpdate = () => {
		setShowModalUpdate(false);
		setEditId(null);
		setEditNamaDonasi('');
		setEditKeterangan('');
		setEditDonasiMinimal('');
		setEditTanggalMulai('');
		setEditTanggalSelesai('');
		setEditStatus('1');
	};

	const handleSubmitUpdate = () => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'UPDATE',
			id: parseInt(EditId),
			nama_donasi: EditNamaDonasi,
			keterangan_donasi: EditKeterangan,
			donasi_minimal: parseInt(EditDonasiMinimal) || 0,
			tanggal_mulai_donasi: EditTanggalMulai,
			tanggal_selesai_donasi: EditTanggalSelesai,
			status: parseInt(EditStatus),
		});

		setLoadingDonasi(true);

		var url = paths.URL_API_ADMIN + 'Donasi';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingDonasi(false);
				if (data.error_code === '0' || data.error_code === 0) {
					handleCloseUpdate();
					setSuccessMessage('Data donasi berhasil diperbarui.');
					setShowAlert(true);
					getListDonasi('');
				} else {
					if (data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
					} else {
						setErrorMessageAlert(data.error_message || 'Gagal memperbarui data.');
					}
					setShowAlert(true);
				}
			})
			.catch((error) => {
				setLoadingDonasi(false);
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			});
	};

	// --- Delete Donasi ---
	const handleOpenDelete = (item) => {
		setDeleteId(item.id);
		setDeleteName(item.nama_donasi || 'Donasi');
		setShowConfirmDelete(true);
	};

	const handleConfirmDelete = () => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'DELETE',
			id: parseInt(DeleteId),
		});

		setShowConfirmDelete(false);
		setLoadingDonasi(true);

		var url = paths.URL_API_ADMIN + 'Donasi';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingDonasi(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setSuccessMessage('Data donasi berhasil dihapus.');
					setShowAlert(true);
					getListDonasi('');
				} else {
					if (data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
					} else {
						setErrorMessageAlert(data.error_message || 'Gagal menghapus data.');
					}
					setShowAlert(true);
				}
			})
			.catch((error) => {
				setLoadingDonasi(false);
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			});
	};

	const summaryCards = [
		{ title: 'Total Donasi Terkumpul', value: formatRupiah(TotalSettlement), description: 'Saldo donasi masuk', icon: <FaHandHoldingHeart />, tone: 'green' },
		{ title: 'Total Donasi Pending', value: formatRupiah(TotalPending), description: 'Belum masuk', icon: <FaTimesCircle />, tone: 'red' },
		{ title: 'Collection Rate', value: `${CollectionRate.toFixed(1)}%`, description: 'Kolektibilitas donasi', icon: <FaChartLine />, tone: 'blue' },
	];

	return (
		<>
			{LoadingDonasi && <LoadingLogo />}

			<div className="admin-page">
				{SessionMessage !== '' && (
					<SweetAlert warning show={ShowAlert} onConfirm={() => { setShowAlert(false); logout(); history.push('/admin/login'); }} btnSize="sm">
						{SessionMessage}
					</SweetAlert>
				)}
				{SuccessMessage !== '' && (
					<SweetAlert success show={ShowAlert} onConfirm={() => { setShowAlert(false); setSuccessMessage(''); history.replace('/admin/donasi'); }} btnSize="sm">
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
						<div className="admin-eyebrow">Penggalangan Dana</div>
						<h1>Donasi</h1>
						<p>Kelola dan pantau semua program donasi warga.</p>
					</div>
					<div style={{ display: 'flex', gap: 10 }}>
						<button className="admin-btn-primary" onClick={handleOpenInput}>
							<FaPlus /> Tambah Donasi
						</button>
						<button className="admin-btn-secondary" onClick={handleExport} disabled={ListDonasi.length === 0}>
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
							<h2>Daftar Program Donasi</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari donasi atau cluster"
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

						<input type="month" value={FilterBulan} onChange={(e) => setFilterBulan(e.target.value)} />

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
									<th>Nama Donasi</th>
									<th>Cluster</th>
									<th>Tanggal Mulai</th>
									<th>Tanggal Selesai</th>
									<th>Keterangan</th>
									<th>Donasi Minimal</th>
									<th>Status</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListDonasi?.length > 0 ? ListDonasi.map((item, index) => (
									<tr key={item.id || index}>
										<td><strong>{item.nama_donasi || '-'}</strong></td>
										<td><strong>{item.cluster || '-'}</strong></td>
										<td>{item.tanggal_mulai_donasi || '-'}</td>
										<td>{item.tanggal_selesai_donasi || '-'}</td>
										<td><span style={{ maxWidth: 250, display: 'block', whiteSpace: 'normal', margin: 0, color: '#0f172a' }}>{item.keterangan_donasi || '-'}</span></td>
										<td><strong>{formatRupiah(item.donasi_minimal)}</strong></td>
										<td>{statusBadge(item.status)}</td>
										<td>
											<div style={{ display: 'flex', gap: 6 }}>
												<button className="admin-btn-icon" onClick={() => handleDetailDonasi(item.id)} title="Lihat Detail">
													<FaEye />
												</button>
												<button className="admin-btn-icon" onClick={() => handleOpenUpdate(item)} title="Edit Data">
													<FaEdit />
												</button>
												<button className="admin-btn-icon danger" onClick={() => handleOpenDelete(item)} title="Hapus Data">
													<FaTrash />
												</button>
											</div>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={8}>
											<div className="admin-empty-state">
												<strong>Program donasi tidak ditemukan</strong>
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
							onPageChange={(page) => { if (!LoadingDonasi) setCurrentPage(page); }}
						/>
					</div>
				</div>

				{/* Modal Update Donasi */}
				{ShowModalUpdate && (
					<div className="donasi-modal-overlay" onClick={handleCloseUpdate}>
						<div className="donasi-modal" onClick={(e) => e.stopPropagation()}>
							<div className="donasi-modal-header">
								<h3>Edit Program Donasi</h3>
								<button className="donasi-modal-close" onClick={handleCloseUpdate}>
									<FaTimes />
								</button>
							</div>
							<div className="donasi-modal-body">
								<div className="donasi-modal-field">
									<label>Nama Donasi</label>
									<input
										type="text"
										value={EditNamaDonasi}
										onChange={(e) => setEditNamaDonasi(e.target.value)}
										placeholder="Masukkan nama donasi"
									/>
								</div>
								<div className="donasi-modal-field">
									<label>Keterangan</label>
									<textarea
										value={EditKeterangan}
										onChange={(e) => setEditKeterangan(e.target.value)}
										placeholder="Masukkan keterangan donasi"
										rows={3}
									/>
								</div>
								<div className="donasi-modal-row">
									<div className="donasi-modal-field">
										<label>Donasi Minimal (Rp)</label>
										<input
											type="number"
											value={EditDonasiMinimal}
											onChange={(e) => setEditDonasiMinimal(e.target.value)}
											placeholder="0"
										/>
									</div>
									<div className="donasi-modal-field">
										<label>Status</label>
										<select value={EditStatus} onChange={(e) => setEditStatus(e.target.value)}>
											<option value="1">Aktif</option>
											<option value="0">Tidak Aktif</option>
										</select>
									</div>
								</div>
								<div className="donasi-modal-row">
									<div className="donasi-modal-field">
										<label>Tanggal Mulai</label>
										<input
											type="date"
											value={EditTanggalMulai}
											onChange={(e) => setEditTanggalMulai(e.target.value)}
										/>
									</div>
									<div className="donasi-modal-field">
										<label>Tanggal Selesai</label>
										<input
											type="date"
											value={EditTanggalSelesai}
											onChange={(e) => setEditTanggalSelesai(e.target.value)}
										/>
									</div>
								</div>
							</div>
							<div className="donasi-modal-footer">
								<button className="admin-btn-secondary" onClick={handleCloseUpdate}>
									Batal
								</button>
								<button className="admin-btn-primary" onClick={handleSubmitUpdate}>
									Simpan Perubahan
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Modal Input Donasi Baru */}
				{ShowModalInput && (
					<div className="donasi-modal-overlay" onClick={handleCloseInput}>
						<div className="donasi-modal" onClick={(e) => e.stopPropagation()}>
							<div className="donasi-modal-header">
								<h3>Tambah Program Donasi Baru</h3>
								<button className="donasi-modal-close" onClick={handleCloseInput}>
									<FaTimes />
								</button>
							</div>
							<div className="donasi-modal-body">
								<div className="donasi-modal-field">
									<label>Nama Donasi <span style={{ color: 'red' }}>*</span></label>
									<input
										type="text"
										value={InputNamaDonasi}
										onChange={(e) => setInputNamaDonasi(e.target.value)}
										placeholder="Masukkan nama donasi"
									/>
								</div>
								<div className="donasi-modal-field">
									<label>Deskripsi Donasi</label>
									<textarea
										value={InputKeterangan}
										onChange={(e) => setInputKeterangan(e.target.value)}
										placeholder="Masukkan deskripsi donasi"
										rows={3}
									/>
								</div>
								<div className="donasi-modal-row">
									<div className="donasi-modal-field">
										<label>Tanggal Mulai</label>
										<input
											type="date"
											value={InputTanggalMulai}
											onChange={(e) => setInputTanggalMulai(e.target.value)}
										/>
									</div>
									<div className="donasi-modal-field">
										<label>Tanggal Selesai</label>
										<input
											type="date"
											value={InputTanggalSelesai}
											onChange={(e) => setInputTanggalSelesai(e.target.value)}
										/>
									</div>
								</div>
								<div className="donasi-modal-field">
									<label>Jumlah Donasi Minimal (Rp)</label>
									<input
										type="number"
										value={InputDonasiMinimal}
										onChange={(e) => setInputDonasiMinimal(e.target.value)}
										placeholder="0"
									/>
								</div>
							</div>
							<div className="donasi-modal-footer">
								<button className="admin-btn-secondary" onClick={handleCloseInput}>
									Batal
								</button>
								<button className="admin-btn-primary" onClick={handleSubmitInput} disabled={!InputNamaDonasi.trim()}>
									Simpan
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Confirm Delete */}
				{ShowConfirmDelete && (
					<SweetAlert
						warning
						showCancel
						show={ShowConfirmDelete}
						confirmBtnText="Ya, Hapus"
						cancelBtnText="Batal"
						confirmBtnBsStyle="danger"
						onConfirm={handleConfirmDelete}
						onCancel={() => setShowConfirmDelete(false)}
						btnSize="sm"
					>
						Apakah Anda yakin ingin menghapus program donasi <strong>{DeleteName}</strong>?
					</SweetAlert>
				)}
			</div>
		</>
	);
};

export default Donasi;
