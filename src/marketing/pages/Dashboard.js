import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useProspekData } from '../hooks/useProspekData';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { summary } = useProspekData();

  const pieData = {
    labels: ['Baru', 'Tahap Awal', 'Follow Up', 'Negosiasi', 'Proposal', 'Pending', 'Close/Batal'],
    datasets: [
      {
        data: [
          summary.baru,
          summary.tahapAwal,
          summary.followUp,
          summary.negosiasi,
          summary.proposal,
          summary.pending,
          summary.close,
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
            <strong className="mkt-sc-value">{summary.total}</strong>
            <span className="mkt-sc-sub">Seluruh data prospek</span>
          </div>
          <div className="mkt-sc-icon blue">📋</div>
        </div>
        <div className="mkt-summary-card">
          <div className="mkt-sc-info">
            <span className="mkt-sc-label">Baru</span>
            <strong className="mkt-sc-value">{summary.baru}</strong>
            <span className="mkt-sc-sub">Data pada halaman ini</span>
          </div>
          <div className="mkt-sc-icon cyan">🆕</div>
        </div>
        <div className="mkt-summary-card">
          <div className="mkt-sc-info">
            <span className="mkt-sc-label">Follow Up</span>
            <strong className="mkt-sc-value">{summary.followUp}</strong>
            <span className="mkt-sc-sub">Data pada halaman ini</span>
          </div>
          <div className="mkt-sc-icon green">📞</div>
        </div>
        <div className="mkt-summary-card">
          <div className="mkt-sc-info">
            <span className="mkt-sc-label">Close/Batal</span>
            <strong className="mkt-sc-value">{summary.close}</strong>
            <span className="mkt-sc-sub">Data pada halaman ini</span>
          </div>
          <div className="mkt-sc-icon red">❌</div>
        </div>
      </div>

      <div className="mkt-chart-card">
        <h3>Distribusi Status Prospek</h3>
        <div className="mkt-pie-wrap">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
