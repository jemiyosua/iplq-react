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
import { FaHouse, FaMoneyBillWheat, FaPeopleGroup } from 'react-icons/fa6';
import { FaFileDownload, FaSave } from 'react-icons/fa';
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
import { IconCheck } from '../../../assets';

const DataWarga = () => {
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
	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalWargaAktif, setTotalWargaAktif] = useState(0)
	const [TotalWargaTidakAktif, setTotalWargaTidakAktif] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingDataWarga, setLoadingDataWarga] = useState(false)
	const [LoadingPreview, setLoadingPreview] = useState(false)
	const [LoadingInsertDataWarga, setLoadingInsertDataWarga] = useState(false)

	const [open,setOpen] = useState(true)

	

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

		getListDataWarga()

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

	const getListDataWarga = async (posisi) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		let globalSearch = GlobalSearch
		let filterStatus = FilterStatus
		if (posisi == "reset") {
			globalSearch = ""
			filterStatus = ""
		}

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"global_search": globalSearch,
			"status_aktif": filterStatus,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingDataWarga(true)

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
			setLoadingDataWarga(false)

			if (data.error_code == "0") {
				setListDataWarga(data.result)
				setTotalRecords(data.total_record)
				setTotalPage(data.total_page)
				setTotalCluster(data.total_cluster)
				setTotalWargaAktif(data.total_aktif)
				setTotalWargaTidakAktif(data.total_tidak_aktif)
				setTotalWarga(data.total_warga)
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
			setLoadingDataWarga(false)

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

	const handleImportFromSheet = () => {
		window.location.href = "/admin/data-warga-import"
	}
    
    return (
		<>
			{LoadingDataWarga && <LoadingLogo />}

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
					<div className="d-flex justify-content-between align-items-center mb-3">
						<div className="d-flex justify-content-between align-items-center gap-2">
							<FaPeopleGroup />
							<h5 className="mb-0 fw-bold">Data Warga</h5>
						</div>
					</div>

					<div className="row mb-3">
						{getCookie("username") == "superadmin" &&
						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
								<small>Total Cluster</small>
								<div className="d-flex justify-content-start align-items-center gap-2">
									<FaHouse />
									<h5>{TotalCluster}</h5>
								</div>
							</div>
						</div>}

						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
							<small>Total Warga</small>
								<div className="d-flex justify-content-start align-items-center gap-2">
									<FaPeopleGroup />
									<h5>{TotalWarga}</h5>
								</div>
							</div>
						</div>

						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
							<small>Total Warga Aktif</small>
								<div className="d-flex justify-content-start align-items-center gap-2">
									<FaPeopleGroup />
									<h5>{TotalWargaAktif}</h5>
								</div>
							</div>
						</div>

						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
							<small>Total Warga Tidak Aktif</small>
								<div className="d-flex justify-content-start align-items-center gap-2">
									<FaPeopleGroup />
									<h5>{TotalWargaTidakAktif}</h5>
								</div>
							</div>
						</div>
					</div>

					<div style={{ height:30 }} />

					<div className="filter-container">
						<input
							type="text"
							className="filter-input"
							placeholder="🔍 Cari Cluster / Nama Warga"
							value={GlobalSearch}
							onChange={(e) => setGlobalSearch(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setCurrentPage(1);
									getListDataWarga("");
								}
							}}
						/>

						<select
							className="filter-select"
							value={FilterStatus}
							onChange={(e) => {
								setFilterStatus(e.target.value)
							}}
						>
							<option value="">Status Warga</option>
							<option value="1">Aktif</option>
							<option value="0">Tidak Aktif</option>
						</select>

						{/* <input
							type="month"
							className="filter-input"
							value={FilterBulan}
							onChange={(e) => setFilterBulan(e.target.value)}
						/> */}

						<button
							className="btn-filter-data-warga"
							onClick={() => {
								setListDataWarga([])
								setCurrentPage(1)
								getListDataWarga("")
							}}
						>
							Filter
						</button>

						<button
							className="btn-reset"
							onClick={() => {
								setCurrentPage(1)
								setGlobalSearch("")
								setFilterStatus("")
								setFilterBulan("")
								getListDataWarga("reset")
							}}
						>
							Reset
						</button>

						<button
							className="btn-export-data-warga"
							onClick={() => {
								handleExport()
							}}
						>
							<FaFileDownload /> Export Data
						</button>

						<button
							className="btn-import-data-warga"
							onClick={() => {
								handleImportFromSheet()
							}}
						>
							<FaFileDownload /> Import From Sheets
						</button>
					</div>
				
					<div className="table-responsive">
						<table className="table align-top">
							<thead style={{ backgroundColor: '#0b3d0b', color: '#FFFFFF' }}>
							<tr>
								<th>Cluster</th>
								<th>Detail Warga</th>
								<th>Detail Rumah</th>
								<th style={{ textAlign:'center' }}>Status</th>
								<th style={{ textAlign:'center' }}>Serah Terima</th>
								<th style={{ textAlign:'center' }}>Ditempati</th>
							</tr>
							</thead>
							<tbody>
								{ListDataWarga?.length > 0 ? ListDataWarga?.map((item, index) => (
									<tr key={index}>
										<td>{item.cluster}</td>
										<td>
											<span style={{ fontWeight:'bold', fontSize:15 }}>{item.nama}</span>
											<br />
											<span style={{ fontSize:12 }}>Nomor HP: {item.no_hp ? item.no_hp : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Email: {item.email ? item.email : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Tanggal Lahir: {item.tanggal_lahir ? item.tanggal_lahir : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Jenis Kelamin: {item.jenis_kelamin ? item.jenis_kelamin : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Agama: {item.agama ? item.agama : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Role: {item.role ? item.role : "-"}</span>
										</td>
										<td>
											<span style={{ fontSize:12 }}>Alamat: {item.alamat ? item.alamat : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Nomor Rumah: {item.nomor_rumah ? item.nomor_rumah : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Luas Tanah (m2): {item.luas_tanah ? item.luas_tanah : "-"}</span>
											<br />
											<span style={{ fontSize:12 }}>Luas Bangunan (m2): {item.luas_bangunan ? item.luas_bangunan : "-"}</span>
										</td>
										<td style={{ textAlign:'center', color:item.status_aktif == 1 ? "green" : "red" }}>{item.status_aktif == 1 ? "Aktif" : "Tidak Aktif"}</td>
										<td>
											{item.status_serah_terima == 1 ?
											<div style={{ display:'flex', justifyContent:'center' }}>
												<img src={IconCheck} alt="logo" style={{ height:30, width:30 }}  /> 
											</div>
											:
											<div style={{ display:'flex', justifyContent:'center' }}>-</div>}
										</td>
										<td>
											{item.status_ditempati == 1 ?
											<div style={{ display:'flex', justifyContent:'center' }}>
												<img src={IconCheck} alt="logo" style={{ height:30, width:30 }}  /> 
											</div>
											:
											<div style={{ display:'flex', justifyContent:'center' }}>-</div>}
										</td>
									</tr>
								))
								:
								<tr>
									<td colspan={15} style={{ color:'red', fontWeight:'bold', textAlign:'center' }}>Data tidak ditemukan</td>
								</tr>
								}
							</tbody>
						</table>
					</div>

					{/* Footer */}
					<div className="d-flex justify-content-between align-items-center mt-3">
						{/* <small className="text-muted">Total Data : {TotalRecords}</small> */}

						<div style={{ fontWeight:'bold' }}>Total Data : {TotalRecords}</div>

						<div className="d-flex gap-2">
							<Pagination
								currentPage={CurrentPage}
								totalPage={TotalPage}
								onPageChange={(page) => {
									if (!LoadingDataWarga) {
										setCurrentPage(page);
									}
								}}
							/>
						</div>
					</div>

				</div>
			</div>
		</>
	);
}

export default DataWarga;