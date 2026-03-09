import React from 'react';
import { Routes } from '../config';
import { Provider } from 'react-redux';
import { store } from '../redux';
import { CookiesProvider } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <CookiesProvider>
    <Provider store={store}>
      <Routes/>
    </Provider>
  </CookiesProvider>
    
  );
}

export default App;