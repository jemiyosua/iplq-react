import React, { useEffect, useState, useRef } from 'react';
import { IcArrowBlackHeader, ImgParkSerpong } from '../../../assets';
import './section-dev.css';
import './section-dev-image.css';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

function SectionDevelopments() {

    const [IdCategory, setIdCategory] = useState("1")
    const [CategoryName, setCategoryName] = useState("Township")
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isOpen, setIsOpen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [ListCategoryDev, setListCategoryDev] = useState([]);
    const [ListImageDev, setListImageDev] = useState([]);
    const [ListImageMainDev, setListImageMainDev] = useState([]);

    const childSectionRef = useRef(null);

    useEffect(() => {

        getListCategoryDev()
        getListImageDev("1")

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [])

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleCategory = (id, name) => {
        setCategoryName(name)
        setIdCategory(id)
        setIsDropdownOpen(!isDropdownOpen)
        getListImageDev(id)
    }

    const toggleRotation = () => {
        setIsRotated(!isRotated); // Toggle the rotation state
        setIsDropdownOpen(!isDropdownOpen);
    };

    const getListCategoryDev = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'ListCategoryDevHome';
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
                setListCategoryDev(data.Result)
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

    const getListImageDev = (catId) => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": "",
            "CategoryId": catId
        });

        var url = paths.URL_API_WEB + 'ListImageDevHome';
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
                setListImageDev(data.Result)
                setListImageMainDev(data.ResultMain)
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

    return (
        <div style={{ display:'flex', justifyContent:'center'}}>
            <div style={{ width:'95%' }}>
                {windowWidth > 1340 ?
                <div className="container-section-dev">
                    <div className="container-category-list">
                    
                    {ListCategoryDev.map((item,index) => {
                        return <div className="category-box" style={{ color:IdCategory == item.Id ? '#632B2B' : '#828282', border:IdCategory == item.Id && '1px solid black' }} onClick={() => handleCategory(item.Id, item.Name)}>
                        {item.Name}
                    </div>
                    })}
                    </div>
                </div>
                :
                <>
                    <div className="dropdown-container" onClick={toggleRotation} style={{ borderBottom:!isDropdownOpen && '1px solid #632B2B', marginBottom:!isDropdownOpen && 30 }}>
                        <div style={{ fontSize:22, fontWeight:400, color:'#632B2B' }}>{CategoryName}</div>
                        <div className={`arrow ${isRotated ? 'rotate' : ''}`} style={{ fontSize: '30px', cursor: 'pointer' }}>
                            <img src={IcArrowBlackHeader} />
                        </div>
                    </div>
                    {isDropdownOpen &&
                    <div className={`dropdown-container-down ${isDropdownOpen ? "open" : ""}`}>
                        {ListCategoryDev.map((item,index) => {
                            return <div style={{ fontSize:14, fontWeight:400, color:'#4F4F4F', padding:15, backgroundColor:IdCategory == item.Id && '#F2F2F2', borderTop:'.5px solid lightgrey' }} onClick={() => handleCategory(item.Id, item.Name)}>{item.Name}</div>
                        })}
                    </div>}
                </>
                }
                
                {windowWidth > 1340 ?
                <div className="layout-container-full">
                    {ListImageMainDev.map((item,index) => {
                        return <div className="large-image">
                            <img src={item.Images} />
                            <div className="caption">
                                <div style={{ fontSize:28, fontWeight:'400' }}>{item.Title}</div>
                                <div style={{ fontSize:24, fontWeight:'400', color:'#BDBDBD' }}>{item.Description}</div>
                            </div>
                        </div>
                    })}
                    <div className="grid-container">
                        {ListImageDev.map((item,index) => {
                            return <div className="grid-item">
                                <img src={item.Images} />
                                <div className="overlay-text">
                                    <h3>{item.Title}</h3>
                                    <p>{item.Description}</p>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                :
                <div className="layout-container-responsive">
                    {ListImageMainDev.map((item,index) => {
                        return <div className="large-image-responsive">
                            <img src={item.Images} />
                            <div className="caption-responsive">
                                <h2>{item.Title}</h2>
                                <p>{item.Description}</p>
                            </div>
                        </div>
                    })}

                    {ListImageDev.map((item,index) => {
                        return <>
                            <div style={{ padding:10 }} />
                            <div className="large-image-responsive">
                                <img src={item.Images} />
                                <div className="caption-responsive">
                                    <h2>{item.Title}</h2>
                                    <p>{item.Description}</p>
                                </div>
                            </div>
                        </>
                    })}

                </div>
                }
            </div>
        </div>
    )
}

export default SectionDevelopments;