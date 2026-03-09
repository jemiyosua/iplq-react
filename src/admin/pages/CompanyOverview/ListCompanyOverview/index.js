import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Input, Dropdown, Alert, ModalAddNewHero, ModalUpdateHero, ModalUpdateCompanyOverview, PopupImagePreview } from '../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';
import 'react-loading-skeleton/dist/skeleton.css'
import { IconActive, IconAddNewProduct, IconRefresh, IconTrash, IconUnactive, IconUpdateProduct } from '../../../assets';

function ListCompanyOverview() {
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
    const [isPopupOpen, setIsPopupOpen] = useState(false);

	const [ListCompanyOverview, setListCompanyOverview] = useState([])
    const [Id, setId] = useState("")
    const [StatusFilter, setStatusFilter] = useState("")
    const [ImagePreview, setImagePreview] = useState("")

    // ---------- add new -----------
    const [ImageBase64, setImageBase64] = useState("")
    const [ImageAddNew, setImageAddNew] = useState(null)
    const [ImageFileName, setImageFileName] = useState(null)
    const [PreviewUrl, setPreviewUrl] = useState(null)
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
            dispatch(setForm("PageActive","ABOUT-US"))
            dispatch(setForm("SubPageActive","COMPANY-OVERVIEW"))

            getCompanyOverview(1, "", "", "")
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
    const getCompanyOverview = (page, position, searchValue, searchType, id) => {

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

		var url = paths.URL_API_ADMIN + 'CompanyOverview';
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
                    setListCompanyOverview(data.Result)
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
            setErrorMessageAlert(errorMessage);
            setShowAlert(true);
            return
        }

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "Username": CookieUsername,
            "ParamKey": CookieParamKey,
            "Id": Id,
            "Method": "UPDATE",
            "FileNameImageOld": ImageFileNameUpdate,
            "FileNameImage": ImageFileName,
            "Base64DataImage": ImageBase64,
            "Title": TitleUpdate,
            "Description": DescriptionUpdate
        })

		var url = paths.URL_API_ADMIN + 'CompanyOverview';
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
                getCompanyOverview(1, "", "", "", "")
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
        var vListCompanyOverview = ListCompanyOverview

        var vStatus = ""
        if (StatusFilter === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListCompanyOverview.map((item,index) => {
            if (item.Id === id) {
                vListCompanyOverview[index].Status = vStatus
                // updateStatusProduk(id, Status)
            }
        })
        setListCompanyOverview(vListCompanyOverview)
    }

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListCompanyOverview([])
        getCompanyOverview(currentPage, "", "", "", "")
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

    const handleCancelUpdate = () => {
        setId("")
        setImageFileName('')
        setTitleUpdate("")
        setDescriptionUpdate("")
        setImagesPreviewUpdate("")
        setAlertTitle(false)
        setAlertDescription(false)
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
                                        getCompanyOverview(1, "", "", "", "")
                                    }}>
                                    <img src={IconRefresh} />
                                </div>
                            </div>
                        
                            <br />
                            <br />

                            <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        {/* <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}>Status</Th> */}
                                        <Th className="tabelHeader">Images</Th>
                                        <Th className="tabelHeader">Title</Th>
                                        <Th className="tabelHeader">Description</Th>
                                        <Th className="tabelHeader">Tanggal Input</Th>
                                        <Th className="tabelHeader">Action</Th>
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
                                    ListCompanyOverview.length > 0 ? ListCompanyOverview.map((item,index)=>{
                                    return <Tr style={{
                                        marginBottom:20,
                                        borderBottomWidth:1,
                                        borderBottom:'1px solid #004372',
                                        borderLeftWidth:1,
                                        borderRightWidth:1,
                                    }}>
                                            {/* {LoadingStatus && item.Id === Id ?
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
                                            } */}
                                            <td style={{ paddingTop:20, paddingBottom:20, textAlign:'center' }}>
                                                <img src={item.Images} style={{ maxWidth:300, maxHeight:300 }} onClick={() => handleTogglePopup(item.Images)} className="clickable-image" />
                                            </td>
                                            <td style={{ color:'#004175', fontWeight:'bold', paddingTop:20, paddingBottom:20 }}>{item.Title}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.Description}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.TanggalInput}</td>
                                            <td>
                                                <img 
                                                    src={IconUpdateProduct}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setId(item.Id)
                                                        setShowModalUpdate(true)
                                                        getCompanyOverview(1, "detail", "", "", item.Id)
                                                    }}
                                                />
                                            </td>
                                        </Tr>
                                    }) : <Tr><td colSpan="9" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                    }
                                </Tbody>
                            </Table>

                            <br/>
                            
                            <ModalUpdateCompanyOverview
                                showModal={ShowModalUpdate}
                                onChangeImage={event => handleImageChange(event)}
                                fileInputRef={fileInputRef}
                                imagePreview={ImagesPreviewUpdate}
                                previewUrl={PreviewUrl}
                                onClickClearImage={() => handleClearImage()}
                                titleUpdate={TitleUpdate}
                                setTitleUpdate={event => setTitleUpdate(event.target.value)}
                                alertTitle={AlertTitle}
                                setAlertTitle={() => setAlertTitle(false)}
                                descriptionUpdate={DescriptionUpdate}
                                setDescriptionUpdate={event => setDescriptionUpdate(event.target.value)}
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

export default ListCompanyOverview