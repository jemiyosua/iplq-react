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

const IPL = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")

	const [CurrentPage, setCurrentPage] = useState(1);

	const [ListIPL, setListIPL] = useState([])
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

	const [TotalCluster, setTotalCluster] = useState(0)
	const [TotalRumah, setTotalRumah] = useState(0)
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
            dispatch(setForm("PageActive","IPL"))
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
    
    return (
		<div className="container-fluid p-4 min-vh-100">
			<div className="card border-0 shadow rounded-4 p-3">

				{/* Header */}
				<div className="d-flex justify-content-between align-items-center mb-3">
					<div className="d-flex align-items-center gap-2">
						{/* <div className="bg-success-subtle text-success p-2 rounded-3">💵</div> */}
						<h5 className="mb-0 fw-bold">Tagihan IPL</h5>
						{/* <span className="badge bg-secondary">288</span> */}
					</div>
				</div>

				{/* Search + Export */}
				<div className="d-flex justify-content-between mb-3">
					<input
						type="text"
						className="form-control w-75"
						placeholder="🔍 Cari data..."
					/>
					<button className="btn btn-success">⬇ Export</button>
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