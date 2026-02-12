import { useEffect, useState } from "react";
import "../../css/dashboard.css";
import Loading1 from "../components/loading1";
import api from "../components/api";
import logo from "../../images/logo.jpeg";
import { format, parseISO, set } from "date-fns";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Bounce, toast, ToastContainer } from "react-toastify";

import { jsPDF } from "jspdf";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover";
import React from "react";
const Dashboard = () => {
    const [load, setLoad] = useState(false);
    const [stats, setStats] = useState(null);
    // const formatCurrency = (value) => {
    //     if (value == null || value === undefined || value === "")
    //         return "AOA 0.00";
    //     return `AOA ${value.toLocaleString("en-US", {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //     })}`;
    // };
    const flatpickrOptions = {
    // locale: Portuguese,
    // You may add other Flatpickr options here if needed
  };
  const formatCurrency = (value) => {
        if (value == null || value === undefined || value === "")
            return "AOA 0.00";
        return `AOA ${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };
    const formatCurrency1 = (value) => {
        if (value == null || value === undefined || value === "")
            return "0.00";
        return `${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };
     const toastError = (message) => {
            toast(message, {
        position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
    style: {
        background: 'red',
        color: 'white'
    }
    });
        }
        const toastSuccess = (message) => {
            toast(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
    style: {
        background: '#28a745',
        color: 'white'
    }
    });
        }
    const [searchFilter, setSearchFilter] = useState("");
    const [empresaImage, setEmpresaImage] = useState(null)
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
    const canAddNotaCredito = (data) => {
        return ![...(data?.notas_credito || [])].some(
      (i) => i?.tipoDocumento == "Nota de crédito (anulação)"
    );
    } // placeholder
      const exportPDF = async (data, type=null) => {
          console.trace('hey there',{
      ...data,
      produtos: [...data?.produtos]?.map((i, index) => {
        return {
          ...i,
          index: index + 1,
        };
      }),
    })
    let documento = {
      ...data,
      produtos: [...data?.produtos]?.map((i, index) => {
        return {
          ...i,
          index: index + 1,
        };
      }),
    }

    setDocumento(documento);
    setLoad(true);
    (await new Promise((resolve) => setTimeout(resolve, 1000)))

      // const isA4 = tipoFolha == "A4";
      const isA4 = true;
      const isHorizontal = false;

      const pages =
        type == "recibo"
          ? (document.getElementById("pdfContainerRecibo"))
          : isA4
          ? (document.getElementById("pdfContainer1"))
          : (document.getElementById("pdfContainerA3"));

      if (!pages) {
        console.error("Element not found");
        setLoad(false);
        return;
      }
              const originalContentWidth = isA4 ? 1100 : 2000; // width of your HTML content


      // Save the original body overflow
      const originalOverflow = document.body.style.overflow;

      // Disable scrolling
      document.body.style.overflow = "hidden";

      // Clone the component
      const clonedPages = pages.cloneNode(true);

      // Create a mask overlay
      const mask = document.createElement("div");
      mask.style.position = "fixed";
      mask.style.top = "0";
      mask.style.left = "0";
      mask.style.width = "100vw";
      mask.style.height = "100vh";
      mask.style.backgroundColor = "#F3F3F9"; // White mask
      mask.style.zIndex = "-9998"; // Ensure it covers everything
      mask.style.pointerEvents = "none"; // Allow interactions behind it

      // Force cloned pages to be visible but off-screen
      clonedPages.style.position = "absolute";
      clonedPages.style.left = "0";
      clonedPages.style.top = "0";
      const DPR = 1;
      console.trace('dpr', DPR)

clonedPages.style.transform = `scale(${1 / DPR})`;
clonedPages.style.transformOrigin = "top left";

      clonedPages.style.width = `${originalContentWidth * DPR}px`;
clonedPages.style.minWidth = `${originalContentWidth * DPR}px`;
clonedPages.style.maxWidth = `${originalContentWidth * DPR}px`;
      // clonedPages.style.minHeight = "1550px";
      // clonedPages.style.height = "1550px";
      clonedPages.style.overflow = "visible"; // ✅ Very important
      clonedPages.style.breakInside = "avoid"; // Optional
      clonedPages.style.backgroundColor = "white";

      clonedPages.style.display = "flex";
      clonedPages.style.opacity = "1";
      clonedPages.style.zIndex = "-9999"; // Keep it hidden from the user

      document.body.appendChild(clonedPages); // Append off-screen for rendering
      document.body.appendChild(mask); // Add the mask to hide UI flicker
      console.log('got here')
      setTimeout(() => {
        const doc = new jsPDF({
          orientation: isA4 ? "portrait" : "landscape",
          unit: "px",
          format: isA4 ? "a4" : "a3",
        });

        const pageWidth = doc.internal.pageSize.getWidth(); // A4 full width

        const pageHeight = doc.internal.pageSize.getHeight(); // A4 full height
        const contentHeight = clonedPages.scrollHeight;
        

        // Adjust the scale based on the content size
        const scale = 0.4058727272727273; // This will scale down width only]
        console.trace('scale', scale)
        
        const expectedPages = Math.ceil(
          (contentHeight * scale + 50) / pageHeight
        );
        console.log("no ceil", (contentHeight * scale + 50) / pageHeight);
        console.log("expected pages", expectedPages);

        doc.html(clonedPages, {
          x: 0, // Start from the left edge
          y: 0, // Start from the top edge
          html2canvas: {
            // scale: scale, // Use calculated scale to fit
            scale: 0.4058727272727273,
            logging: true,
            
            // width: pageWidth, // Full width of page
            // height: pageHeight, // Full height of page
            // windowWidth: clonedPages.scrollWidth, // Full width of the rendered content

            letterRendering: true,
            useCORS: true,
            windowWidth: originalContentWidth,
            // height: contentHeight,
            height: clonedPages.scrollHeight,
            windowHeight: 100,
            scrollY: 0,
            scrollX: 0,
            
            onclone: (clonedDoc) => {
      const styles = clonedDoc.querySelectorAll("style, link[rel='stylesheet']");

      styles.forEach(style => {
        if (style.textContent?.includes("oklch")) {
          style.remove();
        }
      });

      clonedDoc.body.style.backgroundColor = "#ffffff";
      clonedDoc.body.style.color = "#000000";
    }
  
          },
          autoPaging: "text",
          callback: (doc) => {
            
            let totalPages = doc.getNumberOfPages();

            // Update total pages after deletion
            totalPages = doc.getNumberOfPages();
            let lastContentPage = 1;

            for (let i = 1; i <= totalPages; i++) {
              doc.setPage(i);

              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();

              doc.setFontSize(6);

              // Bottom LEFT text
              // doc.text(
              //   `Os bens/serviços foram colocados à disposição do adquirente na data de ${format(
              //     parseISO(this.responseDoc()?.created_at),
              //     "dd-MM-yyyy"
              //   )}`,
              //   10,
              //   pageHeight - 20
              // ); // X=10 for left margin

              doc.text(
                type == "recibo"
                  ? `${
                      documento?.recibo_hash?.[0] +
                      documento?.recibo_hash?.[11] +
                      documento?.recibo_hash?.[21] +
                      documento?.recibo_hash?.[31]
                    }-Processado por programa validado nº ###/AGT/2025 Level-Invoice`
                  : `${
                      documento?.hash?.[0] +
                      documento?.hash?.[11] +
                      documento?.hash?.[21] +
                      documento?.hash?.[31]
                    }-Processado por programa validado nº ###/AGT/2025 Level-Invoice` +
                      " | " +
                      `Os bens/serviços foram colocados à disposição do adquirente na data de ${format(
                        new Date(documento?.dataEmissao),
                        "dd-MM-yyyy"
                      )}`,
                10,
                pageHeight - 10
              );

              // Bottom RIGHT text
              const pageLabel = `Página ${i}/${expectedPages}`;
              const textWidth = doc.getTextWidth(pageLabel);
              doc.text(pageLabel, pageWidth - 10 - textWidth, pageHeight - 10); // Right aligned with 10px margin
              lastContentPage = i; // ✅ mark this as last real content page
            }

            document.body.removeChild(clonedPages);
            document.body.removeChild(mask); // Remove mask
            document.body.style.overflow = originalOverflow; // Restore body overflow

            // this.loading.set(false); // Hide loading state
            
            toastSuccess(`Documento exportado com sucesso`)

            console.log("lastttt contentttttt", lastContentPage);
            const totalPagesAfterFooter = doc.getNumberOfPages();

            for (let i = totalPages; i > expectedPages; i--) {
              doc.deletePage(i);
            }
            // Open PDF in a new tab
            const pdfBlobUrl = doc.output("bloburl");
            // index == 0 && window.open(pdfBlobUrl, "_blank");
            doc.save(
              `${
                documento?.tipoDocumento == "Factura" &&
                type == "recibo"
                  ? "Recibo__"
                  : ""
              }${
                documento?.tipoDocumento +
                " Nº " +
                documento?.numeroDocumento
              }___Segunda Via.pdf`
            );
            setLoad(false);

            resolve();
          },
          // autoPaging: 'text',
        });
      }, 1000);
  } // placeholder
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
                const fullUserEmpresa = JSON.parse(
                    sessionStorage.getItem("fullUserEmpresa") || "{}"
                );
                if (fullUserEmpresa?.logo) {
                    // setEmpresaImage(`/storage/${fullUserEmpresa?.logo}`);
                    // setEmpresaImage("https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1770854400&v=beta&t=GM8FbM7oioz63kgp7-nf2uBSuMikuHzW1A1jyr1Ecmo")
                    setEmpresaImage(logo)
                }else {
                    setEmpresaImage(logo)
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

    const addNotaCredito = (data, recibo) => {
        sessionStorage.setItem("factura", JSON.stringify(data));
        sessionStorage.setItem(
        "polo",
        JSON.stringify(
            empresa?.polos?.find((i) => i?.id == poloFilter)
        )
        );
        const url = "/v1/novo/documento" + (true ? "?nota=adicionar" : "");

        window.open(url, "_blank");
    
  };
    const itemsPerPage = 17;

  const [documento, setDocumento] = useState(null)
  const filteredPagamentos = (list = []) => {
    return list
      .filter(
        (pagamento) =>
          pagamento?.valor?.length > 0 ||
          pagamento?.tipoPagamento ||
          pagamento?.referencia?.length > 0 ||
          pagamento?.banco?.length > 0
      )
      .map((i, index) => {
        return {
          ...i,
          index: index,
        };
      });
  };
   
  const getTotalPages = () => {
    return Array(
      Math.ceil(
        [...(documento?.produtos || [])].length / itemsPerPage
      )
    ).fill("");
  }
const getLastPageProductIndex = () => {
    const totalItems = (
  [...documento?.produtos||[]]
)?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Items on the last page
    const lastPageItemCount = totalItems - (totalPages - 1) * itemsPerPage;

    // The index within 1-17 (or less if fewer items)
    const lastItemIndex = lastPageItemCount;
    return lastItemIndex;
  }
  
  const getLastPageProductIndexRecibos = () => {
    const totalItems = filteredPagamentos(documento?.pagamentos ?? [])?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const lastPageItemCount = totalItems - (totalPages - 1) * itemsPerPage;

    const lastItemIndex = lastPageItemCount;
    return lastItemIndex;
  }
  
  const getTotalPagesRecibos = () => {
    return Array(
      Math.ceil(
        [...filteredPagamentos(documento?.pagamentos ?? [])].length / itemsPerPage
      )
    ).fill("");
  }
  
    const groupProdutosByTaxa = () => {
      const groupedMap = new Map();
  
      (
    [...(documento?.produtos || [])]
  ).forEach((item) => {
        const taxa = item?.produto?.impostoFull?.taxa ?? "N/A";
  
        if (!groupedMap.has(taxa)) {
          groupedMap.set(taxa, { items: [], incidencia: 0 });
        }
  
        const group = groupedMap.get(taxa);
  
        if (item?.preco) {
          group.incidencia += item.preco * item?.quantidade;
        }
  
        group.items.push(item);
      });
  
      
      return Array.from(groupedMap.entries())
        .map(([taxa, data], index) => {
          return {
            index: index,
            taxa: taxa,
            incidencia: data.incidencia,
            motivo:
              taxa == "0.00" || data?.incidencia == 0
                ? data?.items[0]?.produto?.isencaoFull?.mencao_na_factura
                : "",
            total: (data.incidencia * parseFloat(taxa)) / 100,
            // items: data?.items
          };
        })
        .sort((a, b) => parseFloat(a?.taxa) - parseFloat(b?.taxa));
    }
  
    const totalValue = (field) => {
        return (
  [...documento?.produtos||[]]
)?.reduce((count, item) => {
            if (
                eval(`item.${field}`) !== undefined &&
                eval(`item.${field}`) !== null &&
                eval(`item.${field}`) !== ""
            ) {
                return count + parseFloat(eval(`item.${field}`));
            }
            return count;
        }, 0);
    };
     const extractPercentage = (item) => {
        return parseFloat(item?.produto?.impostoFull?.taxa);
    };
    const totalPagamentoValue = (field) => {
       
        return filteredPagamentos(documento?.pagamentos).reduce((count, item) => {
            if (
                eval(`item?.${field}`) !== undefined &&
                eval(`item?.${field}`) !== null &&
                eval(`item?.${field}`) != ""
            ) {
                return count + parseFloat(eval(`item?.${field}`));
            }
            return count;
        }, 0);
    };
    const HeaderTemplate = () => {
      return (
        <>
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingTop: "5px",
            }}
          >
            <div className="pdfLogo">
              <img
                  src={empresaImage ||
                            "https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1770854400&v=beta&t=GM8FbM7oioz63kgp7-nf2uBSuMikuHzW1A1jyr1Ecmo"}
                  className="logo"
                />
            </div>
          </div>
    
          {/* COMPANY NAME */}
          <div className="pdfCompanyTitle" style={{ marginTop: "20px" }}>
            {empresa?.nome_empresa}
          </div>
    
          {/* COMPANY + CLIENT INFO */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "10px",
            }}
          >
            {/* COMPANY INFO */}
            <div className="pdfCompanyInfo" style={{ flex: 1 }}>
              <div className="pdfHeaderRow">
                <span className="label">Localização: </span>
                <span className="value">{documento?.polo?.localizacao}</span>
              </div>
    
              <div className="pdfHeaderRow">
                <span className="label">NIF: </span>
                <span className="value">{empresa?.num_contribuinte}</span>
              </div>
    
              {true  && (
                <div className="pdfHeaderRow">
                  <span className="label">Website: </span>
                  <span className="value">{documento?.polo?.website?? "N/A"}</span>
                </div>
              )}
    
              <div className="pdfHeaderRow">
                <span className="label">Email: </span>
                <span className="value">{documento?.polo?.email}</span>
              </div>
    
              <div className="pdfHeaderRow">
                <span className="label">Tel: </span>
                <span className="value">{documento?.polo?.telemovel}</span>
              </div>
            </div>
    
            {/* CLIENT INFO */}
            <div className="pdfClientInfo" style={{ flex: 1 }}>
              <div className="pdfHeaderRow">
                <span className="label">Cliente: </span>
                <span className="value">
                  {documento?.cliente?.nome || "Consumidor Final"}
                </span>
              </div>
    
              <div className="pdfHeaderRow">
                <span className="label">NIF: </span>
                <span className="value">
                  {documento?.cliente?.nif || "N/A"}
                </span>
              </div>
    
              <div className="pdfHeaderRow">
                <span className="label">Localização: </span>
                <span className="value">
                  {documento?.cliente?.localizacao || "N/A"}
                </span>
              </div>
            </div>
          </div>
    
          {/* TABLE */}
          <div
            className="table-responsive"
            style={{
              height: "100%",
              paddingBottom: "80px",
              overflowY: "hidden",
              marginTop: "50px",
            }}
          >
            <table className="table table-gridjs" style={{ backgroundColor: "white" }}>
              <thead>
                <tr>
                  <th
                    colSpan={4}
                    style={{
                      fontWeight: 700,
                      fontSize: "18px",
                      borderTop: "none",
                    }}
                  >
                    {/* {(documento?.factura_id ? documento?.tipoDocumento : "Recibo") + " Nº " + (documento?.factura_id ? documento?.numeroDocumento : documento?.numeroRecibo)} */}
                    {documento?.tipoDocumento + " Nº " + documento?.numeroDocumento}
                  </th>
    
                  <th
                    style={{
                      fontSize: "13px",
                      textAlign: "right",
                      fontWeight: 600,
                      borderTop: "none",
                    }}
                  >
                    Segunda Via
                  </th>
                </tr>
    
                <tr style={{ fontWeight: 900 }}>
                  <th>Data Emi.</th>
                  <th>Data Val.</th>
                  <th>NIF.</th>
                  <th>V/ Ref.</th>
                  <th style={{ width: "220px" }}></th>
                </tr>
              </thead>
    
              <tbody>
                <tr>
                  <td>
                    {documento?.dataEmissao
                      ? format(new Date(documento?.dataEmissao), "dd-MM-yyyy")
                      : ""}
                  </td>
    
                  <td>
                    {documento?.tipoDocumento === "Factura Recibo"
                      ? "N/A"
                      : documento?.dataValidade
                      ? format(new Date(documento?.dataValidade), "dd/MM/yyyy")
                      : ""}
                  </td>
    
                  <td>{documento?.cliente?.nif || "N/A"}</td>
    
                  <td>{documento?.numeroDocumento}</td>
    
                  <td rowSpan={2} style={{border: 'none'}}>
                    <div
                      className="qrContainer"
                      style={{
                        padding: 0,
                        height: "80px",
                        transform: "translateY(-55px)",
                      }}
                    >
                      <img
                        src={documento?.qr_code}
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </td>
                </tr>
    
                <tr>
                  <td colSpan={4} style={{ borderBottom: "none" }}>
                    <section style={{ flex: 1 }}>
                      {documento?.tipoDocumento === "Factura Recibo" ||
                      documento?.tipoDocumento === "Factura" ? (
                        <>
                          {(!documento?.obs || documento?.obs === "") && (
                            <>
                              <div style={{ opacity: 0, fontWeight: 800 }}>
                                something
                              </div>
                              <div style={{ opacity: 0 }}>something</div>
                            </>
                          )}
    
                          {documento?.obs && documento?.obs !== "" && (
                            <>
                              <div style={{ fontWeight: 800 }}>Obs:</div>
                              <div style={{ maxHeight: "21px" }}>{documento?.obs}</div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div style={{ fontWeight: 800 }}>Obs:</div>
                          <div style={{ maxHeight: "21px" }}>
                            Este documento não serve de factura.
                            <br />
                            {documento?.obs}
                          </div>
                        </>
                      )}
                    </section>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      );
    };
    const HeaderTemplateRecibo = () => {
  return (
    <>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingTop: "5px",
        }}
      >
        <div className="pdfLogo">
          <img
              src={empresaImage ||
                        "https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1770854400&v=beta&t=GM8FbM7oioz63kgp7-nf2uBSuMikuHzW1A1jyr1Ecmo"}
              className="logo"
            />
          
        </div>
      </div>

      <div className="pdfCompanyTitle" style={{ marginTop: "20px" }}>
        {empresa?.nome_empresa}
      </div>

      {/* COMPANY + CLIENT INFO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "10px",
        }}
      >
        {/* COMPANY INFO */}
       <div className="pdfCompanyInfo" style={{ flex: 1 }}>
              <div className="pdfHeaderRow">
                <span className="label">Localização: </span>
                <span className="value">{documento?.polo?.localizacao}</span>
              </div>
    
              <div className="pdfHeaderRow">
                <span className="label">NIF: </span>
                <span className="value">{empresa?.num_contribuinte}</span>
              </div>
    
              {true && (
                <div className="pdfHeaderRow">
                  <span className="label">Website: </span>
                  <span className="value">{documento?.polo?.website?? "N/A" }</span>
                </div>
              )}
    
              <div className="pdfHeaderRow">
                <span className="label">Email: </span>
                <span className="value">{documento?.polo?.email}</span>
              </div>
    
              <div className="pdfHeaderRow">
                <span className="label">Tel: </span>
                <span className="value">{documento?.polo?.telemovel}</span>
              </div>
            </div>
        {/* CLIENT INFO */}
        <div className="pdfClientInfo" style={{ flex: 1 }}>
          <div className="pdfHeaderRow">
            <span className="label">Cliente: </span>
            <span className="value">
              {documento?.cliente?.nome || "Consumidor Final"}
            </span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">NIF: </span>
            <span className="value">
              {documento?.cliente?.nif || "N/A"}
            </span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">Localização: </span>
            <span className="value">
              {documento?.cliente?.localizacao || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="table-responsive"
        style={{
          height: "100%",
          paddingBottom: "80px",
          overflowY: "hidden",
          marginTop: "50px",
        }}
      >
        <table className="table table-gridjs" style={{ backgroundColor: "white" }}>
          <thead>
            <tr>
              <th
                colSpan={5}
                style={{
                  fontWeight: 700,
                  fontSize: "18px",
                  borderTop: "none",
                }}
              >
                {(documento?.factura_id
                  ? documento?.tipoDocumento
                  : "Recibo") +
                  " Nº " +
                  (documento?.factura_id
                    ? documento?.numeroDocumento
                    : documento?.numeroRecibo)}
              </th>

              <th
                style={{
                  fontSize: "13px",
                  textAlign: "right",
                  fontWeight: 600,
                  borderTop: "none",
                }}
              >
                Segunda Via
              </th>
            </tr>

            <tr style={{ fontWeight: 900 }}>
              <th>Data Emi.</th>
              <th>NIF.</th>
              <th>V/ Ref.</th>
              <th>Documento ref.</th>
              <th>Valor doc.</th>
              <th style={{ width: "220px" }}></th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                {(() => {
                  const date =
                    !documento?.factura_id
                      ? documento?.dataEmissaoRecibo
                      : documento?.dataEmissao;

                  return date ? format(new Date(date), "dd-MM-yyyy") : "";
                })()}
              </td>

              <td>
                {documento?.cliente?.nif || "Consumidor Final"}
              </td>

              <td>
                {documento?.factura_id
                  ? documento?.numeroDocumento
                  : documento?.numeroRecibo}
              </td>

              <td >
                {/* {motivo ? responseDoc?.factura?.numeroDocumento : responseDoc?.numeroDocumento} */}
                                {documento?.factura?.numeroDocumento}

              </td>

              <td >
                {formatCurrency(totalValue("total"))}
              </td>

              <td rowSpan={2} style={{border: 'none'}}>
                <div
                  className="qrContainer"
                  style={{
                    padding: 0,
                    height: "80px",
                    transform: "translateY(-55px)",
                  }}
                >
                  <img
                    // src={motivo ? responseDoc?.qr_code : responseDoc?.qr_code_recibo}
                    src={!documento?.factura_id
                      ? documento?.qr_code_recibo
                      : documento?.qr_code}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan={4} style={{ borderBottom: "none" }}>
                <section style={{ flex: 1 }}>
                  {documento?.tipoDocumento === "Factura Recibo" ||
                  documento?.tipoDocumento === "Factura" ||
                  documento?.tipoDocumento ==
                    "Nota de crédito (anulação)" || documento?.tipoDocumento == "Nota de crédito (retificação)" ? (
                    !documento?.factura_id ? (
                      <>
                        <div style={{ fontWeight: 800 }}>Obs:</div>
                          <div style={{ maxHeight: '21px' }}>
                            Através do(s) seguinte(s) meio(s) no valor total de {formatCurrency(totalPagamentoValue("valor"))}
                          </div>
                      </>
                    ) : (
                      <>
                        {documento?.obs && (
                          <>
                            <div style={{ fontWeight: 800 }}>
                              Motivo de emissão:
                            </div>
                            <div style={{ maxHeight: "21px" }}>
                              {documento?.obs}
                            </div>
                          </>
                        )}

                        <div
                          style={{
                            fontWeight: 800,
                            marginTop: 10,
                            marginBottom: -41
                          }}
                        >
                          Assinatura do cliente:
                          <span
                            style={{
                              minWidth: "200px",
                              borderBottom: "1px solid #595959",
                              height: "25px",
                              width: "450px",
                              display: "inline-block",
                              transform: "translateY(9px)",
                            }}
                          />
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <div style={{ fontWeight: 800 }}>Obs:</div>
                      <div style={{ maxHeight: "21px" }}>
                        Este documento não serve de factura.
                        <br />
                        {documento?.obs}
                      </div>
                    </>
                  )}
                </section>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};
    // actual return

    return (
        <>
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
                                                                            data?.isRecibo ? data?.numeroRecibo : data?.numeroDocumento
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        {
                                                                            tipoFilter == 'Recibo'
                            ? 'Recibo'
                            : data?.isRecibo ? 'Recibo' : data?.tipoDocumento
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
                                                                            (data?.isRecibo ? data?.dataEmissaoRecibo : data?.dataEmissao),
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
                                                                                        !(data?.isRecibo) &&
                                                                                        !(data?.dataEmissaoRecibo) &&
                                                                                        !(data
                                                                    ?.notas_credito?.[0]
                                                                    ?.id) &&
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
                    <div id="pdfContainer1">
                  <div style={{
                    backgroundColor: 'white',
                    gap: '10px',
                    width: '100%',
                    height: '100%',
                    padding: '20px',
                    paddingTop: '60px'
                  }}>
                    <div className="pdfHeader">
                      {getTotalPages().map((page, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                          {(!(documento?.factura_id)) ? (
                            <>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                paddingTop: '5px'
                              }}>
                                <div className="pdfLogo">
                                  <img
                          src={empresaImage ||
                                    "https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1770854400&v=beta&t=GM8FbM7oioz63kgp7-nf2uBSuMikuHzW1A1jyr1Ecmo"}
                          className="logo"
                        />
                                </div>
                              </div>
            
                              <div className="pdfCompanyTitle" style={{ marginTop: '20px' }}>
                                {empresa?.nome_empresa}
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginTop: '10px'
                              }}>
                                <div className="pdfCompanyInfo" style={{ flex: 1 }}>
                                  <div className="pdfHeaderRow">
                                    <span className="label">Localização: </span>
                                    <span className="value">{documento?.polo?.localizacao}</span>
                                  </div>
                                  <div className="pdfHeaderRow">
                                    <span className="label">NIF: </span>
                                    <span className="value">{empresa?.num_contribuinte}</span>
                                  </div>
                                  {true && (
                                    <div className="pdfHeaderRow">
                                      <span className="label">Website: </span>
                                      <span className="value">{documento?.polo?.website?? "N/A"}</span>
                                    </div>
                                  )}
                                  <div className="pdfHeaderRow">
                                    <span className="label">Email: </span>
                                    <span className="value">{documento?.polo?.email}</span>
                                  </div>
                                  <div className="pdfHeaderRow">
                                    <span className="label">Tel: </span>
                                    <span className="value">{documento?.polo?.telemovel}</span>
                                  </div>
                                </div>
            
                                <div className="pdfClientInfo" style={{ flex: 1 }}>
                                  <div className="pdfHeaderRow">
                                    <span className="label">Cliente: </span>
                                    <span className="value">
                                      {documento?.cliente?.nome || "Consumidor Final"}
                                    </span>
                                  </div>
                                  <div className="pdfHeaderRow">
                                    <span className="label">NIF: </span>
                                    <span className="value">{documento?.cliente?.nif || "N/A"}</span>
                                  </div>
                                  <div className="pdfHeaderRow">
                                    <span className="label">Localização: </span>
                                    <span className="value">
                                      {documento?.cliente?.localizacao || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
            
                              <div
                                className="table-responsive"
                                style={{
                                  height: '100%',
                                  paddingBottom: '80px',
                                  overflowY: 'hidden',
                                  marginTop: '50px'
                                }}
                              >
                                <table className="table table-gridjs" style={{ backgroundColor: 'white' }}>
                                  <thead style={{ backgroundColor: 'white' }}>
                                    <tr style={{ backgroundColor: 'white' }}>
                                      <th colSpan="4" style={{
                                        fontWeight: 700,
                                        fontSize: '18px',
                                        backgroundColor: 'white',
                                        borderTop: 'none'
                                      }}>
                                      {`${documento?.tipoDocumento} Nº ${documento?.numeroDocumento}`}
                                      </th>
                                      <th style={{
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        borderTop: 'none',
                                        textAlign: 'right',
                                        fontWeight: 600
                                      }}>
                                        Segunda Via
                                      </th>
                                    </tr>
                                    <tr style={{ backgroundColor: 'white', fontWeight: '500' }}>
                                      <th style={{ backgroundColor: 'white' }}>Data Emi.</th>
                                      <th style={{ backgroundColor: 'white' }}>Data Val.</th>
                                      <th style={{ backgroundColor: 'white' }}>NIF.</th>
                                      <th style={{ backgroundColor: 'white' }}>V/ Ref.</th>
                                      <th style={{ backgroundColor: 'white', maxWidth: '220px', width: '220px' }}></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>{format(new Date(documento?.dataEmissao||null), 'dd-MM-yyyy')}</td>
                                      <td>
                                        {documento?.tipoDocumento === 'Factura Recibo' ? 'N/A' : format(new Date(documento?.dataValidade?.length > 0 ? documento?.dataValidade : null), 'dd-MM-yyyy')}
                                      </td>
                                      <td>
                                        {documento?.cliente?.nif || "N/A"}
                                      </td>
                                      <td>
                                        {documento?.numeroDocumento}
                                      </td>
                                      <td rowSpan={2} style={{border: 'none'}}>
                            <div
                              className="qrContainer"
                              style={{
                                padding: 0,
                                height: "80px",
                                transform: "translateY(-55px)",
                              }}
                            >
                              <img
                                src={documento?.qr_code}
                                style={{
                                  width: "100%",
                                  height: "220px",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          </td>
                                    </tr>
            
                                    <tr>
                                      <td colSpan="4" style={{ borderBottom: 'none' }}>
                                        <section style={{ flex: 1 }}>
                                          {(documento?.tipoDocumento === 'Factura Recibo' || documento?.tipoDocumento === 'Factura') ? (
                                            <>
                                              {(!documento?.obs || documento?.obs === '') && (
                                                <>
                                                  <div style={{ opacity: 0, fontWeight: 800 }}>something</div>
                                                  <div style={{ opacity: 0 }}>something</div>
                                                </>
                                              )}
                                              {documento?.obs && documento?.obs !== '' && (
                                                <>
                                                  <div style={{ fontWeight: 800 }}>Obs:</div>
                                                  <div style={{ maxHeight: '21px' }}>
                                                    {documento?.obs}
                                                  </div>
                                                </>
                                              )}
                                            </>
                                          ) : (
                                            <>
                                              <div style={{ fontWeight: 800 }}>Obs:</div>
                                              <div style={{ maxHeight: '21px' }}>
                                                Este documento não serve de factura. <br />
                                                {documento?.obs}
                                              </div>
                                            </>
                                          )}
                                        </section>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </>
                          ) : (
                            HeaderTemplateRecibo()
                          )}
            
                          <div
                            className="table-responsive"
                            style={{
                              height: '100%',
                              paddingBottom: '80px',
                              overflowY: 'hidden',
                              marginTop: '-15px'
                            }}
                          >
                            <table className="table table-gridjs" style={{ backgroundColor: 'white' }}>
                              <thead style={{ background: 'white' }}>
                                <tr style={{ backgroundColor: 'white' }}>
                                  <th style={{ maxWidth: '20px', width: '20px', backgroundColor: 'white' }}>#</th>
                                  <th style={{ backgroundColor: 'white' }}>Descrição</th>
                                  <th style={{ backgroundColor: 'white' }}>Qtd.</th>
                                  <th style={{ backgroundColor: 'white' }}>P. Unitário</th>
                                  <th style={{ backgroundColor: 'white' }}>Desc.</th>
                                  <th style={{ backgroundColor: 'white' }}>Taxa</th>
                                  <th style={{ backgroundColor: 'white' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {documento?.produtos && [...documento?.produtos||[]].length > 0 && 
                                  [...documento.produtos||[]]
                                    .slice((pageIndex * itemsPerPage), (pageIndex * itemsPerPage) + itemsPerPage)
                                    .map((data, index) => {
                                      const globalIndex = index;
                                      const isLastPage = pageIndex + 1 === getTotalPages().length;
                                      const isLastProduct = data?.index === [...documento?.produtos||[]][[...documento?.produtos||[]].length - 1]?.index;
                                      
                                      return (
                                        <React.Fragment key={index}>
                                          <tr>
                                            <td>
                                              <div>{index + 1 + ''}</div>
                                            </td>
                                            <td>
                                              <div
                                                style={{
                                                  
                                                  border: 'none'
                                                }}
                                                title={data?.produto?.designacao}
                                              >
                                                {data?.produto?.designacao}
                                              </div>
                                            </td>
                                            <td>
                                              <div>{data?.quantidade + ''}</div>
                                            </td>
                                            <td>
                                              <div>{formatCurrency1(data?.preco)}</div>
                                            </td>
                                            <td>
                                              <div>
                                                {formatCurrency1(data?.descontoFinal) + 
                                                  (data?.descontoPercentual
                                                    ? ' (' + data?.descontoPercentual + '%)'
                                                    : '')}
                                              </div>
                                            </td>
                                            <td>
                                              <div>
                                                {formatCurrency1(data?.taxaImposto) + ' (' + extractPercentage(data) + '%)'}
                                              </div>
                                            </td>
                                            <td>
                                              <div>{formatCurrency1(data?.total)}</div>
                                            </td>
                                          </tr>
            
                                          {((globalIndex + 1) === 17 || (globalIndex > 18 && ((globalIndex - 17 + 1) % 31 === 0))) && (
                                            <tr style={{ 
                                              border: 'none',
                                              height: (globalIndex > 17 && ((globalIndex - 17 + 1) % 31 === 0)) ? '76px' : '56px'
                                            }}>
                                              <td style={{ border: 'none' }} colSpan="18" className="page-break">
                                                <div style={{ pageBreakAfter: 'always' }}></div>
                                              </td>
                                            </tr>
                                          )}
            
                                          {isLastPage && isLastProduct && (index + 1 === 14 || index + 1 === 15 || index + 1 === 16) && (
                                            <tr style={{ 
                                              border: 'none',
                                              height: index + 1 === 14 ? '194px' 
                                                    : index + 1 === 15 ? '146px'
                                                    : '100px'
                                            }}>
                                              <td style={{ border: 'none' }} colSpan="18" className="page-break">
                                                <div style={{ pageBreakAfter: 'always' }}></div>
                                              </td>
                                            </tr>
                                          )}
                                        </React.Fragment>
                                      );
                                    })
                                }
                              </tbody>
                            </table>
                          </div>
                        </React.Fragment>
                      ))}
            
                      {[14, 15, 16, 17].includes(getLastPageProductIndex()) && (
                        (!documento?.factura_id) ? HeaderTemplate() : HeaderTemplateRecibo()
                      )}
            
                      <div className="bottom" style={{ 
                        marginTop: [14, 15, 16, 17].includes(getLastPageProductIndex()) ? '-20px' : '-55px'
                      }}>
                        {documento?.tipoDocumento !== 'Factura Recibo' ? (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'flex-end' }}>
                            <table className="table table-gridjs" style={{ 
                              backgroundColor: 'white', 
                              fontSize: '12px', 
                              maxWidth: '600px', 
                              marginTop: '-30px' 
                            }}>
                              <thead style={{ height: '15px' }}>
                                <tr>
                                  <th colSpan="4" style={{ 
                                    backgroundColor: 'white', 
                                    paddingInline: 0, 
                                    borderTop: 'none', 
                                    paddingBlock: '2px' 
                                  }}>
                                    <span style={{ 
                                      flex: 1, 
                                      width: '100%', 
                                      color: 'rgb(104, 104, 104)', 
                                      fontSize: '13px', 
                                      paddingBottom: '10px', 
                                      fontWeight: 500 
                                    }}>
                                      Quadro Resumo de Impostos
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <thead style={{ background: 'white' }}>
                                <tr style={{ 
                                  background: 'white', 
                                  maxHeight: '8px', 
                                  overflow: 'hidden', 
                                  boxSizing: 'border-box', 
                                  padding: 0 
                                }}>
                                  <th style={{ 
                                    maxHeight: '8px', 
                                    boxSizing: 'border-box', 
                                    background: 'white', 
                                    padding: '5px' 
                                  }}>Taxa (%)</th>
                                  <th style={{ 
                                    maxHeight: '8px', 
                                    boxSizing: 'border-box', 
                                    background: 'white', 
                                    padding: '5px' 
                                  }}>Incidência</th>
                                  <th style={{ 
                                    maxHeight: '8px', 
                                    boxSizing: 'border-box', 
                                    background: 'white', 
                                    padding: '5px' 
                                  }}>Total</th>
                                  <th style={{ 
                                    maxHeight: '8px', 
                                    boxSizing: 'border-box', 
                                    background: 'white', 
                                    padding: '5px' 
                                  }}>Motivo isenção</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupProdutosByTaxa?.()?.map((data, index) => (
                                  <tr key={index} style={{ 
                                    maxHeight: '8px', 
                                    overflow: 'hidden', 
                                    padding: 0, 
                                    borderBottom: 'none' 
                                  }}>
                                    <td style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px', 
                                      borderBottom: 'none' 
                                    }}>{data?.taxa}</td>
                                    <td style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px', 
                                      borderBottom: 'none' 
                                    }}>{formatCurrency1(data?.incidencia)}</td>
                                    <td style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px', 
                                      borderBottom: 'none' 
                                    }}>{formatCurrency1(data?.total)}</td>
                                    <td style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px', 
                                      borderBottom: 'none' 
                                    }}>{data?.motivo}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div style={{ flex: 1 }}></div>
                        )}
            
                        <div className="totals" style={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          marginTop: '-20px' 
                        }}>
                          <div className="totalRow">
                            <span className="label">Total Ilíquido:</span>
                            <span className="value">
                              {formatCurrency(
                                totalValue?.('total') + totalValue?.('descontoFinal') - totalValue?.('taxaImposto')
                              )}
                            </span>
                          </div>
                          <div className="totalRow">
                            <span className="label">Total de Descontos:</span>
                            <span className="value">
                              {formatCurrency(totalValue?.('descontoFinal'))}
                            </span>
                          </div>
                          <div className="totalRow">
                            <span className="label">Total de Impostos:</span>
                            <span className="value">
                              {formatCurrency(totalValue?.('taxaImposto'))}
                            </span>
                          </div>
                          <div className="totalRow1">
                            <span className="label1">Total a Pagar:</span>
                            <span className="value">
                              {formatCurrency(totalValue?.('total'))}
                            </span>
                          </div>
                        </div>
                      </div>
            
                      {[13, 12, 11, 10].includes(getLastPageProductIndex()) && documento?.tipoDocumento === 'Factura Recibo' && (
                        <>
                          <tr style={{ 
                            border: 'none',
                            height: getLastPageProductIndex() === 13 ? '174px' :
                                   getLastPageProductIndex() === 12 ? '220px' :
                                   getLastPageProductIndex() === 11 ? '266px' :
                                   getLastPageProductIndex() === 10 ? '312px' : '0'
                          }}>
                            <td style={{ border: 'none' }} colSpan="18" className="page-break">
                              <div style={{ pageBreakAfter: 'always' }}></div>
                            </td>
                          </tr>
                          {(!documento?.factura_id) ? HeaderTemplate() : HeaderTemplateRecibo()}
                        </>
                      )}
            
                      {documento?.tipoDocumento === 'Factura Recibo' && (
                        <>
                          <div
                            className="table-responsive"
                            style={{
                              height: '100%',
                              paddingBottom: '80px',
                              overflowY: 'hidden',
                              marginTop: '25px'
                            }}
                          >
                            <table className="table table-gridjs" style={{ backgroundColor: 'white' }}>
                              <thead style={{ background: '#f3f6f9' }}>
                                <tr style={{ backgroundColor: '#f3f6f9' }}>
                                  <th style={{ maxWidth: '20px', width: '20px' }}>#</th>
                                  <th>Forma de pag.</th>
                                  <th>Banco</th>
                                  <th>Data</th>
                                  <th>Ref. do pag.</th>
                                  <th>Valor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredPagamentos(documento?.pagamentos??[])?.map((item, index) => {
                                  const showPageBreak = (
                                    (index + 1 === 2 && getLastPageProductIndex() === 9) ||
                                    (index + 1 === 3 && getLastPageProductIndex() === 8) ||
                                    (index + 1 === 4 && getLastPageProductIndex() === 7) ||
                                    (index + 1 === 5 && getLastPageProductIndex() === 6) ||
                                    (index + 1 === 6 && getLastPageProductIndex() === 5) ||
                                    (index + 1 === 7 && getLastPageProductIndex() === 4) ||
                                    (index + 1 === 8 && getLastPageProductIndex() === 3) ||
                                    (index + 1 === 9 && getLastPageProductIndex() === 2)
                                  );
                                  
                                  return (
                                    <React.Fragment key={index}>
                                      <tr>
                                        <td>{index + 1}</td>
                                        <td>{item?.tipoPagamento || "-"}</td>
                                        <td>{item?.banco || "-"}</td>
                                        <td>
                                          {item?.dataPagamento 
                                            ? format(new Date(item?.dataPagamento), 'dd-MM-yyyy')
                                            : "-"}
                                        </td>
                                        <td>{item?.referencia || "-"}</td>
                                        <td>
                                          {item?.valor
                                            ? formatCurrency(item?.valor)
                                            : "AOA 0"}
                                        </td>
                                      </tr>
                                      
                                      {showPageBreak && (
                                        <>
                                          <tr style={{ border: 'none', height: '195px' }}>
                                            <td style={{ border: 'none' }} colSpan="18" className="page-break">
                                              <div style={{ pageBreakAfter: 'always' }}></div>
                                            </td>
                                          </tr>
                                          <tr style={{ border: 'none', padding: 0 }}>
                                            <td colSpan="6" style={{ border: 'none', padding: 0 }}>
                                              {(!documento?.factura_id) ? HeaderTemplate() : HeaderTemplateRecibo()}
                                            </td>
                                          </tr>
                                          <tr style={{ backgroundColor: '#f3f6f9' }}>
                                            <th style={{ maxWidth: '20px', width: '20px' }}>#</th>
                                            <th>Forma de pag.</th>
                                            <th>Banco</th>
                                            <th>Data</th>
                                            <th>Ref. do pag.</th>
                                            <th>Valor</th>
                                          </tr>
                                        </>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
            
                          <div className="bottom" style={{ marginTop: '-60px', display: documento?.tipoDocumento === 'Factura Recibo' ? 'flex' : 'none' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'flex-end' }}>
                              <table className="table table-gridjs" style={{ 
                                backgroundColor: 'white', 
                                fontSize: '12px', 
                                maxWidth: '600px', 
                                marginTop: '-30px' 
                              }}>
                                <thead style={{ height: '15px' }}>
                                  <tr>
                                    <th colSpan="4" style={{ 
                                      backgroundColor: 'white', 
                                      paddingInline: 0, 
                                      borderTop: 'none', 
                                      paddingBlock: '2px' 
                                    }}>
                                      <span style={{ 
                                        flex: 1, 
                                        width: '100%', 
                                        color: 'rgb(104, 104, 104)', 
                                        fontSize: '13px', 
                                        paddingBottom: '10px', 
                                        fontWeight: 500 
                                      }}>
                                        Quadro Resumo de Impostos
                                      </span>
                                    </th>
                                  </tr>
                                </thead>
                                <thead style={{ background: 'white' }}>
                                  <tr style={{ 
                                    background: 'white', 
                                    maxHeight: '8px', 
                                    overflow: 'hidden', 
                                    boxSizing: 'border-box', 
                                    padding: 0 
                                  }}>
                                    <th style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px' 
                                    }}>Taxa (%)</th>
                                    <th style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px' 
                                    }}>Incidência</th>
                                    <th style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px' 
                                    }}>Total</th>
                                    <th style={{ 
                                      maxHeight: '8px', 
                                      boxSizing: 'border-box', 
                                      background: 'white', 
                                      padding: '5px' 
                                    }}>Motivo isenção</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupProdutosByTaxa?.()?.map((data, index) => (
                                    <tr key={index} style={{ 
                                      maxHeight: '8px', 
                                      overflow: 'hidden', 
                                      padding: 0, 
                                      borderBottom: 'none' 
                                    }}>
                                      <td style={{ 
                                        maxHeight: '8px', 
                                        boxSizing: 'border-box', 
                                        background: 'white', 
                                        padding: '5px', 
                                        borderBottom: 'none' 
                                      }}>{data?.taxa}</td>
                                      <td style={{ 
                                        maxHeight: '8px', 
                                        boxSizing: 'border-box', 
                                        background: 'white', 
                                        padding: '5px', 
                                        borderBottom: 'none' 
                                      }}>{formatCurrency1(data?.incidencia)}</td>
                                      <td style={{ 
                                        maxHeight: '8px', 
                                        boxSizing: 'border-box', 
                                        background: 'white', 
                                        padding: '5px', 
                                        borderBottom: 'none' 
                                      }}>{formatCurrency1(data?.total)}</td>
                                      <td style={{ 
                                        maxHeight: '8px', 
                                        boxSizing: 'border-box', 
                                        background: 'white', 
                                        padding: '5px', 
                                        borderBottom: 'none' 
                                      }}>{data?.motivo}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
            
                            <div className="totals" style={{ 
                              backgroundColor: 'white', 
                              border: 'none', 
                              marginTop: '-20px' 
                            }}>
                              <div className="totalRow">
                                <span className="label">Total recebido:</span>
                                <span className="value">
                                  {formatCurrency1(totalPagamentoValue?.('valor'))}
                                </span>
                              </div>
                              <div className="totalRow1">
                                <span className="label1">Crédito sobrando:</span>
                                <span className="value">
                                  {formatCurrency1(
                                    (totalValue?.('total') - totalPagamentoValue?.('valor'))
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>


                <div id="pdfContainerRecibo">
                      <div style={{
                        backgroundColor: 'white',
                        gap: '10px',
                        width: '100%',
                        height: '100%',
                        padding: '20px',
                        paddingTop: '60px'
                      }}>
                        <div className="pdfHeader">
                          {getTotalPagesRecibos().map((page, pageIndex) => (
                            <React.Fragment key={pageIndex}>
                              {true ? (
                                <>
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    paddingTop: '5px'
                                  }}>
                                    <div className="pdfLogo">
                                      <img
                              src={empresaImage ||
                                        "https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1770854400&v=beta&t=GM8FbM7oioz63kgp7-nf2uBSuMikuHzW1A1jyr1Ecmo"}
                              className="logo"
                            />
                                    </div>
                                  </div>
                
                                  <div className="pdfCompanyTitle" style={{ marginTop: '20px' }}>
                                    {empresa?.nome_empresa}
                                  </div>
                                  
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginTop: '10px'
                                  }}>
                                    <div className="pdfCompanyInfo" style={{ flex: 1 }}>
                                  <div className="pdfHeaderRow">
                                    <span className="label">Localização: </span>
                                    <span className="value">{documento?.polo?.localizacao}</span>
                                  </div>
                                  <div className="pdfHeaderRow">
                                    <span className="label">NIF: </span>
                                    <span className="value">{empresa?.num_contribuinte}</span>
                                  </div>
                                  {true && (
                                    <div className="pdfHeaderRow">
                                      <span className="label">Website: </span>
                                      <span className="value">{documento?.polo?.website?? "N/A"}</span>
                                    </div>
                                  )}
                                  <div className="pdfHeaderRow">
                                    <span className="label">Email: </span>
                                    <span className="value">{documento?.polo?.email}</span>
                                  </div>
                                  <div className="pdfHeaderRow">
                                    <span className="label">Tel: </span>
                                    <span className="value">{documento?.polo?.telemovel}</span>
                                  </div>
                                </div>
                
                                    <div className="pdfClientInfo" style={{ flex: 1 }}>
                                      <div className="pdfHeaderRow">
                                        <span className="label">Cliente: </span>
                                        <span className="value">
                                          {documento?.cliente?.nome || "Consumidor Final"}
                                        </span>
                                      </div>
                                      <div className="pdfHeaderRow">
                                        <span className="label">NIF: </span>
                                        <span className="value">{documento?.cliente?.nif || "N/A"}</span>
                                      </div>
                                      <div className="pdfHeaderRow">
                                        <span className="label">Localização: </span>
                                        <span className="value">
                                          {documento?.cliente?.localizacao || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                
                                  <div
                                    className="table-responsive"
                                    style={{
                                      height: '100%',
                                      paddingBottom: '80px',
                                      overflowY: 'hidden',
                                      marginTop: '50px'
                                    }}
                                  >
                                    <table className="table table-gridjs" style={{ backgroundColor: 'white' }}>
                                      <thead style={{ backgroundColor: 'white' }}>
                                        <tr style={{ backgroundColor: 'white' }}>
                                          <th colSpan="5" style={{
                                            fontWeight: 700,
                                            fontSize: '18px',
                                            backgroundColor: 'white',
                                            borderTop: 'none'
                                          }}>
                                            {`Recibo Nº ${documento?.numeroRecibo}`}
                                          </th>
                                          <th style={{
                                            fontSize: '13px',
                                            backgroundColor: 'white',
                                            borderTop: 'none',
                                            textAlign: 'right',
                                            fontWeight: 600
                                          }}>
                                            Segunda Via
                                          </th>
                                        </tr>
                                        <tr style={{ backgroundColor: 'white', fontWeight: '500' }}>
                                          <th style={{ backgroundColor: 'white' }}>Data Emi.</th>
                                          <th style={{ backgroundColor: 'white' }}>NIF</th>
                                          <th style={{ backgroundColor: 'white' }}>V/ Ref.</th>
                                          <th style={{ backgroundColor: 'white' }}>Documento ref..</th>
                                          <th style={{ backgroundColor: 'white' }}>Valor doc.</th>
                                          <th style={{ backgroundColor: 'white', maxWidth: '220px', width: '220px' }}></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>{format(new Date(documento?.dataEmissaoRecibo||null), 'dd-MM-yyyy')}</td>
                                          {/* <td>
                                            {tipoDocumento === 'Factura Recibo' ? 'N/A' : format(new Date(dataValidade?.length > 0 ? dataValidade : null), 'dd-MM-yyyy')}
                                          </td> */}
                                          <td>
                                            {documento?.cliente?.nif || "N/A"}
                                          </td>
                                          <td>
                                            {documento?.numeroRecibo}
                                          </td>
                                          <td>
                                            {documento?.numeroDocumento}
                                          </td>
                                          <td>
                                            {formatCurrency(totalValue?.('total'))}
                                          </td>
                                          <td rowSpan={2} style={{border: 'none'}}>
                                <div
                                  className="qrContainer"
                                  style={{
                                    padding: 0,
                                    height: "80px",
                                    transform: "translateY(-55px)",
                                  }}
                                >
                                  <img
                                    src={documento?.qr_code_recibo}
                                    style={{
                                      width: "100%",
                                      height: "220px",
                                      objectFit: "contain",
                                    }}
                                  />
                                </div>
                              </td>
                                        </tr>
                
                                        <tr>
                                          <td colSpan="4" style={{ borderBottom: 'none' }}>
                                            <section style={{ flex: 1 }}>
                                              {(documento?.tipoDocumento === 'Factura Recibo' || documento?.tipoDocumento === 'Factura') ? (
                                                <>
                                                 
                                                  {true && (
                                                    <>
                                                      <div style={{ fontWeight: 800 }}>Obs:</div>
                                                      <div style={{ maxHeight: '21px' }}>
                                                        Através do(s) seguinte(s) meio(s) no valor total de {formatCurrency(totalPagamentoValue("valor"))}
                                                      </div>
                                                    </>
                                                  )}
                                                </>
                                              ) : (
                                                <>
                                                  <div style={{ fontWeight: 800 }}>Obs:</div>
                                                  <div style={{ maxHeight: '21px' }}>
                                                    Este documento não serve de factura. <br />
                                                    {documento?.obs}
                                                  </div>
                                                </>
                                              )}
                                            </section>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              ) : (
                                HeaderTemplateRecibo()
                              )}
                
                              <div
                                className="table-responsive"
                                style={{
                                  height: '100%',
                                  paddingBottom: '80px',
                                  overflowY: 'hidden',
                                  marginTop: '-15px'
                                }}
                              >
                                <table className="table table-gridjs" style={{ backgroundColor: 'white' }}>
                                  <thead style={{ background: 'white' }}>
                                    <tr style={{ backgroundColor: 'white' }}>
                                      <th style={{ maxWidth: '20px', width: '20px', backgroundColor: 'white' }}>#</th>
                                      <th style={{ backgroundColor: 'white' }}>Forma de pag.</th>
                                      <th style={{ backgroundColor: 'white' }}>Banco</th>
                                      <th style={{ backgroundColor: 'white' }}>Data</th>
                                      <th style={{ backgroundColor: 'white' }}>Ref. do pag..</th>
                                      <th style={{ backgroundColor: 'white' }}>Valor</th>
                                      {/* <th style={{ backgroundColor: 'white' }}>Total</th> */}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredPagamentos(documento?.pagamentos)?.length > 0 && 
                                      filteredPagamentos(documento?.pagamentos)
                                        .slice((pageIndex * itemsPerPage), (pageIndex * itemsPerPage) + itemsPerPage)
                                        .map((data, index) => {
                                          const globalIndex = index;
                                          const isLastPage = pageIndex + 1 === getTotalPagesRecibos().length;
                                          const isLastProduct = data?.index == filteredPagamentos(documento?.pagamentos).length;
                                          return (
                                            <React.Fragment key={index}>
                                              <tr>
                                                <td>
                                                  <div>{data?.index + ''}</div>
                                                </td>
                                                <td>
                                                  <div
                                                    style={{
                                                      
                                                      border: 'none'
                                                    }}
                                                    title={data?.tipoPagamento||"-"}
                                                  >
                                                    {data?.tipoPagamento||"-"}
                                                  </div>
                                                </td>
                                                <td>
                                                  <div>{data?.banco||"-"}</div>
                                                </td>
                                                <td>
                                                  <div>{data?.dataPagamento ? format(new Date(data?.dataPagamento), 'dd/MM/yyy')  : "-"}</div>
                                                </td>
                                                <td>
                                                  <div>{data?.referencia||"-"}</div>
                                                </td>
                                                <td>
                                                  <div>
                                                    {data?.valor ? formatCurrency(data?.valor)  : "AOA 0"}
                                                  </div>
                                                </td>
                                                
                                              </tr>
                
                                              {((globalIndex + 1) === 17 || (globalIndex > 18 && ((globalIndex - 17 + 1) % 31 === 0))) && (
                                                <tr style={{ 
                                                  border: 'none',
                                                  height: (globalIndex > 17 && ((globalIndex - 17 + 1) % 31 === 0)) ? '76px' : '56px'
                                                }}>
                                                  <td style={{ border: 'none' }} colSpan="18" className="page-break">
                                                    <div style={{ pageBreakAfter: 'always' }}></div>
                                                  </td>
                                                </tr>
                                              )}
                
                                              {isLastPage && isLastProduct && (index + 1 === 14 || index + 1 === 15 || index + 1 === 16) && (
                                                <tr style={{ 
                                                  border: 'none',
                                                  height: index + 1 === 14 ? '194px' 
                                                        : index + 1 === 15 ? '146px'
                                                        : '100px'
                                                }}>
                                                  <td style={{ border: 'none' }} colSpan="18" className="page-break">
                                                    <div style={{ pageBreakAfter: 'always' }}></div>
                                                  </td>
                                                </tr>
                                              )}
                                            </React.Fragment>
                                          );
                                        })
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </React.Fragment>
                          ))}
                
                          {[14, 15, 16, 17].includes(getLastPageProductIndexRecibos()) && (
                            HeaderTemplateRecibo()
                          )}
                
                          <div className="bottom" style={{ 
                            marginTop: [14, 15, 16, 17].includes(getLastPageProductIndexRecibos()) ? '-20px' : '-55px'
                          }}>
                           
                            <div style={{ flex: 1 }}></div>
                            
                
                            <div className="totals" style={{ 
                              backgroundColor: 'white', 
                              border: 'none', 
                              marginTop: '-20px' 
                            }}>
                              <div className="totalRow">
                                <span className="label">Total a pagar:</span>
                                <span className="value">
                                  {formatCurrency(
                                    totalValue?.('total')
                                  )}
                                </span>
                              </div>
                              <div className="totalRow">
                                <span className="label">Total recebido:</span>
                                <span className="value">
                                  {formatCurrency(totalPagamentoValue?.('valor'))}
                                </span>
                              </div>
                              
                              <div className="totalRow1">
                                <span className="label1">Crédito sobrando:</span>
                                <span className="value">
                                  {formatCurrency(totalValue?.('total') - totalPagamentoValue('valor'))}
                                </span>
                              </div>
                            </div>
                          </div>
                
                          
                        </div>
                      </div>
                    </div>
        </>
    );
};

export default Dashboard;
