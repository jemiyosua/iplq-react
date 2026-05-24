import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination } from '../../../components';
import './donasi.css'
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

const Donasi = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListDonasi, setListDonasi] = useState([])
	const [ListTunggakan, setListTunggakan] = useState([])
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

	const [LoadingDonasi, setLoadingDonasi] = useState(false)

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

		console.log("MASUK IURAN")

        var CookieNama = getCookie("nama");
        setName(CookieNama)

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey === null || CookieParamKey === "" || CookieUsername === null || CookieUsername === ""){
            window.location.href="admin/login";
        }else{
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","DONASI"))
        }

    },[])

	useEffect(() => {
		getListDonasi("");
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

	const getListDonasi = (posisi) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		var cookieAccessLogin = getCookie("access");
		var cookieCluster = getCookie("cluster");
		var cookieClusterId = getCookie("cluster_id");

		let globalSearch = GlobalSearch
		let filterStatus = FilterStatus
		let filterBulan = FilterBulan
		if (posisi == "reset") {
			globalSearch = ""
			filterStatus = ""
			filterBulan = ""
		}

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"global_search": globalSearch,
			"status": filterStatus,
			"bulan_invoice": filterBulan,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingDonasi(true)

		var url = paths.URL_API_ADMIN + 'Donasi';
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
			setLoadingDonasi(false)

			if (data.error_code == "0") {
				setListDonasi(data.result)
				setTotalSettlement(data.total_settlement)
				setTotalPending(data.total_pending)
				setCollectionRate(data.collection_rate)
				setTotalPage(data.total_page)
				setTotalRecords(data.total_record)
				// setTotal(data.result_summary.total)
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
			setLoadingDonasi(false)

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
			case 1:
				return <div style={{ color:'#84cc16', fontWeight:'bold', fontSize:15 }}>Aktif</div>
			case 0:
				return <div style={{ color:'red', fontWeight:'bold', fontSize:15 }}>Tidak Aktif</div>
			default:
				return null;
		}
	};

	const handleExport = () => {
		const formatted = ListDonasi.map((item) => ({
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

		exportToExcel(formatted, "export-data-donasi-"+dateFinal);
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

	// ---------- SUMMARY DONASI ----------
	// 2. DATA PER BULAN
	const perBulanMap = {};

	ListDonasi.forEach((item) => {
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

	ListDonasi.forEach((item) => {
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
	// ---------- END OF SUMMARY DONASI ----------

	const handleDetailDonasi = (id) => {
		console.log(id)
		setCookie('varCookieDonasiId', id, {path: '/'})
		window.location.href = "/admin/donasi-detail"
	}
    
    return (
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

				{/* Header */}
				<div className="d-flex justify-content-between align-items-center mb-3">
					<div className="d-flex justify-content-between align-items-center gap-2">
						<FaMoneyBillWheat />
						<h5 className="mb-0 fw-bold">List Donasi</h5>
					</div>
				</div>

				<div className="row mb-3">
					<div className="col-md-3">
						<div className="card p-3 rounded-4 shadow-sm">
						<small>Total Donasi Terkumpul</small>
						<h5 className="text-success">
							{formatRupiah(TotalSettlement)}
						</h5>
						</div>
					</div>

					<div className="col-md-3">
						<div className="card p-3 rounded-4 shadow-sm">
						<small>Total Donasi Pending</small>
						<h5 className="text-warning">
							{formatRupiah(TotalPending)}
						</h5>
						</div>
					</div>

					<div className="col-md-3">
						<div className="card p-3 rounded-4 shadow-sm">
						<small>Collection Rate Donasi</small>
						<h5>{CollectionRate.toFixed(1)}%</h5>
						</div>
					</div>
				</div>

				<div style={{ height:30 }} />

				<div className="filter-container">
					<input
						type="text"
						className="filter-input"
						placeholder="🔍 Cari Donasi / Cluster"
						value={GlobalSearch}
						onChange={(e) => setGlobalSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setCurrentPage(1);
								getListDonasi("");
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
						<option value="">Status Donasi</option>
						<option value="1">Aktif</option>
						<option value="0">Tidak Aktif</option>
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
							setListDonasi([])
							setCurrentPage(1)
							getListDonasi("")
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
							getListDonasi("reset")
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

				{/* Table */}
				<div className="table-responsive">
					<table className="table align-middle">
						<thead style={{ backgroundColor: '#0b3d0b', color: '#FFFFFF' }}>
						<tr>
							<th style={{ width:150 }}>Nama Donasi</th>
							<th>Cluster</th>
							<th>Tanggal Mulai</th>
							<th>Tanggal Selesai</th>
							<th style={{ width:300 }}>Keterangan Donasi</th>
							<th>Donasi Minimal</th>
							<th>Status Donasi</th>
						</tr>
						</thead>
						<tbody>
							{ListDonasi.length > 0 ? ListDonasi?.map((item, index) => (
								<tr key={index} onClick={() => handleDetailDonasi(item.id)} style={{ cursor:'pointer' }}>
									<td>{item.nama_donasi}</td>
									<td>{item.cluster}</td>
									<td>{item.tanggal_mulai_donasi}</td>
									<td>{item.tanggal_selesai_donasi}</td>
									<td>{item.keterangan_donasi}</td>
									<td>{formatRupiah(item.donasi_minimal)}</td>
									<td>{statusBadge(item.status)}</td>
								</tr>
							))
							:
							<tr>
								<td colspan={7} style={{ color:'red', fontWeight:'bold', textAlign:'center' }}>Donasi tidak ditemukan</td>
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
								if (!LoadingDonasi) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>

			</div>
		</div>
	);
}

export default Donasi;