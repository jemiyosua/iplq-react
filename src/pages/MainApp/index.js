import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useSelector } from 'react-redux'
import { BrowserRouter , Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import LeftMenu from '../../components/molecules/LeftMenu'
import { historyConfig } from '../../utils/functions'
// import Dashboard from '../Dashboard'
// import Gudang from '../Gudang'
// import Kasir from '../Kasir'
// import Keuangan from '../Keuangan'
// import Others from '../Others'
// import ImportProduct from '../Gudang/MasterProduct/ImportProduct'
// import ScanProduct from '../Gudang/MasterProduct/ScanProduct'

const MainApp = () => {
    const history = useHistory(historyConfig);

    let match = useRouteMatch();
    const [cookies, setCookie,removeCookie] = useCookies(['user']);

    const [toggled, setToggled] = useState(false);

    const handleToggleSidebar = (value) => {
        setToggled(value);
    };
    const {form}=useSelector(state=>state.PaketReducer);

    useEffect(()=>{
        // alert("mainapp")
        document.title = "Sistem Informasi Gudang dan Perhitungan";
        // if(cookies.CookieParamKey==null || cookies.CookieParamKey=="" ||
        // cookies.ckUI==null || cookies.ckUI==""){
        //     alert("Session anda telah habis. Silahkan login kembali.");
        //     history.push('/login');
        //     return false;
        // }
     
    },[])
    
    return (
        <div>
            {/* <div className="main-app-wrapper mainapp" style={{display:'flex', backgroundColor:'#F6FBFF', width:'100%'}}> 

                <LeftMenu />

                <div className="content-wrapper" style={{ backgroundColor:'#F6FBFF', height:'100%', padding:30,  width:'100%' }}> 
                    <BrowserRouter basename="/admin">
                        <Switch>
                            <Route exact path="/dashboard">
                                <Dashboard />
                            </Route>
                            <Route exact path="/gudang">
                                <Gudang />
                            </Route>
                            <Route exact path="/kasir">
                                <Kasir />
                            </Route>
                            <Route exact path="/keuangan">
                                <Keuangan />
                            </Route>
                            <Route exact path="/other">
                                <Others />
                            </Route>
                            <Route exact path="/gudang/import-product">
                                <ImportProduct />
                            </Route>
                            <Route exact path="/gudang/scan-product">
                                <ScanProduct />
                            </Route>
                        </Switch>
                    </BrowserRouter>
                </div>
            </div> */}
        </div>
    )
}

export default MainApp