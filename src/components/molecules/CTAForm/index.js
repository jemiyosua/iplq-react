import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ImgMockupMobile } from '../../../assets';
import './cta-form.css';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { fetchStatus, generateSignature } from '../../../utils/functions';
import { AlertMessage, paths } from '../../../utils';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Gap } from '../../atoms';
import { BorderColor } from '@mui/icons-material';

const CTAForm = ({ pageActive, onClickSection, pageAnchor }) => {

    const history =useHistory();
    const [cookies, setCookie,removeCookie] = useCookies([]);
    const {form}=useSelector(state=>state.PaketReducer);
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const [HoverWhatsapp, setHoverWhatsapp] = useState(false);
    const [LanguageHeader, setLanguageHeader] = useState("ID")
    const [DropdownLanguage, setDropdownLanguage] = useState(false)

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [PageActive, setPageActive] = useState("home")

    const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    
    const [NamaLengkap, setNamaLengkap] = useState("")
    const [NomorHP, setNomorHP] = useState("")
    const [Email, setEmail] = useState("")
    const [NamaCluster, setNamaCluster] = useState("")
    const [AlamatCluster, setAlamatCluster] = useState("")
    const [JumlahRumahCluster, setJumlahRumahCluster] = useState("")

    const [AlertNamaLengkap, setAlertNamaLengkap] = useState(false)
    const [AlertNomorHP, setAlertNomorHP] = useState(false)
    const [AlertEmail, setAlertEmail] = useState(false)
    const [AlertNamaCluster, setAlertNamaCluster] = useState(false)
    const [AlertAlamatCluster, setAlertAlamatCluster] = useState(false)
    const [AlertJumlahRumahCluster, setAlertJumlahRumahCluster] = useState(false)

    const [LoadingSubmitRegister, setLoadingSubmitRegister] = useState(false)

    useEffect(() => {

        setPageActive(pageActive)

        const handleResize = () => {
            // setWindowWidth(window.innerWidth);
            setIsMobile(window.innerWidth < 900);
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleScroll = () => {
        const scrollThreshold = 150; // Pixels to trigger background change
        if (window.scrollY > scrollThreshold) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    const submitRegister = () => {

        let alertError = false
        if (NamaLengkap == "") {
            alertError = true
            setAlertNamaLengkap(true)
        }

        if (NomorHP == "") {
            alertError = true
            setAlertNomorHP(true)
        }

        if (Email == "") {
            alertError = true
            setAlertEmail(true)
        }

        if (NamaCluster == "") {
            alertError = true
            setAlertNamaCluster(true)
        }

        if (AlamatCluster == "") {
            alertError = true
            setAlertAlamatCluster(true)
        }

        if (JumlahRumahCluster == "") {
            alertError = true
            setAlertJumlahRumahCluster(true)
        }

        if (alertError) {
            return
        }

		var requestBody = JSON.stringify({
			"method": "INSERT",
			"nama_lengkap": NamaLengkap,
			"no_hp": NomorHP,
			"email": Email,
			"cluster": NamaCluster,
            "alamat_cluster": AlamatCluster,
            "jumlah_rumah_cluster": parseInt(JumlahRumahCluster)
		});

		var url = paths.URL_API_WEB + 'SubmitRegister';
		var Signature  = generateSignature(requestBody)

        setLoadingSubmitRegister(true)

		fetch(url, {
			method: "POST",
			body: requestBody,
			headers: {
				'Content-Type': 'application/json',
				'Signature': Signature
			},
		})
		.then(fetchStatus)
		.then(response => response.json())
		.then((data) => {
            setLoadingSubmitRegister(false)

			if (data.error_code === "0") {
                
                setSuccessMessage("Terima kasih atas ketertarikan Anda pada IPLQ. Tim kami akan segera menghubungi Anda untuk mendiskusikan kebutuhan Anda lebih lanjut.")
                setShowAlert(true)

                setNamaLengkap("")
                setNomorHP("")
                setEmail("")
                setNamaCluster("")
                setAlamatCluster("")
                setJumlahRumahCluster("")
				return
			} else {
				setErrorMessageAlert(data.error_message);
                setShowAlert(true);
                return;
			}
		})
		.catch((error) => {
            setLoadingSubmitRegister(false)

			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				setShowAlert(true);
				return false;
			} else if (error.message !== 401) {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
				return false;
			}
		});
	}

    return (
        <section className="cta" id="cta">

            {LoadingSubmitRegister && (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
            )}

            {SuccessMessage !== "" ?
            // <SweetAlert 
            //     success 
            //     show={ShowAlert}
            //     onConfirm={() => {
            //         setShowAlert(false)
            //         setSuccessMessage("")
            //         history.replace("/")
            //     }}
            //     btnSize="sm">
            //     {SuccessMessage}
            // </SweetAlert>
            <SweetAlert
                success
                show={ShowAlert}
                title=""
                custom
                customIcon={<div style={styles.iconWrapper}>✓</div>}
                onConfirm={() => {
                    setShowAlert(false)
                    setSuccessMessage("")
                    history.replace("/")
                }}
                confirmBtnText="OK"
                confirmBtnStyle={styles.button}
                style={styles.container}
                >
                <div style={styles.text}>
                    {SuccessMessage}
                </div>
            </SweetAlert>
            :""}

            {/* HEADER */}
            <div className="cta-header">
                <span className="badge">Daftar Sekarang</span>

                <h2>
                Mulai Perjalanan <br />
                <span>Hunian Cerdas</span>
                </h2>

                <p>
                Daftarkan cluster Anda sekarang dan nikmati uji coba gratis selama 30 hari.
                </p>
            </div>

            {/* FORM */}
            <div className="cta-form">
                <div className="form-grid">

                    <div className="form-group">
                        <label>Nama Lengkap <span style={{ color:'#FF6467' }}>*</span></label>
                        <input
                            type="text" 
                            value={NamaLengkap}
                            placeholder="Masukkan nama lengkap"
                            onFocus={() => setAlertNamaLengkap(false)}
                            onChange={event => setNamaLengkap(event.target.value)}
                            
                            required
                        />
                        {AlertNamaLengkap && 
                        <>
                            <Gap height={5} />
                            <div style={{ color:'#FF6467', fontSize:11 }}>Nama Lengkap tidak boleh kosong</div>
                        </>}
                    </div>

                    <div className="form-group">
                        <label>Nomor Telepon <span style={{ color:'#FF6467' }}>*</span></label>
                        <input 
                            type="text" 
                            value={NomorHP}
                            placeholder="08xx xxxx xxxx"
                            onFocus={() => setAlertNomorHP(false)}
                            onChange={event => setNomorHP(event.target.value)}
                            required
                        />
                        {AlertNomorHP && 
                        <>
                            <Gap height={5} />
                            <div style={{ color:'#FF6467', fontSize:11 }}>Nomor HP tidak boleh kosong</div>
                        </>}
                    </div>

                    <div className="form-group">
                        <label>Alamat Email <span style={{ color:'#FF6467' }}>*</span></label>
                        <input 
                            type="email" 
                            value={Email}
                            placeholder="email@domain.com"
                            onFocus={() => setAlertEmail(false)}
                            onChange={event => setEmail(event.target.value)}
                            required
                        />
                        {AlertEmail && 
                        <>
                            <Gap height={5} />
                            <div style={{ color:'#FF6467', fontSize:11 }}>Email tidak boleh kosong</div>
                        </>}
                    </div>

                    <div className="form-group">
                        <label>Nama Cluster <span style={{ color:'#FF6467' }}>*</span></label>
                        <input 
                            type="text" 
                            value={NamaCluster}
                            placeholder="Contoh: Cluster Harmony Barat"
                            onFocus={() => setAlertNamaCluster(false)}
                            onChange={event => setNamaCluster(event.target.value)}
                            required
                        />
                        {AlertNamaCluster && 
                        <>
                            <Gap height={5} />
                            <div style={{ color:'#FF6467', fontSize:11 }}>Nama Cluster tidak boleh kosong</div>
                        </>}
                    </div>

                    <div className="form-group">
                        <label>Alamat Cluster <span style={{ color:'#FF6467' }}>*</span></label>
                        <input 
                            type="text" 
                            value={AlamatCluster}
                            placeholder="Parung Panjang, Tangerang"
                            onFocus={() => setAlertAlamatCluster(false)}
                            onChange={event => setAlamatCluster(event.target.value)}
                            required
                        />
                        {AlertAlamatCluster && 
                        <>
                            <Gap height={5} />
                            <div style={{ color:'#FF6467', fontSize:11 }}>Nama Cluster tidak boleh kosong</div>
                        </>}
                    </div>

                    <div className="form-group">
                        <label>Jumlah Rumah Aktif Dalam 1 Cluster <span style={{ color:'#FF6467' }}>*</span></label>
                        <input 
                            type="text" 
                            value={JumlahRumahCluster}
                            placeholder="500"
                            onFocus={() => setAlertJumlahRumahCluster(false)}
                            onChange={event => setJumlahRumahCluster(event.target.value)}
                            required
                        />
                        {AlertJumlahRumahCluster && 
                        <>
                            <Gap height={5} />
                            <div style={{ color:'#FF6467', fontSize:11 }}>Nama Cluster tidak boleh kosong</div>
                        </>}
                    </div>

                </div>

                <button className="cta-button" onClick={() => submitRegister()}>Daftar Sekarang</button>

                <small>
                Dengan mendaftar, Anda menyetujui <span>Syarat & Ketentuan</span> dan{" "}
                <span>Kebijakan Privasi</span>.
                </small>
            </div>

        </section>
    )
}

const styles = {
    container: {
        borderRadius: "16px",
        padding: "30px 20px",
    },

    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "#E8F5E9",
        color: "#9AE800",
        fontSize: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
    },

    text: {
        fontSize: "16px",
        color: "#111111",
        textAlign: "center",
        marginBottom: "20px",
        fontWeight: 'bold'
    },

    button: {
        width: "100%",
        backgroundColor: "#9AE800",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "16px",
        color: 'black',
        fontWeight: 'bold'
    },
};


export default CTAForm
