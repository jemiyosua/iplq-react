import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from '../../pages/Login';
// import MainApp from '../../pages/MainApp';
import MainApp from '../../pages/MainApp';

const Routes = () => {
    return (
		<BrowserRouter>
			<Switch>
				<Route path='/admin/Login'>
					<Login/>
				</Route>
				<Route path='/admin/dashboard'>
					<MainApp/>
				</Route>
				<Route path='/admin/hero-home'>
					{console.log("routes admin")}
					<MainApp/>
				</Route>
				<Route path='/'>
					<Login/>
				</Route>
			</Switch>
		</BrowserRouter>
    )
}

export default Routes;
