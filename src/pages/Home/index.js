import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Gap, Header, Footer, CarouselHome, SectionDevelopments, SectionProducts, UpcomingProducts, Hero } from '../../components';
import { useDispatch } from 'react-redux';
import { fetchStatus, generateSignature, historyConfig } from '../../utils/functions';
import { useCookies } from 'react-cookie';
import './home.css'
import { paths } from '../../utils';

const Home = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const [cookies, setCookie,removeCookie] = useCookies([]);

    const [AnchorPage, setAnchorPage] = useState("")

    useEffect(() => {
        // window.scrollTo(0, 0)

        var anchorPage = cookies.varAnchorPage;
        if (anchorPage == "section-dev") {
            console.log("ok")
            scrollToSection("section-dev")
        }

    },[])

    const scrollToSection = (id) => {
		const element = document.getElementById(id);

		if (element) {
            window.scrollTo({
                top: element.offsetTop,
                behavior: 'smooth',
            });
		}

        // removeCookie('varAnchorPage', { path: '/'});
	};

    return (
        <div style={{ backgroundColor:'#FFFFFF' }}>
            <Header
                onClickSection={() => scrollToSection("section-dev")}
            />

            {/* <div style={{ height:'100vh', backgroundColor:'#FFFFFF' }}></div> */}

            <Hero />

            {/* <div style={{ paddingTop:50 }} /> */}

            {/* <div id="section-dev" className="section">
                <SectionDevelopments />
            </div>

            <div style={{ paddingTop:50 }} />

            <SectionProducts />

            <div style={{ paddingTop:50 }} />

            <UpcomingProducts/> */}
            
            <Footer
                onClickSection={() => scrollToSection("section-dev")}
            />
        </div>
    )
}

export default Home;