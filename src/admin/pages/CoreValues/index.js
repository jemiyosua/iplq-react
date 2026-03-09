import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Alert, Gap } from '../../components'
import "../../App.css"
import { useSelector,useDispatch } from 'react-redux';
import { setForm } from '../../redux';
import { useCookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import "./Tab.css"
import ListCoreValues from './ListCoreValues';

const CoreValues = () => {
    const history = useHistory();
    const [OrderBy,setOrderBy] = useState("")
    const [Order,setOrder] = useState("DESC")

    const location = useLocation();
    // location.state.postContent
    const dispatch = useDispatch();
    const [cookies, setCookie,removeCookie] = useCookies(['user']);
    const [PageActive,setPageActive] = useState(1)

    const [AlertState, setAlertState] = useState("")
    const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

    const [TabActive, setTabActive] = useState("")

    useEffect(()=>{
        if (location.state == null) {
            setSuccessMessage("");
            setTabActive("master-product")
        } else {

            if (location.state.Tab !== "") {
                setTabActive(location.state.Tab)
            } else {
                setTabActive("master-product")
            }

            if (location.state.MessageSukses !== "") {
                setAlertState("success")
                setSuccessMessage(location.state.MessageSukses);
                setShowAlert(true);
            }
        }

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey === null || CookieParamKey === "" || CookieUsername === null || CookieUsername === ""){
            window.location.href="admin/login";
        }else{
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","ABOUT-US"))
            dispatch(setForm("SubPageActive","CORE-VALUES"))
        }

    },[])

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie !== "" && SecretCookie !== null) {
            var LongSecretCookie = SecretCookie.split("|");
            var Username = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return Username;            
            } else if (tipe === "paramkey") {
                return ParamKey;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    return (
        <div>
            <button role="tab">
                <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>LIST CORE VALUES</div>
            </button>
            
            <ListCoreValues />
        </div>
    )
}


export default CoreValues