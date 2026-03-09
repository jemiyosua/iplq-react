import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Alert, ModalUpdateHeaderMenu } from '../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';
import 'react-loading-skeleton/dist/skeleton.css'
import { IconActive, IconRefresh, IconUnactive, IconUpdateProduct } from '../../../assets';

const ListHeaderMenu = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [Loading, setLoading] = useState(false)
	const [LoadingStatus, setLoadingStatus] = useState(false)
    const [LoadingStok, setLoadingStok] = useState(false)
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

	const [ListHeaderMenu, setListHeaderMenu] = useState([])
    const [Id, setId] = useState("")

    // ---------- update -----------
    const [ShowModalUpdate, setShowModalUpdate] = useState(false)

    const [MenuNameUpdate, setMenuNameUpdate] = useState("")
    // ---------- end of update ----------

    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")
	
    // ---------- alert ----------
    const [AlertState, setAlertState] = useState("")
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ConfirmMessage, setConfirmMessage] = useState("")

    const [AlertTitle, setAlertTitle] = useState(false)
    const [AlertDescription, setAlertDescription] = useState(false)
    // ---------- end of alert ----------

	useEffect(() => {
        window.scrollTo(0, 0)

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        var CookieRole = getCookie("role");
        
        if (CookieParamKey == null || CookieParamKey === "" || CookieUsername == null || CookieUsername === "") {
            logout()
        } else {
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","HEADER"))
            dispatch(setForm("SubPageActive","HEADER-MENU"))

            getListHeaderMenu(1, "", "", "")
        }

    },[])

	const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        var PageReturn = cookies.PageReturn;
        if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserName = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var Role = LongSecretCookie[3];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return UserName            
            } else if (tipe === "paramkey") {
                return ParamKey
            } else if (tipe === "nama") {
                return Nama
            } else if (tipe === "role") {
                return Role
            } else if (tipe === "page_return") {
                return PageReturn
            } else {
                return null
            }
        } else {
            return null
        }
    }

    const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        if (window) {
            sessionStorage.clear();
		}
        window.location.href="/admin/login"
    }

    // { ---------- start curl ----------
    const getListHeaderMenu = (page, position, searchValue, searchType, id) => {

        setShowAlert(false)

        var SearchTitle = ""
        var SearchDesc = ""
        var FilterStatus = ""

        if (position === "reset-filter") {
            // setFilter("")
            // setSearch("")
            // setFilterStatus("")
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

        var requestBody = ""

        if (position == "detail") {
            requestBody = JSON.stringify({
                "Username": CookieUsername,
                "ParamKey": CookieParamKey,
                "Method": "SELECT",
                "Id": id,
                "Page": 1,
                "RowPage": 1,
                "OrderBy": "",
                "Order": ""
            })
        } else {
            requestBody = JSON.stringify({
                "Username": CookieUsername,
                "ParamKey": CookieParamKey,
                "Method": "SELECT",
                "Title": SearchTitle,
                "Description": SearchDesc,
                "Status": FilterStatus,
                "Page": page,
                "RowPage": 10,
                "OrderBy": "",
                "Order": ""
            })
        }

		var url = paths.URL_API_ADMIN + 'HeaderMenu';
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
                if (position == "detail") {
                    setMenuNameUpdate(data.Result[0].MenuName)
                } else {
                    setListHeaderMenu(data.Result)
                    setTotalData(data.TotalRecords)
                    setTotalPages(data.TotalPage)
                }
			} else {
				if (data.ErrorCode === "2") {
                    setAlertState("session")
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
                    setAlertState("error")
					setErrorMessageAlert(data.ErrorMessage);
					setShowAlert(true);
					return false;
				}
			}
		})
		.catch((error) => {
			setLoading(false)
            setAlertState("error")
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

    const handleUpdate = (status, paramUpdate, id) => {

        var idMenuList = ""
        var errorMessage = ""
        if (paramUpdate == "status") {
            idMenuList = id
            if (status == "") {
                errorMessage += "\n Status can't null value"
            }
        } else {
            idMenuList = Id
            if (MenuNameUpdate == "") {
                errorMessage += "\n Menu Name can't null value"
            }
        }

        if (errorMessage != "") {
            setAlertState("error")
            setErrorMessageAlert(errorMessage);
            setShowAlert(true);
            return
        }

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "Username": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "UPDATE",
            "Id": idMenuList,
            "ParamUpdate": paramUpdate,
            "MenuName": MenuNameUpdate,
            "Status": status
        })

		var url = paths.URL_API_ADMIN + 'HeaderMenu';
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
                setMenuNameUpdate("")
                setShowModalUpdate(false)

                setAlertState("success")
                setSuccessMessage("Success update data")
                setShowAlert(true)
                getListHeaderMenu(1, "", "", "", "")
			} else {
				if (data.ErrorCode === "2") {
                    setAlertState("session")
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
                    setAlertState("error")
					setErrorMessageAlert(data.ErrorMessage);
					setShowAlert(true);
					return false;
				}
			}
		})
		.catch((error) => {
			setLoading(false)
            setAlertState("error")
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
    // } ---------- end of curl ----------

    const handleChangeStatus = (id, status) => {
        var vListHeaderMenu = ListHeaderMenu

        var vStatus = ""
        if (status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListHeaderMenu.map((item,index) => {
            if (item.Id === id) {
                vListHeaderMenu[index].Status = vStatus
                handleUpdate(vStatus, "status", id)
            }
        })
        setListHeaderMenu(vListHeaderMenu)
    }

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListHeaderMenu([])
        getListHeaderMenu(currentPage, "", "", "", "")
    }

    const handleConfirmAlert = (alertState) => {
        if (alertState == "session") {
            setShowAlert(false)
            logout()
        } else if (alertState == "success") {
            setShowAlert(false)
            setSuccessMessage("")
        } else if (alertState == "error") {
            setShowAlert(false)
            setErrorMessageAlert("")
        } else if (alertState == "logout") {
            setShowAlert(false)
            setErrorMessageAlertLogout("")
            window.location.href="/admin/login"
        } else if (alertState == "validation") {
            setShowAlert(false)
            setValidationMessage("")
        } else if (alertState == "confirm") {
            // handleDeletehero()
        }
    }

    const handleCancelUpdate = () => {
        setId("")
        setMenuNameUpdate("")
        setAlertTitle(false)
        setAlertDescription(false)
        setShowModalUpdate()
    }

    return (
		<div className="main-page">
            <div style={{ width:'100%' }}>
                <div className="blog-post">

                    <Alert
                        alertState={AlertState}
                        onConfirm={() => handleConfirmAlert(AlertState)}
                        onCancel={() => setShowAlert(false)}
                        onEscapeKey={() => setShowAlert(false)}
                        onOutsideClick={() => setShowAlert(false)}
                        showAlert={ShowAlert}
                        sessionMessage={SessionMessage}
                        successMessage={SuccessMessage}
                        errorMessageAlert={ErrorMessageAlert}
                        errorMessageAlertLogout={ErrorMessageAlertLogout}
                        validationMessage={ValidationMessage}
                        confirmMessage={ConfirmMessage}
                    />
                    
                    <div style={{ backgroundColor:'#FFFFFF', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>
                        <div>
                            <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        getListHeaderMenu(1, "", "", "", "")
                                    }}>
                                    <img src={IconRefresh} />
                                </div>
                            </div>
                        
                            <br />
                            <br />

                            <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}>Status</Th>
                                        <Th className="tabelHeader">Menu Name</Th>
                                        <Th className="tabelHeader">URL</Th>
                                        <Th className="tabelHeader">Tanggal Input</Th>
                                        {/* <Th className="tabelHeader">Action</Th> */}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Loading ? 
                                    <Tr>
                                        <td colSpan="9" align="center">
                                            <div className="loader-container">
                                                <div className="spinner" />
                                            </div>
                                        </td>
                                    </Tr>
                                    :
                                    ListHeaderMenu.length > 0 ? ListHeaderMenu.map((item,index)=>{
                                    return <Tr style={{
                                        marginBottom:20,
                                        borderBottomWidth:1,
                                        borderBottom:'1px solid #004372',
                                        borderLeftWidth:1,
                                        borderRightWidth:1,
                                    }}>
                                            {LoadingStatus && item.Id === Id ?
                                            <div className="loader-container-small">
                                                <div className="spinner-small" />
                                            </div>
                                            :
                                            <td style={{ paddingTop:20, paddingBottom:20, color:'#546E7A', borderTopLeftRadius:10, borderBottomLeftRadius:10 }}>
                                                {item.Status === "0" ?
                                                <img
                                                    src={IconUnactive}
                                                    style={{ width:30, height:30, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setId(item.Id)
                                                        handleChangeStatus(item.Id, item.Status)
                                                    }}
                                                />
                                                :
                                                <img
                                                    src={IconActive}
                                                    style={{ width:30, height:30, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setId(item.Id)
                                                        handleChangeStatus(item.Id, item.Status)
                                                    }}
                                                />
                                                }
                                            </td>
                                            }
                                            <td style={{ color:'#004175', fontWeight:'bold', paddingTop:20, paddingBottom:20, fontSize:15 }}>{item.MenuName}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20, fontSize:15 }}>{item.Url}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.TanggalInput}</td>
                                            {/* <td>
                                                <img
                                                    src={IconUpdateProduct}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setId(item.Id)
                                                        setShowModalUpdate(true)
                                                        getListHeaderMenu(1, "detail", "", "", item.Id)
                                                    }}
                                                />
                                            </td> */}
                                        </Tr>
                                    }) : <Tr><td colSpan="9" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                    }
                                </Tbody>
                            </Table>

                            <br/>
                            
                            <ModalUpdateHeaderMenu
                                showModal={ShowModalUpdate}
                                menuNameUpdate={MenuNameUpdate}
                                setMenuNameUpdate={event => setMenuNameUpdate(event.target.value)}
                                onClickCancel={() => handleCancelUpdate()}
                                onClickUpdate={() => handleUpdate("", "", "")}
                            />

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
		</div>
    )
}

export default ListHeaderMenu