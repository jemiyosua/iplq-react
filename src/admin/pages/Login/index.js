import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../components';
import './Login.css'
import { useDispatch } from 'react-redux';
// import { Button, Card, CardDeck, Modal } from 'react-bootstrap';
// import { setForm } from '../../redux';
import { AlertMessage, paths } from '../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import md5 from 'md5';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Markup } from 'interweave';
import { setForm } from '../../redux';

const Login = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    const [Loading, setLoading] = useState(false)
    const [Username, setUsername] = useState();
    const [Password, setPassword] = useState();
    const [ShowAlert, setShowAlert] = useState(true);
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")

    useEffect(() => {
        window.scrollTo(0, 0)

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

        if ((CookieParamKey == null && CookieParamKey == null) && (CookieUsername == null && CookieUsername == null)) {
            logout()
            history.push('/admin/login');
            return
        } else {
            history.push('/admin/dashboard');
            return
        }
    }, [])

    const logout = () => {
        removeCookie('varCookie', { path: '/' })
        removeCookie('varMerchantId', { path: '/' })
        removeCookie('varIdVoucher', { path: '/' })
        dispatch(setForm("ParamKey", ''))
        dispatch(setForm("Username", ''))
        dispatch(setForm("Role", ''))
        if (window) {
            sessionStorage.clear();
        }
    }

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        console.log("SecretCookie : " + SecretCookie)
        if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var Username = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Role = LongSecretCookie[2];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)

            if (tipe === "username") {
                return Username;
            } else if (tipe === "paramkey") {
                return ParamKey;
            } else if (tipe === "role") {
                return Role;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    const handelSubmitLogin = () => {

        let validasiMessage = "";
        if (Username == "") {
            validasiMessage = validasiMessage + "- Username can't null value.\n";
        }

        if (Password == "") {
            validasiMessage = validasiMessage + "- Password can't null value.\n";
        }

        if (validasiMessage != "") {
            setValidationMessage(validasiMessage);
            setShowAlert(true);
            return false;
        } else {

            var requestBody = JSON.stringify({
                "Username": Username,
                "Password": md5(Password)
            });

            var url = paths.URL_API_ADMIN + 'Login';
            var Signature = generateSignature(requestBody)

            setLoading(true)

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
                    setLoading(false)

                    if (data.error_code === "0") {
                        const date = new Date();
                        date.setDate(date.getDate() + 1);
                        setCookie('varCookie', data.username + "|" + data.paramkey + "|" + data.access + "|" + data.access_name, {path: '/', expires: new Date(date)})
                        window.location.href = "/admin/dashboard"

                    } else {
                        setErrorMessageAlert(data.error_message);
                        setShowAlert(true);
                        return false;
                    }
                })
                .catch((error) => {
                    setLoading(false)
                    if (error.message == 401) {
                        setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
                        setShowAlert(true);
                        return false;
                    } else if (error.message != 401) {
                        setErrorMessageAlert(AlertMessage.failedConnect);
                        setShowAlert(true);
                        return false;
                    }
                });
        }
    }

    return ( 
        <div className = "main-page">
            <div className = "container-form">

                {ErrorMessageAlert !== "" ?
                <SweetAlert 
                    danger 
                    show={ShowAlert}
                    onConfirm={() => {
                        setShowAlert(false)
                        setErrorMessageAlert("")
                    }}
                    btnSize="sm"
                >{ErrorMessageAlert}</SweetAlert>
                : ""}

                {ValidationMessage !== "" ?
                <SweetAlert
                    show={ShowAlert}
                    onConfirm={() => {
                        setShowAlert(false)
                        setValidationMessage("")
                    }}
                    onEscapeKey={() => setShowAlert(false)}
                    onOutsideClick={() => setShowAlert(false)}
                    btnSize = "sm"
                >{() => (<div><p style = {{ fontSize: '20px',textAlign: 'left' }}>
                    <Markup content={ValidationMessage}/></p></div>)}
                </SweetAlert>
                : ""}

                <Gap height={30} />

                <p className = "title" style={{ textAlign: 'center' }}>IPLQ Admin</p>

                <Input 
                    label="Username"
                    placeholder="Username"
                    value={Username}
                    style={{ backgroundColor: "#F6FBFF" }}
                    onChange={event => {
                        setUsername(event.target.value)
                        dispatch(setForm("Username", event.target.value))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            handelSubmitLogin()
                            event.target.blur()
                        }
                    }}
                />

                <Gap height={18}/>

                <Input 
                    label="Password"
                    placeholder="Password"
                    value={Password}
                    type="password"
                    style={{ backgroundColor: "#F6FBFF" }}
                    onChange={event => {
                        setPassword(event.target.value)
                        dispatch(setForm("Password", event.target.value))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            handelSubmitLogin()
                            event.target.blur()
                        }
                    }}
                />

                <Gap height={30}/>

                <Button 
                    spinner={Loading}
                    title="Login"
                    onClick={() => handelSubmitLogin()}
                    style={{
                        backgroundColor: "#004372",
                        textAlign: 'center',
                        color: '#FFFFFF',
                        borderRadius: 10
                    }}
                />
                
                <Gap height={100}/>

            </div> 
        </div>
    )
}

export default Login;