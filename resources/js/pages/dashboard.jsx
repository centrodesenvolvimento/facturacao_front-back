import { useEffect, useState } from "react";
import "../../css/dashboard.css";
import Loading1 from "../components/loading1";
import api from "../components/api";
import { format } from "date-fns";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover";
const Dashboard = () => {
    const [load, setLoad] = useState(false);
    const [stats, setStats] = useState(null);
    const formatCurrency = (value) => {
        if (value == null || value === undefined || value === "")
            return "AOA 0.00";
        return `AOA ${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };
    const flatpickrOptions = {
    // locale: Portuguese,
    // You may add other Flatpickr options here if needed
  };
    const [searchFilter, setSearchFilter] = useState("");
    const [poloFilter, setPoloFilter] = useState(null);
    const [yearFilter, setYearFilter] = useState(null);
    const [tipoFilter, setTipoFilter] = useState(null);
    const [monthFilter, setMonthFilter] = useState(null);
    const [typeDateFilter, setTypeDateFilter] = useState("Anual");
    const [dateRangeFilter, setDateRangeFilter] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [loadStats, setLoadStats] = useState(false);
    const [loadEmpresa, setLoadEmpresa] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [permission, setPermission] = useState(false); // placeholder
    const tiposDocumentos = [
        { name: "Factura", grupo: "FACTURAÇÃO", child: { state: "Active" } },
        {
            name: "Factura Global",
            grupo: "FACTURAÇÃO",
            child: { state: "Active" },
        },
        {
            name: "Factura Recibo",
            grupo: "FACTURAÇÃO",
            child: { state: "Active" },
        },
        {
            name: "Factura Pró-Forma",
            grupo: "INFORMATIVO",
            child: { state: "Active" },
        },
        { name: "Orçamento", grupo: "INFORMATIVO", child: { state: "Active" } },
        {
            name: "Encomendas",
            grupo: "INFORMATIVO",
            child: { state: "Active" },
        },
        { name: "Recibo", grupo: "d", child: { state: "Active" } },
        {
            name: "Nota de crédito (anulação)",
            grupo: "d",
            child: { state: "Active" },
        },
    ];
    
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
    const months = [
        {
            numero: 0,
            nome: "Janeiro",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 1,
            nome: "Fevereiro",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 2,
            nome: "Março",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 3,
            nome: "Abril",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 4,
            nome: "Maio",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 5,
            nome: "Junho",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 6,
            nome: "Julho",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 7,
            nome: "Agosto",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 8,
            nome: "Setembro",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 9,
            nome: "Outubro",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 10,
            nome: "Novembro",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
        {
            numero: 11,
            nome: "Dezembro",
            horas_faltas: 0,
            faltas_func: 0,
            lists: 0,
            list: [],
        },
    ];
    
    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            checkFilters();
        }
    };

    const removeItems = () => {
        sessionStorage.removeItem("factura");
    sessionStorage.removeItem("polo");
    };
    const openModal = (content) => {
        // implement modal logic
    };
    const changePage = (page) => {
        setCurrentPage(page);
        setPage(page);

        const polo = poloFilter || "";
        const year = yearFilter !== null ? yearFilter ?? "" : "";
        const month = monthFilter !== null ? monthFilter ?? "" : "";
        const tipo = tipoFilter !== null ? tipoFilter ?? "" : "";

        setLoadDocumentos(true);

        let apiUrl =
            `/v1/facturas` +
            `?polo=${polo}&year=${year}&month=${month}&tipo=${tipo}&page=${page}`;

        const dateRange = dateRangeFilter;

        if (typeDateFilter === "Intervalo") {
            if (dateRange?.from && dateRange?.to) {
                apiUrl =
                    `/v1/facturas` +
                    `?polo=${polo}` +
                    `&from=${new Date(dateRange.from).toISOString()}` +
                    `&to=${new Date(dateRange.to).toISOString()}` +
                    `&tipo=${tipo}&page=${page}`;
            } else {
                setLoadDocumentos(false);
                return;
            }
        }
        console.log("Fetching page:", page, apiUrl);
        api
            .get(apiUrl)
            .then((response) => {
                const data = response?.current_page ? response : response.data;

                console.trace("response change page", data);

                setDocumentosFun(
                    data?.data ? [...data?.data] : [],
                    data?.current_page,
                    perPage(),
                    data?.total
                );

                setResponse(data);

                const pagesArray = Array.from(
                    { length: data?.total_pages || 0 },
                    (_, i) => i + 1
                );

                setPages(pagesArray);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLoadDocumentos(false);
            });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const perPage = () => 16;
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = useState(1);
    const [loadDocumentos, setLoadDocumentos] = useState(false);
    const [documentos, setDocumentos] = useState([]);
    const [visibleDocumentos, setVisibleDocumentos] = useState([]);
    const [filteredDocumentos, setFilteredDocumentos] = useState([]);
    const canAddNotaCredito = (data) => true; // placeholder
    const exportPDF = (data, type) => {}; // placeholder
    const navigateToDetails = (data, recibo) => {
        sessionStorage.setItem("factura", JSON.stringify(data));
    sessionStorage.setItem(
      "polo",
      JSON.stringify(
        empresa?.polos?.find((i) => i?.id == poloFilter)
      )
    );

   
    const url = "/v1/novo/documento" + (recibo ? "?recibo=adicionar" : "");

    window.open(url, "_blank");
    }; // placeholder
    const showItem = (visibleDocs, data, index) => true; // placeholder
    const [years, setYears] = useState([]);
    const [pages, setPages] = useState([]);
    const getPages = () => {
        const totalPages = pages?.length;
        const current = currentPage;
        const sidePages = 3;
        const pages1 = [];

        pages1.push(1);

        if (current > sidePages + 2) {
            pages1.push("...");
        }

        const start = Math.max(2, current - sidePages);
        const end = Math.min(totalPages - 1, current + sidePages);

        for (let i = start; i <= end; i++) {
            pages1.push(i);
        }

        if (current < totalPages - (sidePages + 1)) {
            pages1.push("...");
        }

        if (totalPages > 1) {
            pages1.push(totalPages);
        }

        return pages1;
    };
    const [response, setResponse] = useState(null);

    const fetchEmpresa = () => {
        setLoadEmpresa(true);
        setLoadStats(true);
        localStorage.removeItem("factura");
        localStorage.removeItem("polo");
        let userData = JSON.parse(sessionStorage.getItem("userData") || "null");
        setPermission(
            [
                ...(JSON.parse(sessionStorage.getItem("roles") || "null") ||
                    []),
            ].some((i) => {
                return (
                    i?.name == "Super Administrador" ||
                    i?.name == "Administrador da Organização"
                );
            })
        );
        api.get("/v1/empresas")
            .then((res) => {
                console.trace("success", res.data);
                const data = res.data;
                let empresaItem = null;
                if (userData) {
                    empresaItem = data.find(
                        (i) => i?.id === userData?.empresa_id
                    );
                    setEmpresa(empresaItem);
                } else {
                    setEmpresa(data?.[0]);
                }

                const fullUserPolo = JSON.parse(
                    sessionStorage.getItem("fullUserPolo") || "null"
                );
                console.trace("empresaItem", empresaItem);
                if (fullUserPolo?.id) {
                    setPoloFilter(fullUserPolo.id ?? null);
                } else {
                    setPoloFilter(empresaItem?.polos?.[0]?.id ?? null);
                }

                setLoadEmpresa(false);
            })
            .catch((err) => {
                console.error("Error fetching empresas:", err);
                setLoadEmpresa(false);
            });

        // // Set form value
        // if (figuracoesForm?.setValue) {
        //     figuracoesForm.setValue("tipoFolha", userData?.tipoFolha || "A4");
        // }
    };

    useEffect(() => {
        fetchEmpresa();
    }, []);

    const setDocumentosFun = (response, currentPage, perPage, total) => {
        setDocumentos((list) =>
            [...response]
                .map((i, index) => {
                    return {
                        ...i,

                        index: (currentPage - 1) * perPage + index, // Calculate correct index
                    };
                })
                .sort((a, b) => {
                    return (
                        new Date(b?.sortDate)?.getTime() -
                        new Date(a?.sortDate)?.getTime()
                    );
                })
        );

        setFilteredDocumentos(
            [...response]
                .map((i, index) => {
                    return {
                        ...i,

                        index: (currentPage - 1) * perPage + index, // Global index
                    };
                })
                .sort((a, b) => {
                    return (
                        new Date(b?.sortDate)?.getTime() -
                        new Date(a?.sortDate)?.getTime()
                    );
                })
        );

        setVisibleDocumentos((list) =>
            response
                .map((item, index) => {
                    return {
                        ...item,
                        index: (currentPage - 1) * perPage + index, // Correct numbering
                    };
                })
                .sort((a, b) => {
                    return (
                        new Date(b?.sortDate)?.getTime() -
                        new Date(a?.sortDate)?.getTime()
                    );
                })
        );
    };
    const checkFilters = (dateRange) => {
        setPage(1);
        setCurrentPage(1);

        const search = searchFilter || "";
        const polo = poloFilter || "";

        const year = yearFilter !== null ? yearFilter ?? "" : "";
        const month =
            monthFilter !== null && searchFilter?.length === 0
                ? monthFilter ?? ""
                : "";
        const tipo = tipoFilter !== null ? tipoFilter ?? "" : "";

        setStats(null);
        setLoadDocumentos(true);

        let apiUrl1 = `/v1/facturas`;

        if (typeDateFilter === "Intervalo") {
            if (dateRange?.[0] && dateRange?.[1]) {
                apiUrl1 = `/v1/facturas?polo=${polo}&from=${new Date(
                    dateRange?.[0]
                ).toISOString()}&to=${new Date(
                    dateRange?.[1]
                ).toISOString()}&tipo=${tipo}&search=${search}`;
            } else {
                return;
            }
        } else {
            apiUrl1 = `/v1/facturas?polo=${polo}&year=${year}&month=${month}&tipo=${tipo}&search=${search}`;
        }

        console.log(polo, year, month, tipo);

        api.get(apiUrl1)
            .then((response) => {
                const resData = response.data;
                console.log("responseeeeee", resData);

                setLoadDocumentos(false);
                
                setYears(resData?.available_years);

                setDocumentosFun(
                    resData?.data || [],
                    resData?.current_page,
                    perPage(),
                    resData?.total
                );
                setResponse(resData);

                const totalPages = resData?.total_pages || 1;
                const pages = Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                );
                setPages(pages);
            })
            .catch((error) => {
                setLoadDocumentos(false);
                console.error("Error fetching data:", error);
            });

        setLoadStats(true);
        const apiUrl2 = `/v1/facturas/stats?polo=${polo}&year=${year}&month=${month}&tipo=${tipo}`;
        console.log(polo, year, month, tipo);

        api
            .get(apiUrl2)
            .then((response) => {
                setStats(response.data);
                setCards([
                    {
                        id: 1,
                        title: "Nº total de facturas",
                        iconClass: "ri-file-list-3-line",
                        value: formatCurrency(response.data?.totalValor || 0),
                        count: `${response.data?.total} Factura(s)`,
                        backgroundColor: "#1f2c3e",
                        textColor: "white",
                    },
                    {
                        id: 2,
                        title: "Facturas pagas",
                        iconClass: "ri-checkbox-line",
                        value: formatCurrency(response.data?.pagasValor || 0),
                        count: `${response.data?.pagas} Factura(s)`,
                    },
                    {
                        id: 3,
                        title: "Facturas não pagas",
                        iconClass: "ri-timer-line",
                        value: formatCurrency(
                            response.data?.naoPagasValor || 0
                        ),
                        count: `${response.data?.naoPagas} Factura(s)`,
                    },
                    {
                        id: 4,
                        title: "Facturas vencidas",
                        iconClass: "ri-close-circle-line",
                        value: formatCurrency(
                            response.data?.vencidasValor || 0
                        ),
                        count: `${response.data?.vencidas} Factura(s)`,
                    },
                ]);
                setLoadStats(false);
            })
            .catch((error) => {
                setLoadStats(false);
                console.error("Error fetching stats in filters:", error);
            });
    };
    useEffect(() => {
       
        if (typeDateFilter == "Intervalo") {
            

            if (dateRangeFilter?.[0] && dateRangeFilter?.[1]) {
                checkFilters(dateRangeFilter);
            }
        } else {
            checkFilters();
        }
    }, [
        poloFilter,
        yearFilter,
        monthFilter,
        tipoFilter,
        typeDateFilter,
        dateRangeFilter,
    ]);
    return (
        <div className="dashboardContainer">
            <Loading1 loading={load} />
            <div className="breadCrumb">
                <div className="title">Dashboard</div>
                <div className="dashboardContent">
                    DOCUMENTOS <div>{">"}</div> <span>DOCUMENTOS GERADOS</span>
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

            <div
                className="card"
                id="invoiceList"
                style={{ border: "1px solid #eeeeee" }}
            >
                {/* ================= HEADER ================= */}
                <div
                    className="card-header border-0"
                    style={{ background: "#edeff2ff" }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <h5 className="card-title mb-0 fs-17">Documentos</h5>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 0,
                                border: "1px solid #dfdfdf",
                                paddingLeft: 10,
                                background: "white",
                                borderRadius: 4,
                                height: 40,
                                flex: 1,
                            }}
                            className="searchBar"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-search"
                                viewBox="0 0 16 16"
                            >
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                            </svg>
                            <input
                                type="text"
                                className="form-control form-control-icon"
                                placeholder="Pesquisar por um Nº de documento, cliente, NIF..."
                                value={searchFilter}
                                onChange={(e) =>
                                    setSearchFilter(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && checkFilters()
                                }
                                style={
                                    !(
                                        !loadEmpresa &&
                                        !loadDocumentos &&
                                        !loadStats
                                    )
                                        ? {
                                              pointerEvents: "none",
                                              opacity: 0.5,
                                              border: "none !important",
                                              outline: "none !important",
                                          }
                                        : {
                                              border: "none !important",
                                              outline: "none !important",
                                          }
                                }
                            />
                        </div>

                        <div className="d-flex gap-1">
                            <button
                                className="btn btn-primary btn-label"
                                style={{ fontSize: 14, borderRadius: 4 }}
                                onClick={() => {
                                    removeItems();
                                    window.location.href="/v1/novo/documento";
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>
                                Novo Documento
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= FILTERS ================= */}
                <div className="pageHeader">
                    <div>
                        <select
                            className="form-select"
                            disabled={!permission}
                            value={poloFilter ?? ""}
                            onChange={(e) =>
                                setPoloFilter(e.target.value || null)
                            }
                            style={
                                loadEmpresa || !permission
                                    ? { pointerEvents: "none", opacity: 0.5 }
                                    : {}
                            }
                        >
                            <option value="">Todos polos</option>
                            {empresa?.polos?.map((polo) => (
                                <option key={polo.id} value={polo.id}>
                                    {polo.nome_polo}
                                </option>
                            ))}
                        </select>

                        <select
                            className="form-select"
                            value={typeDateFilter}
                            onChange={(e) => setTypeDateFilter(e.target.value)}
                        >
                            <option value="Anual">Anual</option>
                            <option value="Intervalo">Intervalo</option>
                        </select>

                        {typeDateFilter === "Anual" ? (
                            <>
                                <select
                                    className="form-select"
                                    value={yearFilter ?? ""}
                                    onChange={(e) =>
                                        setYearFilter(e.target.value || null)
                                    }
                                >
                                    <option value="">Todos anos</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="form-select"
                                    value={monthFilter ?? ""}
                                    onChange={(e) =>
                                        setMonthFilter(e.target.value || null)
                                    }
                                >
                                    <option value="">Todos meses</option>
                                    {months.map((m) => (
                                        <option key={m.numero} value={m.numero}>
                                            {m.nome}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            
                            <div className="form-control" style={{padding: 0, outline: 0,}}>
                                <Flatpickr
                                      value={dateRangeFilter}
                                      options={{
        mode: "range",
        altInput: true,
        altFormat: "d/m/Y",
        dateFormat: "Y-m-d",
        closeOnSelect: false
      }}
                                      onChange={(dates) => {
  if (dates.length === 2) {
    setDateRangeFilter(dates);
  }
}}
                                      placeholder="Seleccione um intervalo de dias"
                                      className="form-control"
                                      style={{border: 'none', outline: 'none'}}
                                    />
                            </div>
                        )}

                        <select
                            className="form-select"
                            value={tipoFilter ?? ""}
                            onChange={(e) =>
                                setTipoFilter(e.target.value || null)
                            }
                        >
                            <option value="">Todos documentos</option>
                            {
                                tiposDocumentos.map((tipo) => (
                                    <option
                                        key={tipo.name}
                                        value={tipo.name}
                                    >
                                        {tipo.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                {/* ================= TABLE ================= */}
                {!loadEmpresa && !loadDocumentos ? (
                    <div className="container">
                        {filteredDocumentos?.length > 0 && (
                            <div
                                style={{
                                    paddingBlock: 15,
                                    paddingInline: 5,
                                    fontSize: 15,
                                }}
                            >
                                Mostrando {visibleDocumentos?.[0]?.index + 1} -{" "}
                                {visibleDocumentos?.[
                                    visibleDocumentos?.length - 1
                                ]?.index + 1}{" "}
                                de {response?.total} documentos
                            </div>
                        )}
                        {filteredDocumentos?.length > 0 ? (
                            <>
                                <div className="table-responsive">
                                    <table
                                        className="table table-gridjs"
                                        style={{ borderCollapse: "collapse" }}
                                        id="dashboardTable"
                                    >
                                        <thead>
                                            <tr>
                                                <th>Nº</th>
                                                <th>Tipo</th>
                                                <th>NIF do adq.</th>
                                                <th>Polo</th>
                                                <th>Data Emi.</th>
                                                <th>Total a pag.</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredDocumentos?.map(
                                                (data, index) =>
                                                    showItem(
                                                        visibleDocumentos,
                                                        data,
                                                        index
                                                    ) ? (
                                                        <tr key={data?.index}>
                                                            <td>
                                                                <div>
                                                                    {
                                                                        data.numeroDocumento
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {
                                                                        data.tipoDocumento
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {data
                                                                        ?.cliente
                                                                        ?.nif ??
                                                                        "-- Consumidor Final --"}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {
                                                                        data
                                                                            ?.polo
                                                                            ?.nome_polo
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {format(
                                                                        data?.dataEmissao,
                                                                        "dd/MM/yyyy"
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {formatCurrency(
                                                                        parseFloat(
                                                                            `${data?.totalPagar}`
                                                                        )
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <Popover>
                                                                        <PopoverTrigger>
                                                                            <div
                                                                                style={{
                                                                                    fontSize: 12,
                                                                                    flexDirection:
                                                                                        "row",
                                                                                    display:
                                                                                        "flex",
                                                                                    gap: 5,
                                                                                    alignItems:
                                                                                        "center",
                                                                                }}
                                                                                className="btn btn-sm btn-outline-primary"
                                                                                
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="14"
                                                                                    height="14"
                                                                                    fill="currentColor"
                                                                                    class="bi bi-gear"
                                                                                    viewBox="0 0 16 16"
                                                                                >
                                                                                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                                                                                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                                                                                </svg>
                                                                                Opções
                                                                                <i className="ri-settings-4-line"></i>
                                                                            </div>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="tableOptions">
                                                                            <div>
                                                                                <div
                                                                                    className="dropdown-item d-flex align-items-center"
                                                                                    href="#"
                                                                                    onClick={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        navigateToDetails(
                                                                                            data
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    Ver
                                                                                    detalhes
                                                                                </div>

                                                                                <div
                                                                                    className="dropdown-item d-flex align-items-center"
                                                                                    href="#"
                                                                                    onClick={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        tipoFilter ===
                                                                                            "Recibo" ||
                                                                                        data?.isRecibo
                                                                                            ? exportPDF(
                                                                                                  data,
                                                                                                  "recibo"
                                                                                              )
                                                                                            : exportPDF(
                                                                                                  data
                                                                                              );
                                                                                    }}
                                                                                >
                                                                                    Exportar
                                                                                    pdf
                                                                                </div>

                                                                                {data?.tipoDocumento ===
                                                                                    "Factura" &&
                                                                                    !data?.isRecibo &&
                                                                                    !data?.dataEmissaoRecibo &&
                                                                                    tipoFilter !==
                                                                                        "Recibo" &&
                                                                                    canAddNotaCredito(
                                                                                        data
                                                                                    ) && (
                                                                                        <div
                                                                                            className="dropdown-item d-flex align-items-center"
                                                                                            href="#"
                                                                                            onClick={(
                                                                                                e
                                                                                            ) => {
                                                                                                e.preventDefault();
                                                                                                navigateToDetails(
                                                                                                    data,
                                                                                                    true
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            Emitir
                                                                                            recibo(s)
                                                                                        </div>
                                                                                    )}

                                                        {(data?.tipoDocumento ===
                                                            "Factura" ||
                                                            data?.tipoDocumento ===
                                                                "Factura Recibo" ||
                                                            data?.tipoDocumento ===
                                                                "Factura Global") &&
                                                            !(data
                                                                ?.notas_credito?.[0]
                                                                ?.id) &&
                                                            !(data?.isRecibo) &&
                                                            tipoFilter !==
                                                                "Recibo" && (
                                                                <div
                                                                    className="dropdown-item d-flex align-items-center"
                                                                    href="#"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        addNotaCredito(
                                                                            data,
                                                                            true
                                                                        );
                                                                    }}
                                                                >
                                                                    Adicionar
                                                                    nota
                                                                    de
                                                                    crédito
                                                                </div>
                                                            )}
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : null
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredDocumentos?.length > 0 && (
                                    <nav
                                        aria-label="Page navigation example"
                                        style={{ marginBlock: "15px" }}
                                    >
                                        <ul className="pagination justify-content-center">
                                            {/* Previous Button */}
                                            <li
                                                className={`page-item ${
                                                    currentPage == 1
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    if (currentPage != 1) {
                                                        changePage(
                                                            currentPage - 1
                                                        );
                                                    }
                                                }}
                                            >
                                                <a className="page-link">«</a>
                                            </li>

                                            {/* Page Numbers */}
                                            {getPages().map((page, index) =>
                                                page === "..." ? (
                                                    <li
                                                        key={`dots-${index}`}
                                                        className="page-item disabled"
                                                    >
                                                        <a className="page-link">
                                                            ...
                                                        </a>
                                                    </li>
                                                ) : (
                                                    <li
                                                        key={page}
                                                        className={`page-item ${
                                                            currentPage == page
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={(e) =>{
                                                            e.preventDefault();
                                                            changePage(page)
                                                        }
                                                        }
                                                    >
                                                        <span className="page-link">
                                                            {page}
                                                        </span>
                                                    </li>
                                                )
                                            )}

                                            {/* Next Button */}
                                            <li
                                                className={`page-item ${
                                                    currentPage ===
                                                    pages?.length
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    if (
                                                        currentPage !==
                                                        pages?.length
                                                    ) {
                                                        changePage(
                                                            currentPage + 1
                                                        );
                                                    }
                                                }}
                                            >
                                                <a className="page-link">»</a>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </>
                        ) : (
                            <div style={{ marginLeft: 5, paddingBlock: 10 }}>
                                Nenhum documento encontrado. Ajuste os filtros.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="spinner-border text-primary"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
