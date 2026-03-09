import React, { useState, useEffect } from 'react';
import { ImgCarousel1, ImgCarousel2, ImgCarousel3, ImgCarousel4 } from '../../../assets';
import './carousel.css';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

function CarouselHome() {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [Mounted, setMounted] = useState(false)
    const [ListHeroHome, setListHeroHome] = useState([])
    const ListHeroHomeOffline = [
        {
            "Id": 1,
            "Images": ImgCarousel1,
            "Title": "ASPIRA HOMES AT LIPPO VILLAGE",
            "Description": "Embrace a Life Inspired"
        },
        {
            "Id": 2,
            "Images": ImgCarousel2,
            "Title": "BLACKSLATE HOMES AT PARK SERPONG",
            "Description": "Crafted for the Bold"
        },
        {
            "Id": "3",
            "Images": ImgCarousel3,
            "Title": "COLONY HOMES AT LIPPO CIKARANG",
            "Description": "Where Shared Values Create a True Community"
        },
        {
            "Id": "4",
            "Images": ImgCarousel4,
            "Title": "THE HIVE @ PARKHILLS BOULEVARD AT PARK SERPONG",
            "Description": "New Lifestyle destination at Vibrant City at the heart of Serpong"
        }
    ]
    
    const [IsOffline, setIsOffline] = useState(false)
    
    useEffect(() => {
        getListHeroHome()

        setMounted(true)

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ListHeroHome.length);
        }, 5000); // Change every 5 seconds
    
        return () => clearInterval(interval); // Cleanup on unmount
    }, [ListHeroHome.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ListHeroHomeOffline.length);
        }, 5000); // Change every 5 seconds
    
        return () => clearInterval(interval); // Cleanup on unmount
    }, [ListHeroHomeOffline.length]);

    const getListHeroHome = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'ListHeroHome';
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
            setIsOffline(false)
            if (data.ErrorCode === "0") {
                setListHeroHome(data.Result)
            } else {
                // setErrorMessageAlert(data.ErrorMessage);
                // setShowAlert(true);
                return false;
            }
        })
        .catch((error) => {
            console.log("error")
            setIsOffline(true)
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

        <div className={`carousel ${Mounted ? 'mounted' : ''}`}>
            <div
                className="carousel-tracks"
                style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                    display: "flex",
                    transition: "transform 0.5s ease-in-out",
                }}
            >
                {IsOffline ?
                 ListHeroHomeOffline?.map((item,index) => {
                    console.log(item.Images)
                    return <div key={index} className="carousel-image">
                        <img src={item.Images} alt={`Slide ${index + 1}`} />
                    </div>
                })
                :
                ListHeroHome?.map((item,index) => {
                    console.log(item.Images)
                    return <div key={index} className="carousel-image">
                        <img src={item.Images} alt={`Slide ${index + 1}`} />
                    </div>
                })
                }
                {/* {ListHeroHome?.map((item,index) => (
                    
                ))} */}
            </div>
            
            <div className="carousel-text">
                <div key={currentIndex}>
                    {IsOffline ?
                    <>
                        <div className="text-content">{ListHeroHomeOffline?.length>0 && ListHeroHomeOffline[currentIndex]?.Title}</div>
                        <div className="text-content-desc">{ListHeroHomeOffline?.length>0 && ListHeroHomeOffline[currentIndex]?.Description}</div>
                    </>
                    :
                    <>
                        <div className="text-content">{ListHeroHome?.length>0 && ListHeroHome[currentIndex]?.Title}</div>
                        <div className="text-content-desc">{ListHeroHome?.length>0 && ListHeroHome[currentIndex]?.Description}</div>
                    </>
                    }
                </div>
            </div>

            <div className="carousel-dots">
                {IsOffline ?
                ListHeroHomeOffline?.map((_, index) => (
                <div
                    key={index}
                    className={`dot ${currentIndex === index ? "active" : ""}`}
                    onClick={() => setCurrentIndex(index)}
                />
                ))
                :
                ListHeroHome?.map((_, index) => (
                <div
                    key={index}
                    className={`dot ${currentIndex === index ? "active" : ""}`}
                    onClick={() => setCurrentIndex(index)}
                />
                ))
                }
            </div>
        </div>
    )
}

export default CarouselHome;