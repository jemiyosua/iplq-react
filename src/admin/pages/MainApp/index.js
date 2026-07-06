import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useSelector } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import LeftMenu from '../../components/molecules/LeftMenu'
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
import InputLaporanKeuangan from '../LaporanKeuangan/InputLaporanKeuangan'
import MasterCluster from '../MasterCluster'
import RSVPList from '../RSVP/RSVPList'
import RSVPDetail from '../RSVP/RSVPDetail'
import TarikDana from '../TarikDana/ListTarikDana'
import ListNomorRekening from '../TarikDana/ListNomorRekening'
import ListBank from '../TarikDana/ListBank'
import MenuAdmin from '../ManajemenMenu/MenuAdmin'
import MenuAplikasi from '../ManajemenMenu/MenuAplikasi'

const MainApp = () => {
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
                        <Switch>
                            <Route exact path="/admin/dashboard">
                                <Dashboard />
                            </Route>
                            <Route exact path="/admin/laporan-keuangan">
                                <LaporangKeuanganList />
                            </Route>
                            <Route exact path="/admin/input-laporan-keuangan">
                                <InputLaporanKeuangan />
                            </Route>
                            <Route exact path="/admin/tagihan-ipl">
                                <IPL />
                            </Route>
                            <Route exact path="/admin/tagihan-iuran">
                                <Iuran />
                            </Route>
							<Route exact path="/admin/transaksi-ipl">
                                <TransaksiIPL />
                            </Route>
                            <Route exact path="/admin/transaksi-iuran">
                                <TransaksiIuran />
                            </Route>
							<Route exact path="/admin/donasi">
                                <Donasi />
                            </Route>
							<Route exact path="/admin/donasi-detail">
                                <DonasiDetail />
                            </Route>
							<Route exact path="/admin/data-warga">
                                <DataWarga />
                            </Route>
							<Route exact path="/admin/data-warga-import">
                                <DataWargaImport />
                            </Route>
							<Route exact path="/admin/fasilitas">
                                <FasilitasList />
                            </Route>
                            <Route exact path="/admin/fasilitas-booking">
                                <FasilitasBooking />
                            </Route>
                            <Route exact path="/admin/laporan-pengaduan">
                                <LaporanPengaduanList />
                            </Route>
                            <Route exact path="/admin/master-cluster">
                                <MasterCluster />
                            </Route>
                            <Route exact path="/admin/rsvp">
                                <RSVPList />
                            </Route>
                            <Route exact path="/admin/rsvp-detail">
                                <RSVPDetail />
                            </Route>
                            <Route exact path="/admin/tarik-dana">
                                <TarikDana />
                            </Route>
                            <Route exact path="/admin/nomor-rekening">
                                <ListNomorRekening />
                            </Route>
                            <Route exact path="/admin/list-bank">
                                <ListBank />
                            </Route>
                            <Route exact path="/admin/menu-admin">
                                <MenuAdmin />
                            </Route>
                            <Route exact path="/admin/menu-aplikasi">
                                <MenuAplikasi />
                            </Route>
                        </Switch>
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
