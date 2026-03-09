import React, { useEffect, useState, useRef } from 'react';
import { IcArrowBlackHeader, ImgExprience, ImgHomeProvided, ImgParkSerpong, ImgProjectComplete, ImgTentangKamiDesc } from '../../../assets';
import './visi-misi.css';
import { Gap } from '../../atoms';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';
import { ContactSupportOutlined } from '@mui/icons-material';

function VisiMisi() {

    const [IdCategory, setIdCategory] = useState("1")
    const [CategoryName, setCategoryName] = useState("Township")
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isOpen, setIsOpen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const targetRef = useRef(null);
    const targetRef2 = useRef(null);
    const targetRef3 = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isVisible2, setIsVisible2] = useState(false);
    const [isVisible3, setIsVisible3] = useState(false);

    const [ListVM, setListVM] = useState([])
    const [ListCoreValues, setListCoreValues] = useState([])

    useEffect(() => {
        getVisiMisi()
        getCoreValues()
    }, [])

    useEffect(() => {
         // ---------- observer 1 ----------
         const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(targetRef.current); // Stop observing after it becomes visible
                }
            },
            {
                threshold: windowWidth > 1340 ? 0.5 : 0.1, // Trigger when 50% of the element is visible
            }
        );

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }
        // ---------- end of observer 1 ----------

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);

            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [ListVM])

    useEffect(() => {

        // ---------- observer 2 ----------
        const observer2 = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible2(true);
                    observer2.unobserve(targetRef2.current); // Stop observing after it becomes visible
                }
            },
            {
                threshold: windowWidth > 1340 ? 0.5 : 0.1, // Trigger when 50% of the element is visible
            }
        );

        if (targetRef2.current) {
            observer2.observe(targetRef2.current);
        }
        // ---------- end of observer 2 ----------

        // ---------- observer 3 ----------
        const observer3 = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible3(true);
                    observer3.unobserve(targetRef3.current); // Stop observing after it becomes visible
                }
            },
            {
                threshold: windowWidth > 1340 ? 0.5 : 0.1, // Trigger when 50% of the element is visible
            }
        );

        if (targetRef3.current) {
            observer3.observe(targetRef3.current);
        }
        // ---------- end of observer 3 ----------

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);

            if (targetRef2.current) {
                observer2.unobserve(targetRef2.current);
            }

            if (targetRef3.current) {
                observer3.unobserve(targetRef3.current);
            }
        };
    }, [ListCoreValues])

    const getVisiMisi = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'VisiMisi';
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
                setListVM(data.Result)
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

    const getCoreValues = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'CoreValues';
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
                setListCoreValues(data.Result)
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

    return (
        <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ width:'95%' }}>

                {windowWidth > 1340 ?
                <div className="layout-container-visi-misi">
                    <div className="content-visi-misi-title">Visi & Misi</div>

                    <div className="layout-content-visi-misi-right">
                        <div style={{ width:'70%' }}>

                            {/* ---------- visi misi ---------- */}
                            {ListVM.map((item,index) => {
                                return <>
                                    <div ref={targetRef} className={`box-title-vm ${isVisible ? 'show' : ''}`}>
                                        <div className="content-title-visi-misi">{item.Title}</div>
                                    </div>
                                    <div ref={targetRef} className={`box-desc-vm ${isVisible ? 'show' : ''}`}>
                                        <div className="content-desc-visi-misi">{item.Description}</div>
                                    </div>
                                    <div style={{ paddingTop:50 }} />
                                </>
                            })}
                            {/* <div ref={targetRef} className={`box-title ${isVisible ? 'show' : ''}`}>
                                <div className="content-title-visi-misi">Visi</div>
                            </div>
                            <div ref={targetRef} className={`box-desc ${isVisible ? 'show' : ''}`}>
                                <div className="content-desc-visi-misi">Menjadi perusahaan real estat terdepan dan terpercaya yang secara proaktif mendukung pertumbuhan ekonomi Indonesia serta meningkatkan kesejahteraan bagi pelanggan yang kami layani.</div>
                            </div>

                            <div style={{ paddingTop:50 }} />

                            <div ref={targetRef} className={`box-title ${isVisible ? 'show' : ''}`}>
                                <div className="content-title-visi-misi">Misi</div>
                            </div>
                            <div ref={targetRef} className={`box-desc ${isVisible ? 'show' : ''}`}>
                                <div className="content-desc-visi-misi">Membangun hunian berkualitas dan lingkungan yang berkelanjutan melalui peningkatan produk secara berkesinambungan serta memenangkan kepercayaan dan loyalitas pelanggan.</div>
                            </div>

                            <div style={{ paddingTop:20 }} />

                            <div ref={targetRef} className={`box-desc ${isVisible ? 'show' : ''}`}>
                                <div className="content-desc-visi-misi">Membangun organisasi yang berorientasi pada pengembangan talenta untuk mencapai potensi terbaik, guna memberikan dampak positif untuk kepentingan bersama.</div>
                            </div> */}
                            {/* ---------- end of visi misi ---------- */}

                            <Gap height={60} />

                            {/* ---------- nilai inti ---------- */}
                            <div className="content-title-visi-misi">Nilai Inti</div>

                            <Gap height={40} />

                            {ListCoreValues.map((item,index) => {
                                console.log(item.Title)
                                return <>
                                    <div style={{ display:'flex', alignItems:'center' }}>
                                        <div ref={targetRef3} className={`box-desc-vm ${isVisible3 ? 'show' : ''}`}>
                                            <div style={{ borderLeft:'1px solid #632B2B', height:60 }} />
                                        </div>

                                        <Gap width={20} />

                                        <div ref={targetRef2} className={`box-title-core-value ${isVisible2 ? 'show' : ''}`}>
                                            <div style={{ fontSize:28, fontWeight:400, color:'#632B2B' }}>{item.Title}</div>
                                            <div style={{ fontSize:20, fontWeight:400, color:'#4F4F4F' }}>{item.TitleDesc}</div>
                                        </div>
                                    </div>

                                    <Gap height={20} />

                                    <div ref={targetRef2} className={`box-title-core-value ${isVisible ? 'show' : ''}`}>
                                        <div className="content-desc-visi-misi">{item.Description}</div>
                                    </div>
                                    
                                    <Gap height={50} />
                                </>
                            })}
                            {/* ---------- end of nilai inti ---------- */}
                        </div>
                    </div>

                </div>
                :
                <div className="layout-container-visi-misi-responsive">
                    <div className="content-visi-misi-title-responsive">Visi & Misi</div>

                    <div className="layout-content-visi-misi-right-responsive">
                        <div>
                            <Gap height={50} />

                            {ListVM.map((item,index) => {
                                return <>
                                    <div ref={targetRef} className={`box-title-vm ${isVisible ? 'show' : ''}`}>
                                        <div className="content-title-visi-misi-responsive">{item.Title}</div>
                                    </div>
                                    <div ref={targetRef} className={`box-desc-vm ${isVisible ? 'show' : ''}`}>
                                        <div className="content-desc-visi-misi-responsive">{item.Description}</div>
                                    </div>
                                    <Gap height={50} />
                                </>
                            })}
                            
                            

                            {/* <div className="content-title-visi-misi-responsive">Misi</div>
                            <div className="content-desc-visi-misi-responsive">Membangun hunian berkualitas dan lingkungan yang berkelanjutan melalui peningkatan produk secara berkesinambungan serta memenangkan kepercayaan dan loyalitas pelanggan.</div>

                            <div style={{ paddingTop:20 }} />

                            <div className="content-desc-visi-misi-responsive">Membangun organisasi yang berorientasi pada pengembangan talenta untuk mencapai potensi terbaik, guna memberikan dampak positif untuk kepentingan bersama.</div> */}

                            <Gap height={60} />

                            <div className="content-title-visi-misi-responsive">Nilai Inti</div>

                            <Gap height={40} />

                            {ListCoreValues.map((item,index) => {
                                return <>
                                    <div style={{ display:'flex', alignItems:'center' }}>
                                        <div ref={targetRef3} className={`box-desc-vm ${isVisible3 ? 'show' : ''}`}>
                                            <div style={{ borderLeft:'1px solid #632B2B', height:60 }} />
                                        </div>

                                        <Gap width={20} />

                                        <div ref={targetRef2} className={`box-title-core-value ${isVisible2 ? 'show' : ''}`}>
                                            <div style={{ fontSize:25, fontWeight:400, color:'#632B2B' }}>{item.Title}</div>
                                            <div style={{ fontSize:17, fontWeight:500, color:'#4F4F4F' }}>{item.TitleDesc}</div>
                                        </div>
                                    </div>

                                    <Gap height={20} />

                                    <div ref={targetRef2} className={`box-title-core-value ${isVisible ? 'show' : ''}`}>
                                        <div className="content-desc-visi-misi-responsive">{item.Description}</div>
                                    </div>
                                    
                                    <Gap height={50} />
                                </>
                            })}
                        </div>
                    </div>

                </div>}

            </div>
        </div>
    )
}

export default VisiMisi;