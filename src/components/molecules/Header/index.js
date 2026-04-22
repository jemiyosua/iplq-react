import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IconStarpoin, IcStarmall, Playstore, Appstore, QrDownloadApp, StarMallKategoriProduk, StarMallChat, StarMallCart, StarMallUser, IcLogoLippoTextHeader, IcLogoLippoTextBrownHeader, IcWhatappHeader, IcWhatappDarkHeader, IcWhatsappWhite, IcWhatsappDark, IcWhatsappBlack, IcArrowWhiteHeader, IcArrowBlackHeader, LogoIPLQ, LogoIPLQTulisan } from '../../../assets';
import './header.css';
// import './sidebar-menu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

const Header = ({ pageActive, onClickSection, pageAnchor }) => {

    const history =useHistory();
    const [cookies, setCookie,removeCookie] = useCookies([]);
    const { form }=useSelector(state=>state.PaketReducer);
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);

    const [isMobile, setIsMobile] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const [PageActive, setPageActive] = useState("home")

    useEffect(() => {
        
        const handleScroll = () => {
            const scrollThreshold = 50; // atau 150 bebas
            setIsScrolled(window.scrollY > scrollThreshold);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
            <a href="#">
                {/* <div className="logo">IPL-Q</div> */}
                <div>
                    {/* <img src={LogoIPLQ} style={{ width:100 }} /> */}
                    <img src={LogoIPLQTulisan} style={{ width:170 }} />
                </div>
            </a>

            {/* style={{ backgroundColor:'#5cff9d', color:'#064734' }} */}

            {/* MENU */}
            <nav className={menuOpen ? `active ${isScrolled ? "scrolled" : ""}` : ""}>
                <a href="#about">Tentang</a>
                <a href="#target" style={{fontWeight:'bold'}}>Siapa yang membutuhkan jasa kami?</a>
                <a href="#vm">Visi & Misi</a>
                <a href="#features">Fitur</a>
                <a href="#pricing">Harga</a>
                <a href="#cta">Daftar</a>
            </nav>

            {/* RIGHT */}
            <div className="nav-right">
                <a href="#cta">
                    <button className="nav-btn">Daftar Sekarang</button>
                </a>

                <div
                className={`hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
    )
}


export default Header