import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import '../../../../styles/admin-shared.css';
import '../MenuAdmin/menu-admin.css';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils';
import { generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
	FaBars,
	FaEdit,
	FaFileDownload,
	FaFilter,
	FaMobileAlt,
	FaPlus,
	FaRedoAlt,
	FaSearch,
	FaTimes,
	FaTrash,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const MenuAplikasi = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListMenu, setListMenu] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(20);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);

	const [LoadingMenu, setLoadingMenu] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');

	// Modal state
	const [ShowModal, setShowModal] = useState(false);
	const [ModalMode, setModalMode] = useState('add');
	const [EditId, setEditId] = useState(null);
	const [FormMenu, setFormMenu] = useState('');
	const [FormHrefPage, setFormHrefPage] = useState('');
	const [FormPageActive, setFormPageActive] = useState('');
	const [FormIcon, setFormIcon] = useState('');
	const [FormUrutan, setFormUrutan] = useState('');
	const [FormStatus, setFormStatus] = useState('1');

	// Delete confirmation
	const [ShowConfirmDelete, setShowConfirmDelete] = useState(false);
	const [DeleteId, setDeleteId] = useState(null);
	const [DeleteName, setDeleteName] = useState('');

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

	const getListMenu = useCallback((posisi = '') => {
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
			tipe_menu: 'aplikasi',
			global_search: globalSearch,
			status: filterStatus,
			page: CurrentPage,
			row_page: RowPage,
			order_by: 'urutan',
			order: 'ASC',
		});

		setLoadingMenu(true);

		var url = paths.URL_API_ADMIN + 'ManajemenMenu';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingMenu(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setListMenu(data.result || []);
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
				setLoadingMenu(false);
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
			dispatch(setForm('PageActive', 'MENU_APLIKASI'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListMenu('');
	}, [getListMenu]);

	const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

	const statusBadge = (status) => {
		if (Number(status) === 1) return <span className="admin-status-badge active">Aktif</span>;
		return <span className="admin-status-badge inactive">Tidak Aktif</span>;
	};

	const handleFilter = () => {
		setListMenu([]);
		if (CurrentPage === 1) { getListMenu(''); } else { setCurrentPage(1); }
	};

	const handleReset = () => {
		setGlobalSearch('');
		setFilterStatus('');
		setListMenu([]);
		if (CurrentPage === 1) { getListMenu('reset'); } else { setCurrentPage(1); }
	};

	// --- Modal ---
	const resetForm = () => {
		setEditId(null);
		setFormMenu('');
		setFormHrefPage('');
		setFormPageActive('');
		setFormIcon('');
		setFormUrutan('');
		setFormStatus('1');
	};

	const handleOpenAdd = () => {
		resetForm();
		setModalMode('add');
		setShowModal(true);
	};

	const handleOpenEdit = (item) => {
		setEditId(item.id);
		setFormMenu(item.menu || item.nama_menu || '');
		setFormHrefPage(item.href_page || item.route || '');
		setFormPageActive(item.page_active || '');
		setFormIcon(item.icon || '');
		setFormUrutan(String(item.urutan || ''));
		setFormStatus(String(item.status ?? '1'));
		setModalMode('edit');
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		resetForm();
	};

	const handleSubmitModal = () => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		const method = ModalMode === 'add' ? 'INSERT' : 'UPDATE';

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: method,
			tipe_menu: 'aplikasi',
			...(ModalMode === 'edit' && { id: parseInt(EditId) }),
			menu: FormMenu,
			href_page: FormHrefPage,
			page_active: FormPageActive,
			icon: FormIcon,
			urutan: parseInt(FormUrutan) || 0,
			status: parseInt(FormStatus),
		});

		setLoadingMenu(true);

		var url = paths.URL_API_ADMIN + 'ManajemenMenu';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingMenu(false);
				if (data.error_code === '0' || data.error_code === 0) {
					handleCloseModal();
					setSuccessMessage(ModalMode === 'add' ? 'Menu aplikasi berhasil ditambahkan.' : 'Menu aplikasi berhasil diperbarui.');
					setShowAlert(true);
					getListMenu('');
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
					} else {
						setErrorMessageAlert(data.error_message || 'Gagal menyimpan data.');
					}
					setShowAlert(true);
				}
			})
			.catch((error) => {
				setLoadingMenu(false);
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			});
	};

	// --- Delete ---
	const handleOpenDelete = (item) => {
		setDeleteId(item.id);
		setDeleteName(item.menu || item.nama_menu || 'Menu');
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
		setLoadingMenu(true);

		var url = paths.URL_API_ADMIN + 'ManajemenMenu';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 'Content-Type': 'application/json', Signature: Signature },
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingMenu(false);
				if (data.error_code === '0' || data.error_code === 0) {
					setSuccessMessage('Menu aplikasi berhasil dihapus.');
					setShowAlert(true);
					getListMenu('');
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
					} else {
						setErrorMessageAlert(data.error_message || 'Gagal menghapus data.');
					}
					setShowAlert(true);
				}
			})
			.catch((error) => {
				setLoadingMenu(false);
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			});
	};

	// --- Export ---
	const handleExport = () => {
		const formatted = ListMenu.map((item) => ({
			'Nama Menu': item.menu || item.nama_menu || '-',
			'Route / Halaman': item.href_page || item.route || '-',
			Icon: item.icon || '-',
			Urutan: item.urutan || 0,
			Status: Number(item.status) === 1 ? 'Aktif' : 'Tidak Aktif',
		}));
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		const worksheet = XLSX.utils.json_to_sheet(formatted);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu Aplikasi');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		saveAs(fileData, `export-menu-aplikasi-${day}-${month}-${year}.xlsx`);
	};

	return (
		<>
			{LoadingMenu && <LoadingLogo />}

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

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Manajemen Menu</div>
						<h1>Menu Aplikasi</h1>
						<p>Kelola daftar menu navigasi untuk aplikasi mobile warga.</p>
					</div>
					<div className="admin-header-actions">
						<button className="admin-btn-primary" onClick={handleOpenAdd}>
							<FaPlus /> Tambah Menu
						</button>
						<button className="admin-btn-secondary" onClick={handleExport} disabled={ListMenu.length === 0}>
							<FaFileDownload /> Export
						</button>
					</div>
				</div>

				<div className="admin-summary-grid cols-2">
					<div className="admin-summary-card blue">
						<div>
							<span>Total Menu Aplikasi</span>
							<strong>{formatNumber(TotalRecords)}</strong>
							<small>Menu untuk aplikasi warga</small>
						</div>
						<div className="admin-summary-icon"><FaMobileAlt /></div>
					</div>
					<div className="admin-summary-card green">
						<div>
							<span>Menu Aktif</span>
							<strong>{formatNumber(ListMenu.filter(m => Number(m.status) === 1).length)}</strong>
							<small>Ditampilkan di aplikasi</small>
						</div>
						<div className="admin-summary-icon"><FaBars /></div>
					</div>
				</div>

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Menu Aplikasi</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari nama menu..."
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
									<th style={{ width: 50 }}>#</th>
									<th>Nama Menu</th>
									<th>Route / Halaman</th>
									<th>Icon</th>
									<th style={{ width: 80 }}>Urutan</th>
									<th>Status</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListMenu?.length > 0 ? ListMenu.map((item, index) => (
									<tr key={item.id || index}>
										<td style={{ textAlign: 'center', color: '#94a3b8' }}>{index + 1}</td>
										<td><strong>{item.menu || item.nama_menu || '-'}</strong></td>
										<td><code className="menu-href">{item.href_page || item.route || '-'}</code></td>
										<td><code className="menu-href">{item.icon || '-'}</code></td>
										<td style={{ textAlign: 'center' }}>{item.urutan || '-'}</td>
										<td>{statusBadge(item.status)}</td>
										<td>
											<div style={{ display: 'flex', gap: 6 }}>
												<button className="admin-btn-icon" onClick={() => handleOpenEdit(item)} title="Edit">
													<FaEdit />
												</button>
												<button className="admin-btn-icon danger" onClick={() => handleOpenDelete(item)} title="Hapus">
													<FaTrash />
												</button>
											</div>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={7}>
											<div className="admin-empty-state">
												<strong>Menu aplikasi tidak ditemukan</strong>
												<span>Coba ubah filter atau tambah menu baru.</span>
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
							onPageChange={(page) => { if (!LoadingMenu) setCurrentPage(page); }}
						/>
					</div>
				</div>

				{/* Modal Add/Edit Menu */}
				{ShowModal && (
					<div className="menu-modal-overlay" onClick={handleCloseModal}>
						<div className="menu-modal" onClick={(e) => e.stopPropagation()}>
							<div className="menu-modal-header">
								<h3>{ModalMode === 'add' ? 'Tambah Menu Aplikasi' : 'Edit Menu Aplikasi'}</h3>
								<button className="menu-modal-close" onClick={handleCloseModal}><FaTimes /></button>
							</div>
							<div className="menu-modal-body">
								<div className="menu-modal-field">
									<label>Nama Menu</label>
									<input type="text" value={FormMenu} onChange={(e) => setFormMenu(e.target.value)} placeholder="Contoh: Beranda" />
								</div>
								<div className="menu-modal-field">
									<label>Route / Halaman</label>
									<input type="text" value={FormHrefPage} onChange={(e) => setFormHrefPage(e.target.value)} placeholder="Contoh: /home" />
								</div>
								<div className="menu-modal-row">
									<div className="menu-modal-field">
										<label>Icon</label>
										<input type="text" value={FormIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="Contoh: ic_home" />
									</div>
									<div className="menu-modal-field">
										<label>Urutan</label>
										<input type="number" value={FormUrutan} onChange={(e) => setFormUrutan(e.target.value)} placeholder="1" />
									</div>
								</div>
								<div className="menu-modal-field">
									<label>Status</label>
									<select value={FormStatus} onChange={(e) => setFormStatus(e.target.value)}>
										<option value="1">Aktif</option>
										<option value="0">Tidak Aktif</option>
									</select>
								</div>
							</div>
							<div className="menu-modal-footer">
								<button className="admin-btn-secondary" onClick={handleCloseModal}>Batal</button>
								<button className="admin-btn-primary" onClick={handleSubmitModal}>
									{ModalMode === 'add' ? 'Tambah Menu' : 'Simpan Perubahan'}
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
						Apakah Anda yakin ingin menghapus menu <strong>{DeleteName}</strong>?
					</SweetAlert>
				)}
			</div>
		</>
	);
};

export default MenuAplikasi;
