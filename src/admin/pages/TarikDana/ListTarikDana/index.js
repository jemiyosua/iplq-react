import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils';
import { generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { Pagination, ModalInputPengajuan, Alert } from '../../../components';
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import '../../../../styles/admin-shared.css';
import './tarik-dana-step.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
	FaClock,
	FaCheckCircle,
	FaMoneyBillWave,
	FaFileDownload,
	FaFilter,
	FaRedoAlt,
	FaSearch,
	FaEye,
	FaPlus,
	FaExchangeAlt,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ListTarikDana = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListData, setListData] = useState([]);
	const [ListNomorRekening, setListNomorRekening] = useState([]);

	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);

	const [TotalMenungguPersetujuan, setTotalMenungguPersetujuan] = useState(0);
	const [TotalDisetujui, setTotalDisetujui] = useState(0);
	const [TotalCair, setTotalCair] = useState(0);

	const [Loading, setLoading] = useState(false);
	const [ShowModalInputPengajuan, setShowModalInputPengajuan] = useState(false);

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterJenisTransaksi, setFilterJenisTransaksi] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');

	// Alert state
	const [AlertState, setAlertState] = useState("");
	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState("");
	const [SuccessMessage, setSuccessMessage] = useState("");
	const [ErrorMessageAlert, setErrorMessageAlert] = useState("");
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("");
	const [ValidationMessage, setValidationMessage] = useState("");
	const [ConfirmMessage, setConfirmMessage] = useState("");

	// Form state
	const [Keperluan, setKeperluan] = useState("");
	const [Jumlah, setJumlah] = useState("");
	const [RekeningTujuan, setRekeningTujuan] = useState("");
	const [IdTarikDana, setIdTarikDana] = useState(0);

	// State untuk update status pengajuan
	const [ShowModalUpdateStatus, setShowModalUpdateStatus] = useState(false);
	const [SelectedPengajuan, setSelectedPengajuan] = useState(null);
	const [NewStatus, setNewStatus] = useState("");

	const steps = [1, 2, 3];

	const getCookie = useCallback((tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie === "string") {
			var LongSecretCookie = SecretCookie.split("|");
			var username = LongSecretCookie[0];
			var paramKey = LongSecretCookie[1];
			var accessLogin = parseInt(LongSecretCookie[2]);
			var accessName = LongSecretCookie[3];
			var cluster = LongSecretCookie[4];
			var clusterId = LongSecretCookie[5];

			if (tipe === "username") return username;
			if (tipe === "paramkey") return paramKey;
			if (tipe === "access") return accessLogin;
			if (tipe === "access_name") return accessName;
			if (tipe === "cluster") return cluster;
			if (tipe === "cluster_id") return clusterId;
			return null;
		}
		return null;
	}, [cookies.varCookie]);

	const logout = useCallback(() => {
		removeCookie('varCookie', { path: '/' });
		removeCookie('varMerchantId', { path: '/' });
		removeCookie('varIdVoucher', { path: '/' });
		dispatch(setForm("ParamKey", ''));
		dispatch(setForm("Username", ''));
		dispatch(setForm("Name", ''));
		dispatch(setForm("Role", ''));
		if (window) {
			sessionStorage.clear();
		}
	}, [dispatch, removeCookie]);

	const getListTarikDana = useCallback((posisi = "") => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		let globalSearch = GlobalSearch;
		let filterJenisTransaksi = FilterJenisTransaksi;
		let filterBulan = FilterBulan;

		if (posisi === "reset") {
			globalSearch = "";
			filterJenisTransaksi = "";
			filterBulan = "";
		}

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"bulan_laporan": filterBulan,
			"global_search": globalSearch,
			"status": filterJenisTransaksi,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'TarikDana';
		var Signature = generateSignature(requestBody);

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
			setLoading(false);

			if (data.error_code === '0' || data.error_code === 0) {
				setListData(data.result || []);
				setTotalMenungguPersetujuan(data.total_menungggu_persetujuan || 0);
				setTotalDisetujui(data.total_disetujui || 0);
				setTotalCair(data.total_tercairkan || 0);
				setTotalPage(Number(data.total_page) || 1);
				setTotalRecords(Number(data.total_record) || 0);
			} else {
				if (data.error_code === '2' || data.error_code === 2) {
					setAlertState("session");
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
				} else {
					setAlertState("error");
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
				}
			}
		})
		.catch((error) => {
			setLoading(false);
			setAlertState("error");

			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
			}
			setShowAlert(true);
		});
	}, [CurrentPage, FilterBulan, FilterJenisTransaksi, GlobalSearch, RowPage, getCookie]);

	const getListNomorRekening = useCallback(() => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"page": 1,
			"row_page": -1,
			"order_by": "",
			"order": ""
		});

		var url = paths.URL_API_ADMIN + 'Bank';
		var Signature = generateSignature(requestBody);

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
			if (data.error_code === "0") {
				setListNomorRekening(data.result || []);
			} else {
				if (data.error_code === "2") {
					setAlertState("session");
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
				} else {
					setAlertState("error");
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
				}
			}
		})
		.catch((error) => {
			setAlertState("error");
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
			}
			setShowAlert(true);
		});
	}, [getCookie]);

	const handleInputPengajuan = useCallback(() => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "INSERT",
			"keperluan": Keperluan,
			"jumlah": parseInt(Jumlah),
			"rekening_tujuan": parseInt(RekeningTujuan)
		});

		var url = paths.URL_API_ADMIN + 'TarikDana';
		var Signature = generateSignature(requestBody);

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
			if (data.error_code === "0") {
				getListTarikDana();
				setShowModalInputPengajuan(false);
				setKeperluan("");
				setJumlah("");
				setRekeningTujuan("");
				setAlertState("success");
				setSuccessMessage("Pengajuan berhasil disubmit");
				setShowAlert(true);
			} else {
				if (data.error_code === "2") {
					setAlertState("session");
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
				} else {
					setAlertState("error");
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
				}
			}
		})
		.catch((error) => {
			setAlertState("error");
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
			}
			setShowAlert(true);
		});
	}, [getCookie, Keperluan, Jumlah, RekeningTujuan, getListTarikDana]);

	const handleDelete = useCallback(() => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "DELETE",
			"id": parseInt(IdTarikDana)
		});

		var url = paths.URL_API_ADMIN + 'LaporanKeuangan';
		var Signature = generateSignature(requestBody);

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
			if (data.error_code === "0") {
				getListTarikDana();
				setAlertState("success");
				setSuccessMessage("Data berhasil dihapus");
				setShowAlert(true);
			} else {
				if (data.error_code === "2") {
					setAlertState("session");
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
				} else {
					setAlertState("error");
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
				}
			}
		})
		.catch((error) => {
			setAlertState("error");
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
			}
			setShowAlert(true);
		});
	}, [getCookie, IdTarikDana, getListTarikDana]);

	const handleUpdateStatusPengajuan = useCallback(() => {
		if (!SelectedPengajuan || !NewStatus) return;

		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "UPDATE",
			"id": parseInt(SelectedPengajuan.id),
			"status": NewStatus
		});

		setLoading(true);

		var url = paths.URL_API_ADMIN + 'TarikDana';
		var Signature = generateSignature(requestBody);

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
			setLoading(false);
			if (data.error_code === "0" || data.error_code === 0) {
				getListTarikDana("");
				setShowModalUpdateStatus(false);
				setSelectedPengajuan(null);
				setNewStatus("");
				setAlertState("success");
				setSuccessMessage("Status pengajuan berhasil diupdate");
				setShowAlert(true);
			} else {
				if (data.error_code === "2" || data.error_code === 2) {
					setAlertState("session");
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
				} else {
					setAlertState("error");
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
				}
			}
		})
		.catch((error) => {
			setLoading(false);
			setAlertState("error");
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
			}
			setShowAlert(true);
		});
	}, [SelectedPengajuan, NewStatus, getCookie, getListTarikDana]);

	const handleOpenUpdateStatus = (item) => {
		setSelectedPengajuan(item);
		setNewStatus("");
		setShowModalUpdateStatus(true);
	};

	useEffect(() => {
		window.scrollTo(0, 0);

		var cookieParamKey = getCookie("paramkey");
		var cookieUsername = getCookie("username");

		if (!cookieParamKey || !cookieUsername) {
			history.push("/admin/login");
		} else {
			dispatch(setForm("ParamKey", cookieParamKey));
			dispatch(setForm("Username", cookieUsername));
			dispatch(setForm("PageActive", "TARIK_DANA"));
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListTarikDana("");
		getListNomorRekening();
	}, [getListTarikDana, getListNomorRekening]);

	const formatRupiah = (value) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0
		}).format(value || 0);
	};

	const formatNumber = (value) => {
		return new Intl.NumberFormat("id-ID").format(value || 0);
	};

	const summaryCards = useMemo(() => [
		{
			title: "Menunggu Persetujuan",
			value: TotalMenungguPersetujuan,
			description: "Total pengajuan menunggu",
			icon: <FaClock />,
			tone: "yellow",
		},
		{
			title: "Disetujui - Menunggu Cair",
			value: formatRupiah(TotalDisetujui),
			description: "Siap dicairkan oleh Superadmin",
			icon: <FaCheckCircle />,
			tone: "blue",
		},
		{
			title: "Dana Tercairkan",
			value: formatRupiah(TotalCair),
			description: "Total dana sudah cair",
			icon: <FaMoneyBillWave />,
			tone: "green",
		},
	], [TotalMenungguPersetujuan, TotalDisetujui, TotalCair]);

	const handleExport = () => {
		const formatted = ListData.map((item) => ({
			"ID": item.id_tarik_dana || "-",
			"Tanggal": item.tanggal_input || "-",
			"Keperluan": item.keperluan || "-",
			"Jumlah": item.jumlah || 0,
			"Status": item.tahap || "-",
		}));

		const now = new Date();
		const day = String(now.getDate()).padStart(2, "0");
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const year = now.getFullYear();

		const worksheet = XLSX.utils.json_to_sheet(formatted);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Tarik Dana");

		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});

		const fileData = new Blob([excelBuffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(fileData, `export-tarik-dana-${day}-${month}-${year}.xlsx`);
	};

	const handleFilter = () => {
		setListData([]);
		if (CurrentPage === 1) {
			getListTarikDana("");
		} else {
			setCurrentPage(1);
		}
	};

	const handleReset = () => {
		setGlobalSearch("");
		setFilterJenisTransaksi("");
		setFilterBulan("");
		setListData([]);
		if (CurrentPage === 1) {
			getListTarikDana("reset");
		} else {
			setCurrentPage(1);
		}
	};

	const handleConfirmAlert = (alertState) => {
		if (alertState === "session") {
			setShowAlert(false);
			logout();
			history.push("/admin/login");
		} else if (alertState === "success") {
			setShowAlert(false);
			setSuccessMessage("");
		} else if (alertState === "error") {
			setShowAlert(false);
			setErrorMessageAlert("");
		} else if (alertState === "logout") {
			setShowAlert(false);
			setErrorMessageAlertLogout("");
			history.push("/admin/login");
		} else if (alertState === "validation") {
			setShowAlert(false);
			setValidationMessage("");
		} else if (alertState === "confirm") {
			handleDelete();
		}
	};

	const statusBadge = (status, desc) => {
		switch (status) {
			case 1:
				return <span className="admin-status-badge pending">{desc}</span>;
			case 2:
				return <span className="admin-status-badge info">{desc}</span>;
			case 3:
				return <span className="admin-status-badge active">{desc}</span>;
			case 4:
				return <span className="admin-status-badge inactive">{desc}</span>;
			default:
				return null;
		}
	};

	return (
		<>
			{Loading && <LoadingLogo />}

			<div className="admin-page">
				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Manajemen Keuangan</div>
						<h1>Tarik Dana</h1>
						<p>Kelola pengajuan dan status pencairan dana.</p>
					</div>
					<div className="admin-header-actions">
						<button
							className="admin-btn-primary"
							onClick={() => setShowModalInputPengajuan(true)}
						>
							<FaPlus /> Input Pengajuan
						</button>
						<button
							className="admin-btn-secondary"
							onClick={handleExport}
							disabled={ListData.length === 0}
						>
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
							<h2>Daftar Pengajuan Tarik Dana</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari cluster / keperluan..."
								value={GlobalSearch}
								onChange={(e) => setGlobalSearch(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleFilter();
								}}
							/>
						</div>

						<select
							value={FilterJenisTransaksi}
							onChange={(e) => setFilterJenisTransaksi(e.target.value)}
						>
							<option value="">Status Pengajuan</option>
							<option value="1">Menunggu</option>
							<option value="2">Disetujui</option>
							<option value="3">Ditolak</option>
						</select>

						<input
							type="month"
							value={FilterBulan}
							onChange={(e) => setFilterBulan(e.target.value)}
						/>

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
									<th>ID / Tanggal</th>
									<th>Keperluan</th>
									<th>Jumlah</th>
									<th>Status</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListData?.length > 0 ? ListData.map((item, index) => (
									<tr key={item.id_tarik_dana || index}>
										<td>
											<strong>{item.id_tarik_dana}</strong>
											<span>{item.tanggal_input}</span>
										</td>
										<td>
											<strong>{item.keperluan}</strong>
										</td>
										<td>
											<strong>{formatRupiah(item.jumlah)}</strong>
										</td>
										<td>
											{statusBadge(item.status, item.tahap)}
											<div className="tarik-dana-stepper">
												{steps.map((step, idx) => (
													<div className="tarik-dana-step-item" key={step}>
														<div className={`tarik-dana-circle ${item.status >= step ? "active" : ""}`} />
														{idx < steps.length - 1 && (
															<div className={`tarik-dana-line ${item.status > step ? "active" : ""}`} />
														)}
													</div>
												))}
											</div>
										</td>
										<td>
											<div style={{ display: 'flex', gap: 8 }}>
												{getCookie("username") == "superadmin" &&
												<button
													className="admin-btn-icon"
													title="Update Status"
													onClick={() => handleOpenUpdateStatus(item)}
												>
													<FaExchangeAlt />
												</button>}
												<button
													className="admin-btn-icon"
													title="Lihat Detail"
												>
													<FaEye />
												</button>
											</div>
										</td>
									</tr>
								))
								:
								<tr>
									<td colSpan={5}>
										<div className="admin-empty-state">
											<strong>Belum Ada Pengajuan</strong>
											<span>Pengajuan penarikan dana akan muncul di sini setelah melakukan pengajuan.</span>
										</div>
									</td>
								</tr>
								}
							</tbody>
						</table>
					</div>

					<div className="admin-footer">
						<div>Total Data : {formatNumber(TotalRecords)}</div>
						<Pagination
							currentPage={CurrentPage}
							totalPage={Math.max(Number(TotalPage) || 1, 1)}
							onPageChange={(page) => {
								if (!Loading) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>

				<ModalInputPengajuan
					showModal={ShowModalInputPengajuan}
					keperluan={Keperluan}
					onChangeKeperluan={(event) => setKeperluan(event.target.value)}
					jumlah={formatRupiah(Jumlah)}
					onChangeJumlah={(event) => {
						const value = event.target.value.replace(/\D/g, "");
						setJumlah(value);
					}}
					listRekening={ListNomorRekening}
					rekeningTujuan={RekeningTujuan}
					onChangeRekeningTujuan={(event) => setRekeningTujuan(event.target.value)}
					onClose={() => setShowModalInputPengajuan(false)}
					onInsert={() => handleInputPengajuan()}
				/>

				<Alert
					alertState={AlertState}
					onConfirm={() => handleConfirmAlert(AlertState)}
					onCancel={() => setShowAlert(false)}
					onEscapeKey={() => setShowAlert(false)}
					onOutsideClick={() => setShowAlert(false)}
					showAlert={ShowAlert}
					sessionMessage={SessionMessage}
					successMessage={SuccessMessage}
					errorMessageAlert={ErrorMessageAlert}
					errorMessageAlertLogout={ErrorMessageAlertLogout}
					validationMessage={ValidationMessage}
					confirmMessage={ConfirmMessage}
				/>

				{/* Modal Update Status Pengajuan */}
				{ShowModalUpdateStatus && (
					<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title">Update Status Pengajuan</h5>
									<button type="button" className="btn-close" onClick={() => { setShowModalUpdateStatus(false); setSelectedPengajuan(null); setNewStatus(""); }}></button>
								</div>
								<div className="modal-body">
									{SelectedPengajuan && (
										<div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
											<div style={{ marginBottom: 4 }}><strong>ID:</strong> {SelectedPengajuan.id_tarik_dana}</div>
											<div style={{ marginBottom: 4 }}><strong>Keperluan:</strong> {SelectedPengajuan.keperluan}</div>
											<div style={{ marginBottom: 4 }}><strong>Jumlah:</strong> {formatRupiah(SelectedPengajuan.jumlah)}</div>
											<div><strong>Status Saat Ini:</strong> {SelectedPengajuan.tahap}</div>
										</div>
									)}
									<div className="mb-3">
										<label className="form-label">Pilih Status Baru <span style={{ color: 'red' }}>*</span></label>
										<select
											className="form-select"
											value={NewStatus}
											onChange={(e) => setNewStatus(e.target.value)}
										>
											<option value="">-- Pilih Status --</option>
											<option value="1">Menunggu Persetujuan</option>
											<option value="2">Disetujui</option>
											<option value="3">Cair</option>
											<option value="4">Ditolak</option>
										</select>
									</div>
								</div>
								<div className="modal-footer">
									<button
										type="button"
										className="btn btn-primary"
										disabled={!NewStatus}
										onClick={handleUpdateStatusPengajuan}
									>
										Update Status
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

export default ListTarikDana;
