export default function serviceWorkerDev(){
    
    let swURL = `${process.env.PUBLIC_URL}/sw.js`;
    navigator.serviceWorker.register(swURL).then((response)=>{
         console.warn("response ", response);
    });
}