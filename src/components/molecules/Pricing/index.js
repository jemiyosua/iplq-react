import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './pricing.css';
import { Check } from '@mui/icons-material';

const Pricing = ({ pageActive, onClickSection, pageAnchor }) => {

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
        <section className="pricing" id="pricing">

            {/* HEADER */}
            <div className="pricing-header">
                <span className="badge">Paket & Harga</span>

                <h2>
                Pilih Paket yang <span>Sesuai</span>
                </h2>

                <p>
                Harga transparan, tanpa biaya tersembunyi. Upgrade atau downgrade kapan saja sesuai kebutuhan cluster Anda.
                </p>

                {/* TOGGLE */}
                {/* <div className="toggle">
                <button className="active">Bulanan</button>
                <button>Tahunan <span>Hemat 25%</span></button>
                </div> */}
            </div>

            {/* CARDS */}
            <div className="pricing-cards">

                {/* STARTER */}
                <div className="card-pricing">
                    <h3>Q100 - Monthly</h3>
                    <p className="sub">Untuk cluster kecil hingga 100 unit</p>

                    <h1>Rp 100K <span>/bulan</span></h1>
                    {/* <p className="desc">Bersertifikat, dukungan email 24 jam</p> */}

                    {/* <button className="btn-outline">Pilih Starter</button> */}

                    <ul className="feature-list">
                        <li><Check color="#5cff9d" /> Layanan aktif 30 hari</li>
                        <li><Check color="#5cff9d" /> Notifikasi Email</li>
                        <li><Check color="#5cff9d" /> Notifikasi Aplikasi</li>
                        <li><Check color="#5cff9d" /> Dashboard dasar</li>
                        {/* <li className="disabled">✖ CCTV & SOS</li>
                        <li className="disabled">✖ RSVP Tamu</li> */}
                    </ul>
                </div>

                {/* PRO */}
                <div className="card-pricing active">
                    <span className="popular">★ Paling Populer</span>

                    <h3>Q100 - Yearly</h3>
                    <p className="sub">Untuk cluster kecil hingga 100 unit</p>

                    <h1>Rp 1.000K <span>/tahun</span></h1>
                    {/* <p className="desc">Semua fitur Starter + fitur lanjutan</p> */}

                    {/* <button className="btn-primary">Pilih Pro</button> */}

                    <ul className="feature-list">
                        <li><Check color="#5cff9d" /> Layanan aktif 365 hari</li>
                        <li><Check color="#5cff9d" /> Hemat 200K</li>
                        <li><Check color="#5cff9d" /> Integrasi Tagihan</li>
                        <li><Check color="#5cff9d" /> Tagihan Otomatis</li>
                        <li><Check color="#5cff9d" /> KIrim informasi via Push Notification</li>
                        {/* <li className="disabled">✖ RSVP Tamu Lanjutan</li> */}
                    </ul>
                </div>

                <div className="card-pricing">
                    <h3>Q - Enterprise</h3>
                    <p className="sub">Untuk cluster kecil hingga 100 unit</p>

                    <h1>Let's Talk</h1>
                    {/* <p className="desc">Bersertifikat, dukungan email 24 jam</p> */}

                    {/* <button className="btn-outline">Pilih Starter</button> */}

                    <ul className="feature-list">
                        <li><Check color="#5cff9d" /> White-label aplikasi (logo & nama sesuai brand)</li>
                        <li><Check color="#5cff9d" /> Sistem pembayaran terintegrasi (VA, QRIS, e-wallet)</li>
                        <li><Check color="#5cff9d" /> Dashboard khusus pengelola</li>
                        <li><Check color="#5cff9d" /> Custom fitur sesuai kebutuhan</li>
                        <li><Check color="#5cff9d" /> Priority support & maintenance</li>
                    </ul>
                </div>

            </div>

            {/* FOOTER NOTE */}
            {/* <div className="pricing-note">
                💡 Semua paket include <b>30 hari uji coba gratis</b>. Tidak perlu kartu kredit untuk memulai.
            </div> */}

        </section>
    )
}


export default Pricing
