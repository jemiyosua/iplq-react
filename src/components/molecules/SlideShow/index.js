 import { Banner01, Banner02, Banner03, Banner04 } from '../../../assets';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SlideShow.css'
import { fetchStatus, generateSignature} from '../../../utils/functions'
import { paths } from '../../../utils'
import axios from 'axios'
import { useEffect, useState } from 'react';
import React from 'react';
import publicIP from 'react-native-public-ip';

const SlideShow = ({}) => {

  	const settings = {
		dots: true,
		autoplay: true,
		infinite: false,
		slidesToShow: 2,
		slidesToScroll: 1
  	};  

  	const [ListBanner, setListBanner] = useState([]);

    const getIP = async() => {
		publicIP()
        .then(ip => {
            Login(ip)
        })
        .catch(error => {
        });
	}


  	const Login = (ip) => {
    var requestBody = JSON.stringify({
        "param1": ip,
    });

    var url = paths.URL_API_DYNAMIC+'Login';
    var Signature = generateSignature(requestBody)

    fetch( url, {
        method: "POST",
        body: requestBody,
        headers: {
            'Content-Type': 'application/json',
            'Signature': Signature   
        }
    })
    .then(fetchStatus)
    .then(response => response.json())
    .then((data) => {
        if(data.errcode=="0"){
            getApiBanner(data.paramr, ip);
        }
    })
    .catch((error) => {

    });
	}

  	const getApiBanner = (Randomkey, ip) => {
    var requestBody = JSON.stringify({
      "param": Randomkey,
      "param1": ip,
    });    

    var url = paths.URL_API_STATIC+'ShowBanner';
        var Signature = generateSignature(requestBody)
        fetch( url, {
            method: "POST",
            body: requestBody,
            headers: {
                'Content-Type': 'application/json',
                'Signature': Signature   
            }
        })
        .then(fetchStatus)
        .then(response => response.json())
        .then((data) => {
            if(data.errcode=="0"){
                setListBanner(data.list)
            }
        })
        .catch((error) => {
            alert("Terjadi kesalahan pada internal server! Harap tunggu beberapa saat lagi")
        });
  	}

 	useEffect(() => {
    	getIP();
  	}, []);    

  	return (
        <div >
            <Slider {...settings} className="Banner" >
                {
                    ListBanner.map((item,index) => {
                    return (
                        <div >
                            <img src={item.ImgSrc} alt="Continental GT 650" />
                        </div>
                    )
                    })
                }
            </Slider>
        </div> 
  	);
}

export default SlideShow;