import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination } from '../../../components';
import './transaksi-iuran.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
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

const TransaksiIuran = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListIuran, setListIuran] = useState([])
	const [ListTunggakan, setListTunggakan] = useState([])
	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage, setRowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(0)
	const [TotalRecords, setTotalRecords] = useState(0)
	const [Total, setTotal] = useState(0)
	const [Terkumpul, setTerkumpul] = useState(0)
	const [BelumTerkumpul, setBelumTerkumpul] = useState(0)
	const [CollectionRate, setCollectionRate] = useState(0)

	const [Loading, setLoading] = useState(false)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingIuran, setLoadingIuran] = useState(false)

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
            dispatch(setForm("PageActive","TRANSAKSI_IURAN"))
        }

    },[])

	useEffect(() => {
		getListIuran("");
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

	const getListIuran = (posisi) => {
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
			"jenis_tagihan": 2,
			"access": cookieAccessLogin,
			"cluster_id": parseInt(cookieClusterId),
			"global_search": globalSearch,
			"transaction_status": filterStatus,
			"bulan_invoice": filterBulan,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingIuran(true)

		var url = paths.URL_API_ADMIN + 'BillsAnnual';
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
			setLoadingIuran(false)

			if (data.error_code === "0") {
				const collectionRate =
					data.result_summary.total > 0
						? (data.result_summary.terkumpul / data.result_summary.total) * 100
						: 0;
				setListIuran(data.result)
				setListTunggakan(data.result_top_tunggakan)
				setTotalPage(data.total_page)
				setTotalRecords(data.total_record)
				setTotal(data.result_summary.total)
				setTerkumpul(data.result_summary.terkumpul)
				setBelumTerkumpul(data.result_summary.belum)
				setCollectionRate(collectionRate)
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
			setLoadingIuran(false)

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
						<h5 className="mb-0 fw-bold">Iuran Warga</h5>
					</div>
				</div>

				<div className="row mb-3">
					<div className="col-md-3">
						<div className="card p-3 rounded-4 shadow-sm">
						<small>Total Tagihan</small>
						<h5>{formatRupiah(Total)}</h5>
						</div>
					</div>

					<div className="col-md-3">
						<div className="card p-3 rounded-4 shadow-sm">
						<small>Terkumpul</small>
						<h5 className="text-success">
							{formatRupiah(Terkumpul)}
						</h5>
						</div>
					</div>

					<div className="col-md-3">
						<div className="card p-3 rounded-4 shadow-sm">
						<small>Belum</small>
						<h5 className="text-danger">
							{formatRupiah(BelumTerkumpul)}
						</h5>
						</div>
					</div>

					<div className="col-md-3">
						<div className="card p-3 rounded-4 shadow-sm">
						<small>Collection Rate</small>
						<h5>{CollectionRate.toFixed(1)}%</h5>
						</div>
					</div>
				</div>

				{/* <ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData}>
						<XAxis dataKey="bulan" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="total" fill="#e5e7eb" />
						<Bar dataKey="bayar" fill="#22c55e" />
					</BarChart>
				</ResponsiveContainer> */}

				<div className="card p-3 rounded-4 shadow-sm mt-3">
					<h6 className="fw-bold">Top Tunggakan</h6>

					{ListTunggakan.map((item, i) => (
						<div key={i} className="d-flex justify-content-between">
							<span style={{ fontWeight:'bold' }}>{item.nama} ({item.cluster})</span>
							<span className="text-danger">
								{formatRupiah(item.total)}
							</span>
						</div>
					))}
				</div>

				<div style={{ height:30 }} />

				<div className="filter-container">
					<input
						type="text"
						className="filter-input"
						placeholder="🔍 Cari Order ID / Transaksi ID / Nama Warga / Cluster"
						value={GlobalSearch}
						onChange={(e) => setGlobalSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setCurrentPage(1);
								getListIuran("");
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
							getListIuran("")
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
							getListIuran("reset")
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
							<th>Order ID</th>
							<th>Transaksi ID</th>
							<th>Tagihan</th>
							<th>Biaya Aplikasi</th>
							<th>Nama</th>
							<th>No Rumah</th>
							<th>Cluster</th>
							<th>Bulan Tagihan</th>
							<th>Tanggal Bayar</th>
							<th>Status Transaksi</th>
							
						</tr>
						</thead>
						<tbody>
							{ListIuran?.map((item, index) => (
								<tr key={index}>
									<td>{item.order_id ? item.order_id : '-'}</td>
									<td>{item.transaction_id ? item.transaction_id : '-'}</td>
									<td>{formatRupiah(item.tagihan)}</td>
									<td>{formatRupiah(item.margin)}</td>
									<td style={{ fontWeight:'bold' }}>{item.nama_user}</td>
									<td>{item.nomor_rumah}</td>
									<td>{item.cluster}</td>
									<td>{formatBulan(item.bulan_invoice)}</td>
									<td>{item.tanggal_bayar ? item.tanggal_bayar : '-'}</td>
									<td>{statusBadge(item.transaction_status)}</td>
								</tr>
							))}
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
								if (!LoadingIuran) {
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

export default TransaksiIuran;