import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Input, Dropdown, Alert, ModalAddNewHero, ModalUpdateHero, ModalAddNewOurProduct, ModalUpdateOurProduct, PopupImagePreview } from '../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';
import 'react-loading-skeleton/dist/skeleton.css'
import { IconActive, IconAddNewProduct, IconRefresh, IconTrash, IconUnactive, IconUpdateProduct } from '../../../assets';

const ListProduct = () => {
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
    const [isPopupOpen, setIsPopupOpen] = useState(false)

	const [ListProduct, setListProduct] = useState([])
    const [Id, setId] = useState("")
    const [ImagePreview, setImagePreview] = useState("")

    // ---------- filter & search ----------
    const [TitleSearch, setTitleSearch] = useState("")
    const [StatusFilter, setStatusFilter] = useState("")
    // ---------- end of filter & search ----------

    // ---------- add new -----------
    const [ShowModalAddNew, setShowModalAddNew] = useState(false)

    const [ImageBase64, setImageBase64] = useState("")
    const [ImageAddNew, setImageAddNew] = useState(null)
    const [ImageFileName, setImageFileName] = useState(null)
    const [PreviewUrl, setPreviewUrl] = useState(null)
    const [TitleAddNew, setTitleAddNew] = useState("")
    // ---------- end of add new -----------

    // ---------- update -----------
    const [ShowModalUpdate, setShowModalUpdate] = useState(false)

    const [TitleUpdate, setTitleUpdate] = useState("");
    const [DescriptionUpdate, setDescriptionUpdate] = useState("")
    const [ImagesPreviewUpdate, setImagesPreviewUpdate] = useState("")
    const [ImageFileNameUpdate, setImageFileNameUpdate] = useState("")
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
            dispatch(setForm("PageActive","HOME"))
            dispatch(setForm("SubPageActive","OUR-PRODUCTS"))

            getListProduct(1, "", "", "")
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
    const getListProduct = (page, position, searchValue, searchType, id) => {

        setShowAlert(false)

        var SearchTitle = ""
        var SearchDesc = ""
        var FilterStatus = ""

        if (position === "reset-filter") {
            // setFilter("")
            // setSearch("")
            // setFilterStatus("")
        } else {
            if (searchType !== "") {
                if (searchType === "title") {
                    SearchTitle = searchValue
                } else if (searchType === "status") {
                    setStatusFilter(searchValue)
                    FilterStatus = searchValue
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
                "OrderBy": "tgl_input",
                "Order": "DESC"
            })
        } else {
            requestBody = JSON.stringify({
                "Username": CookieUsername,
                "ParamKey": CookieParamKey,
                "Method": "SELECT",
                "Title": SearchTitle,
                "Status": FilterStatus,
                "Page": page,
                "RowPage": 2,
                "OrderBy": "tgl_input",
                "Order": "DESC"
            })
        }

		var url = paths.URL_API_ADMIN + 'ProductHome';
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
                    setTitleUpdate(data.Result[0].Title)
                    setImagesPreviewUpdate(data.Result[0].Images)
                    setImageFileNameUpdate(data.Result[0].FileNameImage)
                } else {
                    setListProduct(data.Result)
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

        if (PreviewUrl == "") {
            errorMessage += "\n Image can't null value"
        }

        if (TitleAddNew == "") {
            errorMessage += "\n Title can't null value"
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
            "FileNameImage": ImageFileName,
            "Base64DataImage": ImageBase64,
            "Title": TitleAddNew
        })

		var url = paths.URL_API_ADMIN + 'ProductHome';
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
                setImageAddNew(null)
                setPreviewUrl(null)
                setImageFileName('')
                setTitleAddNew("")
                setAlertTitle(false)
                setShowModalAddNew(false)
                setAlertState("success")
                setSuccessMessage("Success insert data")
                setShowAlert(true)
                getListProduct(1, "", "", "", "")
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

		var url = paths.URL_API_ADMIN + 'ProductHome';
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
                getListProduct(1, "", "", "", "")
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

        var idProduct = ""
        var errorMessage = ""
        if (paramUpdate == "status") {
            idProduct = id
            if (status == "") {
                errorMessage += "\n Status can't null value"
            }
        } else {
            idProduct = Id
            if (PreviewUrl == "") {
                errorMessage += "\n Image can't null value"
            }
    
            if (TitleUpdate == "") {
                errorMessage += "\n Title can't null value"
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
            "ParamUpdate": paramUpdate,
            "Id": idProduct,
            "FileNameImageOld": ImageFileNameUpdate,
            "FileNameImage": ImageFileName,
            "Base64DataImage": ImageBase64,
            "Title": TitleUpdate,
            "Description": DescriptionUpdate,
            "Status": status
        })

		var url = paths.URL_API_ADMIN + 'ProductHome'
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
                setPreviewUrl(null)
                setImageFileName('')
                setTitleUpdate("")
                setDescriptionUpdate("")
                setAlertTitle(false)
                setShowModalUpdate(false)

                setAlertState("success")
                setSuccessMessage("Success update data")
                setShowAlert(true)
                getListProduct(1, "", "", "", "")
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
        var vListProduct = ListProduct

        var vStatus = ""
        if (status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListProduct.map((item,index) => {
            if (item.Id === id) {
                vListProduct[index].Status = vStatus
                handleUpdate(vStatus, "status", id)
            }
        })
        setListProduct(vListProduct)
    }

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListProduct([])
        getListProduct(currentPage, "", "", "", "")
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

    const handleImageChange = (event) => {
        const selectedImage = event.target.files[0];
        var imageSize = selectedImage.size
        var imageType = selectedImage.type

        if (imageSize < 500000) {
            if (selectedImage) {
                setImageAddNew(selectedImage)
                setImageFileName(selectedImage.name)
        
                // Create a preview URL
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPreviewUrl(reader.result)
                    var base64DataNew = ""
                    var returnBase64Data = reader.result
                    if (imageType == "image/png") {
                        var base64DataSplit = returnBase64Data.split('image/png;base64,')
                        base64DataNew = base64DataSplit[1]
                    } else if (imageType == "image/jpeg") {
                        var base64DataSplit = returnBase64Data.split('image/jpeg;base64,')
                        base64DataNew = base64DataSplit[1]
                    } else if (imageType == "image/webp") {
                        var base64DataSplit = returnBase64Data.split('image/webp;base64,')
                        base64DataNew = base64DataSplit[1]
                    }
                    setImageBase64(base64DataNew)
                };
                reader.readAsDataURL(selectedImage)
            } else {
                setImageAddNew(null)
                setPreviewUrl(null)
                setImageFileName('')
                setImageBase64('')
            }
        } else {
            setAlertState("error")
            setShowAlert(true)
            setErrorMessageAlert("image can't more than 500kb")
            return
        }
    }

    const handleClearImage = () => {
        setImageAddNew(null)
        setPreviewUrl(null)
        setImageFileName('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleCancelAddNew = () => {
        setImageAddNew(null)
        setPreviewUrl(null)
        setImageFileName('')
        setTitleAddNew("")
        setAlertTitle(false)
        setShowModalAddNew(false)
    }

    const handleCancelUpdate = () => {
        setId("")
        setImageFileName('')
        setTitleUpdate("")
        setImagesPreviewUpdate("")
        setAlertTitle(false)
        setShowModalUpdate()
    }

    const handleTogglePopup = (image) => {
        setImagePreview(image)
        setIsPopupOpen(!isPopupOpen)
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
                                        getListProduct(1, "", "", "", "")
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
                                        <Th className="tabelHeader">
                                            <Dropdown onChange={event => {
                                                getListProduct(1, "", event.target.value, "status", "")
                                            }}>
                                                <option value="">Status</option>
                                                <option value="1">Aktif</option>
                                                <option value="0">Tidak Aktif</option>
                                            </Dropdown>
                                        </Th>
                                        <Th className="tabelHeader">Image</Th>
                                        <Th className="tabelHeader">
                                            <Input
                                                value={TitleSearch}
                                                onChange={event => setTitleSearch(event.target.value)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter') {
                                                        getListProduct(1, "", event.target.value, "title", "")
                                                        event.target.blur()
                                                    }
                                                }}
                                                placeHolder={'Title'}
                                            />
                                        </Th>
                                        <Th className="tabelHeader">Order Image</Th>
                                        <Th className="tabelHeader">Input Date</Th>
                                        <Th className="tabelHeader" colSpan={3}>Action</Th>
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
                                    ListProduct.length > 0 ? ListProduct.map((item,index)=>{
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
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>
                                                <img src={item.Images} style={{ maxWidth:300, maxHeight:300 }} onClick={() => handleTogglePopup(item.Images)} className="clickable-image" />
                                            </td>
                                            <td style={{ color:'#004175', fontWeight:'bold', paddingTop:20, paddingBottom:20 }}>{item.Title}</td>
                                            <td style={{ color:'#004175', fontWeight:'bold', paddingTop:20, paddingBottom:20 }}>{item.OrderProduct}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.TanggalInput}</td>
                                            <td>
                                                <img 
                                                    src={IconUpdateProduct}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setId(item.Id)
                                                        setShowModalUpdate(true)
                                                        getListProduct(1, "detail", "", "", item.Id)
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
                                                        setConfirmMessage("Are you sure want to delete \n" + item.Title + "?")
                                                    }}
                                                />
                                            </td>
                                        </Tr>
                                    }) : <Tr><td colSpan="9" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                    }
                                </Tbody>
                            </Table>

                            <br/>

                            <ModalAddNewOurProduct
                                showModal={ShowModalAddNew}
                                onChangeImage={event => handleImageChange(event)}
                                fileInputRef={fileInputRef}
                                previewUrl={PreviewUrl}
                                onClickClearImage={() => handleClearImage()}
                                titleAddNew={TitleAddNew}
                                setTitleAddNew={event => setTitleAddNew(event.target.value)}
                                alertTitle={AlertTitle}
                                setAlertTitle={() => setAlertTitle(false)}
                                onClickCancel={() => handleCancelAddNew()}
                                onClickAddNew={() => handleAddNew()}
                            />
                            
                            <ModalUpdateOurProduct
                                showModal={ShowModalUpdate}
                                onChangeImage={event => handleImageChange(event)}
                                fileInputRef={fileInputRef}
                                heroImagePreview={ImagesPreviewUpdate}
                                previewUrl={PreviewUrl}
                                onClickClearImage={() => handleClearImage()}
                                titleUpdate={TitleUpdate}
                                setTitleUpdate={event => setTitleUpdate(event.target.value)}
                                alertHeroTitle={AlertTitle}
                                setAlertTitle={() => setAlertTitle(false)}
                                onClickCancel={() => handleCancelUpdate()}
                                onClickUpdate={() => handleUpdate("", "", "")}
                            />
                            
                            <PopupImagePreview
                                isPopupOpen={isPopupOpen}
                                togglePopup={handleTogglePopup}
                                image={ImagePreview}
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

export default ListProduct