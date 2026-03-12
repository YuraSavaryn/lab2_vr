import './style.css'
import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer, furnitureModel;

init();
renderLoop();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Активація підтримки XR [cite: 55, 190]
    container.appendChild(renderer.domElement);

    // Додаємо освітлення, щоб модель меблів була видимою [cite: 133, 175]
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const loader = new GLTFLoader();
    // ЗАМІНІТЬ НА ВАШЕ RAW ПОСИЛАННЯ З GITHUB [cite: 434]
    const modelPath = 'https://raw.githubusercontent.com/YuraSavaryn/lab2_vr/refs/heads/master/public/scene.gltf'; 

    loader.load(
        modelPath,
        (gltf) => {
            furnitureModel = gltf.scene;
            
            // Налаштування масштабу та позиції (1.5 метра від камери) [cite: 377, 472]
            furnitureModel.scale.set(0.5, 0.5, 0.5); 
            furnitureModel.position.set(0, 0, -1.5); 
            
            scene.add(furnitureModel);
            console.log("Модель успішно завантажена");
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% завантажено');
        },
        (error) => {
            console.error('Помилка завантаження моделі:', error);
        }
    );

    document.body.appendChild(ARButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function renderLoop() {
    renderer.setAnimationLoop(render); // Запуск циклу рендерингу WebXR [cite: 196, 217]
}

function render() {
    if (furnitureModel) {
        // Додаємо базову анімацію обертання [cite: 376, 411]
        furnitureModel.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}