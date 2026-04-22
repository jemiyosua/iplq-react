import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IcBellFeatures, IcBillsFeatures, IcBuildingFeatures, IcCCTVFeatures, IcDashboardFeatures, IcLoginFeatures, IcPeopleFeatures, IcRSVPFeatures, IcSOSFeatures, ImgMockupMobile } from '../../../assets';
import './features.css';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Features = ({ pageActive, onClickSection, pageAnchor }) => {

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
            title: "Login",
            desc: "Akses aman dengan autentikasi multi-faktor untuk penghuni dan pengelola cluster.",
            icon: IcLoginFeatures,
        },
        {
            title: "Pembayaran Tagihan",
            desc: "Bayar iuran bulanan secara online — transfer bank, e-wallet, hingga QRIS dalam satu klik.",
            icon: IcBillsFeatures,
        },
        {
            title: "Manajemen Data Penghuni",
            desc: "Kelola data penghuni secara terpusat dengan riwayat pembayaran lengkap.",
            icon: IcPeopleFeatures,
        },
        {
            title: "Pengelolaan Fasilitas",
            desc: "Jadwal maintenance, booking fasilitas umum, dan laporan kondisi real-time.",
            icon: IcBuildingFeatures,
        },
        {
            title: "Notifikasi Tagihan",
            desc: "Pengingat otomatis via push notification, SMS, dan email.",
            icon: IcBellFeatures,
        },
        {
            title: "Dashboard Pengelola",
            desc: "Laporan keuangan, statistik penghuni, dan ringkasan operasional.",
            icon: IcDashboardFeatures,
        },
        {
            title: "SOS Darurat",
            desc: "Tombol SOS satu sentuhan untuk mengirim sinyal darurat ke keamanan dan pengelola cluster.",
            icon: IcSOSFeatures,
        },
        {
            title: "Akses CCTV",
            desc: "Pantau area cluster secara langsung melalui streaming CCTV real-time dari aplikasi mobile.",
            icon: IcCCTVFeatures,
        },
        {
            title: "RSVP Tamu Warga",
            desc: "Sistem penjadwalan kunjungan tamu dengan QR code — akses tamu tercatat, aman, dan terkontrol.",
            icon: IcRSVPFeatures,
        },
    ];

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

    return (
        <section className="features" id="features">

            {/* HEADER */}
            <div className="features-header">
                <span className="badge">Fitur Unggulan</span>
                <h2>
                Semua yang Anda <span>Butuhkan</span>
                </h2>
                <p>
                Fitur lengkap yang dirancang untuk memudahkan pengelola dan meningkatkan
                pengalaman penghuni cluster Anda.
                </p>
            </div>

            {/* GRID */}
            <div className="features-grid">
                {features.map((item, i) => (
                <div className="feature-card" key={i}>
                    <div className="icon">
                        <img src={item.icon} className='icon-img' />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                </div>
                ))}
            </div>

        </section>
    )
}


export default Features
