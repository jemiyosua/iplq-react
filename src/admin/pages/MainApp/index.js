import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useSelector } from 'react-redux'
import { BrowserRouter , Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import LeftMenu from '../../components/molecules/LeftMenu'
import { historyConfig } from '../../utils/functions'
import Dashboard from '../Dashboard'
// import Gudang from '../Gudang'
// import Kasir from '../Kasir'
// import Keuangan from '../Keuangan'
// import Others from '../Others'
// import ImportProduct from '../Gudang/MasterProduct/ImportProduct'
// import ScanProduct from '../Gudang/MasterProduct/ScanProduct'
import HeroHome from '../HeroHome'
import SectionDevHome from '../SectionDevHome'
import ProductHome from '../ProductHome'
import UpcomingProject from '../UpcomingProject'
import CompanyOverview from '../CompanyOverview'
import Statistic from '../Statistic'
import VisionMision from '../VisionMision'
import LeadershipInitaitive from '../LeadershipInitaitive'
import Awards from '../Awards'
import CoreValues from '../CoreValues'
import HeaderLogo from '../HeaderLogo'
import HeaderMenu from '../HeaderMenu'
import { FaBars, FaUserCircle } from 'react-icons/fa'
import Midtrans from '../Midtrans'
import Billing from '../Billing'

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

                <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                    <div style={styles.navbar}>
                        <div style={styles.left}>
                            {/* <FaBars style={{cursor:"pointer"}} /> */}
                        </div>

                        <div style={styles.right}>
                            <div style={styles.profile}>
                                <FaUserCircle size={22}/>
                                <span>{getCookie("access_name")}</span>
                            </div>
                        </div>
                    </div>
                

                    <div className="content-wrapper" style={{ backgroundColor:'#F6FBFF', height:'100%', padding:30,  width:'100%' }}> 
                        {/* <Header/> */}
                        <BrowserRouter basename="/admin">
                            <Switch>
                                <Route exact path="/dashboard">
                                    <Dashboard />
                                </Route>
                                <Route path="/integrasi-wa">
                                    <Dashboard />
                                </Route>
                                <Route path="/aset">
                                    <Dashboard />
                                </Route>
                                <Route path="/billing">
                                    <Billing />
                                </Route>
                                 <Route path="/midtrans">
                                    <Midtrans />
                                </Route>
                                <Route path="/konfigurasi">
                                    <Dashboard />
                                </Route>
                                <Route path="/kepengurusan">
                                    <Dashboard />
                                </Route>
                                <Route path="/penghuni">
                                    <Dashboard />
                                </Route>
                                <Route path="/keuangan">
                                    <Dashboard />
                                </Route>
                                <Route path="/pengelola-air">
                                    <Dashboard />
                                </Route>
                                <Route path="/lingkungan">
                                    <Dashboard />
                                </Route>
                                <Route path="/karyawan">
                                    <Dashboard />
                                </Route>
                                <Route path="/syarat-ketentuan">
                                    <Dashboard />
                                </Route>
                                <Route path="/kebijakan-privasi">
                                    <Dashboard />
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