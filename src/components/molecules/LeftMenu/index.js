import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { NavLink } from 'react-router-dom';
import './LeftMenu.css';
import { faCalendarDays, faChalkboardTeacher, faChalkboardUser, faChartPie, faGauge, faGear, faPerson, faSchool, faScrewdriver, faScrewdriverWrench, faScroll, faServer, faSignOutAlt, faStore, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { Sidebar, Menu, MenuItem, useProSidebar, SubMenu } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { FaBalanceScale, FaBoxOpen, FaCashRegister, FaDollarSign, FaFileExport, FaFileInvoice, FaHome, FaLayerGroup, FaList, FaMoneyBill, FaNewspaper, FaQrcode, FaServer, FaWarehouse } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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

	useEffect(() => {
		window.scrollTo(0, 0)

		console.log("PageActive : " + form.PageActive)

		getListMenu()

	},[])

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        dispatch(setForm("Name",''))
        dispatch(setForm("Role",''))
        if(window){
            sessionStorage.clear();
		}
		history.push('/admin/login')
		return
    }

	const getCookie = (tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie=="string") {
			var LongSecretCookie = SecretCookie.split("|");
			var Username = LongSecretCookie[0];
			var ParamKeyArray = LongSecretCookie[1];
			var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
		
			if (tipe === "username") {
				return Username;
			} else if (tipe === "paramkey") {
				return ParamKey;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	const getListMenu = () => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "SELECT",
			"Page": 1,
			"RowPage": -1,
			"OrderBy": "",
			"Order": ""
		});

		setLoadingMenuSidebar(true)

		var url = paths.URL_API_ADMIN + 'Menu';
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

			if (data.ErrorCode === "0") {
				setListMenuSidebar(data.Result)
				return
			} else {
				if (data.ErrorCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return;
				} else {
					setErrorMessageAlert(data.ErrorMessage);
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
    
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
			
			<Sidebar style={{ height: "100vh", backgroundColor:'#E3E3E3' }}>
				<Menu>
					<MenuItem
						icon={<MenuOutlinedIcon />}
						onClick={() => {
						collapseSidebar();
						}}
					>
						{" "}
						<h5>Gudang Apps</h5>
					</MenuItem>

					{LoadingMenuSidebar ?
					<Skeleton count={ListMenuSidebar.length} />
					:
					ListMenuSidebar.length > 0 && ListMenuSidebar.map((item,index) => {
						var Icon = ""
						var PageActive = ""
						if (item.Menu === "Dashboard") {
							PageActive = "DASHBOARD"
							Icon = <FaHome />
						} else if (item.Menu === "Gudang") {
							PageActive = "GUDANG"
							Icon = <FaWarehouse />
						} else if (item.Menu === "Kasir") {
							PageActive = "KASIR"
							Icon = <FaCashRegister />
						} else if (item.Menu === "Keuangan") {
							PageActive = "KEUANGAN"
							Icon = <FaMoneyBill />
						} else if (item.Menu === "Lainnya") {
							PageActive = "LAINNYA"
							Icon = <FaServer />
						}
						// return item.SubMenu.length > 0 ? 
						// <SubMenu icon={Icon} label={item.Menu} 
						// // open={item.Menu === "Gudang" ? true : false}
						// >
						// 	{item.SubMenu.map((item2,index2) => {
						// 		var Icon2 = ""
						// 		if (item2.Menu === "Master Product") {
						// 			Icon2 = <FaLayerGroup />
						// 		} else if (item2.Menu === "Stok Product") {
						// 			Icon2 = <FaBoxOpen />
						// 		} else if (item2.Menu === "Scan Product") {
						// 			Icon2 = <FaQrcode />
						// 		} else if (item2.Menu === "Transaksi") {
						// 			Icon2 = <FaFileInvoice />
						// 		} else if (item2.Menu === "Rekening Koran") {
						// 			Icon2 = <FaNewspaper />
						// 		} else if (item2.Menu === "Report Transaksi") {
						// 			Icon2 = <FaFileExport />
						// 		} else if (item2.Menu === "Profit & Loss") {
						// 			Icon2 = <FaDollarSign />
						// 		} else if (item2.Menu === "Neraca") {
						// 			Icon2 = <FaBalanceScale />
						// 		} else if (item2.Menu === "Category") {
						// 			Icon2 = <FaList />
						// 		}
						// 		return item.Id === item2.ParentId && <a href={item2.Href} style={{ textDecoration:'none', color:'#000000' }}><MenuItem icon={Icon2}>{item2.Menu}</MenuItem></a>
						// 	})}
						// </SubMenu>
						// :icon={Icon}
						return <a href={item.Href} style={{ textDecoration:'none', color:'#000000' }}>
							{form.PageActive === PageActive ? 
							<MenuItem icon={Icon}>
								<div style={{ display:'flex', justifyContent:'flex-start' }}>
									{/* <div style={{ backgroundColor:'#3A379F', width:5, borderTopRightRadius:10, borderBottomRightRadius:10 }}></div> */}
									<div style={{ display:'flex', alignItems:'center', backgroundColor:'#004372', borderTopLeftRadius:10, borderTopRightRadius:10, borderBottomLeftRadius:10, borderBottomRightRadius:10, width:'100%' }}>
										<div style={{ color:'#FFFFFF', fontSize:13, fontWeight:'bold', marginLeft:20, paddingTop:10, paddingBottom:10 }}>{item.Menu}</div>
									</div>
								</div>
							</MenuItem>
							// <div style={{ backgroundColor: form.PageActive === PageActive ? 'red' : '#FFFFFF', marginHorizontal: 10 }}></div>
							:
							// <MenuItem icon={Icon}>{item.Menu}</MenuItem>
							<MenuItem icon={Icon}>
								<div style={{ display:'flex', justifyContent:'flex-start' }}>
									{/* <div style={{ backgroundColor:'#3A379F', width:5, borderTopRightRadius:10, borderBottomRightRadius:10 }}></div> */}
									<div style={{ display:'flex', alignItems:'center', backgroundColor:'#E3E3E3', borderTopLeftRadius:10, borderTopRightRadius:10, borderBottomLeftRadius:10, borderBottomRightRadius:10, width:'100%' }}>
										<div style={{ color:'#004372', fontSize:13, fontWeight:'bold', marginLeft:20, paddingTop:10, paddingBottom:10 }}>{item.Menu}</div>
									</div>
								</div>
							</MenuItem>
							}
						</a>
					})}

					{/* <SubMenu icon={<HomeOutlinedIcon />} label="Dashboard">
						<MenuItem icon={<PeopleOutlinedIcon />}>Item 1</MenuItem>
						<MenuItem icon={<PeopleOutlinedIcon />}>Item 2</MenuItem>
						<MenuItem icon={<PeopleOutlinedIcon />}>Item 3</MenuItem>
					</SubMenu>
					<MenuItem icon={<PeopleOutlinedIcon />}>Team</MenuItem>
					<MenuItem icon={<ContactsOutlinedIcon />}>Contacts</MenuItem>
					<MenuItem icon={<ReceiptOutlinedIcon />}>Profile</MenuItem>
					<MenuItem icon={<HelpOutlineOutlinedIcon />}>FAQ</MenuItem>
					<MenuItem icon={<CalendarTodayOutlinedIcon />}>Calendar</MenuItem> */}
				</Menu>
			</Sidebar>

		</div>
    )
}

export default LeftMenu;
