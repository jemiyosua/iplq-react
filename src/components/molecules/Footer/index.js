import React, { useEffect, useState } from 'react';
import { MDBFooter, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { IcWhatsapp, IcFacebook, IcInstagram, IcYoutube, IcTiktok, IcDownloadPlaystore, IcDownloadAppstore, IcBahasa, IcLippolandFooter, LogoIPLQTulisan,} from '../../../assets';
import './footer.css';
import { Gap, Input } from '../../atoms';
import { fetchStatus, generateSignature, historyConfig } from '../../../utils/functions';
import { paths } from '../../../utils';
import { useHistory } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";

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
		<footer className="footer">

			<div className="footer-container">

				{/* LEFT */}
				<div className="footer-left">
				<h2 className="logo">
					<img src={LogoIPLQTulisan} style={{ width:55 }} /> IPL-Q
				</h2>

				<p>
					Platform manajemen hunian terpadu yang menghubungkan pengelola dan penghuni
					perumahan melalui teknologi yang cerdas dan mudah digunakan.
				</p>

				<div className="socials">
					<span><FaInstagram /></span>
					<span><FaTwitter /></span>
					<span><FaLinkedin /></span>
					<span><FaFacebook /></span>
				</div>
				</div>

				{/* MIDDLE */}
				<div className="footer-col">
				<h4>Produk</h4>
				<a href="#features">Fitur Unggulan</a>
				<a href="#pricing">Harga & Paket</a>
				{/* <a href="#">Demo Produk</a> */}
				<a href="#cta">Daftar Gratis</a>
				</div>

				{/* RIGHT */}
				<div className="footer-col">
				<h4>Kontak Kami</h4>

				<div className="contact">
					<FiMapPin />
					<span>TBA</span>
				</div>

				<div className="contact">
					<FiPhone />
					<span>TBA</span>
				</div>

				<div className="contact">
					<FiMail />
					<span>TBA</span>
				</div>
				</div>

			</div>

			{/* BOTTOM */}
			<div className="footer-bottom">
				<span>© 2026 IPL-Q. Hak Cipta Dilindungi.</span>

				<div className="footer-links">
				<a href="#">Kebijakan Privasi</a>
				<a href="#">Syarat & Ketentuan</a>
				<a href="#">Bantuan</a>
				</div>
			</div>

		</footer>
	);
}

export default Footer