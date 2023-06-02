import logo from './logo.svg';
import './App.css';
import styled from "styled-components";
import { ObjectDetector }  from './components/objectDetector';
// import * as tflite from "@tensorflow/tfjs-tflite";

// tflite.setWasmPath(
//   'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/'
// );

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #1c2127;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

function App() {
  console.log = console.warn = console.error = () => {};
  return (
    <AppContainer>
      <ObjectDetector/>
    </AppContainer>
  );
}

export default App;
