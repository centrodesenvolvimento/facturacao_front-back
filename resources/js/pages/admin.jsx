import AdminSide from "../components/adminSide";
import "../../css/admin.css";
import Dashboard from "./dashboard";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useState } from "react";
import api from "../components/api";
import Loading1 from "../components/loading1";
import NovoDocumento from "./novoDocumento";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Admin = () => {
    const location = {};
    const navigate = {};
    const [name, setName] = useState(
        `${JSON.parse(sessionStorage.getItem("currentUser"))?.name}`
    );
    const [editName, setEditName] = useState({
        value: `${
            JSON.parse(sessionStorage.getItem("currentUser"))?.name
        } ricardo bastos`,
        status: false,
    });
    const [editEmail, setEditEmail] = useState({
        value: `${
            JSON.parse(sessionStorage.getItem("currentUser"))?.email
        } ricardocmbd@gmail.com`,
        status: false,
    });
    const [password, setPassword] = useState("");
    const [editPassword, setEditPassword] = useState({
        value: "",
        status: false,
    });
    const [fullName, setFullName] = useState("");
    const [confirm, setConfirm] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState([]);
    const [messages, setMessages] = useState([]);
    const [otherAccounts, setOtherAccounts] = useState([]);
    const [load, setLoad] = useState(false);
    const signup = () => {};
    const updateUser = (payload) => {
        let user = JSON.parse(sessionStorage.getItem("currentUser"));
        setErrors([]);
        setMessages([]);
        const r = /^[^\s]*@[a-z0-9.-]*\.[a-z]{2,6}$/;
        
        setErrors([]);
        if (payload.field == "name") {
            if (editName?.value.split(/\s(?=\S)/gi).length < 2) {
                setErrors(["Segundo nome necessário!"]);
            } else if (editName?.value.split(/\s(?=\S)/gi).length > 2) {
                setErrors(["Só o primeiro e último nome são necessários!"]);
            } else if (editName?.value == payload.name) {
                setErrors(["Não realizaste nenhuma alteração!"]);
            } else {
                setLoad(true)
                let token = JSON.parse(sessionStorage.getItem("token"));
                api.post(
                    `/v1/updateUser/name/${payload.user.id}`,
                    {
                        ...payload.payload,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${
                                JSON.parse(sessionStorage.getItem("token")).token
                            }`,
                            "Content-Type": "application/json",
                        },
                    }
                )
                    .then((res) => {
                        //('res', res.data.data)
                        // localStorage.setItem('user', JSON.stringify(res.data.data))
                        setLoad(false)
                        setMessages(["Alteração salva."]);
                        
                    })
                    .catch((err) => {
                        setLoad(false)
                        setErrors([err.response.data.message]);
                    });
            }
        } else if (payload.field == "email") {
            if (!r.test(editEmail.value)) {
                setErrors(["Formato de email inválido!"]);
            } else if (editEmail.value == user.email) {
                setErrors(["Não realizaste nenhuma alteração!"]);
            } else {
                setLoad(true)
                let token = JSON.parse(sessionStorage.getItem("token"));
                api.post(
                    `/v1/updateUser/email/${user.id}`,
                    {
                        ...payload.payload,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${
                                JSON.parse(sessionStorage.getItem("token")).token
                            }`,
                            "Content-Type": "application/json",
                        },
                    }
                )
                    .then((res) => {
                        //('res', res.data.data)
                        setLoad(false)
                        sessionStorage.setItem(
                            "currentUser",
                            JSON.stringify(res.data.data)
                        );
                        setMessages(["Alteração salva."]);
                        
                    })
                    .catch((err) => {
                        setLoad(false)
                        //('err', err.response, 'id', user.id)
                        setErrors([err.response.data.message]);
                    });
            }
        } else if (payload.field == "status") {
            if (JSON.parse(localStorage.getItem("user")).level != 0) {
                setErrors([
                    "Apenas o admin principal poderá adicionar contas!",
                ]);
            } else {
                let token = JSON.parse(sessionStorage.getItem("token"));
                api.post(
                    `api/auth/updateUser/status/${payload.user.id}`,
                    {
                        ...payload.payload,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${
                                JSON.parse(sessionStorage.getItem("token")).token
                            }`,
                            "Content-Type": "application/json",
                        },
                    }
                )
                    .then((res) => {
                        //('res', res.data.data)
                        // localStorage.setItem('user', JSON.stringify(res.data.data))
                        setMessages(["Alteração salva."]);
                        
                    })
                    .catch((err) => {
                        //('err', err.response, 'id', user.id)
                        setErrors([err.response.data.message]);
                    });
            }
        } else {
            if (editPassword.value.length == 0 || password.length == 0) {
                setErrors(["Preencha todos os campos!"]);
            } else if (editPassword.value != localStorage.getItem("password")) {
                setErrors([
                    "Senha actual incorrecta. Tente novamente! Se esqueceu a senha actual contacte o admin principal.",
                ]);
            } else {
                setLoad(true);
                let token = JSON.parse(sessionStorage.getItem("token"));
                api.post(
                    `/v1/updateUser/password/${user.id}`,
                    {
                        password: password,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${
                                JSON.parse(sessionStorage.getItem("token")).token
                            }`,
                            "Content-Type": "application/json",
                        },
                    }
                )
                    .then((res) => {
                        setLoad(false)
                        //('res', res.data.data)
                        sessionStorage.setItem(
                            "currentUser",
                            JSON.stringify(res.data.data)
                        );
                        localStorage.setItem("password", password);
                        setMessages(["Alteração salva."]);
                       
                    })
                    .catch((err) => {
                        setLoad(false)
                        //('err', err.response, 'id', user.id)
                        setErrors([err.response.data.message]);
                    });
            }
        }
    };

    return (
        <div>
             <ToastContainer
        position="top-center"
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 10000 }}
      />
            <Loading1 loading={load}/>
            <section className="adminHeader1">
                <section className="adminHeader">
                    <div className="header">
                        <div className="logo">Level-Invoice</div>
                        <div className="description">
                            {/* Sistema de gestão de estagiários */}
                        </div>
                    </div>

                    {/*  */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <Popover>
                            <PopoverTrigger>
                                <div className="profilepic">
                                    {name?.[0]}
                                    {name?.split(" ")[1][0]}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="profilePop" style={{}}>
                                <div className="username">{`${
                                    JSON.parse(
                                        sessionStorage.getItem("currentUser")
                                    )?.name
                                }`}</div>
                                <div
                                    className="email"
                                    style={{
                                        fontSize: 14,
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                    title={`${
                                        JSON.parse(
                                            sessionStorage.getItem(
                                                "currentUser"
                                            )
                                        )?.email
                                    }`}
                                >{`${
                                    JSON.parse(
                                        sessionStorage.getItem("currentUser")
                                    )?.email
                                }`}</div>
                                <div
                                    className="email"
                                    style={{ color: "green" }}
                                >{`${
                                    JSON.parse(localStorage.getItem("user"))
                                        ?.info?.funcao
                                }`}</div>
                                <Sheet
                                    onOpenChange={(e) => {
                                        let user = JSON.parse(
                                            sessionStorage.getItem(
                                                "currentUser"
                                            )
                                        );
                                        setEditName({
                                            status: false,
                                            value: user?.name,
                                        });
                                        setEditPassword({
                                            status: false,
                                            value: "",
                                        });
                                        setEditEmail({
                                            status: false,
                                            value: user?.email,
                                        });
                                        setMessages([]);
                                        setErrors([]);
                                    }}
                                >
                                    <SheetTrigger
                                        style={{
                                            width: "100%",
                                            outline: "none",
                                            boxShadow: "none",
                                        }}
                                    >
                                        <div
                                            className="option"
                                            style={{ marginTop: 15 }}
                                        >
                                            <span className="optionText">
                                                Perfil
                                            </span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                class="bi bi-chevron-right"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                                                />
                                            </svg>
                                        </div>
                                    </SheetTrigger>
                                    <SheetContent className="profileSheet">
                                        <SheetHeader
                                            style={{ alignItems: "flex-start" }}
                                        >
                                            <SheetTitle>Perfil</SheetTitle>
                                            <SheetDescription>
                                                Opções para editar perfil ou
                                                fazer logout.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="profileHeader">
                                            <div className="profilepic">
                                                {" "}
                                                {name[0]}
                                                {name.split(" ")[1][0]}
                                            </div>
                                            <div className="profileName">
                                                {name}
                                            </div>
                                        </div>
                                        <section className="section">
                                            <div className="sectionHeader">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    class="bi bi-person"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                                </svg>
                                                Perfil
                                            </div>

                                            <section className="form">
                                                <div className="label">
                                                    Email
                                                </div>
                                                <div className="inputRow">
                                                    <input
                                                        disabled={
                                                            !editEmail.status
                                                        }
                                                        placeholder="Digite um email..."
                                                        className="loginInput"
                                                        value={editEmail.value}
                                                        onChange={(e) =>
                                                            setEditEmail({
                                                                ...editEmail,
                                                                value: e.target
                                                                    .value,
                                                            })
                                                        }
                                                    />
                                                    {editEmail.status ? (
                                                        <div className="buttons">
                                                            <div
                                                                className="cancel"
                                                                onClick={() => {
                                                                    setEditEmail(
                                                                        {
                                                                            ...editEmail,
                                                                            status: false,
                                                                        }
                                                                    );
                                                                    setErrors(
                                                                        []
                                                                    );
                                                                    setMessages(
                                                                        []
                                                                    );
                                                                }}
                                                            >
                                                                Cancelar
                                                            </div>
                                                            <div
                                                                onClick={() => {
                                                                    updateUser({
                                                                        field: "email",
                                                                        payload:
                                                                            {
                                                                                email: editEmail.value,
                                                                            },
                                                                    });
                                                                }}
                                                                className="save"
                                                            >
                                                                Guardar
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <svg
                                                            onClick={() => {
                                                                setEditEmail({
                                                                    ...editEmail,
                                                                    status: true,
                                                                });
                                                                setEditName({
                                                                    ...editName,
                                                                    status: false,
                                                                });
                                                                setEditPassword(
                                                                    {
                                                                        ...editPassword,
                                                                        status: false,
                                                                    }
                                                                );
                                                            }}
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            class="bi bi-pencil-square"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                            <path
                                                                fill-rule="evenodd"
                                                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </section>
                                            <div
                                                className="errors"
                                                style={{
                                                    display: editEmail.status
                                                        ? "block"
                                                        : "none",
                                                }}
                                            >
                                                {errors.length > 0 &&
                                                    errors.map(
                                                        (item, index) => {
                                                            return (
                                                                <div
                                                                    className="error"
                                                                    key={index}
                                                                >
                                                                    {item}
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                            <div
                                                className="errors"
                                                style={{
                                                    display: editEmail.status
                                                        ? "block"
                                                        : "none",
                                                }}
                                            >
                                                {messages.length > 0 &&
                                                    messages.map(
                                                        (item, index) => {
                                                            return (
                                                                <div
                                                                    style={{
                                                                        color: "green",
                                                                    }}
                                                                    className="error"
                                                                    key={index}
                                                                >
                                                                    {item}
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                        </section>

                                        <section className="section">
                                            <div className="sectionHeader">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    class="bi bi-shield-check"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56" />
                                                    <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                                                </svg>
                                                Segurança
                                            </div>
                                            <section className="form">
                                                <div className="label">
                                                    Senha Actual
                                                </div>
                                                <div className="inputRow">
                                                    <input
                                                        disabled={
                                                            !editPassword.status
                                                        }
                                                        placeholder="Senha Actual..."
                                                        className="loginInput"
                                                        value={
                                                            editPassword.value
                                                        }
                                                        onChange={(e) =>
                                                            setEditPassword({
                                                                ...editPassword,
                                                                value: e.target
                                                                    .value,
                                                            })
                                                        }
                                                    />
                                                    <svg
                                                        style={{
                                                            display: `${
                                                                editPassword.status
                                                                    ? "none"
                                                                    : "inline"
                                                            }`,
                                                        }}
                                                        onClick={() => {
                                                            setEditPassword({
                                                                ...editPassword,
                                                                status: true,
                                                            });
                                                            setEditName({
                                                                ...editName,
                                                                status: false,
                                                            });
                                                            setEditEmail({
                                                                ...editEmail,
                                                                status: false,
                                                            });
                                                        }}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        class="bi bi-pencil-square"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                        <path
                                                            fill-rule="evenodd"
                                                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                        />
                                                    </svg>
                                                </div>
                                            </section>
                                            {editPassword.status && (
                                                <section className="form">
                                                    <div className="label">
                                                        Nova Senha
                                                    </div>
                                                    <div className="inputRow">
                                                        <input
                                                            placeholder="Nova Senha..."
                                                            className="loginInput"
                                                            value={password}
                                                            onChange={(e) =>
                                                                setPassword(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </section>
                                            )}
                                            {editPassword.status && (
                                                <section className="passwordButtons">
                                                    <div
                                                        className="cancel"
                                                        onClick={() => {
                                                            setEditPassword({
                                                                ...editPassword,
                                                                status: false,
                                                            });
                                                            setErrors([]);
                                                            setMessages([]);
                                                        }}
                                                    >
                                                        Cancelar
                                                    </div>
                                                    <div
                                                        className="save"
                                                        onClick={() => {
                                                            updateUser({
                                                                field: "password",
                                                                payload: {
                                                                    password:
                                                                        editPassword.value,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Salvar Senha
                                                    </div>
                                                </section>
                                            )}
                                            <div
                                                className="errors"
                                                style={{
                                                    display: editPassword.status
                                                        ? "block"
                                                        : "none",
                                                }}
                                            >
                                                {errors.length > 0 &&
                                                    errors.map(
                                                        (item, index) => {
                                                            return (
                                                                <div
                                                                    className="error"
                                                                    key={index}
                                                                >
                                                                    {item}
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                            <div
                                                className="errors"
                                                style={{
                                                    display: editPassword.status
                                                        ? "block"
                                                        : "none",
                                                }}
                                            >
                                                {messages.length > 0 &&
                                                    messages.map(
                                                        (item, index) => {
                                                            return (
                                                                <div
                                                                    style={{
                                                                        color: "green",
                                                                    }}
                                                                    className="error"
                                                                    key={index}
                                                                >
                                                                    {item}
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                        </section>
                                    </SheetContent>
                                </Sheet>
                                {otherAccounts.length > 0 && (
                                    <div className="title">Contas</div>
                                )}{" "}
                                {otherAccounts.map((item, index) => {
                                    return (
                                        <Sheet
                                            onOpenChange={(e) => {
                                                if (e) {
                                                    //'oke', item.name)
                                                    setEditName({
                                                        status: false,
                                                        value: item.name,
                                                    });
                                                } else {
                                                    let user = JSON.parse(
                                                        localStorage.getItem(
                                                            "user"
                                                        )
                                                    );
                                                    setEditName({
                                                        status: false,
                                                        value: user.name,
                                                    });
                                                    setEditPassword({
                                                        status: false,
                                                        value: "",
                                                    });
                                                    setEditEmail({
                                                        status: false,
                                                        value: user.email,
                                                    });
                                                    setMessages([]);
                                                    setErrors([]);
                                                }
                                            }}
                                        >
                                            <SheetTrigger
                                                style={{
                                                    width: "100%",
                                                    outline: "none",
                                                    boxShadow: "none",
                                                }}
                                            >
                                                <div
                                                    className="profile"
                                                    onClick={() => {
                                                        if (
                                                            JSON.parse(
                                                                localStorage.getItem(
                                                                    "user"
                                                                )
                                                            ).level != 0
                                                        ) {
                                                            // window.confirm('Atenção! Apenas o admin poderá fazer uso das funções que se seguem.' + JSON.parse(localStorage.getItem('user')).level)
                                                        }
                                                    }}
                                                >
                                                    <div className="profilePic">
                                                        {item.name[0]}
                                                        {
                                                            item.name.split(
                                                                " "
                                                            )[1][0]
                                                        }
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "flex-start",
                                                        }}
                                                    >
                                                        <div
                                                            className="name"
                                                            style={{
                                                                marginBottom:
                                                                    -2,
                                                            }}
                                                        >
                                                            {item.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                textTransform:
                                                                    "capitalize",
                                                                color:
                                                                    item.status ==
                                                                    "activo"
                                                                        ? "green"
                                                                        : "red",
                                                            }}
                                                        >
                                                            {item.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SheetTrigger>
                                            <SheetContent className="profileSheet">
                                                <SheetHeader
                                                    style={{
                                                        alignItems:
                                                            "flex-start",
                                                    }}
                                                >
                                                    <SheetTitle>
                                                        Perfil
                                                    </SheetTitle>
                                                    <SheetDescription>
                                                        Opções para editar nome
                                                        de utilizadores e
                                                        desactivar contas.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className="profileHeader">
                                                    <div className="profilepic">
                                                        {" "}
                                                        {item.name[0]}
                                                        {
                                                            item.name.split(
                                                                " "
                                                            )[1][0]
                                                        }
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                        }}
                                                    >
                                                        <div className="profileName">
                                                            {item.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                                alignItems:
                                                                    "flex-end",
                                                                gap: 6,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: "grey",
                                                                    fontSize: 13,
                                                                }}
                                                            >
                                                                Status:{" "}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    color:
                                                                        item.status ==
                                                                        "activo"
                                                                            ? "green"
                                                                            : "red",
                                                                    fontWeight:
                                                                        "500",
                                                                    fontSize: 14,
                                                                }}
                                                            >
                                                                {item.status ==
                                                                "activo"
                                                                    ? "Activo"
                                                                    : "Inactivo"}
                                                            </span>{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <section className="section">
                                                    <div className="sectionHeader">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            class="bi bi-person"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                                        </svg>
                                                        Perfil
                                                    </div>

                                                    <section className="form">
                                                        <div className="label">
                                                            Primeiro e Último
                                                            Nome
                                                        </div>
                                                        <div className="inputRow">
                                                            <input
                                                                disabled={
                                                                    !editName.status
                                                                }
                                                                placeholder="Digite..."
                                                                className="loginInput"
                                                                value={
                                                                    editName.value
                                                                }
                                                                onChange={(e) =>
                                                                    setEditName(
                                                                        {
                                                                            ...editName,
                                                                            value: e
                                                                                .target
                                                                                .value,
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                            {editName.status ? (
                                                                <div className="buttons">
                                                                    <div
                                                                        className="cancel"
                                                                        onClick={() => {
                                                                            setEditName(
                                                                                {
                                                                                    ...editName,
                                                                                    status: false,
                                                                                }
                                                                            );
                                                                            setErrors(
                                                                                []
                                                                            );
                                                                            setMessages(
                                                                                []
                                                                            );
                                                                        }}
                                                                    >
                                                                        Cancelar
                                                                    </div>
                                                                    <div
                                                                        onClick={() => {
                                                                            updateUser(
                                                                                {
                                                                                    field: "name",
                                                                                    payload:
                                                                                        {
                                                                                            name: editName.value,
                                                                                        },
                                                                                    user: item,
                                                                                }
                                                                            );
                                                                        }}
                                                                        className="save"
                                                                    >
                                                                        Guardar
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <svg
                                                                    onClick={() => {
                                                                        setEditName(
                                                                            {
                                                                                ...editName,
                                                                                status: true,
                                                                            }
                                                                        );
                                                                        setEditEmail(
                                                                            {
                                                                                ...editEmail,
                                                                                status: false,
                                                                            }
                                                                        );
                                                                        setEditPassword(
                                                                            {
                                                                                ...editPassword,
                                                                                status: false,
                                                                            }
                                                                        );
                                                                    }}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="currentColor"
                                                                    class="bi bi-pencil-square"
                                                                    viewBox="0 0 16 16"
                                                                >
                                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                                    <path
                                                                        fill-rule="evenodd"
                                                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        {/* errors */}
                                                    </section>
                                                </section>

                                                <section className="section">
                                                    <div className="sectionHeader">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            class="bi bi-file-x"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M6.146 6.146a.5.5 0 0 1 .708 0L8 7.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 8l1.147 1.146a.5.5 0 0 1-.708.708L8 8.707 6.854 9.854a.5.5 0 0 1-.708-.708L7.293 8 6.146 6.854a.5.5 0 0 1 0-.708" />
                                                            <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1" />
                                                        </svg>
                                                        {item.status == "activo"
                                                            ? "Desactivar Conta"
                                                            : "Activar Conta"}
                                                    </div>
                                                    <section className="passwordButtons">
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    item.status ==
                                                                    "activo"
                                                                        ? "red"
                                                                        : "green",
                                                                borderColor:
                                                                    item.status ==
                                                                    "activo"
                                                                        ? "red"
                                                                        : "green",
                                                            }}
                                                            className="save"
                                                            onClick={() => {
                                                                updateUser({
                                                                    field: "status",
                                                                    payload: {
                                                                        status:
                                                                            item.status ==
                                                                            "activo"
                                                                                ? "inactivo"
                                                                                : "activo",
                                                                    },
                                                                    user: item,
                                                                });
                                                            }}
                                                        >
                                                            {item.status ==
                                                            "activo"
                                                                ? "Desactivar Conta"
                                                                : "Activar Conta"}
                                                        </div>
                                                        <div
                                                            style={{
                                                                opacity: 0,
                                                            }}
                                                            className="cancel"
                                                        >
                                                            Cancelar
                                                        </div>
                                                    </section>
                                                    <div
                                                        className="errors"
                                                        style={{
                                                            display:
                                                                !editName.status
                                                                    ? "block"
                                                                    : "none",
                                                        }}
                                                    >
                                                        {errors.length > 0 &&
                                                            errors.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => {
                                                                    return (
                                                                        <div
                                                                            className="error"
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {
                                                                                item
                                                                            }
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                    </div>
                                                    <div
                                                        className="errors"
                                                        style={{
                                                            display:
                                                                !editName.status
                                                                    ? "block"
                                                                    : "none",
                                                        }}
                                                    >
                                                        {messages.length > 0 &&
                                                            messages.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => {
                                                                    return (
                                                                        <div
                                                                            style={{
                                                                                color: "green",
                                                                            }}
                                                                            className="error"
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {
                                                                                item
                                                                            }
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                    </div>
                                                </section>
                                            </SheetContent>
                                        </Sheet>
                                    );
                                })}
                                <AlertDialog>
                                    <AlertDialogTrigger
                                        style={{ width: "100%" }}
                                    >
                                        <div className="option">
                                            <span className="optionText">
                                                Logout
                                            </span>
                                            <svg
                                                color="red"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                class="bi bi-box-arrow-left"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"
                                                />
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"
                                                />
                                            </svg>
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent
                                        style={{
                                            flexDirection: "column",
                                            display: "flex",
                                            alignItems: "center",
                                            textAlign: "center",
                                        }}
                                    >
                                        <span>
                                            <AlertDialogTitle>
                                                Sair de conta
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Deseja mesmo sair de conta? Terá
                                                de fazer login de novo para
                                                acessar o painel administrativo.
                                            </AlertDialogDescription>
                                        </span>
                                        <span
                                            style={{
                                                alignSelf: "center",
                                                marginTop: 15,
                                                display: "flex",
                                                flexDirection: "row",
                                                gap: 10,
                                                alignItems: "center",
                                            }}
                                        >
                                            <AlertDialogCancel
                                                style={{ margin: 0 }}
                                            >
                                                Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                style={{ margin: 0 }}
                                                onClick={() => {
                                                    window.location.href =
                                                        "/login";
                                                    sessionStorage.removeItem(
                                                        "currentUserPolo"
                                                    );
                                                    sessionStorage.removeItem(
                                                        "currentUser"
                                                    );

                                                    sessionStorage.removeItem(
                                                        "token"
                                                    );
                                                    sessionStorage.removeItem(
                                                        "permissions"
                                                    );
                                                    sessionStorage.removeItem(
                                                        "roles"
                                                    );
                                                    sessionStorage.removeItem(
                                                        "modulos_associados"
                                                    );
                                                    sessionStorage.removeItem(
                                                        "fullUserPolo"
                                                    );
                                                     sessionStorage.removeItem(
                                                        "fullUserEmpresa"
                                                    );
                                                }}
                                            >
                                                Confirmar
                                            </AlertDialogAction>
                                        </span>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </PopoverContent>
                        </Popover>
                    </div>
                </section>
            </section>
            <div className="preAdminBody">
                <div className="adminBody">
                    <AdminSide />
                    <div className="body">

                        {window.location.pathname.endsWith("/dashboard") ? (
                            <Dashboard />
                        ) : window.location.pathname.endsWith("/novo/documento") ? (
                            <NovoDocumento />
                        ) : (
                            <div>Caminho não existe!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Admin;
