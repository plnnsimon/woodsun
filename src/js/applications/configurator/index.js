import * as THREE from 'three';
import Camera from './utils/Camera.js';
import Renderer from './utils/Renderer.js';
import SceneLights from './helpers/SceneLights.js';
// import * as dat from "dat.gui";
import Sizes from './utils/Sizes.js';
import ModelLoader from '../../../pkg/utils/GLTFLoader.js';
import ThreejsApplication from '../../../pkg/ThreejsApplication.js';
import useModelsUtils from '../../../pkg/utils/use-models-utils.js';

let instance = null;
const { disposeSceneData, setAnimation } = useModelsUtils();

export class ConfiguratorApplication extends ThreejsApplication {
  constructor(eventEmitter) {
    super();

    if (instance) return instance;
    instance = this;

    this.camera = null;
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.debugObject = {};
    this.canvas = null;
    this.canvasDomElement = null;
    this.loadedModel = null;
    this.editMode = false;
    this.eventEmitter = eventEmitter;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.intersected = null;
    this.intersects = [];
    this.canIntersect = true;
    this.showRangeMaterialList = false;
    this.sizes = null;
    // this.gui = new dat.GUI();
    // this.gui = null
    this.sceneLights = new SceneLights(this);

    this.fps = 30;
    this.interval = 1000 / this.fps;
    this.then = Date.now();
  }

  async build(canvas, canvasDomElement) {
    this.canvas = canvas;
    this.canvasDomElement = canvasDomElement;
    this.sizes = new Sizes(canvasDomElement);

    this.camera = new Camera(this);
    this.renderer = new Renderer(this, true);

    // resize event
    this.resize();
    this.sizes.subscribe('resize', () => {
      this.resize();
    });

    this.cameraInfo = document.getElementById('cameraInfo');
  }

  /**
   * INITIALIZATION
   */
  animateFrame() {
    setAnimation(this);

    this.updateCameraInfoHtml();
  }

  updateCameraInfoHtml() {
    if (!this.cameraInfo || !this.camera) {
      return;
    }
    const cameraPos = this.camera.instance.position;

    this.cameraInfo.innerHTML = `
      <span>X: ${cameraPos.x.toFixed(2)}</span>
      <span>Y: ${cameraPos.y.toFixed(2)}</span>
      <span>Z: ${cameraPos.z.toFixed(2)}</span>
    `;
  }

  resize() {
    this.camera.resize();

    const now = Date.now();
    const elapsed = now - this.then;

    if (elapsed > this.interval) {
      this.renderer.resize();
    }
  }

  /**
   * LOAD MODEL
   */
  async initGLTFLoader(url) {
    const loader = new ModelLoader('', this);

    this.loadedModel = await loader.initGLTFLoader(url);
    this.scene.add(this.loadedModel.scene);
    console.log(this.loadedModel, ' this.loadedModel');

    this.loadedModel.scene.traverse((el) => {
      if (el.isMesh) {
        el.castShadow = true;
        el.receiveShadow = true;
      }
    });

    // this.setIntersects();

    // const geometry = new THREE.PlaneGeometry(10, 10);
    // const material = new THREE.ShadowMaterial({
    //   color: 0xffffff,
    //   side: THREE.DoubleSide,
    //   opacity: 0.8
    // });
    // const plane = new THREE.Mesh(geometry, material);
    // plane.rotation.x = Math.PI / 2;
    // plane.position.y = -0.1;
    // plane.receiveShadow = true;
    // this.scene.add(plane);

    this.scene.traverse((el) => {
      if (el.name.includes('wood')) {
        // this.gui.add(el.material, 'roughness', 0, 1, 0.001)
        // this.gui.add(el.material, 'metalness', 0, 1, 0.001)
        // el.material.roughness = 0.45
        // el.material.metalness = 0.95
      }

      if (el.name.includes('fabric')) {
        // this.gui.add(el.material, 'emissiveIntensity', 0, 10, 0.001).name('Fabric R')
        // this.gui.add(el.material, 'metalness', 0, 1, 0.001).name('Fabric M')
        // el.material.roughnessMap = null
        // el.material.metalnessMap = null
        el.material.emissiveIntensity = 1;
      }
    });

    this.eventEmitter.notify('setInitFinished');

    setTimeout(() => {
      this.resize();
    }, 200);
  }

  setTexture(texturePath, name) {
    const mapTexture = new THREE.TextureLoader().load(texturePath);
    console.log(mapTexture, ' mapTexture');
    mapTexture.generateMipmaps = false;
    mapTexture.wrapS = mapTexture.wrapT = THREE.RepeatWrapping;
    if (name === 'wood') {
      mapTexture.repeat.set(3, 3);
    }
    if (name === 'fabric') {
      mapTexture.repeat.set(5, 5);
    }
    mapTexture.flipY = false;
    // // mapTexture.offset.set(0.5, 0.5);
    // mapTexture.minFilter = THREE.LinearFilter;
    // mapTexture.magFilter = THREE.LinearFilter;

    if (!mapTexture) {
      return;
    }

    this.scene.traverse((el) => {
      if (el.name.toLowerCase().includes(name)) {
        // if (name === 'wood') {
        //   el.material.roughness = 0.8
        //   el.material.metalness = 1
        // }
        if (name === 'fabric') {
          el.material.roughness = 1;
          el.material.metalness = 0.9;
        }
        el.material.map = mapTexture;
        el.material.needsUpdate = true;
      }
    });
  }

  setColor(color, name) {
    this.scene.traverse((el) => {
      if (el.name.toLowerCase().includes(name)) {
        // el.material.color = new THREE.Color(color)
        el.material.emissive = new THREE.Color(color);
        el.material.needsUpdate = true;
      }
    });
  }

  setIntensity(value, name) {
    this.scene.traverse((el) => {
      if (el.name.toLowerCase().includes(name)) {
        // el.material.color = new THREE.Color(color)
        el.material.emissiveIntensity = value;
        el.material.needsUpdate = true;
      }
    });
  }
}
