import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination } from '../../../components';
import './donasi-detail.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FaMoneyBillWheat } from 'react-icons/fa6';
import { FaFileDownload } from 'react-icons/fa';
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
import { IconCheck, IconExport } from '../../../assets';

const DonasiDetail = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListDonasiDetail, setListDonasiDetail] = useState([])

	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage, setRowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(0)
	const [TotalRecords, setTotalRecords] = useState(0)
	const [Total, setTotal] = useState(0)
	const [TotalSettlement, setTotalSettlement] = useState(0)
	const [TotalPending, setTotalPending] = useState(0)
	const [CollectionRate, setCollectionRate] = useState(0)

	const [Loading, setLoading] = useState(false)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingDonasiDetail, setLoadingDonasiDetail] = useState(false)

	const [open,setOpen] = useState(true)

	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalRumah, setTotalRumah] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	const [TotalTransaksi, setTotalTransaksi] = useState(0)
	const [TotalPembayaran, setTotalPembayaran] = useState(0)

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');
	const [FilterPembayaran, setFilterPembayaran] = useState('');
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
			if (cookies.varCookieDonasiId == "" || cookies.varCookieDonasiId == undefined) {
				window.location.href="/admin/donasi";
			} else {
				dispatch(setForm("ParamKey",CookieParamKey))
				dispatch(setForm("Username",CookieUsername))
				dispatch(setForm("PageActive","DONASI"))
			}
        }

    },[])

	useEffect(() => {
		getListDonasiDetail("");
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

	const toggleSidebar = () =>{
		setOpen(!open)
	}

	const getListDonasiDetail = (posisi) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		let donasiId = cookies.varCookieDonasiId

		let globalSearch = GlobalSearch
		let filterStatus = FilterStatus
		let filterPembayaran = FilterPembayaran
		let filterBulan = FilterBulan
		if (posisi == "reset") {
			globalSearch = ""
			filterStatus = ""
			filterPembayaran = ""
			filterBulan = ""
		}

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"id_donasi": parseInt(donasiId),
			"global_search": globalSearch,
			"status_transaksi": filterStatus,
			"metode_pembayaran": filterPembayaran,
			"bulan_invoice": filterBulan,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingDonasiDetail(true)

		var url = paths.URL_API_ADMIN + 'DonasiDetail';
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
			setLoadingDonasiDetail(false)

			if (data.error_code == "0") {
				removeCookie('varCookieDonasiId', { path: '/'})

				setListDonasiDetail(data.result)
				setTotalSettlement(data.total_settlement)
				setTotalPending(data.total_pending)
				setCollectionRate(data.collection_rate)
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
			setLoadingDonasiDetail(false)

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
				return <div style={{ color:'red', fontWeight:'bold', fontSize:15 }}>{status}</div>
			default:
				return null;
		}
	};

	const handleExport = () => {
		const formatted = ListDonasiDetail.map((item) => ({
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

		exportToExcel(formatted, "export-data-DonasiDetail-"+dateFinal);
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

	// ---------- SUMMARY DonasiDetail ----------
	// 2. DATA PER BULAN
	const perBulanMap = {};

	ListDonasiDetail.forEach((item) => {
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

	ListDonasiDetail.forEach((item) => {
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
	// ---------- END OF SUMMARY DonasiDetail ----------

	const handleDetailDonasiDetail = (id) => {
		console.log(id)
	}
    
    return (
		<div className="container-fluid p-4 min-vh-100">

			<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
				<div style={{ display:'flex', justifyContent:'flex-start', alignItems:'center' }}>
					<div>
						<div style={{ fontSize:30, fontWeight:'bold' }}>Donasi Detail</div>
						<div style={{ fontSize:15 }}>Kelola dan pantau semua transaksi donasi</div>
					</div>
				</div>
				<div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
					<div style={{ backgroundColor:'#FFFFFF', border:'1px solid #002C00', padding:10, borderRadius:10, cursor:'pointer' }} onClick={() => handleExport()}>
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
							💰
						</div>
						<div>
							<div className="finance-title">
								Total Donasi Terkumpul
							</div>
							<div className="finance-value">
								{formatRupiah(TotalSettlement)}
							</div>
							<div className="finance-sub-title">
								Saldo Dana Masuk
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-4 mb-3">
					<div className="finance-card kredit">
						<div className="finance-icon">
							📥
						</div>
						<div>
							<div className="finance-title">
								Total Donasi Pending
							</div>
							<div className="finance-value">
								{formatRupiah(TotalPending)}
							</div>
							<div className="finance-sub-title">
								Total Dana Belum Masuk
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-4 mb-3">
					<div className="finance-card debit">
						<div className="finance-icon">
							📤
						</div>
						<div>
							<div className="finance-title">
								Collection Rate
							</div>
							<div className="finance-value">
								{CollectionRate.toFixed(1)}%
							</div>
							<div className="finance-sub-title">
								Kolektibilitas Dana Terkumpul
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
						placeholder="🔍 Cari Nama Warga"
						value={GlobalSearch}
						onChange={(e) => setGlobalSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setCurrentPage(1);
								getListDonasiDetail("");
							}
						}}
					/>

					<select
						className="filter-select"
						value={FilterPembayaran}
						onChange={(e) => {
							setFilterPembayaran(e.target.value)
						}}
					>
						<option value="">Metode Pembayaran</option>
						<option value="qris">QRIS</option>
						<option value="va">Virtual Account</option>
					</select>

					<select
						className="filter-select"
						value={FilterStatus}
						onChange={(e) => {
							setFilterStatus(e.target.value)
						}}
					>
						<option value="">Status Transaksi</option>
						<option value="settlement">Settlement</option>
						<option value="pending">Pending</option>
					</select>

					<input
						type="month"
						className="filter-input"
						value={FilterBulan}
						onChange={(e) => setFilterBulan(e.target.value)}
					/>

					<button
						className="btn-filter"
						onClick={() => {
							setCurrentPage(1)
							getListDonasiDetail("")
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
							getListDonasiDetail("reset")
						}}
					>
						Reset
					</button>

					<button
						className="btn-export"
						onClick={() => {
							handleExport()
						}}
					>
						<FaFileDownload /> Export Data
					</button>
					
				</div>

				<div className="table-responsive">
					<table className="table align-middle">
						<thead style={{ backgroundColor: '#0b3d0b', color: '#FFFFFF' }}>
						<tr>
							<th>Order ID</th>
							<th>Nominal Donasi</th>
							<th>Metode Pembayaran</th>
							<th>Pembayaran</th>
							<th>Cluster</th>
							<th>Nama</th>
							<th>Tanggal Transaksi</th>
							<th>Tanggal Bayar</th>
							<th>Status Transaksi</th>
						</tr>
						</thead>
						<tbody>
							{ListDonasiDetail?.length > 0 ? ListDonasiDetail?.map((item, index) => (
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

				<div className="d-flex justify-content-between align-items-center mt-3">
					<div style={{ fontWeight:'bold' }}>Total Data : {TotalRecords}</div>
					<div className="d-flex gap-2">
						<Pagination
							currentPage={CurrentPage}
							totalPage={TotalPage}
							onPageChange={(page) => {
								if (!LoadingDonasiDetail) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>

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
				:""}

			</div>
		</div>
	);
}

export default DonasiDetail;