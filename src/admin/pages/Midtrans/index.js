import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../components';
import './midtrans.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import DataTable from "react-data-table-component";
import { IconMidtrans } from '../../assets';

const Midtrans = () => {
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

    const [ListMidtrans, setListMidtrans] = useState([])
    const [TotalRecords, setTotalRecords] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)

	const [LoadingMidtrans, setLoadingMidtrans] = useState(false)

    const handleScroll = (scrollOffset) => {
        if (containerRef.current) {
          	containerRef.current.scrollLeft += scrollOffset;
        }
    };

	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const rowsPerPage = 3;

	const indexLast = currentPage * rowsPerPage;
	const indexFirst = indexLast - rowsPerPage;

	const data_midtrans = [
		{ id: 1, nama: "Jemi", email: "jemi@email.com", status: "Aktif" },
		{ id: 2, nama: "Budi", email: "budi@email.com", status: "Trial" },
		{ id: 3, nama: "Andi", email: "andi@email.com", status: "Aktif" },
		{ id: 4, nama: "Rudi", email: "rudi@email.com", status: "Nonaktif" },
		{ id: 5, nama: "Sari", email: "sari@email.com", status: "Aktif" }
	];

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
            dispatch(setForm("PageActive","MIDTRANS"))
        }

		getMidtrans()

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

	const getMidtrans = () => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");
		var cookieAccessLogin = getCookie("access");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"access": cookieAccessLogin,
			"page": 1,
			"row_page": -1,
			"order_by": "",
			"order": ""
		});

		setLoadingMidtrans(true)

		var url = paths.URL_API_ADMIN + 'Midtrans';
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
			setLoadingMidtrans(false)

			if (data.error_code === "0") {
				setListMidtrans(data.result)
				setTotalRecords(data.total_record)
				setTotalPages(data.total_page)
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
			setLoadingMidtrans(false)

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

	const filteredData = data_midtrans.filter(item =>
		item.nama.toLowerCase().includes(search.toLowerCase())
	);

	const currentData = filteredData.slice(indexFirst, indexLast);

	const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    
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
					window.location.href="/admin/login";
				}}
				btnSize="sm">
				{ErrorMessageAlertLogout}
			</SweetAlert>
			:""}

			<h3 className="section-title">Transaksi Midtrans</h3>
			<div className="table-container">
				<input
					className="table-search"
					placeholder="Search..."
					value={search}
					onChange={(e)=>setSearch(e.target.value)}
				/>

				<table className="data-table">
					<thead>
						<tr>
							<th>Transaction ID</th>
							<th>Nama</th>
							<th>Gross Amount</th>
							<th>Admin Fee</th>
							<th>Transaction Status</th>
						</tr>
					</thead>

					<tbody>
					{ListMidtrans.map((item,index)=>(
						<tr key={item.id}>
							<td style={{color:'#22c55e',cursor:'pointer'}}>{item.trx_id}</td>
							<td>{item.nama}</td>
							<td>{item.gross_amount}</td>
							<td>{item.admin_fee}</td>
							<td>
								<span className="badge bg-success">{item.trx_status}</span>
							</td>
						</tr>
					))}
					</tbody>
				</table>

				<div className="table-pagination">
					<button 
						disabled={currentPage === 1} 
						onClick={()=>setCurrentPage(currentPage-1)}
					>Prev</button>

					<span>
					Page {currentPage} of {TotalPages}
					</span>

					<button
						disabled={currentPage === totalPages}
						onClick={()=>setCurrentPage(currentPage+1)}
					>Next</button>

				</div>

			</div>
		</div>
    )
}

export default Midtrans;