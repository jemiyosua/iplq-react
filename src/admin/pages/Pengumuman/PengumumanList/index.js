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
	FaBullhorn,
	FaEdit,
	FaFileDownload,
	FaFilter,
	FaNewspaper,
	FaPlus,
	FaRedoAlt,
	FaSearch,
	FaTrash,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const PengumumanList = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListData, setListData] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);
	const [TotalPengumuman, setTotalPengumuman] = useState(0);
	const [TotalBerita, setTotalBerita] = useState(0);

	const [Loading, setLoading] = useState(false);

	const [ShowAlert, setShowAlert] = useState(false);
	const [AlertState, setAlertState] = useState('');
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ConfirmMessage, setConfirmMessage] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterKategori, setFilterKategori] = useState('');

	// Modal state
	const [ShowModal, setShowModal] = useState(false);
	const [ModalMode, setModalMode] = useState('insert');
	const [FormData, setFormData] = useState({ id: '', judul: '', isi: '', kategori: 'pengumuman' });

	// Delete state
	const [DeleteId, setDeleteId] = useState(null);

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

	const getListPengumuman = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		let globalSearch = GlobalSearch;
		let filterKategori = FilterKategori;
		if (posisi === 'reset') {
			globalSearch = '';
			filterKategori = '';
		}

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			global_search: globalSearch,
			kategori: filterKategori,
			page: CurrentPage,
			row_page: RowPage,
			order_by: '',
			order: '',
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'Pengumuman';
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
					setTotalPage(Number(data.total_page) || 1);
					setTotalRecords(Number(data.total_record) || 0);
					setTotalPengumuman(Number(data.total_pengumuman) || 0);
					setTotalBerita(Number(data.total_berita) || 0);
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
	}, [CurrentPage, FilterKategori, GlobalSearch, RowPage, getCookie]);

	const handleSubmit = useCallback(() => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		const method = ModalMode === 'insert' ? 'INSERT' : 'UPDATE';

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: method,
			id: ModalMode === 'update' ? parseInt(FormData.id) : undefined,
			judul: FormData.judul,
			isi: FormData.isi,
			kategori: FormData.kategori,
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'Pengumuman';
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
					getListPengumuman('');
					setShowModal(false);
					resetForm();
					setAlertState('success');
					setSuccessMessage(ModalMode === 'insert' ? 'Data berhasil ditambahkan' : 'Data berhasil diupdate');
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
	}, [FormData, ModalMode, getCookie, getListPengumuman]);

	const handleDelete = useCallback(() => {
		if (!DeleteId) return;
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'DELETE',
			id: parseInt(DeleteId),
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'Pengumuman';
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
					getListPengumuman('');
					setAlertState('success');
					setSuccessMessage('Data berhasil dihapus');
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
	}, [DeleteId, getCookie, getListPengumuman]);

	useEffect(() => {
		window.scrollTo(0, 0);
		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');
		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'PENGUMUMAN'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListPengumuman('');
	}, [getListPengumuman]);

	const resetForm = () => {
		setFormData({ id: '', judul: '', isi: '', kategori: 'pengumuman' });
		setModalMode('insert');
	};

	const handleOpenInput = () => {
		resetForm();
		setShowModal(true);
	};

	const handleOpenEdit = (item) => {
		setFormData({
			id: item.id,
			judul: item.judul || '',
			isi: item.isi || '',
			kategori: item.kategori || 'pengumuman',
		});
		setModalMode('update');
		setShowModal(true);
	};

	const handleConfirmDelete = (item) => {
		setDeleteId(item.id);
		setAlertState('confirm');
		setConfirmMessage(`Apakah Anda yakin ingin menghapus "${item.judul}"?`);
		setShowAlert(true);
	};

	const handleConfirmAction = () => {
		setShowAlert(false);
		setConfirmMessage('');
		handleDelete();
		setDeleteId(null);
	};

	const handleFilter = () => {
		setListData([]);
		if (CurrentPage === 1) { getListPengumuman(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterKategori('');
		setListData([]);
		if (CurrentPage === 1) { getListPengumuman('reset'); } else { setCurrentPage(1); }
	};

	const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

	const handleExport = () => {
		const formatted = ListData.map((item) => ({
			'Judul': item.judul || '-',
			'Kategori': item.kategori || '-',
			'Isi': item.isi || '-',
			'Tanggal': item.tanggal_input || '-',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		const worksheet = XLSX.utils.json_to_sheet(formatted);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Pengumuman');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `export-pengumuman-${day}-${month}-${year}.xlsx`);
	};

	const kategoriLabel = (kategori) => {
		if (kategori === 'pengumuman') return <span className="admin-status-badge info">Pengumuman</span>;
		if (kategori === 'berita') return <span className="admin-status-badge active">Berita</span>;
		return <span className="admin-status-badge pending">{kategori}</span>;
	};

	const summaryCards = [
		{ title: 'Total Pengumuman', value: formatNumber(TotalPengumuman), description: 'Pengumuman cluster', icon: <FaBullhorn />, tone: 'blue' },
		{ title: 'Total Berita', value: formatNumber(TotalBerita), description: 'Berita cluster', icon: <FaNewspaper />, tone: 'green' },
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
				{ConfirmMessage !== '' && AlertState === 'confirm' && (
					<SweetAlert
						warning
						showCancel
						show={ShowAlert}
						confirmBtnText="Ya, Hapus"
						cancelBtnText="Batal"
						onConfirm={handleConfirmAction}
						onCancel={() => { setShowAlert(false); setConfirmMessage(''); setDeleteId(null); }}
						btnSize="sm"
					>
						{ConfirmMessage}
					</SweetAlert>
				)}

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Informasi Cluster</div>
						<h1>Pengumuman & Berita</h1>
						<p>Kelola pengumuman dan berita untuk warga cluster.</p>
					</div>
					<div style={{ display: 'flex', gap: 10 }}>
						<button className="admin-btn-primary" onClick={handleOpenInput}>
							<FaPlus /> Tambah Baru
						</button>
						<button className="admin-btn-secondary" onClick={handleExport} disabled={ListData.length === 0}>
							<FaFileDownload /> Export
						</button>
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
							<h2>Daftar Pengumuman & Berita</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari judul atau isi pengumuman..."
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
							/>
						</div>

						<select value={FilterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
							<option value="">Semua Kategori</option>
							<option value="pengumuman">Pengumuman</option>
							<option value="berita">Berita</option>
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
									<th>Judul</th>
									<th>Kategori</th>
									<th>Isi</th>
									<th>Tanggal</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListData?.length > 0 ? ListData.map((item, index) => (
									<tr key={item.id || index}>
										<td><strong>{item.judul || '-'}</strong></td>
										<td>{kategoriLabel(item.kategori)}</td>
										<td>
											<span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 300 }}>
												{item.isi || '-'}
											</span>
										</td>
										<td>{item.tanggal_input || '-'}</td>
										<td>
											<div style={{ display: 'flex', gap: 8 }}>
												<button className="admin-btn-icon" onClick={() => handleOpenEdit(item)} title="Edit">
													<FaEdit />
												</button>
												<button className="admin-btn-icon danger" onClick={() => handleConfirmDelete(item)} title="Hapus">
													<FaTrash />
												</button>
											</div>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={5}>
											<div className="admin-empty-state">
												<strong>Belum ada pengumuman atau berita</strong>
												<span>Klik tombol "Tambah Baru" untuk membuat pengumuman atau berita.</span>
												<button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={handleOpenInput}>
													<FaPlus /> Tambah Baru
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

				{/* Modal Input / Edit */}
				{ShowModal && (
					<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
						<div className="modal-dialog modal-dialog-centered modal-lg">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" style={{ fontWeight: 700 }}>
										{ModalMode === 'insert' ? 'Tambah Pengumuman / Berita' : 'Edit Pengumuman / Berita'}
									</h5>
									<button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
								</div>
								<div className="modal-body">
									<div className="mb-3">
										<label className="form-label">Kategori <span style={{ color: 'red' }}>*</span></label>
										<select
											className="form-select"
											value={FormData.kategori}
											onChange={(e) => setFormData({ ...FormData, kategori: e.target.value })}
										>
											<option value="pengumuman">Pengumuman</option>
											<option value="berita">Berita</option>
										</select>
									</div>
									<div className="mb-3">
										<label className="form-label">Judul <span style={{ color: 'red' }}>*</span></label>
										<input
											type="text"
											className="form-control"
											placeholder="Masukkan judul"
											value={FormData.judul}
											onChange={(e) => setFormData({ ...FormData, judul: e.target.value })}
										/>
									</div>
									<div className="mb-3">
										<label className="form-label">Isi <span style={{ color: 'red' }}>*</span></label>
										<textarea
											className="form-control"
											rows={5}
											placeholder="Masukkan isi pengumuman atau berita..."
											value={FormData.isi}
											onChange={(e) => setFormData({ ...FormData, isi: e.target.value })}
										/>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
										Batal
									</button>
									<button
										type="button"
										className="btn btn-primary"
										disabled={!FormData.judul.trim() || !FormData.isi.trim()}
										onClick={handleSubmit}
									>
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

export default PengumumanList;
