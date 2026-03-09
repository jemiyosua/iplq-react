import React, { useEffect, useState, useRef } from 'react';
import { IcArrowBlackHeader, ImgParkSerpong, ImgTentangKamiDesc } from '../../../assets';
import './tentang-kami-desc.css';
import { Gap } from '../../atoms';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

function TentangKamiDesc() {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const targetRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const [Images, setImages] = useState("")
    const [Title, setTitle] = useState("")
    const [Description, setDescription] = useState("")

    useEffect(() => {
        getAboutUsDesc()
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
              // Check if the target element is visible
              if (entry.isIntersecting) {
                setIsVisible(true); // Trigger animation when visible
              }
            },
            { threshold: 0.5 } // Trigger when 50% of the element is visible
        );

        if (targetRef.current) {
            observer.observe(targetRef.current); // Observe the target element
        }
        
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);

            if (targetRef.current) {
                observer.unobserve(targetRef.current); // Clean up observer on unmount
            }
        };
    }, [Images, Title, Description])

    const getAboutUsDesc = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'AboutUsDesc';
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
                setImages(data.Result[0].Images)
                setTitle(data.Result[0].Title)
                setDescription(data.Result[0].Description)
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
                <div 
                    className="layout-container" 
                    ref={targetRef}
                    style={{
                        transform: isVisible ? "translateY(0)" : "translateY(100px)",
                        opacity: isVisible ? 1 : 0,
                        transition: "transform 1s ease, opacity 1s ease",
                    }}
                >
                    <div className="layout-content-left">
                        <div>
                            <div className="content-title">{Title}</div>
                            <div className="content-desc">{Description}</div>
                        </div>
                    </div>

                    <div className="layout-content-right">
                        <img src={Images} className="img-fluid" />
                    </div>
                </div>
                :
                <div 
                    className="layout-container-responsive"
                    ref={targetRef}
                    style={{
                        transform: isVisible ? "translateY(0)" : "translateY(100px)",
                        opacity: isVisible ? 1 : 0,
                        transition: "transform 1s ease, opacity 1s ease",
                    }}
                >
                    <div className="layout-content-left-responsive">
                        <div>
                            <div className="content-title-responsive">{Title}</div>
                            <Gap height={30} />
                            <div className="content-desc-responsive">{Description}</div>
                        </div>
                    </div>

                    <Gap height={50} />

                    <div className="layout-content-right-responsive">
                        <img src={Images} className="img-fluid" width={'100%'} />
                    </div>
                </div>
                }

            </div>
        </div>
        
    )
}

export default TentangKamiDesc;