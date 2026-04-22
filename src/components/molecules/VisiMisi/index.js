import React, { useEffect, useState, useRef } from 'react';
import { IcArrowBlackHeader, ImgExprience, ImgHomeProvided, ImgParkSerpong, ImgProjectComplete, ImgTentangKamiDesc } from '../../../assets';
import './visi-misi.css';
import { Gap } from '../../atoms';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';
import { Check, ContactSupportOutlined } from '@mui/icons-material';
import { setForm } from '../../../redux';
import { useDispatch } from 'react-redux';

function VisiMisi({ pageActive }) {

    const dispatch = useDispatch();

    const [IdCategory, setIdCategory] = useState("1")
    const [CategoryName, setCategoryName] = useState("Township")
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isOpen, setIsOpen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const targetRef = useRef(null);
    const targetRef2 = useRef(null);
    const targetRef3 = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isVisible2, setIsVisible2] = useState(false);
    const [isVisible3, setIsVisible3] = useState(false);

    const [ListVM, setListVM] = useState([])
    const [ListCoreValues, setListCoreValues] = useState([])

    useEffect(() => {

        dispatch(setForm("PageActive","visi-misi"))

    }, [])

    return (
        <section className="vm" id="vm">
      
            {/* TITLE */}
            <div className="vm-header">
                <span className="badge">Visi & Misi</span>
                <h2>
                Arah <span>Perjalanan Kami</span>
                </h2>
            </div>

            {/* CONTENT */}
            <div className="vm-container">

                {/* VISI */}
                <div className="vm-card">
                <div className="vm-title">
                    <div className="icon">👁️</div>
                    <h3>Visi</h3>
                </div>

                <p>
                    Menjadi platform manajemen hunian yang mendorong terciptanya ekosistem perumahan <b>cerdas</b>, 
                    <b> transparan</b>, dan <b> berkelanjutan</b> untuk meningkatkan 
                    kualitas hidup seluruh warga.
                </p>
                </div>

                {/* MISI */}
                <div className="vm-card">
                <div className="vm-title">
                    <div className="icon">🎯</div>
                    <h3>Misi</h3>
                </div>

               <ul className="feature-list">
                    <li><Check color="#9AE800" /> Menyederhanakan pengelolaan administrasi dan keuangan cluster melalui teknologi digital.</li>
                    <li><Check color="#9AE800" /> Meningkatkan keamanan dan kenyamanan hunian dengan solusi inovatif.</li>
                    <li><Check color="#9AE800" /> Membangun komunikasi transparan antara pengelola dan penghuni.</li>
                    <li><Check color="#9AE800" /> Menghadirkan layanan pelanggan terbaik dengan respon cepat.</li>
                </ul>
                </div>

            </div>
        </section>
    )
}

export default VisiMisi;