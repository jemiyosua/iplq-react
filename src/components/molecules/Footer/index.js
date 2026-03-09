import React, { useEffect, useState } from 'react';
import { MDBFooter, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { IcWhatsapp, IcFacebook, IcInstagram, IcYoutube, IcTiktok, IcDownloadPlaystore, IcDownloadAppstore, IcBahasa, IcLippolandFooter,} from '../../../assets';
import './footer.css';
import { Gap, Input } from '../../atoms';
import { fetchStatus, generateSignature, historyConfig } from '../../../utils/functions';
import { paths } from '../../../utils';
import { useHistory } from 'react-router-dom';

const Footer = ({ onClickSection }) => {

	const history = useHistory(historyConfig);

	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	const [ListFooterMenuLeft, setListFooterMenuLeft] = useState([])
	const [ListFooterMenuRigth, setListFooterMenuRigth] = useState([])

	useEffect(() => {
        window.scrollTo(0, 0)

		getListHeaderMenu()

		const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
	},[])

	const getListHeaderMenu = () => {
        var requestBody = JSON.stringify({
            "Ip": "",
            "Id": ""
        });

        var url = paths.URL_API_WEB + 'ListFooterMenu';
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
                setListFooterMenuLeft(data.ResultLeft)
                setListFooterMenuRigth(data.ResultRight)
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

	const changePage = (urlPage, page) => {
        if (page == "DEVELOPMENTS") {
            onClickSection()
        } else {
            window.location.href = urlPage
        }
    }

	return (
		<div className={windowWidth > 1340 ? "custom-container" : "custom-container-responsive"}>

			<div className="container-content">

				<div className="container-content-left">
					<div style={{ fontSize:windowWidth > 1340 ? 36 : 25, fontWeight:400 }}>GET IN TOUCH</div>

					<div style={{ padding:10 }} />

					<div style={{ fontSize:windowWidth > 1340 ? 24 : 20, fontWeight:400 }}>Golden Flower - Marigold Cluster</div>
					<div style={{ fontSize:windowWidth > 1340 ? 18 : 15 }}>
						Lippo Karawaci Central
						<br/>
						Tangerang, Banten, 15811
						<br/>
						Indonesia
					</div>

					<div style={{ padding:30 }} />

					<div style={{ fontSize:windowWidth > 1340 ? 24 : 20, fontWeight:400 }}>Contact</div>
					<div style={{ fontSize:windowWidth > 1340 ? 18 : 15, fontWeight:300 }}>+62 812-1002-0088</div>

					{windowWidth <= 1340 &&
					<>
						<div style={{ padding:30 }} />
						<div className="container-content-right">
							<div style={{ fontSize:windowWidth > 1340 ? 20 : 15 }}>
								{ListFooterMenuLeft.map((item,index) => {
									return <>
										<div style={{ cursor:'pointer' }} onClick={() => changePage(item.UrlPage, item.MenuName)}>{item.MenuName}</div>
									</>
								})}
							</div>
							<div style={{ fontSize:windowWidth > 1340 ? 20 : 15 }}>
								{ListFooterMenuRigth.map((item,index) => {
									return <>
										<div style={{ cursor:'pointer' }} onClick={() => changePage(item.UrlPage, item.MenuName)}>{item.MenuName}</div>
										<div style={{ padding:8 }} />
									</>
								})}
							</div>
						</div>
					</>}
					
				</div>

				{windowWidth > 1340 &&
				<div className="container-content-right">
					<div>
						{ListFooterMenuLeft.map((item,index) => {
							return <>
								<div style={{ cursor:'pointer' }} onClick={() => changePage(item.UrlPage, item.MenuName)}>{item.MenuName}</div>
								<div style={{ padding:8 }} />
							</>
						})}
					</div>
					<div>
						{ListFooterMenuRigth.map((item,index) => {
							return <>
								<div style={{ cursor:'pointer' }} onClick={() => changePage(item.UrlPage, item.MenuName)}>{item.MenuName}</div>
								<div style={{ padding:8 }} />
							</>
						})}
					</div>
				</div>	
				}

			</div>

			<div style={{ padding:50 }} />

			{windowWidth > 1340 ?
			<div className="container-content-bottom">
				<div style={{fontSize:100,fontWeight:'bold'}}>IPLQ</div>
				<div style={{ fontSize:12, fontWeight:300 }}>IPLQ COPYRIGHT 2024. ALL RIGHTS RESERVED.</div>
			</div>
			:
			<div className="container-content-bottom-responsive">
				<img src={IcLippolandFooter} width={windowWidth > 1340 ? 100 : 300} />
				<div style={{ padding:30 }} />
				<div style={{ fontSize:windowWidth > 1340 ? 12 : 10, fontWeight:300 }}>IPLQ COPYRIGHT 2024. ALL RIGHTS RESERVED.</div>
			</div>}
			
		</div>
	);
}

export default Footer