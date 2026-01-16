import Lottie from "lottie-react"

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "../components/ui/alert-dialog"
import loadingAnimation from "../../json/loading.json"


const Loading1 = ({loading}) => {
    return (
        <>
            {
                loading && <AlertDialog open={true}>
                    
                    <AlertDialogContent style={{flexDirection: 'column', display: 'flex', alignItems: 'center', textAlign: 'center', padding: 50, maxWidth: 350}}>
                    <div style={{display: 'none'}}>
                        <AlertDialogTitle></AlertDialogTitle>
                    </div>
                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                        style={{
                                            margin: "auto",
                                            marginTop: 20,
                                            width: 200,
                                            height: 200,
                                            borderWidth: 10,
                                            
                                        }}
                                    >
                                        <span className="sr-only">
                                            Loading...
                                        </span>
                                    </div>
                    </AlertDialogContent>
                </AlertDialog>
            }
        </>

    )
}
export default Loading1