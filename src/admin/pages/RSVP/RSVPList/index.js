import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import './rsvp-list.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
	FaCalendarCheck,
	FaCarSide,
	FaCheckCircle,
	FaClock,
	FaFileDownload,
	FaFilter,
	FaIdBadge,
	FaPhoneAlt,
	FaQrcode,
	FaRedoAlt,
	FaSearch,
	FaTimesCircle,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination } from '../../../components';

const RSVPList = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListRSVP, setListRSVP] = useState([])
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1)
	const [TotalRecords, setTotalRecords] = useState(0)
	const [LoadingRSVP, setLoadingRSVP] = useState(false)

	const [ShowAlert, setShowAlert] = useState(true)
	const [SessionMessage, setSessionMessage] = useState("")
	const [SuccessMessage, setSuccessMessage] = useState("")
	const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [StartDate, setStartDate] = useState('');
	const [EndDate, setEndDate] = useState('');
	const [FilterMonth, setFilterMonth] = useState('');

	// State untuk popup QR Code
	const [ShowQRModal, setShowQRModal] = useState(false);
	const [SelectedRSVP, setSelectedRSVP] = useState(null);

	const getCookie = useCallback((tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie == "string") {
			var LongSecretCookie = SecretCookie.split("|");
			var username = LongSecretCookie[0];
			var paramKey = LongSecretCookie[1];
			var accessLogin = parseInt(LongSecretCookie[2]);
			var accessName = LongSecretCookie[3];
			var cluster = LongSecretCookie[4];
			var clusterId = LongSecretCookie[5];

			if (tipe === "username") {
				return username;
			} else if (tipe === "paramkey") {
				return paramKey;
			} else if (tipe === "access") {
				return accessLogin;
			} else if (tipe === "access_name") {
				return accessName;
			} else if (tipe === "cluster") {
				return cluster;
			} else if (tipe === "cluster_id") {
				return clusterId;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}, [cookies.varCookie])

	const logout = useCallback(() => {
		removeCookie('varCookie', { path: '/'})
		removeCookie('varMerchantId', { path: '/'})
		removeCookie('varIdVoucher', { path: '/'})
		removeCookie('varCookieFasilitasId', { path: '/'})
		removeCookie('varCookieDonasiId', { path: '/'})

		dispatch(setForm("ParamKey",''))
		dispatch(setForm("Username",''))
		dispatch(setForm("Name",''))
		dispatch(setForm("Role",''))
		if (window) {
			sessionStorage.clear();
		}
	}, [dispatch, removeCookie])

	const getListRSVP = useCallback((posisi = "") => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		var cookieAccessLogin = getCookie("access");
		var cookieClusterId = Number(getCookie("cluster_id")) || 0;

		let globalSearch = GlobalSearch
		let filterStatus = FilterStatus
		let startDate = StartDate
		let endDate = EndDate
		let filterMonth = FilterMonth

		if (posisi === "reset") {
			globalSearch = ""
			filterStatus = ""
			startDate = ""
			endDate = ""
			filterMonth = ""
		}

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"access": cookieAccessLogin,
			"cluster_id": cookieClusterId,
			"global_search": globalSearch,
			"status": filterStatus,
			"start_date": startDate,
			"end_date": endDate,
			"filter_month": filterMonth,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingRSVP(true)

		var url = paths.URL_API_ADMIN + 'RSVP';
		var Signature  = generateSignature(requestBody)

		fetch(url, {
			method: "POST",
			body: requestBody,
			headers: {
				'Content-Type': 'application/json',
				'Signature': Signature
			},
		})
		.then(fetchStatus)
		.then(response => response.json())
		.then((data) => {
			setLoadingRSVP(false)

			if (data.error_code === '0' || data.error_code === 0) {
				setListRSVP(data.result || [])
				setTotalPage(Number(data.total_page) || 1)
				setTotalRecords(Number(data.total_record) || 0)
				return
			} else {
				if (data.error_code === '2' || data.error_code === 2) {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
					return;
				} else {
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
					return;
				}
			}
		})
		.catch((error) => {
			setLoadingRSVP(false)

			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				setShowAlert(true);
				return false;
			} else if (error.message !== 401) {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
				return false;
			}
		});
	}, [CurrentPage, EndDate, FilterMonth, FilterStatus, GlobalSearch, RowPage, StartDate, getCookie])

	useEffect(() => {
		window.scrollTo(0, 0)

		var cookieParamKey = getCookie("paramkey");
		var cookieUsername = getCookie("username");

		if (cookieParamKey === null || cookieParamKey === "" || cookieUsername === null || cookieUsername === "") {
			history.push("/admin/login");
		} else {
			dispatch(setForm("ParamKey", cookieParamKey))
			dispatch(setForm("Username", cookieUsername))
			dispatch(setForm("PageActive", "RSVP"))
		}
	}, [dispatch, getCookie, history])

	useEffect(() => {
		getListRSVP("");
	}, [getListRSVP]);

	const activeCount = useMemo(() => {
		return ListRSVP.filter((item) => Number(item.status) === 1).length;
	}, [ListRSVP])

	const inactiveCount = useMemo(() => {
		return ListRSVP.filter((item) => Number(item.status) === 0).length;
	}, [ListRSVP])

	const todayCount = useMemo(() => {
		const today = new Date().toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
		return ListRSVP.filter((item) => item.tanggal_kunjungan === today).length;
	}, [ListRSVP])

	const summaryCards = [
		{
			title: "Total RSVP",
			value: TotalRecords,
			description: "Seluruh undangan tamu",
			icon: <FaCalendarCheck />,
			tone: "blue",
		},
		{
			title: "Aktif",
			value: activeCount,
			description: "Data pada halaman ini",
			icon: <FaCheckCircle />,
			tone: "green",
		},
		{
			title: "Tidak Aktif",
			value: inactiveCount,
			description: "Data pada halaman ini",
			icon: <FaTimesCircle />,
			tone: "red",
		},
		{
			title: "Kunjungan Hari Ini",
			value: todayCount,
			description: "Data pada halaman ini",
			icon: <FaClock />,
			tone: "yellow",
		},
	]

	const formatNumber = (value) => {
		return new Intl.NumberFormat("id-ID").format(value || 0);
	}

	const statusBadge = (status) => {
		if (Number(status) === 1) {
			return <span className="rsvp-status-badge active">Aktif</span>
		}

		return <span className="rsvp-status-badge inactive">Tidak Aktif</span>
	};

	const exportToExcel = (data, fileName = "data") => {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "RSVP Tamu");

		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});

		const fileData = new Blob([excelBuffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(fileData, `${fileName}.xlsx`);
	};

	const handleExport = () => {
		const formatted = ListRSVP.map((item) => ({
			"Kode Undangan": item.kode_undangan || "-",
			"Nama Warga": item.nama || "-",
			"Cluster": item.cluster || "-",
			"Kategori Tamu": item.kategori_tamu || "-",
			"Jumlah Tamu": item.jumlah_tamu || 0,
			"Nama Tamu": item.nama_tamu || "-",
			"Nomor HP": item.nomor_hp || "-",
			"Tanggal Kunjungan": item.tanggal_kunjungan || "-",
			"Jam Kunjungan": item.jam_kunjungan || "-",
			"Keperluan": item.keperluan || "-",
			"Kendaraan": item.kendaraan || "-",
			"Status": Number(item.status) === 1 ? "Aktif" : "Tidak Aktif",
			"Tanggal Input": item.tanggal_input || "-",
		}));

		const now = new Date();
		const day = String(now.getDate()).padStart(2, "0");
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const year = now.getFullYear();

		exportToExcel(formatted, `export-rsvp-tamu-${day}-${month}-${year}`);
	};

	const handleFilter = () => {
		setListRSVP([])
		if (CurrentPage === 1) {
			getListRSVP("")
		} else {
			setCurrentPage(1)
		}
	}

	const handleReset = () => {
		setGlobalSearch("")
		setFilterStatus("")
		setStartDate("")
		setEndDate("")
		setFilterMonth("")
		setListRSVP([])
		if (CurrentPage === 1) {
			getListRSVP("reset")
		} else {
			setCurrentPage(1)
		}
	}

	const handleViewDetail = (item) => {
		setSelectedRSVP(item);
		setShowQRModal(true);
	}

	return (
		<>
			{LoadingRSVP && <LoadingLogo />}

			<div className="rsvp-page">
				{SessionMessage !== "" ?
				<SweetAlert
					warning
					show={ShowAlert}
					onConfirm={() => {
						setShowAlert(false)
						logout()
						history.push("/admin/login");
					}}
					btnSize="sm">
					{SessionMessage}
				</SweetAlert>
				:""}

				{SuccessMessage !== "" ?
				<SweetAlert
					success
					show={ShowAlert}
					onConfirm={() => {
						setShowAlert(false)
						setSuccessMessage("")
						history.replace("/admin/rsvp")
					}}
					btnSize="sm">
					{SuccessMessage}
				</SweetAlert>
				:""}

				{ErrorMessageAlert !== "" ?
				<SweetAlert
					danger
					show={ShowAlert}
					onConfirm={() => {
						setShowAlert(false)
						setErrorMessageAlert("")
					}}
					btnSize="sm">
					{ErrorMessageAlert}
				</SweetAlert>
				:""}

				{ErrorMessageAlertLogout !== "" ?
				<SweetAlert
					danger
					show={ShowAlert}
					onConfirm={() => {
						setShowAlert(false)
						setErrorMessageAlertLogout("")
						history.push("/admin/login");
					}}
					btnSize="sm">
					{ErrorMessageAlertLogout}
				</SweetAlert>
				:""}

				<div className="rsvp-header">
					<div>
						<div className="rsvp-eyebrow">Manajemen Tamu</div>
						<h1>RSVP Tamu</h1>
						<p>Pantau daftar undangan, jadwal kunjungan, dan status QR tamu warga.</p>
					</div>
					<button className="rsvp-export-primary" onClick={handleExport} disabled={ListRSVP.length === 0}>
						<FaFileDownload /> Export Data
					</button>
				</div>

				<div className="rsvp-summary-grid">
					{summaryCards.map((item) => (
						<div className={`rsvp-summary-card ${item.tone}`} key={item.title}>
							<div>
								<span>{item.title}</span>
								<strong>{formatNumber(item.value)}</strong>
								<small>{item.description}</small>
							</div>
							<div className="rsvp-summary-icon">{item.icon}</div>
						</div>
					))}
				</div>

				<div className="rsvp-panel">
					<div className="rsvp-panel-header">
						<div>
							<h2>Daftar RSVP Tamu</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="rsvp-filter-grid">
						<div className="rsvp-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari kode, nama warga, cluster, no rumah, atau tamu"
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleFilter()
									}
								}}
							/>
						</div>

						<select
							value={FilterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
						>
							<option value="">Semua Status</option>
							<option value="1">Aktif</option>
							<option value="0">Tidak Aktif</option>
						</select>

						<select
							value={FilterMonth}
							onChange={(e) => setFilterMonth(e.target.value)}
						>
							<option value="">Semua Periode</option>
							<option value="YTD">Tahun Ini</option>
							<option value="1">1 Bulan Terakhir</option>
							<option value="3">3 Bulan Terakhir</option>
							<option value="6">6 Bulan Terakhir</option>
						</select>

						<input
							type="date"
							value={StartDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>

						<input
							type="date"
							value={EndDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>

						<button className="rsvp-btn-filter" onClick={handleFilter}>
							<FaFilter /> Filter
						</button>

						<button className="rsvp-btn-reset" onClick={handleReset}>
							<FaRedoAlt /> Reset
						</button>
					</div>

					<div className="table-responsive rsvp-table-wrap">
						<table className="table rsvp-table align-top">
							<thead>
								<tr>
									<th>Kode Undangan</th>
									<th>Warga</th>
									<th>Detail Tamu</th>
									<th>Jadwal</th>
									<th>Keperluan</th>
									<th>Status</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListRSVP?.length > 0 ? ListRSVP.map((item, index) => (
									<tr key={item.id || index}>
										<td>
											<div className="rsvp-code">
												<FaIdBadge />
												<span>{item.kode_undangan || "-"}</span>
											</div>
											<small>Dibuat: {item.tanggal_input || "-"}</small>
										</td>
										<td>
											<strong>{item.nama || "-"}</strong>
											<span>{item.cluster || "-"}</span>
										</td>
										<td>
											<strong>{item.nama_tamu || "-"}</strong>
											<span>{item.kategori_tamu || "-"} • {formatNumber(item.jumlah_tamu)} tamu</span>
											{item.nomor_hp &&
											<a href={`tel:${item.nomor_hp}`} className="rsvp-phone">
												<FaPhoneAlt /> {item.nomor_hp}
											</a>}
										</td>
										<td>
											<strong>{item.tanggal_kunjungan || "-"}</strong>
											<span>{item.jam_kunjungan || "-"}</span>
										</td>
										<td>
											<strong>{item.keperluan || "-"}</strong>
											<span className="rsvp-vehicle">
												<FaCarSide /> {item.kendaraan || "Tanpa kendaraan"}
											</span>
										</td>
										<td>{statusBadge(item.status)}</td>
										<td>
											<button
												className="rsvp-btn-view"
												onClick={() => handleViewDetail(item)}
												title="Lihat QR Code"
											>
												<FaQrcode />
											</button>
										</td>
									</tr>
								))
								:
								<tr>
									<td colSpan={7}>
										<div className="rsvp-empty-state">
											<strong>RSVP tamu tidak ditemukan</strong>
											<span>Coba ubah filter atau kata pencarian.</span>
										</div>
									</td>
								</tr>
								}
							</tbody>
						</table>
					</div>

					<div className="rsvp-footer">
						<div>Total Data : {formatNumber(TotalRecords)}</div>
						<Pagination
							currentPage={CurrentPage}
							totalPage={Math.max(Number(TotalPage) || 1, 1)}
							onPageChange={(page) => {
								if (!LoadingRSVP) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>

				{/* Modal QR Code */}
				{ShowQRModal && SelectedRSVP && (
					<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
						<div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
							<div className="modal-content" style={{ borderRadius: 16 }}>
								<div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
									<h5 className="modal-title" style={{ fontWeight: 700 }}>QR Code Undangan</h5>
									<button type="button" className="btn-close" onClick={() => { setShowQRModal(false); setSelectedRSVP(null); }}></button>
								</div>
								<div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 32px 32px' }}>
									<div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '2px solid #e5e7eb', marginBottom: 16 }}>
										<img
											src={"https://api.ipl-q.com/api/v1/rsvp/qr/" + SelectedRSVP.kode_undangan}
											alt={`QR Code - ${SelectedRSVP.kode_undangan || ''}`}
											style={{ width: 220, height: 220, objectFit: 'contain' }}
											onError={(e) => { e.target.style.display = 'none'; }}
										/>
									</div>
									<div style={{ textAlign: 'center' }}>
										<strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
											{SelectedRSVP.kode_undangan || '-'}
										</strong>
										<span style={{ color: '#6b7280', fontSize: 14 }}>
											{SelectedRSVP.nama_tamu || '-'} • {SelectedRSVP.tanggal_kunjungan || '-'}
										</span>
									</div>
								</div>
								<div className="modal-footer" style={{ borderTop: 'none', justifyContent: 'center', paddingTop: 0 }}>
									<button type="button" className="btn btn-secondary" onClick={() => { setShowQRModal(false); setSelectedRSVP(null); }}>
										Tutup
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default RSVPList;
