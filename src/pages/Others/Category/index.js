import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Dropdown } from '../../../components';
import './Tab.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import LabelTH from '../../../components/molecules/LabelTH'
import { Col, Row, Form, ListGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faUserPlus, faArrowLeft, faArrowLeftRotate, faArrowsRotate, faEllipsisVertical, faUserPen, faPercent, faGraduationCap, faLayerGroup, faFileExcel, faFileImport, faBarcode, faAdd } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { IconActive, IconAddNewProduct, IconRefresh, IconUnactive } from '../../../assets';

const Category = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);

	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [Loading, setLoading] = useState(false)
	const [LoadingStatus, setLoadingStatus] = useState(false)
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

	const [ListKategori, setListKategori] = useState([])
    const [IdStatus, setIdStatus] = useState("")
    const [KategoriId, setKategoriId] = useState("")
    const [KategoriNama, setKategoriNama] = useState("")
    const [KategoriNamaEdit, setKategoriNamaEdit] = useState("")
    const [Status, setStatus] = useState("")
    const [StatusEditNamaKategori, setStatusEditNamaKategori] = useState("")

    const [ModalAddNew, setModalAddNew] = useState(false)
    const [NamaKategoriModal, setNamaKategoriModal] = useState("")

    const [Filter, setFilter] = useState("")
    const [FilterPopup, setFilterPopup] = useState(false)
    const [Search, setSearch] = useState("")
    const [FilterStatus, setFilterStatus] = useState("")
    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")


    const handleScroll = (scrollOffset) => {
        if (containerRef.current) {
          containerRef.current.scrollLeft += scrollOffset;
        }
    };

	useEffect(() => {
        // window.scrollTo(0, 0)

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        var CookieRole = getCookie("role");
        
        if (CookieParamKey == null || CookieParamKey === "" || CookieUsername == null || CookieUsername === "") {
            logout()
            window.location.href="admin/login";
            return false;
        } else {
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","Category"))

            // setRoleAccess(CookieRole)
            getListcategory(1, "", "", "")
        }

    },[])

	const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserName = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var Role = LongSecretCookie[3];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return UserName;            
            } else if (tipe === "paramkey") {
                return ParamKey;
            } else if (tipe === "nama") {
                return Nama;
            } else if (tipe === "role") {
                return Role;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    const handleMouseOver = (Id, item, position) => {
        var IdIndex = item.Id

        if (position === "edit") {
            setIdIndex(Id)
            if (Id === IdIndex) {
                setIsHovering(true)
            }
        } else {
            setIdIndex(Id)
            setIsHoveringNoEdit(true)
        }
    };
    
    const handleMouseOut = () => {
        setIdIndex("")
        setIsHovering(false)
        setIsHoveringNoEdit(false)
        // setEditablePrice(false)
    };

    const getListcategory = (Page, Position, SearchValue, SearchType) => {

        var SearchKategoriNama = ""
        var Status = ""

        if (Position === "reset-filter") {
            // setFilter("")
            // setSearch("")
            // setFilterStatus("")
        } else {
            if (SearchType !== "") {
                if (SearchType === "nama_kategori") {
                    SearchKategoriNama = SearchValue
                } else if (SearchType === "status") {
                    setStatus(SearchValue)
                    Status = SearchValue
                }
            }
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "NamaKategori": SearchKategoriNama,
            "StatusKategori": Status,
            "Page": Page,
            "RowPage": 20,
            "OrderBy": "dbmp.tgl_input",
            "Order": "DESC"
        });

		var url = paths.URL_API_ADMIN + 'Category';
		var Signature  = generateSignature(requestBody)

		setLoading(true)

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
			setLoading(false)

			if (data.ErrorCode === "0") {
				setListKategori(data.Result)
                setTotalData(data.TotalRecords)
                setTotalPages(data.TotalPage)
			} else {
				if (data.ErrorCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
					setErrorMessageAlert(data.ErrorMessage);
					setShowAlert(true);
					return false;
				}
			}
		})
		.catch((error) => {
			setLoading(false)
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

    const updateStatusKategori = (IdKategori, Status) => {

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        if (IdKategori === 0) {
            setErrorMessageAlert("Id Kategori tidak boleh kosong");
            setShowAlert(true);
            return false;
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "UPDATE",
            "Id": IdKategori,
            "StatusKategori": vStatus
		});

		var url = paths.URL_API_ADMIN + 'Category';
		var Signature  = generateSignature(requestBody)

		setLoadingStatus(true)

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
			setLoadingStatus(false)

			if (data.ErrorCode === "0") {
				// getListItem(1, "")
			} else {
				if (data.ErrorCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
					setErrorMessageAlert(data.ErrorMessage);
					setShowAlert(true);
					return false;
				}
			}
		})
		.catch((error) => {
			setLoadingStatus(false)
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

    const inputKategori = () => {

        if (NamaKategoriModal === "") {
            setErrorMessageAlert("Nama Kategori tidak boleh kosong");
            setShowAlert(true);
            return false;
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "INSERT",
            "NamaKategori": NamaKategoriModal
		});

		var url = paths.URL_API_ADMIN + 'Category';
		var Signature  = generateSignature(requestBody)

		setLoadingStatus(true)

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
			setLoadingStatus(false)

			if (data.ErrorCode === "0") {
                setNamaKategoriModal("")
				getListcategory(1, "")
                setSuccessMessage("Berhasil input data")
                setShowAlert(true)
                setModalAddNew(false)
			} else {
				if (data.ErrorCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
					setErrorMessageAlert(data.ErrorMessage);
					setShowAlert(true);
					return false;
				}
			}
		})
		.catch((error) => {
			setLoadingStatus(false)
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

    const updateNamaKategori = (IdKategori, NamaKategori) => {

        if (NamaKategori === "") {
            setErrorMessageAlert("Nama Kategori tidak boleh kosong");
            setShowAlert(true);
            return false;
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "UPDATE",
            "Id": IdKategori,
            "NamaKategori": NamaKategori
		});

		var url = paths.URL_API_ADMIN + 'Category';
		var Signature  = generateSignature(requestBody)

		setLoadingStatus(true)

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
			setLoadingStatus(false)

			if (data.ErrorCode === "0") {
				// getListItem(1, "")
			} else {
				if (data.ErrorCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
					setErrorMessageAlert(data.ErrorMessage);
					setShowAlert(true);
					return false;
				}
			}
		})
		.catch((error) => {
			setLoadingStatus(false)
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

    const handleChangeStatus = (Id, Status) => {
        var vListKategori = ListKategori

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListKategori.map((item,index) => {
            if (item.Id === Id) {
                vListKategori[index].StatusKategori = vStatus
                updateStatusKategori(Id, Status)
            }
        })
        setListKategori(vListKategori)
    }

    const handleUpdateNamaKategori = (Id, NamaKategori) => {
        var vListKategori = ListKategori

        vListKategori.map((item,index) => {
            if (item.Id === Id) {
                vListKategori[index].NamaKategori = NamaKategori
                updateNamaKategori(Id, NamaKategori)
            }
        })
        setListKategori(vListKategori)
    }

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        removeCookie('varMerchantId', { path: '/'})
        removeCookie('varIdVoucher', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        dispatch(setForm("Name",''))
        dispatch(setForm("Role",''))
        if (window) {
            sessionStorage.clear();
		}
    }

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListKategori([])
        getListcategory(currentPage, "", "", "")
    }
    
    return (
		<div className="main-page" style={{ backgroundColor:'#F6FBFF' }}>
            <div className="content-wrapper-2" style={{ backgroundColor:'#F6FBFF', width:'100%' }} >
                <div className="blog-post">
                    {/* <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}><FontAwesomeIcon icon={faLayerGroup}/> Master Category</div> */}
                    {/* <p style={{ margin:0 }}>Here's for all Admin from SIAM platform.</p> */}

                    {SessionMessage !== "" ?
                    <SweetAlert 
                        warning 
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            logout()
                            window.location.href="/";
                        }}
                        btnSize="sm">
                        {SessionMessage}
                    </SweetAlert>
                    :""}

                    {SuccessMessage !== "" ?
                    <SweetAlert 
                        success 
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            setSuccessMessage("")
                        }}
                        btnSize="sm">
                        {SuccessMessage}
                    </SweetAlert>
                    :""}
                    
                    {ErrorMessageAlert !== "" ?
                    <SweetAlert 
                        danger
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            setErrorMessageAlert("")
                        }}
                        btnSize="sm">
                        {ErrorMessageAlert}
                    </SweetAlert>
                    :""}

                    {ErrorMessageAlertLogout !== "" ?
                    <SweetAlert 
                        danger 
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            setErrorMessageAlertLogout("")
                            window.location.href="admin/login";
                        }}
                        btnSize="sm">
                        {ErrorMessageAlertLogout}
                    </SweetAlert>
                    :""}
                    
                    {/* <Gap height={20} />
                    
                    <div>
                        <a href='master-data'>
                            <button role="tab" aria-controls="merchant-list">
                                <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Master Category</div>
                            </button>
                        </a>
                    </div> */}
                    
                    <div style={{ backgroundColor:'white', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>

                        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                            <div
                                style={{ cursor:'pointer' }}
                                onClick={() => {
                                    setStatus("")
                                    setKategoriId("")
                                    getListcategory(1, "", "", "")
                                }}>
                                <img src={IconRefresh} />
                            </div>
                            <div style={{  marginLeft:20  }} />
                            <div
                                style={{ cursor:'pointer' }}
                                onClick={() => {
                                    setModalAddNew(true)
                                }}>
                                <img style={{ width:25 }} src={IconAddNewProduct} />
                            </div>
                        </div>
                        
                        <br />
                        <br />

                        <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                            <Thead>
                                <Tr style={{ borderColor:'white', textAlign:'left' }}>
                                    <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}>
                                        <Dropdown onChange={(event) => getListcategory(1, "", event.target.value, "status") }>
                                            <option value="">Status</option>
                                            <option value="1" selected={Status === "1"}>Aktif</option>
                                            <option value="0" selected={Status === "0"}>Tidak Aktif</option>
                                        </Dropdown>
                                    </Th>
                                    <Th className="tabelHeader">
                                        <Input
                                            required
                                            placeHolder={'Category Name'}
                                            value={KategoriNama}
                                            onChange={event => setKategoriNama(event.target.value)}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter') {
                                                    getListcategory(1, "", event.target.value, "nama_kategori")
                                                    event.target.blur()
                                                }
                                            }}
                                        />
                                    </Th>
                                    <Th className="tabelHeader"><LabelTH>Input Date</LabelTH></Th>
                                </Tr>
                            </Thead>
                            {/* <Thead>
                                <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                    <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}><LabelTH>Status</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Nama Kategori</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Tanggal Input</LabelTH></Th>
                                </Tr>
                            </Thead> */}
                            <Tbody>
                                {Loading ? 
                                <Tr>
                                    <td colSpan="9" align="center">
                                        <div className="loader-container">
                                            <div className="spinner" />
                                        </div>
                                        {/* <Skeleton count={ListProduk.length} /> */}
                                    </td>
                                </Tr>
                                :
                                ListKategori.length > 0 ? ListKategori.map((item,index)=>{
                                return <Tr style={{
                                    marginBottom:20,
                                    borderBottomWidth:1,
                                    borderBottom:'1px solid #004372',
                                    borderLeftWidth:1,
                                    borderRightWidth:1,
                                }} onMouseOver={() => handleMouseOver(item.Id, item, "no-edit")} onMouseOut={handleMouseOut}>
                                        {LoadingStatus && item.Id === IdStatus ?
                                        <div className="loader-container-small">
                                            <div className="spinner-small" />
                                        </div>
                                        :
                                        <Td style={{ paddingTop:20, paddingBottom:20, color:'#546E7A', borderTopLeftRadius:10, borderBottomLeftRadius:10, textAlign:'center', width:'10%' }}>
                                            {item.StatusKategori === "0" ? 
                                            <img 
                                                src={IconUnactive}
                                                style={{ width:30, height:30, cursor:'pointer' }}
                                                onClick={() => {
                                                    setIdStatus(item.Id)
                                                    handleChangeStatus(item.Id, item.StatusKategori)
                                                }}
                                            />
                                            :
                                            <img
                                                src={IconActive}
                                                style={{ width:30, height:30, cursor:'pointer' }}
                                                onClick={() => {
                                                    setIdStatus(item.Id)
                                                    handleChangeStatus(item.Id, item.StatusKategori)
                                                }}
                                            />
                                            }
                                        </Td>
                                        }
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>
                                            <Input
                                                required
                                                value={StatusEditNamaKategori && KategoriId === item.Id ? KategoriNamaEdit : item.NamaKategori}
                                                onChange={event => setKategoriNamaEdit(event.target.value)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter') {
                                                        handleUpdateNamaKategori(item.Id, event.target.value)
                                                        event.target.blur()
                                                    }
                                                }}
                                                onBlur={event => {
                                                    setStatusEditNamaKategori(false)
                                                    handleUpdateNamaKategori(item.Id, event.target.value)
                                                }}
                                                onFocus={() => {
                                                    setStatusEditNamaKategori(true)
                                                    setKategoriId(item.Id)
                                                    setKategoriNamaEdit(item.NamaKategori)
                                                }}
                                            />
                                        </td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.TanggalInput}</td>
                                    </Tr>;
                                }) : <Tr><td colSpan="3" align="center" style={{ color:'red', fontWeight:'bold' }}>{"Data not found"}</td></Tr>
                                }
                            </Tbody>
                        </Table>

                        <br/>

                        <Modal
                            show={ModalAddNew}
                            size="lg"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            style={{ borderRadius:10}}
                            >
                            <Modal.Body>
                                <Gap height={20} />

                                <h5>Add New Category</h5>

                                <br />

                                <div>
                                    <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Category Name</div>
                                    <div>
                                        <Input
                                            required
                                            value={NamaKategoriModal}
                                            onChange={event => setNamaKategoriModal(event.target.value)}
                                        />
                                    </div>
                                </div>

                            </Modal.Body>

                            <Gap height={20} />
                            
                            <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center' }}>
                                <div style={{ color:'#004372', marginRight:20, fontSize:20, cursor:'pointer' }} onClick={() => setModalAddNew(false)}>Cancel</div>
                                <div style={{ backgroundColor:'#004372', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
                                    <div style={{ color:'#FFFFFF', textAlign:'center', fontWeight:'bold', cursor:'pointer' }} 
                                    onClick={() => inputKategori()}
                                    >Save Changes</div>
                                </div>
                            </div>
                        </Modal>

                        <div 
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems:'center',
                            }}
                        >
                            Total Data : {TotalData}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: 20,
                                boxSizing: 'border-box',
                                alignItems:'center',
                            }}
                        >
                        <ReactPaginate
                            pageCount={TotalPages}
                            onPageChange={handlePageClick}
                            forcePage={Paging}
                            containerClassName={'pagination'}
                            pageClassName={'page-item'}
                            pageLinkClassName={'page-link'}
                            previousClassName={'page-item'}
                            previousLinkClassName={'page-link'}
                            nextClassName={'page-item'}
                            nextLinkClassName={'page-link'}
                            breakClassName={'page-item'}
                            breakLinkClassName={'page-link'}
                            activeClassName={'active'}
                        />
                        </div>
                        
                    </div>
                </div>
            </div>
		</div>
    )
}

export default Category;