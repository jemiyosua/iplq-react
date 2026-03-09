import React, { useEffect, useState, useRef } from 'react';
import { IcArrowBlackHeader, IcArrowUp, ImgExprience, ImgHomeProvided, ImgParkSerpong, ImgProjectComplete, ImgReward1, ImgReward2, ImgReward3, ImgReward4, ImgTentangKamiDesc } from '../../../assets';
import './penghargaan-sertifikasi.css';
import { Gap } from '../../atoms';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

function PenghargaanSertifikasi() {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [IdReward, setIdReward] = useState("1")
    const [IdTriggered, setIdTriggered] = useState(0)

    const targetRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false)
    const [isActive, setIsActive] = useState(false)

    const [ListAward, setListAward] = useState([])
    const [IndexReward, setIndexReward] = useState("")

    const [isRotated, setIsRotated] = useState(false)

    useEffect(() => {
        getListAward()
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
                threshold: 0.1, // Trigger when 50% of the element is visible
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

    }, [ListAward])

    const getListAward = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": "",
        });

        var url = paths.URL_API_WEB + 'ListAward';
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
                setListAward(data.Result)
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

    // const Penghargaan = [
    //     {
    //         "Id": "1",
    //         "Title": "2024 - BCI ASIA AWARDS 2024",
    //         "SubTitle": "Top 10 Developers",
    //         "Image": ImgReward1
    //     },
    //     {
    //         "Id": "2",
    //         "Title": "2024 - GOLDEN PROPERTY AWARDS THE PEOPLE'S CHOICE 2024",
    //         "SubTitle": "Best Choice Housing Project Kabupaten Tanggerang - Park Serpong",
    //         "Image": ImgReward2
    //     },
    //     {
    //         "Id": "3",
    //         "Title": "2024 - GOLDEN PROPERTY AWARDS THE PEOPLE'S CHOICE 2024",
    //         "SubTitle": "Best Choice Millenial Home Design - Park Serpong",
    //         "Image": ImgReward3
    //     },
    //     {
    //         "Id": "4",
    //         "Title": "2024 - INVESTORTRUST ESG AWARDS 2024",
    //         "SubTitle": "Developing Climate Change Education - Lippo Cikarang",
    //         "Image": ImgReward4
    //     }
    // ]

    const handleClick = (id) => {
        setIdReward(id)
        setIsRotated(!isRotated) // Toggle the rotation state

        console.log(id)
        console.log(IdReward)
    }

    return (
        <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ width:'95%' }}>

                {windowWidth > 1340 ?
                <div className="layout-container-reward">
                    <div ref={targetRef} className={`box-reward-title ${isVisible ? 'show' : ''}`}>
                        <div className="content-reward-title">Penghargaan dan Sertifikasi</div>
                    </div>

                    <Gap height={100} />

                    <div className="layout-content-reward">
                        <div className="layout-content-reward-left">
                            <div ref={targetRef} className={`box-reward-title ${isVisible ? 'show' : ''}`}>
                                {ListAward.map((item,index) => {
                                    return <img src={item.Id == IdReward ? item.Images : ''} className={`box-reward-img ${item.Id == IdReward ? 'show' : 'close'}`}/>
                                })}
                            </div>
                        </div>

                        <Gap width={100} />

                        <div className="layout-content-reward-right">
                            <div style={{ width:'100%' }}>
                                {ListAward.map((item,index) => {
                                    return <>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }} onClick={() => handleClick(item.Id)}>
                                            <div ref={targetRef} className={`box-reward-title ${isVisible ? 'show' : ''}`}>
                                                <div style={{ fontSize:24, fontWeight:400, color:'#000000' }} className={`title-show ${item.Id == IdReward ? 'show' : ''}`}>{item.Year + " - " + item.Title}</div>
                                                <Gap height={10} />
                                                {item.Id == IdReward && <div style={{ fontSize:20, fontWeight:400, color:'#828282' }}>{item.Description}</div>}
                                            </div>
                                            <div ref={targetRef} className={`arrow ${item.Id == IdReward && isRotated ? 'rotate' : ''}`}>
                                                <img src={IcArrowUp} width={15} height={10} />
                                            </div>
                                        </div>
                                        <Gap height={10} />
                                        <hr />
                                        <Gap height={20} />
                                    </>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div className="layout-container-reward">
                    <div ref={targetRef} className={`box-reward-title ${isVisible ? 'show' : ''}`}>
                        <div className="content-reward-title-responsive">Penghargaan dan Sertifikasi</div>
                    </div>

                    <Gap height={75} />

                    <div className="layout-content-reward-right-responsive">
                        <div style={{ width:'100%' }}>
                            {ListAward.map((item,index) => {
                                return <>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }} onClick={() => handleClick(item.Id, index)}>
                                        <div ref={targetRef} className={`box-reward-title ${isVisible ? 'show' : ''}`}>
                                            <div style={{ fontSize:18, fontWeight:400, color:'#000000' }}>{item.Title}</div>
                                            {item.Id == IdReward && <div style={{ fontSize:16, fontWeight:400, color:'#828282' }}>{item.Description}</div>}
                                        </div>
                                        <div ref={targetRef} className={`box-reward-title ${isVisible ? 'show' : ''}`}>
                                            <img src={IcArrowUp} width={15} height={10} />
                                        </div>
                                    </div>
                                    <Gap height={20} />
                                    {item.Id == IdReward && <img src={item.Images} className={`box-reward-img ${item.Id == IdReward ? 'show' : 'close'}`} />}
                                    <hr />
                                    <Gap height={20} />
                                </>
                            })}
                        </div>
                    </div>
                </div>
                }

            </div>
        </div>
    )
}

export default PenghargaanSertifikasi;