import { useState } from "react"
import Loading1 from "../components/loading1"

const NovoDocumento = () => {
    const [load, setLoad] = useState(false)
    return (
        <div className="dashboardContainer">
            <Loading1 loading={load} />
            <div className="breadCrumb">
                <div className="title">Documentos</div>
                <div className="dashboardContent">
                    Facturas <div>{">"}</div> <span>Novo</span>
                </div>
            </div>
        </div>
    )
}
export default NovoDocumento