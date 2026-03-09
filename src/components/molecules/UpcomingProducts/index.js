import React, { useEffect, useState } from 'react';
import { Ic1Cover, Ic2Cover, Ic3Cover, Ic4Cover, IcArrowBlackHeader, ImgCarousel1, ImgCoverHome, ImgCoverHomeOrang, ImgParkSerpong, ImgUpcomingProjects } from '../../../assets';
import { Gap } from '../../atoms';
// import './carouselHome.css';
// import './carousel.css';
import {Nav} from 'react-bootstrap';
import './section-upcoming-products.css';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';
// import './section-dev-image.css';

function UpcomingProducts() {

    const [IdCategory, setIdCategory] = useState("1")
    const [CategoryName, setCategoryName] = useState("Township")
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isOpen, setIsOpen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [Images, setImages] = useState("")
    const [Title, setTitle] = useState("")

    useEffect(() => {

        getUpcomingProject()

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [])

    const getUpcomingProject = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'UpcomingProject';
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
        // <div className="cover-container" >
        //     <div class="text-overlay">Centered Text</div>
        // </div>
        // <div class="image-container">
        //     <img src={ImgUpcomingProjects} alt="Example Image" />
        //     <div class="text-overlay">UPCOMING PROJECTS</div>
        // </div>
        <div className="full-width-image-container-up">
            <img src={Images} className="full-width-image-up" />
            <div class="text-overlay">{Title}</div>
        </div>
    )
}

export default UpcomingProducts;