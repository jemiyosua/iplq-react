import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import './LeftMenu.css';
import { FaServer, FaMicrosoft, FaBuilding, FaMicrochip, FaHandHoldingHeart, FaHandshake, FaSortUp, FaSortDown, FaArrowRight, FaWhatsapp, FaWhatsappSquare, FaHornbill, FaWater, FaChartArea, FaPeopleCarry } from 'react-icons/fa';
import { GrConfigure, GrMoney, GrTransaction } from "react-icons/gr";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaPeopleGroup, FaPeopleRoof } from "react-icons/fa6";
import { FcAdvance, FcApproval, FcAssistant, FcCellPhone, FcDam, FcDataConfiguration, FcDownRight, FcFeedIn, FcFilingCabinet, FcHome, FcMoneyTransfer, FcPodiumWithSpeaker, FcRadarPlot, FcReadingEbook, FcSettings, FcSupport, FcTodoList } from "react-icons/fc";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Menu, MenuItem, Sidebar, SubMenu, useProSidebar } from 'react-pro-sidebar';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { IconMidtrans } from '../../../assets';
import { MdDashboard, MdOutlineDashboard } from 'react-icons/md';
import { CiMoneyBill } from "react-icons/ci";
import { IoDocumentAttachOutline } from "react-icons/io5";

const LeftMenu = () => {
	const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
	const [cookies, setCookie, removeCookie] = useCookies(['user']);
	const [LoadingMenuSidebar, setLoadingMenuSidebar] = useState(false)
	const [ListMenuSidebar, setListMenuSidebar] = useState([])
	const [Loading, setLoading] = useState(false)
	const { form }=useSelector(state=>state.PaketReducer);
	const { collapseSidebar } = useProSidebar();
	const [PageActive, setPageActive] = useState(1)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	const [IdMenu, setIdMenu] = useState("")
	const [IsSubMenuOpen, setIsSubMenuOpen] = useState(false)

	useEffect(() => {
		window.scrollTo(0, 0)
		getLeftMenu()
	},[])

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        // dispatch(setForm("ParamKey",''))
        // dispatch(setForm("Username",''))
        // dispatch(setForm("Name",''))
        // dispatch(setForm("Role",''))
        if (window) {
            sessionStorage.clear();
		}
		history.push('/admin/login')
		return
    }

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

	const getLeftMenu = () => {
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

		setLoadingMenuSidebar(true)

		var url = paths.URL_API_ADMIN + 'LeftMenu';
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

			setLoadingMenuSidebar(false)

			if (data.error_code === "0") {
				setListMenuSidebar(data.result)
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
			setLoading(false)
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

	const handlePage = (urlPage) => {
		// history.push(urlPage)
		window.location.href=urlPage;
		// return
	}

	const handleOpenSubmenu = (id) => {
		console.log("id : ", id)
		if (id == "") {
			if (IdMenu == id) {
				setIsSubMenuOpen(true)
			} else {
				setIsSubMenuOpen(false)
			}
		} else {
			console.log("masuk sini")
			setIsSubMenuOpen(false)
		}
	}
    
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial', backgroundColor:'#FFFFFF' }}>

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
			
			<Sidebar style={{height:"100vh"}}>
				<Menu>
					<MenuItem
						icon={<MenuOutlinedIcon />}
						onClick={() => {
							collapseSidebar();
						}}
					><h5 style={{fontWeight:'bold'}}>IPLQ {getCookie("access_name")}</h5>
					</MenuItem>

					{LoadingMenuSidebar ?
					<Skeleton count={ListMenuSidebar?.length} />
					:
					ListMenuSidebar?.length > 0 && ListMenuSidebar.map((item,index) => {
						var icon = ""
						if (item.menu === "Dashboard") {
							icon = <MdOutlineDashboard />
						} else if (item.menu === "Integrasi Whatsapp") {
							icon = <FaWhatsapp />
						} else if (item.menu === "Aset") {
							icon = <IoDocumentAttachOutline />
						} else if (item.menu === "Billing") {
							icon = <CiMoneyBill />
						} else if (item.menu === "Konfigurasi") {
							icon = <GrConfigure />
						} else if (item.menu === "Kepengurusan") {
							icon = <FaPeopleGroup />
						} else if (item.menu === "Penghuni") {
							icon = <FaPeopleRoof />
						} else if (item.menu === "Keuangan") {
							icon = <GrMoney />
						} else if (item.menu === "Pengelola Air") {
							icon = <FaWater />
						} else if (item.menu === "Lingkungan") {
							icon = <FaChartArea />
						} else if (item.menu === "Karyawan") {
							icon = <FaPeopleCarry />
						} else if (item.menu === "Midtrans") {
							icon = <GrTransaction />
						}
						return <>
							{item.list_sub_menu?.length > 0 ?
							<SubMenu 
								label={item.menu}
								icon={icon}
								open={item.id == IdMenu || form.pageActive == item.page_active ? true : false}
								onOpenChange={() => {
									handleOpenSubmenu(item.id)
									setIdMenu(item.id)
								}}
							>
							{item.list_sub_menu?.length > 0 && item.list_sub_menu?.map((item2,index2) => {
								return <MenuItem
									icon={<FcDownRight />}
									style={{ color:form.SubPageActive == item2.page_active ? '#004372' : '#000000', fontWeight:form.SubPageActive == item2.page_active ? 'bold' : '' }}
									onClick={() => handlePage(item2.href)}
								>{item2.sub_menu}</MenuItem>
							})}
							</SubMenu>
							:
							<MenuItem 
								icon={icon}
								onClick={() => handlePage(item.href)}
								style={{backgroundColor:form.PageActive == item.page_active && '#e8f7ef',color:form.PageActive == item.page_active && '#18a957'}}
							>{item.menu == "Midtrans" ? <img src={IconMidtrans} style={{height:75}} /> : item.menu}</MenuItem>
							}
						</>
					})}
				</Menu>
			</Sidebar>

		</div>
    )
}

export default LeftMenu;
