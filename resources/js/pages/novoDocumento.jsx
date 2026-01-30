import React, { useEffect, useState } from "react";
import "../../css/novoDocumento.css";
import Loading1 from "../components/loading1";
import logo from "../../images/logo.jpeg";
import { format, parseISO, set } from "date-fns";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogOverlay,
} from "../components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover";
import api from "../components/api";
import { Bounce, toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "../components/ui/alert-dialog"
import { jsPDF } from "jspdf";
import axios from "axios";


const NovoDocumento = () => {
  const [done, setDone] = useState(false);
    const [load, setLoad] = useState(false);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [notaParam, setNotaParam] = useState(false);
    const [replica, setReplica] = useState('Original');
    const [factura, setFactura] = useState(null);
    const [polo, setPolo] = useState(null);
    const [documentoOrigem, setDocumentoOrigem] = useState("");
    const [byPassRecibo, setBypassRecibo] = useState(false)
    const [dataNota, setDataNota] = useState("");
    const [dataValidadeRetificacao, setDataValidadeRetificacao] = useState("");
    const [notaParamBypass, setNotaParamBypass] = useState(false);
    const [bypassPagamento, setBypassPagamento] = useState(false);
    const documentoConfigs = ["Original", "Duplicado", "Triplicado", "Segunda Via"];

    const [motivo, setMotivo] = useState("");
    const [empresaImage, setEmpresaImage] = useState(null);
    const [empresa, setEmpresa] = useState(null);

    const [localizacao, setLocalizacao] = useState("");
    const [nif, setNif] = useState("");
    const [website, setWebsite] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [responseDoc, setResponseDoc] = useState(null);
    const [responseDoc1, setResponseDoc1] = useState(null);

    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("Factura");
    const [moeda, setMoeda] = useState("AOA");
    const [dataEmissao, setDataEmissao] = useState(
        format(new Date(), "yyyy-MM-dd")
    );
    const [dataValidade, setDataValidade] = useState("");
    const [selectedProdutos, setSelectedProdutos] = useState([]);
    const [tipoNota, setTipoNota] = useState("");
    const [open, setOpen] = useState(false);
    const [notas, setNotas] = useState("");
    const [reciboParam, setReciboParam] = useState(false);
    const today = new Date().toISOString().split("T")[0];
    const totalValue = (field) => {
        return (
  done === true && responseDoc1?.nota && responseDoc1?.factura && load && Array.isArray(responseDoc?.produtos)
    ? responseDoc.produtos.concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos)
    : selectedProdutos
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
    const [payments, setPayments] = useState([
        {
            tipoPagamento: "",
            banco: "",
            valor: "",
            dataPagamento: format(new Date(), "yyyy-MM-dd"),
            referencia: "",
            disabled: false,
        },
    ]);
    const updatePayment = (index, field, value) => {
        setPayments((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
        console.log('payments afterward', payments)
    };
    const addPayment = () => {
        setPayments((prev) => [
            ...prev,
            {
                tipoPagamento: "",
                banco: "",
                valor: "",
                dataPagamento: format(new Date(), "yyyy-MM-dd"),
                referencia: "",
                disabled: false,
            },
        ]);
    };
    const removePayment = (index) => {
        if (index === 0 || payments[index]?.disabled) return;

        setPayments((prev) => prev.filter((_, i) => i !== index));
    };
    const filteredPagamentos = (list) => {
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
                    index: index + 1,
                };
            });
    };
    const totalPagamentoValue = (field) => {
       
        return filteredPagamentos(payments).reduce((count, item) => {
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
    const remaining = totalValue("total") - totalPagamentoValue("valor");
    const creditColor =
        remaining === 0 ? "green" : remaining > 0 ? "#cfcf00" : "red";

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
    ];
    const tiposDocumentosGrouped = tiposDocumentos.reduce((acc, item) => {
        const grupo = item.grupo || "Sem nome";
        if (!acc[grupo]) acc[grupo] = [];
        acc[grupo].push(item);
        return acc;
    }, {});

    const [loadingProdutos, setLoadingProdutos] = useState(false);
    useEffect(() => {
      
        produtos?.length <= 0 && setLoadingProdutos(true);
        (clientes.length <= 0) && setLoadingClientes(true);
        produtos?.length <= 0 && api.get("/v1/artigos")
            .then((res) => {
                setProdutos([...res.data].filter((i) => i?.status == "activo"));
                setLoadingProdutos(false);
            })
            .catch((err) => {
                setLoadingProdutos(false);
            });
        if (clientes.length <= 0) {
          api.get("/v1/clientes/index")
            .then((res) => {
                console.trace('clients response', res);
                setClientes(
                    [
                        {
                            id: null,
                            nome: "Consumidor Final",
                        },
                    ]
                        .concat(
                            [...res.data].filter((i) => i?.status == "activo")
                        )
                        
                );
                setLoadingClientes(false);
                
                
                console.trace('selectedd', factura?.cliente_id, selectedCliente, clientes)
            })
            .catch((err) => {
                console.log('error fetching clients', err);
                setLoadingClientes(false);
            });
        }else {
          setSelectedCliente(
                    [
                        {
                            id: null,
                            nome: "Consumidor Final",
                        },
                    ]
                        .concat(
                            [...clientes].filter((i) => i?.status == "activo")
                        )?.find((i) => i?.id == factura?.cliente_id)
                );
        }
    }, [factura]);
    useEffect(() => {
        const fullUserEmpresa = JSON.parse(
            sessionStorage.getItem("fullUserEmpresa") || "{}"
        );

        const fullUserPolo = JSON.parse(
            sessionStorage.getItem("fullUserPolo") || "{}"
        );
        console.log("empresa polo", fullUserEmpresa, fullUserPolo);

        setEmpresa(fullUserEmpresa);
        setPolo(fullUserPolo);
        setLocalizacao(fullUserPolo?.localizacao || "");
        setNif(fullUserEmpresa?.num_contribuinte || "");
        setWebsite(fullUserPolo?.website || "");
        setTelefone(fullUserPolo?.telemovel || "");
        setEmail(fullUserPolo?.email || "");
        
        if (fullUserEmpresa?.logo) {
          // setEmpresaImage(`/storage/${fullUserEmpresa?.logo}`);
          // setEmpresaImage("https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1770854400&v=beta&t=GM8FbM7oioz63kgp7-nf2uBSuMikuHzW1A1jyr1Ecmo")
          setEmpresaImage(logo)
        }else {
          setEmpresaImage(logo)
        }
    }, []);

    const extractPercentage = (item) => {
        return parseFloat(item?.produto?.impostoFull?.taxa);
    };
    const insideFactura = (data) => {
        // Disable edit/remove if product is already inside factura
        return !!factura && data?.insideFactura === true;
    };
    const [removeOpen, setRemoveOpen] = useState(false);
    const openRemove = (data) => {
        setProduto(data)
        setRemoveOpen(true);
    };

    const [errors, setErrors] = useState([]);
    const [openPayment, setOpenPayment] = useState(false);
    const [selProductImage, setSelProductImage] = useState(null);
    const [produto, setProduto] = useState(null);
    const [disablePercentual, setDisablePercentual] = useState(false);
    const [disableFixo, setDisableFixo] = useState(true);
    const [produtoForm, setProdutoForm] = useState({
        produto: null,
        quantidade: 1,
        preco: 0,
        taxaImpostoText: "",
        taxaImposto: 0,
        categoriaProduto: "",
        descontoPercentual: null,
        descontoFixo: null,
        total: 0,
    });
    const [produtos, setProdutos] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(17);

    const incrementQuantidade = () => {
        setProdutoForm((p) => ({
            ...p,
            quantidade: p.quantidade + 1,
        }));
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
    const decrementQuantidade = () => {
        setProdutoForm((p) => ({
            ...p,
            quantidade: Math.max(1, p.quantidade - 1),
        }));
    };
    const handleProdutoChange = (produto) => {
        console.log('produto change', produto);
        let produtoSelecionado = produtos.find((p) => p.id === produto.id);
        setProdutoForm((p) => ({
            ...p,
            produto,
            preco: produto?.preco_venda || 0,
            categoriaProduto: produto?.categoriaFull?.designacao || "",
            taxaImpostoText: produto?.taxa || "",
            taxaImposto: produto?.taxaValor || 0,
            total: p.quantidade * (produto?.preco || 0),
        }));

        const produtoEdit = selectedProdutos.find(
            (p) => p?.produto?.id === produtoSelecionado.id
        );
        
        if (produtoEdit) {
            setProduto(produtoEdit);

            setSelProductImage(
                `/storage/${produtoEdit.produto?.imagemFull?.file}`
            );

            setErrors([]);

            setProdutoForm((p) => ({
                ...p,
                quantidade: produtoEdit.quantidade,
                preco: Number(produtoEdit.preco),
                taxaImpostoText: produtoEdit.taxaImpostoText,
                categoriaProduto: produtoEdit.categoriaProduto,
                descontoPercentual: produtoEdit.descontoPercentual,
                descontoFixo: produtoEdit.descontoFixo,
                total: produtoEdit.total,
            }));
        } else {
            const selectedProduto = produtos.find(
                (p) => p.id === produtoSelecionado.id
            );

            if (selectedProduto) {
                setProdutoForm((p) => ({
                    ...p,
                    preco: Number(selectedProduto.preco_venda),
                    categoriaProduto:
                        selectedProduto.categoriaFull?.designacao || "",
                }));
            }
        }
    };
    const [maxFixo, setMaxFixo] = useState(0);
    
    const openModal = () => {
        

        setErrors([]);
        setSelProductImage(null);
        setProduto(null)
        setProdutoForm({
            produto: null,
            quantidade: 1,
            preco: 0,
            taxaImpostoText: "",
            taxaImposto: 0,
            categoriaProduto: "",
            descontoPercentual: null,
            descontoFixo: null,
            total: 0,
        });
        setOpen(true);
    };
    const openEdit = (data) => {
        setProduto(data)
        setSelProductImage(`/storage/${data.produto?.imagemFull?.file}`);
        setProdutoForm({
            produto: data.produto,
            quantidade: data.quantidade,
            preco: Number(data.preco),
            taxaImpostoText: data.taxaImpostoText,
            taxaImposto: data.taxaImposto,
            categoriaProduto: data.categoriaProduto,
            descontoPercentual: data.descontoPercentual,
            descontoFixo: data.descontoFixo,
            total: data.total,
        });
        setOpen(true)
    }
    useEffect(() => {
        if (!produtoForm.produto || produtoForm.quantidade <= 0) return;

        const { produto, quantidade, preco, descontoPercentual, descontoFixo } =
            produtoForm;

        console.trace('produtoForm changed', produto);
        if (produto?.imagemFull?.file) {
            setSelProductImage(`/storage/${produto?.imagemFull?.file}`);
        }

        let total = quantidade * preco;

        setMaxFixo(total);

        const taxa =
            (total * parseFloat(produto?.impostoFull?.taxa || 0)) / 100;

        const impostoText = `Taxa: ${produto?.impostoFull?.taxa}% | Valor: ${formatCurrency1(Number(taxa))}`;

        if (descontoPercentual) {
            total -= (total * descontoPercentual) / 100;
        }

        if (descontoFixo) {
            total -= descontoFixo;
        }

        total += taxa;

        setProdutoForm((p) => ({
            ...p,
            taxaImposto: taxa,
            taxaImpostoText: impostoText,
            total,
        }));
    }, [
        produtoForm.produto,
        produtoForm.quantidade,
        produtoForm.preco,
        produtoForm.descontoPercentual,
        produtoForm.descontoFixo,
    ]);

    const addProduto = () => {
       
//        toast('🦄 Wow so easy!', {
// position: "bottom-right",
// autoClose: 5000,
// hideProgressBar: false,
// closeOnClick: false,
// pauseOnHover: true,
// draggable: true,
// progress: undefined,
// theme: "dark",
// transition: Bounce,
// style: {
//     background: 'red',
//     color: 'white'
// }
// });
const value = produtoForm;

  // reset errors
  setErrors([]);

  // === basic validation (Angular: produtoForm.invalid) ===
  if (
    !value.produto ||
    !value.quantidade ||
    !value.preco ||
    value.quantidade <= 0
  ) {
          toastError('Preencha por favor todos os campos!')
    return;
  }

  if (
    selectedProdutos.find(
      (p) => p.produto.id === value.produto.id
    )
  ) {
    toastError('Produto já adicionado!')
    return;
  }
  if (value.descontoFixo && Number(value.descontoFixo) > Number(maxFixo)) {
    toastError('Desconto fixo não pode ser maior que o total!')
return;
  }
  if (value.descontoPercentual && Number(value.descontoPercentual) > 100) {
    toastError('Desconto percentual não pode ser maior que 100%!')
    return;
  }

  let descontoFinal = 0;

  if (value.descontoPercentual) {
    descontoFinal =
      (value.preco *
        value.quantidade *
        value.descontoPercentual) /
      100;
  } else if (value.descontoFixo) {
    descontoFinal = value.descontoFixo;
  }

  setSelectedProdutos((current) => {
    const updated = [
      ...current,
      {
        ...value,
        descontoFinal,
        index: current.length + 1,
      },
    ];

    localStorage.setItem(
      "facturaProdutos",
      JSON.stringify(updated)
    );

    return updated;
  });
        toastSuccess('Produto adicionado com sucesso!')
    };
    const editProduto = () => {
        const value = produtoForm;
        if (
    !value.produto ||
    !value.quantidade ||
    !value.preco ||
    value.quantidade <= 0
  ) {
          toastError('Preencha por favor todos os campos!')
    return;
  }
  if (value.descontoFixo && Number(value.descontoFixo) > Number(maxFixo)) {
    toastError('Desconto fixo não pode ser maior que o total!')
return;
  }
  if (value.descontoPercentual && Number(value.descontoPercentual) > 100) {
    toastError('Desconto percentual não pode ser maior que 100%!')
    return;
  }
  let descontoFinal = 0;

  if (value.descontoPercentual) {
    descontoFinal =
      (value.preco *
        value.quantidade *
        value.descontoPercentual) /
      100;
  } else if (value.descontoFixo) {
    descontoFinal = value.descontoFixo;
  }
  setSelectedProdutos((current) => {
    const updated = current.map((p) => {
      if (p.produto.id === produto.produto.id) {
        return {
          ...value,
          descontoFinal,
        };
      }
      return p;
    });

    localStorage.setItem(
      "facturaProdutos",
      JSON.stringify(updated)
    );

    return updated;
  });
        toastSuccess('Produto editado com sucesso!')

    }
    const downloadMultipleDocs = async (upToIndex, type=null) => {
      setLoad(true);

    for (let i = 0; i < upToIndex; i++) {
      setReplica(documentoConfigs[i]);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await downloadDoc(i, type);
    }

    setLoad(false);
  }
const disableStylesheets = () => {
  const disabledLinks = [];

  Array.from(
    document.querySelectorAll("link[rel='stylesheet']")
  ).forEach((link) => {
    // Only disable Tailwind / app styles
    if (
      // link.href.includes("tailwind")
      // link.href.includes("index") ||
      // link.href.includes("app")
      false

      
    ) {
      link.disabled = true;
      disabledLinks.push(link);
    }
  });

  // Return restore function
  return () => {
    disabledLinks.forEach(link => {
      link.disabled = false;
    });
  };
};

    const downloadDoc = (index = 0, type=null) => {
    return new Promise(async (resolve, reject) => {
      setLoad(true);

      index == 3 && (await new Promise((resolve) => setTimeout(resolve, 1000)));

      const isA4 = tipoFolha == "A4";
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
        const scale = pageWidth / originalContentWidth; // This will scale down width only
        
        const expectedPages = Math.ceil(
          (contentHeight * scale + 50) / pageHeight
        );
        console.log("no ceil", (contentHeight * scale + 50) / pageHeight);
        console.log("expected pages", expectedPages);
const restoreStyles = disableStylesheets();

        doc.html(clonedPages, {
          x: 0, // Start from the left edge
          y: 0, // Start from the top edge
          html2canvas: {
            // scale: scale, // Use calculated scale to fit
            scale: scale,
            
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
            devicePixelRatio: 1,
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
            restoreStyles()
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
                      responseDoc?.recibo_hash?.[0] +
                      responseDoc?.recibo_hash?.[11] +
                      responseDoc?.recibo_hash?.[21] +
                      responseDoc?.recibo_hash?.[31]
                    }-Processado por programa validado nº ###/AGT/2025 Level-Invoice`
                  : `${
                      responseDoc?.hash?.[0] +
                      responseDoc?.hash?.[11] +
                      responseDoc?.hash?.[21] +
                      responseDoc?.hash?.[31]
                    }-Processado por programa validado nº ###/AGT/2025 Level-Invoice` +
                      " | " +
                      `Os bens/serviços foram colocados à disposição do adquirente na data de ${format(
                        parseISO(responseDoc?.created_at),
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
            
            toastSuccess(`Documento ${documentoConfigs[index]} exportado com sucesso`)

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
                tipoDocumento == "Factura" &&
                type == "recibo"
                  ? "Recibo__"
                  : ""
              }${
                responseDoc?.tipoDocumento +
                " Nº " +
                responseDoc?.numeroDocumento
              }___${documentoConfigs[index]}.pdf`
            );
            index == 3 && setLoad(false);

            resolve();
          },
          // autoPaging: 'text',
        });
      }, 1); // Allow rendering time
    });
  }
    const setResponseDocFun = (type) => {
        if (type == "factura") {
      setNotaParamBypass(true);
      setResponseDoc(responseDoc1?.factura);
    } else {
      setNotaParamBypass(false);
      setResponseDoc(responseDoc1?.nota);
    }
    }
    const [successContinue, setSuccessContinue] = useState(false);
    const [successTitle, setSuccessTitle] = useState("");
    const [successDescription, setSuccessDescription] = useState("");

    const createDoc = () => {
  setSuccessContinue(false);

  const consumidorFinalException =
    tipoDocumento === "Factura" && false;

  if (!tipoDocumento || !dataEmissao || !moeda || !localizacao || !nif || !telefone) {
    toastError('Preencha por favor todos os campos!')
    return;
  }

  if (selectedCliente === null && consumidorFinalException) {
    toastError('Selecione um cliente!')
    return;
  }

  if (
    (selectedCliente?.nif === null && consumidorFinalException) ||
    (selectedCliente?.nif === "" && consumidorFinalException) ||
    (selectedCliente?.nif === undefined && consumidorFinalException)
  ) {
    toastError("NIF do cliente é obrigatório!");
    return;
  }

  if (new Date(dataEmissao) > new Date()) {
    toastError("Data de emissão não pode ser futura!");
    return;
  }

  if (
    tipoDocumento === "Factura" &&
    new Date(dataValidade) < new Date(dataEmissao)
  ) {
    toastError("Data de validade não pode ser anterior à data de emissão!");
    return;
  }

  if (
    tipoDocumento === "Factura" &&
    dataValidade === ""
  ) {
    toastError("Data de validade é obrigatória para Factura!");
    return;
  }

  if (
    tipoDocumento === "Factura Recibo" &&
    payments.some((pagamento) => !pagamento.valor || pagamento.valor === "" || (pagamento.tipoPagamento != "Dinheiro" && (!pagamento.banco || pagamento.banco === "" || !pagamento.referencia || !pagamento.referencia)) )
  ) {
    toastError("Preencha todos os campos dos pagamentos!");
    return;
  }
  if (
    tipoDocumento === "Factura Recibo" && filteredPagamentos(payments)?.length == 0
  ) {
    toastError("Adicione pelo menos um pagamento válido para a factura recibo!");
    return;
  }

  if (selectedProdutos.length === 0) {
    toastError("Adicione pelo menos um produto!");
    return;
  }
if (
    totalValue("total") - totalPagamentoValue("valor") < 0 &&
    !bypassPagamento
  ) {
    setSuccessTitle("Valor recebido a mais");
    setSuccessContinue(true);

    setSuccessDescription(
      `O quantia recebida (${formatCurrency(totalPagamentoValue("valor"))}) excede os (${formatCurrency(totalValue("total"))}) da factura.`
    );

    setOpenPayment(true)

    return;
  }

  setLoad(true)
  const apiUrl = "/v1/facturas/store";
const totalPagar = totalValue("total");
    const totalImpostos = totalValue("taxaImposto");
    const totalDescontos = totalValue("descontoFinal");

    axios.post(apiUrl, {
      polo_id: polo?.id,
          cliente_id: selectedCliente?.id,
          tipoDocumento: tipoDocumento,
          dataEmissao: dataEmissao,
          dataValidade: dataValidade,
          obs: notas,
          moeda: moeda,
          totalPagar: totalPagar,
          totalImpostos: totalImpostos,
          totalDescontos: totalDescontos,
          produtos: selectedProdutos,
          pagamentos: [...payments],
    })
    .then((res) => {
      setLoad(false)
      setDone(true)
      setResponseDoc(res.data)
      toastSuccess("Documento criado com sucesso!")
    })
    .catch(err => {
      console.log('error', err?.response)
      setLoad(false)
      if (err?.response?.data?.erro) {
        toastError("Erro ao criar documento: " +
              JSON.stringify(err?.response?.data?.erro)
          )
      }else {
        toastError("Erro ao criar documento: " +
              JSON.stringify(err?.error?.message || err?.message)
          )
      }
    })
  
};
const saveDoc = () => {
  setSuccessContinue(false)
  if (
    reciboParam &&
    payments.some((pagamento) => !pagamento.valor || pagamento.valor === "" || (pagamento.tipoPagamento != "Dinheiro" && (!pagamento.banco || pagamento.banco === "" || !pagamento.referencia || !pagamento.referencia)) )
  ) {
    toastError("Preencha todos os campos dos pagamentos!");
    return;
  }
  if (
    reciboParam && filteredPagamentos(payments)?.length == 0
  ) {
    toastError("Adicione pelo menos um pagamento válido para a factura recibo!");
    return;
  }

  if (reciboParam && !byPassRecibo && (totalValue("total") - totalPagamentoValue("valor") < 0)) {
    setSuccessTitle("Valor recebido a mais")
    setSuccessDescription(
      `O quantia recebida (${formatCurrency(totalPagamentoValue("valor"))}) excede os (${formatCurrency(totalValue("total"))}) da factura.`
    );
    setOpenPayment(true)

    return;
  }

  setLoad(true)
  const apiUrl = (totalValue("total") - totalPagamentoValue("valor")) <= 0
        ? 
          "/v1/facturas/edit/" +
          factura?.id +
          "?recibo=adicionar"
        : "/v1/facturas/edit/" + factura?.id;
const totalPagar = totalValue("total");
    const totalImpostos = totalValue("taxaImposto");
    const totalDescontos = totalValue("descontoFinal");

    axios.post(apiUrl, {
      polo_id: polo?.id,
          cliente_id: selectedCliente?.id,
          tipoDocumento: tipoDocumento,
          dataEmissao: dataEmissao,
          dataValidade: dataValidade,
          obs: notas,
          moeda: moeda,
          totalPagar: totalPagar,
          totalImpostos: totalImpostos,
          totalDescontos: totalDescontos,
          produtos: selectedProdutos,
          pagamentos: [...payments],
    })
    .then((res) => {
      setLoad(false)
      setDone(true)
      setResponseDoc(res.data)
      sessionStorage.setItem("factura", JSON.stringify(res.data));

      toastSuccess("Documento editado com sucesso!")
    })
    .catch(err => {
      console.log('error', err)
      setLoad(false)
      toastError("Erro ao editar documento: " +
              JSON.stringify(err?.error?.message || err?.message)
          )
    })
}
const getTotalPages = () => {
    return Array(
      Math.ceil((
  done === true && responseDoc1?.nota && responseDoc1?.factura && load && Array.isArray(responseDoc?.produtos)
    ? responseDoc.produtos.concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos)
    : selectedProdutos
)?.length / itemsPerPage)
    ).fill("");
  }

  const getTotalPagesRecibos = () => {
    return Array(
      Math.ceil(
        filteredPagamentos(payments)?.length /
          itemsPerPage
      )
    ).fill("");
  }
  const getLastPageProductIndex = () => {
    const totalItems = (
  done === true && responseDoc1?.nota && responseDoc1?.factura && load && Array.isArray(responseDoc?.produtos)
    ? responseDoc.produtos.concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos)
    : selectedProdutos
)?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Items on the last page
    const lastPageItemCount = totalItems - (totalPages - 1) * itemsPerPage;

    // The index within 1-17 (or less if fewer items)
    const lastItemIndex = lastPageItemCount;
    return lastItemIndex;
  }
  const getLastPageProductIndexRecibos = () => {
    const totalItems = filteredPagamentos(payments)?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const lastPageItemCount = totalItems - (totalPages - 1) * itemsPerPage;

    const lastItemIndex = lastPageItemCount;
    return lastItemIndex;
  }
  const [tipoFolha, setTipoFolha] = useState("A4");
  const getPageBreakHeight = (index) => {
    if (index > 17 && (index - 17 + 1) % 31 === 0) {
      return '76px';
    }
    return '56px';
  };
  const getLastPageAdjustmentHeight = () => {
    const index = getLastPageProductIndex();
    if (index === 14) return '194px';
    if (index === 15) return '146px';
    if (index === 16) return '100px';
    return '0';
  };
    const groupProdutosByTaxa = () => {
    const groupedMap = new Map();

    (
  done === true && responseDoc1?.nota && responseDoc1?.factura && load && Array.isArray(responseDoc?.produtos)
    ? responseDoc.produtos.concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos).concat(responseDoc.produtos)
    : selectedProdutos
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
  const goBack = () => {
    window.history.back()
    alert('left')
  }
  const [notaCredito, setNotaCredito] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    setTipoFolha(currentUser?.tipoFolha || "A4");
        let factura = null;
    if (sessionStorage.getItem("factura")) {
      // Check for query params (React Router)
      const searchParams = new URLSearchParams(location.search);
      
      if (searchParams.get("recibo")) {
        setReciboParam(true);
        setTimeout(() => {
          // Scroll logic (you'll need to adapt this for React)
          // this.divs.forEach((div) => {
          //   if (
          //     div.nativeElement.textContent?.trim().toLowerCase() ===
          //     "pagamentos"
          //   ) {
          //     div.nativeElement.scrollIntoView({
          //       behavior: "smooth",
          //       block: "start",
          //     });
          //   }
          // });
        }, 1000);
      }

      if (searchParams.get("nota")) {
        setNotaParam(true);

      }
      factura = JSON.parse(sessionStorage.getItem("factura") || "{}");
      if (factura?.nota && factura?.factura){
        setResponseDoc1(factura)
                factura = factura?.nota
                setNotaParam(true);
        setDone(true);

      }
      setNotaCredito(factura?.notas_credito || null);
      if (factura?.factura_id) {
        setNotaParam(true);
        setDone(true);
      }
      setFactura(factura)
    }
    //if notaparam state is true

    
    if (factura){
      setResponseDoc(factura)
      console.trace('factura loaded', factura);
      const polo = JSON.parse(sessionStorage.getItem("polo") || "{}");
      setLocalizacao(polo?.localizacao || "")
      setDataEmissao(format(new Date(factura?.dataEmissao||null), "yyyy-MM-dd"))
      setDataValidade(format(new Date(factura?.dataValidade||null), "yyyy-MM-dd"))
      setTipoDocumento(factura?.tipoDocumento)
      setMoeda(factura?.moeda)
      setNotas(factura?.obs)

      const facturaProdutos = [...(factura?.produtos || [])].map((i, index) => {
        return {
          ...i,
          index: index + 1
        }
      })
      setSelectedProdutos(facturaProdutos.concat(facturaProdutos).concat(facturaProdutos).concat(facturaProdutos).concat(facturaProdutos));
      const facturaPagamentos = [...(factura?.pagamentos || [])].map(pagamento => ({
        banco: pagamento?.banco || "",
        tipoPagamento: pagamento?.tipoPagamento || "",
        valor: pagamento?.valor || 0,
        dataPagamento: pagamento?.valor?.length > 0 ||
                      pagamento?.tipoPagamento ||
                      pagamento?.referencia?.length > 0 ||
                      pagamento?.banco?.length > 0
          ? format(new Date(pagamento?.dataPagamento), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        referencia: pagamento?.referencia || "",
        disabled: pagamento?.valor?.length > 0 ||
                  pagamento?.tipoPagamento ||
                  pagamento?.referencia?.length > 0 ||
                  pagamento?.banco?.length > 0,
      }));
      setPayments(facturaPagamentos);


      
    }else {
      setSelectedProdutos(
            JSON.parse(localStorage.getItem("facturaProdutos") || "[]")?.map(
                (i, index) => {
                    return {
                        ...i,
                        index: index + 1,
                    };
                }
            )
        );
    }
    let factura1 = JSON.parse(sessionStorage.getItem("factura") || "{}");

    if (factura1?.nota && factura1?.factura){
        setSelectedProdutos(
            [...factura1?.factura?.produtos||[]]?.map(
                (i, index) => {
                    return {
                        ...i,
                        index: index + 1,
                    };
                }
            )
        );

    }

    if (factura?.factura_id >= 0) {
      console.trace('facturaaaaa', factura)
      setTipoNota(factura?.tipoDocumento)
      setDocumentoOrigem(factura?.factura?.numeroDocumento)
      setDataNota(format(new Date(factura?.dataEmissao), "yyyy-MM-dd"))
      setMotivo(factura?.obs || "")
      if (factura?.tipoDocumento != "Nota de crédito (anulação)"){
          setDataValidadeRetificacao(format(new Date(factura?.dataValidade), "yyyy-MM-dd"))
        }

        setDataEmissao(format(new Date(factura?.factura?.dataEmissao||null), "yyyy-MM-dd"))
      setDataValidade(format(new Date(factura?.factura?.dataValidade||null), "yyyy-MM-dd"))
      setTipoDocumento(factura?.factura?.tipoDocumento)
      setMoeda(factura?.factura?.moeda)
      setNotas(factura?.factura?.obs||"")
    }
    const searchParams = new URLSearchParams(location.search);

    if (searchParams.get('nota')) {
      setDocumentoOrigem(factura?.numeroDocumento)
    setDataNota(format(new Date(), 'yyyy-MM-dd'))

      if (factura?.factura_id >= 0) {
        setTipoNota(factura?.tipoDocumento)
        setDocumentoOrigem(factura?.factura?.numeroDocumento)
        setDataNota(format(new Date(factura?.dataEmissao), 'yyyy-MM-dd'))
        setMotivo(factura?.obs)
        if (factura?.tipoDocumento != "Nota de crédito (anulação)"){
          setDataValidadeRetificacao(format(new Date(factura?.dataValidade), "yyyy-MM-dd"))
        }

        
      }
    }
    
  }, [])
  const addNota = () => {
    // let value = this.facturaForm.value;
    // let value1 = this.notaForm.value;
    let apiUrl = "/v1/notasCredito/store";

    const totalPagar = totalValue("total");
    const totalImpostos = totalValue("taxaImposto");
    const totalDescontos = totalValue("descontoFinal");

    if (!motivo || !tipoNota ) {
      toastError('Preencha por favor todos os campos da nota!')
      return;
    }
    if (tipoNota != "Nota de crédito (anulação)" && (!motivo || !tipoNota || !dataValidadeRetificacao)){
      toastError('Preencha por favor todos os campos da nota1!')
      return;
    }

    if (tipoNota == "Nota de crédito (anulação)") {
      setLoad(true)

      axios.post(apiUrl,
          {
            factura_id: factura?.id,
            polo_id: polo?.id,
            cliente_id: selectedCliente?.id,
            tipoDocumento: tipoNota,
            dataEmissao: dataNota,
            dataValidade: dataValidade,
            obs: motivo,
            moeda: moeda,
            totalPagar: totalPagar,
            totalImpostos: totalImpostos,
            totalDescontos: totalDescontos,
            produtos: selectedProdutos,
            pagamentos: [...payments],
          })
        .then((res) => {
          console.trace('succcesfulllllllllllllllllll')
            setLoad(false);
            setDone(true);
            setResponseDoc(res.data)
            sessionStorage.setItem("factura", JSON.stringify(res.data));
            toastSuccess("Documento criado com sucesso!")
          })
        .catch((err) => {
            console.log("errrorrrrrr", err);
            setLoad(false);
           if (err?.response?.data?.erro) {
        toastError("Erro ao criar documento: " +
              JSON.stringify(err?.response?.data?.erro)
          )
      }else {
        toastError("Erro ao criar documento: " +
              JSON.stringify(err?.error?.message || err?.message)
          )
      }
        })
    } else {
      if (
        [...(factura?.produtos || [])].length ==
        selectedProdutos.length
      ) {
        toastError("Tens de adicionar pelo menos um novo produto!")
      } else {
        setLoad(true);
        apiUrl = "/v1/notasCredito/storeRetificacao";
        axios.post(apiUrl,
            {
              factura_id: factura?.id,
              factura: factura,
              polo_id: polo?.id,
              cliente_id: selectedCliente?.id,
              tipoDocumento: tipoNota,
              dataEmissao: dataNota,
              dataValidade: dataValidadeRetificacao,
              dataValidadeRetificacao: dataValidadeRetificacao,
              obs: motivo,
              moeda: moeda,
              totalPagar: totalPagar,
              totalImpostos: totalImpostos,
              totalDescontos: totalDescontos,
              produtos: selectedProdutos,
              pagamentos: [...payments],
            })
          .then((res) => {
              setLoad(false);
              setDone(true);
              setResponseDoc1(res.data);
              sessionStorage.setItem("factura", JSON.stringify(res.data));
              toastSuccess("Documentos criado com sucesso!")
            })
            .catch((err) => {
              console.log("errrorrrrrr", err);
              setLoad(false);
              if (err?.response?.data?.erro) {
        toastError("Erro ao criar documento: " +
              JSON.stringify(err?.response?.data?.erro)
          )
      }else {
        toastError("Erro ao criar documento: " +
              JSON.stringify(err?.error?.message || err?.message)
          )
      }
            })
      }
    }
  };
  useEffect(() => {

    const handleBeforeUnload = (e) => {
      alert('co')
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

  }, [responseDoc, responseDoc1])
//   useEffect(() => {
//     const patchHtml2CanvasColor = () => {
//   const w = window;

//   if (w.html2canvas?.Color?.parse) {
//     const originalParse = w.html2canvas.Color.parse;

//     w.html2canvas.Color.parse = function (color) {
//       if (typeof color === "string" && color.includes("oklch")) {
//         return originalParse("#000000"); // fallback
//       }
//       return originalParse(color);
//     };
//   }
// };

// // Call once (e.g. in useEffect or before export)
// patchHtml2CanvasColor();
//   }, [])
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
            <span className="value">{localizacao}</span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">NIF: </span>
            <span className="value">{nif}</span>
          </div>

          {website !== "" && (
            <div className="pdfHeaderRow">
              <span className="label">Website: </span>
              <span className="value">{website}</span>
            </div>
          )}

          <div className="pdfHeaderRow">
            <span className="label">Email: </span>
            <span className="value">{email}</span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">Tel: </span>
            <span className="value">{telefone}</span>
          </div>
        </div>

        {/* CLIENT INFO */}
        <div className="pdfClientInfo" style={{ flex: 1 }}>
          <div className="pdfHeaderRow">
            <span className="label">Cliente: </span>
            <span className="value">
              {selectedCliente?.nome || "Consumidor Final"}
            </span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">NIF: </span>
            <span className="value">
              {selectedCliente?.nif || "N/A"}
            </span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">Localização: </span>
            <span className="value">
              {selectedCliente?.localizacao || "N/A"}
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
                {(notaParam
                  ? tipoNota
                  : "Recibo") +
                  " Nº " +
                  (notaParam
                    ? responseDoc?.numeroDocumento
                    : responseDoc?.numeroRecibo)}
              </th>

              <th
                style={{
                  fontSize: "13px",
                  textAlign: "right",
                  fontWeight: 600,
                  borderTop: "none",
                }}
              >
                {replica}
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
                    !notaParam || notaParamBypass
                      ? responseDoc?.dataEmissaoRecibo
                      : responseDoc?.dataEmissao;

                  return date ? format(new Date(date), "dd-MM-yyyy") : "";
                })()}
              </td>

              <td>
                {selectedCliente?.nif || "Consumidor Final"}
              </td>

              <td>
                {notaParam
                  ? responseDoc?.numeroDocumento
                  : responseDoc?.numeroRecibo}
              </td>

              <td >
                {motivo ? responseDoc?.factura?.numeroDocumento : responseDoc?.numeroDocumento}
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
                    src={motivo ? responseDoc?.qr_code : responseDoc?.qr_code_recibo}
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
                  {tipoDocumento === "Factura Recibo" ||
                  tipoDocumento === "Factura" ||
                  tipoNota ==
                    "Nota de crédito (anulação)" || tipoNota.length >0 ? (
                    !notaParam || notaParamBypass ? (
                      <>
                        <div style={{ fontWeight: 800 }}>Obs:</div>
                          <div style={{ maxHeight: '25px' }}>
                            Através do(s) seguinte(s) meio(s) no valor total de {formatCurrency(totalPagamentoValue("valor"))}
                          </div>
                      </>
                    ) : (
                      <>
                        {motivo && (
                          <>
                            <div style={{ fontWeight: 800 }}>
                              Motivo de emissão:
                            </div>
                            <div style={{ maxHeight: "25px" }}>
                              {motivo}
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
                      <div style={{ maxHeight: "25px" }}>
                        Este documento não serve de factura.
                        <br />
                        {notas}
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
            <span className="value">{localizacao}</span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">NIF: </span>
            <span className="value">{nif}</span>
          </div>

          {website !== "" && (
            <div className="pdfHeaderRow">
              <span className="label">Website: </span>
              <span className="value">{website}</span>
            </div>
          )}

          <div className="pdfHeaderRow">
            <span className="label">Email: </span>
            <span className="value">{email}</span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">Tel: </span>
            <span className="value">{telefone}</span>
          </div>
        </div>

        {/* CLIENT INFO */}
        <div className="pdfClientInfo" style={{ flex: 1 }}>
          <div className="pdfHeaderRow">
            <span className="label">Cliente: </span>
            <span className="value">
              {selectedCliente?.nome || "Consumidor Final"}
            </span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">NIF: </span>
            <span className="value">
              {selectedCliente?.nif || "N/A"}
            </span>
          </div>

          <div className="pdfHeaderRow">
            <span className="label">Localização: </span>
            <span className="value">
              {selectedCliente?.localizacao || "N/A"}
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
                {tipoDocumento + " Nº " + responseDoc?.numeroDocumento}
              </th>

              <th
                style={{
                  fontSize: "13px",
                  textAlign: "right",
                  fontWeight: 600,
                  borderTop: "none",
                }}
              >
                {replica}
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
                {responseDoc?.dataEmissao
                  ? format(new Date(dataEmissao), "dd-MM-yyyy")
                  : ""}
              </td>

              <td>
                {tipoDocumento === "Factura Recibo"
                  ? "N/A"
                  : responseDoc?.dataValidade
                  ? format(new Date(responseDoc?.dataValidade), "dd/MM/yyyy")
                  : ""}
              </td>

              <td>{selectedCliente?.value?.nif || "N/A"}</td>

              <td>{responseDoc?.numeroDocumento}</td>

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
                    src={responseDoc?.qr_code}
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
                  {tipoDocumento === "Factura Recibo" ||
                  tipoDocumento === "Factura" ? (
                    <>
                      {(!notas || notas === "") && (
                        <>
                          <div style={{ opacity: 0, fontWeight: 800 }}>
                            something
                          </div>
                          <div style={{ opacity: 0 }}>something</div>
                        </>
                      )}

                      {notas && notas !== "" && (
                        <>
                          <div style={{ fontWeight: 800 }}>Obs:</div>
                          <div style={{ maxHeight: "25px" }}>{notas}</div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 800 }}>Obs:</div>
                      <div style={{ maxHeight: "25px" }}>
                        Este documento não serve de factura.
                        <br />
                        {notas}
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


    return (
        <>
        <div className="dashboardContainer" style={{ background: "white" }}>
            <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
                                
                                <AlertDialogContent style={{flexDirection: 'column', display: 'flex', alignItems: 'center', textAlign: 'center'}}>
                                    <span>
                                        <AlertDialogTitle style={{alignSelf: 'center', textAlign: 'center', fontSize: 25}}>
                                            Apagar item
                                        </AlertDialogTitle>
                                        <AlertDialogDescription style={{fontSize: 15}}>
                                            Deseja mesmo eliminar este item?
                                        </AlertDialogDescription>
                                    </span>
                                    <span style={{alignSelf: 'center', marginTop: 15, display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', }}>
                                    <AlertDialogCancel style={{margin: 0, outline: 'none', borderRadius: 5}}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction style={{margin: 0, borderRadius: 5}} onClick={() => {
                                       setSelectedProdutos((prev) => prev.filter((item) => item?.produto?.id != produto?.produto?.id));
                                        
                                        localStorage.setItem("facturaProdutos", JSON.stringify(selectedProdutos.filter((item) => item?.produto?.id != produto?.produto?.id)));
                                        setRemoveOpen(false);
                                        setProduto(null);
                                        toastSuccess('Item removido com sucesso!')
                                    }}>Confirmar</AlertDialogAction>
                                    </span>
                                    
                                </AlertDialogContent>
                            </AlertDialog>
            <Loading1 loading={load || loadingClientes} />
            <div className="breadCrumb" style={{ background: "white" }}>
                <div className="title">
                    {notaParam
                        ? factura?.factura_id
                            ? "nota de crédito"
                            : "adicionar nota de crédito"
                        : factura
                        ? "VER Detalhes"
                        : "Documentos"}
                </div>
                <div className="dashboardContent">
                    Facturas <div>{">"}</div> <span>Novo</span>
                </div>
            </div>

            <div
                className="invoiceContainer"
                style={{ border: "1px solid #eeeeee" }}
            >
                {/* EXISTING CREDIT NOTES */}
                {factura?.notas_credito?.[0]?.id && (
                    <div
                        style={{
                            width: "max-content",
                            background: "rgba(255,126,126,0.096)",
                            marginBlock: 20,
                            borderRadius: 3,
                            borderLeft: "5px solid red",
                            display: "flex",
                            alignItems: "flex-start",
                            padding: "10px 20px 10px 10px",
                        }}
                    >
                        <i
                            className="ri-file-list-3-line fs-22"
                            style={{
                                color: "red",
                                paddingRight: 5,
                                paddingTop: 5,
                            }}
                        />
                        <span style={{ fontSize: 13, paddingBlock: 10 }}>
                            Esse documento tem a(s) seguinte(s) nota(s) de
                            crédito:
                            <ul>
                                {factura?.notas_credito?.map((n, i) => (
                                    <li key={i} style={{ fontWeight: 700 }}>
                                        {n?.tipoDocumento}
                                    </li>
                                ))}
                            </ul>
                        </span>
                    </div>
                )}

                {/* CREDIT NOTE INFO */}
                {notaParam && (
                    <>
                        <div className="companyTitle">
                            Informação da nota de crédito
                        </div>

                        <div className="row">
                            <div className="col">
                                <label className="form-label">
                                    Tipo de nota{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </label>

                                <select
                                    className="form-control"
                                    value={tipoNota}
                                    disabled={!!factura?.factura_id || done}
                                    onChange={(e) =>
                                        setTipoNota(e.target.value)
                                    }
                                    style={
                                        (factura?.factura_id || done)
                                            ? {
                                                  cursor: "not-allowed",
                                                  pointerEvents: "none",
                                              }
                                            : {}
                                    }
                                >
                                    <option value="" disabled>
                                        Seleccione um tipo de nota de crédito...
                                    </option>
                                    <option value="Nota de crédito (anulação)">
                                        Nota de crédito (anulação)
                                    </option>
                                    <option value="Nota de crédito (retificação)">
                                        Nota de crédito (retificação)
                                    </option>
                                </select>
                            </div>

                            <div className="col">
                                <label className="form-label">
                                    Documento de origem{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </label>

                                <input
                                    className={`form-control ${
                                        factura ? "bg-light" : ""
                                    }`}
                                    value={documentoOrigem}
                                    readOnly={!!factura || done}
                                    style={
                                        (factura || done) ? { cursor: "not-allowed" } : {}
                                    }
                                    onChange={(e) =>
                                        setDocumentoOrigem(e.target.value)
                                    }
                                />
                            </div>

                            <div className="col">
                                <label className="form-label">
                                    Data da nota de crédito{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </label>

                                <input
                                type="date"
                                className={`form-control ${
                                                true
                                                    ? "bg-light"
                                                    : ""
                                            }`}
                                    value={dataNota}
                                    readOnly
                                    disabled
                                    style={{ cursor: "not-allowed" }}
                                />
                            </div>
                        </div>

                        {factura?.tipoDocumento !== "Factura Recibo" &&
                            tipoNota === "Nota de crédito (retificação)" && (
                                <div className="row">
                                    <div
                                        className="col"
                                        style={
                                            (factura?.factura_id || done)
                                                ? {
                                                      cursor: "not-allowed",
                                                      pointerEvents: "none",
                                                  }
                                                : {}
                                        }
                                    >
                                        <label className="form-label">
                                            Data de validade da nova factura{" "}
                                            <span style={{ color: "red" }}>
                                                *
                                            </span>
                                        </label>

                                        
                                        <input
                                        type="date"
                                            className={`form-control ${
                                                (factura?.factura_id  || done)
                                                    ? "bg-light"
                                                    : ""
                                            }`}
                                            value={dataValidadeRetificacao}
                                            readOnly={!!factura?.factura_id || done}
                                            onChange={(e) =>
                                                setDataValidadeRetificacao(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                        <div className="row">
                            <div className="col">
                                <label className="form-label">
                                    Motivo de emissão{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </label>

                                <textarea
                                    className="form-control alert alert-info"
                                    rows={5}
                                    
                                    value={motivo}
                                    placeholder={
                                        tipoNota !==
                                        "Nota de crédito (retificação)"
                                            ? "Motivo de emissão..."
                                            : "Ex: Devolução de produtos, troca de produtos, correção de erros, etc..."
                                    }
                                    disabled={!!factura?.factura_id || done}
                                    style={
                                        (factura?.factura_id || done)
                                            ? {
                                                  cursor: "not-allowed",
                                                  pointerEvents: "none",
                                                  fontSize: 14
                                              }
                                            : { fontSize: 14}
                                    }
                                    onChange={(e) => setMotivo(e.target.value)}
                                />
                            </div>
                        </div>

                        <hr className="divider" />
                        <div className="companyTitle">
                            Detalhes do documento Origem
                        </div>
                    </>
                )}

                <img
                    src={
                        empresaImage ||
                        "https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1770854400&v=beta&t=GM8FbM7oioz63kgp7-nf2uBSuMikuHzW1A1jyr1Ecmo"
                    }
                    className="logo"
                    alt=""
                />
                <hr class="divider" />
                {/* COMPANY NAME */}
                <div className="companyTitle">{empresa?.nome_empresa}</div>

                <div className="headerInfo">
                    {/* LEFT SIDE */}
                    <section className="left">
                        <div className="row">
                            <div className="col">
                                <label className="form-label">
                                    Localização{" "}
                                    <span
                                        style={{ color: "red", fontSize: 16 }}
                                    >
                                        *
                                    </span>
                                </label>
                                <input
                                    className={`form-control form-control-sm ${
                                        factura ? "bg-light" : ""
                                    }`}
                                    value={localizacao}
                                    placeholder="Localização da empresa..."
                                    readOnly={!!factura}
                                    style={
                                        factura ? { cursor: "not-allowed" } : {}
                                    }
                                    onChange={(e) =>
                                        setLocalizacao(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <label className="form-label">
                                    NIF{" "}
                                    <span
                                        style={{ color: "red", fontSize: 16 }}
                                    >
                                        *
                                    </span>
                                </label>
                                <input
                                    className="form-control form-control-sm bg-light"
                                    value={nif}
                                    readOnly
                                    placeholder="Ex: 50007471..."
                                />
                            </div>

                            <div className="col">
                                <label className="form-label">
                                    Website (opcional)
                                </label>
                                <input
                                    className={`form-control form-control-sm ${
                                        factura ? "bg-light" : ""
                                    }`}
                                    value={website}
                                    placeholder="algo@site.com..."
                                    readOnly={!!factura}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <label className="form-label">
                                    Telefone{" "}
                                    <span
                                        style={{ color: "red", fontSize: 16 }}
                                    >
                                        *
                                    </span>
                                </label>
                                <input
                                    className={`form-control form-control-sm ${
                                        factura ? "bg-light" : ""
                                    }`}
                                    type="number"
                                    value={telefone}
                                    placeholder="945648049..."
                                    readOnly={!!factura}
                                    onChange={(e) =>
                                        setTelefone(e.target.value)
                                    }
                                />
                            </div>

                            <div className="col">
                                <label className="form-label">Email</label>
                                <input
                                    className={`form-control form-control-sm ${
                                        factura ? "bg-light" : ""
                                    }`}
                                    value={email}
                                    placeholder="levelsoft@gmail.com..."
                                    readOnly={!!factura}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* RIGHT SIDE */}
                    <section className="right">
                        <div className="row">
                            <div className="col1">
                                {!loadingClientes ? (
                                    <select
                                        className="form-control form-control-sm"
                                        value={selectedCliente?.id || ""}
                                        disabled={!!factura}
                                        onChange={(e) =>
                                        {
                                            setSelectedCliente(clientes.find((c) => c.id == e.target.value))
                                        }
                                        }
                                        style={
                                            factura
                                                ? {
                                                      cursor: "not-allowed",
                                                      pointerEvents: "none",
                                                  }
                                                : {}
                                        }
                                    >
                                        
                                        {clientes.map((cliente) => (
                                            <option
                                                key={cliente.id}
                                                value={cliente.id}
                                            >
                                                {cliente.nome || "Vazio"}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                        style={{
                                            marginLeft: "auto",
                                            marginTop: 20,
                                            float: "right",
                                        }}
                                    >
                                        <span className="sr-only">
                                            Loading...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col1">
                                <input
                                    className="form-control form-control-sm bg-light border-0"
                                    value={selectedCliente?.nif || ""}
                                    placeholder="NIF: 000000"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col1">
                                <input
                                    className="form-control form-control-sm bg-light border-0"
                                    value={selectedCliente?.localizacao || ""}
                                    placeholder="Localização..."
                                    readOnly
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <hr className="divider" />
                <div className="row" style={{ gap: "15px" }}>
                    {/* TIPO DE DOCUMENTO */}
                    <div className="col1">
                        <label className="form-label">
                            Tipo de documento
                            <span style={{ color: "red", fontSize: 16 }}>
                                *
                            </span>
                        </label>

                        <select
                            className={`form-control ${
                                factura ? "bg-light" : ""
                            }`}
                            value={tipoDocumento}
                            disabled={factura}
                            style={
                                factura
                                    ? {
                                          cursor: "not-allowed",
                                          pointerEvents: "none",
                                      }
                                    : {}
                            }
                            onChange={(e) => setTipoDocumento(e.target.value)}
                        >
                            <option value="">
                                Seleccione um tipo de documento
                            </option>

                            {Object.entries(tiposDocumentosGrouped).map(
                                ([grupo, items]) => (
                                    <optgroup
                                        key={grupo}
                                        label={grupo}
                                        style={{
                                            color: "grey",
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {items.map((item) => (
                                            <option
                                                key={item.name}
                                                value={item.name}
                                                style={{
                                                    fontSize: 14,
                                                    color: "black",
                                                    paddingBlock: 3,
                                                }}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )
                            )}
                        </select>
                    </div>

                    {/* MOEDA */}
                    <div className="col1">
                        <label className="form-label">
                            Moeda{" "}
                            <span style={{ color: "red", fontSize: 16 }}>
                                *
                            </span>
                        </label>

                        <select
                            className={`form-control ${
                                factura ? "bg-light" : ""
                            }`}
                            value={moeda}
                            disabled={factura}
                            onChange={(e) => setMoeda(e.target.value)}
                        >
                            <option value="AOA">AO (KZ)</option>
                        </select>
                    </div>

                    {/* DATA DE EMISSÃO */}
                    <div
                        className="col1"
                        style={{ cursor: "not-allowed", pointerEvents: "none" }}
                    >
                        <label className="form-label">
                            Data de emissão
                            <span style={{ color: "red", fontSize: 16 }}>
                                *
                            </span>
                        </label>

                        <input
                            type="date"
                            className="form-control bg-light"
                            value={dataEmissao}
                            readOnly
                            disabled
                        />
                    </div>

                    {/* DATA DE VALIDADE (only if NOT Factura Recibo) */}
                    {tipoDocumento !== "Factura Recibo" && (
                        <div
                            className="col1"
                            style={
                                factura
                                    ? {
                                          cursor: "not-allowed",
                                          pointerEvents: "none",
                                      }
                                    : {}
                            }
                        >
                            <label className="form-label">
                                Data de Validade
                                <span style={{ color: "red", fontSize: 16 }}>
                                    *
                                </span>
                            </label>

                            <input
                                type="date"
                                className={`form-control ${
                                    factura ? "bg-light" : ""
                                }`}
                                value={dataValidade}
                                readOnly={factura}
                                disabled={factura}
                                onChange={(e) =>
                                    setDataValidade(e.target.value)
                                }
                            />
                        </div>
                    )}
                </div>

                <div
                    className="table-responsive"
                    style={{
                        height: "auto",
                        paddingBottom: "80px",
                        overflowY: "hidden",
                        marginTop: "15px",
                    }}
                >
                    <table
                        className="table table-gridjs"
                        style={{ backgroundColor: "white" }}
                    >
                        <thead style={{ background: "#f3f6f9" }}>
                            <tr style={{ background: "#f3f6f9" }}>
                                <th
                                    style={{
                                        maxWidth: 20,
                                        width: 20,
                                        background: "#f3f6f9",
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    #
                                </th>
                                <th
                                    style={{
                                        background: "#f3f6f9",
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    Designação
                                </th>
                                <th
                                    style={{
                                        background: "#f3f6f9",
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    Qtd.
                                </th>
                                <th
                                    style={{
                                        background: "#f3f6f9",
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    P. Unitário
                                </th>
                                <th
                                    style={{
                                        background: "#f3f6f9",
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    Desc.
                                </th>
                                <th
                                    style={{
                                        background: "#f3f6f9",
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    Taxa
                                </th>
                                <th
                                    style={{
                                        background: "#f3f6f9",
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    Total
                                </th>
                                <th
                                    style={{
                                        backgroundColor: "#dff5fa",
                                        maxWidth: 100,
                                        width: 100,
                                        fontWeight: "400",
                                        fontSize: 15,
                                    }}
                                >
                                    Acções
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {selectedProdutos.length > 0 ? (
                                selectedProdutos.map((data, index) => (
                                    <tr key={index}>
                                        <td >{index + 1}</td>

                                        <td
                                            title={data?.produto?.designacao}
                                            
                                        >
                                            <div style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 1,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                WebkitBoxOrient: "vertical",
                                            }}>{data?.produto?.designacao}</div>
                                        </td>

                                        <td>{data?.quantidade}</td>

                                        <td>
                                            {Number(
                                                data?.preco || 0
                                            ).toLocaleString()}
                                        </td>

                                        <td>
                                            {Number(
                                                data?.descontoFinal || 0
                                            ).toLocaleString()}
                                            {data?.descontoPercentual
                                                ? ` (${data.descontoPercentual}%)`
                                                : ""}
                                        </td>

                                        <td>
                                            {Number(
                                                data?.taxaImposto || 0
                                            ).toLocaleString()}{" "}
                                            ({extractPercentage(data)}%)
                                        </td>

                                        <td>
                                            {Number(
                                                data?.total || 0
                                            ).toLocaleString()}
                                        </td>

                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                maxWidth: 100,
                                                width: 100,
                                                height: 50,
                                                padding: 0,
                                                backgroundColor: "#dff5fa",
                                                ...((factura &&
                                                insideFactura(data) || done)
                                                    ? {
                                                          cursor: "not-allowed",
                                                          pointerEvents: "none",
                                                          opacity: 0.5,
                                                      }
                                                    : {}),
                                            }}
                                        >
                                            <div
                                                className="delete"
                                                onClick={() => openRemove(data)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg>
                                            </div>

                                            <div
                                                className="edit"
                                                onClick={() => openEdit(data)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        <div
                                            style={{
                                                marginTop: 15,
                                                marginInline: 15,
                                            }}
                                        >
                                            Nenhum produto adicionado ainda.
                                            Adicione um.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {(!factura ||
                        tipoNota === "Nota de crédito (retificação)") && !done && (
                        <button
                            className="btn btn-primary btn-label"
                            style={{ fontSize: 14, borderRadius: 4 }}
                            onClick={() => {
                                openModal();
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Adicionar artigo
                        </button>
                    )}
                </div>

                <div className="bottom" style={{}}>
                    {/* NOTAS */}
                    <textarea
                        className="form-control alert alert-info"
                        id="exampleFormControlTextarea1"
                        placeholder="Notas..."
                        rows={5}
                        
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        disabled={!!factura}
                        style={
                            factura
                                ? {
                                      cursor: "not-allowed",
                                      pointerEvents: "none", height: "100%", margin: 0, zIndex: 0, fontSize: 14
                                  }
                                : {height: "100%", margin: 0, zIndex: 0, fontSize: 14}
                        }
                    />

                    {/* TOTALS */}
                    <div className="totals">
                        <div className="totalRow">
                            <span className="label">Total Ilíquido:</span>
                            <span className="value">
                                {formatCurrency(
                                    totalValue("total") +
                                        totalValue("descontoFinal") -
                                        totalValue("taxaImposto")
                                )}
                            </span>
                        </div>

                        <div className="totalRow">
                            <span className="label">Total de Descontos:</span>
                            <span className="value">
                                {formatCurrency(totalValue("descontoFinal"))}
                            </span>
                        </div>

                        <div className="totalRow">
                            <span className="label">Total de Impostos:</span>
                            <span className="value">
                                {formatCurrency(totalValue("taxaImposto"))}
                            </span>
                        </div>

                        <div className="totalRow1">
                            <span className="label1">Total a Pagar:</span>
                            <span className="value">
                                {formatCurrency(totalValue("total"))}
                            </span>
                        </div>
                    </div>
                </div>

                {(tipoDocumento === "Factura Recibo" ||
                    reciboParam ||
                    filteredPagamentos(payments)?.length > 0) && (
                    <>
                        <hr className="divider" />

                        <div
                            style={{
                                width: "100%",
                                height: "5px",
                                transform: "translateY(-18px)",
                                backgroundColor: creditColor,
                            }}
                        />

                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                marginBottom: -10,
                            }}
                        >
                            Pagamentos
                            <br />
                            <span
                                style={{
                                    color: "grey",
                                    fontSize: 15,
                                    fontWeight: 400,
                                }}
                            >
                                Total pago:{" "}
                                {formatCurrency(totalPagamentoValue("valor"))}
                                <br />
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color: creditColor,
                                    }}
                                >
                                    Crédito sobrando:{" "}
                                    {formatCurrency(remaining)}
                                </span>
                            </span>
                        </div>

                        <div className="payments">
                            {payments.map((item, i) => (
                                <div key={i} className="group">
                                    {/* Tipo de pagamento */}
                                    <div className="col">
                                        <label className="form-label">
                                            Tipo de pagamento
                                        </label>
                                        <select
                                            className="form-select bg-light mb-3"
                                            value={item.tipoPagamento}
                                            disabled={item.disabled}
                                            onChange={(e) =>
                                                updatePayment(
                                                    i,
                                                    "tipoPagamento",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="" disabled>
                                                Selecione um tipo de
                                                pagamento...
                                            </option>
                                            <option value="Transferência">
                                                Transferência
                                            </option>
                                            <option value="TPA">TPA</option>
                                            <option value="Depósito">
                                                Depósito
                                            </option>
                                            <option value="Dinheiro">
                                                Dinheiro
                                            </option>
                                        </select>
                                    </div>

                                    {/* Banco */}
                                    {item.tipoPagamento !== "Dinheiro" && (
                                        <div className="col">
                                            <label className="form-label">
                                                Banco
                                            </label>
                                            <select
                                                className="form-select bg-light mb-3"
                                                value={item.banco}
                                                disabled={item.disabled}
                                                onChange={(e) =>
                                                    updatePayment(
                                                        i,
                                                        "banco",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="" disabled>
                                                    Selecione um banco...
                                                </option>
                                                <option value="Keve">
                                                    Keve
                                                </option>
                                                <option value="BAI">BAI</option>
                                                <option value="BCI">BCI</option>
                                                <option value="BFA">BFA</option>
                                                <option value="BIC">BIC</option>
                                                <option value="BPC">BPC</option>
                                                <option value="Banco Sol">
                                                    Banco Sol
                                                </option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Valor */}
                                    <div className="col">
                                        <label className="form-label">
                                            Valor
                                        </label>
                                        <input
                                            style={{
                                                border: "none !important",
                                            }}
                                            type="number"
                                            className="form-control bg-light mb-3"
                                            placeholder="Valor do pagamento..."
                                            value={item.valor}
                                            readOnly={item.disabled}
                                            onChange={(e) =>
                                                updatePayment(
                                                    i,
                                                    "valor",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Data */}
                                    <div className="col">
                                        <label className="form-label">
                                            Data
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control bg-light mb-3"
                                            value={item.dataPagamento}
                                            max={today}
                                            readOnly={item.disabled}
                                            onChange={(e) =>
                                                updatePayment(
                                                    i,
                                                    "dataPagamento",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Referência */}
                                    {item.tipoPagamento !== "Dinheiro" && (
                                        <div className="col">
                                            <label className="form-label">
                                                Referência
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control bg-light mb-3"
                                                placeholder="Referência do pagamento..."
                                                value={item.referencia}
                                                readOnly={item.disabled}
                                                onChange={(e) =>
                                                    updatePayment(
                                                        i,
                                                        "referencia",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div
                                        className="col"
                                        style={{ display: "flex" }}
                                    >
                                        <div
                                            className="paymentTitle"
                                            style={{ flex: 1, fontWeight: 500 }}
                                        >
                                            Pagamento {i + 1}
                                        </div>
                                        <button
                                            style={{ width: 40, height: 40, paddingRight: 0 }}
                                            type="button"
                                            className="btn btn-danger"
                                            disabled={item.disabled || i === 0}
                                            onClick={() => removePayment(i)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                class="bi bi-trash"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                            </svg>{" "}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {(
  tipoDocumento === "Factura" &&
  filteredPagamentos(payments).length > 0 &&
  (totalValue("total") - totalPagamentoValue("valor")) !== 0
) && (
  <div style={{ marginTop: 20 }}>
    <span style={{ fontWeight: 700 }}>Enquanto</span> o valor pago for inferior ou
    superior ao valor a pagar da factura,{" "}
    <span style={{ fontWeight: 700 }}>
      não poderás emitir recibos
    </span>.
  </div>
)}

{/* before */}

<div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 50,
    gap: 20,
  }}
>
  {/* LOADING */}
  {load && (
    <div
      className="spinner-border text-primary"
      role="status"
      style={{
        marginLeft: "auto",
        alignSelf: "flex-end",
        marginTop: 20,
        float: "right",
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )}

  {/* FACTURA VIEW / DONE */}
  {!load &&
    ((factura && !reciboParam && !notaParam) || done) && (
      <>
        {/* <button
          className="btn btn-link link-danger text-decoration-none fw-medium"
          onClick={goBack}
        >
          <i className="ri-arrow-left-line me-1 align-middle"></i>
          Voltar
        </button> */}

        {/* EXPORTAR RECIBO */}
        {tipoDocumento === "Factura" && !notaParam &&
          filteredPagamentos(payments).length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="btn btn-outline-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor:
                      totalValue("total") -
                        totalPagamentoValue("valor") <=
                      0
                        ? "unset"
                        : "not-allowed",
                  }}
                  disabled={
                    totalValue("total") -
                      totalPagamentoValue("valor") >
                    0
                  }
                >
                  <i
                    className="ri-settings-4-line"
                    style={{ marginRight: 5 }}
                  ></i>
                  Exportar Recibo
                </button>
              </PopoverTrigger>

              <PopoverContent className="tableOptions">
                {!done ? (
                  <div
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => {
                      setReplica("Segunda Via");
                      downloadDoc(3, "recibo");
                    }}
                  >
                    Segunda Via
                  </div>
                ) : (
                  <>
                    <div
                      className="dropdown-item d-flex align-items-center"
                      onClick={() =>
                        downloadMultipleDocs(2, "recibo")
                      }
                    >
                      Duplicado
                    </div>
                    <div
                      className="dropdown-item d-flex align-items-center"
                      onClick={() =>
                        downloadMultipleDocs(3, "recibo")
                      }
                    >
                      Triplicado
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          )}

        {/* EXPORTAR FACTURA */}
        {!notaParam && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="btn btn-outline-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <i
                  className="ri-settings-4-line"
                  style={{ marginRight: 5 }}
                ></i>
                Exportar Factura
              </button>
            </PopoverTrigger>

            <PopoverContent className="tableOptions">
              {factura ? (
                <div
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => {
                    setReplica("Segunda Via");
                    downloadDoc(3);
                  }}
                >
                  Segunda Via
                </div>
              ) : (
                <>
                  <div
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => downloadMultipleDocs(2)}
                  >
                    Duplicado
                  </div>
                  <div
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => downloadMultipleDocs(3)}
                  >
                    Triplicado
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* EXPORTAR NOTA DE CRÉDITO */}
        {notaParam && done && (
          <Popover>
            <PopoverTrigger>
              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  tipoNota === "Nota de crédito (retificação)" &&
                  !factura?.factura_id &&
                  setResponseDocFun("nota")
                }
              >
                <i className="ri-settings-4-line me-1"></i>
                Exportar Nota de Crédito
              </button>
            </PopoverTrigger>

            <PopoverContent className="tableOptions">
              {factura?.factura_id ? (
                <div
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => {
                    setReplica("Segunda Via");
                    downloadDoc(3);
                  }}
                >
                  Segunda Via
                </div>
              ) : (
                <>
                  <div
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => downloadMultipleDocs(2)}
                  >
                    Duplicado
                  </div>
                  <div
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => downloadMultipleDocs(3)}
                  >
                    Triplicado
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* EXPORTAR NOVA FACTURA */}
        {notaParam &&
          done &&
          tipoNota ===
            "Nota de crédito (retificação)" &&
          (!factura?.factura_id || (responseDoc1?.nota && responseDoc1?.factura)) && (
            <Popover>
              <PopoverTrigger>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setResponseDocFun("factura")}
                >
                  <i className="ri-settings-4-line me-1"></i>
                  Exportar Nova Factura
                </button>
              </PopoverTrigger>

              <PopoverContent className="tableOptions">
                <div
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => downloadMultipleDocs(2)}
                >
                  Duplicado
                </div>
                <div
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => downloadMultipleDocs(3)}
                >
                  Triplicado
                </div>
              </PopoverContent>
            </Popover>
          )}
      </>
    )}


  {/* CREATE DOCUMENT */}
  {!load &&
    !factura && !done && (
      <>
        {tipoDocumento === "Factura Recibo" && (
          
          <button
                            className="btn btn-primary btn-label"
                            style={{ fontSize: 14, borderRadius: 4 }}
                            
            onClick={addPayment}

                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Adicionar pagamento
                        </button>
        )}

        <button
                            className="btn btn-success btn-label"
                            style={{ fontSize: 14, borderRadius: 4 }}
                            disabled={
            tipoDocumento === "Factura Recibo" &&
            totalValue("total") -
              totalPagamentoValue("valor") >=
              0
          }
                            onClick={createDoc}

                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Criar Documento
                        </button>
      </>
    )}

    {!load &&
    factura && !done && reciboParam && (
      <>
        {reciboParam && (
          
          <button
                            className="btn btn-primary btn-label"
                            style={{ fontSize: 14, borderRadius: 4 }}
                            
            onClick={addPayment}

                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Adicionar pagamento
                        </button>
        )}

        <button
                            className="btn btn-success btn-label"
                            style={{ fontSize: 14, borderRadius: 4 }}
                            disabled={
            totalValue("total") -
              totalPagamentoValue("valor") >=
              0
          }
                            onClick={saveDoc}

                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Salvar Documento
                        </button>
      </>
    )}
    {/*  */}
    {!load &&
    factura && notaParam && !done && (
      <>
        {notaParam && <button
                            className="btn btn-success btn-label"
                            style={{ fontSize: 14, borderRadius: 4 }}
                            
                            onClick={addNota}

                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Submeter Nota
                        </button>}
      </>
    )}
</div>

{/* after */}
            </div>
            <Dialog
                open={open}
                onOpenChange={(e) => {
                    setOpen(e);
                }}
                style={{ zIndex: '9 !important' }}
            >
                <DialogContent
                    style={{ maxWidth: 1000, width: "100%", zIndex: '9 !important' }}
                    className="max-w-6xl p-0 overflow-hidden"
                >
                    <div className="flex min-h-[93vh]">
                        {/* LEFT */}
                        <div className="w-1/2 flex items-center justify-center bg-white">
                            {selProductImage && (
                                <img
                                    src={selProductImage}
                                    alt="Produto"
                                    className="max-h-[400px] object-contain rounded-md"
                                />
                            )}
                        </div>

                        {/* RIGHT */}
                        <div className="w-1/2 bg-gray-100 p-6 relative">
                            <DialogClose className="absolute right-4 top-4" />

                            <DialogHeader>
                                <DialogTitle
                                    className="text-2xl font-bold"
                                    style={{
                                        textAlign: "left",
                                        paddingTop: 20,
                                    }}
                                >
                                    {produto
                                        ? "Editar"
                                        : "Seleccionar"}{" "}
                                    Produto
                                </DialogTitle>
                            </DialogHeader>

                            {/* Produto */}
                            <div className="mb-4">
                                <label
                                    className="text-muted"
                                    style={{ marginBottom: 10 }}
                                >
                                    Seleccione um produto
                                </label>

                                {produto ? (
                                    <input
                                        className="form-control bg-light"
                                        value={produto?.produto?.designacao || ""}
                                        readOnly
                                    />
                                ) : (
                                    <select
                                        className="form-control"
                                        onChange={(e) =>
                                            handleProdutoChange(
                                                produtos.find(
                                                    (p) =>
                                                        p.id == e.target.value
                                                )
                                            )
                                        }
                                    >
                                        <option value="">Seleccione...</option>
                                        {produtos.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.designacao}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Quantidade */}
                            <div className="mb-4">
                                <label
                                    className="text-muted"
                                    style={{ marginBottom: 10 }}
                                >
                                    Quantidade
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div
                                        className="form-control "
                                        style={{
                                            width: 150,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: 5,
                                        }}
                                    >
                                        <button
                                            className="minus"
                                            onClick={decrementQuantidade}
                                        >
                                            –
                                        </button>
                                        <input
                                            type="number"
                                            className="product-quantity"
                                            value={produtoForm.quantidade}
                                            readOnly
                                            style={{
                                                border: "none",
                                                outline: "none",
                                                width: 40,
                                                textAlign: "center",
                                            }}
                                        />
                                        <button
                                            className="plus"
                                            onClick={incrementQuantidade}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-2xl font-bold ml-4">
                                        {formatCurrency(
                                            produtoForm.quantidade *
                                                produtoForm.preco
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Preço */}
                            <label
                                className="text-muted"
                                style={{ marginBottom: 10 }}
                            >
                                Preço
                            </label>

                            <input
                                className="form-control bg-light mb-3"
                                type="text"
                                value={formatCurrency(produtoForm.preco)}
                                readOnly
                            />

                            {/* Taxa */}
                            <label
                                className="text-muted"
                                style={{ marginBottom: 10 }}
                            >
                                Taxa de Imposto
                            </label>

                            <input
                                className="form-control bg-light mb-3"
                                placeholder="Valor Imposto..."
                                value={produtoForm.taxaImpostoText}
                                readOnly
                            />

                            {/* Categoria */}
                            <label
                                className="text-muted"
                                style={{ marginBottom: 10 }}
                            >
                                Categoria
                            </label>

                            <input
                                className="form-control bg-light mb-3"
                                placeholder="Categoria..."
                                value={produtoForm.categoriaProduto}
                                readOnly
                            />

                            {/* Descontos */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* DESCONTO % */}
                                <div>
                                    <label className="text-muted mb-2 block">
                                        Desconto (%)
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="Desconto (%)"
                                        className={`form-control ${
                                            disablePercentual ? "bg-light" : ""
                                        }`}
                                        value={
                                            produtoForm.descontoPercentual ?? ""
                                        }
                                        min={0}
                                        max={100}
                                        onFocus={() => {
                                            setDisableFixo(true);
                                            setDisablePercentual(false);

                                            setProdutoForm((p) => ({
                                                ...p,
                                                descontoFixo: null,
                                            }));
                                        }}
                                        onBlur={() => {
                                            setDisablePercentual(false);
                                            setDisableFixo(false);
                                        }}
                                        onChange={(e) =>
                                            setProdutoForm((p) => ({
                                                ...p,
                                                descontoPercentual:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* DESCONTO FIXO */}
                                <div>
                                    <label className="text-muted mb-2 block">
                                        Desconto fixo
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="Desconto fixo"
                                        className={`form-control ${
                                            disableFixo ? "bg-light" : ""
                                        }`}
                                        value={produtoForm.descontoFixo ?? ""}
                                        min={0}
                                        onClick={() => {
                                            setDisablePercentual(true);
                                            setDisableFixo(false);

                                            setProdutoForm((p) => ({
                                                ...p,
                                                descontoPercentual: null,
                                            }));
                                        }}
                                        onFocus={() => {
                                            setDisablePercentual(true);
                                            setDisableFixo(false);

                                            setProdutoForm((p) => ({
                                                ...p,
                                                descontoPercentual: null,
                                            }));
                                        }}
                                        onBlur={() => {
                                            setDisablePercentual(false);
                                            setDisableFixo(false);
                                        }}
                                        onChange={(e) =>
                                            setProdutoForm((p) => ({
                                                ...p,
                                                descontoFixo: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Errors */}
                            <ul className="mt-3 text-red-600">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>

                            {/* Submit */}
                            <div className="mt-6 text-right">
                                <button
                                    className="btn btn-primary btn-label"
                                    style={{ fontSize: 14, borderRadius: 4 }}
                                    onClick={() => {
                                        produto
                                            ? editProduto()
                                            : addProduto();
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        class="bi bi-plus"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                    </svg>
                                    {produto
                                        ? "Guardar"
                                        : "Adicionar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                
            </Dialog>


            <Dialog open={openPayment} onOpenChange={setOpenPayment}>
  <DialogContent style={{width:'100%'}}>
    

    <div className="text-center" style={{width: '100%'}}>
      {/* SUCCESS STATE */}
      {errors.length === 0 ? (
        <div className="pt-2 fs-15" style={{paddingBottom: 20}}>
          <h4>{successTitle}</h4>

          <p className="text-muted mb-0">
            {successDescription}
          </p>

          {(totalValue("total") - totalPagamentoValue("valor")) > 0 && (
            <p className="text-muted mb-0">
              <br />
              <br />
              <span style={{ fontWeight: 600 }}>
                Ainda poderás adicionar pagamentos futuramente.
              </span>{" "}
              <span style={{ fontWeight: 600, color: "red" }}>
                Porém enquanto
              </span>{" "}
              o valor pago for inferior ou superior ao valor a pagar da
              factura,{" "}
              <span style={{ fontWeight: 600, color: "red" }}>
                não poderás emitir recibos
              </span>
              .
            </p>
          )}

          {(totalValue("total") - totalPagamentoValue("valor")) < 0 && (
            <div className="text-muted mx-4 mb-0">
              <div className="totalRow1">
                <span className="label1">Total a Pagar:</span>
                <span className="value">
                  {formatCurrency(totalValue("total"))}
                </span>
              </div>

              <div className="totalRow1">
                <span className="label1">Valor recebido:</span>
                <span className="value">
                  {formatCurrency(totalPagamentoValue("valor"))}
                </span>
              </div>

              <div className="totalRow1">
                <span className="label1">Troco:</span>
                <span className="value">
                  {formatCurrency(
                    Math.abs(
                      totalValue("total") -
                        totalPagamentoValue("valor")
                    )
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ERROR STATE */
        <div className="pt-2 fs-15">
          <h4>Error de servidor !</h4>
          <p className="text-muted mx-4 mb-0">
            Erro ao adicionar. Tente novamente
          </p>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="d-flex gap-2 mt-4 mb-2" style={{flexDirection: 'row', alignItems: 'center'}}>
        {(totalValue("total") - totalPagamentoValue("valor")) !==
          0 && (
          <div style={{display: 'flex', justifyContent: 'space-between', flex: 1}}>
            
            <button
                            className="btn btn-warning btn-label"
                            style={{ fontSize: 14, borderRadius: 4, flex: 1}}
                            onClick={() => {
                setOpenPayment(false);
                setBypassRecibo(true);
                saveDoc();
              }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-plus"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Salvar mesmo assim
                        </button>
          </div>
        )}

        {errors.length === 0 ? (
          <div style={{flex: 1}}>
            
            <button
                            className="btn btn-primary btn-label"
                            style={{ fontSize: 14, borderRadius: 4, flex: 1, width: '100%'}}
                            onClick={() => setOpenPayment(false)}

                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>
                            Fechar
                        </button>
          </div>
        ) : (
          
            <button
                className="btn btn-danger btn-label"
                style={{ fontSize: 14, borderRadius: 4, flex: 1, width: '100%'}}
                onClick={() => setOpenPayment(false)}

            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>
                Fechar
            </button>
        )}
      </div>
    </div>
  </DialogContent>
</Dialog>

        </div>

        {/* pdfcontainersssss */}
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
              {(!notaParam || notaParamBypass) ? (
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
                        <span className="value">{localizacao}</span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">NIF: </span>
                        <span className="value">{nif}</span>
                      </div>
                      {website && website !== '' && (
                        <div className="pdfHeaderRow">
                          <span className="label">Website: </span>
                          <span className="value">{website}</span>
                        </div>
                      )}
                      <div className="pdfHeaderRow">
                        <span className="label">Email: </span>
                        <span className="value">{email}</span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">Tel: </span>
                        <span className="value">{telefone}</span>
                      </div>
                    </div>

                    <div className="pdfClientInfo" style={{ flex: 1 }}>
                      <div className="pdfHeaderRow">
                        <span className="label">Cliente: </span>
                        <span className="value">
                          {selectedCliente?.nome || "Consumidor Final"}
                        </span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">NIF: </span>
                        <span className="value">{selectedCliente?.nif || "N/A"}</span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">Localização: </span>
                        <span className="value">
                          {selectedCliente?.localizacao || "N/A"}
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
                          {`${tipoDocumento} Nº ${responseDoc?.numeroDocumento}`}
                          </th>
                          <th style={{
                            fontSize: '13px',
                            backgroundColor: 'white',
                            borderTop: 'none',
                            textAlign: 'right',
                            fontWeight: 600
                          }}>
                            {replica}
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
                          <td>{format(new Date(responseDoc?.dataEmissao||null), 'dd-MM-yyyy')}</td>
                          <td>
                            {tipoDocumento === 'Factura Recibo' ? 'N/A' : format(new Date(responseDoc?.dataValidade?.length > 0 ? responseDoc?.dataValidade : null), 'dd-MM-yyyy')}
                          </td>
                          <td>
                            {selectedCliente?.nif || "N/A"}
                          </td>
                          <td>
                            {responseDoc?.numeroDocumento}
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
                    src={responseDoc?.qr_code}
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
                              {(tipoDocumento === 'Factura Recibo' || tipoDocumento === 'Factura') ? (
                                <>
                                  {(!notas || notas === '') && (
                                    <>
                                      <div style={{ opacity: 0, fontWeight: 800 }}>something</div>
                                      <div style={{ opacity: 0 }}>something</div>
                                    </>
                                  )}
                                  {notas && notas !== '' && (
                                    <>
                                      <div style={{ fontWeight: 800 }}>Obs:</div>
                                      <div style={{ maxHeight: '25px' }}>
                                        {notas}
                                      </div>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 800 }}>Obs:</div>
                                  <div style={{ maxHeight: '25px' }}>
                                    Este documento não serve de factura. <br />
                                    {notas}
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
                    {responseDoc?.produtos && [...responseDoc?.produtos||[]].length > 0 && 
                      [...responseDoc?.produtos||[]].concat([...responseDoc?.produtos||[]].concat([...responseDoc?.produtos||[]]).concat([...responseDoc?.produtos||[]]))
                        .slice((pageIndex * itemsPerPage), (pageIndex * itemsPerPage) + itemsPerPage)
                        .map((data, index) => {
                          const globalIndex = index;
                          const isLastPage = pageIndex + 1 === getTotalPages().length;
                          const isLastProduct = data?.index === [...responseDoc?.produtos||[]][[...responseDoc?.produtos||[]].length - 1]?.index;
                          
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
            (!notaParam || notaParamBypass) ? HeaderTemplate() : HeaderTemplateRecibo()
          )}

          <div className="bottom" style={{ 
            marginTop: [14, 15, 16, 17].includes(getLastPageProductIndex()) ? '-20px' : '-55px'
          }}>
            {tipoDocumento !== 'Factura Recibo' ? (
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

          {[13, 12, 11, 10].includes(getLastPageProductIndex()) && tipoDocumento === 'Factura Recibo' && (
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
              {(!notaParam() || notaParamBypass()) ? HeaderTemplate() : HeaderTemplateRecibo()}
            </>
          )}

          {tipoDocumento === 'Factura Recibo' && (
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
                    {filteredPagamentos(payments)?.map((item, index) => {
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
                                  {(!notaParam || notaParamBypass) ? HeaderTemplate() : HeaderTemplateRecibo()}
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

              <div className="bottom" style={{ marginTop: '-60px', display: tipoDocumento === 'Factura Recibo' ? 'flex' : 'none' }}>
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
                        <span className="value">{localizacao}</span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">NIF: </span>
                        <span className="value">{nif}</span>
                      </div>
                      {website && website !== '' && (
                        <div className="pdfHeaderRow">
                          <span className="label">Website: </span>
                          <span className="value">{website}</span>
                        </div>
                      )}
                      <div className="pdfHeaderRow">
                        <span className="label">Email: </span>
                        <span className="value">{email}</span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">Tel: </span>
                        <span className="value">{telefone}</span>
                      </div>
                    </div>

                    <div className="pdfClientInfo" style={{ flex: 1 }}>
                      <div className="pdfHeaderRow">
                        <span className="label">Cliente: </span>
                        <span className="value">
                          {selectedCliente?.nome || "Consumidor Final"}
                        </span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">NIF: </span>
                        <span className="value">{selectedCliente?.nif || "N/A"}</span>
                      </div>
                      <div className="pdfHeaderRow">
                        <span className="label">Localização: </span>
                        <span className="value">
                          {selectedCliente?.localizacao || "N/A"}
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
                            {`Recibo Nº ${responseDoc?.numeroRecibo}`}
                          </th>
                          <th style={{
                            fontSize: '13px',
                            backgroundColor: 'white',
                            borderTop: 'none',
                            textAlign: 'right',
                            fontWeight: 600
                          }}>
                            {replica}
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
                          <td>{format(new Date(responseDoc?.dataEmissaoRecibo||null), 'dd-MM-yyyy')}</td>
                          {/* <td>
                            {tipoDocumento === 'Factura Recibo' ? 'N/A' : format(new Date(dataValidade?.length > 0 ? dataValidade : null), 'dd-MM-yyyy')}
                          </td> */}
                          <td>
                            {selectedCliente?.nif || "N/A"}
                          </td>
                          <td>
                            {responseDoc?.numeroRecibo}
                          </td>
                          <td>
                            {responseDoc?.numeroDocumento}
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
                    src={responseDoc?.qr_code_recibo}
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
                              {(tipoDocumento === 'Factura Recibo' || tipoDocumento === 'Factura') ? (
                                <>
                                 
                                  {true && (
                                    <>
                                      <div style={{ fontWeight: 800 }}>Obs:</div>
                                      <div style={{ maxHeight: '25px' }}>
                                        Através do(s) seguinte(s) meio(s) no valor total de {formatCurrency(totalPagamentoValue("valor"))}
                                      </div>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 800 }}>Obs:</div>
                                  <div style={{ maxHeight: '25px' }}>
                                    Este documento não serve de factura. <br />
                                    {notas}
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
                    {filteredPagamentos(payments)?.length > 0 && 
                      filteredPagamentos(payments)
                        .slice((pageIndex * itemsPerPage), (pageIndex * itemsPerPage) + itemsPerPage)
                        .map((data, index) => {
                          const globalIndex = index;
                          const isLastPage = pageIndex + 1 === getTotalPagesRecibos().length;
                          const isLastProduct = data?.index == filteredPagamentos(payments).length;
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
export default NovoDocumento;
