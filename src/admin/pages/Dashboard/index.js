import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import './dashboard.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../utils'
import { generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
	FaArrowDown,
	FaArrowUp,
	FaBuilding,
	FaChartPie,
	FaCheckCircle,
	FaClock,
	FaExchangeAlt,
	FaExclamationTriangle,
	FaHome,
	FaListOl,
	FaMoneyBillWave,
	FaUsers,
	FaWallet,
} from 'react-icons/fa';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const STATUS_COLORS = ["#16a34a", "#f59e0b", "#64748b"];
const BILL_COLORS = ["#2563eb", "#16a34a", "#ef4444"];

const Dashboard = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [ShowAlert, setShowAlert] = useState(true)
	const [SessionMessage, setSessionMessage] = useState("")
	const [SuccessMessage, setSuccessMessage] = useState("")
	const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingDashboard, setLoadingDashboard] = useState(false)
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

	const getCookie = useCallback((tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie == "string") {
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
	}, [cookies.varCookie])

	const logout = () => {
		removeCookie('varCookie', { path: '/' })
		removeCookie('varMerchantId', { path: '/' })
		removeCookie('varIdVoucher', { path: '/' })
		dispatch(setForm("ParamKey", ''))
		dispatch(setForm("Username", ''))
		dispatch(setForm("Name", ''))
		dispatch(setForm("Role", ''))
		if (window) {
			sessionStorage.clear();
		}
	}

	const getStatsDashboard = useCallback(() => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		var cookieAccessLogin = getCookie("access");
		var cookieClusterId = Number(getCookie("cluster_id")) || 0;

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"cluster_id": cookieClusterId,
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

			if (data.error_code === '0' || data.error_code === 0) {
				const totalTagihan = Number(data.total_tagihan) || 0;
				const totalTagihanTerkumpul = Number(data.total_tagihan_terkumpul) || 0;
				const collectionRate =
					totalTagihan > 0
						? (totalTagihanTerkumpul / totalTagihan) * 100
						: 0;

				setListTunggakan(data.result_top_tunggakan || [])
				setTotalCluster(Number(data.total_cluster) || 0)
				setTotalRumah(Number(data.total_rumah) || 0)
				setTotalWarga(Number(data.total_warga) || 0)
				setTotalTransaksi(Number(data.total_transaksi) || 0)
				setTotalTransaksiPending(Number(data.total_transaksi_pending) || 0)
				setTotalTransaksiSettlement(Number(data.total_transaksi_settlement) || 0)
				setTotalTagihan(totalTagihan)
				setTotalTagihanTerkumpul(totalTagihanTerkumpul)
				setTotalTagihanTertunda(Number(data.total_tagihan_tertunda) || 0)
				setCollectionRate(collectionRate)
			} else {
				if (data.error_code === '2' || data.error_code === 2) {
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
	}, [getCookie])

	useEffect(() => {
		window.scrollTo(0, 0)

		const cookieParamKey = getCookie("paramkey");
		const cookieUsername = getCookie("username");

		if (cookieParamKey === null || cookieParamKey === "" || cookieUsername === null || cookieUsername === ""){
			history.push('/admin/login');
		} else {
			dispatch(setForm("ParamKey", cookieParamKey))
			dispatch(setForm("Username", cookieUsername))
			dispatch(setForm("PageActive", "DASHBOARD"))
			getStatsDashboard()
		}
	}, [dispatch, getCookie, getStatsDashboard, history])

	const formatRupiah = (value) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0
		}).format(value || 0);
	}

	const formatNumber = (value) => {
		return new Intl.NumberFormat("id-ID").format(value || 0);
	}

	const formatPercent = (value) => {
		return `${Number(value || 0).toFixed(1)}%`;
	}

	const financialChartData = useMemo(() => ([
		{ name: "Total", value: TotalTagihan },
		{ name: "Terkumpul", value: TotalTagihanTerkumpul },
		{ name: "Tertunda", value: TotalTagihanTertunda },
	]), [TotalTagihan, TotalTagihanTerkumpul, TotalTagihanTertunda])

	const statusChartData = useMemo(() => {
		const otherStatus = Math.max(TotalTransaksi - TotalTransaksiPending - TotalTransaksiSettlement, 0);
		return [
			{ name: "Settlement", value: TotalTransaksiSettlement },
			{ name: "Pending", value: TotalTransaksiPending },
			{ name: "Lainnya", value: otherStatus },
		]
	}, [TotalTransaksi, TotalTransaksiPending, TotalTransaksiSettlement])

	const topTunggakanChartData = useMemo(() => {
		return ListTunggakan.map((item, index) => ({
			name: item.nama || `Warga ${index + 1}`,
			cluster: item.cluster || "-",
			total: Number(item.total) || 0,
		}))
	}, [ListTunggakan])

	const totalTagihanRatio = TotalTagihan > 0 ? 100 : 0;
	const outstandingRate = TotalTagihan > 0 ? (TotalTagihanTertunda / TotalTagihan) * 100 : 0;
	const settlementRate = TotalTransaksi > 0 ? (TotalTransaksiSettlement / TotalTransaksi) * 100 : 0;
	const pendingRate = TotalTransaksi > 0 ? (TotalTransaksiPending / TotalTransaksi) * 100 : 0;
	const hasStatusChartData = statusChartData.some((item) => item.value > 0);
	const dashboardName = getCookie("access_name") || cookies.varCookie?.split("|")[4] || "Admin";
	const dashboardCluster = getCookie("cluster") || "Semua Cluster";

	const kpiCards = [
		{
			title: "Total Tagihan",
			value: formatRupiah(TotalTagihan),
			meta: `${formatPercent(totalTagihanRatio)} dari nilai tagihan`,
			icon: <FaMoneyBillWave />,
			tone: "blue",
		},
		{
			title: "Terkumpul",
			value: formatRupiah(TotalTagihanTerkumpul),
			meta: `${formatPercent(CollectionRate)} collection rate`,
			icon: <FaWallet />,
			tone: "green",
		},
		{
			title: "Tertunda",
			value: formatRupiah(TotalTagihanTertunda),
			meta: `${formatPercent(outstandingRate)} outstanding`,
			icon: <FaExclamationTriangle />,
			tone: "red",
		},
		{
			title: "Transaksi",
			value: formatNumber(TotalTransaksi),
			meta: `${formatNumber(TotalTransaksiSettlement)} settlement`,
			icon: <FaExchangeAlt />,
			tone: "purple",
		},
	]

	const operationCards = [
		{ label: "Warga", value: TotalWarga, icon: <FaUsers /> },
		{ label: "Rumah", value: TotalRumah, icon: <FaHome /> },
		{ label: "Cluster", value: TotalCluster, icon: <FaBuilding /> },
	]

	return (
		<div className="dashboard-page">
			{SessionMessage !== "" ?
			<SweetAlert
				warning
				show={ShowAlert}
				onConfirm={() => {
					setShowAlert(false)
					logout()
					history.push("/admin/login");
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
					history.replace("/admin/dashboard")
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
					history.push("/admin/login");
				}}
				btnSize="sm">
				{ErrorMessageAlertLogout}
			</SweetAlert>
			:""}

			<div className="dashboard-header">
				<div>
					<div className="dashboard-eyebrow">Dashboard</div>
					<h1>Selamat datang, {dashboardName}</h1>
					<p>Ringkasan operasional dan pembayaran untuk {dashboardCluster}.</p>
				</div>
				<button className="dashboard-refresh" onClick={getStatsDashboard} disabled={LoadingDashboard}>
					{LoadingDashboard ? "Memuat..." : "Perbarui"}
				</button>
			</div>

			<div className="dashboard-kpi-grid">
				{kpiCards.map((item) => (
					<div className={`dashboard-kpi-card ${item.tone}`} key={item.title}>
						<div className="dashboard-kpi-content">
							<span>{item.title}</span>
							<strong>{item.value}</strong>
							<small>{item.meta}</small>
						</div>
						<div className="dashboard-kpi-icon">{item.icon}</div>
					</div>
				))}
			</div>

			<div className="dashboard-overview-grid">
				<div className="dashboard-panel collection-panel">
					<div className="panel-title-row">
						<div>
							<span className="panel-label">Collection Rate</span>
							<h2>{formatPercent(CollectionRate)}</h2>
						</div>
						<div className={`dashboard-trend ${CollectionRate >= 70 ? "up" : "down"}`}>
							{CollectionRate >= 70 ? <FaArrowUp /> : <FaArrowDown />}
							{CollectionRate >= 70 ? "Sehat" : "Perlu Follow Up"}
						</div>
					</div>
					<div className="collection-progress">
						<div style={{ width: `${Math.min(CollectionRate, 100)}%` }} />
					</div>
					<div className="collection-breakdown">
						<div>
							<span>Terkumpul</span>
							<strong>{formatRupiah(TotalTagihanTerkumpul)}</strong>
						</div>
						<div>
							<span>Tertunda</span>
							<strong>{formatRupiah(TotalTagihanTertunda)}</strong>
						</div>
					</div>
				</div>

				<div className="dashboard-panel operation-panel">
					<div className="panel-heading">
						<FaChartPie />
						<div>
							<span className="panel-label">Operasional</span>
							<h3>Data Hunian</h3>
						</div>
					</div>
					<div className="operation-list">
						{operationCards.map((item) => (
							<div className="operation-item" key={item.label}>
								<div className="operation-icon">{item.icon}</div>
								<div>
									<span>{item.label}</span>
									<strong>{formatNumber(item.value)}</strong>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="dashboard-chart-grid">
				<div className="dashboard-panel chart-panel">
					<div className="panel-heading">
						<FaMoneyBillWave />
						<div>
							<span className="panel-label">Keuangan</span>
							<h3>Ringkasan Tagihan</h3>
						</div>
					</div>
					<div className="chart-area">
						<ResponsiveContainer width="100%" height={290}>
							<BarChart data={financialChartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="name" tickLine={false} axisLine={false} />
								<YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000} jt`} />
								<Tooltip formatter={(value) => formatRupiah(value)} />
								<Bar dataKey="value" radius={[8, 8, 0, 0]}>
									{financialChartData.map((entry, index) => (
										<Cell key={`bill-cell-${entry.name}`} fill={BILL_COLORS[index % BILL_COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="dashboard-panel chart-panel">
					<div className="panel-heading">
						<FaExchangeAlt />
						<div>
							<span className="panel-label">Transaksi</span>
							<h3>Status Pembayaran</h3>
						</div>
					</div>
					<div className="chart-area">
						{hasStatusChartData ?
						<ResponsiveContainer width="100%" height={290}>
							<PieChart>
								<Pie
									data={statusChartData}
									cx="50%"
									cy="48%"
									innerRadius={68}
									outerRadius={100}
									paddingAngle={4}
									dataKey="value"
								>
									{statusChartData.map((entry, index) => (
										<Cell key={`status-cell-${entry.name}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
									))}
								</Pie>
								<Tooltip formatter={(value) => formatNumber(value)} />
								<Legend verticalAlign="bottom" height={32} />
							</PieChart>
						</ResponsiveContainer>
						:
						<div className="empty-chart">Belum ada data transaksi</div>}
					</div>
					<div className="status-summary">
						<div>
							<FaCheckCircle />
							<span>Settlement</span>
							<strong>{formatPercent(settlementRate)}</strong>
						</div>
						<div>
							<FaClock />
							<span>Pending</span>
							<strong>{formatPercent(pendingRate)}</strong>
						</div>
					</div>
				</div>
			</div>

			<div className="dashboard-bottom-grid">
				<div className="dashboard-panel chart-panel">
					<div className="panel-heading">
						<FaListOl />
						<div>
							<span className="panel-label">Prioritas</span>
							<h3>Top Tunggakan</h3>
						</div>
					</div>
					{topTunggakanChartData.length > 0 ?
					<div className="chart-area arrears-chart">
						<ResponsiveContainer width="100%" height={260}>
							<BarChart data={topTunggakanChartData} layout="vertical" margin={{ top: 8, right: 24, left: 12, bottom: 8 }}>
								<CartesianGrid strokeDasharray="3 3" horizontal={false} />
								<XAxis type="number" tickFormatter={(value) => `${value / 1000000} jt`} />
								<YAxis type="category" dataKey="name" width={92} tickLine={false} axisLine={false} />
								<Tooltip formatter={(value) => formatRupiah(value)} />
								<Bar dataKey="total" fill="#ef4444" radius={[0, 8, 8, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
					:
					<div className="empty-chart">Belum ada data tunggakan</div>}
				</div>

				<div className="dashboard-panel arrears-list-panel">
					<div className="panel-heading">
						<FaExclamationTriangle />
						<div>
							<span className="panel-label">Daftar</span>
							<h3>Tunggakan Tertinggi</h3>
						</div>
					</div>
					<div className="arrears-list">
						{ListTunggakan.length > 0 ? ListTunggakan.map((item, index) => (
							<div className="arrears-item" key={`${item.nama}-${index}`}>
								<div className="arrears-rank">{index + 1}</div>
								<div className="arrears-info">
									<strong>{item.nama || "-"}</strong>
									<span>{item.cluster || "-"}</span>
								</div>
								<div className="arrears-value">{formatRupiah(item.total)}</div>
							</div>
						)) : (
							<div className="empty-list">Tidak ada tunggakan prioritas.</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
