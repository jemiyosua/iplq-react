import React, { useEffect, useState, useRef } from 'react';
import { IcArrowBlackHeader, IcStats1, IcStats2, IcStats3, ImgExprience, ImgHomeProvided, ImgParkSerpong, ImgProjectComplete, ImgStats1, ImgStats2, ImgStats3, ImgTentangKamiDesc } from '../../../assets';
import './tentang-kami-section2.css';
import { Gap } from '../../atoms';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

function TentangKamiSection2() {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const targetRef = useRef(null)
    const targetRef2 = useRef(null)
    const targetRef3 = useRef(null)
    const targetRef4 = useRef(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isVisible2, setIsVisible2] = useState(false)
    const [isVisible3, setIsVisible3] = useState(false)
    const [isVisible4, setIsVisible4] = useState(false)

    const [ListStats, setListStats] = useState([])

    useEffect(() => {
        getListStats()
    }, [])

    useEffect(() => {
        console.log("masuk sini")
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

        // ---------- observer 2 ----------
        const observer2 = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    console.log("masuk visible 2")
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

        // ---------- observer 4 ----------
        const observer4 = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible4(true);
                    observer4.unobserve(targetRef4.current); // Stop observing after it becomes visible
                }
            },
            {
                threshold: windowWidth > 1340 ? 0.5 : 0.1, // Trigger when 50% of the element is visible
            }
        );

        if (targetRef4.current) {
            observer4.observe(targetRef4.current);
        }
        // ---------- end of observer 4 ----------

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {

            window.removeEventListener('resize', handleResize);

            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }

            if (targetRef2.current) {
                observer2.unobserve(targetRef2.current);
            }

            if (targetRef3.current) {
                observer3.unobserve(targetRef3.current);
            }

            if (targetRef4.current) {
                observer4.unobserve(targetRef4.current);
            }
        };
    }, [ListStats])

    const getListStats = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'ListStats';
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
                setListStats(data.Result)
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
                
                <div style={{ padding:20 }}>
                    <div ref={targetRef} className={`box ${isVisible ? 'show' : ''}`}>
                        <div className="content-title-section">{'Meningkatkan\n Kesejahteraan,\nMembentuk Masa Depan'}</div>
                    </div>

                    <div style={{ paddingTop:windowWidth > 1340 ? 200 : 50 }} />

                    <div className="image-gallery-stats">
                        {ListStats.map((item,index) => {
                            var icStats = ""
                            if (index == 0) {
                                icStats = IcStats1
                            } else if (index == 1) {
                                icStats = IcStats2
                            } else if (index == 2) {
                                icStats = IcStats3
                            }
                            return <div className="image-container-stats">
                                <div style={{ display:'flex', alignItems:'center' }}>
                                    <div ref={targetRef4} className={`box-img-2-stats ${isVisible4 ? 'show' : ''}`}>
                                        <img src={icStats} className="img-fluid" style={{ width:50, height:'auto', display: 'block', objectFit:'cover' }} />
                                    </div>
                                    <Gap width={30} />
                                    <div ref={targetRef3} className={`box-img-stats ${isVisible3 ? 'show' : ''}`}>
                                        <img src={item.Images} className="img-fluid" style={{ height:'auto', display: 'block', objectFit:'cover' }} />
                                    </div>
                                </div>
                                <Gap height={30} />
                                <div ref={targetRef2} className={`box-title-stats ${isVisible2 ? 'show' : ''}`}>
                                    <div className="content-text-section">{item.Title}</div>
                                </div>
                            </div>
                        })}
                        {/* <div className="image-container-stats">
                            <div style={{ display:'flex', alignItems:'center' }}>
                                <div ref={targetRef4} className={`box-img-2-stats ${isVisible4 ? 'show' : ''}`}>
                                    <img src={IcStats1} className="img-fluid" style={{ width:50, height:'auto', display: 'block', objectFit:'cover' }} />
                                </div>
                                <Gap width={30} />
                                <div ref={targetRef3} className={`box-img-stats ${isVisible3 ? 'show' : ''}`}>
                                    <img src={ImgStats1} className="img-fluid" />
                                </div>
                            </div>
                            <Gap height={30} />
                            <div ref={targetRef2} className={`box-title-stats ${isVisible2 ? 'show' : ''}`}>
                                <div className="content-text-section">Years of Experience</div>
                            </div>
                        </div>
                        <div className="image-container-stats">
                            <div style={{ display:'flex', alignItems:'center' }}>
                                <div ref={targetRef4} className={`box-img-2-stats ${isVisible4 ? 'show' : ''}`}>
                                    <img src={IcStats2} className="img-fluid" style={{ width:50, height:'auto', display: 'block', objectFit:'cover' }} />
                                </div>
                                <Gap width={30} />
                                <div ref={targetRef3} className={`box-img-stats ${isVisible3 ? 'show' : ''}`}>
                                    <img src={ImgStats2} className="img-fluid" />
                                </div>
                            </div>
                            <Gap height={30} />
                            <div ref={targetRef2} className={`box-title-stats ${isVisible2 ? 'show' : ''}`}>
                                <div className="content-text-section">Projects Completed</div>
                            </div>
                        </div>
                        <div className="image-container-stats">
                            <div style={{ display:'flex', alignItems:'center' }}>
                                <div ref={targetRef4} className={`box-img-2-stats ${isVisible4 ? 'show' : ''}`}>
                                    <img src={IcStats3} className="img-fluid" style={{ width:50, height:'auto', display: 'block', objectFit:'cover' }} />
                                </div>
                                <Gap width={30} />
                                <div ref={targetRef3} className={`box-img-stats ${isVisible3 ? 'show' : ''}`}>
                                    <img src={ImgStats3} className="img-fluid" />
                                </div>
                            </div>
                            <Gap height={30} />
                            <div ref={targetRef2} className={`box-title-stats ${isVisible2 ? 'show' : ''}`}>
                                <div className="content-text-section">Homes Provided</div>
                            </div>
                        </div> */}
                    </div>
                    
                </div>

            </div>
        </div>
    )
}

export default TentangKamiSection2;