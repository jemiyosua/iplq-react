import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from '../../pages/Home';
import Login from '../../admin/pages/Login';
import MainApp from '../../admin/pages/MainApp';
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
				<Route exact path="/admin/ipl">
					<MainApp />
				</Route>
				<Route exact path="/admin/iuran">
					<MainApp />
				</Route>
				<Route exact path="/admin/transaksi-iuran">
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