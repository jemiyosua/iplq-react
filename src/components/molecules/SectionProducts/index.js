import React, { useEffect, useState, useRef } from 'react';
import { IcArrowNextBlack, IcArrowPrevBlack, ImgCarousel1, ImgCarouselProduct1, ImgCarouselProduct2, ImgCarouselProduct3, ImgCarouselProduct4, ImgCarouselProduct5, ImgCarouselProduct6, ImgCarouselProduct7, ImgCarouselProduct8 } from '../../../assets';
import { Gap } from '../../atoms';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';
import './section-products.css'

function SectionProducts() {

    const containerRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [MinScroll, setMinScroll] = useState(true);
    const [MaxScroll, setMaxScroll] = useState(false);

    const [scrollPosition, setScrollPosition] = useState(0);
    const [ListProductHome, setListProductHome] = useState([]);

    useEffect(() => {

        getListProductHome()

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [])

    // Width of one image including margin (adjust based on your layout)
    const imageWidth = 500; // Image width in pixels
    const gap = 20; // Gap between images
    const step = 1 * (imageWidth + gap); // Scroll step (visible images * image width)
    const totalScrollWidth = ListProductHome.length * (imageWidth + gap);

    const handleScroll = (direction) => {
        if (containerRef.current) {
            const container = containerRef.current;
            const maxScroll = totalScrollWidth - container.offsetWidth;
    
            let newScrollPosition =
                direction === "next"
                ? Math.min(scrollPosition + step, maxScroll)
                : Math.max(scrollPosition - step, 0);

            if (newScrollPosition == maxScroll) {
                setMaxScroll(true)
                setMinScroll(false)
            } else if (newScrollPosition == 0) {
                setMaxScroll(false)
                setMinScroll(true)
            } else {
                setMaxScroll(false)
                setMinScroll(false)
            }
    
            container.scrollTo({
                left: newScrollPosition,
                behavior: "smooth",
            });
    
            setScrollPosition(newScrollPosition);
        }
    };

    const getListProductHome = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'ListProductHome';
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
                setListProductHome(data.Result)
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
        <div style={{ display:'flex', justifyContent:'center', padding:20 }}>
            <div style={{ width:'95%' }}>

                <div style={{ fontSize:64, fontWeight:400 }}>Our Products</div>

                <Gap height={50} />
                
                <div ref={containerRef} style={{ overflow: 'hidden' }}>
                    <div style={{ display: "flex", gap: `${gap}px` }}>
                        {ListProductHome.map((item, index) => (
                            <div className="grid-item-product">
                                <img 
                                    key={index} 
                                    src={item.Images}
                                    alt={`Image ${index + 1}`} 
                                    style={{ width: `${imageWidth}px`, flexShrink:0 }}
                                />
                                <div className="overlay-text">
                                    <h3>{item.Title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                

                <Gap height={50} />
        
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <div style={{ display:'flex', alignItems:'center', cursor:'pointer' }} onClick={() => handleScroll("prev")}>
                        <img src={IcArrowPrevBlack} width={25} style={{ color:'#BDBDBD' }} />
                        <Gap width={20} />
                        <div style={{ color:MinScroll ? '#BDBDBD' : '#000000' }}>PREVIOUS</div>
                    </div>

                    <Gap width={20} />

                    <div style={{ display:'flex', alignItems:'center', cursor:'pointer' }} onClick={() => handleScroll("next")}>
                        <div style={{ color:MaxScroll ? '#BDBDBD' : '#000000' }}>NEXT</div>
                        <Gap width={20} />
                        <img src={IcArrowNextBlack} width={25} />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default SectionProducts;