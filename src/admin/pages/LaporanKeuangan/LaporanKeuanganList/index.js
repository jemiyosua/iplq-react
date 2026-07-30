import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils';
import { generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
import '../../../../styles/admin-shared.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
	FaSearch,
	FaFilter,
	FaRedoAlt,
	FaFileDownload,
	FaMoneyBillWave,
	FaWallet,
	FaArrowUp,
	FaArrowDown,
	FaPlus,
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingLogo from '../../../components/molecules/LoadingLogo';
import { Pagination, ModalUpdateLaporanKeuangan, Alert } from '../../../components';
import Dropdown from 'react-bootstrap/Dropdown';

const LaporangKeuanganList = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ListLaporanKeuangan, setListLaporanKeuangan] = useState([]);
	const [ListLaporanKeuanganFilter, setListLaporanKeuanganFilter] = useState([]);
	const [ListPenggunaanDana, setListPenggunaanDana] = useState([]);

	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(1);
	const [TotalRecords, setTotalRecords] = useState(0);

	const [TotalSaldo, setTotalSaldo] = useState(0);
	const [SaldoAwal, setSaldoAwal] = useState(0);
	const [SaldoAkhir, setSaldoAkhir] = useState(0);
	const [TotalKredit, setTotalKredit] = useState(0);
	const [TotalDebit, setTotalDebit] = useState(0);

	const [SaldoAwalFilter, setSaldoAwalFilter] = useState(0);
	const [SaldoAkhirFilter, setSaldoAkhirFilter] = useState(0);

	const [LoadingLaporanKeuangan, setLoadingLaporanKeuangan] = useState(false);
	const [ShowModalUpdateLaporanKeuangan, setShowModalUpdateLaporanKeuangan] = useState(false);

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterJenisTransaksi, setFilterJenisTransaksi] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');
	const [FilterBeginDate, setFilterBeginDate] = useState('');
	const [FilterEndDate, setFilterEndDate] = useState('');

	// List bulan yang tersedia dari transaksi
	const [ListBulanTersedia, setListBulanTersedia] = useState([]);

	// Summary keuangan tahun berjalan
	const [SummaryRekeningKoran, setSummaryRekeningKoran] = useState([]);
	const [SummaryPenggunaanDana, setSummaryPenggunaanDana] = useState([]);
	const [FilterBulanSummary, setFilterBulanSummary] = useState('');

	// Pagination summary tables (client-side, 5 per page)
	const [PageRekeningKoran, setPageRekeningKoran] = useState(1);
	const [PagePenggunaanDana, setPagePenggunaanDana] = useState(1);
	const SUMMARY_PER_PAGE = 5;

	// Alert states
	const [AlertState, setAlertState] = useState("");
	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState("");
	const [SuccessMessage, setSuccessMessage] = useState("");
	const [ErrorMessageAlert, setErrorMessageAlert] = useState("");
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("");
	const [ValidationMessage, setValidationMessage] = useState("");
	const [ConfirmMessage, setConfirmMessage] = useState("");

	// Edit/Delete states
	const [IdRekeningKoran, setIdRekeningKoran] = useState(0);
	const [OrderId, setOrderId] = useState("");
	const [JenisTransaksi, setJenisTransaksi] = useState("");
	const [TipeTransaksi, setTipeTransaksi] = useState("");
	const [Nominal, setNominal] = useState("");
	const [TanggalBayar, setTanggalBayar] = useState("");
	const [Deskripsi, setDeskripsi] = useState("");

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
			else if (tipe === "paramkey") return paramKey;
			else if (tipe === "access") return accessLogin;
			else if (tipe === "access_name") return accessName;
			else if (tipe === "cluster") return cluster;
			else if (tipe === "cluster_id") return clusterId;
			else return null;
		} else {
			return null;
		}
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

	const getListLaporanKeuangan = useCallback((posisi = "") => {
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
			"filter_jenis_transaksi": filterJenisTransaksi,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingLaporanKeuangan(true);

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
			setLoadingLaporanKeuangan(false);

			if (data.error_code === '0' || data.error_code === 0) {
				setListLaporanKeuangan(data.result || []);
				setTotalSaldo(data.total_saldo);
				setSaldoAwal(data.saldo_awal);
				setSaldoAkhir(data.saldo_akhir);
				setTotalKredit(data.total_kredit);
				setTotalDebit(data.total_debit);
				setTotalPage(Number(data.total_page) || 1);
				setTotalRecords(Number(data.total_record) || 0);
				return;
			} else {
				if (data.error_code === "2") {
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
			setLoadingLaporanKeuangan(false);
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				setShowAlert(true);
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			}
		});
	}, [CurrentPage, FilterBulan, FilterJenisTransaksi, GlobalSearch, RowPage, getCookie]);

	const getListBulanLaporanKeuangan = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT"
		});

		var url = paths.URL_API_ADMIN + 'GetListBulanLaporanKeuanganAdmin';
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
			if (data.error_code === '0' || data.error_code === 0) {
				setListBulanTersedia(data.result)
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
		.catch(() => {});
	};

	const getListLaporanKeuanganFilter = (filterBulanSummary) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"bulan_laporan": filterBulanSummary,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		// setLoadingLaporanKeuangan(true);

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
			// setLoadingLaporanKeuangan(false);

			if (data.error_code === '0' || data.error_code === 0) {
				setListLaporanKeuanganFilter(data.result || []);
				// setTotalSaldo(data.total_saldo);
				setSaldoAwalFilter(data.saldo_awal);
				setSaldoAkhirFilter(data.saldo_akhir);
				// setTotalKredit(data.total_kredit);
				// setTotalDebit(data.total_debit);
				// setTotalPage(Number(data.total_page) || 1);
				// setTotalRecords(Number(data.total_record) || 0);
				return;
			} else {
				if (data.error_code === "2") {
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
			// setLoadingLaporanKeuangan(false);
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				setShowAlert(true);
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			}
		});
	};

	const getListPenggunaanDana = (filterBulanSummary) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"bulan_laporan": filterBulanSummary,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		// setLoadingLaporanKeuangan(true);

		var url = paths.URL_API_ADMIN + 'GetListPenggunaanDana';
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
			// setLoadingLaporanKeuangan(false);

			if (data.error_code === '0' || data.error_code === 0) {
				setListPenggunaanDana(data.result || []);
				// setTotalSaldo(data.total_saldo);
				// setSaldoAwalFilter(data.saldo_awal);
				// setSaldoAkhirFilter(data.saldo_akhir);
				// setTotalKredit(data.total_kredit);
				// setTotalDebit(data.total_debit);
				// setTotalPage(Number(data.total_page) || 1);
				// setTotalRecords(Number(data.total_record) || 0);
				return;
			} else {
				if (data.error_code === "2") {
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
			// setLoadingLaporanKeuangan(false);
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				setShowAlert(true);
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			}
		});
	};

	useEffect(() => {
		getListLaporanKeuanganFilter(FilterBulanSummary);
		getListPenggunaanDana(FilterBulanSummary);
	}, [FilterBulanSummary])

	useEffect(() => {
		window.scrollTo(0, 0);

		var cookieParamKey = getCookie("paramkey");
		var cookieUsername = getCookie("username");

		if (cookieParamKey === null || cookieParamKey === "" || cookieUsername === null || cookieUsername === "") {
			history.push("/admin/login");
		} else {
			dispatch(setForm("ParamKey", cookieParamKey));
			dispatch(setForm("Username", cookieUsername));
			dispatch(setForm("PageActive", "LAPORAN_KEUANGAN"));

			getListBulanLaporanKeuangan();
		}
	}, [dispatch, getCookie, history]);

	useEffect(() => {
		getListLaporanKeuangan("");
	}, [getListLaporanKeuangan]);

	const handleLaporanKeuangan = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		let filterBulan = FilterBulan;

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"bulan_laporan": filterBulan,
			"bulan_laporan_summary": 0,
			"bulan_penggunaan_dana": 0,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingLaporanKeuangan(true);

		var url = paths.URL_API_ADMIN + 'ExportLaporanKeuangan';
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
			setLoadingLaporanKeuangan(false);

			if (data.error_code === '0' || data.error_code === 0) {
				handleExportLaporanKeuangan(data);
				return;
			} else {
				if (data.error_code === "2") {
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
			setLoadingLaporanKeuangan(false);
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				setShowAlert(true);
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			}
		});
	};

	const formatRupiah = (value) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0
		}).format(value);
	};

	const formatNumber = (value) => {
		return new Intl.NumberFormat("id-ID").format(value || 0);
	};

	const handleExportLaporanKeuangan = (data) => {
		const workbook = XLSX.utils.book_new();

		const summary = data.summary || {};
		const rekeningKoran = data.rekening_koran || [];
		const penggunaanDana = data.penggunaan_dana?.result || [];

		// TAB 1 - SUMMARY LAPORAN
		const summaryData = [
			["LAPORAN KEUANGAN - SUMMARY"],
			[],
			["Keterangan", "Nominal"],
			["Saldo Awal", summary.saldo_awal || 0],
			["Total Pemasukan (Debit)", summary.total_debit || 0],
			["Total Pengeluaran (Kredit)", summary.total_kredit || 0],
			["Saldo Akhir", summary.total_saldo || 0],
			[],
			["RINGKASAN PER BULAN"],
			["Bulan", "Total Transaksi", "Total Nominal"],
			...(summary.detail_summary_bulan || []).map((item) => [
				item.bulan,
				item.total_transaksi,
				item.total_nominal,
			]),
		];

		const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(workbook, wsSummary, "Summary Laporan");

		// TAB 2 - REKENING KORAN
		let saldoBerjalan = Number(summary.saldo_awal) || 0;
		const rekeningKoranData = rekeningKoran.map((item) => {
			const isDebit = item.jenis_transaksi?.toLowerCase() === "debit";
			const debit = isDebit ? Number(item.nominal) : 0;
			const kredit = !isDebit ? Number(item.nominal) : 0;
			saldoBerjalan += debit - kredit;

			return {
				"Tanggal": item.tanggal_bayar || "-",
				"Order ID": item.order_id || "-",
				"Nama": item.nama || "-",
				"Cluster": item.cluster || "-",
				"Tipe Transaksi": item.tipe_transaksi || "-",
				"Keterangan": item.deskripsi || "-",
				"Debit": debit,
				"Kredit": kredit,
				"Saldo": saldoBerjalan,
			};
		});

		const wsRekeningKoran = XLSX.utils.json_to_sheet(rekeningKoranData.length > 0 ? rekeningKoranData : [{ "Info": "Tidak ada data" }]);
		XLSX.utils.book_append_sheet(workbook, wsRekeningKoran, "Rekening Koran");

		// TAB 3 - PENGGUNAAN DANA
		const penggunaanDanaData = penggunaanDana.map((item) => ({
			"Tanggal": item.tanggal_input || "-",
			"Order ID": item.order_id || "-",
			"Cluster": item.cluster || "-",
			"Keterangan": item.deskripsi || item.keterangan || "-",
			"Nominal": Number(item.nominal) || 0,
			"Jenis Transaksi": item.jenis_transaksi || "-",
		}));

		const wsPenggunaanDana = XLSX.utils.json_to_sheet(penggunaanDanaData.length > 0 ? penggunaanDanaData : [{ "Info": "Tidak ada data" }]);
		XLSX.utils.book_append_sheet(workbook, wsPenggunaanDana, "Penggunaan Dana");

		// DOWNLOAD FILE
		const now = new Date();
		const day = String(now.getDate()).padStart(2, "0");
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const year = now.getFullYear();

		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});

		const file = new Blob([excelBuffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(file, `Laporan_Keuangan_${day}-${month}-${year}.xlsx`);
	};

	const handleInputPemasukan = () => {
		history.push("/admin/input-laporan-keuangan");
	};

	const handleEdit = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "UPDATE",
			"id_rekening_koran": parseInt(IdRekeningKoran),
			"nominal": parseInt(Nominal),
			"jenis_transaksi": JenisTransaksi,
			"tipe_transaksi": TipeTransaksi,
			"deskripsi": Deskripsi,
			"tanggal_bayar": TanggalBayar
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
			if (data.error_code === '0' || data.error_code === 0) {
				getListLaporanKeuangan("");
				setAlertState("success");
				setSuccessMessage("Data berhasil diupdate");
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
				setShowAlert(true);
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			}
		});
	};

	const handleDelete = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "DELETE",
			"id_rekening_koran": parseInt(IdRekeningKoran)
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
			if (data.error_code === '0' || data.error_code === 0) {
				getListLaporanKeuangan("");
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
				setShowAlert(true);
			} else {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
			}
		});
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

	const convertToDateInput = (tanggal) => {
		const bulan = {
			Januari: "01", Februari: "02", Maret: "03", April: "04",
			Mei: "05", Juni: "06", Juli: "07", Agustus: "08",
			September: "09", Oktober: "10", November: "11", Desember: "12",
		};
		const [hari, namaBulan, tahun] = tanggal.split(" ");
		return `${tahun}-${bulan[namaBulan]}-${hari.padStart(2, "0")}`;
	};

	const handleFilterBulan = (bulan) => {
		setFilterBulan(bulan);
		if (!bulan) {
			setFilterBeginDate("");
			setFilterEndDate("");
			return;
		}
		const [year, month] = bulan.split("-");
		const start = new Date(year, month - 1, 1);
		const end = new Date(year, month, 0);
		const format = (date) => {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, "0");
			const d = String(date.getDate()).padStart(2, "0");
			return `${y}-${m}-${d}`;
		};
		setFilterBeginDate(format(start));
		setFilterEndDate(format(end));
	};

	const handleFilter = () => {
		setListLaporanKeuangan([]);
		if (CurrentPage === 1) {
			getListLaporanKeuangan("");
		} else {
			setCurrentPage(1);
		}
	};

	const handleReset = () => {
		setGlobalSearch("");
		setFilterJenisTransaksi("");
		setFilterBulan("");
		setFilterBeginDate("");
		setFilterEndDate("");
		setListLaporanKeuangan([]);
		if (CurrentPage === 1) {
			getListLaporanKeuangan("reset");
		} else {
			setCurrentPage(1);
		}
	};

	// Summary cards - conditional based on user role
	const isSuperAdmin = getCookie("username") === "superadmin";

	const summaryCardsSuperAdmin = [
		{
			title: "Total Saldo",
			value: formatRupiah(TotalSaldo),
			description: "Saldo Akhir",
			icon: <FaWallet />,
			tone: "blue",
		},
		{
			title: "Total Pemasukan (Debit)",
			value: formatRupiah(TotalDebit),
			description: "Total Dana Masuk",
			icon: <FaArrowDown />,
			tone: "green",
		},
		{
			title: "Total Pengeluaran (Kredit)",
			value: formatRupiah(TotalKredit),
			description: "Total Dana Keluar",
			icon: <FaArrowUp />,
			tone: "red",
		},
	];

	const summaryCardsCluster = [
		{
			title: "Saldo Awal",
			value: formatRupiah(SaldoAwal),
			description: "Total Saldo Awal",
			icon: <FaWallet />,
			tone: "blue",
		},
		{
			title: "Total Pemasukan (Debit)",
			value: formatRupiah(TotalDebit),
			description: "Total Dana Masuk",
			icon: <FaArrowDown />,
			tone: "green",
		},
		{
			title: "Total Pengeluaran (Kredit)",
			value: formatRupiah(TotalKredit),
			description: "Total Dana Keluar",
			icon: <FaArrowUp />,
			tone: "red",
		},
		{
			title: "Saldo Akhir",
			value: formatRupiah(SaldoAkhir),
			description: "Total Saldo Akhir",
			icon: <FaMoneyBillWave />,
			tone: "purple",
		},
	];

	const summaryCards = isSuperAdmin ? summaryCardsSuperAdmin : summaryCardsCluster;

	return (
		<>
			{LoadingLaporanKeuangan && <LoadingLogo />}

			<div className="admin-page">
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

				<div className="admin-header">
					<div>
						<div className="admin-eyebrow">Keuangan</div>
						<h1>Laporan Keuangan</h1>
						<p>Pantau pemasukan dan pengeluaran keuangan perumahan.</p>
					</div>
					<div className="admin-header-actions">
						<button className="admin-btn-primary" onClick={handleInputPemasukan}>
							<FaPlus /> Input Pemasukan
						</button>
						<button
							className="admin-btn-secondary"
							onClick={() => handleLaporanKeuangan()}
						>
							<FaFileDownload /> Export Data
						</button>
					</div>
				</div>

				<div className={`admin-summary-grid ${isSuperAdmin ? 'cols-3' : ''}`}>
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

				{/* Summary Keuangan Tahun Berjalan */}
				<div className="admin-panel" style={{ marginBottom: 20 }}>
					<div className="admin-panel-header">
						<div>
							<h2>Summary Keuangan Tahun Berjalan</h2>
							<p>Saldo Awal: {formatRupiah(SaldoAwalFilter)} | Saldo Akhir: {formatRupiah(SaldoAkhirFilter)}</p>
						</div>
						<div>
							<select
								className="form-select form-select-sm"
								style={{ minWidth: 180 }}
								value={FilterBulanSummary}
								onChange={(e) => setFilterBulanSummary(e.target.value)}
							>
								<option value="">Semua Bulan</option>
								{ListBulanTersedia.map((item, index) => (
									<option key={index} value={item.bulan}>{item.filter_teks}</option>
								))}
							</select>
						</div>
					</div>

					<div className="row">
						{/* Rekening Koran */}
						<div className="col-md-6" style={{ marginBottom: 16 }}>
							<h6 style={{ fontWeight: 700, marginBottom: 4 }}>Rekening Koran</h6>
							<div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 13 }}>
								<span>Total Debit: <strong style={{ color: '#16a34a' }}>{formatRupiah(ListLaporanKeuanganFilter.filter(i => i.jenis_transaksi?.toLowerCase() === 'debit').reduce((sum, i) => sum + Number(i.nominal || 0), 0))}</strong></span>
								<span>Total Kredit: <strong style={{ color: '#dc2626' }}>{formatRupiah(ListLaporanKeuanganFilter.filter(i => i.jenis_transaksi?.toLowerCase() === 'kredit').reduce((sum, i) => sum + Number(i.nominal || 0), 0))}</strong></span>
							</div>
							<div className="table-responsive admin-table-wrap">
								<table className="table admin-table align-middle">
									<thead>
										<tr>
											<th>No</th>
											<th>Tanggal</th>
											<th>Keterangan</th>
											<th style={{ textAlign: 'right' }}>Debit</th>
											<th style={{ textAlign: 'right' }}>Kredit</th>
										</tr>
									</thead>
									<tbody>
										{ListLaporanKeuanganFilter.length > 0 ? ListLaporanKeuanganFilter
											.slice((PageRekeningKoran - 1) * SUMMARY_PER_PAGE, PageRekeningKoran * SUMMARY_PER_PAGE)
											.map((item, idx) => (
											<tr key={idx}>
												<td>{(PageRekeningKoran - 1) * SUMMARY_PER_PAGE + idx + 1}</td>
												<td>{item.tanggal_bayar || item.tanggal_input || '-'}</td>
												<td>{item.deskripsi || item.keterangan || '-'}</td>
												<td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
													{item.jenis_transaksi?.toLowerCase() === 'debit' ? formatRupiah(item.nominal) : '-'}
												</td>
												<td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
													{item.jenis_transaksi?.toLowerCase() === 'kredit' ? formatRupiah(item.nominal) : '-'}
												</td>
											</tr>
										)) : (
											<tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Belum ada data</td></tr>
										)}
									</tbody>
								</table>
							</div>
							{ListLaporanKeuanganFilter.length > SUMMARY_PER_PAGE && (
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 13 }}>
									<div>
										<span style={{ color: '#6b7280', fontWeight:'bold' }}>Total Data {ListLaporanKeuanganFilter.length}</span>
										<br />
										<span style={{ color: '#6b7280' }}>Page {PageRekeningKoran} / {Math.ceil(ListLaporanKeuanganFilter.length / SUMMARY_PER_PAGE)}</span>
									</div>
									<div style={{ display: 'flex', gap: 4 }}>
										<button className="btn btn-sm btn-outline-secondary" disabled={PageRekeningKoran <= 1} onClick={() => setPageRekeningKoran(PageRekeningKoran - 1)}>←</button>
										<button className="btn btn-sm btn-outline-secondary" disabled={PageRekeningKoran >= Math.ceil(ListLaporanKeuanganFilter.length / SUMMARY_PER_PAGE)} onClick={() => setPageRekeningKoran(PageRekeningKoran + 1)}>→</button>
									</div>
								</div>
							)}
						</div>

						{/* Penggunaan Dana */}
						<div className="col-md-6" style={{ marginBottom: 16 }}>
							<h6 style={{ fontWeight: 700, marginBottom: 4 }}>Penggunaan Dana</h6>
							<div style={{ marginBottom: 8, fontSize: 13 }}>
								<span>Total Penggunaan: <strong style={{ color: '#dc2626' }}>{formatRupiah(ListPenggunaanDana.reduce((sum, i) => sum + Number(i.nominal || 0), 0))}</strong></span>
							</div>
							<div className="table-responsive admin-table-wrap">
								<table className="table admin-table align-middle">
									<thead>
										<tr>
											<th>No</th>
											<th>Tanggal</th>
											<th>Keterangan</th>
											<th style={{ textAlign: 'right' }}>Nominal</th>
										</tr>
									</thead>
									<tbody>
										{ListPenggunaanDana.length > 0 ? ListPenggunaanDana
											.slice((PagePenggunaanDana - 1) * SUMMARY_PER_PAGE, PagePenggunaanDana * SUMMARY_PER_PAGE)
											.map((item, idx) => (
											<tr key={idx}>
												<td>{(PagePenggunaanDana - 1) * SUMMARY_PER_PAGE + idx + 1}</td>
												<td>{item.tanggal_input || item.tanggal_bayar || '-'}</td>
												<td>{item.deskripsi || item.keterangan || '-'}</td>
												<td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>{formatRupiah(item.nominal)}</td>
											</tr>
										)) : (
											<tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Belum ada data</td></tr>
										)}
									</tbody>
								</table>
							</div>
							{ListPenggunaanDana.length > SUMMARY_PER_PAGE && (
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 13 }}>
									<span style={{ color: '#6b7280' }}>Hal {PagePenggunaanDana} / {Math.ceil(ListPenggunaanDana.length / SUMMARY_PER_PAGE)}</span>
									<div style={{ display: 'flex', gap: 4 }}>
										<button className="btn btn-sm btn-outline-secondary" disabled={PagePenggunaanDana <= 1} onClick={() => setPagePenggunaanDana(PagePenggunaanDana - 1)}>←</button>
										<button className="btn btn-sm btn-outline-secondary" disabled={PagePenggunaanDana >= Math.ceil(ListPenggunaanDana.length / SUMMARY_PER_PAGE)} onClick={() => setPagePenggunaanDana(PagePenggunaanDana + 1)}>→</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="admin-panel">
					<div className="admin-panel-header">
						<div>
							<h2>Daftar Transaksi</h2>
							<p>Total data: {formatNumber(TotalRecords)}</p>
						</div>
					</div>

					<div className="admin-filter-grid">
						<div className="admin-search-field">
							<FaSearch />
							<input
								type="text"
								placeholder="Cari nama warga / cluster..."
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
							<option value="">Semua Jenis Transaksi</option>
							<option value="kredit">Kredit</option>
							<option value="debit">Debit</option>
						</select>

						<input
							type="month"
							value={FilterBulan}
							onChange={(e) => handleFilterBulan(e.target.value)}
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
									<th>Order ID</th>
									<th>Detail Warga</th>
									<th>Detail Transaksi</th>
									<th>Nominal</th>
									<th>Tanggal</th>
									<th>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{ListLaporanKeuangan?.length > 0 ? (
									ListLaporanKeuangan.map((item, index) => (
										<tr key={item.id || index}>
											<td>
												<strong>{item.order_id || "-"}</strong>
												<span className={`admin-status-badge ${item.jenis_transaksi?.toLowerCase() === "debit" ? "active" : "inactive"}`}>
													{item.jenis_transaksi}
												</span>
											</td>
											<td>
												<strong>{item.nama || "-"}</strong>
												<span>{item.cluster || "-"}</span>
											</td>
											<td>
												<strong>{item.keterangan || "-"}</strong>
												<span>Jumlah Bulan: {item.jumlah_bulan || "-"}</span>
											</td>
											<td>
												<strong style={{ color: item.jenis_transaksi?.toLowerCase() === "debit" ? "#16a34a" : "#dc2626" }}>
													{formatRupiah(item.nominal)}
												</strong>
											</td>
											<td>
												<span>{item.tanggal_input || "-"}</span>
											</td>
											<td>
												<Dropdown>
													<Dropdown.Toggle variant="light" size="sm">
														⋮
													</Dropdown.Toggle>
													<Dropdown.Menu>
														<Dropdown.Item
															onClick={() => {
																setShowModalUpdateLaporanKeuangan(true);
																setOrderId(item.order_id);
																setJenisTransaksi(item.jenis_transaksi.toLowerCase());
																setTipeTransaksi(item.tipe_transaksi);
																setNominal(item.nominal);
																setTanggalBayar(convertToDateInput(item.tanggal_bayar));
																setDeskripsi(item.deskripsi);
															}}
														>
															Edit Data
														</Dropdown.Item>
														<Dropdown.Item
															onClick={() => {
																setAlertState("confirm");
																setIdRekeningKoran(item.id);
																setShowAlert(true);
																setConfirmMessage("Apakah Anda yakin ingin menghapus \n" + item.judul + "?");
															}}
														>
															Hapus Data
														</Dropdown.Item>
													</Dropdown.Menu>
												</Dropdown>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={6}>
											<div className="admin-empty-state">
												<strong>Belum Ada Transaksi Keuangan</strong>
												<span>Transaksi akan muncul setelah Anda melakukan pencatatan.</span>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{ListLaporanKeuangan.length > 0 && (
						<div className="admin-footer">
							<div>Total Data: {formatNumber(TotalRecords)}</div>
							<Pagination
								currentPage={CurrentPage}
								totalPage={Math.max(Number(TotalPage) || 1, 1)}
								onPageChange={(page) => {
									if (!LoadingLaporanKeuangan) {
										setCurrentPage(page);
									}
								}}
							/>
						</div>
					)}
				</div>

				<ModalUpdateLaporanKeuangan
					showModal={ShowModalUpdateLaporanKeuangan}
					orderId={OrderId}
					jenisTransaksi={JenisTransaksi}
					tipeTransaksi={TipeTransaksi}
					nominal={formatRupiah(Nominal)}
					onChangeNominal={(event) => {
						const value = event.target.value.replace(/\D/g, "");
						setNominal(value);
					}}
					tanggalBayar={TanggalBayar}
					deskripsi={Deskripsi}
					onClose={() => setShowModalUpdateLaporanKeuangan(false)}
					onUpdate={() => handleEdit()}
				/>
			</div>
		</>
	);
}

export default LaporangKeuanganList;
