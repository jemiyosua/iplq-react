import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ImgMockupMobile } from '../../../assets';
import './about.css';
import { Check, Cloud, GraphicEq, GraphicEqOutlined, Payment, Smartphone, StartSharp } from '@mui/icons-material';
import { setForm } from '../../../redux';

const About = ({ pageActive, onClickSection, pageAnchor }) => {

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

    const features = [
        {
            title: "Peningkatan Arus Kas (Cash Flow)",
            desc: "Notifikasi otomatis, Pembayaran instan via QRIS, Kolektibilitas meningkatt",
            icon: <StartSharp />
        },
        {
            title: "Transparansi & Kepercayaan",
            desc: "Data pembayaran real-time, Mengurangi konflik, Meningkatkan reputasi pengelola",
            icon: <Payment />
        }
    ];

    useEffect(() => {

        dispatch(setForm("PageActive","about"))

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

    return (
        <section className="about" id="about">
            <div className="about-container">

                {/* LEFT */}
                <div className="about-left">
                    <span className="badge">Tentang Kami</span>

                    <h2>
                        Mengapa Memilih <br/><span>IPL-Q?</span>
                    </h2>

                    <p>
                        IPL-Q adalah platform digital untuk pengelolaan iuran, pembayaran, dan operasional hunian yang dirancang untuk meningkatkan efisiensi dan mempercepat arus kas.
                        <br />
                        Kami membantu pengelola properti beralih dari proses manual yang mahal dan tidak efisien menjadi sistem digital yang otomatis, transparan, dan terintegrasi.
                    </p>

                    <p>
                        Saatnya beralih ke sistem yang lebih efisien.<br />
                        Tinggalkan proses manual yang memakan waktu dan biaya, <br/>
                        dan mulai kelola properti Anda dengan cara yang lebih cepat, transparan, dan terukur. 
                    </p>

                    {/* STATS */}
                    <div className="stats">
                        {/* <div className="stat-card">
                            <h3>2026</h3>
                            <span>Tahun Berdiri</span>
                        </div> */}

                        {/* <div className="stat-card">
                            <h3>15+</h3>
                            <span>Kota di Indonesia</span>
                        </div> */}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="about-right">

                    {/* TOP CARD */}
                    <div className="feature highlight-features top-feature">
                        <div className="feature-icon">
                            <Check />
                        </div>

                        <div>
                            <h4>Platform Terpercaya</h4>
                            <p>
                                Nikmati layanan hanya dengan Rp1.000 per bulan
                            </p>
                        </div>
                    </div>

                    {/* GRID */}
                    <div className="feature-grid">
                        {features.map((item, i) => (
                        <div className="feature card-feature" key={i}>
                            <div className="feature-icon small">
                                {item.icon}
                            </div>

                            <h4>{item.title}</h4>
                            <p>{item.desc}</p>
                        </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    )
}


export default About