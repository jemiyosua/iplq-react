import React, { useEffect, useState } from 'react';
import './LeftMenu.css';
import { useHistory } from "react-router-dom";
import { IconDashboardLeftMenu, IconLogoIPLQ } from '../../../assets';
import { FaArrowAltCircleLeft, FaBuilding, FaDashcube, FaDoorClosed, FaHandHolding, FaMandalorian, FaMoneyBill, FaMoneyCheck, FaParking, FaPen, FaPenAlt, FaUser, FaWalking } from 'react-icons/fa';
import { FaBilibili, FaHandHoldingDollar, FaHelmetSafety, FaMoneyBill1Wave, FaMoneyBillTransfer, FaMoneyBillWheat, FaPeopleGroup } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { Gap } from '../../atoms';

const LeftMenu = ({ children }) => {
	const {form}=useSelector(state=>state.PaketReducer);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);

	const [OpenMenuLaporanKeuangan, setOpenMenuLaporanKeuangan] = useState(true);
	const [OpenMenuTagihan, setOpenMenuTagihan] = useState(true);
	const [OpenMenuTransaksi, setOpenMenuTransaksi] = useState(true);
	const [Collapsed, setCollapsed] = useState(false);
	const [Open, setOpen] = useState(false);
	
	const history = useHistory();

	useEffect(() => {

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

	const handleLogout = () => {
		removeCookie('varCookie', { path: '/'})
		if(window){
            sessionStorage.clear();
		}
		window.location.href = '/admin/login'
	}

	return (
		<div className="layout">

			{/* SIDEBAR */}
			<div className={`sidebar ${Collapsed ? "collapsed" : ""} ${Open ? "open" : ""}`}>
				
				<div className="sidebar-header">
					{!Collapsed && <img src={IconLogoIPLQ} alt="logo" style={{ height:40 }} />}
				</div>

				<div className="menu">
					<div className={`menu-item ${form.PageActive == "DASHBOARD" && "active"}`} onClick={() => {
						setOpen(false)
						window.location.href = "/admin/dashboard"
					}}>
						{/* <img src={IconDashboardLeftMenu} alt="logo" style={{ height:15, color:'#FFFFFF' }} /> {!collapsed && "Dashboard"} */}
						<FaDashcube /> {!Collapsed && "Dashboard"}
					</div>

					<Gap height={15} />

					<div className="menu-item" onClick={() => setOpenMenuLaporanKeuangan(!OpenMenuLaporanKeuangan)}>
						<FaMoneyCheck /> {!Collapsed && "Laporan Keuangan"}
					</div>
					{OpenMenuLaporanKeuangan && !Collapsed && (
						<div className="submenu">
							<div className={`submenu-item ${form.PageActive == "SUMMARY_IURAN" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/summary-iuran"
							}} style={{ cursor:'pointer' }}><FaMoneyBillTransfer /> Summary Iuran</div>
							<div className={`submenu-item ${form.PageActive == "REKENING_KORAN" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/rekening-koran"
							}} style={{ cursor:'pointer' }}><FaMoneyBillWheat /> Rekening Koran</div>
							<div className={`submenu-item ${form.PageActive == "PENGGUNAAN_DANA" && "active"}`} onClick={() => {
								setOpen(false)
								window.location.href = "/admin/penggunaan-dana"
							}} style={{ cursor:'pointer' }}><FaHandHoldingDollar /> Penggunaan Dana</div>
						</div>
					)}

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

					<div className={`menu-item ${form.PageActive == "MASTER-CLUSTER" && "active"}`} onClick={() => setOpen(false)}>
						<FaBuilding /> {!Collapsed && "Master Cluster"}
					</div>

					<Gap height={15} />

					<div className={`menu-item ${form.PageActive == "MANAJEMEN-USER" && "active"}`} onClick={() => setOpen(false)}>
						<FaUser /> {!Collapsed && "Manajemen User"}
					</div>
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

					<div>👤 SuperAdmin</div>
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