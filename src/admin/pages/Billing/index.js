import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../components';
// import './midtrans.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';

// import DataTable from "react-data-table-component";

const Billing = () => {
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

	const [search,setSearch] = useState("");

	const filteredData = data.filter(item =>
		item.nama.toLowerCase().includes(search.toLowerCase())
	);

    const handleScroll = (scrollOffset) => {
        if (containerRef.current) {
          	containerRef.current.scrollLeft += scrollOffset;
        }
    };

	const columns = [
		{
			name: "Nama",
			selector: row => row.nama,
			sortable: true
		},
		{
			name: "Email",
			selector: row => row.email
		},
		{
			name: "Status",
			selector: row => row.status
		},
		{
			name: "Action",
			cell: row => (
				<>
					<button>Edit</button>
					<button>Delete</button>
				</>
			)
		}
	];

	const data = [
		{
			id: 1,
			nama: "Jemi",
			email: "jemi@email.com",
			status: "Aktif"
		},
		{
			id: 2,
			nama: "Budi",
			email: "budi@email.com",
			status: "Trial"
		}
	];

	useEffect(() => {
        window.scrollTo(0, 0)

		console.log("masuk billing")

        var CookieNama = getCookie("nama");
        setName(CookieNama)

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey === null || CookieParamKey === "" || CookieUsername === null || CookieUsername === ""){
            window.location.href="admin/login";
        }else{
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","BILLING"))
        }

    },[])

	const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie=="string") {
            var LongSecretCookie = SecretCookie.split("|");
            var Username = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return Username;            
            } else if (tipe === "paramkey") {
                return ParamKey;
            } else if (tipe === "nama") {
                return Nama;
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

			<input
				placeholder="Search..."
				onChange={e=>setSearch(e.target.value)}
			/>
			
			{/* <DataTable
				title="Daftar User"
				columns={columns}
				data={data}
				pagination
				highlightOnHover
				responsive
			/> */}

		</div>
    )
}

export default Billing;