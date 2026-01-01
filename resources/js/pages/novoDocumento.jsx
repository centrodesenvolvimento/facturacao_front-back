import { useEffect, useState } from "react"
import '../../css/novoDocumento.css'
import Loading1 from "../components/loading1"
import logo from '../../images/logo.jpeg'
import { format } from "date-fns"

const NovoDocumento = () => {
    const [load, setLoad] = useState(false)
    const [loadingClientes, setLoadingClientes] = useState(false)
    const [notaParam, setNotaParam] = useState(null)
    const [factura, setFactura] = useState(null)
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

useEffect(() => {
    setEmpresaImage(logo)
}, [])
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


            </div>
        </div>
    )
}
export default NovoDocumento