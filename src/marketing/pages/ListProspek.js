import React, { useCallback, useEffect, useState } from 'react';
import { useProspekData } from '../hooks/useProspekData';
import '../../styles/admin-shared.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  FaBuilding,
  FaCheckCircle,
  FaClipboardList,
  FaEdit,
  FaEye,
  FaFileDownload,
  FaFilter,
  FaHandshake,
  FaHourglassHalf,
  FaPhoneAlt,
  FaPlus,
  FaRedoAlt,
  FaSearch,
  FaTimesCircle,
  FaTrash,
  FaUserTie,
} from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../admin/utils';
import { fetchStatus, generateSignature } from '../../admin/utils/functions';

const STATUS_OPTIONS = [
  'Baru',
  'Tahap Awal',
  'Follow Up',
  'Negosiasi',
  'Proposal Penawaran',
  'Pending',
  'Close/Batal',
];

const emptyForm = {
  namaCluster: '',
  alamat: '',
  pic: '',
  noTelepon: '',
  jumlahRumah: '',
  tanggalKunjungan: '',
  keterangan: '',
  status: 'Baru',
};

const ListProspek = () => {
	const { prospekList, setProspekList, summary } = useProspekData();
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, setCookie, removeCookie] = useCookies(['user']);

	const [ListProspek, setListProspek] = useState([]);
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);

	const [TotalProspekAll, setTotalProspekAll] = useState(0);
	const [TotalProspekBaru, setTotalProspekBaru] = useState(0);
	const [TotalProspekBatal, setTotalProspekBatal] = useState(0);
	const [TotalProspekFollowUp, setTotalProspekFollowUp] = useState(0);
	const [TotalProspekNegosiasi, setTotalProspekNegosiasi] = useState(0);
	const [TotalProspekPending, setTotalProspekPending] = useState(0);
	const [TotalProspekProposal, setTotalProspekProposal] = useState(0);
	const [TotalProspekSukses, setTotalProspekSukses] = useState(0);

	const [LoadingProspek, setLoadingProspek] = useState(false);

	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState('add');
	const [form, setForm] = useState(emptyForm);
	const [editIndex, setEditIndex] = useState(null);
	const [showConfirm, setShowConfirm] = useState(false);
	const [deleteIndex, setDeleteIndex] = useState(null);

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');

  	const [Loading, setLoading] = useState(false);
	const [ShowAlert, setShowAlert] = useState(false);
	const [ErrorMessage, setErrorMessage] = useState('');
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

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

  	const getListProspek = useCallback((posisi = '') => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: "SELECT",
			page: 1,
			row_page: 10,
			order_by: "",
			order: ""
		});

		var url = paths.URL_API_MARKETING + 'Prospek';
		var Signature = generateSignature(requestBody);

		setLoadingProspek(true);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: { 
				'Content-Type': 'application/json', 
				Signature: Signature
			},
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingProspek(false);

				if (data.error_code === '0' || data.error_code === 0) {
					setListProspek(data.result || []);
					setTotalProspekAll(Number(data.total_prospek) || 0);
					setTotalProspekBaru(Number(data.total_prospek_baru) || 0);
					setTotalProspekBatal(Number(data.total_prospek_batal) || 0);
					setTotalProspekFollowUp(Number(data.total_prospek_follow_up) || 0);
					setTotalProspekNegosiasi(Number(data.total_prospek_negosiasi) || 0);
					setTotalProspekPending(Number(data.total_prospek_pending) || 0);
					setTotalProspekProposal(Number(data.total_prospek_proposal) || 0);
					setTotalProspekSukses(Number(data.total_prospek_sukses) || 0);

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
				setLoadingProspek(false);

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
			history.push('/marketing/login');
		} else {
			dispatch(setForm('ParamKey', cookieParamKey));
			dispatch(setForm('Username', cookieUsername));
			dispatch(setForm('PageActive', 'PROSPEK'));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListProspek('');
	}, [getListProspek]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const openAdd = () => {
		setForm(emptyForm);
		setModalMode('add');
		setShowModal(true);
	};

	const openView = (index) => {
		setForm(filteredList[index]);
		setModalMode('view');
		setShowModal(true);
	};

	const openEdit = (index) => {
		const realIndex = prospekList.indexOf(filteredList[index]);
		setForm(prospekList[realIndex]);
		setEditIndex(realIndex);
		setModalMode('edit');
		setShowModal(true);
	};

	const handleSave = () => {
		if (!form.namaCluster || !form.alamat) return;
		if (modalMode === 'add') {
		setProspekList([...prospekList, { ...form }]);
		} else if (modalMode === 'edit') {
		const updated = [...prospekList];
		updated[editIndex] = { ...form };
		setProspekList(updated);
		}
		setShowModal(false);
		setForm(emptyForm);
	};

	const confirmDelete = (index) => {
		const realIndex = prospekList.indexOf(filteredList[index]);
		setDeleteIndex(realIndex);
		setShowConfirm(true);
	};

	const handleDelete = () => {
		const updated = prospekList.filter((_, i) => i !== deleteIndex);
		setProspekList(updated);
		setShowConfirm(false);
		setDeleteIndex(null);
	};

	// Filter & Search
	const filteredList = prospekList.filter((item) => {
		const matchSearch = GlobalSearch === '' || 
		(item.namaCluster || '').toLowerCase().includes(GlobalSearch.toLowerCase()) ||
		(item.pic || '').toLowerCase().includes(GlobalSearch.toLowerCase()) ||
		(item.alamat || '').toLowerCase().includes(GlobalSearch.toLowerCase());
		const matchStatus = FilterStatus === '' || item.status === FilterStatus;
		return matchSearch && matchStatus;
	});

	const totalPage = Math.ceil(filteredList.length / RowPage) || 1;
	const paginatedList = filteredList.slice((CurrentPage - 1) * RowPage, CurrentPage * RowPage);

	const handleFilter = () => { setCurrentPage(1); };
	const handleReset = () => { setGlobalSearch(''); setFilterStatus(''); setCurrentPage(1); };

	const exportToExcel = () => {
		const ws = XLSX.utils.json_to_sheet(
		prospekList.map((p, i) => ({
			No: i + 1,
			'Nama Cluster': p.namaCluster,
			Alamat: p.alamat,
			PIC: p.pic,
			'No Telepon': p.noTelepon,
			'Jumlah Rumah': p.jumlahRumah,
			'Tanggal Kunjungan': p.tanggalKunjungan,
			Keterangan: p.keterangan,
			Status: p.status,
		}))
		);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Prospek');
		const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'data-prospek.xlsx');
	};

	const statusBadge = (status) => {
		switch (status) {
		case 'Baru': return <span className="admin-status-badge info">{status}</span>;
		case 'Tahap Awal': return <span className="admin-status-badge pending">{status}</span>;
		case 'Follow Up': return <span className="admin-status-badge active">{status}</span>;
		case 'Negosiasi': return <span className="admin-status-badge info">{status}</span>;
		case 'Proposal Penawaran': return <span className="admin-status-badge active">{status}</span>;
		case 'Pending': return <span className="admin-status-badge pending">{status}</span>;
		case 'Close/Batal': return <span className="admin-status-badge inactive">{status}</span>;
		default: return <span className="admin-status-badge info">{status}</span>;
		}
	};

	const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

	const summaryCards = [
		{ title: 'Total Prospek', value: formatNumber(summary.total), description: 'Seluruh data prospek', icon: <FaClipboardList />, tone: 'blue' },
		{ title: 'Baru', value: formatNumber(summary.baru), description: 'Prospek baru masuk', icon: <FaBuilding />, tone: 'green' },
		{ title: 'Follow Up', value: formatNumber(summary.followUp), description: 'Sedang ditindaklanjuti', icon: <FaPhoneAlt />, tone: 'purple' },
		{ title: 'Negosiasi', value: formatNumber(summary.negosiasi), description: 'Dalam proses negosiasi', icon: <FaHandshake />, tone: 'yellow' },
		{ title: 'Proposal', value: formatNumber(summary.proposal), description: 'Sudah kirim penawaran', icon: <FaUserTie />, tone: 'blue' },
		{ title: 'Pending', value: formatNumber(summary.pending), description: 'Menunggu keputusan', icon: <FaHourglassHalf />, tone: 'yellow' },
		{ title: 'Close/Batal', value: formatNumber(summary.close), description: 'Tidak dilanjutkan', icon: <FaTimesCircle />, tone: 'red' },
	];

	return (
		<div className="admin-page" style={{ padding: 0, margin: 0, background: '#f7faf9' }}>
			{/* Header */}
			<div className="admin-header">
				<div>
				<div className="admin-eyebrow">Manajemen Prospek</div>
				<h1>List Prospek</h1>
				<p>Pantau daftar prospek, jadwal kunjungan, dan status follow up.</p>
				</div>
				<div className="admin-header-actions">
				<button className="admin-btn-primary" onClick={openAdd}>
					<FaPlus /> Tambah Prospek
				</button>
				<button className="admin-btn-secondary" onClick={exportToExcel} disabled={prospekList.length === 0}>
					<FaFileDownload /> Export Data
				</button>
				</div>
			</div>

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

			{/* Table Panel */}
			<div className="admin-panel">
				<div className="admin-panel-header">
				<div>
					<h2>Daftar Prospek</h2>
					<p>Total data: {formatNumber(filteredList.length)}</p>
				</div>
				</div>

				<div className="admin-filter-grid">
				<div className="admin-search-field">
					<FaSearch />
					<input
					type="text"
					placeholder="Cari cluster, PIC, atau alamat..."
					value={GlobalSearch}
					onChange={(e) => setGlobalSearch(e.target.value)}
					onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
					/>
				</div>

				<select value={FilterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
					<option value="">Semua Status</option>
					{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
				</select>

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
						<th>Nama Cluster</th>
						<th>Detail</th>
						<th>PIC / Telepon</th>
						<th>Jadwal</th>
						<th>Status</th>
						<th>Aksi</th>
					</tr>
					</thead>
					<tbody>
					{paginatedList.length > 0 ? paginatedList.map((item, index) => (
						<tr key={index}>
						<td>
							<strong>{item.namaCluster || '-'}</strong>
							<span>{item.alamat || '-'}</span>
						</td>
						<td>
							<span>Jumlah Rumah: {item.jumlahRumah || '-'}</span>
							<span style={{ maxWidth: 200, display: 'block', whiteSpace: 'normal', color: '#6b7280' }}>{item.keterangan || '-'}</span>
						</td>
						<td>
							<strong>{item.pic || '-'}</strong>
							<span>{item.noTelepon || '-'}</span>
						</td>
						<td>
							<span>{item.tanggalKunjungan || '-'}</span>
						</td>
						<td>{statusBadge(item.status)}</td>
						<td>
							<div style={{ display: 'flex', gap: 6 }}>
							<button className="admin-btn-icon" onClick={() => openView(index)} title="Lihat Detail">
								<FaEye />
							</button>
							<button className="admin-btn-icon" onClick={() => openEdit(index)} title="Edit">
								<FaEdit />
							</button>
							<button className="admin-btn-icon danger" onClick={() => confirmDelete(index)} title="Hapus">
								<FaTrash />
							</button>
							</div>
						</td>
						</tr>
					)) : (
						<tr>
						<td colSpan={6}>
							<div className="admin-empty-state">
							<strong>Belum ada data prospek</strong>
							<span>Klik tombol "Tambah Prospek" untuk menambahkan data baru.</span>
							</div>
						</td>
						</tr>
					)}
					</tbody>
				</table>
				</div>

				{filteredList.length > 0 && (
				<div className="admin-footer">
					<div>Hal {CurrentPage} / {totalPage} — Total: {formatNumber(filteredList.length)}</div>
					<div style={{ display: 'flex', gap: 4 }}>
					<button className="btn btn-sm btn-outline-secondary" disabled={CurrentPage <= 1} onClick={() => setCurrentPage(CurrentPage - 1)}>←</button>
					<button className="btn btn-sm btn-outline-secondary" disabled={CurrentPage >= totalPage} onClick={() => setCurrentPage(CurrentPage + 1)}>→</button>
					</div>
				</div>
				)}
			</div>

			{/* Modal Form / View */}
			{showModal && (
				<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
				<div className="modal-dialog modal-dialog-centered modal-lg">
					<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title" style={{ fontWeight: 700 }}>
						{modalMode === 'add' ? 'Tambah Prospek' : modalMode === 'edit' ? 'Edit Prospek' : 'Detail Prospek'}
						</h5>
						<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
					</div>
					<div className="modal-body">
						<div className="row">
						<div className="col-md-6 mb-3">
							<label className="form-label">Nama Cluster <span style={{ color: 'red' }}>*</span></label>
							<input className="form-control" name="namaCluster" value={form.namaCluster} onChange={handleChange} disabled={modalMode === 'view'} />
						</div>
						<div className="col-md-6 mb-3">
							<label className="form-label">Alamat <span style={{ color: 'red' }}>*</span></label>
							<input className="form-control" name="alamat" value={form.alamat} onChange={handleChange} disabled={modalMode === 'view'} />
						</div>
						<div className="col-md-6 mb-3">
							<label className="form-label">PIC yang Ditemui</label>
							<input className="form-control" name="pic" value={form.pic} onChange={handleChange} disabled={modalMode === 'view'} />
						</div>
						<div className="col-md-6 mb-3">
							<label className="form-label">No Telepon</label>
							<input className="form-control" name="noTelepon" value={form.noTelepon} onChange={handleChange} disabled={modalMode === 'view'} />
						</div>
						<div className="col-md-4 mb-3">
							<label className="form-label">Jumlah Rumah</label>
							<input className="form-control" name="jumlahRumah" type="number" value={form.jumlahRumah} onChange={handleChange} disabled={modalMode === 'view'} />
						</div>
						<div className="col-md-4 mb-3">
							<label className="form-label">Tanggal Kunjungan</label>
							<input className="form-control" name="tanggalKunjungan" type="date" value={form.tanggalKunjungan} onChange={handleChange} disabled={modalMode === 'view'} />
						</div>
						<div className="col-md-4 mb-3">
							<label className="form-label">Status</label>
							<select className="form-select" name="status" value={form.status} onChange={handleChange} disabled={modalMode === 'view'}>
							{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
							</select>
						</div>
						<div className="col-md-12 mb-3">
							<label className="form-label">Keterangan</label>
							<textarea className="form-control" name="keterangan" value={form.keterangan} onChange={handleChange} disabled={modalMode === 'view'} rows={3} />
						</div>
						</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
						{modalMode === 'view' ? 'Tutup' : 'Batal'}
						</button>
						{modalMode !== 'view' && (
						<button type="button" className="btn btn-primary" onClick={handleSave} disabled={!form.namaCluster || !form.alamat}>
							Simpan
						</button>
						)}
					</div>
					</div>
				</div>
				</div>
			)}

			{/* Confirm Delete */}
			{showConfirm && (
				<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
				<div className="modal-dialog modal-dialog-centered modal-sm">
					<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title" style={{ fontWeight: 700 }}>Konfirmasi Hapus</h5>
						<button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
					</div>
					<div className="modal-body">
						<p>Apakah Anda yakin ingin menghapus data prospek ini?</p>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Batal</button>
						<button type="button" className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
					</div>
					</div>
				</div>
				</div>
			)}
		</div>
	);
};

export default ListProspek;
