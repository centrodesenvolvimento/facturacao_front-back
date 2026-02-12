import { format } from "date-fns";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { useEffect, useState } from "react";
import "../../css/saft.css";
import { Bounce, toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Loading1 from "../components/loading1";


const Saft = () => {
    const [anoFiscal, setAnoFiscal] = useState('');
  const [tipoSaft, setTipoSaft] = useState('F');
  const [dateRange, setDateRange] = useState([]);
  const [loadDoc, setLoadDoc] = useState(false);

  const [polo, setPolo] = useState(null);
  const [userData, setUserData] = useState(null);
  const [load, setLoad] = useState(false);
  const [messages, setMessages] = useState([]);
  const [errors, setErrors] = useState([]);
  const [done, setDone] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [response, setResponse] = useState(null)
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
  const createDoc = () => {
    if (!dateRange || (dateRange.length <= 0)) {
      toastError("Preencha o intervalo de dias");
      return;
    }
    
    if (!tipoSaft) {
      toastError("Tipo de Saft em falta");
      return;
    }
let apiUrl1 =  
        "/v1/facturas/searchSaft" +
        `?polo=${polo}&from=${new Date(
          dateRange?.[0]
        ).toISOString()}&to=${new Date(dateRange?.[1]).toISOString()}&empresa=${
          empresa?.id
        }`;

        setLoad(true)
        axios.get(apiUrl1)
        .then(res => {
            setResponse(res.data)
            console.log('response', res.data)
        })
        .catch(err => {
                        setLoad(false)

            if (err?.response?.data?.erro) {
        toastError("Erro ao gerar documento: " +
              JSON.stringify(err?.response?.data?.erro)
          )
      }else {
        toastError("Erro ao gerar documento: " +
              JSON.stringify(err?.error?.message || err?.message)
          )
      }
      return;
        })

        setTimeout(() => {
            setLoad(false)
            setDone(true)
            toastSuccess("Documento gerado com sucesso.")
        }, 1000)

  }
   const fetchEmpresa = () => {
    setLoadDoc(true)
        const apiUrl1 = "/v1/empresas";
    axios.get(apiUrl1)
    .then(res => {
        if (userData) {
            setEmpresa( [...res?.data].find((i) => i?.id == userData?.empresa_id))
        }else {
            setEmpresa([...res?.data][0])
        }
        if (JSON.parse(sessionStorage.getItem("fullUserPolo") || "null")?.id) {
          setPolo(
            JSON.parse(sessionStorage.getItem("fullUserPolo") || "null")?.id ??
              null
          );
        } else {
          setPolo(empresa?.polos[0]?.id ?? null);
        }
        setLoadDoc(false)
        

    })
  };

  useEffect(() => {

    const fullUserPolo = JSON.parse(sessionStorage.getItem("fullUserPolo") || "null");
    
    if (fullUserPolo?.id) {
      setPolo(fullUserPolo.id);
    } else {
      
      if (empresa?.polos?.[0]?.id) {
        setPolo(empresa.polos[0].id);
      }
    }
    
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    setUserData(currentUser);
    
    fetchEmpresa();
    
    
    return () => {
        
    };
  }, []);
  useEffect(() => {
    if (dateRange) {
      setLoad(false);
      setMessages([]);
      setErrors([]);
      setDone(false);
    }
  }, [dateRange]);
  useEffect(() => {
    if (empresa?.polos?.[0]?.id && !polo) {
      // Only set if polo wasn't already set from sessionStorage
      const fullUserPolo = JSON.parse(sessionStorage.getItem("fullUserPolo") || "null");
      if (!fullUserPolo?.id) {
        setPolo(empresa.polos[0].id);
      }
    }
  }, [empresa, polo]);
  const downloadExcel = () => {
  setLoadDoc(true);


  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01">\n`;

  // HEADER
  xml += `  <Header>\n`;
  xml += `    <AuditFileVersion>1.01_01</AuditFileVersion>\n`;
  xml += `    <CompanyID>${empresa?.registo_comercial}</CompanyID>\n`;
  xml += `    <TaxRegistrationNumber>${empresa?.num_contribuinte}</TaxRegistrationNumber>\n`;
  xml += `    <TaxAccountingBasis>${empresa?.tipo}</TaxAccountingBasis>\n`;
  xml += `    <CompanyName>${empresa?.nome_empresa}</CompanyName>\n`;
  xml += `    <BusinessName>${empresa?.designacao_comercial}</BusinessName>\n`;
  xml += `    <CompanyAddress>\n`;
  xml += `      <AddressDetail>${polo?.localizacao || 'Desconhecido'}</AddressDetail>\n`;
  xml += `      <City>Desconhecido</City>\n`;
  xml += `      <Province>${polo?.provincia|| 'Desconhecido'}</Province>\n`;
  xml += `      <Country>${empresa?.pais}</Country>\n`;
  xml += `    </CompanyAddress>\n`;
  xml += `    <FiscalYear>${new Date().getFullYear()}</FiscalYear>\n`;
  xml += `    <StartDate>${format(new Date(dateRange[0]), "dd/MM/yyyy")}</StartDate>\n`;
  xml += `    <EndDate>${format(new Date(dateRange[1]), "dd/MM/yyyy")}</EndDate>\n`;
  xml += `    <CurrencyCode>AOA</CurrencyCode>\n`;
  xml += `    <DateCreated>${now}</DateCreated>\n`;
  xml += `    <TaxEntity>GLOBAL</TaxEntity>\n`;
  // xml += `    <ProductCompanyTaxID>Não sei</ProductCompanyTaxID>\n`;
  // xml += `    <SoftwareValidationNumber>Não sei</SoftwareValidationNumber>\n`;
  // xml += `    <ProductID>Não sei</ProductID>\n`;
  // xml += `    <ProductVersion>Não sei</ProductVersion>\n`;
  // xml += `    <Telephone>Não sei</Telephone>\n`;
  // xml += `    <Email>Não sei</Email>\n`;
  // xml += `  </Header>\n\n`;

  //produtor do software info
  const productInfo = response?.productorSoftware || {
    nif: '5000000000',
    numero_validacao: 'SAFT/2024/001',
    nome_aplicacao: 'Level-Invoice',
    versao: '1.0.0',
    telemovel: '000000000',
    email: 'suporte@levelsoft.ao',
    website: 'https://levelsoft.ao/'
  };
  
  xml += `    <ProductCompanyTaxID>${productInfo.nif}</ProductCompanyTaxID>\n`;
  xml += `    <SoftwareValidationNumber>${productInfo.numero_validacao}</SoftwareValidationNumber>\n`;
  xml += `    <ProductID>${productInfo.nome_aplicacao}</ProductID>\n`;
  xml += `    <ProductVersion>${productInfo.versao}</ProductVersion>\n`;
  xml += `    <Telephone>${productInfo.telemovel}</Telephone>\n`;
  xml += `    <Email>${productInfo.email}</Email>\n`;
  xml += `    <Website>${productInfo.website}</Website>\n`;
  xml += `  </Header>\n\n`;
  // MASTER FILES
  xml += `  <MasterFiles>\n`;
  let totalDebit = 0;
  let totalCredit = 0;

  // Collect unique clients and products
  let uniqueClientes = new Set();
  [...response?.documentos || []].forEach((i) => {
    if (i?.cliente_id) uniqueClientes.add(i?.cliente_id);
  });
  let uniqueProdutos = new Set();
  [...response?.documentos || []].forEach((i) => {
    if (i?.produtos && [...i?.produtos || []].length > 0) {
      [...i?.produtos || []].forEach((prod) => {
        console.log('hellooooo prod', prod);
        let prodTotal = parseFloat(`${prod?.preco}`) * parseFloat(`${prod?.quantidade}`);
        let desconto = parseFloat(`${prod?.descontoFinal || 0}`); 
        let imposto = parseFloat(`${prod?.taxaImposto || 0}`);
        // let taxAmount = (prodTotal) * (imposto / 100);
        // totalDebit += prodTotal - desconto + taxAmount;
        // totalCredit += prodTotal - desconto + imposto;
        if (['NCR', 'NC'].includes(i?.numeroDocumento?.split(" ")[0])) {
          totalDebit += prodTotal - desconto + imposto;
        }else {
          totalCredit += prodTotal - desconto + imposto;
        }

        uniqueProdutos.add(prod?.produto);
      });
    }
  });

  // Customers
  xml += `    <Customer>\n`;
  xml += `      <CustomerID>999999999</CustomerID>\n`;
  xml += `      <AccountID>Desconhecido</AccountID>\n`;
  xml += `      <CustomerTaxID>N/A</CustomerTaxID>\n`;
  xml += `      <CompanyName>Consumidor Final</CompanyName>\n`;
  xml += `      <Contact>Desconhecido</Contact>\n`;
  xml += `      <BillingAddress>\n`;
  xml += `        <AddressDetail>Desconhecido</AddressDetail>\n`;
  xml += `        <City>Desconhecido</City>\n`;
  xml += `        <Country>Desconhecido</Country>\n`;
  xml += `      </BillingAddress>\n`;
  xml += `      <ShipToAddress>\n`;
  xml += `        <AddressDetail>Desconhecido</AddressDetail>\n`;
  xml += `        <City>Desconhecido</City>\n`;
  xml += `        <Country>AO</Country>\n`;
  xml += `      </ShipToAddress>\n`;
  xml += `      <SelfBillingIndicator>0</SelfBillingIndicator>\n`;
  xml += `    </Customer>\n`;

  // Loop through actual clients
  response?.clientes?.filter((i) => Array.from(uniqueClientes).some((item) => item == i?.id))
    .forEach((cliente) => {
      xml += `    <Customer>\n`;
      xml += `      <CustomerID>${cliente?.nif || 999999999}</CustomerID>\n`;
      xml += `      <AccountID>Desconhecido</AccountID>\n`;
      xml += `      <CustomerTaxID>${cliente?.nif || "N/A"}</CustomerTaxID>\n`;
      xml += `      <CompanyName>${cliente?.nome}</CompanyName>\n`;
      xml += `      <Contact>Desconhecido</Contact>\n`;
      xml += `      <BillingAddress>\n`;
      xml += `        <AddressDetail>${cliente?.localizacao || "Desconhecido"}</AddressDetail>\n`;
      xml += `        <City>Desconhecido</City>\n`;
      xml += `        <Country>${cliente?.pais || "Desconhecido"}</Country>\n`;
      xml += `      </BillingAddress>\n`;
      xml += `      <ShipToAddress>\n`;
      xml += `        <AddressDetail>Desconhecido</AddressDetail>\n`;
      xml += `        <City>Desconhecido</City>\n`;
      xml += `        <Country>AO</Country>\n`;
      xml += `      </ShipToAddress>\n`;
      xml += `      <SelfBillingIndicator>0</SelfBillingIndicator>\n`;
      xml += `    </Customer>\n`;
    });

  // Products/Services
  Array.from(uniqueProdutos)
    .forEach((artigo) => {
      xml += `    <Product>\n`;
      xml += `      <ProductType>${artigo?.tipoArtigoFull?.designacao}</ProductType>\n`;
      xml += `      <ProductCode>${artigo?.id}</ProductCode>\n`;
      xml += `      <ProductGroup>Descochecido</ProductGroup>\n`;
      xml += `      <ProductDescription>${artigo?.designacao}</ProductDescription>\n`;
      xml += `      <ProductNumberCode>Descochecido</ProductNumberCode>\n`;
      xml += `    </Product>\n`;
    });

  // Tax Table

  xml += `    <TaxTable>\n`;
  response?.taxas.forEach((taxa) => {
    xml += `    <TaxTableEntry>\n`;
    xml += `      <TaxType>${taxa?.tipo}</TaxType>\n`;
    xml += `      <TaxCountryRegion>AO</TaxCountryRegion>\n`;
    xml += `      <TaxCode>${taxa?.codigo}</TaxCode>\n`;
    xml += `      <Description>${taxa?.descricao}</Description>\n`;
    xml += `      <TaxPercentage>${taxa?.taxa}</TaxPercentage>\n`;
    xml += `    </TaxTableEntry>\n`;
  });
  xml += `    </TaxTable>\n`;


  xml += `  </MasterFiles>\n\n`;

  // SOURCE DOCUMENTS
  xml += `  <SourceDocuments>\n`;
  xml += `    <SalesInvoices>\n`;
  xml += `      <NumberOfEntries>${[...(response?.documentos || [])].length}</NumberOfEntries>\n`;
    xml += `      <TotalDebit>${totalDebit.toFixed(2)}</TotalDebit>\n`;
  xml += `      <TotalCredit>${totalCredit.toFixed(2)}</TotalCredit>\n`;

  // Loop through documents
  [...(response?.documentos || [])].forEach((doc, index) => {
    xml += `      <Invoice>\n`;
    xml += `        <InvoiceNo>${doc?.numeroDocumento}</InvoiceNo>\n`;
    // DocumentStatus
    xml += `        <DocumentStatus>\n`;
    xml += `          <InvoiceStatus>N</InvoiceStatus>\n`;
    xml += `          <InvoiceStatusDate>${new Date(doc?.dataEmissao).toISOString()}</InvoiceStatusDate>\n`;
    xml += `        <SourceID>${doc?.cliente?.nome || 'Consumidor Final'}</SourceID>\n`;
    xml += `          <SourceBilling>${tipoSaft}</SourceBilling>\n`;
    xml += `        </DocumentStatus>\n`;
    // Hash info
    xml += `        <Hash>${doc?.hash}</Hash>\n`;
    xml += `        <HashControl>0</HashControl>\n`;
    // Period
    xml += `        <Period>${new Date(doc?.dataEmissao).getMonth() + 1}</Period>\n`;
    // Invoice date
    xml += `        <InvoiceDate>${new Date(doc?.dataEmissao).toISOString().split("T")[0]}</InvoiceDate>\n`;
    // Invoice type
    xml += `        <InvoiceType>${doc?.numeroDocumento?.split(" ")[0]}</InvoiceType>\n`;
    xml += `        <SpecialRegimes>\n`;
    xml += `          <SelfBillingIndicator>0</SelfBillingIndicator>\n`;
    xml += `          <CashVATSchemeIndicator>0</CashVATSchemeIndicator>\n`;
    xml += `          <ThirdPartiesBillingIndicator>0</ThirdPartiesBillingIndicator>\n`;
    xml += `        </SpecialRegimes>\n`;

    // xml += `        <SourceID>${doc?.cliente?.nome || 'Consumidor Final'}</SourceID>\n`;
      xml += `          <SystemEntryDate>${new Date(doc?.dataEmissao).toISOString()}</SystemEntryDate>\n`;


    // Customer ID
    xml += `        <CustomerID>${doc?.cliente?.nif || '999999999'}</CustomerID>\n`;

    if (doc?.produtos && [...(doc?.produtos || [])].length > 0) {
      [...(doc?.produtos || [])].forEach((item, lineIdx) => {
        xml += `        <Line>\n`;
        xml += `          <LineNumber>${lineIdx + 1}</LineNumber>\n`;
        xml += `          <ProductCode>${item?.produto?.id || "N/A"}</ProductCode>\n`;
        xml += `          <ProductDescription>${item?.produto?.designacao}</ProductDescription>\n`;
        xml += `          <Quantity>${item?.quantidade}</Quantity>\n`;
        xml += `          <UnitOfMeasure>${item?.produto?.unidadeFull ? item?.produto?.unidadeFull?.abreviacao : "N/A"}</UnitOfMeasure>\n`;
        xml += `          <UnitPrice>${item?.preco}</UnitPrice>\n`;
        xml += `          <TaxPointDate>${new Date(doc?.dataEmissao).toISOString().split("T")[0]}</TaxPointDate>\n`;
        xml += `          <Description>${item?.produto?.descricao}</Description>\n`;
        xml += `          <ProductSerialNumber><SerialNumber>Desconhecido</SerialNumber></ProductSerialNumber>\n`;
        
        if (['NCR', 'NC'].includes(doc?.numeroDocumento?.split(" ")[0])) {
          xml += `          <DebitAmount>${(parseFloat(`${item?.preco}`) * parseFloat(`${item?.quantidade}`))-parseFloat(`${item?.descontoFinal || 0}`)}</DebitAmount>\n`;
        }else {
          xml += `          <CreditAmount>${(parseFloat(`${item?.preco}`) * parseFloat(`${item?.quantidade}`))-parseFloat(`${item?.descontoFinal || 0}`)}</CreditAmount>\n`;
        }
        // Tax details
        xml += `          <Tax>\n`;
        xml += `            <TaxType>${item?.produto?.impostoFull ? item?.produto?.impostoFull?.tipo : "N/A"}</TaxType>\n`;
        xml += `            <TaxCountryRegion>AO</TaxCountryRegion>\n`;
        xml += `            <TaxCode>${item?.produto?.impostoFull ? item?.produto?.impostoFull?.codigo : "N/A"}</TaxCode>\n`;
        xml += `            <TaxPercentage>${item?.produto?.impostoFull ? item?.produto?.impostoFull?.taxa : "N/A"}</TaxPercentage>\n`;
        xml += `          </Tax>\n`;
        // Tax Exemption
        if (item?.produto?.isencaoFull?.id) {
          xml += `          <TaxExemptionReason>${item?.produto?.isencaoFull?.mencao_na_factura}</TaxExemptionReason>\n`;
          xml += `          <TaxExemptionCode>${item?.produto?.isencaoFull?.codigo}</TaxExemptionCode>\n`;
        } else {
          xml += `          <TaxExemptionReason></TaxExemptionReason>\n`;
          xml += `          <TaxExemptionCode></TaxExemptionCode>\n`;
        }
        xml += `          <SettlementAmount>0</SettlementAmount>\n`;
        xml += `        </Line>\n`;
      });
    }

    const totalNet = [...(doc?.produtos || [])].reduce((sum, itm) => sum + itm?.total, 0);
    console.trace('doc', doc)
    xml += `        <DocumentTotals>\n`;
    xml += `          <TaxPayable>${parseFloat(`${doc?.totalImpostos}`)}</TaxPayable>\n`;
    xml += `          <NetTotal>${(parseFloat(`${doc?.totalPagar}`) - parseFloat(`${doc?.totalImpostos}`)).toFixed(2)}</NetTotal>\n`;
    xml += `          <GrossTotal>${(parseFloat(`${doc?.totalPagar}`))}</GrossTotal>\n`;
    xml += `        </DocumentTotals>\n`;
    xml += `      </Invoice>\n`;
  });

  xml += `    </SalesInvoices>\n`;
  xml += `  </SourceDocuments>\n`;
  xml += `</AuditFile>`;

  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const filename = `${empresa?.nome_empresa}_SAFT_AO_de_${format(new Date(dateRange[0]), "dd/MM/yyyy")}_para_${format(new Date(dateRange[1]), "dd/MM/yyyy")}.xml`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

setLoadDoc(false);
toastSuccess("Documento exportado com sucesso!")
};
    return (
        <div className="dashboardContainer">
            <Loading1 loading={loadDoc}/>
            <div className="breadCrumb" style={{ background: "white" }}>
                <div className="title">
                    {"SAFT"}
                </div>
                <div className="dashboardContent">
                    Documentos AGT <div>{">"}</div> <span>SAFT</span>
                </div>
            </div>


            <div className="modalContent" style={{ backgroundColor: 'white', maxWidth: '500px', margin: 'auto', border: '1px solid #eeeeee' }}>
      <div className="form">
        <div className="row">
          {/* Uncomment if you need year selection
          <div className="col">
            <label>Ano de serviço</label>
            <select
              className="form-select"
              aria-label="Default select example"
              value={anoFiscal}
              onChange={handleAnoFiscalChange}
            >
              {anos.map((item, index) => (
                <option key={index} value={item?.ano}>
                  {item?.ano}
                </option>
              ))}
            </select>
          </div>
          */}
          
          <div className="col">
            <label style={{marginBottom: 10}}>Tipo de Saft</label>
            <select
              className="form-select"
              aria-label="Default select example"
              value={tipoSaft}
              onChange={(e) => {
                setTipoSaft(e.target.value)
              }}
            >
              <option value="F">Final</option>
              <option value="P">Parcial</option>
            </select>
          </div>
        </div>
        
        <div className="row">
          <div className="col">
            <label className="form-label">Seleccione um intervalo de dias</label>
             <div className="form-control" style={{padding: 0, outline: 0,}}>
                 <Flatpickr
                                          value={dateRange}
                                          options={{
                         mode: "range",
                         altInput: true,
                         altFormat: "d/m/Y",
                         dateFormat: "Y-m-d",
                         closeOnSelect: false
                       }}
                                          onChange={(dates) => {
                   if (dates.length === 2) {
                     setDateRange(dates);
                   }
                 }}
                                          placeholder="Seleccione um intervalo de dias"
                                          className="form-control"
                                          style={{border: 'none', outline: 'none'}}
                                        />
             </div>
          </div>
        </div>
      </div>

      {/* Errors display */}
      {errors.length > 0 && (
        <ul className="errors">
          {errors.map((err, index) => (
            <li key={index} className="error">{err}</li>
          ))}
        </ul>
      )}

      {/* Messages display */}
      {messages.length > 0 && (
        <ul className="messages">
          {messages.map((msg, index) => (
            <li key={index} className="message">{msg}</li>
          ))}
        </ul>
      )}

      <div className="col-lg-12">
        {!load ? (
          <div className="hstack gap-2 justify-content-end">
            {!done ? (
                <button
                                className="btn btn-primary btn-label"
                                style={{ fontSize: 14, borderRadius: 4 }}
                                onClick={() => {
                                    createDoc()
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>
                                Gerar
                            </button>
              
            ) : (
              !loadDoc ? (
                
                <button
                                className="btn btn-success btn-label"
                                style={{ fontSize: 14, borderRadius: 4 }}
                                onClick={() => {
                                    downloadExcel()
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>
                                Exportar SAFT
                            </button>
              ) : (
                <div className="hstack gap-2 justify-content-end">
                  <div 
                    className="spinner-border text-primary"
                    role="status"
                    style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="hstack gap-2 justify-content-end">
            <div 
              className="spinner-border text-primary"
              role="status"
              style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
        </div>
    )
}
export default Saft