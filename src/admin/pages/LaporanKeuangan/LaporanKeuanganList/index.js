import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination } from '../../../components';
import './laporan-keuangan.css'
import './table-laporan-keuangan.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FaMoneyBillWheat } from 'react-icons/fa6';
import { FaFileDownload, FaMoneyCheck } from 'react-icons/fa';
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
import { IconAdd, IconArrowRightUp, IconCheck, IconDownload, IconDownloadGreen, IconExport, IconFilter, IconReset, IconUploadRed, IconWallet } from '../../../assets';
import Dropdown from 'react-bootstrap/Dropdown';

const LaporangKeuanganList = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListLaporanKeuangan, setListLaporanKeuangan] = useState([])
	const [ListTunggakan, setListTunggakan] = useState([])

	const [CurrentPage, setCurrentPage] = useState(1);
	const [RowPage, setRowPage] = useState(10);
	const [TotalPage, setTotalPage] = useState(0)
	const [TotalRecords, setTotalRecords] = useState(0)
	
	const [TotalSaldo, setTotalSaldo] = useState(0)
	const [SaldoAwal, setSaldoAwal] = useState(0)
	const [SaldoAkhir, setSaldoAkhir] = useState(0)
	const [TotalKredit, setTotalKredit] = useState(0)
	const [TotalDebit, setTotalDebit] = useState(0)

	const [Loading, setLoading] = useState(false)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [LoadingLaporanKeuangan, setLoadingLaporanKeuangan] = useState(false)

	const [open,setOpen] = useState(true)

	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalRumah, setTotalRumah] = useState(0)
	const [TotalWarga, setTotalWarga] = useState(0)
	const [TotalTransaksi, setTotalTransaksi] = useState(0)
	const [TotalPembayaran, setTotalPembayaran] = useState(0)

	const [GlobalSearch, setGlobalSearch] = useState('');
	const [FilterJenisTransaksi, setFilterJenisTransaksi] = useState('');
	const [FilterBulan, setFilterBulan] = useState('');
	const [FilterBeginDate, setFilterBeginDate] = useState('');
	const [FilterEndDate, setFilterEndDate] = useState('');
	const [ChartData, setChartData] = useState([
		{
			bulan: "Jan",
			pemasukan: 1200000,
			pengeluaran: 300000
		},
		{
			bulan: "Feb",
			pemasukan: 900000,
			pengeluaran: 200000
		},
		{
			bulan: "Mar",
			pemasukan: 1500000,
			pengeluaran: 500000
		}
	]);

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
            dispatch(setForm("PageActive","LAPORAN_KEUANGAN"))
        }

    },[])

	useEffect(() => {
		getListLaporanKeuangan("");
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

	const getListLaporanKeuangan = (posisi) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		let globalSearch = GlobalSearch
		let filterJenisTransaksi = FilterJenisTransaksi
		let filterBulan = FilterBulan
		if (posisi == "reset") {
			globalSearch = ""
			filterJenisTransaksi = ""
			filterBulan = ""
		}

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"bulan_laporan": filterBulan,
			"global_search": globalSearch,
			"filter_jenis_transaksi": filterJenisTransaksi,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingLaporanKeuangan(true)

		var url = paths.URL_API_ADMIN + 'LaporanKeuangan';
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
			setLoadingLaporanKeuangan(false)

			if (data.error_code == "0") {
				setListLaporanKeuangan(data.result)

				setTotalSaldo(data.total_saldo)
				setSaldoAwal(data.saldo_awal)
				setSaldoAkhir(data.saldo_akhir)
				setTotalKredit(data.total_kredit)
				setTotalDebit(data.total_debit)

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
			setLoadingLaporanKeuangan(false)

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
		const formatted = ListLaporanKeuangan.map((item) => ({
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

	const handleFilterBulan = (bulan) => {
        setFilterBulan(bulan);

        const [year, month] = bulan.split("-");

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const format = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
          };

        setFilterBeginDate(format(start));
        setFilterEndDate(format(end));
    }

	const handleInputPemasukan = () => {

	}

	const handleDetail = () => {

	}

	const handleEdit = () => {
		
	}

	const handleDelete = () => {
		
	}
    
    return (
		<div className="container-fluid p-4 min-vh-100">

			<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
				<div style={{ display:'flex', justifyContent:'flex-start', alignItems:'center' }}>
					<div>
						<div style={{ fontSize:30, fontWeight:'bold' }}>Laporan Keuangan</div>
						<div style={{ fontSize:15 }}>Kelola dan pantau semua transaksi keuangan</div>
					</div>
				</div>
				<div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
					<div 
					style={{ backgroundColor:'#FFFFFF', border:'1px solid #002C00', padding:10, borderRadius:10, cursor:'pointer' }} onClick={() => handleInputPemasukan()}>
						<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
							<img src={IconAdd} alt="logo" style={{ height:20, width:20 }}  />
							<div style={{ width:5 }} />
							<div style={{ color:'#002C00', fontWeight:'bold' }}>Input Pemasukan</div>
						</div>
					</div>
					<div style={{ width:10 }} />
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

			{getCookie("username") == "superadmin" &&
			<div className="row mb-4">
				<div className="col-lg-4 mb-3">
					<div className="finance-card saldo">
						<div className="finance-icon">
							💰
						</div>
						<div>
							<div className="finance-title">
								Total Saldo
							</div>
							<div className="finance-value">
								{formatRupiah(TotalSaldo)}
							</div>
							<div className="finance-sub-title">
								Saldo Akhir
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
								Total Pemasukan (Kredit)
							</div>
							<div className="finance-value">
								{formatRupiah(TotalKredit)}
							</div>
							<div className="finance-sub-title">
								Total Dana Masuk
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
								Total Pengeluaran
							</div>
							<div className="finance-value">
								{formatRupiah(TotalDebit)}
							</div>
							<div className="finance-sub-title">
								Total Dana Keluar
							</div>
						</div>
					</div>
				</div>
			</div>}

			{getCookie("username") != "superadmin" &&
			<div className="row mb-3">
				<div className="col-lg-3 mb-3">
					<div className="finance-card saldo-awal">
						<div className="finance-icon">
							<img src={IconWallet} alt="logo" style={{ height:30, width:30 }} />
						</div>
						<div>
							<div className="finance-title">
								Saldo Awal
							</div>
							<div className="finance-value">
								{formatRupiah(SaldoAwal)}
							</div>
							<div className="finance-sub-title">
								Total Saldo Awal
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
								Total Pemasukan (Kredit)
							</div>
							<div className="finance-value">
								{formatRupiah(TotalKredit)}
							</div>
							<div className="finance-sub-title">
								Total Dana Masuk
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-3 mb-3">
					<div className="finance-card debit">
						<div className="finance-icon">
							<img src={IconArrowRightUp} alt="logo" style={{ height:30, width:30 }} />
						</div>
						<div>
							<div className="finance-title">
								Total Pengeluaran
							</div>
							<div className="finance-value">
								{formatRupiah(TotalDebit)}
							</div>
							<div className="finance-sub-title">
								Total Dana Keluar
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
								Saldo Akhir
							</div>
							<div className="finance-value">
								{formatRupiah(SaldoAkhir)}
							</div>
							<div className="finance-sub-title">
								Total Saldo Akhir
							</div>
						</div>
					</div>
				</div>
			</div>}

			{/* <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
				<h5>
					Cashflow Bulanan
				</h5>

				<ResponsiveContainer
					width="100%"
					height={350}
				>
					<BarChart data={ChartData}>

						<XAxis dataKey="bulan" />

						<YAxis />

						<Tooltip />

						<Bar
							dataKey="pemasukan"
							name="Pemasukan"
							fill="#16A34A"
						/>

						<Bar
							dataKey="pengeluaran"
							name="Pengeluaran"
							fill="#DC2626"
						/>

					</BarChart>
				</ResponsiveContainer>
			</div> */}

			<div className="card border-0 shadow rounded-4 p-3">
				<div className="filter-container">
					<input
						type="text"
						className="filter-input"
						placeholder="Cari Nama Warga / Cluster"
						value={GlobalSearch}
						onChange={(e) => setGlobalSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setCurrentPage(1);
								getListLaporanKeuangan("");
							}
						}}
					/>

					<select
						className="filter-select"
						value={FilterJenisTransaksi}
						onChange={(e) => {
							setFilterJenisTransaksi(e.target.value)
						}}
					>
						<option value="">Semua Jenis Transaksi</option>
						<option value="kredit">Kredit</option>
						<option value="debit">Debit</option>
					</select>

					<input
						type="month"
						className="filter-input"
						value={FilterBulan}
						onChange={(e) => handleFilterBulan(e.target.value)}
					/>

					<button
						className="btn-filter-lk"
						onClick={() => {
							setCurrentPage(1)
							setListLaporanKeuangan([])
							getListLaporanKeuangan("")
						}}
					>
						<div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
							<img src={IconFilter} alt="logo" style={{ height:15, width:15, filter:"brightness(0) invert(1)" }} />
							<div style={{ width:5 }} />
							<div>Filter</div>
						</div>
					</button>

					<button
						className="btn-reset-lk"
						onClick={() => {
							setCurrentPage(1)
							setGlobalSearch("")
							setFilterJenisTransaksi("")
							setFilterBulan("")
							setFilterBeginDate("")
							setFilterEndDate("")
							setListLaporanKeuangan([])
							getListLaporanKeuangan("reset")
						}}
					>
						<div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
							<img src={IconReset} alt="logo" style={{ height:15, width:15 }} />
							<div style={{ width:5 }} />
							<div>Reset</div>
						</div>
					</button>
				</div>

				<div className="lk-table">
					{ListLaporanKeuangan.length > 0 &&
					<div className="lk-header">
						<div>Order ID</div>
						<div>Detail Warga</div>
						<div>Detail Transaksi</div>
						<div>Nominal</div>
						<div>Tanggal Input</div>
						<div>Aksi</div>
					</div>}
					{ListLaporanKeuangan?.length > 0 ?
					ListLaporanKeuangan?.map((item, index) => (
						<div className="lk-row" key={index}>
							<div className="lk-order">
								<div className="order-id">
									{item.order_id || "-"}
								</div>

								<span
									className={
										item.jenis_transaksi?.toLowerCase() === "kredit"
										? "badge-kredit"
										: "badge-debit"
									}
								>
									{item.jenis_transaksi}
								</span>
							</div>

							<div>
								<div>
									<strong>Cluster:</strong> {item.cluster || "-"}
								</div>

								<div>
									<strong>Nama:</strong> {item.nama || "-"}
								</div>
							</div>

							<div>
								<div className="transaksi-title">
									{item.keterangan || "-"}
								</div>

								<div
									className={
										item.jenis_transaksi?.toLowerCase() === "kredit"
										? "text-success"
										: "text-danger"
									}
								>
									{item.jenis_transaksi}
								</div>

								<div>
									Jumlah Bulan : {item.jumlah_bulan || "-"}
								</div>
							</div>

							<div>
								<div
									className={
										item.jenis_transaksi?.toLowerCase() === "kredit"
										? "nominal-kredit"
										: "nominal-debit"
									}
								>
									{formatRupiah(item.nominal)}
								</div>
							</div>

							<div>
								{item.tanggal_input}
							</div>

							<Dropdown>
								<Dropdown.Toggle
									variant="light"
									size="sm"
								>
									⋮
								</Dropdown.Toggle>

								<Dropdown.Menu>

									<Dropdown.Item
										onClick={() =>
											handleDetail(item)
										}
									>
										Detail
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() =>
											handleEdit(item)
										}
									>
										Edit
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() =>
											handleDelete(item)
										}
									>
										Hapus
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>

						</div>
					))
					:
					<div className="empty-state">
						<div className="empty-icon">
							💰
						</div>
						<div className="empty-title">
							Belum Ada Transaksi Keuangan
						</div>
						<div className="empty-description">
							Transaksi pemasukan dan pengeluaran akan muncul di sini
							setelah Anda melakukan pencatatan transaksi pertama.
						</div>
						<div className="empty-action">
							<button
								className="btn-add-transaction"
								onClick={() => handleInputPemasukan()}
							>
								+ Input Pemasukan
							</button>
							<button
								className="btn-import"
							>
								Import Data
							</button>
						</div>
					</div>}

				</div>

				{ListLaporanKeuangan.length > 0 &&
				<div className="d-flex justify-content-between align-items-center mt-3">
					<div style={{ fontWeight:'bold' }}>Total Data : {TotalRecords}</div>
					<div className="d-flex gap-2">
						<Pagination
							currentPage={CurrentPage}
							totalPage={TotalPage}
							onPageChange={(page) => {
								if (!LoadingLaporanKeuangan) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>}

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

export default LaporangKeuanganList;