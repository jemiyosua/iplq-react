import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, CardDashboard } from '../../components';
import './dashboard.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FaBars, FaBell, FaCheckCircle, FaClock, FaCreditCard, FaHome, FaMoneyBill, FaMoneyCheck, FaPercent, FaTimesCircle, FaUserCircle, FaUserClock, FaUserFriends, FaUserPlus, FaUsers, FaUserSlash } from 'react-icons/fa';
import { FcFactory, FcHome } from 'react-icons/fc';
import { FaBilibili, FaHandHoldingDollar, FaHouseChimneyUser, FaMoneyBill1Wave, FaMoneyBillTransfer, FaMoneyBillWheat, FaPeopleGroup } from 'react-icons/fa6';
import { HiOutlineHomeModern } from "react-icons/hi2";
import { BsHouseDoor } from "react-icons/bs";
import { MdOutlinePayments, MdOutlinePercent, MdPeopleOutline } from "react-icons/md";
import { GrTransaction } from 'react-icons/gr';

import 'bootstrap/dist/css/bootstrap.min.css';

import { Doughnut } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Legend } from "chart.js";
// ChartJS.register(ArcElement, Tooltip, Legend);
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [ListSiswa, setListSiswa] = useState([])
	const [Loading, setLoading] = useState(false)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingDashboard, setLoadingDashboard] = useState(false)

	const [open,setOpen] = useState(true)

	const [ListTunggakan, setListTunggakan] = useState([])
	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalRumah, setTotalRumah] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	const [TotalTransaksi, setTotalTransaksi] = useState(0)
	const [TotalTransaksiPending, setTotalTransaksiPending] = useState(0)
	const [TotalTransaksiSettlement, setTotalTransaksiSettlement] = useState(0)
	const [TotalTagihan, setTotalTagihan] = useState(0)
	const [TotalTagihanTerkumpul, setTotalTagihanTerkumpul] = useState(0)
	const [TotalTagihanTertunda, setTotalTagihanTertunda] = useState(0)
	const [CollectionRate, setCollectionRate] = useState(0)

    const dataBar = [
		{ name: "Jan", pemasukan: 130, pengeluaran: 90 },
		{ name: "Feb", pemasukan: 140, pengeluaran: 100 },
		{ name: "Mar", pemasukan: 125, pengeluaran: 85 },
		{ name: "Apr", pemasukan: 145, pengeluaran: 95 },
		{ name: "May", pemasukan: 135, pengeluaran: 90 },
		{ name: "Jun", pemasukan: 140, pengeluaran: 100 },
	];

	const dataLine = [
		{ name: "Jan", value: 132 },
		{ name: "Feb", value: 138 },
		{ name: "Mar", value: 125 },
		{ name: "Apr", value: 142 },
		{ name: "May", value: 135 },
		{ name: "Jun", value: 140 },
	];

	const dataPie = [
		{ name: "Lunas", value: 60 },
		{ name: "Tertunda", value: 20 },
		{ name: "Terlambat", value: 20 },
	];

	const COLORS = ["#84cc16", "#94a3b8", "#ef4444"];

	useEffect(() => {
        window.scrollTo(0, 0)

		console.log("masuk dashboard")

        var CookieNama = getCookie("nama");
        setName(CookieNama)

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey === null || CookieParamKey === "" || CookieUsername === null || CookieUsername === ""){
            window.location.href="admin/login";
        }else{
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","DASHBOARD"))
        }

		getStatsDashboard()

    },[])

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

	const getStatsDashboard = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		var cookieAccessLogin = getCookie("access");
		var cookieCluster = getCookie("cluster");
		var cookieClusterId = getCookie("cluster_id");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"access": cookieAccessLogin,
			"jenis_tagihan": 2,
			"cluster_id": parseInt(cookieClusterId),
			"page": 1,
			"row_page": -1,
			"order_by": "",
			"order": ""

		});

		setLoadingDashboard(true)

		var url = paths.URL_API_ADMIN + 'Dashboard';
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
			setLoadingDashboard(false)

			if (data.error_code === "0") {
				const collectionRate =
					data.total_tagihan > 0
						? (data.total_tagihan_terkumpul / data.total_tagihan) * 100
						: 0;

				setListTunggakan(data.result_top_tunggakan)
				setTotalCluster(data.total_cluster)
				setTotalRumah(data.total_rumah)
				setTotalWarga(data.total_warga)
				setTotalTransaksi(data.total_transaksi)
				setTotalTransaksiPending(data.total_transaksi_pending)
				setTotalTransaksiSettlement(data.total_transaksi_settlement)
				setTotalTagihan(data.total_tagihan)
				setTotalTagihanTerkumpul(data.total_tagihan_terkumpul)
				setTotalTagihanTertunda(data.total_tagihan_tertunda)
				setCollectionRate(collectionRate)
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
			setLoadingDashboard(false)

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

    return (
		// <div className="container-fluid mt-3">

		// 	<div>Dashbord</div>

		// 	<div className="row g-3">

		// 		{/* CARD 1 */}
		// 		<div className="col-12 col-md-6 col-lg-3">
		// 			<div className="card custom-card">
		// 				<div className="card-body">
  
		// 					<div className="card-content">
		// 						<div>
		// 						<p className="label">TOTAL PENDAPATAN</p>
		// 						<h3 className="value">Rp 132.000.000</h3>
		// 						</div>

		// 						<div className="d-flex align-items-center gap-2 mt-2">
		// 						<span className="badge badge-success">+8.2%</span>
		// 						<span className="subtext">Bulan Ini</span>
		// 						</div>
		// 					</div>

		// 					<div className="icon-box">$</div>

		// 				</div>
		// 			</div>
		// 		</div>

		// 		{/* CARD 2 */}
		// 		<div className="col-12 col-md-6 col-lg-3">
		// 		<div className="card custom-card">
		// 			<div className="card-body d-flex justify-content-between">
		// 			<div>
		// 				<p className="label">TOTAL WARGA</p>
		// 				<h3 className="value">24</h3>

		// 				<div className="d-flex align-items-center gap-2 mt-2">
		// 				<span className="badge badge-success">+3.5%</span>
		// 				<span className="subtext">Bulan Ini</span>
		// 				</div>
		// 			</div>

		// 			<div className="icon-box">👥</div>
		// 			</div>
		// 		</div>
		// 		</div>

		// 		{/* CARD 3 */}
		// 		<div className="col-12 col-md-6 col-lg-3">
		// 		<div className="card custom-card">
		// 			<div className="card-body d-flex justify-content-between">
		// 			<div>
		// 				<p className="label">TOTAL CLUSTER</p>
		// 				<h3 className="value">4</h3>

		// 				<div className="mt-2">
		// 				<span className="badge badge-danger">0%</span>
		// 				</div>
		// 			</div>

		// 			<div className="icon-box">🏢</div>
		// 			</div>
		// 		</div>
		// 		</div>

		// 		{/* CARD 4 */}
		// 		<div className="col-12 col-md-6 col-lg-3">
		// 		<div className="card custom-card">
		// 			<div className="card-body d-flex justify-content-between">
		// 			<div>
		// 				<p className="label">TAGIHAN TERTUNDA</p>
		// 				<h3 className="value">216</h3>

		// 				<div className="d-flex align-items-center gap-2 mt-2">
		// 				<span className="badge badge-danger">-12%</span>
		// 				<span className="subtext">Bulan Lalu</span>
		// 				</div>
		// 			</div>

		// 			<div className="icon-box">⚠️</div>
		// 			</div>
		// 		</div>
		// 		</div>

		// 	</div>
		// </div>

		<div className="container-fluid dashboard-page p-4">
			
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
			<div className="mb-4">
				<h3 className="fw-bold">Selamat Datang, Super Admin 👋</h3>
				<p className="text-muted">Ringkasan data seluruh cluster hari ini</p>
			</div>

			{/* Cards */}
			<div className="row">
				<CardDashboard title="Total Warga" value={TotalWarga} icon={<FaUserFriends style={{ width:30, height:30 }} />} />
				<CardDashboard title="Total Cluster" value={TotalCluster} icon={<FaHouseChimneyUser style={{ width:30, height:30 }} />} />
				<CardDashboard title="Total Rumah" value={TotalRumah} icon={<FaHome style={{ width:30, height:30 }} />} />
			</div>
			<div className="row">
				<CardDashboard title="Total Tagihan" value={formatRupiah(TotalTagihan)} icon={<FaMoneyBill style={{ width:30, height:30 }} />} />
				<CardDashboard title="Total Tagihan Terkumpul" value={formatRupiah(TotalTagihanTerkumpul)} icon={<FaHandHoldingDollar style={{ width:30, height:30 }} />} />
				<CardDashboard title="Total Tagihan Tertunda" value={formatRupiah(TotalTagihanTertunda)} icon={<FaMoneyBillWheat style={{ width:30, height:30 }} />} />
			</div>
			<div className="row">
				<CardDashboard title="Total Transaksi" value={TotalTransaksi} icon={<FaMoneyBillTransfer style={{ width:30, height:30 }} />} />
				<CardDashboard title="Total Transaksi Pending" value={TotalTransaksiPending} icon={<FaTimesCircle style={{ width:30, height:30 }} />} />
				<CardDashboard title="Total Transaksi Settlement" value={TotalTransaksiSettlement} icon={<FaCheckCircle style={{ width:30, height:30 }} />} />
			</div>

			{/* <div className="card shadow-sm border-0 rounded-4">
				<div className="card-body d-flex justify-content-between align-items-center">
					<div className="card p-3 rounded-4 shadow-sm">
						<h6 className="fw-bold">Top Tunggakan</h6>

						<div style={{ backgroundColor:'#84cc16', padding:1 }} />

						{ListTunggakan.map((item, i) => (
							<div key={i} className="d-flex justify-content-between">
								<span style={{ fontWeight:'bold' }}>{item.nama} ({item.cluster})</span>
								<span className="text-danger">
									{formatRupiah(item.total)}
								</span>
							</div>
						))}
					</div>
				</div>
			</div> */}

			{/* Charts */}
			{/* <div className="row mt-3">
				<div className="col-md-6 mb-3">
				<div className="card shadow-sm border-0 rounded-4">
					<div className="card-body">
					<h6 className="fw-bold mb-3">Keuangan per Cluster</h6>
					<div className="text-center text-muted">(Bar Chart di sini)</div>
					</div>
				</div>
				</div>

				<div className="col-md-6 mb-3">
				<div className="card shadow-sm border-0 rounded-4">
					<div className="card-body">
					<h6 className="fw-bold mb-3">Status Tagihan</h6>
					<div className="text-center text-muted">(Donut Chart di sini)</div>
					</div>
				</div>
				</div>
			</div> */}

			{/* Bottom Section */}
			{/* <div className="row">
				<div className="col-md-6 mb-3">
				<div className="card shadow-sm border-0 rounded-4">
					<div className="card-body">
					<h6 className="fw-bold mb-3">Tren Pemasukan Bulanan</h6>
					<div className="text-center text-muted">(Line Chart di sini)</div>
					</div>
				</div>
				</div>

				<div className="col-md-6 mb-3">
				<div className="card shadow-sm border-0 rounded-4">
					<div className="card-body">
					<h6 className="fw-bold mb-3">Ringkasan Cluster</h6>

					<div className="list-group">
						<div className="list-group-item d-flex justify-content-between align-items-center">
						<div>
							<strong>Cluster Harmony</strong>
							<div className="text-muted small">156 warga • 142 rumah</div>
						</div>
						<span className="badge bg-success">Aktif</span>
						</div>

						<div className="list-group-item d-flex justify-content-between align-items-center">
						<div>
							<strong>Cluster Serenity</strong>
							<div className="text-muted small">203 warga • 187 rumah</div>
						</div>
						<span className="badge bg-success">Aktif</span>
						</div>

						<div className="list-group-item d-flex justify-content-between align-items-center">
						<div>
							<strong>Cluster Prestige</strong>
							<div className="text-muted small">98 warga • 91 rumah</div>
						</div>
						<span className="badge bg-success">Aktif</span>
						</div>

						<div className="list-group-item d-flex justify-content-between align-items-center">
						<div>
							<strong>Cluster Elite</strong>
							<div className="text-muted small">134 warga • 120 rumah</div>
						</div>
						<span className="badge bg-danger">Nonaktif</span>
						</div>
					</div>

					</div>
				</div>
				</div>
			</div> */}
		</div>
	);
}

export default Dashboard;