import React , {useState} from 'react';
import { Button, Form, Nav, Navbar, NavDropdown, Container , Card, CardDeck } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IconStarpoin, IcStarmall, Playstore, Appstore, QrDownloadApp, StarMallKategoriProduk, StarMallChat, StarMallCart, StarMallUser } from '../../../assets';
import { setForm } from '../../../redux';
import './header.css';

const Header = ({noNavbar}) => {
    noNavbar = true;
    const history =useHistory();
    const [cookies, setCookie,removeCookie] = useCookies(['user']);
    const {form}=useSelector(state=>state.PaketReducer);
    const dispatch = useDispatch();

    const [isShown, setIsShown] = useState(false);

    const handleComponent = event => {
        setIsShown(current => !current);
    }

    const handleComponentFalse = event => {
        setIsShown(false)
    }

    const handleComponentTrue = event => {
        setIsShown(true)
    }
    
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const [isHoveredPartner, setIsHoveredPartner] = useState(false);
    const [isClickedPartner, setIsClickedPartner] = useState(false);
    const [isHovering, setIsHovering] = useState(false)
    const [ModalDownload, setModalDownload] = useState(false)

    const HandleLeave = () => {
        setModalDownload(false)
    }
    
    const HandleHover = () => {
        setModalDownload(true)
    }

    return (
        <div style={{ paddingBottom:60, zIndex:100, borderBottom:1, borderBottomWidth:2 }}>
            <Navbar bg="" expand="lg" style={{ zIndex:100, position:'fixed', top:0, width:'100%', backgroundColor:'#DEF7F3' }}>
                <Container fluid>
                    {/* <Navbar.Brand href="/" style={{paddingLeft:20}}><img width="auto" height="35" src={IcStarmall} /></Navbar.Brand> */}
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll" className="justify-content-center" >
                        <Nav>
                            <Nav.Link href="/" style={{ paddingRight:20 }}>
                                {/* <img width="auto" height="25" src={IcStarmall} /> */}
                            </Nav.Link>
                            <Nav.Link href="/sale-product" style={{ paddingRight:20, color:'#000000' }}>On Sale Now</Nav.Link>
                            {/* <Nav.Link style={{ color:'#000000' }}><img src={StarMallKategoriProduk}/> Kategori Produk</Nav.Link> */}
                            <Nav.Link href="/faq" style={{ color:'#000000' }}>FAQ</Nav.Link>
                            <Nav.Link href="https://starpoin.id/" target="_blank" style={{ color:'#000000' }}>StarPoin</Nav.Link>
                            {/* <Nav.Link style={{ color:'#000000' }}><img src={StarMallChat}/></Nav.Link> */}
                            {/* <Nav.Link style={{ color:'#000000' }}><img src={StarMallCart}/></Nav.Link> */}
                            {/* <Nav.Link style={{ color:'#000000', fontSize:10 }}><img src={StarMallUser}/> Daftar / Masuk</Nav.Link> */}
                        </Nav>
                    </Navbar.Collapse>
                    
                    {/* <Navbar.Collapse className="justify-content-end">

                        <div onPointerOver={HandleHover} onMouseLeave={HandleLeave}>
                            <Button style={{ backgroundColor:'#61308C', border:'none' }} onClick={()=>{history.push('/download')}}>Download App</Button>
                            {ModalDownload &&  
                            <div style={{ position:'absolute', top: '80%', right: '1%', backgroundColor:'#FFFFFF', boxShadow: '1px 2px 9px #c7c7c7', borderRadius:10, padding:20, textAlign:'center' }} onMouseOver={HandleHover} onMouseLeave={ModalDownload ? HandleHover : HandleLeave}>
                                <h3 style={{ width:'100%', font:'Poppins', fontSize:"24px" }}>Scan QR Code <br/>to download</h3>
                                <div onMouseOver={() => setIsHovering(true)} style={{ marginBottom:30 }}>
                                    <img src={QrDownloadApp} width="128" height="128" alt="Qr Applikasi StarPoin"/>
                                </div>
                                <div onMouseOver={() => setIsHovering(true)} style={{ marginBottom:30 }}>
                                    <img src={Playstore} width="128" height="45" alt="PlayStore StarPoin"/>
                                </div>
                                <div onMouseOver={() => setIsHovering(true)}>
                                    <img src={Appstore} width="128" height="45" alt="AppStore StarPoin"/>
                                </div>
                            </div>
                            }
                        </div>
                    <div className="divHeight">&nbsp;</div>
                    </Navbar.Collapse> */}
                </Container>
            </Navbar>
        </div>
    )
}


export default Header
