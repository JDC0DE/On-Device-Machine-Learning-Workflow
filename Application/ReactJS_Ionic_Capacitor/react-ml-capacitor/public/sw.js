let cacheData="appV1";
this.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheData).then((cache)=> {
            cache.addAll([
                'static/js/bundle.js',
                'static/js/tflite_web_api_cc_simd.js',
                '/static/js/C:/Users/joshu/OneDrive/Documents/Uni/COMP4092/COMP4092_FAIMS_Thesis_MML/Project/Demo/react-ml-capacitor/',
                '/index.html',
                '/manifest.json',
                'favicon.ico',
                'logo192.png',
                '/'

            ])
        })
    )

});

this.addEventListener("fetch",(event)=>{
    if(!navigator.onLine){
        event.respondWith(
            caches.match(event.request).then((response)=>{
                if(response){
                    return response;
                }
                let requestURL = event.request.clone();
                fetch(requestURL);
            })
        )

    }
});