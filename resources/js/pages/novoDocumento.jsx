import { useEffect, useState } from "react"
import '../../css/novoDocumento.css'
import Loading1 from "../components/loading1"
import logo from '../../images/logo.jpeg'
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "../components/ui/dialog";
import api from "../components/api"

const NovoDocumento = () => {
    const [load, setLoad] = useState(false)
    const [loadingClientes, setLoadingClientes] = useState(false)
    const [notaParam, setNotaParam] = useState(null)
    const [factura, setFactura] = useState(null)
    const [polo, setPolo] = useState(null);
    const [notaTipo, setNotaTipo] = useState("");
const [documentoOrigem, setDocumentoOrigem] = useState("");
const [dataNota, setDataNota] = useState("");
const [dataValidadeRetificacao, setDataValidadeRetificacao] = useState("");
const [motivo, setMotivo] = useState("");
const [empresaImage, setEmpresaImage] = useState(null);
const [empresa, setEmpresa] = useState(null);

const [localizacao, setLocalizacao] = useState("");
const [nif, setNif] = useState("");
const [website, setWebsite] = useState("");
const [telefone, setTelefone] = useState("");
const [email, setEmail] = useState("");

const [clientes, setClientes] = useState([]);
const [selectedCliente, setSelectedCliente] = useState("");
const [tipoDocumento, setTipoDocumento] = useState("Factura");
const [moeda, setMoeda] = useState("AOA");
const [dataEmissao, setDataEmissao] = useState(format(new Date(), "yyyy-MM-dd"));
const [dataValidade, setDataValidade] = useState("");
const [selectedProdutos, setSelectedProdutos] = useState([]);
const [tipoNota, setTipoNota] = useState("");
const [open, setOpen] = useState(false);
const [openEdit, setOppenEdit] = useState(false);
const [notas, setNotas] = useState("");
const [reciboParam, setReciboParam] = useState(null);
const today = new Date().toISOString().split("T")[0];
const totalValue = (field) => {
    return selectedProdutos?.reduce((count, item) => {
      if (
        eval(`item.${field}`) !== undefined &&
        eval(`item.${field}`) !== null &&
        eval(`item.${field}`) !== ""
      ) {
        return count + parseFloat(eval(`item.${field}`));
      }
      return count;
    }, 0);
  }
const [payments, setPayments] = useState([
  {
    tipoPagamento: null,
    banco: null,
    valor: "",
    dataPagamento: format(new Date(), "yyyy-MM-dd"),
    referencia: "",
    disabled: false,
  },
]);
const updatePayment = (index, field, value) => {
  setPayments((prev) =>
    prev.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    )
  );
};
const addPayment = () => {
  setPayments((prev) => [
    ...prev,
     {
    tipoPagamento: null,
    banco: null,
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
          pagamento?.value?.valor?.length > 0 ||
          pagamento?.value?.tipoPagamento ||
          pagamento?.value?.referencia?.length > 0 ||
          pagamento?.value?.banco?.length > 0
      )
      .map((i, index) => {
        return {
          ...i,
          index: index,
        };
      });
  };
const totalPagamentoValue = (field) => {
    return filteredPagamentos(payments).reduce(
      (count, item) => {
        if (
          eval(`item?.value?.${field}`) !== undefined &&
          eval(`item?.value?.${field}`) !== null &&
          eval(`item?.value?.${field}`) != ""
        ) {
          return count + parseFloat(eval(`item?.value?.${field}`));
        }
        return count;
      },
      0
    );
  }
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
  setSelectedProdutos(JSON.parse(localStorage.getItem("facturaProdutos") || "[]")?.map(
        (i, index) => {
          return {
            ...i,
            index: index + 1,
          };
        }
      ))
    setEmpresaImage(logo)
    setLoadingProdutos(true)
    setLoadingClientes(true)
    api.get('/v1/artigos')
    .then(res => {
      setProdutos([...res.data].filter((i) => i?.status == "activo"))
      setLoadingProdutos(false)
    })
    .catch(err => {
      setLoadingProdutos(false)
    })
    api.get('/v1/clientes/index')
    .then(res => {
      setClientes([
            {
              id: null,
              nome: "Consumidor Final",
            },
          ].concat([...response].filter((i) => i?.status == "activo")).concat([...res.data].filter((i) => i?.status == "activo")))
      setLoadingClientes(false)
      setSelectedCliente(clientes?.find((i) => i?.id == factura()?.cliente_id))
    })
    .catch(err => {
      setLoadingClientes(false)
    })
}, [])
useEffect(() => {
  const fullUserEmpresa = JSON.parse(
    sessionStorage.getItem("fullUserEmpresa") || "{}"
  );

  const fullUserPolo = JSON.parse(
    sessionStorage.getItem("fullUserPolo") || "{}"
  );
  console.log('empresa polo', fullUserEmpresa, fullUserPolo);

  setEmpresa(fullUserEmpresa);
  setPolo(fullUserPolo);
  setLocalizacao(fullUserPolo?.localizacao || "");
  setNif(fullUserEmpresa?.num_contribuinte || "");
  setWebsite(fullUserPolo?.website || "");
  setTelefone(fullUserPolo?.telemovel || "");
  setEmail(fullUserPolo?.email || "");
}, []);

  const extractPercentage = (item) => {
    return parseFloat(item?.produto?.impostoFull?.taxa);
  };
  const insideFactura = (data) => {
    // Disable edit/remove if product is already inside factura
    return !!factura && data?.insideFactura === true;
  };
  const openRemove = (data) => {
    if (insideFactura(data)) return;

    const confirmed = window.confirm(
      `Remover o produto "${data?.produto?.designacao}"?`
    );

    if (confirmed) {
      setSelectedProdutos((prev) =>
        prev.filter((item) => item !== data)
      );
    }
  };

  
  const [errors, setErrors] = useState([]);
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
      })
  const [produtos, setProdutos] = useState([]);
const incrementQuantidade = () => {
  setProdutoForm((p) => ({
    ...p,
    quantidade: p.quantidade + 1,
  }));
};

const decrementQuantidade = () => {
  setProdutoForm((p) => ({
    ...p,
    quantidade: Math.max(1, p.quantidade - 1),
  }));
};
const handleProdutoChange = (produto) => {
  setProdutoForm((p) => ({
    ...p,
    produto,
    preco: produto?.preco || 0,
    categoriaProduto: produto?.categoria || "",
    taxaImpostoText: produto?.taxa || "",
    taxaImposto: produto?.taxaValor || 0,
    total: p.quantidade * (produto?.preco || 0),
  }));

  const produtoEdit = selectedProdutos.find(
    (p) => p?.produto?.id === produtoSelecionado.id
  );

  if (produtoEdit) {
    // === EDIT MODE ===
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
    // === NEW PRODUCT SELECTED ===
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
    setErrors([])
    setSelProductImage(null);
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
    })
    setOpen(true)
  };
  useEffect(() => {

  // === simple validity check (adjust if you have stricter rules) ===
  if (!produtoForm.produto || produtoForm.quantidade <= 0) return;

  const {
    produto,
    quantidade,
    preco,
    descontoPercentual,
    descontoFixo,
  } = produtoForm;

  // === Update product image ===
  if (produto?.imagemFull?.file) {
    setSelProductImage(
      `/storage/${produto.imagemFull.file}`
    );
  }

  // === Base total ===
  let total = quantidade * preco;

  // === maxFixo ===
  setMaxFixo(total);

  // === Tax calculation ===
  const taxa =
    (total * parseFloat(produto?.impostoFull?.taxa || 0)) / 100;

  const impostoText = `Taxa: ${produto?.impostoFull?.taxa}% | Valor: ${taxa}`;

  // === Apply discounts ===
  if (descontoPercentual) {
    total -= (total * descontoPercentual) / 100;
  }

  if (descontoFixo) {
    total -= descontoFixo;
  }

  // === Add tax ===
  total += taxa;

  // === Patch values (emitEvent: false equivalent) ===
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
    setErrors(["Preencha por favor todos os campos!"]);
    return;
  }

  // === check if product already exists ===
  if (
    selectedProdutos.find(
      (p) => p.produto.id === value.produto.id
    )
  ) {
    notificationService.error("Produto já adicionado!");
    return;
  }

  // === calculate descontoFinal ===
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

  // === update selectedProdutos ===
  setSelectedProdutos((current) => {
    const updated = [
      ...current,
      {
        ...value,
        descontoFinal,
        index: current.length + 1,
      },
    ];

    // persist like Angular
    localStorage.setItem(
      "facturaProdutos",
      JSON.stringify(updated)
    );

    return updated;
  });

  // notificationService.success("Produto adicionado com sucesso");
  }
    return (
        <div className="dashboardContainer" style={{background:'#f6f6f6ff'}}>
            <Loading1 loading={(load || loadingClientes)} />
            <div className="breadCrumb" style={{background: 'white'}}>
                <div className="title">{notaParam ? (factura?.factura_id ? 'nota de crédito' : 'adicionar nota de crédito') : factura ? 'VER Detalhes' : 'Documentos'}</div>
                <div className="dashboardContent">
                    Facturas <div>{">"}</div> <span>Novo</span>
                </div>
            </div>

            <div className="invoiceContainer" style={{border: '1px solid #eeeeee'}}>
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
      style={{ color: "red", paddingRight: 5, paddingTop: 5 }}
    />
    <span style={{ fontSize: 13, paddingBlock: 10 }}>
      Esse documento tem a(s) seguinte(s) nota(s) de crédito:
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
    <div className="companyTitle">Informação da nota de crédito</div>

    <div className="row">
      <div className="col">
        <label className="form-label">
          Tipo de nota <span style={{ color: "red" }}>*</span>
        </label>

        <select
          className="form-control"
          value={notaTipo}
          disabled={!!factura?.factura_id}
          onChange={(e) => setNotaTipo(e.target.value)}
          style={
            factura?.factura_id
              ? { cursor: "not-allowed", pointerEvents: "none" }
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
          Documento de origem <span style={{ color: "red" }}>*</span>
        </label>

        <input
          className={`form-control ${factura ? "bg-light" : ""}`}
          value={documentoOrigem}
          readOnly={!!factura}
          style={factura ? { cursor: "not-allowed" } : {}}
          onChange={(e) => setDocumentoOrigem(e.target.value)}
        />
      </div>

      <div className="col">
        <label className="form-label">
          Data da nota de crédito <span style={{ color: "red" }}>*</span>
        </label>

        <input
          className="form-control bg-light"
          value={dataNota}
          readOnly
          disabled
          style={{ cursor: "not-allowed" }}
        />
      </div>
    </div>

    {factura?.tipoDocumento !== "Factura Recibo" &&
      notaTipo === "Nota de crédito (retificação)" && (
        <div className="row">
          <div
            className="col"
            style={
              factura?.factura_id
                ? { cursor: "not-allowed", pointerEvents: "none" }
                : {}
            }
          >
            <label className="form-label">
              Data de validade da nova factura{" "}
              <span style={{ color: "red" }}>*</span>
            </label>

            <input
              className={`form-control ${
                factura?.factura_id ? "bg-light" : ""
              }`}
              value={dataValidadeRetificacao}
              readOnly={!!factura?.factura_id}
              onChange={(e) =>
                setDataValidadeRetificacao(e.target.value)
              }
            />
          </div>
        </div>
      )}

    <div className="row">
      <div className="col">
        <label className="form-label">
          Motivo de emissão <span style={{ color: "red" }}>*</span>
        </label>

        <textarea
          className="form-control alert alert-info"
          rows={5}
          value={motivo}
          placeholder={
            notaTipo !== "Nota de crédito (retificação)"
              ? "Motivo de emissão..."
              : "Ex: Devolução de produtos, troca de produtos, correção de erros, etc..."
          }
          disabled={!!factura?.factura_id}
          style={
            factura?.factura_id
              ? { cursor: "not-allowed", pointerEvents: "none" }
              : {}
          }
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>
    </div>

    <hr className="divider" />
    <div className="companyTitle">Detalhes do documento Origem</div>
  </>
)}

<img
  src={
    empresaImage ||
    "https://media.licdn.com/dms/image/v2/D4D0BAQGL_YyfcXoDZA/company-logo_200_200/B4DZoqVSAMJAAI-/0/1761646813978/level_soft_angola_logo?e=1769040000&v=beta&t=bIEZ01l0aSWRCzKkaO_eYQP_uPVOc4qTSFzuL4zkg9o"
  }
  className="logo"
  alt=""
/>
    <hr class="divider" />
  {/* COMPANY NAME */}
<div className="companyTitle">
  {empresa?.nome_empresa}
</div>

<div className="headerInfo">
  {/* LEFT SIDE */}
  <section className="left">
    <div className="row">
      <div className="col">
        <label className="form-label">
          Localização <span style={{ color: "red", fontSize: 16 }}>*</span>
        </label>
        <input
          className={`form-control form-control-sm ${
            factura ? "bg-light" : ""
          }`}
          value={localizacao}
          placeholder="Localização da empresa..."
          readOnly={!!factura}
          style={factura ? { cursor: "not-allowed" } : {}}
          onChange={(e) => setLocalizacao(e.target.value)}
        />
      </div>
    </div>

    <div className="row">
      <div className="col">
        <label className="form-label">
          NIF <span style={{ color: "red", fontSize: 16 }}>*</span>
        </label>
        <input
          className="form-control form-control-sm bg-light"
          value={nif}
          readOnly
          placeholder="Ex: 50007471..."
        />
      </div>

      <div className="col">
        <label className="form-label">Website (opcional)</label>
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
          Telefone <span style={{ color: "red", fontSize: 16 }}>*</span>
        </label>
        <input
          className={`form-control form-control-sm ${
            factura ? "bg-light" : ""
          }`}
          type="number"
          value={telefone}
          placeholder="945648049..."
          readOnly={!!factura}
          onChange={(e) => setTelefone(e.target.value)}
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
            value={selectedCliente}
            disabled={!!factura}
            onChange={(e) => setSelectedCliente(e.target.value)}
            style={
              factura
                ? { cursor: "not-allowed", pointerEvents: "none" }
                : {}
            }
          >
            <option value="">Seleccione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
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
            <span className="sr-only">Loading...</span>
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
      <span style={{ color: "red", fontSize: 16 }}>*</span>
    </label>

    <select
      className={`form-control ${factura ? "bg-light" : ""}`}
      value={tipoDocumento}
      disabled={factura}
      style={
        factura
          ? { cursor: "not-allowed", pointerEvents: "none" }
          : {}
      }
      onChange={(e) => setTipoDocumento(e.target.value)}
    >
      <option value="">Seleccione um tipo de documento</option>

      {Object.entries(tiposDocumentosGrouped).map(
        ([grupo, items]) => (
          <optgroup key={grupo} label={grupo} style={{color: 'grey', fontSize: 12, fontWeight: 500,}}>
            {items.map((item) => (
              <option key={item.name} value={item.name} style={{fontSize: 14, color: 'black', paddingBlock: 3}}>
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
      Moeda <span style={{ color: "red", fontSize: 16 }}>*</span>
    </label>

    <select
      className={`form-control ${factura ? "bg-light" : ""}`}
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
      <span style={{ color: "red", fontSize: 16 }}>*</span>
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
          ? { cursor: "not-allowed", pointerEvents: "none" }
          : {}
      }
    >
      <label className="form-label">
        Data de Validade
        <span style={{ color: "red", fontSize: 16 }}>*</span>
      </label>

      <input
        type="date"
        className={`form-control ${
          factura ? "bg-light" : ""
        }`}
        value={dataValidade}
        readOnly={factura}
        disabled={factura}
        onChange={(e) => setDataValidade(e.target.value)}
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
  <table className="table table-gridjs" style={{ backgroundColor: "white" }}>
    <thead style={{ background: "#f3f6f9" }}>
      <tr style={{background: '#f3f6f9'}}>
        <th style={{ maxWidth: 20, width: 20, background: '#f3f6f9', fontWeight: '400', fontSize: 15 }}>#</th>
        <th style={{background: '#f3f6f9', fontWeight: '400', fontSize: 15}}>Designação</th>
        <th style={{background: '#f3f6f9', fontWeight: '400', fontSize: 15}}>Qtd.</th>
        <th style={{background: '#f3f6f9', fontWeight: '400', fontSize: 15}}>P. Unitário</th>
        <th style={{background: '#f3f6f9', fontWeight: '400', fontSize: 15}}>Desc.</th>
        <th style={{background: '#f3f6f9', fontWeight: '400', fontSize: 15}}>Taxa</th>
        <th style={{background: '#f3f6f9', fontWeight: '400', fontSize: 15}}>Total</th>
        <th
          style={{
            backgroundColor: "#dff5fa",
            maxWidth: 100,
            width: 100,
            fontWeight: '400',
            fontSize: 15
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
            <td>{index + 1}</td>

            <td
              title={data?.produto?.designacao}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitBoxOrient: "vertical",
              }}
            >
              {data?.produto?.designacao}
            </td>

            <td>{data?.quantidade}</td>

            <td>{Number(data?.preco || 0).toLocaleString()}</td>

            <td>
              {Number(data?.descontoFinal || 0).toLocaleString()}
              {data?.descontoPercentual
                ? ` (${data.descontoPercentual}%)`
                : ""}
            </td>

            <td>
              {Number(data?.taxaImposto || 0).toLocaleString()} (
              {extractPercentage(data)}%)
            </td>

            <td>{Number(data?.total || 0).toLocaleString()}</td>

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
                ...(factura && insideFactura(data)
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
                <i className="ri-delete-bin-5-line fs-16 me-2"></i>
              </div>

              <div
                className="edit"
                onClick={() => openEdit(data)}
              >
                <i className="ri-edit-box-line fs-16 me-2"></i>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={8} className="text-center">
            <div style={{ marginTop: 15, marginInline: 15 }}>
              Nenhum produto adicionado ainda. Adicione um.
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {(!factura || tipoNota === "Nota de crédito (retificação)") && (
    <button
      className="btn btn-primary btn-label"
      style={{ fontSize: 14, borderRadius: 4, }}
      onClick={() => {
          openModal();}}
  >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
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
    style={{ height: "100%", margin: 0 }}
    value={notas}
    onChange={(e) => setNotas(e.target.value)}
    disabled={!!factura}
    style={
      factura
        ? { cursor: "not-allowed", pointerEvents: "none" }
        : {}
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
      <span style={{ color: "grey", fontSize: 15, fontWeight: 400 }}>
        Total pago: {formatCurrency(totalPagamentoValue("valor"))}
        <br />
        <span style={{ fontWeight: 600, color: creditColor }}>
          Crédito sobrando: {formatCurrency(remaining)}
        </span>
      </span>
    </div>

    <div className="payments">
      {payments.map((item, i) => (
        <div key={i} className="group">
          {/* Tipo de pagamento */}
          <div className="col">
            <label className="form-label">Tipo de pagamento</label>
            <select
              className="form-select bg-light mb-3"
              value={item.tipoPagamento}
              disabled={item.disabled}
              onChange={(e) =>
                updatePayment(i, "tipoPagamento", e.target.value)
              }
            >
              <option value="" disabled>
                Selecione um tipo de pagamento...
              </option>
              <option value="Transferência">Transferência</option>
              <option value="TPA">TPA</option>
              <option value="Depósito">Depósito</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>

          {/* Banco */}
          {item.tipoPagamento !== "Dinheiro" && (
            <div className="col">
              <label className="form-label">Banco</label>
              <select
                className="form-select bg-light mb-3"
                value={item.banco}
                disabled={item.disabled}
                onChange={(e) =>
                  updatePayment(i, "banco", e.target.value)
                }
              >
                <option value="" disabled>
                  Selecione um banco...
                </option>
                <option value="Keve">Keve</option>
                <option value="BAI">BAI</option>
                <option value="BCI">BCI</option>
                <option value="BFA">BFA</option>
                <option value="BIC">BIC</option>
                <option value="BPC">BPC</option>
                <option value="Banco Sol">Banco Sol</option>
              </select>
            </div>
          )}

          {/* Valor */}
          <div className="col">
            <label className="form-label">Valor</label>
            <input style={{border: 'none !important'}}
              type="number"
              className="form-control bg-light mb-3"
              placeholder="Valor do pagamento..."
              value={item.valor}
              readOnly={item.disabled}
              onChange={(e) =>
                updatePayment(i, "valor", e.target.value)
              }
            />
          </div>

          {/* Data */}
          <div className="col">
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-control bg-light mb-3"
              value={item.dataPagamento}
              max={today}
              readOnly={item.disabled}
              onChange={(e) =>
                updatePayment(i, "dataPagamento", e.target.value)
              }
            />
          </div>

          {/* Referência */}
          {item.tipoPagamento !== "Dinheiro" && (
            <div className="col">
              <label className="form-label">Referência</label>
              <input
                type="text"
                className="form-control bg-light mb-3"
                placeholder="Referência do pagamento..."
                value={item.referencia}
                readOnly={item.disabled}
                onChange={(e) =>
                  updatePayment(i, "referencia", e.target.value)
                }
              />
            </div>
          )}

          {/* Footer */}
          <div className="col" style={{ display: "flex" }}>
            <div className="paymentTitle" style={{ flex: 1, fontWeight: 500 }}>
              Pagamento {i + 1}
            </div>
            <button
            style={{width: 40, height: 40}}
              type="button"
              className="btn btn-danger"
              disabled={item.disabled || i === 0}
              onClick={() => removePayment(i)}
            >
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg>            </button>
          </div>
        </div>
      ))}
    </div>

  </>
)}

            </div>
             <Dialog
                open={open}
                onOpenChange={(e) => {
                    setOpen(e);
                }}
            >
            <DialogContent style={{maxWidth: 1000, width: '100%'}} className="max-w-6xl p-0 overflow-hidden">
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
          <DialogTitle className="text-2xl font-bold" style={{textAlign: 'left', paddingTop: 20}}>
            {produtoForm.produto ? "Editar" : "Seleccionar"} Produto
          </DialogTitle>
        </DialogHeader>

        {/* Produto */}
        <div className="mb-4">
          <label className="text-muted" style={{marginBottom: 10}}>Seleccione um produto</label>

          {produto ? (
            <input
              className="form-control bg-light"
              value={produto?.designacao || ""}
              readOnly
            />
          ) : (
            <select
              className="form-control"
              onChange={(e) =>
                handleProdutoChange(
                  produtos.find((p) => p.id == e.target.value)
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
          <label className="text-muted" style={{marginBottom: 10}}>Quantidade</label>
          <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
            <div className="form-control " style={{width: 150, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 5}}>
              <button className="minus" onClick={decrementQuantidade}>
                –
              </button>
              <input
                type="number"
                className="product-quantity"
                value={produtoForm.quantidade}
                readOnly
                style={{border: 'none', outline: 'none', width: 40, textAlign: 'center'}}
              />
              <button className="plus" onClick={incrementQuantidade}>
                +
              </button>
            </div>
            <span className="text-2xl font-bold ml-4">
              {formatCurrency(produtoForm.quantidade * produtoForm.preco)}
            </span>
          </div>
        </div>

        {/* Preço */}
        <label className="text-muted" style={{marginBottom: 10}}>Preço</label>

        <input
          className="form-control bg-light mb-3"
          value={formatCurrency(produtoForm.preco)}
          readOnly
        />

        {/* Taxa */}
        <label className="text-muted" style={{marginBottom: 10}}>Taxa de Imposto</label>

        <input
          className="form-control bg-light mb-3"
          placeholder="Valor Imposto..."
          value={produtoForm.taxaImpostoText}
          readOnly
        />

        {/* Categoria */}
        <label className="text-muted" style={{marginBottom: 10}}>Categoria</label>

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
    <label className="text-muted mb-2 block">Desconto (%)</label>

    <input
      type="number"
      placeholder="Desconto (%)"
      className={`form-control ${disablePercentual ? "bg-light" : ""}`}
      value={produtoForm.descontoPercentual ?? ""}
      disabled={disablePercentual}
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
          descontoPercentual: e.target.value,
        }))
      }
    />
  </div>

  {/* DESCONTO FIXO */}
  <div>
    <label className="text-muted mb-2 block">Desconto fixo</label>

    <input
      type="number"
      placeholder="Desconto fixo"
      className={`form-control ${disableFixo ? "bg-light" : ""}`}
      value={produtoForm.descontoFixo ?? ""}
      disabled={disableFixo}
      min={0}
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
      style={{ fontSize: 14, borderRadius: 4, }}
      onClick={() => {
          produtoForm.produto ? editProduto() : addProduto()
      }}
  >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>
      {produtoForm?.produto ? "Guardar" : "Adicionar"}
  </button>
          
        </div>
      </div>
    </div>
  </DialogContent>


            </Dialog>
        </div>
    )
}
export default NovoDocumento