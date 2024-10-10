import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
  constructor(application) {
    this.application = application;
    this.sizes = application.sizes;
    this.scene = application.scene;
    this.canvas = application.canvas;

    this.cameraZPos = 1;
    this.defaultValues = {
      minDistance: 1.3,
      maxDistance: 6,
      position: {
        x: -1.5,
        z: -1,
        y: 1
      }
    };

    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(45, this.sizes.aspect, 0.1, 15);

    this.instance.position.set(-2.31, 0.93, 1.86);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.target.set(0, 0.5, 0);
    this.controls.enabled = true;
    this.controls.enablePan = false;

    this.controls.minDistance = 1;
    this.controls.maxDistance = 5;
    // Where to stop rotation :

    this.controls.minPolarAngle = 0.1; // radians
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
  }

  resize() {
    this.instance.aspect = this.sizes.aspect;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls && this.controls.update) this.controls.update();
  }
}
