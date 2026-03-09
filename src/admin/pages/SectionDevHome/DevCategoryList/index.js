import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Input, Dropdown, Alert, ModalAddNewCategoryDev, ModalUpdateCategoryDev } from '../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';
import 'react-loading-skeleton/dist/skeleton.css'
import { IconActive, IconAddNewProduct, IconEye, IconRefresh, IconTrash, IconUnactive, IconUpdateProduct } from '../../../assets';
import DevImageList from '../DevImageList';

const DevCategoryList = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Loading, setLoading] = useState(false)
	const [LoadingStatus, setLoadingStatus] = useState(false)

	const [ListCategoryDev, setListCategoryDev] = useState([])
    const [Id, setId] = useState("")
    const [CategoryName, setCategoryName] = useState("")
    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")

    // ---------- filter & search ----------
    const [CategoryNameSearch, setCategoryNameSearch] = useState("")
    const [StatusFilter, setStatusFilter] = useState("")
    // ---------- end of filter & search ----------

    // ---------- add new -----------
    const [ShowModalAddNew, setShowModalAddNew] = useState(false)

    const [CategoryNameAddNew, setCategoryNameAddNew] = useState("")
    // ---------- end of add new -----------

    // ---------- update -----------
    const [ShowModalUpdate, setShowModalUpdate] = useState(false)

    const [CategoryNameUpdate, setCategoryNameUpdate] = useState("")
    // ---------- end of update ----------
	
    // ---------- alert ----------
    const [AlertState, setAlertState] = useState("")
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ConfirmMessage, setConfirmMessage] = useState("")

    const [AlertCategoryName, setAlertCategoryName] = useState(false)
    // ---------- end of alert ----------

    const [PageCategory, setPageCategory] = useState(true)
    const [PageImage, setPageImage] = useState(false)

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
            dispatch(setForm("PageActive","HOME"))
            dispatch(setForm("SubPageActive","DEV-SECTION"))

            getListCategoryDev(1, "", "", "")
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
    const getListCategoryDev = (page, position, searchValue, searchType, id) => {

        setShowAlert(false)

        var searchCategoryName = ""
        var filterStatus = ""

        if (position === "reset-filter") {
        } else {
            if (searchType !== "") {
                if (searchType === "category_name") {
                    searchCategoryName = searchValue
                } else if (searchType === "status") {
                    setStatusFilter(searchValue)
                    filterStatus = searchValue
                }
            }
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
                "Name": searchCategoryName,
                "Status": filterStatus,
                "Page": page,
                "RowPage": 5,
                "OrderBy": "",
                "Order": ""
            })
        }

		var url = paths.URL_API_ADMIN + 'CategoryDevelopments'
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
                    setCategoryNameUpdate(data.Result[0].Name)
                } else {
                    setListCategoryDev(data.Result)
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

    const handleAddNew = () => {

        var errorMessage = ""
        if (CategoryNameAddNew == "") {
            errorMessage += "- Category Name can't null value \n"
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
            "Method": "INSERT",
            "Name": CategoryNameAddNew
        })

		var url = paths.URL_API_ADMIN + 'CategoryDevelopments';
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
                setCategoryNameAddNew("")
                setAlertCategoryName(false)
                setShowModalAddNew(false)
                setAlertState("success")
                setSuccessMessage("Success insert data")
                setShowAlert(true)
                getListCategoryDev(1, "", "", "", "")
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

    const handleDelete = () => {

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "Username": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "DELETE",
            "Id": Id
        })

		var url = paths.URL_API_ADMIN + 'CategoryDevelopments';
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
                setConfirmMessage("")
                setAlertState("success")
                setSuccessMessage("Success delete data")
                setShowAlert(true)
                getListCategoryDev(1, "", "", "", "")
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

        var idCategory = ""
        var errorMessage = ""
        if (paramUpdate == "status") {
            idCategory = id
            if (status == "") {
                errorMessage += "- Status can't null value \n"
            }
        } else {
            idCategory = Id
            if (CategoryNameUpdate == "") {
                errorMessage += "- Category Name can't null value \n"
            }
        }

        if (errorMessage != "") {
            setAlertState("error")
            setErrorMessageAlert(errorMessage)
            setShowAlert(true)
            return
        }

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "Username": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "UPDATE",
            "ParamUpdate": paramUpdate,
            "Id": idCategory,
            "Name": CategoryNameUpdate,
            "Status": status
        })

		var url = paths.URL_API_ADMIN + 'CategoryDevelopments'
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
                setCategoryNameAddNew("")
                setAlertCategoryName(false)
                setShowModalUpdate(false)
                
                setAlertState("success")
                setSuccessMessage("Success update data")
                setShowAlert(true)
                getListCategoryDev(1, "", "", "", "")
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
        var vListCategoryDev = ListCategoryDev

        var vStatus = ""
        if (status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListCategoryDev.map((item,index) => {
            if (item.Id === id) {
                vListCategoryDev[index].Status = vStatus
                handleUpdate(vStatus, "status", id)
            }
        })
        setListCategoryDev(vListCategoryDev)
    }

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListCategoryDev([])
        getListCategoryDev(currentPage, "", "", "", "")
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
            handleDelete()
        }
    }

    const handleCancelAddNew = () => {
        setCategoryNameAddNew("")
        setAlertCategoryName(false)
        setShowModalAddNew(false)
    }

    const handleCancelUpdate = () => {
        setId("")
        setCategoryNameAddNew("")
        setAlertCategoryName(false)
        setShowModalAddNew(false)
        setShowModalUpdate(false)
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
                    
                    {PageImage ?
                    <div style={{ backgroundColor:'#FFFFFF', width:'100%', borderTopRightRadius:25, padding:20 }}>
                        <DevImageList 
                            categoryId={Id}
                            categoryName={CategoryName} 
                            onClickBack={() => {
                                setPageCategory(true)
                                setPageImage(false)
                            }} 
                        />
                    </div>
                    :
                    <div style={{ backgroundColor:'#FFFFFF', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>
                        <div>
                            <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        getListCategoryDev(1, "", "", "", "")
                                    }}>
                                    <img src={IconRefresh} />
                                </div>
                                <div style={{  marginLeft:20  }} />
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        setShowModalAddNew(true)
                                    }}>
                                    <img style={{ width:25 }} src={IconAddNewProduct} />
                                </div>
                            </div>
                        
                            <br />
                            <br />

                            <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader" style={{ width:100 }}>
                                            <Dropdown onChange={event => {
                                                getListCategoryDev(1, "", event.target.value, "status", "")
                                            }}>
                                                <option value="">Status</option>
                                                <option value="1">Aktif</option>
                                                <option value="0">Tidak Aktif</option>
                                            </Dropdown>
                                        </Th>
                                        <Th className="tabelHeader">
                                            <Input
                                                value={CategoryNameSearch}
                                                onChange={event => setCategoryNameSearch(event.target.value)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter') {
                                                        getListCategoryDev(1, "", event.target.value, "category_name", "")
                                                        event.target.blur()
                                                    }
                                                }}
                                                placeHolder={'Category Name'}
                                            />
                                        </Th>
                                        <Th className="tabelHeader">Input Date</Th>
                                        <Th className="tabelHeader" colSpan={2}>Action</Th>
                                    </Tr>
                                </Thead>
                                {/* <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}><LabelTH>Status</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Produk Id</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Nama Produk</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Kategori Produk</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>User Input</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Tanggal Update</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Tanggal Input</LabelTH></Th>
                                        <Th className="tabelHeader" colSpan={2}><LabelTH>Action</LabelTH></Th>
                                    </Tr>
                                </Thead> */}
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
                                    ListCategoryDev.length > 0 ? ListCategoryDev.map((item,index)=>{
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
                                            <td style={{ paddingTop:20, paddingBottom:20, color:'#546E7A', borderTopLeftRadius:10, borderBottomLeftRadius:10, textAlign:'center' }}>
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
                                            <td style={{ color:'#004175', fontWeight:'bold', paddingTop:20, paddingBottom:20 }}>{item.Name}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.TanggalInput}</td>
                                            <td>
                                                <img
                                                    src={IconEye}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setId(item.Id)
                                                        setCategoryName(item.Name)
                                                        getListCategoryDev(1, "detail", "", "", item.Id)
                                                        setPageImage(true)
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <img
                                                    src={IconUpdateProduct}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setId(item.Id)
                                                        setShowModalUpdate(true)
                                                        getListCategoryDev(1, "detail", "", "", item.Id)
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <img
                                                    src={IconTrash}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setAlertState("confirm")
                                                        setId(item.Id)
                                                        setShowAlert(true)
                                                        setConfirmMessage("Are you sure want to delete \n" + item.Name + "?")
                                                    }}
                                                />
                                            </td>
                                        </Tr>
                                    }) : <Tr><td colSpan="9" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                    }
                                </Tbody>
                            </Table>

                            <br/>

                            <ModalAddNewCategoryDev
                                showModal={ShowModalAddNew}
                                categoryNameAddNew={CategoryNameAddNew}
                                setCategoryNameAddNew={event => setCategoryNameAddNew(event.target.value)}
                                alertCategoryName={AlertCategoryName}
                                setAlertCategoryName={() => setAlertCategoryName(false)}
                                onClickCancel={() => handleCancelAddNew()}
                                onClickAddNew={() => handleAddNew()}
                            />
                            
                            <ModalUpdateCategoryDev
                                showModal={ShowModalUpdate}
                                categoryNameUpdate={CategoryNameUpdate}
                                setCategoryNameUpdate={event => setCategoryNameUpdate(event.target.value)}
                                alertCategoryName={AlertCategoryName}
                                setAlertCategoryName={() => setAlertCategoryName(false)}
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
                    }
                </div>
            </div>
		</div>
    )
}

export default DevCategoryList;