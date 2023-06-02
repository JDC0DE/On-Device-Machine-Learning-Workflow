import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
//import * as tflite from "@tensorflow/tfjs-tflite";
import * as cocoSsd from "@tensorflow-models/coco-ssd";


// tflite.setWasmPath(
//     'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/'
//  );

//var PATH = "./node_modules/@tensorflow/tfjs-tflite/dist/";

const ParentContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ObjectDetectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const DetectorContainer = styled.div`
    min-width: 200px;
    height: 500px;
    border: 3px solid #fff;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`;

const TargetImg = styled.img`
    height: 100%;
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const SelectButton = styled.button`
    padding: 7px 10px;
    border: 2px solid transparent;
    background-color: #fff;
    color: #0a0f22;
    font-size: 16px;
    font-weight: 500;
    outline: none;
    margin-top: 2em;
    cursor: pointer;
    transition: all 260ms ease-in-out;

    &:hover {
    background-color: transparent;
    border: 2px solid #fff;
    color: #fff;
    }
`;

const TargetBox = styled.div`
    position: absolute;

    left: ${({x}) => x + "px"};
    top: ${({y}) => y + "px"};
    width: ${({width}) => width + "px"};
    height: ${({height}) => height + "px"};

    border: 4px solid green;
    background-color: transparent;
    z-index: 20;

    &::before {
        content: "${({ classType, score }) => `${classType} ${score.toFixed(1)}%`}";
        color: green;
        font-weight: 500;
        font-size: 17px;
        position: absolute;
        top: -1.5em;
        left: -5px;
    }
    
`
const OutputBox = styled.div`
    padding: 7px 10px;
    border: 2px solid transparent;
    background-color: #fff;
    color: #0a0f22;
    font-size: 16px;
    font-weight: 500;
    outline: none;
    margin-top: 2em;
    border-radius: 5px;

`

const TopItems = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    width: 60%;
    padding-right: 500px;
    padding-bottom: 40px;
`;

const Latency = styled.div`
    font-size: 16px;
    font-weight: 500;
    outline: none;
    margin-top: 2em;

`;

export function ObjectDetector(props){
    //console.error = () => {};

    //"C:\Users\joshu\OneDrive\Documents\Uni\COMP4092\COMP4092_FAIMS_Thesis_MML\Project\Demo\SSD_efficientDet_lite4.tflite"
    const LOCALPATH = 'C:/Users/joshu/OneDrive/Documents/Uni/COMP4092/COMP4092_FAIMS_Thesis_MML/Project/Demo/SSD_efficientDet_lite4.tflite';
    //const LOCALPATH = '\Project\Demo\SSD_efficientDet_lite4.tflite'
    

    const fileInputRef = useRef();
    const imageRef = useRef();
    const [imgData, setImgData] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [objects, setObjects] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [processTime, setProcessTime] = useState();

    const isEmptyPredictions = !predictions || predictions.length === 0;
    const isNoObjects = !objects || objects.length === 0;
    const isNoProcessTime = !processTime;

    
    const openFilePicker = () => {
        if(fileInputRef.current != null){
            fileInputRef.current.click();
        }
    };

    const normalisePredictions = (predictions, imgSize) => {
        if(!predictions || !imgSize || !imageRef){
            return predictions || [];
        }
        return predictions.map((prediction) => {

            const { bbox } = prediction;
            const oldx = bbox[0];
            const oldy = bbox[1];
            const oldWidth = bbox[2];
            const oldHeight = bbox[3];

            const imgWidth = imageRef.current.width;
            const imgHeight = imageRef.current.height;

            const x = (oldx * imgWidth) / imgSize.width;
            const y = (oldy * imgHeight) / imgSize.height;
            const width = (oldWidth * imgWidth) / imgSize.width;
            const height = (oldHeight * imgHeight) / imgSize.height;

            console.log("what is bbox", bbox);
            console.log("what is oldx,oldy,oldwidth,oldheight", oldx,oldy,oldWidth,oldHeight);
            console.log("what is x,y,width,height", x,y,width,height);

            return { ...prediction,  bbox: [x, y, width, height]};

        });
    }
// needs to be fixed for multiple detections also can add count for after probability to determine how many oranges - !!
    const normalisedPredictionsTFLite = (predictions, imgSize) => {
        if(!predictions || !imgSize || !imageRef){
            return predictions || [];
        }
        const result = [];
        const arrObjects = [];
        const numObjects = new Map();
        var count = 0;
        for(let i = 0; i < predictions.length; i++){
            const boundingBox = predictions[i].boundingBox;
            const className = predictions[i].classes[0].className;
            const probability = predictions[i].classes[0].probability;

            if(probability > 0.5){
                //nomralising for single image
                // const oldx = boundingBox.originX;
                // const oldy = boundingBox.originY;
                // const oldWidth = boundingBox.width;
                // const oldHeight = boundingBox.height;

                // const imgWidth = imageRef.current.width;
                // const imgHeight = imageRef.current.height;

                // const x = (oldx * imgWidth) / imgSize.width;
                // const y = (oldy * imgHeight) / imgSize.height;
                // const width = (oldWidth * imgWidth) / imgSize.width;
                // const height = (oldHeight * imgHeight) / imgSize.height;

                // console.log("what is predictions", predictions[i]);
                // console.log("what is oldx,oldy,oldwidth,oldheight", oldx,oldy,oldWidth,oldHeight);
                // console.log("what is x,y,width,height", x,y,width,height);

                if(!numObjects.has(className)){
                    count++;
                    numObjects.set(className, count);
                    count = 0;
                }
                else if(numObjects.has(className)){
                    var value = numObjects.get(className);
                    value++;
                    numObjects.set(className,value);
                    
                }
                
                result.push(predictions[i]);
                
               
            }

            

        }
        numObjects.forEach((values, keys) => {
            arrObjects.push({"class":keys, "value": values});
        })

        
        setObjects(arrObjects);
        
        console.log("what is result", result);
        return result.map((prediction) => {

            
            const { boundingBox } = prediction;
            console.log("checker", boundingBox);
            const oldx = boundingBox.originX;
            const oldy = boundingBox.originY;
            const oldWidth = boundingBox.width;
            const oldHeight = boundingBox.height;

            const imgWidth = imageRef.current.width;
            const imgHeight = imageRef.current.height;

            const x = (oldx * imgWidth) / imgSize.width;
            const y = (oldy * imgHeight) / imgSize.height;
            const width = (oldWidth * imgWidth) / imgSize.width;
            const height = (oldHeight * imgHeight) / imgSize.height;

            return { ...prediction, boundingBox: [x, y, width, height] };

        });
    }




    

    const options = {
        headers: {
          Authorization: "Bearer 6Q************"
        },
        mode: 'no-cors',
      };

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/octet-stream");
    var requestOptions = {
        method: "get",
        headers: myHeaders,
        redirect: "follow",
        mode: "no-cors",
        
    };

    // fetch("https://v1.nocodeapi.com/jdc0de/drive/tEMdBCRDYCWBhUhO/downloadFile?fileId=<1G8cgQGEXGyYWoyRN34XR3_AnriYHJ-sx>", requestOptions)
    //     .then(response => response.text())
    //     .then(result => console.log(result))
    //     .catch(error => console.log('error', error));

    const detectObjectsOnImage = async (imageElement, imgSize) => {
        //const model = await tflite.ObjectDetector.create(LOCALPATH);
        //const model = await tflite.ObjectDetector.create("https://storage.googleapis.com/tfhub-lite-models/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2.tflite");
        //const model = await tflite.ObjectDetector.create("https://v1.nocodeapi.com/jdc0de/drive/tEMdBCRDYCWBhUhO/downloadFile?fileId=<1G8cgQGEXGyYWoyRN34XR3_AnriYHJ-sx>", requestOptions);
        //const model = await tflite.ObjectDetector.create("https://file.io/3eSkvCMLOE66", options);
        const startTime = Date.now();
        const model = await cocoSsd.load({});
        const predictions = await model.detect(imageElement, 6);
        console.log(model);
        //const predictions = model.detect(imageElement);
        
        console.log("Predictions:", predictions)
        
        const normalisedPredictions = normalisePredictions(predictions, imgSize);
        //const normalisePredictionsTFLite = normalisedPredictionsTFLite(predictions, imgSize);
        //console.log("what is returned for norm", normalisedPredictions);
        setPredictions(normalisedPredictions);
        //setPredictions(normalisePredictionsTFLite);
        const endTime = Date.now() - startTime;
        setProcessTime(endTime);
        console.log("Predictions:", predictions);
        

    };

    const readImage = (file) => {
        return new Promise((result, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = () => result(fileReader.result);
            fileReader.onerror = () => reject(fileReader.error);
            fileReader.readAsDataURL(file); // reads data as bas64 - converts binary to natural language
        })
    };

    const onSelectImage = async (event) => {
        setPredictions([]);
        setLoading(true);

        const file = event.target.files[0];
        const imgData = await readImage(file);
        setImgData(imgData);

        const imageElement = document.createElement("img");
        imageElement.src = imgData;

        imageElement.onload = async () => {
            const imgSize = { width: imageElement.width, height: imageElement.height};
            await detectObjectsOnImage(imageElement, imgSize);
            setLoading(false);
        }
    };



    console.log("whats going on", predictions);
    console.log("the map", objects);

    return (
    <ParentContainer>
        <TopItems>
            {!isNoProcessTime && <Latency>Runtime Latency: {processTime} ms</Latency>}
        </TopItems>
        <ObjectDetectorContainer>
            <DetectorContainer>{imgData && <TargetImg src={imgData} ref={imageRef}/>}
            {!isEmptyPredictions && predictions.map((prediction, idx) => (
                    <TargetBox 
                    key={idx} 
                    x={prediction.bbox[0]} 
                    y={prediction.bbox[1]} 
                    width={prediction.bbox[2]} 
                    height={prediction.bbox[3]}
                    classType={prediction.class}
                    score={prediction.score*100}
                    />
                    
                ))}
            </DetectorContainer>
            <HiddenFileInput type="file" ref={fileInputRef} onChange={onSelectImage}/>
            <SelectButton onClick={openFilePicker}>{isLoading ? "Loading..." : "Select Image"}</SelectButton>
            {!isNoObjects && objects.map((object, idx) => (
                <OutputBox key={idx}>{object.class} : {object.value}</OutputBox>
            ))}
        </ObjectDetectorContainer>

    </ParentContainer>
        
        ); 

}




// normal tfjs
// {!isEmptyPredictions && predictions.map((prediction, idx) => (
//     <TargetBox 
//     key={idx} 
//     x={prediction.bbox[0]} 
//     y={prediction.bbox[1]} 
//     width={prediction.bbox[2]} 
//     height={prediction.bbox[3]}
//     classType={prediction.class}
//     score={prediction.score*100}
//     />
    
// ))

// tfjs-tflite
// {!isEmptyPredictions && 
//     <TargetBox 
    
//     x={predictions.originX} 
//     y={predictions.originY} 
//     width={predictions.width} 
//     height={predictions.height}
//     classType={predictions.classes[0].className}
//     score={predictions.classes[0].probability*100}
//     />
    
// }