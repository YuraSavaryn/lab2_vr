import './style.css'
import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let container;
let camera, scene, renderer;
let reticle;
let controller;

let fruitModel = null; 
let placedFruits = []; // Масив для збереження всіх розставлених об'єктів

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
    hemisphereLight.position.set(0.5, 1, 0.25);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 4, 2);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    
    const modelUrl = 'https://raw.githubusercontent.com/YuraSavaryn/lab2_vr/refs/heads/master/public/luffy.gltf'; 

    loader.load(modelUrl, function (gltf) {
        fruitModel = gltf.scene;
        
        fruitModel.scale.set(0.1, 0.1, 0.1); 
        
        fruitModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });
    });

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    addReticleToScene();

    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"]
    });
    document.body.appendChild(button);
    renderer.domElement.style.display = "none";

    window.addEventListener("resize", onWindowResize, false);
}

function addReticleToScene() {
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial();
    reticle = new THREE.Mesh(geometry, material);
    
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
}

function onSelect() {
    if (reticle.visible && fruitModel) {
        const newFruit = fruitModel.clone();
        
        newFruit.position.setFromMatrixPosition(reticle.matrix);
        newFruit.rotation.y = Math.random() * Math.PI * 2;
        
        scene.add(newFruit);
        
        // Додаємо щойно створений фрукт у наш масив
        placedFruits.push(newFruit);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

async function initializeHitTestSource() {
    const session = renderer.xr.getSession(); 
    const viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
    localSpace = await session.requestReferenceSpace("local");
    hitTestSourceInitialized = true;
    
    session.addEventListener("end", () => {
        hitTestSourceInitialized = false;
        hitTestSource = null;
        placedFruits = []; // Очищаємо масив при виході з AR
    });
}

function render(timestamp, frame) {
    if (frame) {
        if (!hitTestSourceInitialized) {
            initializeHitTestSource();
        }
        
        if (hitTestSourceInitialized) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(localSpace);
                
                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {
                reticle.visible = false;
            }
        }
    }

    for (let i = 0; i < placedFruits.length; i++) {
        placedFruits[i].rotation.y += 0.02; // Швидкість обертання
    }

    renderer.render(scene, camera);
}