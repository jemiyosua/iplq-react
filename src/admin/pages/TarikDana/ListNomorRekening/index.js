import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Pagination, Alert, ModalUpdateLaporanKeuangan, ModalInputPengajuan, ModalInputNomorRekening } from '../../../components';
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

const ListNomorRekening = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [ListNomorRekening, setListNomorRekening] = useState([])

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

	const [LoadingNomorRekening, setLoadingNomorRekening] = useState(false)

	const [ShowModalInputNomorRekening, setShowModalInputNomorRekening] = useState(false)

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

	// ---------- alert ----------
	const [AlertState, setAlertState] = useState("")
	const [ShowAlert, setShowAlert] = useState(true)
	const [SessionMessage, setSessionMessage] = useState("")
	const [SuccessMessage, setSuccessMessage] = useState("")
	const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
	const [ValidationMessage, setValidationMessage] = useState("")
	const [ConfirmMessage, setConfirmMessage] = useState("")

	const [IdRekening, setIdRekening] = useState("")
	const [NomorRekening, setNomorRekening] = useState("")
	const [NamaRekening, setNamaRekening] = useState("")
	const [NamaBank, setNamaBank] = useState("")

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
            dispatch(setForm("PageActive","NOMOR_REKENING"))
        }
    },[])

	useEffect(() => {
		getListNomorRekening("");
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

	const getListNomorRekening = (posisi) => {
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
			"global_search": globalSearch,
			"status": filterJenisTransaksi,
			"page": CurrentPage,
			"row_page": RowPage,
			"order_by": "",
			"order": ""
		});

		setLoadingNomorRekening(true)

		var url = paths.URL_API_ADMIN + 'RekeningTarikDana';
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
			setLoadingNomorRekening(false)

			if (data.error_code == "0") {
				setListNomorRekening(data.result)

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
			setLoadingNomorRekening(false)

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

	const handleInputNomorRekening = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "INSERT",
			"nomor_rekening": NomorRekening,
			"nama_rekening": NamaRekening,
			"nama_bank": NamaBank
		});

		var url = paths.URL_API_ADMIN + 'RekeningTarikDana';
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
			if (data.error_code == "0") {
				getListNomorRekening()

				setShowModalInputNomorRekening(false)

				setAlertState("success")
				setSuccessMessage("Data berhasil diinput");
				setShowAlert(true);
				return;
			} else {
				if (data.error_code === "2") {
					setAlertState("session")
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
					return;
				} else {
					setAlertState("error")
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
					return;
				}
			}
		})
		.catch((error) => {
			setAlertState("error")
			
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

	const handleDeleteNomorRekening = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "DELETE",
			"id": parseInt(IdRekening)
		});

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
			if (data.error_code == "0") {
				getListNomorRekening()

				setAlertState("success")
				setSuccessMessage("Data berhasil dihapus");
				setShowAlert(true);
				return;
			} else {
				if (data.error_code === "2") {
					setAlertState("session")
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					setShowAlert(true);
					return;
				} else {
					setAlertState("error")
					setErrorMessageAlert(data.error_message);
					setShowAlert(true);
					return;
				}
			}
		})
		.catch((error) => {
			setAlertState("error")
			
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
		const formatted = ListNomorRekening.map((item) => ({
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
		window.location.href = "/admin/input-laporan-keuangan"
	}

	const handleConfirmAlert = (alertState) => {
        if (alertState == "session") {
            setShowAlert(false)
            logout()
        } else if (alertState == "success") {
            setShowAlert(false)
            setSuccessMessage("")
        } else if (alertState == "error") {
            setShowAlert(false)
            setErrorMessageAlert("")
        } else if (alertState == "logout") {
            setShowAlert(false)
            setErrorMessageAlertLogout("")
            window.location.href="/admin/login"
        } else if (alertState == "validation") {
            setShowAlert(false)
            setValidationMessage("")
        } else if (alertState == "confirm") {
            handleDeleteNomorRekening()
        }
    }

	const convertToDateInput = (tanggal) => {
		const bulan = {
			Januari: "01",
			Februari: "02",
			Maret: "03",
			April: "04",
			Mei: "05",
			Juni: "06",
			Juli: "07",
			Agustus: "08",
			September: "09",
			Oktober: "10",
			November: "11",
			Desember: "12",
		};

		const [hari, namaBulan, tahun] = tanggal.split(" ");

		return `${tahun}-${bulan[namaBulan]}-${hari.padStart(2, "0")}`;
	};

	const handleExportLaporanKeuangan = (data) => {
		const workbook = XLSX.utils.book_new();

		/*
		* ======================
		* SHEET 1 - SUMMARY
		* ======================
		*/

		const summaryData = [
			["LAPORAN KEUANGAN"],
			[],
				["Saldo Awal", data.summary.saldo_awal],
				["Total Pemasukan (Debit)", data.summary.total_debit],
				["Total Pengeluaran (Kredit)", data.summary.total_kredit],
				["Saldo Akhir", data.summary.total_saldo],
			[],
			["RINGKASAN PER BULAN"],
			["Bulan", "Total Transaksi", "Total Nominal"],
			...data.summary.detail_summary_bulan.map((item) => [
				item.bulan,
				item.total_transaksi,
				item.total_nominal,
			]),
		];

		const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

		XLSX.utils.book_append_sheet(
			workbook,
			wsSummary,
			"SUMMARY"
		);

		/*
		* ======================
		* SHEET 2 - REKENING KORAN
		* ======================
		*/

		let saldoBerjalan = 0;

		const rekeningKoranData = data.rekening_koran.map((item) => {
			const debit =
			item.jenis_transaksi.toLowerCase() === "debit"
				? item.nominal
				: 0;

			const kredit =
			item.jenis_transaksi.toLowerCase() === "kredit"
				? item.nominal
				: 0;

			saldoBerjalan += debit - kredit;

			return {
			Tanggal: item.tanggal_bayar,
			OrderID: item.order_id,
			Nama: item.nama,
			Cluster: item.cluster,
			Tipe: item.tipe_transaksi,
			Keterangan: item.deskripsi,
			Debit: debit,
			Kredit: kredit,
			Saldo: saldoBerjalan,
			};
		});

		const wsRekeningKoran = XLSX.utils.json_to_sheet(
			rekeningKoranData
		);

		XLSX.utils.book_append_sheet(
			workbook,
			wsRekeningKoran,
			"REKENING_KORAN"
		);

		/*
		* ======================
		* SHEET 3 - PENGGUNAAN DANA
		* ======================
		*/

		const penggunaanDanaData =
			data.penggunaan_dana.result.map((item) => ({
			Tanggal: item.tanggal_input,
			OrderID: item.order_id,
			Cluster: item.cluster,
			Nominal: item.nominal,
			Jenis: item.jenis_transaksi,
			}));

		const wsPenggunaanDana =
			XLSX.utils.json_to_sheet(penggunaanDanaData);

		XLSX.utils.book_append_sheet(
			workbook,
			wsPenggunaanDana,
			"PENGGUNAAN_DANA"
		);

		/*
		* ======================
		* SHEET 4 - PEMASUKAN DANA
		* ======================
		*/

		const pemasukanDanaData = data.rekening_koran
			.filter(
			(item) =>
				item.jenis_transaksi.toLowerCase() === "debit"
			)
			.map((item) => ({
			Tanggal: item.tanggal_bayar,
			Nama: item.nama,
			Cluster: item.cluster,
			Tipe: item.tipe_transaksi,
			JumlahBulan: item.jumlah_bulan,
			Nominal: item.nominal,
			}));

		const wsPemasukanDana =
			XLSX.utils.json_to_sheet(pemasukanDanaData);

		XLSX.utils.book_append_sheet(
			workbook,
			wsPemasukanDana,
			"PEMASUKAN_DANA"
		);

		/*
		* DOWNLOAD FILE
		* ======================
		*/

		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});

		const file = new Blob([excelBuffer], {
			type:
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(
			file,
			`Laporan_Keuangan_${new Date().getTime()}.xlsx`
		);
	}
    
    return (
		<div className="container-fluid p-4 min-vh-100">

			<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
				<div style={{ display:'flex', justifyContent:'flex-start', alignItems:'center' }}>
					<div>
						<div style={{ fontSize:30, fontWeight:'bold' }}>Nomor Rekening Cluster</div>
						<div style={{ fontSize:15 }}>Kelola Nomor Rekening Cluster Anda Untuk Pengajuan Penarikan Dana</div>
					</div>
				</div>
				<div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
					{ListNomorRekening.length < 4 &&
					<div 
					style={{ backgroundColor:'#FFFFFF', border:'1px solid #002C00', padding:10, borderRadius:10, cursor:'pointer' }} onClick={() => setShowModalInputNomorRekening(true)}>
						<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
							<img src={IconAdd} alt="logo" style={{ height:20, width:20 }}  />
							<div style={{ width:5 }} />
							<div style={{ color:'#002C00', fontWeight:'bold' }}>Input Nomor Rekening</div>
						</div>
					</div>}
					<div style={{ width:10 }} />
					<div style={{ backgroundColor:'#FFFFFF', border:'1px solid #002C00', padding:10, borderRadius:10, cursor:'pointer' }}>
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
							<img src={IconWallet} alt="logo" style={{ height:30, width:30 }} />
						</div>
						<div>
							<div className="finance-title">
								Jumlah Rekening
							</div>
							<div className="finance-value">
								{TotalRecords}
							</div>
							<div className="finance-sub-title">
								Jumlah Nomor Rekening Aktif
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card border-0 shadow rounded-4 p-3">
				

				<div className="lk-table">
					{ListNomorRekening.length > 0 &&
					<div className="lk-header">
						<div>Cluster</div>
						<div>Nomor Rekening</div>
						<div>Nama Bank</div>
						<div>Nama Rekening</div>
						<div>Tanggal Input</div>
						<div>Aksi</div>
					</div>}
					{ListNomorRekening?.length > 0 ?
					ListNomorRekening?.map((item, index) => (
						<div className="lk-row" key={index}>
							<div className="lk-order">
								<div className="order-id">
									{item.cluster}
								</div>
							</div>

							<div>
								<div>
									{item.nomor_rekening}
								</div>
							</div>

							<div>
								<div>
									{item.nama_bank}
								</div>
							</div>

							<div>
								<div>
									{item.nama_rekening}
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
										onClick={() => {
											setShowModalInputNomorRekening(true)
										}}
									>
										Edit Data
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => {
											setAlertState("confirm")
											setIdRekening(item.id)
											setShowAlert(true)
											setConfirmMessage("Apakah Anda yakin ingin menghapus \n" + item.judul + "?")
										}}
									>
										Hapus Data
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					))
					:
					<div className="empty-state">
						<div className="empty-title">
							Belum Ada Nomor Rekening
						</div>
						<div className="empty-description">
							Nomor rekening penarikan dana Anda akan muncul di sini
							setelah Anda melakukan input nomor rekening ke dalam sistem.
						</div>
						{ListNomorRekening.length < 4 &&
						<div className="empty-action">
							<button
								className="btn-add-transaction"
								onClick={() => setShowModalInputNomorRekening(true)}
							>
								+ Input Nomor Rekening
							</button>
						</div>}
					</div>}

				</div>

				{ListNomorRekening.length > 0 &&
				<div className="d-flex justify-content-between align-items-center mt-3">
					<div style={{ fontWeight:'bold' }}>Total Data : {TotalRecords}</div>
					<div className="d-flex gap-2">
						<Pagination
							currentPage={CurrentPage}
							totalPage={TotalPage}
							onPageChange={(page) => {
								if (!LoadingNomorRekening) {
									setCurrentPage(page);
								}
							}}
						/>
					</div>
				</div>}

				<ModalInputNomorRekening
					showModal={ShowModalInputNomorRekening}
					
					nomorRekening={NomorRekening}
					onChangeNomorRekening={(event) => setNomorRekening(event.target.value)}
					namaRekening={NamaRekening}
					onChangeNamaRekening={(event) => setNamaRekening(event.target.value)}
					namaBank={NamaBank}
					onChangeNamaBank={(event) => setNamaBank(event.target.value)}

					onClose={() => setShowModalInputNomorRekening(false)}
					onInsert={() => handleInputNomorRekening()}
				/>

				<Alert
					alertState={AlertState}
					onConfirm={() => handleConfirmAlert(AlertState)}
					onCancel={() => setShowAlert(false)}
					onEscapeKey={() => setShowAlert(false)}
					onOutsideClick={() => setShowAlert(false)}
					showAlert={ShowAlert}
					sessionMessage={SessionMessage}
					successMessage={SuccessMessage}
					errorMessageAlert={ErrorMessageAlert}
					errorMessageAlertLogout={ErrorMessageAlertLogout}
					validationMessage={ValidationMessage}
					confirmMessage={ConfirmMessage}
				/>

			</div>
		</div>
	);
}

export default ListNomorRekening;