import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination, Alert, ModalUpdateLaporanKeuangan, ModalInputPengajuan } from '../../../components';
import './laporan-keuangan.css'
import './table-laporan-keuangan.css'
import './tarik-dana-step.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FaMoneyBillWheat } from 'react-icons/fa6';
import { FaFileDownload, FaMoneyCheck } from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { IconAdd, IconArrowRightUp, IconCheck, IconDownload, IconDownloadGreen, IconExport, IconEye, IconFilter, IconReset, IconUploadRed, IconWallet } from '../../../assets';
import Dropdown from 'react-bootstrap/Dropdown';

const ListTarikDana = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListTarikDana, setListTarikDana] = useState([])
	const [ListNomorRekening, setListNomorRekening] = useState([])

	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage, setRowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(0)
	const [TotalRecords, setTotalRecords] = useState(0)
	
	const [TotalMenungguPersetujuan, setTotalMenungguPersetujuan] = useState(0)
	const [TotalDisetujui, setTotalDisetujui] = useState(0)
	const [TotalCair, setTotalCair] = useState(0)

	const [Loading, setLoading] = useState(false)

	const [LoadingLaporanKeuangan, setLoadingLaporanKeuangan] = useState(false)

	const [ShowModalInputPengajuan, setShowModalInputPengajuan] = useState(false)

	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalRumah, setTotalRumah] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	const [TotalTransaksi, setTotalTransaksi] = useState(0)
	const [TotalPembayaran, setTotalPembayaran] = useState(0)

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterJenisTransaksi, setFilterJenisTransaksi] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');
	const [FilterBeginDate, setFilterBeginDate] = useState('');
	const [FilterEndDate, setFilterEndDate] = useState('');
	const [ChartData, setChartData] = useState([
		{
			bulan: "Jan",
			pemasukan: 1200000,
			pengeluaran: 300000
		},
		{
			bulan: "Feb",
			pemasukan: 900000,
			pengeluaran: 200000
		},
		{
			bulan: "Mar",
			pemasukan: 1500000,
			pengeluaran: 500000
		}
	]);

	// ---------- alert ----------
	const [AlertState, setAlertState] = useState("")
	const [ShowAlert, setShowAlert] = useState(true)
	const [SessionMessage, setSessionMessage] = useState("")
	const [SuccessMessage, setSuccessMessage] = useState("")
	const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
	const [ValidationMessage, setValidationMessage] = useState("")
	const [ConfirmMessage, setConfirmMessage] = useState("")

	const [IdRekeningKoran, setIdRekeningKoran] = useState(0)

	const [Keperluan, setKeperluan] = useState("")
	const [Jumlah, setJumlah] = useState("")
	const [RekeningTujuan, setRekeningTujuan] = useState("")

	const steps = [1, 2, 3];

	useEffect(() => {
        window.scrollTo(0, 0)

        var CookieNama = getCookie("nama");
        setName(CookieNama)

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey === null || CookieParamKey === "" || CookieUsername === null || CookieUsername === ""){
            window.location.href="/admin/login";
        }else{
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","TARIK_DANA"))
        }

    },[])

	useEffect(() => {
		getListTarikDana("");
		getListNomorRekening();
	}, [CurrentPage]);

	// useEffect(() => {
	// 	console.log("masuk sini")
	// 	const delay = setTimeout(() => {
	// 		setCurrentPage(1);
	// 	}, 500);

	// 	return () => clearTimeout(delay);
	// }, [GlobalSearch]);

	const getCookie = (tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie=="string") {
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
	}

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        removeCookie('varMerchantId', { path: '/'})
        removeCookie('varIdVoucher', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        dispatch(setForm("Name",''))
        dispatch(setForm("Role",''))
        if(window){
            sessionStorage.clear();
		}
    }

	const getListTarikDana = (posisi) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		let globalSearch = GlobalSearch
		let filterJenisTransaksi = FilterJenisTransaksi
		let filterBulan = FilterBulan
		if (posisi == "reset") {
			globalSearch = ""
			filterJenisTransaksi = ""
			filterBulan = ""
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

		setLoadingLaporanKeuangan(true)

		var url = paths.URL_API_ADMIN + 'TarikDana';
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
			setLoadingLaporanKeuangan(false)

			if (data.error_code == "0") {
				setListTarikDana(data.result)

				setTotalMenungguPersetujuan(data.total_menungggu_persetujuan)
				setTotalDisetujui(data.total_disetujui)
				setTotalCair(data.total_tercairkan)

				setTotalPage(data.total_page)
				setTotalRecords(data.total_record)
				return
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
			setLoadingLaporanKeuangan(false)

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
	}

	const handleInputPengajuan = () => {
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
			if (data.error_code == "0") {
				getListTarikDana()
				setShowModalInputPengajuan(false)

				setAlertState("success")
				setSuccessMessage("Data berhasil diupdate");
				setShowAlert(true);
				return;
			} else {
				if (data.error_code === "2") {
					setAlertState("session")
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
					return;
				} else {
					setAlertState("error")
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
					return;
				}
			}
		})
		.catch((error) => {
			setAlertState("error")
			
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
	}

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
			if (data.error_code == "0") {
				getListTarikDana()

				setAlertState("success")
				setSuccessMessage("Data berhasil dihapus");
				setShowAlert(true);
				return;
			} else {
				if (data.error_code === "2") {
					setAlertState("session")
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
					return;
				} else {
					setAlertState("error")
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
					return;
				}
			}
		})
		.catch((error) => {
			setAlertState("error")
			
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
	}

	const getListNomorRekening = () => {
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

		// setLoadingNomorRekening(true)

		var url = paths.URL_API_ADMIN + 'RekeningTarikDana';
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
			// setLoadingNomorRekening(false)

			if (data.error_code == "0") {
				setListNomorRekening(data.result)

				setTotalPage(data.total_page)
				setTotalRecords(data.total_record)
				return
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
			// setLoadingNomorRekening(false)

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
	}

	const formatRupiah = (value) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0
		}).format(value);
	}

	const handleExport = () => {
		const formatted = ListTarikDana.map((item) => ({
			"Order ID": item.order_id || "-",
			"Transaksi ID": item.transaction_id || "-",
			"Nama": item.nama_user,
			"No Rumah": item.nomor_rumah,
			"Cluster": item.cluster,
			"Bulan Invoice": formatBulan(item.bulan_invoice),
			"Tagihan": formatRupiah(item.tagihan),
			"Biaya Aplikasi": formatRupiah(item.margin),
			"Tanggal Bayar": item.tanggal_bayar,
			"Status Transaksi": item.transaction_status,
		}));

		const now = new Date();

		const day = String(now.getDate()).padStart(2, "0");
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const year = now.getFullYear();
		const dateFinal = `${day}-${month}-${year}`;

		exportToExcel(formatted, "export-data-iuran-"+dateFinal);
	};

	const exportToExcel = (data, fileName = "data") => {
		// ubah JSON → worksheet
		const worksheet = XLSX.utils.json_to_sheet(data);

		// buat workbook
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

		// convert ke buffer
		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});

		// save file
		const fileData = new Blob([excelBuffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(fileData, `${fileName}.xlsx`);
	};

	const formatBulan = (val) => {
		if (!val) return "-";

		const [year, month] = val.split("-");
		const date = new Date(year, month - 1);

		return date.toLocaleString("id-ID", {
			month: "long",
			year: "numeric",
		});
	};

	const handleFilterBulan = (bulan) => {
        setFilterBulan(bulan);

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
    }

	const handleInputPemasukan = () => {
		window.location.href = "/admin/input-laporan-keuangan"
	}

	const handleConfirmAlert = (alertState) => {
        if (alertState == "session") {
            setShowAlert(false)
            logout()
        } else if (alertState == "success") {
            setShowAlert(false)
            setSuccessMessage("")
        } else if (alertState == "error") {
            setShowAlert(false)
            setErrorMessageAlert("")
        } else if (alertState == "logout") {
            setShowAlert(false)
            setErrorMessageAlertLogout("")
            window.location.href="/admin/login"
        } else if (alertState == "validation") {
            setShowAlert(false)
            setValidationMessage("")
        } else if (alertState == "confirm") {
            handleDelete()
        }
    }

	const convertToDateInput = (tanggal) => {
		const bulan = {
			Januari: "01",
			Februari: "02",
			Maret: "03",
			April: "04",
			Mei: "05",
			Juni: "06",
			Juli: "07",
			Agustus: "08",
			September: "09",
			Oktober: "10",
			November: "11",
			Desember: "12",
		};

		const [hari, namaBulan, tahun] = tanggal.split(" ");

		return `${tahun}-${bulan[namaBulan]}-${hari.padStart(2, "0")}`;
	};

	const handleExportLaporanKeuangan = (data) => {
		const workbook = XLSX.utils.book_new();

		/*
		* ======================
		* SHEET 1 - SUMMARY
		* ======================
		*/

		const summaryData = [
			["LAPORAN KEUANGAN"],
			[],
				["Saldo Awal", data.summary.saldo_awal],
				["Total Pemasukan (Debit)", data.summary.total_debit],
				["Total Pengeluaran (Kredit)", data.summary.total_kredit],
				["Saldo Akhir", data.summary.total_saldo],
			[],
			["RINGKASAN PER BULAN"],
			["Bulan", "Total Transaksi", "Total Nominal"],
			...data.summary.detail_summary_bulan.map((item) => [
				item.bulan,
				item.total_transaksi,
				item.total_nominal,
			]),
		];

		const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

		XLSX.utils.book_append_sheet(
			workbook,
			wsSummary,
			"SUMMARY"
		);

		/*
		* ======================
		* SHEET 2 - REKENING KORAN
		* ======================
		*/

		let saldoBerjalan = 0;

		const rekeningKoranData = data.rekening_koran.map((item) => {
			const debit =
			item.jenis_transaksi.toLowerCase() === "debit"
				? item.nominal
				: 0;

			const kredit =
			item.jenis_transaksi.toLowerCase() === "kredit"
				? item.nominal
				: 0;

			saldoBerjalan += debit - kredit;

			return {
			Tanggal: item.tanggal_bayar,
			OrderID: item.order_id,
			Nama: item.nama,
			Cluster: item.cluster,
			Tipe: item.tipe_transaksi,
			Keterangan: item.deskripsi,
			Debit: debit,
			Kredit: kredit,
			Saldo: saldoBerjalan,
			};
		});

		const wsRekeningKoran = XLSX.utils.json_to_sheet(
			rekeningKoranData
		);

		XLSX.utils.book_append_sheet(
			workbook,
			wsRekeningKoran,
			"REKENING_KORAN"
		);

		/*
		* ======================
		* SHEET 3 - PENGGUNAAN DANA
		* ======================
		*/

		const penggunaanDanaData =
			data.penggunaan_dana.result.map((item) => ({
			Tanggal: item.tanggal_input,
			OrderID: item.order_id,
			Cluster: item.cluster,
			Nominal: item.nominal,
			Jenis: item.jenis_transaksi,
			}));

		const wsPenggunaanDana =
			XLSX.utils.json_to_sheet(penggunaanDanaData);

		XLSX.utils.book_append_sheet(
			workbook,
			wsPenggunaanDana,
			"PENGGUNAAN_DANA"
		);

		/*
		* ======================
		* SHEET 4 - PEMASUKAN DANA
		* ======================
		*/

		const pemasukanDanaData = data.rekening_koran
			.filter(
			(item) =>
				item.jenis_transaksi.toLowerCase() === "debit"
			)
			.map((item) => ({
			Tanggal: item.tanggal_bayar,
			Nama: item.nama,
			Cluster: item.cluster,
			Tipe: item.tipe_transaksi,
			JumlahBulan: item.jumlah_bulan,
			Nominal: item.nominal,
			}));

		const wsPemasukanDana = XLSX.utils.json_to_sheet(pemasukanDanaData);

		XLSX.utils.book_append_sheet(
			workbook,
			wsPemasukanDana,
			"PEMASUKAN_DANA"
		);

		/*
		* DOWNLOAD FILE
		* ======================
		*/

		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});

		const file = new Blob([excelBuffer], {
			type:
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(
			file,
			`Laporan_Keuangan_${new Date().getTime()}.xlsx`
		);
	}

	const statusBadge = (status, desc) => {
		switch (status) {
			case 1:
				return <div style={{ backgroundColor:'#FFF7E6', padding:5, borderRadius:10 }}>
					<div style={{ color:'#8A5A00', fontWeight:'bold', fontSize:12 }}>{desc}</div>
				</div>
			case 2:
				return <div style={{ backgroundColor:'#EAF1FF', padding:10, borderRadius:20 }}>
					<div style={{ color:'#1E4FA3', fontWeight:'bold', fontSize:12 }}>{desc}</div>
				</div>
			case 3:
				return <div style={{ backgroundColor:'#E7F7EE', padding:10, borderRadius:20 }}>
					<div style={{ color:'#0F7A42', fontWeight:'bold', fontSize:12 }}>{desc}</div>
				</div>
			case 4:
				return <div style={{ backgroundColor:'#FDECEC', padding:10, borderRadius:20 }}>
					<div style={{ color:'#B3261E', fontWeight:'bold', fontSize:12 }}>{desc}</div>
				</div>
			default:
				return null;
		}
	};
    
    return (
		
		<div className="container-fluid p-4 min-vh-100">

			<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
				<div style={{ display:'flex', justifyContent:'flex-start', alignItems:'center' }}>
					<div>
						<div style={{ fontSize:30, fontWeight:'bold' }}>Tarik Dana</div>
						<div style={{ fontSize:15 }}>Kelola dan pantau SLA tarik dana cluster Anda</div>
					</div>
				</div>
				<div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
					<div 
					style={{ backgroundColor:'#FFFFFF', border:'1px solid #002C00', padding:10, borderRadius:10, cursor:'pointer' }} onClick={() => setShowModalInputPengajuan(true)}>
						<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
							<img src={IconAdd} alt="logo" style={{ height:20, width:20 }}  />
							<div style={{ width:5 }} />
							<div style={{ color:'#002C00', fontWeight:'bold' }}>Input Pengajuan</div>
						</div>
					</div>
					<div style={{ width:10 }} />
					<div style={{ backgroundColor:'#FFFFFF', border:'1px solid #002C00', padding:10, borderRadius:10, cursor:'pointer' }}>
						<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
							<img src={IconExport} alt="logo" style={{ height:20, width:20 }}  />
							<div style={{ width:5 }} />
							<div style={{ color:'#002C00', fontWeight:'bold' }}>Export Data</div>
						</div>
					</div>
				</div>
			</div>

			<div style={{ height:30 }} />

			<div className="row mb-4">
				<div className="col-lg-4 mb-3">
					<div className="finance-card saldo">
						<div className="finance-icon">
							<img src={IconWallet} alt="logo" style={{ height:30, width:30 }} />
						</div>
						<div>
							<div className="finance-title">
								Menunggu Persetujuan
							</div>
							<div className="finance-value">
								{setTotalMenungguPersetujuan}
							</div>
							<div className="finance-sub-title">
								Total
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-4 mb-3">
					<div className="finance-card kredit">
						<div className="finance-icon">
							<img src={IconArrowRightUp} alt="logo" style={{ height:30, width:30, transform: "rotate(180deg)" }} />
						</div>
						<div>
							<div className="finance-title">
								Disetujui - Menunggu Cair
							</div>
							<div className="finance-value">
								{formatRupiah(TotalDisetujui)}
							</div>
							<div className="finance-sub-title">
								Siap dicairkan oleh Superadmin IPL-Q
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-4 mb-3">
					<div className="finance-card debit">
						<div className="finance-icon">
							<img src={IconArrowRightUp} alt="logo" style={{ height:30, width:30 }} />
						</div>
						<div>
							<div className="finance-title">
								Dana Tercairkan
							</div>
							<div className="finance-value">
								{formatRupiah(TotalCair)}
							</div>
							<div className="finance-sub-title">
								Total Dana Sudah Cair
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card border-0 shadow rounded-4 p-3">
				<div className="filter-container">
					<input
						type="text"
						className="filter-input"
						placeholder="Cari Cluster / Keperluan"
						value={GlobalSearch}
						onChange={(e) => setGlobalSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setCurrentPage(1);
								getListTarikDana("");
							}
						}}
					/>

					<select
						className="filter-select"
						value={FilterJenisTransaksi}
						onChange={(e) => {
							setFilterJenisTransaksi(e.target.value)
						}}
					>
						<option value="">Status Pengajuan</option>
						<option value="0">Menunggu</option>
						<option value="1">Disetujui</option>
						<option value="2">Ditolak</option>
					</select>

					<input
						type="month"
						className="filter-input"
						value={FilterBulan}
						onChange={(e) => handleFilterBulan(e.target.value)}
					/>

					<button
						className="btn-filter-lk"
						onClick={() => {
							setCurrentPage(1)
							setListTarikDana([])
							getListTarikDana("")
						}}
					>
						<div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
							<img src={IconFilter} alt="logo" style={{ height:15, width:15, filter:"brightness(0) invert(1)" }} />
							<div style={{ width:5 }} />
							<div>Filter</div>
						</div>
					</button>

					<button
						className="btn-reset-lk"
						onClick={() => {
							setCurrentPage(1)
							setGlobalSearch("")
							setFilterJenisTransaksi("")
							setFilterBulan("")
							setFilterBeginDate("")
							setFilterEndDate("")
							setListTarikDana([])
							getListTarikDana("reset")
						}}
					>
						<div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
							<img src={IconReset} alt="logo" style={{ height:15, width:15 }} />
							<div style={{ width:5 }} />
							<div>Reset</div>
						</div>
					</button>
				</div>

				<div className="lk-table">
					{ListTarikDana.length > 0 &&
					<div className="lk-header">
						<div>ID / Tanggal</div>
						<div>Keperluan</div>
						<div>Jumlah</div>
						<div>Status</div>
						<div>Aksi</div>
					</div>}
					{ListTarikDana?.length > 0 ?
					ListTarikDana?.map((item, index) => (
						<div className="lk-row" key={index}>
							<div className="lk-order">
								<div>
									<strong>{item.id_tarik_dana}</strong>
								</div>
								<div>
									{item.tanggal_input}
								</div>
							</div>

							<div>
								{item.keperluan}
							</div>

							<div>
								{formatRupiah(item.jumlah)}
							</div>

							<div>
								<div style={{ paddingBottom:10 }}>
									{statusBadge(item.status, item.tahap)}
								</div>
								<div className="stepper">
									{steps.map((step, index) => (
										<div className="step-item" key={step}>
										<div className={`circle ${item.status >= step ? "active" : ""}`}></div>

										{index < steps.length - 1 && (
											<div className={`line ${item.status > step ? "active" : ""}`}></div>
										)}
										</div>
									))}
								</div>
							</div>

							<div>
								<img src={IconEye} alt="logo" style={{ height:20, width:20, cursor:'pointer' }}  />
							</div>
						</div>
					))
					:
					<div className="empty-state">
						<div className="empty-title">
							Belum Ada Pengajuan
						</div>
						<div className="empty-description">
							Pengajuan penarikan dana Anda akan muncul di sini
							setelah melakukan pengajuan ke Superadmin melalui sistem.
						</div>
						<div className="empty-action">
							<button
								className="btn-add-transaction"
								onClick={() => setShowModalInputPengajuan(true)}
							>
								+ Input Pengajuan
							</button>
						</div>
					</div>}

				</div>

				{ListTarikDana.length > 0 &&
				<div className="d-flex justify-content-between align-items-center mt-3">
					<div style={{ fontWeight:'bold' }}>Total Data : {TotalRecords}</div>
					<div className="d-flex gap-2">
						<Pagination
							currentPage={CurrentPage}
							totalPage={TotalPage}
							onPageChange={(page) => {
								if (!LoadingLaporanKeuangan) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>}

				<ModalInputPengajuan
					showModal={ShowModalInputPengajuan}
					
					keperluan={Keperluan}
					onChangeKeperluan={(event) => setKeperluan(event.target.value)}
					jumlah={formatRupiah(Jumlah)}
					onChangeJumlah={(event) => {
						const value = event.target.value.replace(/\D/g, "")
						setJumlah(value)
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

				{/* {SessionMessage !== "" ?
				<SweetAlert 
					warning 
					show={ShowAlert}
					onConfirm={() => {
						setShowAlert(false)
						logout()
						window.location.href="/admin/login";
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
						history.replace("/dashboard")
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
						window.location.href="/admin/login";
					}}
					btnSize="sm">
					{ErrorMessageAlertLogout}
				</SweetAlert>
				:""} */}

			</div>
		</div>
	);
}



export default ListTarikDana;