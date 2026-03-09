import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Gap, Header, Footer, CarouselHome, SectionDevelopments, SectionProducts, UpcomingProducts, HeroTentangKami, TentangKamiDesc, TentangKamiSection2, VisiMisi, TentangKamiSection3, PenghargaanSertifikasi } from '../../components';
import { useDispatch } from 'react-redux';
import { fetchStatus, generateSignature, historyConfig } from '../../utils/functions';
import { useCookies } from 'react-cookie';
import './tentang-kami.css'
import { paths } from '../../utils';

const TentangKami = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const [cookies, setCookie,removeCookie] = useCookies([]);

    useEffect(() => {
        // window.scroll(0,0)
    },[])

    return (
        <div style={{ backgroundColor:'#FFFFFF' }}>
            <Header
                onClickSection={() => window.location.href = "/comming-soon"}
                pageActive={"tentang-kami"}
            />

            <HeroTentangKami />

            <div style={{ paddingTop:70 }} />

            <TentangKamiDesc />

            <div style={{ paddingTop:100 }} />

            <TentangKamiSection2 />

            <div style={{ paddingTop:50 }} />

            <VisiMisi />

            <div style={{ paddingTop:50 }} />

            <TentangKamiSection3/>

            <div style={{ paddingTop:50 }} />

            <PenghargaanSertifikasi />

            <div style={{ paddingTop:100 }} />
            
            <Footer />
        </div>
    )
}

export default TentangKami;