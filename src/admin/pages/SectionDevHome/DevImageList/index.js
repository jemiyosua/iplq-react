import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Input, Dropdown, Alert, ModalAddNewHero, ModalUpdateHero, Gap, ModalAddNewImageDev, ModalUpdateImageDev, PopupImagePreview } from '../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';
import 'react-loading-skeleton/dist/skeleton.css'
import { IconActive, IconAddNewProduct, IconRefresh, IconTrash, IconUnactive, IconUpdateProduct } from '../../../assets';
import { FaArrowCircleLeft, FaRegArrowAltCircleLeft } from 'react-icons/fa';

const DevImageList = ({ categoryId, categoryName, onClickBack }) => {
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

	const [ListImageCategory, setListImageCategory] = useState([])
    const [Id, setId] = useState("")
    const [ImageId, setImageId] = useState("")
    const [ImagePreview, setImagePreview] = useState("")

    // ---------- filter & search ----------
    const [HeroTitleSearch, setHeroTitleSearch] = useState("")
    const [HeroDescriptionSearch, setHeroDescriptionSearch] = useState("")
    const [StatusFilter, setStatusFilter] = useState("")
    // ---------- end of filter & search ----------

    // ---------- add new hero -----------
    const [ShowModalAddNew, setShowModalAddNew] = useState(false)

    const [ImageBase64, setImageBase64] = useState("")
    const [ImageAddNew, setImageAddNew] = useState(null)
    const [ImageFileName, setImageFileName] = useState(null)
    const [PreviewUrl, setPreviewUrl] = useState(null)
    const [TitleAddNew, setTitleAddNew] = useState("")
    const [DescriptionAddNew, setDescriptionAddNew] = useState("")
    // ---------- end of add new hero -----------

    // ---------- update hero -----------
    const [ShowModalUpdate, setShowModalUpdate] = useState(false)

    const [ImageUpdate, setImageUpdate] = useState(null)
    const [TitleUpdate, setTitleUpdate] = useState("");
    const [DescriptionUpdate, setDescriptionUpdate] = useState("")
    const [ImagesPreviewUpdate, setImagesPreviewUpdate] = useState("")
    const [ImageFileNameUpdate, setImageFileNameUpdate] = useState("")
    // ---------- end of update hero ----------

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

    const [AlertImage, setAlertImage] = useState(false)
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
            dispatch(setForm("PageActive","HOME"))
            dispatch(setForm("SubPageActive","DEV-SECTION"))
            
            getListImageCatgory(1, "", "")
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
    const getListImageCatgory = (page, position, id) => {

        setShowAlert(false)

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

        if (position == "detail") {
            requestBody = JSON.stringify({
                "Username": CookieUsername,
                "ParamKey": CookieParamKey,
                "Method": "SELECT",
                "Id": id,
                "CategoryId": categoryId,
                "Page": 1,
                "RowPage": 1,
                "OrderBy": "",
                "Order": ""
            })
        } else {
            var requestBody = JSON.stringify({
                "Username": CookieUsername,
                "ParamKey": CookieParamKey,
                "Method": "SELECT",
                "CategoryId": categoryId,
                "Page": page,
                "RowPage": 2,
                "OrderBy": "",
                "Order": ""
            })
        }

		var url = paths.URL_API_ADMIN + 'DevelopmentSection';
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
                    setDescriptionUpdate(data.Result[0].Description)
                    setImagesPreviewUpdate(data.Result[0].Images)
                    setImageFileNameUpdate(data.Result[0].FileNameImage)
                } else {
                    setListImageCategory(data.Result)
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
            "CategoryId": categoryId,
            "Title": TitleAddNew,
            "Description": DescriptionAddNew,
            "FileNameImage": ImageFileName,
            "Base64DataImage": ImageBase64
        })

		var url = paths.URL_API_ADMIN + 'DevelopmentSection';
        console.log(url)
		var Signature  = generateSignature(requestBody)

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
                setImageAddNew(null)
                setPreviewUrl(null)
                setImageFileName('')
                setAlertImage(false)
                setShowModalAddNew(false)

                setAlertState("success")
                setSuccessMessage("Success insert data")
                setShowAlert(true)
                getListImageCatgory(1, "", "")
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
            "Id": ImageId,
            "CategoryId": categoryId
        })

		var url = paths.URL_API_ADMIN + 'DevelopmentSection';
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
                getListImageCatgory(1, "", "")
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

    const handleUpdate = () => {

        var errorMessage = ""
        if (PreviewUrl == "") {
            errorMessage += "\n Image can't null value"
        } 

        if (TitleUpdate == "") {
            errorMessage += "\n Title can't null value"
        }

        if (DescriptionUpdate == "") {
            errorMessage += "\n Description can't null value"
        }

        if (errorMessage != "") {
            setAlertState("error")
            setErrorMessageAlert(errorMessage)
            setShowAlert(true)
            return
        }

        var CookieParamKey = getCookie("paramkey")
        var CookieUsername = getCookie("username")

		var requestBody = JSON.stringify({
            "Username": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "UPDATE",
            "Id": Id,
            "CategoryId": categoryId,
            "FileNameImageOld": ImageFileNameUpdate,
            "FileNameImage": ImageFileName,
            "Base64DataImage": ImageBase64,
            "Title": TitleUpdate,
            "Description": DescriptionUpdate
        })

		var url = paths.URL_API_ADMIN + 'DevelopmentSection'
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
                setAlertDescription(false)
                setShowModalUpdate(false)

                setAlertState("success")
                setSuccessMessage("Success update data")
                setShowAlert(true)
                getListImageCatgory(1, "", "")
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

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListImageCategory([])
        getListImageCatgory(currentPage, "", "")
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
        setImageBase64('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleCancelAddNew = () => {
        setImageAddNew(null)
        setPreviewUrl(null)
        setImageFileName("")
        setImageBase64("")
        setTitleAddNew("")
        setDescriptionAddNew("")
        setAlertTitle(false)
        setAlertDescription(false)
        setAlertImage(false)
        setShowModalAddNew(false)
    }

    const handleCancelUpdate = () => {
        setImageUpdate(null)
        setPreviewUrl(null)
        setImageFileName("")
        setImageBase64("")
        setTitleAddNew("")
        setDescriptionAddNew("")
        setAlertTitle(false)
        setAlertDescription(false)
        setAlertImage(false)
        setShowModalUpdate(false)
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
                    
                    <div style={{ backgroundColor:'#FFFFFF', width:'100%', borderTopRightRadius:25 }}>
                        <div>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                <div style={{ display:'flex', alignItems:'center', backgroundColor:'#004175', padding:10, borderRadius:40, cursor:'pointer' }} onClick={onClickBack}>
                                    <FaRegArrowAltCircleLeft style={{ color:'#FFFFFF' }} /> 
                                    <Gap width={10} />
                                    <div style={{ fontSize:15, color:'#FFFFFF' }}>{'Category : ' + categoryName}</div>
                                </div>
                                <div style={{ display:'flex', alignItems:'center' }}>
                                    <div
                                        style={{ cursor:'pointer' }}
                                        onClick={() => {
                                            getListImageCatgory(1, "", "")
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
                            </div>
                            
                            <br />
                            <br />

                            <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}>Images Now</Th>
                                        <Th className="tabelHeader">Title</Th>
                                        <Th className="tabelHeader">Description</Th>
                                        <Th className="tabelHeader">Order Image</Th>
                                        <Th className="tabelHeader" colSpan={2}>Action</Th>
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
                                    ListImageCategory.length > 0 ? ListImageCategory.map((item,index)=>{
                                    return <Tr style={{
                                        marginBottom:20,
                                        borderBottomWidth:1,
                                        borderBottom:'1px solid #004372',
                                        borderLeftWidth:1,
                                        borderRightWidth:1,
                                    }}>
                                        <td style={{ paddingTop:20, paddingBottom:20 }}>
                                            <img src={item.Images} style={{ maxWidth:300, maxHeight:300 }} onClick={() => handleTogglePopup(item.Images)} className="clickable-image" />
                                        </td>
                                        <td style={{ color:'#004175', fontWeight:'bold', paddingTop:20, paddingBottom:20 }}>{item.Title}</td>
                                        <td style={{ paddingTop:20, paddingBottom:20 }}>{item.Description}</td>
                                        <td style={{ color:'#004175', fontWeight:'bold', paddingTop:20, paddingBottom:20 }}>{item.OrderDev}</td>
                                        <td>
                                            <img
                                                src={IconUpdateProduct}
                                                style={{ height:20, width:20, cursor:'pointer' }}
                                                onClick={() => {
                                                    setId(item.Id)
                                                    setShowModalUpdate(true)
                                                    getListImageCatgory(1, "detail", item.Id)
                                                }}
                                            />
                                        </td>
                                        {item.OrderDev != 1 &&
                                        <td>
                                            <img 
                                                src={IconTrash}
                                                style={{ height:20, width:20, cursor:'pointer' }}
                                                onClick={() => {
                                                    setAlertState("confirm")
                                                    setImageId(item.Id)
                                                    setShowAlert(true)
                                                    setConfirmMessage("Are you sure want to delete \n" + item.Title + "?")
                                                }}
                                            />
                                        </td>}
                                        
                                    </Tr>
                                    }) : <Tr><td colSpan="9" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                    }
                                </Tbody>
                            </Table>

                            <br/>

                            <ModalAddNewImageDev
                                showModal={ShowModalAddNew}
                                onChangeImage={event => handleImageChange(event)}
                                fileInputRef={fileInputRef}
                                previewUrl={PreviewUrl}
                                onClickClearImage={() => handleClearImage()}
                                titleAddNew={TitleAddNew}
                                setTitleAddNew={event => setTitleAddNew(event.target.value)}
                                descriptionAddNew={DescriptionAddNew}
                                setDescriptionAddNew={event => setDescriptionAddNew(event.target.value)}
                                alertImage={AlertImage}
                                setAlertImage={() => setAlertImage(false)}
                                alertTitle={AlertTitle}
                                setAlertTitle={() => setAlertTitle(false)}
                                alertDescription={AlertDescription}
                                setAlertDescription={() => setAlertDescription(false)}
                                onClickCancel={() => handleCancelAddNew()}
                                onClickAddNew={() => handleAddNew()}
                            />
                            
                            <ModalUpdateImageDev
                                showModal={ShowModalUpdate}
                                onChangeImage={event => handleImageChange(event)}
                                fileInputRef={fileInputRef}
                                heroImagePreview={ImagesPreviewUpdate}
                                previewUrl={PreviewUrl}
                                onClickClearImage={() => handleClearImage()}
                                titleUpdate={TitleUpdate}
                                setTitleUpdate={event => setTitleUpdate(event.target.value)}
                                descriptionUpdate={DescriptionUpdate}
                                setDescriptionUpdate={event => setDescriptionUpdate(event.target.value)}
                                alertImage={AlertImage}
                                setAlertImage={() => setAlertImage(false)}
                                alertTitle={AlertTitle}
                                setAlertTitle={() => setAlertTitle(false)}
                                alertDescription={AlertDescription}
                                setAlertDescription={() => setAlertDescription(false)}
                                onClickCancel={() => handleCancelUpdate()}
                                onClickUpdate={() => handleUpdate()}
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

export default DevImageList;