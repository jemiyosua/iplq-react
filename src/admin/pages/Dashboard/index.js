import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../components';
import './dashboard.css'
import './stats.css'
import './payment-stats.css'
import './client-stats.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FaBars, FaBell, FaCheckCircle, FaClock, FaCreditCard, FaHome, FaMoneyBill, FaPercent, FaTimesCircle, FaUserCircle, FaUserClock, FaUserPlus, FaUsers, FaUserSlash } from 'react-icons/fa';
import { FcFactory, FcHome } from 'react-icons/fc';
import { FaPeopleGroup } from 'react-icons/fa6';
import { HiOutlineHomeModern } from "react-icons/hi2";
import { BsHouseDoor } from "react-icons/bs";
import { MdOutlinePayments, MdOutlinePercent, MdPeopleOutline } from "react-icons/md";
import { GrTransaction } from 'react-icons/gr';

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

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

	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalRumah, setTotalRumah] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	const [TotalTransaksi, setTotalTransaksi] = useState(0)
	const [TotalPembayaran, setTotalPembayaran] = useState(0)

	const COLORS = ["#16a34a","#f59e0b","#ef4444"];

    const handleScroll = (scrollOffset) => {
        if (containerRef.current) {
          	containerRef.current.scrollLeft += scrollOffset;
        }
    };

	const data_global = [
		{ title: "Total Cluster", value: 120, icon: <HiOutlineHomeModern style={{width:23,height:23}}/>},
		{ title: "Total Rumah", value: 12540, icon: <BsHouseDoor style={{width:23,height:23}}/> },
		{ title: "Total Warga", value: 38200, icon: <MdPeopleOutline style={{width:23,height:23}}/> },
		{ title: "Growth", value: "+12%", icon: <MdOutlinePercent style={{width:23,height:23}}/> },
	];

	const data_financial = [
		{ title: "Total Transaksi", value: "Rp 1.2 Miliar", icon: <GrTransaction style={{width:23,height:23}}/> },
		{ title: "Total Pembayaran", value: 8540, icon: <MdOutlinePayments style={{width:23,height:23}}/> }
	];

	const stats = [
		{
			title: "Client Aktif",
			value: 120,
			desc: "Active Client",
			icon: <FaUsers />,
			color: "#18a957",
			background: "#e8f7ef"
		},
		{
			title: "Client Trial",
			value: 35,
			desc: "Free Trial",
			icon: <FaUserClock />,
			color: "#3b82f6",
			background: "#A5D8FF"
		},
		{
			title: "Client Nonaktif",
			value: 12,
			desc: "Disabled",
			icon: <FaUserSlash />,
			color: "#ef4444",
			background: "#FFA8A8"
		},
		{
			title: "Client Baru",
			value: 18,
			desc: "This Month",
			icon: <FaUserPlus />,
			color: "#f59e0b",
			background: "#FFF3BF"
		}
  	];

	const data = [
		{ month: "Jan", payment: 4000000 },
		{ month: "Feb", payment: 5600000 },
		{ month: "Mar", payment: 5800000 },
		{ month: "Apr", payment: 6200000 }
	];

	const growthData = [
		{ month: "Jan", client: 100 },
		{ month: "Feb", client: 150 },
		{ month: "Mar", client: 100 },
		{ month: "Apr", client: 150 },
		{ month: "May", client: 200 },
		{ month: "Jun", client: 200 }
	];

	const data_transaksi = [
		{
			title: "Total Transaksi Bulan Ini",
			value: 240,
			icon: <FaCreditCard className="stat-icon"/>,
			type: "all"
		},
		{
			title: "Pembayaran Berhasil",
			value: 210,
			icon: <FaCheckCircle className="stat-icon"/>,
			type: "success"
		},
		{
			title: "Pembayaran Pending",
			value:20,
			icon: <FaClock className="stat-icon"/>,
			type: "pending"
		},
		{
			title: "Pembayaran Gagal",
			value: 10,
			icon: <FaTimesCircle className="stat-icon"/>,
			type: "failed"
		}
	]

	const data_client = {
		labels: [
			"Client Aktif",
			"Client Trial",
			"Client Nonaktif",
			"Client Baru"
		],
		datasets: [
		{
			data: [120, 35, 12, 18],
			backgroundColor: [
				"#51CF66", // hijau
				"#74C0FC", // biru
				"#FF8787", // merah
				"#FFD43B"  // kuning
			],
			borderWidth: 0
		}
		]
	};

	const options_client = {
		cutout: "70%", // membuat donut
		plugins: {
			legend: {
				position: "bottom"
			}
		}
	};

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
		
			if (tipe === "username") {
				return username;
			} else if (tipe === "paramkey") {
				return paramKey;
			} else if (tipe === "access") {
				return accessLogin;
			} else if (tipe === "access_name") {
				return accessName;
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

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"access": cookieAccessLogin
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
				setTotalCluster(data.total_cluster)
				setTotalRumah(data.total_rumah)
				setTotalWarga(data.total_warga)
				setTotalTransaksi(data.total_transaksi)
				setTotalPembayaran(data.total_pembayaran)
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
		<div>
			{SessionMessage !== "" ?
			<SweetAlert 
				warning 
				show={ShowAlert}
				onConfirm={() => {
					setShowAlert(false)
					logout()
					window.location.href="/";
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
					history.replace("/overview")
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
					window.location.href="admin/login";
				}}
				btnSize="sm">
				{ErrorMessageAlertLogout}
			</SweetAlert>
			:""}
			
			<h3 className="section-title">Global Overview</h3>
			<div className="dashboard-data-global-container">
				{/* {data_global.map((item, index) => (
					<div class="stat-card">
						<div class="card-header">
							<div class="icon green">
								{item.icon}
							</div>

							<div class="title-card">{item.title}</div>
						</div>

						<div class="card-body">
							<div class="value">{item.value}</div>
							<div class="info">	
								<span class="notif green">+20%</span>
								<span class="desc">Last month total 1.050</span>
							</div>
						</div>
					</div>
				))} */}
				<div class="stat-card">
					<div class="card-header">
						<div class="icon green">
							<HiOutlineHomeModern style={{width:23,height:23}}/>
						</div>

						<div class="title-card">Total Cluster</div>
					</div>

					<div class="card-body">
						<div class="value">{TotalCluster}</div>
						<div class="info">	
							<span class="notif green">+20%</span>
							<span class="desc">Last month total 1.050</span>
						</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="card-header">
						<div class="icon green">
							<BsHouseDoor style={{width:23,height:23}}/>
						</div>

						<div class="title-card">Total Rumah</div>
					</div>

					<div class="card-body">
						<div class="value">{TotalRumah}</div>
						<div class="info">	
							<span class="notif green">+20%</span>
							<span class="desc">Last month total 1.050</span>
						</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="card-header">
						<div class="icon green">
							<MdPeopleOutline style={{width:23,height:23}}/>
						</div>

						<div class="title-card">Total Warga</div>
					</div>

					<div class="card-body">
						<div class="value">{TotalWarga}</div>
						<div class="info">	
							<span class="notif green">+20%</span>
							<span class="desc">Last month total 1.050</span>
						</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="card-header">
						<div class="icon green">
							<MdOutlinePercent style={{width:23,height:23}}/>
						</div>

						<div class="title-card">Growth</div>
					</div>

					<div class="card-body">
						<div class="value">{0}</div>
						<div class="info">	
							<span class="notif green">+20%</span>
							<span class="desc">Last month total 1.050</span>
						</div>
					</div>
				</div>
			</div>

			<Gap height={20} />
			
			<h3 className="section-title">Financial Overview</h3>
			<div className="dashboard-data-financial-container">
				<div class="stat-card">
					<div class="card-header">
						<div class="icon green">
							<GrTransaction style={{width:23,height:23}}/>
						</div>

						<div class="title-card">Total Transaksi</div>
					</div>

					<div class="card-body">
						<div class="value">{formatRupiah(TotalTransaksi)}</div>
						<div class="info">	
							<span class="notif green">+20%</span>
							<span class="desc">Last month total 1.050</span>
						</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="card-header">
						<div class="icon green">
							<MdOutlinePayments style={{width:23,height:23}}/>
						</div>

						<div class="title-card">Total Pembayaran</div>
					</div>

					<div class="card-body">
						<div class="value">{formatRupiah(TotalPembayaran)}</div>
						<div class="info">	
							<span class="notif green">+20%</span>
							<span class="desc">Last month total 1.050</span>
						</div>
					</div>
				</div>
			</div>

			<div className="dashboard-2-grid">
				<div className="left">
					<div className="payment-stats">
						<div className="payment-grid">
						{data_transaksi.map((item,index) => (
							<div className={item.type == "all" ? "payment-card all" : item.type == "success" ? "payment-card success" : item.type == "pending" ? "payment-card pending" : "payment-card failed"}>
								{item.icon}
								<h3>{item.value}</h3>
								<p>{item.title}</p>
							</div>
						))}
						</div>
					</div>
				</div>

				<div className="right">
					<div className="client-stats-wrapper">
						<div className="client-analytics">
							<h3 className="section-title">Client Statistics</h3>
							<div className="analytics-container">

								<div className="chart-container">
									<Doughnut data={data_client} options={options_client} />
								</div>

								<div className="client-stats">
									<div className="client-item">
										<span className="dot aktif"></span>
										Client Aktif
										<strong>120</strong>
									</div>
									<div className="client-item">
										<span className="dot trial"></span>
										Client Trial
										<strong>35</strong>
									</div>
									<div className="client-item">
										<span className="dot nonaktif"></span>
										Client Nonaktif
										<strong>12</strong>
									</div>
									<div className="client-item">
										<span className="dot baru"></span>
										Client Baru
										<strong>18</strong>
									</div>
								</div>

							</div>

						</div>
					</div>
				</div>

			</div>

			

			
			
		</div>
    )
}

export default Dashboard;