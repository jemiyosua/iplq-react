import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination } from '../../../components';
import './fasilitas-booking.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FaMoneyBillWheat } from 'react-icons/fa6';
import { FaArrowAltCircleLeft, FaFileDownload } from 'react-icons/fa';
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

const FasilitasBooking = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListFasilitasBooking, setListFasilitasBooking] = useState([])

	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage, setRowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(0)
	const [TotalRecords, setTotalRecords] = useState(0)
	const [TotalAktif, setTotalAktif] = useState(0)
	const [TotalTidakAktif, setTotalTidakAktif] = useState(0)

	const [Loading, setLoading] = useState(false)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingFasilitasBooking, setLoadingFasilitasBooking] = useState(false)

	const [open,setOpen] = useState(true)

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterStatus, setFilterStatus] = useState('');

	useEffect(() => {
        window.scrollTo(0, 0)

        var CookieNama = getCookie("nama");
        setName(CookieNama)

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey === null || CookieParamKey === "" || CookieUsername === null || CookieUsername === ""){
            window.location.href="admin/login";
        }else{
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","FASILITAS"))
        }

    },[])

	useEffect(() => {
		getListFasilitasBooking("");
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

	const getListFasilitasBooking = (posisi) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		let fasilitasId = cookies.varCookieDonasiId

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
			"status": filterStatus,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingFasilitasBooking(true)

		var url = paths.URL_API_ADMIN + 'FasilitasBooking';
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
			setLoadingFasilitasBooking(false)

			if (data.error_code == "0") {
				setListFasilitasBooking(data.result)
				setTotalAktif(data.total_aktif)
				setTotalTidakAktif(data.total_tidak_aktif)
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
			setLoadingFasilitasBooking(false)

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
		const formatted = ListFasilitasBooking.map((item) => ({
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

		exportToExcel(formatted, "export-data-fasilitas-"+dateFinal);
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

	const handleDetailFasilitasiBooking = (id) => {
		console.log(id)
	}

	const handleBack = () => {
		window.location.href = "/admin/fasilitas"
	}
    
    return (
		<>
			{LoadingFasilitasBooking && <LoadingLogo />}

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
					<div className="d-flex justify-content-between align-items-center mb-3" onClick={() => handleBack()} style={{ cursor:'pointer' }}>
						<div className="d-flex justify-content-between align-items-center gap-2">
							<FaArrowAltCircleLeft />
							<h5 className="mb-0 fw-bold">List Fasilitas Booking</h5>
						</div>
					</div>

					<div className="row mb-3">
						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
							<small>Fasilitas Aktif</small>
							<h5 className="text-success">
								{TotalAktif}
							</h5>
							</div>
						</div>

						<div className="col-md-3">
							<div className="card p-3 rounded-4 shadow-sm">
							<small>Fasilitas Tidak Aktif</small>
							<h5 className="text-success">
								{TotalTidakAktif}
							</h5>
							</div>
						</div>
					</div>

					<div style={{ height:30 }} />

					<div className="filter-container">
						<input
							type="text"
							className="filter-input"
							placeholder="🔍 Cari Nama"
							value={GlobalSearch}
							onChange={(e) => setGlobalSearch(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setCurrentPage(1);
									getListFasilitasBooking("");
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
							<option value="">Status Fasilitas</option>
							<option value="1">Aktif</option>
							<option value="0">Tidak Aktif</option>
						</select>

						<button
							className="btn-filter"
							onClick={() => {
								setListFasilitasBooking([])
								setCurrentPage(1)
								getListFasilitasBooking("")
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
								getListFasilitasBooking("reset")
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
								<th>Booking ID</th>
								<th>Cluster</th>
								<th>Nama Pemesan</th>
								<th>Nama Fasilitas</th>
								<th>Jam Mulai</th>
								<th>Jumlah Orang</th>
								<th>Status Booking</th>
							</tr>
							</thead>
							<tbody>
								{ListFasilitasBooking.length > 0 ? ListFasilitasBooking?.map((item, index) => (
									<tr key={index} onClick={() => handleDetailFasilitasiBooking(item.id)} style={{ cursor:'pointer' }}>
										<td>{item.booking_id}</td>
										<td>{item.cluster}</td>
										<td>{item.nama}</td>
										<td>{item.nama_fasilitas}</td>
										<td>{item.jam_mulai_booking}</td>
										<td>{item.jumlah_orang}</td>
										<td>{statusBadge(item.status)}</td>
									</tr>
								))
								:
								<tr>
									<td colspan={7} style={{ color:'red', fontWeight:'bold', textAlign:'center' }}>Booking tidak tersedia</td>
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
									if (!LoadingFasilitasBooking) {
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

export default FasilitasBooking;