import Lottie from "lottie-react"

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "../components/ui/alert-dialog"
import loadingAnimation from "../../json/loading.json"


const Loading1 = ({loading}) => {
    return (
        <>
            {
                loading && <AlertDialog open={true}>
                    
                    <AlertDialogContent style={{flexDirection: 'column', display: 'flex', alignItems: 'center', textAlign: 'center'}}>
                    <div style={{display: 'none'}}>
                        <AlertDialogTitle></AlertDialogTitle>
                    </div>
                    <Lottie rendererSettings={
        {
            preserveAspectRatio: 'xMidYMid slice'
        }
        } autoplay loop animationData={loadingAnimation} height={400} width={400}/>
                    </AlertDialogContent>
                </AlertDialog>
            }
        </>

    )
}
export default Loading1