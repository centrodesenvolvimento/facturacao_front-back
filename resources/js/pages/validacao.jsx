import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import "../../css/validacao.css";
import logo from "../../images/logo-sm.png";


const DocumentVerification = () => {
  const [data, setData] = useState(null)
    const formatCurrency = (value) => {
        if (value == null || value === undefined || value === "")
            return "AOA 0.00";
        return `AOA ${parseFloat(`${value}`).toLocaleString("en-US", {
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

    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
      try {
        console.log('in');
        const decodedData = atob(encodedData);
        const facturaData = JSON.parse(decodedData);
        setData(facturaData);
        
        console.log(facturaData);
      } catch (error) {
        // toastError('Error parsing document data')
        setData(null);
      }
    }
  }, []);
   
  const isValidDocument = () => {
    if (data?.tipoDocumento){
      if (data?.tipoDocumento == "Recibo"){
        return data?.numeroDocumento && 
           data?.dataEmissao && 
           data?.tipoDocumento && 
           data?.id;
      }else {
        return data?.numeroDocumento && 
           data?.totalPagar && 
           data?.dataEmissao && 
           data?.tipoDocumento && 
           data?.id;
      }
    }
    return false
  };
    const documentIsValid = isValidDocument();

    return (
        <div className="validacaoContainer">
      <div className="headerContainer">
        <div className="header">
          <div className="headerLogo">
            <img
              style={{ filter: 'brightness(0)' }}
              className="logo"
              src={logo}
              alt=""
            />
            <span><span style={{ color: '#009cd4' }}>Level</span>-Invoice</span>
          </div>

          <div className="headerText">
            <span>Verificação de Documento</span>
            <span>Comprovativo da autenticidade do documento</span>
          </div>
        </div>
        
        {documentIsValid ? (
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-all" viewBox="0 0 16 16">
  <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0"/>
  <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708"/>
</svg>
          </div>
        ) : (
          <div className="icon" style={{ color: 'red', borderColor: 'red' }}>
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>
          </div>
        )}
      </div>
      
      <div className="midContainer">
        <div className="numeroDoc">
          {documentIsValid ? data.numeroDocumento : "Documento Inválido"}
        </div>
        
        <div className="description">
          {documentIsValid ? (
            <>O documento <strong>{data.numeroDocumento}</strong> é válido.</>
          ) : (
            "Não foram encontrados quaisquer registos."
          )}
        </div>

        {documentIsValid && (
          <div className="stats">
            <div className="stat">
              <label>Data de Emissão</label>
              <div>{format(new Date(data.dataEmissao), 'dd/MM/yyyy')}</div>
            </div>
            <div className="stat">
              <label>{data?.tipoDocumento == 'Recibo' ? 'Total Pago' : 'Valor Total'}</label>
              <div>{data?.tipoDocumento == 'Recibo' ? formatCurrency(data?.totalPago) : formatCurrency(data.totalPagar)}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="footerContainer">
        <div className="subTtile">Sobre esta Página</div>
        <div className="description">
          Nesta página é possível validar se determinado documento foi de facto
          emitido pelo Level-Invoice.
        </div>

        <ul>
          <li>
            <label style={{ color: '#558f42' }}>Documento Válido</label><br />
            Se o documento for válido, esta página garante-lhe
            que o documento foi emitido em conformidade com a legislação em vigor,
            na data e com o valor indicados.
          </li>

          <li>
            <label style={{ color: 'red' }}>Documento Inválido</label><br />
            Se o documento não for válido, significa que o
            documento não foi emitido pelo software, não tendo por isso qualquer
            validade fiscal. Neste caso, agradecemos que nos remeta o documento,
            para que possamos agir em conformidade junto das autoridades
            competentes.
          </li>
        </ul>
      </div>
    </div>
    )
}
export default DocumentVerification