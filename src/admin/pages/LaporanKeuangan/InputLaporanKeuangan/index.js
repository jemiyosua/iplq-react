import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination, FormInput, FormSelect, FormDatePicker, FormTextArea, LoadingLogo } from '../../../components';
import './input-laporan-keuangan.css'
import './form-input-laporan-keuangan.css'
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

const InputLaporanKeuangan = () => {
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

	const [LoadingInsertLaporanKeuangan, setLoadingInsertLaporanKeuangan] = useState(false)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

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
	const [forms, setForms] = useState({
        tanggal: "",
        nominal: "",
        keterangan: "",
        jenis: ""
    });
	const [JenisTransaksi, setJenisTransaksi] = useState("")
	const [TipeTransaksi, setTipeTransaksi] = useState("")
	const [Nominal, setNominal] = useState(0)
	const [JumlahBulan, setJumlahBulan] = useState(0)
	const [Deskripsi, setDeskripsi] = useState("")
	const [TanggalTransaksi, setTanggalTransaksi] = useState("")

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

	const formatRupiah = (value) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0
		}).format(value);
	}

	const handleBatalTransaksi = () => {
		window.location.href = "/admin/laporan-keuangan"
	}

	const handleSimpanTransaksi = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "INSERT",
			"nominal": parseInt(Nominal),
			"jenis_transaksi": JenisTransaksi,
			"tipe_transaksi": TipeTransaksi,
			"deskripsi": Deskripsi,
			"tanggal_bayar": TanggalTransaksi
		});

		setLoadingInsertLaporanKeuangan(true)

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
			setLoadingInsertLaporanKeuangan(false)

			if (data.error_code == "0") {
				window.location.href = "/admin/laporan-keuangan"
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
			setLoadingInsertLaporanKeuangan(false)

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
    
    return (
		<div className="container-fluid p-4 min-vh-100">

			{LoadingInsertLaporanKeuangan && <LoadingLogo />}

			<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
				<div style={{ display:'flex', justifyContent:'flex-start', alignItems:'center' }}>
					<div>
						<div style={{ fontSize:30, fontWeight:'bold' }}>Input Laporan Keuangan</div>
						<div style={{ fontSize:15 }}>Kelola dan pantau semua transaksi keuangan</div>
					</div>
				</div>
			</div>

			<div style={{ height:30 }} />

			<div className="card border-0 shadow rounded-4 p-3">

				<div className="form-grid">

					<FormSelect
						label="Jenis Transaksi"
						value={JenisTransaksi}
						onChange={(event) => setJenisTransaksi(event.target.value)}
						options={[
							{
								label: "Kredit",
								value: "kredit"
							},
							{
								label: "Debit",
								value: "debit"
							}
						]}
					/>

					<FormSelect
						label="Tipe Transaksi"
						value={TipeTransaksi}
						onChange={(event) => setTipeTransaksi(event.target.value)}
						options={[
							{
								label: "Iuran",
								value: "iuran"
							},
							{
								label: "IPL",
								value: "ipl"
							},
							{
								label: "Lainnya",
								value: "lainnya"
							}
						]}
					/>

					<FormInput
						label="Nominal"
						value={Nominal}
						onChange={(event) => setNominal(event.target.value)}
						placeholder="Rp 0"
					/>

					<FormInput
						label="Jumlah Bulan"
						value={JumlahBulan}
						onChange={(event) => setJumlahBulan(event.target.value)}
						placeholder="0"
					/>

					<FormDatePicker
						label="Tanggal Transaksi"
						value={TanggalTransaksi}
						onChange={(event) => setTanggalTransaksi(event.target.value)}
					/>

					<FormTextArea
						label="Deskripsi"
						value={Deskripsi}
						onChange={(event) => setDeskripsi(event.target.value)}
						placeholder="Tulis Deskripsi Transaksi Anda"
					/>

				</div>

				<div className="footer-action">
					<button className="btn-outline" onClick={() => handleBatalTransaksi()}>
						Batal
					</button>

					<button className="btn-primary" onClick={() => handleSimpanTransaksi()}>
						Simpan
					</button>
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

export default InputLaporanKeuangan;