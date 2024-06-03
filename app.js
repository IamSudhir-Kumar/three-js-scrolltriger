import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from "dat.gui";
import model from "./model/model.glb";
import normalMap from "./texture/13416.jpg";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

let OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor("black", 1);

    this.container = document.getElementById("container");
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      90, // Increased FOV for a wider view
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(0, 0, 10); // Adjusted camera position for a better initial view

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true; // Allow zoom for better viewing

    this.time = 0;
    this.paused = false;

    this.setupResize();
    this.addLights();
    this.addObjects();
    this.resize();
    this.render();

    this.loader = new GLTFLoader();
    this.loader.load(model, (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);
      this.model.scale.set(1, 1, 1); // Medium size
      this.model.position.set(0, -8, -1); // Centered position, slightly downward
      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.material = this.material;
        }
      });

      this.setupScrollAnimations();
    });

    this.setupGUI();
  }

  setupGUI() {
    let that = this;
    this.settings = {
      time: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "time", 0, 100, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  addObjects() {
    const textureLoader = new THREE.TextureLoader();
    const normalTexture = textureLoader.load(normalMap);

    this.material = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.5,
      roughness: 0.5,
      normalMap: normalTexture
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(this.geometry, this.material);
  }

  setupScrollAnimations() {
    const sections = document.querySelectorAll('.section');

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".section",
        start: "top top",
        end: "+=" + (sections.length - 1) * window.innerHeight,
        scrub: true,
        pin: true,
        //markers: true, // Add markers for debugging
      }
    });

    sections.forEach((section, index) => {
      const overlay = section.querySelector('.overlay');

      const angle = (index + 1) * (360 / sections.length);
      const radians = angle * (Math.PI / 180);

      tl.to(this.camera.position, {
        duration: 1,
        x: Math.sin(radians) * 15, // Increased camera orbit radius
        z: Math.cos(radians) * 15, // Increased camera orbit radius
        y: 5, // Adjusted camera height for a better view
        ease: "power1.inOut",
        onUpdate: () => {
          this.camera.lookAt(this.model.position);
        }
      }, index * 1);

      tl.to(overlay, {
        opacity: 1,
        start: "+=" + (index * window.innerHeight),
        end: "+=" + ((index + 1) * window.innerHeight),
        ease: "none"
      }, index * 1);
    });
  }

  stop() {
    this.paused = true;
  }

  play() {
    this.paused = false;
    this.render();
  }

  render() {
    if (this.paused)
      return;
    this.time += 0.05;
    this.controls.update();
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch("container");
