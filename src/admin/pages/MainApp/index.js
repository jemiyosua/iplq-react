import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useSelector } from 'react-redux'
import { BrowserRouter , Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import LeftMenu from '../../components/molecules/LeftMenu'
import { historyConfig } from '../../utils/functions'
import Dashboard from '../Dashboard'
import Midtrans from '../Midtrans'
import Billing from '../Billing'
import IPL from '../Tagihan/IPL'
import Iuran from '../Tagihan/Iuran'
import { FaUserCircle } from 'react-icons/fa'
import TransaksiIuran from '../Transaksi/TransaksiIuran'
import TransaksiIPL from '../Transaksi/TransaksiIPL'
import Donasi from '../Donasi/DonasiList'
import DonasiDetail from '../Donasi/DonasiDetail'
import DataWarga from '../DataWarga/DataWargaList'
import DataWargaImport from '../DataWarga/DataWargaImport'
import FasilitasList from '../Fasilitas/FasilitasList'
import FasilitasBooking from '../Fasilitas/FasilitasBooking'
import LaporanPengaduanList from '../LaporanPengaduan/LaporanPengaduanList'
import LaporangKeuanganList from '../LaporanKeuangan/LaporanKeuanganList'

const MainApp = () => {
    const history = useHistory(historyConfig);
    const {form}=useSelector(state=>state.PaketReducer);

    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    useEffect(() => {
    }, [])

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
    
    return (
        <div>
            <div className="main-app-wrapper mainapp" style={{ display:'flex'}}> 

                <LeftMenu />

                <div style={{ flex:1 }}>
                    {/* <div style={styles.navbar}>
                        <div style={styles.left}>
                        </div>

                        <div style={styles.right}>
                            <div style={styles.profile}>
                                <FaUserCircle size={22}/>
                                <span>{getCookie("access_name")}</span>
                            </div>
                        </div>
                    </div> */}

                    <div className="content-wrapper" style={{ paddingTop:70, paddingLeft:30, paddingRight:15, overflow:'hidden' }}> 
                        {/* <Header/> */}
                        <BrowserRouter basename="/admin">
                            <Switch>
                                <Route exact path="/dashboard">
                                    <Dashboard />
                                </Route>
                                <Route path="/laporan-keuangan">
                                    <LaporangKeuanganList />
                                </Route>
                                <Route path="/ipl">
                                    <IPL />
                                </Route>
                                <Route path="/iuran">
                                    <Iuran />
                                </Route>
								<Route path="/transaksi-ipl">
                                    <TransaksiIPL />
                                </Route>
                                <Route path="/transaksi-iuran">
                                    <TransaksiIuran />
                                </Route>
								<Route path="/donasi">
                                    <Donasi />
                                </Route>
								<Route path="/donasi-detail">
                                    <DonasiDetail />
                                </Route>
								<Route path="/data-warga">
                                    <DataWarga />
                                </Route>
								<Route path="/data-warga-import">
                                    <DataWargaImport />
                                </Route>
								<Route path="/fasilitas">
                                    <FasilitasList />
                                </Route>
                                <Route path="/fasilitas-booking">
                                    <FasilitasBooking />
                                </Route>
                                <Route path="/laporan-pengaduan">
                                    <LaporanPengaduanList />
                                </Route>
                            </Switch>
                        </BrowserRouter>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
	navbar:{
		height:"60px",
		background:"#ffffff",
		borderBottom:"1px solid #e5e7eb",
		display:"flex",
		alignItems:"center",
		justifyContent:"space-between",
		padding:"0 20px",
		position:"sticky",
		top:0,
		zIndex:10
	},

	left:{
		display:"flex",
		alignItems:"center",
		gap:"15px"
	},

	right:{
		display:"flex",
		alignItems:"center",
		gap:"20px"
	},

	profile:{
		display:"flex",
		alignItems:"center",
		gap:"8px",
		cursor:"pointer"
	}
}

export default MainApp