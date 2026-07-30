import React, { useState } from 'react';
import { Switch, Route, useHistory, useLocation, Redirect } from 'react-router-dom';
import { FaHome, FaListAlt, FaDoorClosed, FaArrowAltCircleLeft, FaBars } from 'react-icons/fa';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ListProspek from './pages/ListProspek';
import './marketing.css';
import { IconLogoIPLQ, IconLogoIPLQ2 } from './assets';

const MarketingApp = () => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('mkt_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('mkt_user', JSON.stringify(userData));
    history.push('/marketing/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('mkt_user');
    history.push('/marketing/login');

    // removeCookie('varCookie', { path: '/'})
		// if(window){
    //         sessionStorage.clear();
		// }
		// window.location.href = '/admin/login'
  };

  const navigateTo = (path) => {
    setMobileOpen(false);
    history.push(path);
  };

  if (!user && !location.pathname.includes('/marketing/login')) {
    return <Redirect to="/marketing/login" />;
  }
  if (user && location.pathname === '/marketing/login') {
    return <Redirect to="/marketing/dashboard" />;
  }

  return (
    <Switch>
      <Route path="/marketing/login">
        <Login onLogin={handleLogin} />
      </Route>
      <Route>
        <div className="mkt-layout">
          {/* Sidebar */}
          <aside className={`mkt-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
            <div className="mkt-sidebar-header">
              {!collapsed && <img src={IconLogoIPLQ} alt="logo" style={{ height:40 }} />}
              {!collapsed && <span className="mkt-sidebar-brand">Marketing</span>}
              {collapsed && <img src={IconLogoIPLQ2} alt="logo" style={{ height:25 }} />}
            </div>

            <nav className="mkt-menu">
              <div
                className={`mkt-menu-item ${location.pathname === '/marketing/dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('/marketing/dashboard')}
              >
                <FaHome className="mkt-menu-icon" />
                {!collapsed && <span>Dashboard</span>}
              </div>
              <div
                className={`mkt-menu-item ${location.pathname === '/marketing/prospek' ? 'active' : ''}`}
                onClick={() => navigateTo('/marketing/prospek')}
              >
                <FaListAlt className="mkt-menu-icon" />
                {!collapsed && <span>List Prospek</span>}
              </div>
            </nav>

            <div className="mkt-sidebar-footer">
              <div className="mkt-footer-item" onClick={() => setCollapsed(!collapsed)}>
                <FaArrowAltCircleLeft className="mkt-menu-icon" />
                {!collapsed && <span>Perkecil</span>}
              </div>
              <div className="mkt-footer-item mkt-logout" onClick={handleLogout}>
                <FaDoorClosed className="mkt-menu-icon" />
                {!collapsed && <span>Keluar</span>}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="mkt-main">
            <header className="mkt-topbar">
              <div className="mkt-topbar-left">
                <div className="mkt-burger" onClick={() => {
                  if (window.innerWidth < 768) setMobileOpen(true);
                  else setCollapsed(!collapsed);
                }}>
                  <FaBars />
                </div>
              </div>
              <div className="mkt-topbar-right">
                <span className="mkt-topbar-user">👤 {user?.username}</span>
              </div>
            </header>

            <div className="mkt-content">
              <Switch>
                <Route path="/marketing/dashboard" component={Dashboard} />
                <Route path="/marketing/prospek" component={ListProspek} />
                <Redirect from="/marketing" to="/marketing/dashboard" />
              </Switch>
            </div>
          </div>

          {mobileOpen && <div className="mkt-overlay-bg" onClick={() => setMobileOpen(false)} />}
        </div>
      </Route>
    </Switch>
  );
};

export default MarketingApp;
