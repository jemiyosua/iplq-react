import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination } from '../../../components';
import './data-warga.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FaMoneyBillWheat, FaPeopleGroup, FaRepeat } from 'react-icons/fa6';
import { FaArrowAltCircleLeft, FaFileDownload, FaSave } from 'react-icons/fa';
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
import LoadingLogo from '../../../components/molecules/LoadingLogo';

const DataWargaImport = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListIuran, setListIuran] = useState([])
	const [ListDataSheet, setListDataSheet] = useState([])
	const [ListDataWarga, setListDataWarga] = useState([])
	
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage, setRowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(0)
	const [TotalRecords, setTotalRecords] = useState(0)
	const [Total, setTotal] = useState(0)
	const [Terkumpul, setTerkumpul] = useState(0)
	const [BelumTerkumpul, setBelumTerkumpul] = useState(0)
	const [CollectionRate, setCollectionRate] = useState(0)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingPreview, setLoadingPreview] = useState(false)
	const [LoadingInsertDataWarga, setLoadingInsertDataWarga] = useState(false)

	const [open,setOpen] = useState(true)

	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalRumah, setTotalRumah] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	const [TotalTransaksi, setTotalTransaksi] = useState(0)
	const [TotalPembayaran, setTotalPembayaran] = useState(0)

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');

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
            dispatch(setForm("PageActive","DATA_WARGA"))
        }

		getSheetData()

    },[])

	useEffect(() => {
		// getListIuran("");
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
			var sheetId = LongSecretCookie[6];
			var sheetName = LongSecretCookie[7];
		
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
			} else if (tipe === "sheet_id") {
				return sheetId;
			} else if (tipe === "sheet_name") {
				return sheetName;
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

	const toggleSidebar = () =>{
		setOpen(!open)
	}

	const getSheetData = async () => {
		const sheetId = getCookie("sheet_id");
		const sheetName = getCookie("sheet_name");
		const urlSheet = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

		console.log(urlSheet)

		const responseSheet = await fetch(urlSheet);
		const dataSheet = await responseSheet.json();

		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "PREVIEW",
			"list_data_warga": dataSheet
		});

		setLoadingPreview(true)

		var url = paths.URL_API_ADMIN + 'DataWarga';
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
			setLoadingPreview(false)

			if (data.error_code == "0") {
				setListDataSheet(data.result)
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
			setLoadingPreview(false)

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
	};

	const handleInsertDataWarga = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "INSERT",
			"list_data_warga": ListDataSheet
		});

		setLoadingInsertDataWarga(true)

		var url = paths.URL_API_ADMIN + 'DataWarga';
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
			setLoadingInsertDataWarga(false)

			if (data.error_code == "0") {
				setListDataSheet([])
				setSuccessMessage("Data warga berhasil disimpan");
				setShowAlert(true);
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
			setLoadingInsertDataWarga(false)

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

	const statusBadge = (status) => {
		switch (status) {
			case "settlement":
				return <div style={{ color:'#84cc16', fontWeight:'bold', fontSize:15 }}>{status}</div>
			case "pending":
				return <div style={{ color:'orange', fontWeight:'bold', fontSize:15 }}>{status}</div>
			default:
				return null;
		}
	};

	const handleExport = () => {
		const formatted = ListIuran.map((item) => ({
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

	// ---------- SUMMARY IURAN ----------
	// 2. DATA PER BULAN
	const perBulanMap = {};

	ListIuran.forEach((item) => {
		const bulan = item.bulan_invoice;

		if (!perBulanMap[bulan]) {
			perBulanMap[bulan] = {
				bulan,
				total: 0,
				bayar: 0,
			};
		}

		const nominal = Number(item.tagihan || 0);

		perBulanMap[bulan].total += nominal;

		if (item.transaction_status === "settlement") {
			perBulanMap[bulan].bayar += nominal;
		}
	});

	const chartData = Object.values(perBulanMap);

	// 4. PER CLUSTER
	const clusterMap = {};

	ListIuran.forEach((item) => {
		const cluster = item.cluster;

		if (!clusterMap[cluster]) {
			clusterMap[cluster] = {
				cluster,
				total: 0,
				bayar: 0,
			};
		}

		const nominal = Number(item.tagihan || 0);

		clusterMap[cluster].total += nominal;

		if (item.transaction_status === "settlement") {
			clusterMap[cluster].bayar += nominal;
		}
	});

	const clusterData = Object.values(clusterMap);
	// ---------- END OF SUMMARY IURAN ----------

	const handleBack = () => {
		window.location.href = "/admin/data-warga"
	}
    
    return (
		<>
			{LoadingPreview && <LoadingLogo />}
			
			<div className="container-fluid p-4 min-vh-100">
				<div className="card border-0 shadow rounded-4 p-3">

					{SessionMessage !== "" ?
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
							history.replace("/admin/data-warga")
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
					:""}

					{/* Header */}
					<div className="d-flex justify-content-between align-items-center mb-3" onClick={() => handleBack()} style={{ cursor:'pointer' }}>
						<div className="d-flex justify-content-between align-items-center gap-2">
							<FaArrowAltCircleLeft width={100} height={100} />
							<h5 className="mb-0 fw-bold">Import Data Warga</h5>
						</div>
					</div>

					{/* <div style={{ height:30 }} /> */}

					<div className="filter-container-data-warga">
						<button
							className="btn-export-data-warga"
							onClick={() => {
								getSheetData()
							}}
						>
							<FaRepeat /> Refresh Data
						</button>

						{ListDataSheet.length > 0 &&
						<button
							className="btn-save-data-warga"
							onClick={() => {
								handleInsertDataWarga()
							}}
						>
							<FaSave /> Simpan Data Warga
						</button>}
						
					</div>

					{ListDataSheet?.length > 0 &&
					<div className="row mb-3">
						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
								<small>Total Rumah</small>
								<div className="d-flex justify-content-start align-items-center gap-2">
									<FaPeopleGroup />
									<h5>100</h5>
								</div>
							</div>
						</div>

						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
							<small>Total Warga</small>
								<div className="d-flex justify-content-start align-items-center gap-2">
									<FaPeopleGroup />
									<h5>100</h5>
								</div>
							</div>
						</div>
					</div>}

					<div className="table-responsive">
						<table className="table align-middle">
							<thead style={{ backgroundColor: '#0b3d0b', color: '#FFFFFF' }}>
							<tr>
								<th>Cluster</th>
								<th>Nama</th>
								<th>Nomor HP</th>
								<th>Email</th>
								<th>Tanggal Lahir</th>
								<th>Role</th>
								<th>Alamat</th>
								<th>Nomor Rumah</th>
								<th>Luas Tanah</th>
								<th>Luas Bangunan</th>
								<th>Agama</th>
								<th>Pekerjaan</th>
								<th>Jenis Kelamin</th>
								<th>Status Serah Terima</th>
								<th>Status Ditempati</th>
							</tr>
							</thead>
							<tbody>
								{ListDataSheet?.length > 0 ? ListDataSheet?.map((item, index) => (
									<tr key={index}>
										<td>{item.cluster}</td>
										<td>{item.nama}</td>
										<td>{item.nomor_hp}</td>
										<td>{item.email}</td>
										<td>{item.tanggal_lahir}</td>
										<td>{item.role}</td>
										<td>{item.alamat}</td>
										<td>{item.nomor_rumah}</td>
										<td>{item.luas_tanah}</td>
										<td>{item.luas_bangunan}</td>
										<td>{item.agama}</td>
										<td>{item.pekerjaan}</td>
										<td>{item.jenis_kelamin}</td>
										<td>{item.status_serah_terima_teks}</td>
										<td>{item.status_ditempati_teks}</td>
									</tr>
								))
								:
								<tr>
									<td colspan={15} style={{ color:'red', fontWeight:'bold', textAlign:'center' }}>Belum ada data terbaru<br />dari cluster Anda</td>
								</tr>}
							</tbody>
						</table>
					</div>

				</div>
			</div>
		</>
	);
}

export default DataWargaImport;