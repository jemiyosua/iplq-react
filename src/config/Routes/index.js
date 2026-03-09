import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from '../../pages/Home';
import TentangKami from '../../pages/TentangKami';
import Login from '../../admin/pages/Login';
import MainApp from '../../admin/pages/MainApp';
import CommingSoon from '../../pages/CommingSoon';
// import MainApp from '../../pages/MainApp';

const Routes = () => {
    return (
		<BrowserRouter>
			<Switch>
				<Route path='/admin/Login'>
					<Login />
				</Route>
				<Route exact path="/admin/dashboard">
					<MainApp />
				</Route>
				<Route exact path="/admin/integrasi-wa">
					<MainApp />
				</Route>
				<Route exact path="/admin/aset">
					<MainApp />
				</Route>
				<Route exact path="/admin/billing">
					<MainApp />
				</Route>
				<Route exact path="/admin/midtrans">
					<MainApp />
				</Route>
				<Route exact path="/admin/konfigurasi">
					<MainApp />
				</Route>
				<Route exact path="/admin/kepengurusan">
					<MainApp />
				</Route>
				<Route exact path="/admin/penghuni">
					<MainApp />
				</Route>
				<Route exact path="/admin/keuangan">
					<MainApp />
				</Route>
				<Route exact path="/admin/pengelola-air">
					<MainApp />
				</Route>
				<Route exact path="/admin/lingkungan">
					<MainApp />
				</Route>
				<Route exact path="/admin/karyawan">
					<MainApp />
				</Route>
				<Route exact path="/admin/syarat-ketentuan">
					<MainApp />
				</Route>
				<Route exact path="/admin/kebijakan-privasi">
					<MainApp />
				</Route>
				<Route path='/'>
					<Home/>
				</Route>
			</Switch>
		</BrowserRouter>
    )
}

export default Routes;