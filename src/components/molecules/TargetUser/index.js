import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ImgApartement, ImgBoardingHouse, ImgCluster, ImgMockupMobile, ImgPerumahan, ImgRuko } from '../../../assets';
import './target-user.css';
import { Check } from '@mui/icons-material';

const TargetUser = ({ pageActive, onClickSection, pageAnchor }) => {

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

    const data = [
        { title: "Cluster", desc: "Membantu Estate Management dalam mengelola hunian eksklusif.", image:ImgCluster, icon: "🏡" },
        { title: "Apartemen", desc: "Pengelolaan gedung bertingkat.", image:ImgApartement, icon: "🏢" },
        { title: "Pemilik Kosan", desc: "Kelola kos dengan efisien.", image:ImgBoardingHouse, icon: "🏠" },
        { title: "Perumahan (RT, RW dan Paguyuban)", desc: "Transparansi keuangan RT/RW.", image:ImgPerumahan, icon: "📍" },
        { title: "Komplek Lainnya", desc: "Fleksibel untuk berbagai kebutuhan.", image:ImgRuko, icon: "📦" }
    ];

    const features = [
        { title: "Untuk Semua Skala", desc: "Dari hunian kecil hingga kompleks besar." },
        { title: "Customizable", desc: "Fitur bisa disesuaikan kebutuhan." }
    ];

    useEffect(() => {

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
        <section className="target" id="target">
            <div className="target-container">

                {/* HEADER */}
                <div className="target-header">
                <span className="badge">Target Pengguna</span>

                <h2>
                    Untuk <span>Siapa Saja</span>
                </h2>

                <p>
                    IPL-Q dirancang untuk berbagai jenis hunian modern di Indonesia.
                    Mulai Dari cluster, Apartement sampai dengan Ruko.
                </p>
                </div>

                {/* GRID */}
                <div className="target-grid">
                {data.map((item, i) => (
                    <div className="target-card" key={i}>
                    
                    <div className="card-top">
                        {/* <div className="card-icon">{item.icon}</div> */}
                        <img src={item.image}/>
                    </div>

                    <div className="card-bottom">
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                    </div>

                    </div>
                ))}
                </div>

                {/* BOTTOM STRIP */}
                <div className="target-bottom">
                {features.map((item, i) => (
                    <div className="feature" key={i}>
                    <Check color="#9AE800" />
                    <div>
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                    </div>
                    </div>
                ))}
                </div>

            </div>
        </section>
    )
}


export default TargetUser