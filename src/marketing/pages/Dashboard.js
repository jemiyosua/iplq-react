import React, { useCallback, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { AlertMessage, paths } from '../../utils';
import { fetchStatus, generateSignature } from '../../utils/functions';
import SweetAlert from 'react-bootstrap-sweetalert';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const history = useHistory();
  const [cookies, setCookie, removeCookie] = useCookies(['user']);

  const [TotalProspekAll, setTotalProspekAll] = useState(0);
  const [TotalProspekBaru, setTotalProspekBaru] = useState(0);
  const [TotalProspekBatal, setTotalProspekBatal] = useState(0);
  const [TotalProspekFollowUp, setTotalProspekFollowUp] = useState(0);
  const [TotalProspekNegosiasi, setTotalProspekNegosiasi] = useState(0);
  const [TotalProspekPending, setTotalProspekPending] = useState(0);
  const [TotalProspekProposal, setTotalProspekProposal] = useState(0);
  const [TotalProspekTahapAwal, setTotalProspekTahapAwal] = useState(0);

  const [LoadingDashboard, setLoadingDashboard] = useState(false);
  const [ShowAlert, setShowAlert] = useState(false);
  const [AlertState, setAlertState] = useState('');
  const [SessionMessage, setSessionMessage] = useState('');
  const [ErrorMessageAlert, setErrorMessageAlert] = useState('');

  const getCookie = useCallback((tipe) => {
    var SecretCookie = cookies.varCookie;
    if (SecretCookie !== '' && SecretCookie != null && typeof SecretCookie === 'string') {
      var LongSecretCookie = SecretCookie.split('|');
      var username = LongSecretCookie[0];
      var paramKey = LongSecretCookie[1];

      if (tipe === 'username') return username;
      if (tipe === 'paramkey') return paramKey;
      return null;
    }
    return null;
  }, [cookies.varCookie]);

  const getDataDashboard = useCallback(() => {
    var cookieUsername = getCookie('username');
    var cookieParamKey = getCookie('paramkey');

    var requestBody = JSON.stringify({
      username: cookieUsername,
      paramkey: cookieParamKey,
      method: "SELECT",
      page: 1,
      row_page: -1,
      order_by: "",
      order: ""
    });

    var url = paths.URL_API_MARKETING + 'Prospek';
    var Signature = generateSignature(requestBody);

    setLoadingDashboard(true);

    fetch(url, {
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        Signature: Signature
      },
    })
      .then(fetchStatus)
      .then((response) => response.json())
      .then((data) => {
        setLoadingDashboard(false);

        if (data.error_code === '0' || data.error_code === 0) {
          setTotalProspekAll(Number(data.total_prospek) || 0);
          setTotalProspekBaru(Number(data.total_prospek_baru) || 0);
          setTotalProspekBatal(Number(data.total_prospek_batal) || 0);
          setTotalProspekFollowUp(Number(data.total_prospek_follow_up) || 0);
          setTotalProspekNegosiasi(Number(data.total_prospek_negosiasi) || 0);
          setTotalProspekPending(Number(data.total_prospek_pending) || 0);
          setTotalProspekProposal(Number(data.total_prospek_proposal) || 0);
          setTotalProspekTahapAwal(Number(data.total_prospek_tahap_awal) || 0);
        } else {
          if (data.error_code === 2) {
            setAlertState('session');
            setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
            setShowAlert(true);
          } else {
            setAlertState('error');
            setErrorMessageAlert(data.error_message);
            setShowAlert(true);
          }
        }
      })
      .catch((error) => {
        setLoadingDashboard(false);

        if (error.message === 401) {
          setAlertState('error');
          setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
        } else {
          setAlertState('error');
          setErrorMessageAlert(AlertMessage.failedConnect);
        }
        setShowAlert(true);
      });
  }, [getCookie]);

  useEffect(() => {
    window.scrollTo(0, 0);
    var cookieParamKey = getCookie('paramkey');
    var cookieUsername = getCookie('username');
    if (!cookieParamKey || !cookieUsername) {
      history.push('/marketing/login');
    } else {
      getDataDashboard();
    }
  }, [getCookie, getDataDashboard, history]);

  const handleConfirmAlert = (alertState) => {
    if (alertState === 'session') {
      setShowAlert(false);
      setSessionMessage('');
      removeCookie('varCookie', { path: '/' });
      sessionStorage.clear();
      history.push('/marketing/login');
    } else if (alertState === 'error') {
      setShowAlert(false);
      setErrorMessageAlert('');
    }
    setAlertState('');
  };

  const pieData = {
    labels: ['Baru', 'Tahap Awal', 'Follow Up', 'Negosiasi', 'Proposal', 'Pending', 'Close/Batal'],
    datasets: [
      {
        data: [
          TotalProspekBaru,
          TotalProspekTahapAwal,
          TotalProspekFollowUp,
          TotalProspekNegosiasi,
          TotalProspekProposal,
          TotalProspekPending,
          TotalProspekBatal,
        ],
        backgroundColor: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280', '#ef4444'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, font: { size: 13 } },
      },
    },
  };

  return (
    <div className="mkt-page">
      {/* Alert Popup */}
      {ShowAlert && AlertState === 'session' && (
        <SweetAlert warning show={ShowAlert} onConfirm={() => handleConfirmAlert('session')} btnSize="sm">
          {SessionMessage}
        </SweetAlert>
      )}
      {ShowAlert && AlertState === 'error' && (
        <SweetAlert danger show={ShowAlert} onConfirm={() => handleConfirmAlert('error')} btnSize="sm">
          {ErrorMessageAlert}
        </SweetAlert>
      )}

      <div className="mkt-page-header">
        <div>
          <span className="mkt-page-label">MARKETING</span>
          <h2 className="mkt-page-title">Dashboard</h2>
          <p className="mkt-page-desc">Ringkasan data prospek marketing.</p>
        </div>
      </div>

      <div className="mkt-summary-row">
        <div className="mkt-summary-card">
          <div className="mkt-sc-info">
            <span className="mkt-sc-label">Total Prospek</span>
            <strong className="mkt-sc-value">{TotalProspekAll}</strong>
            <span className="mkt-sc-sub">Seluruh data prospek</span>
          </div>
          <div className="mkt-sc-icon blue">📋</div>
        </div>
        <div className="mkt-summary-card">
          <div className="mkt-sc-info">
            <span className="mkt-sc-label">Baru</span>
            <strong className="mkt-sc-value">{TotalProspekBaru}</strong>
            <span className="mkt-sc-sub">Prospek baru masuk</span>
          </div>
          <div className="mkt-sc-icon cyan">🆕</div>
        </div>
        <div className="mkt-summary-card">
          <div className="mkt-sc-info">
            <span className="mkt-sc-label">Follow Up</span>
            <strong className="mkt-sc-value">{TotalProspekFollowUp}</strong>
            <span className="mkt-sc-sub">Sedang ditindaklanjuti</span>
          </div>
          <div className="mkt-sc-icon green">📞</div>
        </div>
        <div className="mkt-summary-card">
          <div className="mkt-sc-info">
            <span className="mkt-sc-label">Close/Batal</span>
            <strong className="mkt-sc-value">{TotalProspekBatal}</strong>
            <span className="mkt-sc-sub">Tidak dilanjutkan</span>
          </div>
          <div className="mkt-sc-icon red">❌</div>
        </div>
      </div>

      <div className="mkt-chart-card">
        <h3>Distribusi Status Prospek</h3>
        <div className="mkt-pie-wrap">
          {LoadingDashboard ? (
            <p style={{ textAlign: 'center', padding: 20 }}>Memuat data...</p>
          ) : (
            <Pie data={pieData} options={pieOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
