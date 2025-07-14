import { OrbitControls, useTexture } from '@react-three/drei';
import { Canvas, useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import { forwardRef, Suspense, useImperativeHandle, useRef } from 'react';
import { SRGBColorSpace } from 'three';
import { DRACOLoader, GLTFLoader, DecalGeometry } from 'three/addons';
import './App.css';
import * as THREE from 'three';

function Background() {
  const { scene } = useThree();
  useTexture('./sky.png', (tex) => {
    tex.colorSpace = SRGBColorSpace; // 指定颜色空间，否则会偏色
    scene.background = tex; // 设置背景
  });
  return null;
}

interface ColorListProps {
  onColorChange: (color: string) => void;
}
function ColorList(props: ColorListProps) {
  const colors = [
    'red',
    'orange',
    'pink',
    'lightgreen',
    'lightblue',
    'yellow',
    'purple',
    'grey',
    'white',
    'green',
    'cyan',
    'blue'
  ];

  return (
    <div className="color-list">
      {colors.map((color) => {
        return (
          <div
            key={color}
            className="color-item"
            style={{ background: color }}
            onClick={() => props.onColorChange(color)}
          ></div>
        );
      })}
    </div>
  );
}

interface ImgListProps {
  onImgChange: (src: string) => void;
}
function ImgList(props: ImgListProps) {
  const imgs = ['./sky.png', './bg1.png', './bg2.png', './bg3.png', './bg4.png'];
  return (
    <div className="img-list">
      {imgs.map((url) => {
        return (
          <img key={url} className="img-item" src={url} width={80} height={80} onClick={() => props.onImgChange(url)} />
        );
      })}
    </div>
  );
}

function App() {
  const changeTshirtColorRef = useRef<TshirtRef>(null);

  return (
    <div>
      <Canvas
        camera={{
          position: [0, 0, 700]
        }}
        style={{
          width: window.innerWidth,
          height: window.innerHeight
        }}
      >
        <Background />
        <ambientLight />
        {/* <axesHelper args={[1000]} /> */}
        <directionalLight position={[0, 400, 100]} intensity={3} />
        <OrbitControls />
        <Suspense fallback={null}>
          <Tshirt ref={changeTshirtColorRef} />
        </Suspense>
      </Canvas>
      <div id="left-panel">
        <ColorList
          onColorChange={(color) => {
            changeTshirtColorRef.current?.changeTShirtColor(color);
          }}
        />
      </div>
      <div id="right-panel">
        <ImgList
          onImgChange={(src) => {
            changeTshirtColorRef.current?.changeTShirtPic(src);
          }}
        />
      </div>
    </div>
  );
}

interface TshirtRef {
  changeTShirtColor: (color: string) => void;
  changeTShirtPic: (src: string) => void;
}

const Tshirt = forwardRef<TshirtRef>((props, ref) => {
  // 模型压缩过，先解压缩
  const gltf = useLoader(GLTFLoader, 'tshirt.glb', (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
  });

  useImperativeHandle(ref, () => {
    return {
      changeTShirtColor,
      changeTShirtPic
    };
  });

  gltf.scene.scale.setScalar(1000);

  let texture: THREE.Texture;
  useTexture('./sky.png', (tex) => {
    tex.colorSpace = SRGBColorSpace;
    texture = tex;
  });

  const { scene } = useThree();

  function changeTShirtColor(color: string) {
    const mesh = scene.getObjectByName('tshirt') as THREE.Mesh;
    if (mesh) {
      (mesh.material as THREE.MeshBasicMaterial).color.set(color);
    }
  }

  function changeTShirtPic(src: string) {
    const mesh = scene.getObjectByName('pic') as THREE.Mesh;

    if (mesh) {
      const loader = new THREE.TextureLoader();
      loader.load(src, (texture) => {
        texture.colorSpace = SRGBColorSpace;
        (mesh.material as THREE.MeshBasicMaterial).map = texture;
      });
    }
  }

  return (
    <primitive
      object={gltf.scene}
      onClick={(evt: ThreeEvent<MouseEvent>) => {
        if (scene.getObjectByName('pic')) {
          return;
        }
        console.log(evt.point);
        const obj = evt.object as THREE.Mesh;
        const orientation = new THREE.Euler();
        const size = new THREE.Vector3(200, 200, 200);

        // const point = new THREE.Vector3(1.1792526624002881, 76.66948068833295, 130.03636416457033);
        const point = new THREE.Vector3(-10.13280644533589, -3.576284627765639, 132.9475744655756);

        const geometry = new DecalGeometry(obj, /* evt.point */ point, orientation, size);
        const material = new THREE.MeshPhongMaterial({
          polygonOffset: true,
          polygonOffsetUnits: -10,
          map: texture,
          transparent: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'pic';
        scene.add(mesh);
      }}
    ></primitive>
  );
});

export default App;
