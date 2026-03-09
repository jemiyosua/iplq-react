import React , { useState, useEffect, useRef } from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IconStarpoin, IcStarmall, Playstore, Appstore, QrDownloadApp, StarMallKategoriProduk, StarMallChat, StarMallCart, StarMallUser, IcLogoLippoTextHeader, IcLogoLippoTextBrownHeader, IcWhatappHeader, IcWhatappDarkHeader, IcWhatsappWhite, IcWhatsappDark, IcWhatsappBlack, IcArrowWhiteHeader, IcArrowBlackHeader, IcMenuBurger } from '../../../assets';
import { setForm } from '../../../redux';
import './header.css';
import './sidebar-menu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

const Header = ({ pageActive, onClickSection, pageAnchor }) => {

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

    const [ListHeaderMenu, setListHeaderMenu] = useState([])
    const [ImageDark, setImageDark] = useState([])
    const [ImageLight, setImageLight] = useState("")

    useEffect(() => {

        getListHeaderMenu()
        getListHeaderLogo()
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

    const getListHeaderLogo = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'HeaderLogo';
        var Signature = generateSignature(requestBody)

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
            if (data.ErrorCode === "0") {
                setImageDark(data.Result[0].ImagesDark)
                setImageLight(data.Result[0].ImagesLight)
            } else {
                // setErrorMessageAlert(data.ErrorMessage);
                // setShowAlert(true);
                return false;
            }
        })
        .catch((error) => {
            if (error.message == 401) {
                // setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
                // setShowAlert(true);
                return false;
            } else if (error.message != 401) {
                // setErrorMessageAlert(AlertMessage.failedConnect);
                // setShowAlert(true);
                return false;
            }
        });
    }

    const handleToggle = () => {
        setIsMobile(!isMobile);
    };

    const closeMobileMenu = () => {
        setIsMobile(false);
    };

    const handleScroll = () => {
        const scrollThreshold = 150; // Pixels to trigger background change
        if (window.scrollY > scrollThreshold) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsDropdownOpen(false);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    };

    const handleDropDownLanguage = (language) => {
        setIsRotated(!isRotated)
        setIsDropdownOpen(!isDropdownOpen)
        setLanguageHeader(language)
    }

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setIsSidebarOpen(false)
        }
    };

    const toggleRotation = () => {
        setIsRotated(!isRotated); // Toggle the rotation state
        setIsDropdownOpen(!isDropdownOpen);
    };

    const changePage = (page) => {
        window.location.href = page
    }

    const getListHeaderMenu = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": "",
            "Flag": "header"
        });

        var url = paths.URL_API_WEB + 'ListHeaderMenu';
        var Signature = generateSignature(requestBody)

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
            if (data.ErrorCode === "0") {
                setListHeaderMenu(data.Result)
            } else {
                // setErrorMessageAlert(data.ErrorMessage);
                // setShowAlert(true);
                return false;
            }
        })
        .catch((error) => {
            // setLoading(false)
            if (error.message == 401) {
                // setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
                // setShowAlert(true);
                return false;
            } else if (error.message != 401) {
                // setErrorMessageAlert(AlertMessage.failedConnect);
                // setShowAlert(true);
                return false;
            }
        });
    }

    // style={{position:'fixed',top:30,height:80,width:'80%',backgroundColor:'#064734',borderTopLeftRadius:50,borderTopRightRadius:50,borderBottomLeftRadius:50,borderBottomRightRadius:50,display:'flex',alignItems:'center', zIndex:1000}}

    return (
        <>
            <div className='navbar'>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%',marginLeft:30,marginRight:30}}>
                    <div style={{color:'#01DE82',fontWeight:'bold',fontSize:30}}>IPLQ</div>
                    {!isMobile && (
                    <div style={{display:'flex',alignItems:'center',width:520,gap:10}}>
                        <div className='text-header'>Fitur Aplikasi</div>
                        <div className='text-header'>Cara Kerja</div>
                        <div className='text-header'>Download</div>
                        <div className='text-header'>FAQ</div>
                    </div>)}
                    {isMobile && (
                    <div onClick={() => setMenuOpen(!menuOpen)} style={{display:'flex',alignItems:'center',cursor:'pointer'}}>
                        <img src={IcMenuBurger} width={20} style={{backgroundColor:'#01DE82'}} />
                    </div>)}
                </div>
            </div>
        </>
    )
}


export default Header
