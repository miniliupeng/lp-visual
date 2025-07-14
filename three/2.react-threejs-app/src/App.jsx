import './App.css';
import { useEffect, useRef, useState } from 'react';
import { init } from './3d-init';

function App() {
  const changeHorseColorRef = useRef(() => {});
  const [str, setStr] = useState('');
  useEffect(() => {
    const dom = document.getElementById('content');
    const { changeHorseColor } = init(dom, setStr);

    changeHorseColorRef.current = changeHorseColor;

    return () => {
      dom.innerHTML = '';
    };
  }, []);

  return (
    <div>
      <div id="header">React 和 Three.js</div>
      <div id="main">
        <div id="content"></div>
        <div id="operate">
          <button
            onClick={() => {
              changeHorseColorRef.current('pink');
            }}
          >
            粉色
          </button>
          <button
            onClick={() => {
              changeHorseColorRef.current('lightgreen');
            }}
          >
            绿色
          </button>
          <button
            onClick={() => {
              changeHorseColorRef.current('lightblue');
            }}
          >
            蓝色
          </button>
        </div>
        <div>{str}</div>
      </div>
    </div>
  );
}

export default App;
