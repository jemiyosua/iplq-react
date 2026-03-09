import React, { useEffect, useState, useRef } from 'react';
import { IcArrowBlackHeader, ImgExprience, ImgHomeProvided, ImgParkSerpong, ImgProjectComplete, ImgTentangKamiDesc } from '../../../assets';
import { Gap } from '../../atoms';
import './tentang-kami-section3.css';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

function TentangKamiSection3() {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const targetRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const [ListLeaderInitiative, setListLeaderInitiative] = useState([])

    useEffect(() => {
        // 
    }, [])

    useEffect(() => {
        getListLeaderInitiative()

        // ---------- observer 1 ----------
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(targetRef.current); // Stop observing after it becomes visible
                }
            },
            {
                threshold: 0.5, // Trigger when 50% of the element is visible
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

    }, [])

    const getListLeaderInitiative = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'LeaderInitiative';
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
                setListLeaderInitiative(data.Result)
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
                <div ref={targetRef} className={`box ${isVisible ? 'show' : ''}`}>
                    <div className="layout-container-section-3">
                        {ListLeaderInitiative.map((item,index) => {
                            return  <div className="layout-content-section-3-left">
                                <div className="content-section-3-title">{item.Title}</div>
                                <div className="content-section-3-desc">{item.Description}</div>
                            </div>
                        })}
                        {/* <div className="layout-content-section-3-left">
                            <div className="content-section-3-title">Pemimpin Kami</div>
                            <div className="content-section-3-desc">Kepemimpinan di LippoLand telah membentuk perusahaan menjadi perusahaan real estate terkemuka, dengan mendorong inovasi dan meningkatkan citra positif perusahaan.</div>
                        </div>
                        <div className="layout-content-section-3-right">
                            <div className="content-section-3-title">Inisiatif Kami</div>
                            <div className="content-section-3-desc">Di LippoLand, keberlanjutan merupakan inti dari bisnis kami. Kami berkomitmen untuk mengelola sumber daya, lingkungan, dan komunitas secara bertanggung jawab.</div>
                        </div> */}
                    </div>
                </div>
                :
                <div ref={targetRef} className={`box ${isVisible ? 'show' : ''}`}>
                    <div className="layout-container-section-3-responsive">
                        {ListLeaderInitiative.map((item,index) => {
                            return <>
                                <div className="layout-content-section-3-left-responsive">
                                    <div className="content-section-3-title-responsive">Pemimpin Kami</div>
                                    <Gap height={20} />
                                    <div className="content-section-3-desc-responsive">Kepemimpinan di LippoLand telah membentuk perusahaan menjadi perusahaan real estate terkemuka, dengan mendorong inovasi dan meningkatkan citra positif perusahaan.</div>
                                </div>
                                <Gap height={20} />
                            </>
                        })}
                    

                        {/* // <div className="layout-content-section-3-right-responsive">
                        //     <div className="content-section-3-title-responsive">Inisiatif Kami</div>
                        //     <Gap height={20} />
                        //     <div className="content-section-3-desc-responsive">Di LippoLand, keberlanjutan merupakan inti dari bisnis kami. Kami berkomitmen untuk mengelola sumber daya, lingkungan, dan komunitas secara bertanggung jawab.</div>
                        // </div> */}
                    </div>
                </div>
                }

            </div>
        </div>
    )
}

export default TentangKamiSection3;