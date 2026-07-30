import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from '../../pages/Home';
import Login from '../../admin/pages/Login';
import MainApp from '../../admin/pages/MainApp';
import MarketingApp from '../../marketing/App';
// import MainApp from '../../pages/MainApp';

const Routes = () => {
    return (
		<BrowserRouter>
			<Switch>
				<Route path='/admin/Login'>
					<Login />
				</Route>
				<Route path="/admin">
					<MainApp />
				</Route>
				<Route path="/marketing">
					<MarketingApp />
				</Route>
				<Route path='/'>
					<Home/>
				</Route>
			</Switch>
		</BrowserRouter>
    )
}

export default Routes;
