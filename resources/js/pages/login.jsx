import Lottie from "lottie-react";
import { useState } from "react";
import Loading1 from "../components/loading1";
import heroAnimation from "../../json/hero.json";
import api from "../components/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/dialog";

const Login = () => {
    //
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [see, setSee] = useState(false);
    const [load, setLoad] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [seeNew, setSeeNew] = useState(false);
    const [seeConfirm, setSeeConfirm] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState(false);
    const [messages, setMessages] = useState([]);
    const [data, setData] = useState(null);
    const login = async () => {
        setErrors([]);

        if (!email || !password) {
            setErrors(["Preencha por favor todos os campos."]);
            return;
        }

        setLoad(true);

        api.post(`/v1/login`, {
            email: email,
            password: password,
        })
            .then((res) => {
                //'res', res.data)
                setData(res.data);
                let data = res.data;
                setLoad(false);
                if (data.access_token.user?.password_changed == "true") {
                    // if (false) {
                    console.log(data.access_token);
                    // Manejar datos exitosos
                    sessionStorage.setItem("toast", "true");
                    localStorage.setItem('password', password)
                    sessionStorage.setItem(
                        "currentUser",
                        JSON.stringify(data.access_token.user)
                    );
                    sessionStorage.setItem("token", data.access_token.token);
                    sessionStorage.setItem(
                        "roles",
                        JSON.stringify(data.access_token.roles)
                    );
                    sessionStorage.setItem(
                        "modulos_associados",
                        JSON.stringify(data.access_token.modulos_associados)
                    );
                    sessionStorage.setItem(
                        "permissions",
                        data.access_token.permissions
                    );
                    sessionStorage.setItem(
                        "currentUserPolo",
                        JSON.stringify(data.access_token?.user_logado_polo)
                    );
                    sessionStorage.setItem(
                        "fullUserPolo",
                        JSON.stringify(data.access_token?.full_user_polo)
                    );
                    sessionStorage.setItem(
                        "fullUserEmpresa",
                        JSON.stringify(data.access_token?.full_user_empresa)
                    );

                    window.location.href = "/v1/dashboard";
                } else {
                    api.get("/csrf-token").then((res) => {
                        document
                            .querySelector('meta[name="csrf-token"]')
                            .setAttribute("content", res.data.csrf_token);
                    });
                    setMessages([]);
                    setDone(false);
                    setOpen(true);
                }
            })
            .catch((err) => {
                setLoad(false);
                console.log("err", err);
                if (err?.response?.data?.message) {
                    setErrors([err.response.data.message]);
                } else {
                    setErrors(["Erro inesperado"]);
                }
            });
    };
    const savePassword = async () => {
        setErrors([]);
        setMessages([]);

        if (!newPassword || !confirm) {
            setErrors(["Preencha por favor todos os campos."]);
            return;
        } else if (newPassword !== confirm) {
            setErrors(["As senhas não coincidem. Tente novamente."]);
            return;
        }
        setLoad(true);
        api.post(
            `/v1/usuarios/changePassword/${data?.access_token?.user?.id}`,
            {
                password: newPassword,
            }
        )
            .then(() => {
                setLoad(false);
                setMessages([
                    "Senha alterada com sucesso! Clique em avançar para continuar.",
                ]);
                setDone(true);
            })
            .catch((err) => {
                setLoad(false);
                setErrors([
                    err?.response?.data?.message ||
                        "Erro inesperado. Tente novamente.",
                ]);
            });
    };
    const advance = () => {
        setOpen(false);
        localStorage.setItem('password', newPassword);
        sessionStorage.setItem(
            "currentUser",
            JSON.stringify(data?.access_token.user)
        );
        sessionStorage.setItem("token", data?.access_token.token);
        sessionStorage.setItem(
            "roles",
            JSON.stringify(data?.access_token.roles)
        );
        sessionStorage.setItem(
            "modulos_associados",
            JSON.stringify(data?.access_token.modulos_associados)
        );
        sessionStorage.setItem("permissions", data?.access_token.permissions);
        sessionStorage.setItem(
            "currentUserPolo",
            JSON.stringify(data?.access_token?.user_logado_polo)
        );
        sessionStorage.setItem(
            "fullUserPolo",
            JSON.stringify(data?.access_token?.full_user_polo)
        );
        sessionStorage.setItem(
            "fullUserEmpresa",
            JSON.stringify(data?.access_token?.full_user_empresa)
        );

        window.location.href = "/v1/dashboard";
    };
    return (
        <div
            className="loginContainer"
            style={{
                background: "white",
                position: "fixed",
                overflowY: "scroll",
            }}
        >
            <Dialog
                open={open}
                onOpenChange={(e) => {
                    setOpen(e);
                    setErrors([]);
                    setMessages([]);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mudar Senha</DialogTitle>
                        <DialogDescription style={{}}>
                            Para garantir a sua segurança, solicitamos que você
                            altere sua senha ao fazer seu primeiro login. Após
                            essa atualização, você poderá acessar normalmente o
                            seu perfil e aproveitar todos os recursos do site.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Form */}
                    <form className="space-y-4">
                        {/* Nova senha */}
                        <div className="form">
                            <label className="block mb-1 font-medium">
                                Nova senha
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    onSubmit={() => {}}
                                    style={{
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                        borderRight: 0,
                                    }}
                                    security="false"
                                    placeholder="Senha..."
                                    type={seeNew ? "text" : "password"}
                                    className="loginInput"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                />
                                <span
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#e2e2e2",
                                        height: 35,
                                        width: 35,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderTopRightRadius: 5,
                                        borderBottomRightRadius: 5,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setSeeNew(!seeNew);
                                    }}
                                >
                                    {seeNew ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-eye-slash"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-eye"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Confirmar nova senha */}
                        <div className="form">
                            <label className="block mb-1 font-medium">
                                Confirmar nova senha
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    onSubmit={() => {}}
                                    style={{
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                        borderRight: 0,
                                    }}
                                    security="false"
                                    placeholder="Senha..."
                                    type={seeConfirm ? "text" : "password"}
                                    className="loginInput"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                                <span
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#e2e2e2",
                                        height: 35,
                                        width: 35,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderTopRightRadius: 5,
                                        borderBottomRightRadius: 5,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setSeeConfirm(!seeConfirm);
                                    }}
                                >
                                    {seeConfirm ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-eye-slash"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-eye"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Errors and messages */}
                        <div className="errors">
                            {errors.length > 0 &&
                                errors.map((item, index) => {
                                    return (
                                        <div className="error" key={index}>
                                            {item}
                                        </div>
                                    );
                                })}
                        </div>
                        <div className="errors" style={{ color: "green" }}>
                            {messages.length > 0 &&
                                messages.map((item, index) => {
                                    return (
                                        <div
                                            className="error"
                                            key={index}
                                            style={{ color: "green" }}
                                        >
                                            {item}
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Buttons */}
                        {!load && !done && (
                            <div
                                className="loginButton"
                                onClick={() => {
                                    savePassword();
                                }}
                            >
                                Guardar
                            </div>
                        )}
                        {done && <div onClick={() => {
                            advance();
                        }} className="loginButton">Avançar</div>}
                    </form>
                </DialogContent>
            </Dialog>
            <Loading1 loading={load} />

            <div className="grid"></div>
            <div className="bottom"></div>

            <div className="header">
                <div className="logo">Level-Invoice</div>
                <div className="description"></div>
            </div>

            <div className="hero">
                <div className="info">
                    <div className="title">Bem-vindo de volta</div>
                    <div className="description">
                        Faça login para aceder ao sistema de facturação
                    </div>

                    <div className="lottie">
                        <Lottie
                            autoplay
                            loop
                            animationData={heroAnimation}
                            className="lottieItem"
                        />
                    </div>
                </div>

                <div className="login">
                    <div className="info" style={{ width: "85%" }}>
                        <div className="title">Painel Administrativo</div>
                        <div className="description">
                            Faça login para aceder ao painel administrativo
                        </div>
                        <div className="form">
                            <div className="label">Email</div>
                            <input
                                placeholder="Email..."
                                className="loginInput"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form">
                            <div className="label">Senha</div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    onSubmit={() => {
                                        alert("something");
                                    }}
                                    style={{
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                        borderRight: 0,
                                    }}
                                    security="false"
                                    placeholder="Senha..."
                                    type={see ? "text" : "password"}
                                    className="loginInput"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <span
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#e2e2e2",
                                        height: 35,
                                        width: 35,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderTopRightRadius: 5,
                                        borderBottomRightRadius: 5,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setSee(!see);
                                    }}
                                >
                                    {see ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-eye-slash"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-eye"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="errors">
                            {errors.length > 0 &&
                                errors.map((item, index) => {
                                    return (
                                        <div className="error" key={index}>
                                            {item}
                                        </div>
                                    );
                                })}
                        </div>

                        {!load && (
                            <div
                                className="loginButton"
                                onClick={() => {
                                    login();
                                }}
                            >
                                Login
                            </div>
                        )}
                        {/* {load && <div style={{height: 100, aspectRatio: 4/4}}>
                            <Lottie rendererSettings={
                            {
                                preserveAspectRatio: 'xMidYMid slice'
                            }
                            } autoplay loop animationData={require('../components/loading.json')}style={{width: '100%', height: '100%'}} className='lottieItem'/>
                            </div>} */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
