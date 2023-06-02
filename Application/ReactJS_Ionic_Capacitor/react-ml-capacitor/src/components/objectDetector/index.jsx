import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as tflite from "@tensorflow/tfjs-tflite";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import Webcam from "react-webcam";


tflite.setWasmPath(
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/'
 );

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
    width: fit-content;
    min-width: 200px;
    height: 500px;
    border: 3px solid #fff;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`;

const ImageClassifierContainer = styled.div`
    width: fit-content;
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
    border-radius: 5px;
    

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
    outline: none;
    margin-top: 2em;
    border-radius: 5px;

`;
const Text = styled.div`
    color: #0a0f22;
    font-size: 16px;
    font-weight: 500;

`;

const CameraButton = styled.div`
    padding: 7px 10px;
    border: 2px solid transparent;
    width: fit-content;
    background-color: #fff;
    color: #0a0f22;
    font-size: 16px;
    font-weight: 500;
    outline: none;
    margin-top: 2em;
    border-radius: 5px;

    &:hover {
        background-color: transparent;
        border: 2px solid #fff;
        color: #fff;
        }
    

`;

const Buttons = styled.div`
    width: 50%;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    

`;

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
    // console.error = () => {};

    //"C:\Users\joshu\OneDrive\Documents\Uni\COMP4092\COMP4092_FAIMS_Thesis_MML\Project\Demo\SSD_efficientDet_lite4.tflite"
    const LOCALPATH = 'C:/Users/joshu/OneDrive/Documents/Uni/COMP4092/COMP4092_FAIMS_Thesis_MML/Project/Demo/SSD_efficientDet_lite4.tflite';
    //const LOCALPATH = '\Project\Demo\SSD_efficientDet_lite4.tflite'
    
    window.tmpStore = 0;

    const fileInputRef = useRef();
    const imageRef = useRef();
    const cameraInput = useRef();
    const [imgData, setImgData] = useState(null);
    const [imageObject, setImageObject] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [classification, setClassification] = useState();
    const [objects, setObjects] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [processTime, setProcessTime] = useState();
    const [objModelState, setObjModelState] = useState(false);
    const [imgModelState, setImgModelState] = useState(false);
    const [display, setDisplay] = useState(false);

    const isEmptyPredictions = !predictions || predictions.length === 0;
    const isEmptyClassification = !classification || classification.length === 0;
    const isNoObjects = !objects || objects.length === 0;
    const isNoProcessTime = !processTime;
    const isObjectDetection = objModelState;
    const isImageClassification = imgModelState;

    
    const openFilePicker = () => {
        if(fileInputRef.current != null){
            fileInputRef.current.click();
        }
    };

    const handleClick = () => {
        setDisplay(true);
        setPredictions([]);
        if(cameraInput.current!=null){
            cameraInput.current.click();
        }
    };

    const objDetectModelClick = () => {
        setImgModelState(false);
        setObjModelState(true);
        setProcessTime(null);
        setImgData(null);
        setObjects(null);
        setClassification(null);
        setPredictions(null);
        setLoading(null);
    }

    const imgClassModelClick = () => {
        setObjModelState(false);
        setImgModelState(true);
        setProcessTime(null);
        setImgData(null);
        setObjects(null);
        setPredictions(null);
        setClassification(null);
        setLoading(null);
    }

    const videoConstraints = {
        width: { min: 480 },
        height: { min: 720 },
        facingMode: { exact: "environment" }
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

    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return;
            }
            seen.add(value);
          }
          return value;
        };
      };


    const classifyImage = async (imageElement) => {
        const startTime = Date.now();
        // https://mldemofaimsbucket.s3.ap-southeast-2.amazonaws.com/tfLite_sequential.tflite
        // let tmp;
        // try{
        //     const request = indexedDB.open("imgModel", 1);
        //     tmp = await tflite.ImageClassifier.create("https://storage.googleapis.com/tfweb/models/mobilenet_v2_1.0_224_1_metadata_1.tflite");
        //     request.onupgradeneeded = (event) => {
        //         const db = event.target.result;
        //         const objectStore = db.createObjectStore("img", { keyPath: "ssn" });
        //         objectStore.transaction.oncomplete = (event) => {
        //             const mlObjectStore = db.transaction(tmp, "readwrite").objectStore(tmp);
        //             mlObjectStore.add(tmp);
        //         };
        //     };
        //     console.log(tmp);
        //     console.log(typeof(tmp));
        //     //let hold = JSON.stringify(tmp);
        //     //console.log(hold);
        //     localStorage.setItem("imgModel", tmp);

        // }
        // catch(error){
        //     console.log(error);
        //     tmp = localStorage.getItem("imgModel");
        //     console.log("localaccess",tmp["1"]);
        // }
        // const model = tmp
        //const model = await tflite.ImageClassifier.create("https://storage.googleapis.com/tfweb/models/mobilenet_v2_1.0_224_1_metadata_1.tflite");
        //const model = await tflite.ImageClassifier.create("https://mldemofaimsbucket.s3.ap-southeast-2.amazonaws.com/tfLite_mobilenetv3L_flowers.tflite",{maxResults:5});
        //const model = await tflite.ImageClassifier.create("https://mldemofaimsbucket.s3.ap-southeast-2.amazonaws.com/tfLite_mobilenetv3S_flowers.tflite");
        const model = await tflite.ImageClassifier.create("https://mldemofaimsbucket.s3.ap-southeast-2.amazonaws.com/tfLite_sequential.tflite");
        const classification = model.classify(imageElement);

        console.log("classified ", classification);
        setClassification(classification[0]);
        const endTime = Date.now() - startTime;
        setProcessTime(endTime);
    }

    const detectObjectsOnImage = async (imageElement, imgSize) => {
        const startTime = Date.now();
        //const model = objModel;
        //const model = await tflite.ObjectDetector.create("https://storage.googleapis.com/tfhub-lite-models/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2.tflite");
        const model = await tflite.ObjectDetector.create("https://mldemofaimsbucket.s3.ap-southeast-2.amazonaws.com/efd_4_uc_ha_bs8.tflite");
        //const model = await tflite.ObjectDetector.create("https://mldemofaimsbucket.s3.ap-southeast-2.amazonaws.com/SSD_efficientDet_lite4.tflite");
        //const model = await tflite.ObjectDetector.create("https://file.io/3eSkvCMLOE66", options);
        //const model = await cocoSsd.load({});
        //const predictions = await model.detect(imageElement, 6);
        console.log(model);
        const predictions = model.detect(imageElement);
        
        console.log("Predictions:", predictions)
        
        //const normalisedPredictions = normalisePredictions(predictions, imgSize);
        const normalisePredictionsTFLite = normalisedPredictionsTFLite(predictions, imgSize);
        //console.log("what is returned for norm", normalisedPredictions);
        //setPredictions(normalisedPredictions);
        setPredictions(normalisePredictionsTFLite);
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
        console.log("on select", imgData);
        setImgData(imgData);

        const imageElement = document.createElement("img");
        imageElement.src = imgData;

        imageElement.onload = async () => {
            const imgSize = { width: imageElement.width, height: imageElement.height};
            if(isObjectDetection){
                await detectObjectsOnImage(imageElement, imgSize);
            }
            if(isImageClassification){
                await classifyImage(imageElement);
            }
            setLoading(false);
        }
    };

    const onTakenImage = useCallback (async () => {
        setPredictions([]);
        setLoading(true);

        
        
        
        const imgData = window.tmpStore;
        console.log("on select", imgData);
        setImgData(imgData);

        const imageElement = document.createElement("img");
        imageElement.src = imgData;

        imageElement.onload = async () => {
            const imgSize = { width: imageElement.width, height: imageElement.height};
            if(isObjectDetection){
                await detectObjectsOnImage(imageElement, imgSize);
            }
            if(isImageClassification){
                await classifyImage(imageElement, imgSize);
            }
            setLoading(false);
        }
    },[imageObject, detectObjectsOnImage]);


    
    const handleImageChange = (event) => {
        setImageObject({
            imagePreview: URL.createObjectURL(event.target.files[0]),
            imageFile: event.target.files[0],
        });
    };

    const capture = useCallback(() => {
        const imageSrc = cameraInput.current.getScreenshot();
        window.tmpStore = imageSrc;
        setImageObject(imageSrc);
        console.log("GV", window.tmpStore);
        
        setDisplay(false);
        onTakenImage();
      }, [cameraInput, onTakenImage]);


    console.log("input img ", imageObject);
    console.log("whats going on", predictions);
    console.log("the map", objects);

    return (
    <ParentContainer>
        <TopItems>
            <SelectButton onClick={objDetectModelClick}>Object Counting</SelectButton>
            <SelectButton onClick={imgClassModelClick}>Image Classification</SelectButton>
            {!isNoProcessTime && <Latency>Runtime Latency: {processTime} ms</Latency>}
            
        </TopItems>
        <ObjectDetectorContainer>
            {isObjectDetection &&
            <><DetectorContainer>{display === false ? (imgData && <TargetImg src={imgData} ref={imageRef} />) :
                        (<Webcam audio={false} mirrored={false} height={400} width={400} ref={cameraInput} screenshotFormat="image/jpeg" videoConstraints={videoConstraints} />)}
                        {!isEmptyPredictions && predictions.map((prediction, idx) => (
                            <TargetBox
                                key={idx}
                                x={prediction.boundingBox[0]}
                                y={prediction.boundingBox[1]}
                                width={prediction.boundingBox[2]}
                                height={prediction.boundingBox[3]}
                                classType={prediction.classes[0].className}
                                score={prediction.classes[0].probability * 100} />

                        ))}
                    </DetectorContainer><HiddenFileInput type="file" ref={fileInputRef} onChange={onSelectImage} /><Buttons>
                            <SelectButton onClick={openFilePicker}>{isLoading ? "Loading..." : "Select Image"}</SelectButton>
                            {display === false ? (
                                <CameraButton onClick={handleClick}>
                                    <AddAPhotoIcon sx={{ color: '#1c2127' }}>
                                    </AddAPhotoIcon>
                                </CameraButton>
                            ) : (
                                <CameraButton onClick={capture}>
                                    Take Pic
                                </CameraButton>

                            )}
                        </Buttons>
            {!isNoObjects && <OutputBox>
            {!isNoObjects && objects.map((object, idx) => (
                object.class!=="Not_Counted_Objects"?<Text key={idx}>{object.class} : {object.value}</Text>:null
            ))}
            </OutputBox>}</>

            }
            {isImageClassification && 
            <><ImageClassifierContainer>
                {display === false ? (imgData && <TargetImg src={imgData} ref={imageRef} />) :
                        (<Webcam audio={false} mirrored={false} height={400} width={400} ref={cameraInput} screenshotFormat="image/jpeg" videoConstraints={videoConstraints} />)}
            </ImageClassifierContainer>
            <HiddenFileInput type="file" ref={fileInputRef} onChange={onSelectImage} /><Buttons>
                            <SelectButton onClick={openFilePicker}>{isLoading ? "Loading..." : "Select Image"}</SelectButton>
                            {display === false ? (
                                <CameraButton onClick={handleClick}>
                                    <AddAPhotoIcon sx={{ color: '#1c2127' }}>
                                    </AddAPhotoIcon>
                                </CameraButton>
                            ) : (
                                <CameraButton onClick={capture}>
                                    Take Pic
                                </CameraButton>

                            )}
                        </Buttons>
                        {!isEmptyClassification && <OutputBox>
                            {!isEmptyClassification && <Text>{classification.className} : {100*classification.probability.toFixed(2)}%</Text>}
                        </OutputBox>}
                                 
            </>

            }
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