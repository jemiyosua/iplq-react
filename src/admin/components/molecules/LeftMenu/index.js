import React, { useEffect, useState } from 'react';
import './LeftMenu.css';
import { useHistory } from "react-router-dom";
import { IconDashboardLeftMenu, IconLogoIPLQ } from '../../../assets';
import { FaArrowAltCircleLeft, FaBuilding, FaCalendarCheck, FaChevronDown, FaChevronUp, FaClipboardList, FaCreditCard, FaDashcube, FaDoorClosed, FaExchangeAlt, FaFileImport, FaFileInvoice, FaFileInvoiceDollar, FaHandHolding, FaHome, FaListAlt, FaMandalorian, FaMoneyBill, FaMoneyBillWave, FaMoneyCheck, FaMoneyCheckAlt, FaParking, FaPen, FaPenAlt, FaUniversity, FaUser, FaUserCog, FaWalking, FaWallet } from 'react-icons/fa';
import { FaBilibili, FaHandHoldingDollar, FaHelmetSafety, FaMoneyBill1Wave, FaMoneyBillTransfer, FaMoneyBillWheat, FaPeopleGroup } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { Gap } from '../../atoms';
import { AlertMessage, paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

const getMenuKeyword = (...values) => {
	return values
		.filter(Boolean)
		.join(' ')
		.toLowerCase()
		.replace(/[-_]/g, ' ');
}

const hasKeyword = (keyword, keywords) => {
	return keywords.some((item) => keyword.includes(item));
}

const getMenuIcon = (item) => {
	const keyword = getMenuKeyword(item?.menu, item?.page_active, item?.href_page);

	if (hasKeyword(keyword, ['dashboard'])) return <FaHome />;
	if (hasKeyword(keyword, ['laporan keuangan'])) return <FaFileInvoiceDollar />;
	if (hasKeyword(keyword, ['tagihan', 'billing'])) return <FaFileInvoice />;
	if (hasKeyword(keyword, ['transaksi'])) return <FaExchangeAlt />;
	if (hasKeyword(keyword, ['donasi'])) return <FaHandHoldingDollar />;
	if (hasKeyword(keyword, ['data warga', 'warga'])) return <FaPeopleGroup />;
	if (hasKeyword(keyword, ['fasilitas', 'booking'])) return <FaParking />;
	if (hasKeyword(keyword, ['pengaduan'])) return <FaHelmetSafety />;
	if (hasKeyword(keyword, ['master cluster', 'cluster'])) return <FaBuilding />;
	if (hasKeyword(keyword, ['rsvp', 'tamu'])) return <FaCalendarCheck />;
	if (hasKeyword(keyword, ['tarik dana'])) return <FaWallet />;
	if (hasKeyword(keyword, ['rekening'])) return <FaUniversity />;
	if (hasKeyword(keyword, ['bank', 'list bank'])) return <FaUniversity />;
	if (hasKeyword(keyword, ['midtrans', 'payment', 'pembayaran'])) return <FaCreditCard />;
	if (hasKeyword(keyword, ['user'])) return <FaUserCog />;
	if (hasKeyword(keyword, ['menu', 'manajemen menu'])) return <FaListAlt />;

	return <FaListAlt />;
}

const getSubMenuIcon = (itemSub) => {
	const keyword = getMenuKeyword(itemSub?.sub_menu, itemSub?.page_active, itemSub?.href_page);

	if (hasKeyword(keyword, ['import'])) return <FaFileImport />;
	if (hasKeyword(keyword, ['input'])) return <FaPenAlt />;
	if (hasKeyword(keyword, ['transaksi'])) return <FaMoneyBillTransfer />;
	if (hasKeyword(keyword, ['tagihan ipl', 'ipl'])) return <FaMoneyBillWave />;
	if (hasKeyword(keyword, ['iuran'])) return <FaMoneyCheckAlt />;
	if (hasKeyword(keyword, ['donasi'])) return <FaHandHoldingDollar />;
	if (hasKeyword(keyword, ['keuangan'])) return <FaFileInvoiceDollar />;
	if (hasKeyword(keyword, ['data warga', 'warga'])) return <FaPeopleGroup />;
	if (hasKeyword(keyword, ['booking', 'rsvp', 'tamu'])) return <FaCalendarCheck />;
	if (hasKeyword(keyword, ['fasilitas'])) return <FaParking />;
	if (hasKeyword(keyword, ['pengaduan'])) return <FaHelmetSafety />;
	if (hasKeyword(keyword, ['master cluster', 'cluster'])) return <FaBuilding />;
	if (hasKeyword(keyword, ['tarik dana'])) return <FaWallet />;
	if (hasKeyword(keyword, ['rekening'])) return <FaUniversity />;
	if (hasKeyword(keyword, ['bank', 'list bank'])) return <FaUniversity />;
	if (hasKeyword(keyword, ['midtrans', 'payment', 'pembayaran'])) return <FaCreditCard />;
	if (hasKeyword(keyword, ['laporan'])) return <FaClipboardList />;
	if (hasKeyword(keyword, ['menu admin'])) return <FaListAlt />;
	if (hasKeyword(keyword, ['menu aplikasi'])) return <FaListAlt />;

	return <FaListAlt />;
}

const LeftMenu = ({ children }) => {
	const {form}=useSelector(state=>state.PaketReducer);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);

	const [OpenMenuId, setOpenMenuId] = useState(null);

	const [Collapsed, setCollapsed] = useState(false);
	const [Open, setOpen] = useState(false);
	const [ListMenu, setListMenu] = useState([]);

	// ---------- alert ----------
	const [AlertState, setAlertState] = useState("")
	const [ShowAlert, setShowAlert] = useState(true)
	const [SessionMessage, setSessionMessage] = useState("")
	const [SuccessMessage, setSuccessMessage] = useState("")
	const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
	const [ValidationMessage, setValidationMessage] = useState("")
	const [ConfirmMessage, setConfirmMessage] = useState("")
	
	const history = useHistory();

	useEffect(() => {

		getListLeftMenu()

		console.log(form)
		
		// console.log(pageActive);
		console.log(form.PageActive)
	}, [])

	const handleToggleSidebar = () => {
		if (window.innerWidth < 768) {
			setOpen(true); // mobile → open overlay
		} else {
			setCollapsed(!Collapsed); // desktop → collapse
		}
	};

	const page = (menu) => {
		setOpen(false)
	}

	const handleToggleSubMenu = (menuId) => {
		setOpenMenuId((prevMenuId) => prevMenuId === menuId ? null : menuId);
	}

	const handleNavigateMenu = (hrefPage) => {
		if (!hrefPage) return;

		const cleanHrefPage = hrefPage.replace(/^\/+/, '');
		const urlPage = cleanHrefPage.startsWith('admin/') ? `/${cleanHrefPage}` : `/admin/${cleanHrefPage}`;

		setOpen(false)
		history.push(urlPage)
	}

	const handleLogout = () => {
		removeCookie('varCookie', { path: '/'})
		if(window){
            sessionStorage.clear();
		}
		window.location.href = '/admin/login'
	}

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

	const getListLeftMenu = (posisi) => {
		var cookieUsername = getCookie("username");
		var cookieParamKey = getCookie("paramkey");

		var requestBody = JSON.stringify({
			"username": cookieUsername,
			"paramkey": cookieParamKey,
			"method": "SELECT",
			"page": 1,
			"row_page": -1,
			"order_by": "",
			"order": ""
		});

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
			if (data.error_code === '0' || data.error_code === 0) {
				setListMenu(data.result)
			} else {
				if (data.error_code === 2) {
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
		<div className="layout">

			{/* SIDEBAR */}
			<div className={`sidebar ${Collapsed ? "collapsed" : ""} ${Open ? "open" : ""}`}>
				
				<div className="sidebar-header">
					{!Collapsed && <img src={IconLogoIPLQ} alt="logo" style={{ height:40 }} />}
				</div>

				<div className="menu">
					{ListMenu?.length > 0 && ListMenu.map((item,index) => {
						const menuId = item.id || index;
						const isSubMenuOpen = OpenMenuId === menuId;
						const isMenuActive = form.PageActive == item.page_active || item.list_sub_menu?.some((itemSub) => form.PageActive == itemSub.page_active);
						return <React.Fragment key={menuId}>
							{item.list_sub_menu?.length > 0 ?
							<>
								<div className={`menu-item ${isMenuActive ? "active" : ""}`} onClick={() => handleToggleSubMenu(menuId)}>
									{getMenuIcon(item)}
									{!Collapsed && (
										<>
											<span className="menu-item-title">{item.menu}</span>
											<span className="menu-arrow">
												{isSubMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
											</span>
										</>
									)}
								</div>
								{isSubMenuOpen && !Collapsed && (
									<div className="submenu">
										{item.list_sub_menu.map((itemSub,indexSub) => {
											return (
												<div key={itemSub.id || `${menuId}-${indexSub}`} className={`submenu-item ${form.PageActive == itemSub.page_active ? "active" : ""}`} onClick={() => {
													handleNavigateMenu(itemSub.href_page)
												}} style={{ cursor:'pointer' }}>{getSubMenuIcon(itemSub)} {itemSub.sub_menu}</div>
											)
										})}
										{/* <div className={`submenu-item ${form.PageActive == "IURAN" && "active"}`} onClick={() => {
											setOpen(false)
											window.location.href = "/admin/iuran"
										}} style={{ cursor:'pointer' }}><FaMoneyBillWheat /> Iuran Warga</div> */}
									</div>
								)}
							</>
							:
							<div className={`menu-item ${isMenuActive ? "active" : ""}`} onClick={() => {
								handleNavigateMenu(item.href_page)
							}}>
								{getMenuIcon(item)} {!Collapsed && item.menu}
							</div>
							}
						</React.Fragment>
					})}
					
					{/* <div className={`menu-item ${form.PageActive == "DASHBOARD" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/dashboard"
					}}>
						<FaDashcube /> {!Collapsed && "Dashboard"}
					</div>

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "LAPORAN_KEUANGAN" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/laporan-keuangan"
					}}><FaMoneyCheck /> {!Collapsed && "Laporan Keuangan"}
					</div>

					<Gap height={15} />

					<div className="menu-item" onClick={() => setOpenMenuTagihan(!OpenMenuTagihan)}>
						<FaMoneyBill1Wave /> {!Collapsed && "Tagihan"}
					</div>
					{OpenMenuTagihan && !Collapsed && (
						<div className="submenu">
							<div className={`submenu-item ${form.PageActive == "IPL" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/ipl"
							}} style={{ cursor:'pointer' }}><FaMoneyBillTransfer /> Tagihan IPL</div>
							<div className={`submenu-item ${form.PageActive == "IURAN" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/iuran"
							}} style={{ cursor:'pointer' }}><FaMoneyBillWheat /> Iuran Warga</div>
						</div>
					)}

					<Gap height={15} />

					<div className="menu-item" onClick={() => setOpenMenuTransaksi(!OpenMenuTransaksi)}>
						<FaMoneyBill1Wave /> {!Collapsed && "Transaksi"}
					</div>
					{OpenMenuTransaksi && !Collapsed && (
						<div className="submenu">
							<div className={`submenu-item ${form.PageActive == "TRANSAKSI_IPL" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/transaksi-ipl"
							}} style={{ cursor:'pointer' }}><FaMoneyBillTransfer /> Transaksi IPL</div>
							<div className={`submenu-item ${form.PageActive == "TRANSAKSI_IURAN" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/transaksi-iuran"
							}} style={{ cursor:'pointer' }}><FaMoneyBillWheat /> Transaksi Iuran</div>
							<div className={`submenu-item ${form.PageActive == "DONASI" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/donasi"
							}} style={{ cursor:'pointer' }} ><FaHandHoldingDollar /> Donasi</div>
						</div>
					)}

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "RSVP" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/rsvp"
					}}><FaPenAlt /> {!Collapsed && "RSVP Tamu"}
					</div>

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "FASILITAS" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/fasilitas"
					}}><FaParking /> {!Collapsed && "Fasilitas"}
					</div>

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "DATA_WARGA" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/data-warga"
					}}><FaPeopleGroup /> {!Collapsed && "Data Warga"}
					</div>

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "LAPORAN_PENGADUAN" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/laporan-pengaduan"
					}}><FaHelmetSafety /> {!Collapsed && "Laporan Pengaduan"}
					</div>

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "MASTER-CLUSTER" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/master-cluster"
					}}><FaBuilding /> {!Collapsed && "Master Cluster"}
					</div>

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "MANAJEMEN-USER" && "active"}`} onClick={() => setOpen(false)}>
						<FaUser /> {!Collapsed && "Manajemen User"}
					</div> */}
				</div>

				<div className="sidebar-footer">
				<div onClick={() => setCollapsed(!Collapsed)}>
					<FaArrowAltCircleLeft /> {!Collapsed && "Perkecil"}
				</div>
				<div className="logout" onClick={() => handleLogout()}><FaDoorClosed/> {!Collapsed && "Keluar"}</div>
				</div>
			</div>

			{/* MAIN */}
			<div className="main">

				{/* TOPBAR */}
				<div className="topbar">
					<div className="left">
						<div onClick={handleToggleSidebar}>
						☰
						</div>
						{/* <h2 className="logo-text">ResidentHub</h2> */}
					</div>

					<div style={{ fontWeight:'bold', fontSize:20 }}>👤 {cookies.varCookie?.split("|")[4]}</div>
				</div>

				{/* CONTENT */}
				<div className="content">
				{children}
				</div>
			</div>

			{/* OVERLAY (MOBILE) */}
			{Open && (
				<div className="overlay" onClick={() => setOpen(false)}></div>
			)}

		</div>
	);
};

export default LeftMenu;
