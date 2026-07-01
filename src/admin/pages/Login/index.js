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
import { Checkbox } from 'flowbite-react';
import { IconLogoIPLQ } from '../../assets';

const Login = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    const [Loading, setLoading] = useState(false)

    const [Username, setUsername] = useState();
    const [Password, setPassword] = useState();

    const [UsernameFocused, setUsernameFocused] = useState(false);
    const [PasswordFocused, setPasswordFocused] = useState(false);

    const [ShowPassword, setShowPassword] = useState(false);

    const [ShowAlert, setShowAlert] = useState(true);
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    

    
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [progressWidth, setProgressWidth] = useState(0);
    const [loginBtnHover, setLoginBtnHover] = useState(false);
    const [ssoBtnHover, setSsoBtnHover] = useState(false);

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

    

    const handleLogin = (e) => {
        e.preventDefault();
        if (isLoading || isSuccess) return;
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => setProgressWidth(100), 100);
            handelSubmitLogin()
        }, 2000);
    };

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
                        setCookie('varCookie', data.username + "|" + data.paramkey + "|" + data.access + "|" + data.access_name + "|" + data.cluster + "|" + data.cluster_id + "|" + data.sheet_id + "|" + data.sheet_name, {path: '/', expires: new Date(date)})
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

    function Spinner() {
        return (
            <div
                style={{
                width: 16,
                height: 16,
                border: "2px solid rgba(154,232,0,0.3)",
                borderTopColor: COLORS.primary,
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
                }}
            />
        );
    }

    return (
        <div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input::placeholder { color: #9ca3af; }
            `}</style>

            <div style={styles.root}>
                {/* Background effects */}
                {/* <div style={styles.bgGrid} /> */}
                {/* <div style={styles.bgCircle1} /> */}
                {/* <div style={styles.bgCircle2} /> */}

                {/* Main card */}
                <div style={styles.card}>
                {/* Left panel */}
                <div style={styles.leftPanel}>
                    {/* <div style={styles.brandMark}>
                        <div style={styles.brandIcon}>
                        </div>
                        <span style={styles.brandName}>GreenCore</span>
                    </div> */}
                    <img src={IconLogoIPLQ} alt="logo" style={{ height:80, width:200 }}  />

                    <h1 style={styles.headline}>
                        Kelola Cluster<br />
                        dengan lebih{" "}
                        <em style={styles.headlineAccent}>cerdas</em>
                    </h1>

                    <p style={styles.subtext}>
                    Platform administrasi terpusat untuk memantau, menganalisis,
                    dan mengelola seluruh operasional Cluster Anda secara melalui Aplikasi IPL-Q.
                    </p>

                    {/* <div style={styles.statsRow}>
                        <div>
                            <div style={styles.statNum}>98.7%</div>
                            <div style={styles.statLabel}>Uptime</div>
                        </div>
                        <div style={styles.statDivider} />
                        <div>
                            <div style={styles.statNum}>12.4k</div>
                            <div style={styles.statLabel}>Pengguna aktif</div>
                        </div>
                        <div style={styles.statDivider} />
                        <div>
                            <div style={styles.statNum}>256-bit</div>
                            <div style={styles.statLabel}>Enkripsi SSL</div>
                        </div>
                    </div> */}
                </div>

                {/* Right panel */}
                <div style={styles.rightPanel}>
                    <span style={styles.versionTag}>v2.4.1</span>

                    {!isSuccess ? (
                    <form onSubmit={handleLogin}>
                        <p style={styles.eyebrow}>Admin Portal</p>
                        <h2 style={styles.formTitle}>Masuk ke akun</h2>
                        <p style={styles.formHint}>Masukkan kredensial administrator Anda</p>

                        <div style={styles.fieldGroup}>
                            <label style={styles.fieldLabel} htmlFor="email">
                                Username
                            </label>
                            <div style={styles.fieldWrapper}>
                                <span style={styles.fieldIconWrap}>✉</span>
                                <input
                                    id="username"
                                    type="text"
                                    value={Username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setUsernameFocused(true)}
                                    onBlur={() => setUsernameFocused(false)}
                                    placeholder="admin"
                                    style={{
                                        ...styles.fieldInput,
                                        ...(UsernameFocused ? styles.fieldInputFocus : {}),
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div style={styles.fieldGroup}>
                        <label style={styles.fieldLabel} htmlFor="Password">
                            Password
                        </label>
                        <div style={styles.fieldWrapper}>
                            <span style={styles.fieldIconWrap}>🔒</span>
                            <input
                                id="password"
                                type={ShowPassword ? "text" : "password"}
                                value={Password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                placeholder="••••••••"
                                style={{
                                    ...styles.fieldInput,
                                    paddingRight: 40,
                                    ...(PasswordFocused ? styles.fieldInputFocus : {}),
                                }}
                                required
                            />
                            <button
                                type="button"
                                style={styles.eyeBtn}
                                onClick={() => setShowPassword(!ShowPassword)}
                                aria-label={ShowPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                            >
                            {ShowPassword ? "🙈" : "👁"}
                            </button>
                        </div>
                        </div>

                        {/* Options row */}
                        {/* <div style={styles.optionsRow}>
                            <label style={styles.rememberLabel}>
                                <Checkbox
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                />
                                Ingat saya
                            </label>
                            <button type="button" style={styles.forgotBtn}>
                                Lupa kata sandi?
                            </button>
                        </div> */}

                        {/* Login button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            onMouseEnter={() => setLoginBtnHover(true)}
                            onMouseLeave={() => setLoginBtnHover(false)}
                            style={{
                                ...styles.loginBtn,
                                background: loginBtnHover ? COLORS.darkHover : COLORS.dark,
                                opacity: isLoading ? 0.85 : 1,
                            }}
                        >
                        {isLoading ? (
                            <>
                            <Spinner />
                            Memverifikasi...
                            </>
                        ) : (
                            <>
                            Masuk ke Dashboard →
                            </>
                        )}
                        </button>

                        {/* SSO divider */}
                        {/* <div style={styles.dividerRow}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>atau lanjutkan dengan</span>
                        <div style={styles.dividerLine} />
                        </div> */}

                        {/* Footer */}
                        <div style={styles.footer}>
                        Dengan masuk, Anda menyetujui{" "}
                        <span style={styles.footerLink}>Kebijakan Privasi</span> kami
                        </div>
                    </form>
                    ) : (
                    /* Success state */
                    <div style={styles.successWrap}>
                        <div style={styles.successIcon}>✓</div>
                        <p style={styles.successTitle}>Selamat datang!</p>
                        <p style={styles.successSub}>Mengalihkan ke dashboard...</p>
                        <div style={styles.progressBar}>
                        <div
                            style={{
                            ...styles.progressFill,
                            width: `${progressWidth}%`,
                            }}
                        />
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    )
}

const COLORS = {
    primary: "#9AE800",
    dark: "#002C00",
    darkHover: "#003d00",
    white: "#ffffff",
    gray50: "#fafafa",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray700: "#374151",
    gray900: "#111827",
};
  
const styles = {
    root: {
		minHeight: "100vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		// background: COLORS.dark,
		fontFamily: "'DM Sans', sans-serif",
		padding: "1rem",
		position: "relative",
		overflow: "hidden",
    },
    bgGrid: {
		position: "fixed",
		inset: 0,
		backgroundImage: "linear-gradient(rgba(154,232,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(154,232,0,0.06) 1px, transparent 1px)",
		backgroundSize: "40px 40px",
		pointerEvents: "none",
		zIndex: 0,
    },
    bgCircle1: {
		position: "fixed",
		width: 400,
		height: 400,
		borderRadius: "50%",
		background: "radial-gradient(circle, rgba(154,232,0,0.1) 0%, transparent 70%)",
		top: -120,
		left: -120,
		pointerEvents: "none",
		zIndex: 0,
    },
    bgCircle2: {
		position: "fixed",
		width: 300,
		height: 300,
		borderRadius: "50%",
		background: "radial-gradient(circle, rgba(154,232,0,0.07) 0%, transparent 70%)",
		bottom: -80,
		right: "20%",
		pointerEvents: "none",
		zIndex: 0,
    },
    card: {
		display: "flex",
		width: "100%",
		maxWidth: 860,
		minHeight: 560,
		borderRadius: 20,
		overflow: "hidden",
		boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
		position: "relative",
		zIndex: 1,
    },
    leftPanel: {
		flex: 1,
		background: "#002C00",
		backdropFilter: "blur(12px)",
		borderRight: "1px solid rgba(154,232,0,0.12)",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		padding: "3rem 3rem 3rem 3.5rem",
    },
    brandMark: {
		display: "flex",
		alignItems: "center",
		gap: 10,
		marginBottom: "3rem",
    },
    brandIcon: {
		width: 36,
		height: 36,
		background: COLORS.primary,
		borderRadius: 8,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
    },
    brandName: {
		fontFamily: "'DM Serif Display', serif",
		fontSize: 20,
		color: COLORS.primary,
		letterSpacing: "0.02em",
    },
    headline: {
		fontFamily: "'DM Serif Display', serif",
		fontSize: 36,
		lineHeight: 1.15,
		color: COLORS.white,
		marginBottom: "1rem",
    },
    headlineAccent: {
		fontStyle: "italic",
		color: COLORS.primary,
    },
    subtext: {
		fontSize: 14,
		color: "rgba(154,232,0,0.5)",
		lineHeight: 1.7,
		maxWidth: 280,
		marginBottom: "2.5rem",
    },
    statsRow: {
		display: "flex",
		gap: "2rem",
		alignItems: "center",
    },
    statNum: {
		fontSize: 22,
		fontWeight: 600,
		color: COLORS.primary,
    },
    statLabel: {
		fontSize: 11,
		color: "rgba(154,232,0,0.4)",
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		marginTop: 2,
    },
    statDivider: {
		width: 1,
		height: 36,
		background: "rgba(154,232,0,0.15)",
    },
    rightPanel: {
		width: 360,
		background: COLORS.white,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		padding: "3rem 2.5rem",
		position: "relative",
    },
    versionTag: {
      position: "absolute",
      top: "1.5rem",
      right: "1.5rem",
      fontSize: 11,
      color: COLORS.gray400,
      letterSpacing: "0.08em",
    },
    eyebrow: {
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: COLORS.primary,
      fontWeight: 600,
      marginBottom: "0.4rem",
    },
    formTitle: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 26,
      color: COLORS.dark,
      marginBottom: "0.4rem",
    },
    formHint: {
      fontSize: 13,
      color: COLORS.gray500,
      marginBottom: "2rem",
    },
    fieldGroup: {
      marginBottom: "1.1rem",
    },
    fieldLabel: {
      display: "block",
      fontSize: 12,
      fontWeight: 500,
      color: COLORS.gray700,
      marginBottom: 6,
      letterSpacing: "0.03em",
    },
    fieldWrapper: {
      position: "relative",
    },
    fieldIconWrap: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: COLORS.gray400,
      display: "flex",
      pointerEvents: "none",
      fontSize: 16,
      zIndex: 1,
    },
    fieldInput: {
      width: "100%",
      height: 42,
      padding: "0 12px 0 38px",
      border: `1.5px solid ${COLORS.gray200}`,
      borderRadius: 8,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14,
      color: COLORS.gray900,
      background: COLORS.gray50,
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.15s, box-shadow 0.15s",
    },
    fieldInputFocus: {
      borderColor: COLORS.primary,
      background: COLORS.white,
      boxShadow: "0 0 0 3px rgba(154,232,0,0.15)",
    },
    eyeBtn: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: COLORS.gray400,
      display: "flex",
      alignItems: "center",
      padding: 0,
      fontSize: 16,
    },
    optionsRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "1.5rem",
    },
    rememberLabel: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 13,
      color: COLORS.gray500,
      cursor: "pointer",
    },
    forgotBtn: {
      fontSize: 13,
      color: COLORS.dark,
      fontWeight: 500,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      padding: 0,
    },
    loginBtn: {
      width: "100%",
      height: 44,
      background: COLORS.dark,
      color: COLORS.primary,
      border: "none",
      borderRadius: 8,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: "0.04em",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: "1.25rem",
      transition: "background 0.15s",
    },
    dividerRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: "1.25rem",
    },
    dividerLine: {
      flex: 1,
      height: 1,
      background: COLORS.gray200,
    },
    dividerText: {
      fontSize: 11,
      color: COLORS.gray400,
      whiteSpace: "nowrap",
    },
    ssoBtn: {
      width: "100%",
      height: 40,
      background: COLORS.white,
      border: `1.5px solid ${COLORS.gray200}`,
      borderRadius: 8,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      color: COLORS.gray700,
      fontWeight: 500,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "border-color 0.15s, background 0.15s",
    },
    footer: {
      marginTop: "1.5rem",
      textAlign: "center",
      fontSize: 12,
      color: COLORS.gray400,
      lineHeight: 1.6,
    },
    footerLink: {
      color: COLORS.dark,
      fontWeight: 500,
    },
    successWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
    successIcon: {
      width: 56,
      height: 56,
      background: "#f0fde0",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1rem",
      fontSize: 26,
      color: COLORS.dark,
    },
    successTitle: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 22,
      color: COLORS.dark,
      marginBottom: "0.5rem",
    },
    successSub: {
      fontSize: 13,
      color: COLORS.gray500,
      marginBottom: "1.5rem",
    },
    progressBar: {
      height: 3,
      background: COLORS.gray200,
      borderRadius: 2,
      overflow: "hidden",
      width: "100%",
    },
    progressFill: {
      height: "100%",
      background: COLORS.primary,
      borderRadius: 2,
      transition: "width 1.8s ease",
    },
};

export default Login;