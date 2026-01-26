import { useState } from 'react'
import '../../css/adminSide.css'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"

import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'

const AdminSide = () => {

    return (
        <div className="adminSide">
            {true && <div className={window.location.pathname.endsWith('/dashboard') ? 'option1' : 'option'} onClick={() => {
              // navigate('/admin')
              localStorage.setItem('path', 'Dashboard')
              window.location.href = '/v1/dashboard'
            }}>
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg>
            Dashboard
            </div>}

            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem style={{borderBottom: 'none', textDecoration: 'none'}} value="item-1">
                <AccordionTrigger style={{borderBottom: 'none', textDecoration: 'none'}} className={window.location.pathname.includes('/dsfd') ? 'option1' : 'option'}>
                  <span style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 400, color: '#c8c8c8ff'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg>
                    Documentos AGT
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div onClick={() => {
                    // navigate('/admin/sobre/sobre')
                    localStorage.setItem('path', 'SAFT')
              window.location.href = '/v1/documentos/saft'
                  }} className={window.location.pathname.includes('documentos/saft') ? 'option3' :'option2'}> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg>SAFT</div>
                  
                  <div className={window.location.pathname.includes('admin/sobre/estatutos') ? 'option3' :'option2'} onClick={() => {
                    // navigate('/admin/sobre/estatutos')
                  }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg> Something</div>

                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {true && <div className={window.location.pathname.endsWith('/config') ? 'option1' : 'option'} onClick={() => {
              // navigate('/admin')
              localStorage.setItem('path', 'Configurarção')
              window.location.href = '/config'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg>
            Configurações
            </div>}
            
        </div>
    )
}
export default AdminSide