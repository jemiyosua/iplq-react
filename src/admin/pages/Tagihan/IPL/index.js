import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination } from '../../../components';
import './ipl.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';

import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import { IconArrowRightUp, IconExport, IconWallet } from '../../../assets';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const IPL = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [CurrentPage, setCurrentPage] = useState(1);

	const [ListIPL, setListIPL] = useState([])
	const [ListTunggakan, setListTunggakan] = useState([])
	const [TotalPage, setTotalPage] = useState(0)
	const [TotalRecords, setTotalRecords] = useState(0)

	const [LoadingIPL, setLoadingIPL] = useState(false)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingDashboard, setLoadingDashboard] = useState(false)

	const [open,setOpen] = useState(true)

	const [TotalSettlement, setTotalSettlement] = useState(0)
	const [TotalPending, setTotalPending] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	const [TotalTransaksi, setTotalTransaksi] = useState(0)
	const [TotalPembayaran, setTotalPembayaran] = useState(0)
	const [search, setSearch] = useState('');

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
            dispatch(setForm("PageActive","TAGIHAN_IPL"))
        }

		getListIPLAnnualAll()

    },[])

	useEffect(() => {
		getListIPLAnnualAll("");
	}, [CurrentPage]);

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

	const getListIPLAnnualAll = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		var cookieAccessLogin = getCookie("access");
		var cookieCluster = getCookie("cluster");
		var cookieClusterId = getCookie("cluster_id");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"jenis_tagihan": 1,
			"access": cookieAccessLogin,
			"cluster_id": parseInt(cookieClusterId),
			"page": CurrentPage,
			"row_page": 10,
			"order_by": "",
			"order": ""
		});

		setLoadingIPL(true)

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
			setLoadingIPL(false)

			if (data.error_code === "0") {
				setListIPL(data.result)
				setTotalPage(data.total_page)
				setTotalRecords(data.total_record)

				setTotalSettlement(data.result_summary.terkumpul)
				setTotalPending(data.result_summary.belum)

				setListTunggakan(data.result_top_tunggakan)
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
			setLoadingIPL(false)

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
				return <span className="badge bg-success-subtle text-success">Settlement</span>;
			case "pending":
				return <span className="badge bg-warning-subtle text-warning">Pending</span>;
			default:
				return null;
		}
	};

	const handleExport = () => {
		const formatted = ListIPL.map((item) => ({
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
    
    return (
		<div className="container-fluid p-4 min-vh-100">

			<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
				<div style={{ display:'flex', justifyContent:'flex-start', alignItems:'center' }}>
					<div>
						<div style={{ fontSize:30, fontWeight:'bold' }}>Tagihan IPL</div>
						<div style={{ fontSize:15 }}>Kelola dan pantau semua transaksi keuangan</div>
					</div>
				</div>
				<div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
					{/* <div style={{ backgroundColor:'#FFFFFF', border:'1px solid #002C00', padding:10, borderRadius:10, cursor:'pointer' }} onClick={() => handleInputPemasukan()}>
						<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
							<img src={IconAdd} alt="logo" style={{ height:20, width:20 }}  />
							<div style={{ width:5 }} />
							<div style={{ color:'#002C00', fontWeight:'bold' }}>Input Pemasukan</div>
						</div>
					</div>
					<div style={{ width:10 }} /> */}
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

			<div className="row mb-3">
				<div className="col-lg-3 mb-3">
					<div className="finance-card saldo-awal">
						<div className="finance-icon">
							<img src={IconWallet} alt="logo" style={{ height:30, width:30 }} />
						</div>
						<div>
							<div className="finance-title">
								Saldo Terkumpul
							</div>
							<div className="finance-value">
								{/* {formatRupiah(TotalSettlement)} */}
							</div>
							<div className="finance-sub-title">
								Saldo IPL
							</div>
						</div>
					</div>
				</div>

				<div className="col-lg-3 mb-3">
					<div className="finance-card kredit">
						<div className="finance-icon">
							<img src={IconArrowRightUp} alt="logo" style={{ height:30, width:30, transform: "rotate(180deg)" }} />
						</div>
						<div>
							<div className="finance-title">
								Total IPL Pending
							</div>
							<div className="finance-value">
								{/* {formatRupiah(TotalPending)} */}
							</div>
							<div className="finance-sub-title">
								IPL Pending
							</div>
						</div>
					</div>
				</div>

				<div className="col-lg-3 mb-3">
					<div className="finance-card saldo-akhir">
						<div className="finance-icon">
							<img src={IconWallet} alt="logo" style={{ height:30, width:30 }} />
						</div>
						<div>
							<div className="finance-title">
								Collection Rate Donasi
							</div>
							<div className="finance-value">
								{/* {CollectionRate.toFixed(1)}% */}
							</div>
							<div className="finance-sub-title">
								Collection Rate Donasi
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card border-0 shadow rounded-4 p-3">
				<div>Top Tunggakan</div>
			</div>

			<div style={{ height:30 }} />
			
			<div className="card border-0 shadow rounded-4 p-3">

				{/* Search + Export */}
				<div className="d-flex justify-content-between mb-3">
					<input
						type="text"
						className="form-control w-75"
						placeholder="🔍 Cari data..."
					/>
				</div>

				{/* Table */}
				<div className="table-responsive">
					<table className="table align-middle">
						<thead style={{ background: '#0b3d0b', color: 'white' }}>
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
							<th>Status</th>
							
						</tr>
						</thead>
						<tbody>
							{ListIPL?.map((item, index) => (
								<tr key={index}>
									<td>{item.order_id ? item.order_id : '-'}</td>
									<td>{item.transaction_id ? item.transaction_id : '-'}</td>
									<td>{item.tagihan}</td>
									<td>{item.margin}</td>
									<td>{item.nama_user}</td>
									<td>{item.nomor_rumah}</td>
									<td>{item.cluster}</td>
									<td>{item.bulan_invoice}</td>
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
								if (!LoadingIPL) {
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

export default IPL;