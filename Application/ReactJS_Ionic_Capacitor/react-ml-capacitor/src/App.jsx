import logo from './logo.svg';
import './App.css';
import styled from "styled-components";
import { ObjectDetector }  from './components/objectDetector/index';
import { MobileObjectDetector } from './components/mobileapp';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import * as tflite from "@tensorflow/tfjs-tflite";

tflite.setWasmPath(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/'
);

const AppContainer = styled.div`
  margin: 0% auto;
  padding-top:'env(safe-area-inset-top)';
  padding-bottom: 'env(safe-area-inset-bottom)';
  padding-left: 'env(safe-area-inset-left)';
  padding-right: 'env(safe-area-inset-right)';
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

const MobileAppContainer = styled.div`
  margin: 0% auto;
  padding-top:'env(safe-area-inset-top)';
  padding-bottom: 'env(safe-area-inset-bottom)';
  padding-left: 'env(safe-area-inset-left)';
  padding-right: 'env(safe-area-inset-right)';
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
  const isMobileDevice = useMediaQuery({
    query: "(min-device-width: 480px)",
    query: "(max-device-width: 767px)",
  });

  const isTabletDevice = useMediaQuery({
    query: "(min-device-width: 768px)",
    query: "(max-device-width: 1023px)",
  });

  const isLaptop = useMediaQuery({
    query: "(min-device-width: 1024px)",
  });

  const isDesktop = useMediaQuery({
    query: "(min-device-width: 1200px)",
  });

  const isBigScreen = useMediaQuery({
    query: "(min-device-width: 1201px )",
  });


  return (
    <>
    {(isLaptop || isDesktop || isBigScreen) &&
      <AppContainer>
        <ObjectDetector/>
      </AppContainer>
    }

    {(isMobileDevice || isTabletDevice) &&
      <MobileAppContainer>
        <MobileObjectDetector/>
      </MobileAppContainer>
    }
    
    </>
  );
}

export default App;
