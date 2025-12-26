import { useState } from "react";
import "../../css/dashboard.css";
import Loading1 from "../components/loading1";
const Dashboard = () => {
    const [load, setLoad] = useState(false);
    const [stats, setStats] = useState(null);
    const formatCurrency = (value) => {
        if (!value && value !== 0) return "AOA 0";
        return `AOA ${value.toLocaleString("pt-AO")}`;
    };
    const [cards, setCards] = useState([
        {
            id: 1,
            title: "Nº total de facturas",
            iconClass: "ri-file-list-3-line",
            value: stats ? formatCurrency(stats.totalValor) : null,
            count: stats ? `${stats.total} Factura(s)` : null,
            backgroundColor: "#1f2c3e",
            textColor: "white",
        },
        {
            id: 2,
            title: "Facturas pagas",
            iconClass: "ri-checkbox-line",
            value: stats ? formatCurrency(stats.pagasValor) : null,
            count: stats ? `${stats.pagas} Factura(s)` : null,
        },
        {
            id: 3,
            title: "Facturas não pagas",
            iconClass: "ri-timer-line",
            value: stats ? formatCurrency(stats.naoPagasValor) : null,
            count: stats ? `${stats.naoPagas} Factura(s)` : null,
        },
        {
            id: 4,
            title: "Facturas vencidas",
            iconClass: "ri-close-circle-line",
            value: stats ? formatCurrency(stats.vencidasValor) : null,
            count: stats ? `${stats.vencidas} Factura(s)` : null,
        },
    ]);

    return (
        <div className="dashboardContainer">
            <Loading1 loading={load} />
            <div className="breadCrumb">
                <div className="title">Dashboard</div>
                <div className="dashboardContent">
                    DOCUMENTOS <div>></div> <span>DOCUMENTOS GERADOS</span>
                </div>
            </div>
            <section className="firstStats">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="card1"
                        style={{
                            backgroundColor: card.backgroundColor || "white",
                            color: card.textColor || "inherit",
                        }}
                    >
                        <div
                            className="card1Top"
                            style={{
                                color: (card.id == 1 && "white") || "inherit",
                            }}
                        >
                            <span style={{ color: card.id == 1 && "white" }}>
                                {card.title}
                            </span>
                            <div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-file-earmark-ruled"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5zM3 12v-2h2v2zm0 1h2v2H4a1 1 0 0 1-1-1zm3 2v-2h7v1a1 1 0 0 1-1 1zm7-3H6v-2h7z" />
                                </svg>{" "}
                            </div>
                        </div>
                        <div className="card1Middle">
                            {!stats ? (
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                    style={{
                                        marginRight: "auto",
                                        alignSelf: "flex-start",
                                    }}
                                >
                                    <span className="sr-only">Loading...</span>
                                </div>
                            ) : (
                                card.value
                            )}
                        </div>
                        <div
                            className="card1Bottom"
                            style={{ color: card.textColor || "inherit" }}
                        >
                            {stats ? card.count : "Factura(s)"}
                        </div>
                    </div>
                ))}
            </section>
            
        </div>
    );
};

export default Dashboard;
