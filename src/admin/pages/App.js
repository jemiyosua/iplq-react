import React from 'react';
import { Routes } from '../config/Routes';
import { Provider } from 'react-redux';
import { store } from '../redux';
import { CookiesProvider } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import '../../styles/responsive-tables.css';

function App() {
	return (
		<BrowserRouter>
			<CookiesProvider>
				<Provider store={store}>
					<Routes/>
				</Provider>
			</CookiesProvider>
		</BrowserRouter>
	);
}

export default App;
