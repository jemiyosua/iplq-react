import React, { useState, useEffect } from 'react';
import { ImgCarousel1, ImgCarousel2, ImgCarousel3, ImgCarousel4, ImgHeroTentangKami, ImgTentangKamiDesc } from '../../../assets';
import './hero-tentang-kami.css';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';

function HeroTentangKami() {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [Mounted, setMounted] = useState(false)

    const [Images, setImages]= useState("")
    const [Title, setTitle]= useState("")

    useEffect(() => {
        getAboutUsHero()
    }, []);

    useEffect(() => {
        setMounted(true)
    
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [Images, Title]);

    const getAboutUsHero = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'AboutUsHero';
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
        // <div className={`hero-tentang-kami ${Mounted ? 'mounted' : ''}`}>
        //     <img src={Images} className="image" />

        //     <div className="hero-text-container">
        //         <div className="hero-text">{Title}</div>
        //     </div>
        // </div>

        <div className={`hero-tentang-kami ${Mounted ? 'mounted' : ''}`}>
            <img src={ImgHeroTentangKami} className="image" />

            <div className="hero-text-container">
                <div className="hero-text">{"Tentang\nLippoLand"}</div>
            </div>
        </div>
    )
}

export default HeroTentangKami;