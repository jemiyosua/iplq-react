import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ImgHero1IPLQ, ImgHero2IPLQ, ImgHero3IPLQ, ImgHeroIPLQ, ImgMockupMobile } from '../../../assets';
import './hero.css';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Hero = ({ pageActive, onClickSection, pageAnchor }) => {

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

    const slides = [
        {
            title: "Keamanan 24 Jam di Genggaman Anda",
            desc: "Monitor CCTV real-time, tombol SOS darurat, dan sistem RSVP tamu terpadu.",
        },
        {
            title: "Kontrol Hunian Lebih Mudah",
            desc: "Kelola akses, tamu, dan keamanan hanya dari satu aplikasi.",
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
        <section className="hero" id="#">
            <Swiper
                modules={[Navigation, Autoplay]}
                // pagination={{ clickable: true }}
                navigation
                autoplay={{ delay: 5000 }}
                loop
            >
                <SwiperSlide>
                    <div className="hero-container">

                        {/* LEFT */}
                        <div className="hero-left">
                            <span className="badge">⚡ Platform Manajemen Hunian #1</span>

                            <h1>
                                Kelola <br /> Hunian <br />
                                <span className="highlight">Lebih Cerdas</span> <br />
                                Bersama <br /> IPL-Q
                            </h1>

                            <p>
                                Solusi SaaS terpadu untuk manajemen perumahan dan cluster — 
                                dari tagihan, notifikasi, hingga keamanan dalam satu platform modern.
                            </p>

                            {/* <div className="hero-buttons">
                                <button className="btn-primary">Mulai Gratis →</button>
                                <button className="btn-secondary">Lihat Fitur</button>
                            </div> */}
                        </div>

                        {/* RIGHT */}
                        <div className="hero-right">
                            <div className="glass-card">
                                <img src={ImgHero3IPLQ} alt="IPL-Q App" className="phone-mockup" />
                            </div>
                        </div>

                    </div>
                </SwiperSlide>

                <SwiperSlide>
                    <div className="hero-container reverse">

                        {/* LEFT */}
                        <div className="hero-left">
                            <span className="badge">⚡ Keamanan Terjamin</span>

                            <h1>
                                Keamanan <br />
                                <span className="highlight">24 Jam</span> <br /> di<br />
                                genggaman anda
                            </h1>

                            <p>
                                Monitor CCTV real-time, tombol SOS darurat, dan sistem RSVP tamu terpadu — hunian Anda lebih aman dari sebelumnya.
                            </p>

                            {/* <div className="hero-buttons">
                                <button className="btn-primary">Mulai Gratis →</button>
                                <button className="btn-secondary">Lihat Fitur</button>
                            </div> */}
                        </div>

                        {/* RIGHT */}
                        <div className="hero-right">
                            <div className="glass-card">
                                <img src={ImgHero3IPLQ} alt="IPL-Q App" className="phone-mockup" />
                            </div>
                        </div>

                    </div>
                </SwiperSlide>

                <SwiperSlide>
                    <section className="trust-hero3">

                        <div className="trust-container-hero3">

                            {/* BADGE */}
                            <span className="badge-hero3">⚡ Terbukti & Terpercaya</span>

                            {/* TITLE */}
                            <h2>
                            Beberapa <br />
                            Cluster Sudah <br />
                            <span>Percaya IPL-Q</span>
                            </h2>

                            {/* DESC */}
                            <p>
                            Dari pengelolaan iuran, fasilitas, hingga komunikasi warga —
                            semua dalam satu dashboard yang intuitif dan mudah digunakan.
                            </p>

                            {/* STATS */}
                            {/* <div className="stats-hero3">
                                <div>
                                    <h3>500+</h3>
                                    <span>Cluster Aktif</span>
                                </div>

                                <div>
                                    <h3>50K+</h3>
                                    <span>Penghuni Terdaftar</span>
                                </div>

                                <div>
                                    <h3>99.9%</h3>
                                    <span>Uptime</span>
                                </div>
                            </div> */}

                            {/* BUTTON */}
                            {/* <button className="cta">
                            Bergabung Sekarang →
                            </button> */}

                        </div>
                    </section>
                </SwiperSlide>

            </Swiper>
        </section>
    )
}


export default Hero
