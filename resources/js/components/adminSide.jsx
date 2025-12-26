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
              window.location.href = '/dashboard'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grid-1x2-fill" viewBox="0 0 16 16">
  <path d="M0 1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm9 0a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zm0 9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1z"/>
</svg>
            Dashboard
            </div>}

            <Accordion type="single" collapsible>
              <AccordionItem style={{borderBottom: 'none', textDecoration: 'none'}} value="item-1">
                <AccordionTrigger style={{borderBottom: 'none', textDecoration: 'none'}} className={window.location.pathname.includes('/admin/sobre') ? 'option1' : 'option'}>
                  <span style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', fontSize: 14, fontWeight: 400}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-minus-fill" viewBox="0 0 16 16">
  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M6 8.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1"/>
</svg>
                    Documentos AGT
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div onClick={() => {
                    // navigate('/admin/sobre/sobre')
                  }} className={window.location.pathname.includes('admin/sobre/sobre') ? 'option3' :'option2'}>SAFT</div>
                  
                  <div className={window.location.pathname.includes('admin/sobre/estatutos') ? 'option3' :'option2'} onClick={() => {
                    // navigate('/admin/sobre/estatutos')
                  }}>Something</div>

                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {true && <div className={window.location.pathname.endsWith('/config') ? 'option1' : 'option'} onClick={() => {
              // navigate('/admin')
              localStorage.setItem('path', 'Configurarção')
              window.location.href = '/config'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
</svg>
            Configurações
            </div>}
            
        </div>
    )
}
export default AdminSide