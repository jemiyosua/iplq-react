import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import './rsvp-detail.css';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils';
import { generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
	FaArrowLeft,
	FaCalendarAlt,
	FaCarSide,
	FaCheckCircle,
	FaClock,
	FaIdBadge,
	FaPhoneAlt,
	FaTimesCircle,
	FaUser,
	FaUsers,
	FaHome,
	FaClipboardList,
} from 'react-icons/fa';
import LoadingLogo from '../../../components/molecules/LoadingLogo';

const RSVPDetail = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [cookies, , removeCookie] = useCookies(['user']);

	const [DetailRSVP, setDetailRSVP] = useState(null);
	const [LoadingDetail, setLoadingDetail] = useState(false);

	const [ShowAlert, setShowAlert] = useState(true);
	const [SessionMessage, setSessionMessage] = useState('');
	const [SuccessMessage, setSuccessMessage] = useState('');
	const [ErrorMessageAlert, setErrorMessageAlert] = useState('');
	const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState('');

	const getCookie = useCallback((tipe) => {
		var SecretCookie = cookies.varCookie;
		if (SecretCookie !== '' && SecretCookie != null && typeof SecretCookie === 'string') {
			var LongSecretCookie = SecretCookie.split('|');
			var username = LongSecretCookie[0];
			var paramKey = LongSecretCookie[1];
			var accessLogin = parseInt(LongSecretCookie[2]);
			var accessName = LongSecretCookie[3];
			var cluster = LongSecretCookie[4];
			var clusterId = LongSecretCookie[5];

			if (tipe === 'username') return username;
			if (tipe === 'paramkey') return paramKey;
			if (tipe === 'access') return accessLogin;
			if (tipe === 'access_name') return accessName;
			if (tipe === 'cluster') return cluster;
			if (tipe === 'cluster_id') return clusterId;
			return null;
		}
		return null;
	}, [cookies.varCookie]);

	const logout = useCallback(() => {
		removeCookie('varCookie', { path: '/' });
		removeCookie('varMerchantId', { path: '/' });
		removeCookie('varIdVoucher', { path: '/' });
		removeCookie('varCookieFasilitasId', { path: '/' });
		removeCookie('varCookieDonasiId', { path: '/' });

		dispatch(setForm('ParamKey', ''));
		dispatch(setForm('Username', ''));
		dispatch(setForm('Name', ''));
		dispatch(setForm('Role', ''));
		if (window) {
			sessionStorage.clear();
		}
	}, [dispatch, removeCookie]);

	const getDetailRSVP = useCallback(() => {
		var cookieUsername = getCookie('username');
		var cookieParamKey = getCookie('paramkey');
		var cookieAccessLogin = getCookie('access');
		var cookieClusterId = Number(getCookie('cluster_id')) || 0;
		var rsvpId = cookies.varCookieRSVPId;

		if (!rsvpId) {
			history.push('/admin/rsvp');
			return;
		}

		var requestBody = JSON.stringify({
			username: cookieUsername,
			paramkey: cookieParamKey,
			method: 'SELECT',
			access: cookieAccessLogin,
			cluster_id: cookieClusterId,
			id: parseInt(rsvpId),
		});

		setLoadingDetail(true);

		var url = paths.URL_API_ADMIN + 'RSVPDetail';
		var Signature = generateSignature(requestBody);

		fetch(url, {
			method: 'POST',
			body: requestBody,
			headers: {
				'Content-Type': 'application/json',
				Signature: Signature,
			},
		})
			.then(fetchStatus)
			.then((response) => response.json())
			.then((data) => {
				setLoadingDetail(false);

				if (data.error_code === '0' || data.error_code === 0) {
					setDetailRSVP(data.result || null);
				} else {
					if (data.error_code === '2' || data.error_code === 2) {
						setSessionMessage('Session Anda Telah Habis. Silahkan Login Kembali.');
						setShowAlert(true);
					} else {
						setErrorMessageAlert(data.error_message);
						setShowAlert(true);
					}
				}
			})
			.catch((error) => {
				setLoadingDetail(false);

				if (error.message === 401) {
					setErrorMessageAlert('Maaf anda tidak memiliki ijin untuk mengakses halaman ini.');
					setShowAlert(true);
				} else {
					setErrorMessageAlert(AlertMessage.failedConnect);
					setShowAlert(true);
				}
			});
	}, [cookies.varCookieRSVPId, getCookie, history]);

	useEffect(() => {
		window.scrollTo(0, 0);

		var cookieParamKey = getCookie('paramkey');
		var cookieUsername = getCookie('username');

		if (!cookieParamKey || !cookieUsername) {
			history.push('/admin/login');
		} else {
			if (!cookies.varCookieRSVPId) {
				history.push('/admin/rsvp');
			} else {
				dispatch(setForm('ParamKey', cookieParamKey));
				dispatch(setForm('Username', cookieUsername));
				dispatch(setForm('PageActive', 'RSVP'));
			}
		}
	}, [dispatch, getCookie, history, cookies.varCookieRSVPId]);

	useEffect(() => {
		getDetailRSVP();
	}, [getDetailRSVP]);

	const statusBadge = (status) => {
		if (Number(status) === 1) {
			return (
				<span className="rsvp-detail-status active">
					<FaCheckCircle /> Aktif
				</span>
			);
		}
		return (
			<span className="rsvp-detail-status inactive">
				<FaTimesCircle /> Tidak Aktif
			</span>
		);
	};

	return (
		<>
			{LoadingDetail && <LoadingLogo />}

			<div className="rsvp-detail-page">
				{SessionMessage !== '' && (
					<SweetAlert
						warning
						show={ShowAlert}
						onConfirm={() => {
							setShowAlert(false);
							logout();
							history.push('/admin/login');
						}}
						btnSize="sm"
					>
						{SessionMessage}
					</SweetAlert>
				)}

				{SuccessMessage !== '' && (
					<SweetAlert
						success
						show={ShowAlert}
						onConfirm={() => {
							setShowAlert(false);
							setSuccessMessage('');
							history.replace('/admin/rsvp');
						}}
						btnSize="sm"
					>
						{SuccessMessage}
					</SweetAlert>
				)}

				{ErrorMessageAlert !== '' && (
					<SweetAlert
						danger
						show={ShowAlert}
						onConfirm={() => {
							setShowAlert(false);
							setErrorMessageAlert('');
						}}
						btnSize="sm"
					>
						{ErrorMessageAlert}
					</SweetAlert>
				)}

				{ErrorMessageAlertLogout !== '' && (
					<SweetAlert
						danger
						show={ShowAlert}
						onConfirm={() => {
							setShowAlert(false);
							setErrorMessageAlertLogout('');
							history.push('/admin/login');
						}}
						btnSize="sm"
					>
						{ErrorMessageAlertLogout}
					</SweetAlert>
				)}

				<div className="rsvp-detail-header">
					<button
						className="rsvp-detail-back"
						onClick={() => {
							removeCookie('varCookieRSVPId', { path: '/' });
							history.push('/admin/rsvp');
						}}
					>
						<FaArrowLeft /> Kembali
					</button>
					<div>
						<div className="rsvp-detail-eyebrow">Detail Undangan</div>
						<h1>RSVP Tamu</h1>
						<p>Informasi lengkap undangan dan jadwal kunjungan tamu.</p>
					</div>
				</div>

				{DetailRSVP && (
					<>
						<div className="rsvp-detail-top-row">
							<div className="rsvp-detail-card rsvp-detail-card-code">
								<div className="rsvp-detail-card-icon blue">
									<FaIdBadge />
								</div>
								<div>
									<span className="rsvp-detail-card-label">Kode Undangan</span>
									<strong className="rsvp-detail-card-value">
										{DetailRSVP.kode_undangan || '-'}
									</strong>
								</div>
								<div className="rsvp-detail-card-status">
									{statusBadge(DetailRSVP.status)}
								</div>
							</div>

							<div className="rsvp-detail-card">
								<div className="rsvp-detail-card-icon green">
									<FaCalendarAlt />
								</div>
								<div>
									<span className="rsvp-detail-card-label">Tanggal Kunjungan</span>
									<strong className="rsvp-detail-card-value">
										{DetailRSVP.tanggal_kunjungan || '-'}
									</strong>
								</div>
							</div>

							<div className="rsvp-detail-card">
								<div className="rsvp-detail-card-icon yellow">
									<FaClock />
								</div>
								<div>
									<span className="rsvp-detail-card-label">Jam Kunjungan</span>
									<strong className="rsvp-detail-card-value">
										{DetailRSVP.jam_kunjungan || '-'}
									</strong>
								</div>
							</div>
						</div>

						<div className="rsvp-detail-grid">
							<div className="rsvp-detail-section">
								<h3>
									<FaHome /> Informasi Warga
								</h3>
								<div className="rsvp-detail-info-grid">
									<div className="rsvp-detail-info-item">
										<span>Nama Warga</span>
										<strong>{DetailRSVP.nama || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Cluster</span>
										<strong>{DetailRSVP.cluster || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>No Rumah</span>
										<strong>{DetailRSVP.nomor_rumah || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Tanggal Input</span>
										<strong>{DetailRSVP.tanggal_input || '-'}</strong>
									</div>
								</div>
							</div>

							<div className="rsvp-detail-section">
								<h3>
									<FaUsers /> Informasi Tamu
								</h3>
								<div className="rsvp-detail-info-grid">
									<div className="rsvp-detail-info-item">
										<span>Nama Tamu</span>
										<strong>{DetailRSVP.nama_tamu || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Kategori Tamu</span>
										<strong>{DetailRSVP.kategori_tamu || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Jumlah Tamu</span>
										<strong>{DetailRSVP.jumlah_tamu || '0'} orang</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Nomor HP</span>
										<strong>
											{DetailRSVP.nomor_hp ? (
												<a href={`tel:${DetailRSVP.nomor_hp}`} className="rsvp-detail-phone">
													<FaPhoneAlt /> {DetailRSVP.nomor_hp}
												</a>
											) : (
												'-'
											)}
										</strong>
									</div>
								</div>
							</div>

							<div className="rsvp-detail-section">
								<h3>
									<FaClipboardList /> Detail Kunjungan
								</h3>
								<div className="rsvp-detail-info-grid">
									<div className="rsvp-detail-info-item">
										<span>Keperluan</span>
										<strong>{DetailRSVP.keperluan || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Kendaraan</span>
										<strong>
											<FaCarSide /> {DetailRSVP.kendaraan || 'Tanpa kendaraan'}
										</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Plat Nomor</span>
										<strong>{DetailRSVP.plat_nomor || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Catatan</span>
										<strong>{DetailRSVP.catatan || '-'}</strong>
									</div>
								</div>
							</div>

							<div className="rsvp-detail-section">
								<h3>
									<FaUser /> Status & QR
								</h3>
								<div className="rsvp-detail-info-grid">
									<div className="rsvp-detail-info-item">
										<span>Status</span>
										<strong>{statusBadge(DetailRSVP.status)}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Status Kedatangan</span>
										<strong>
											{Number(DetailRSVP.status_kedatangan) === 1
												? 'Sudah Hadir'
												: 'Belum Hadir'}
										</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Waktu Check-in</span>
										<strong>{DetailRSVP.waktu_checkin || '-'}</strong>
									</div>
									<div className="rsvp-detail-info-item">
										<span>Diverifikasi Oleh</span>
										<strong>{DetailRSVP.diverifikasi_oleh || '-'}</strong>
									</div>
								</div>
							</div>
						</div>
					</>
				)}

				{!DetailRSVP && !LoadingDetail && (
					<div className="rsvp-detail-empty">
						<strong>Data RSVP tidak ditemukan</strong>
						<span>Silahkan kembali ke halaman daftar RSVP.</span>
					</div>
				)}
			</div>
		</>
	);
};

export default RSVPDetail;
