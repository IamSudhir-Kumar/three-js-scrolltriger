import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
import model from "./model/model.glb";
import firstTexture from "./texture/13416.jpg";
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
    this.camera.position.set(1, -2, 3); // Adjusted camera position for a better initial view

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true; // Allow zoom for better viewing

    this.time = 0;
    this.paused = false;

    this.setupResize();
    this.addObjects();
    this.resize();
    this.render();

    this.loader = new GLTFLoader();
    this.loader.load(model, (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);
      this.model.scale.set(0.9, 0.9, 0.9);
      this.model.position.set(1, -0.6, 0);
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

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        firstTexture: { type: "t", value: new THREE.TextureLoader().load(firstTexture) },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment
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
        markers: true, // Add markers for debugging
      }
    });

    sections.forEach((section, index) => {
      const overlay = section.querySelector('.overlay');

      const angle = (index + 1) * (360 / sections.length);
      const radians = angle * (Math.PI / 180);

      tl.to(this.camera.position, {
        duration: 1,
        x: Math.sin(radians) * 10, // Increased camera orbit radius
        z: Math.cos(radians) * 10, // Increased camera orbit radius
        y: 3, // Adjusted camera height for a better view
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
    this.material.uniforms.time.value = this.time;
    this.controls.update();
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch("container");
