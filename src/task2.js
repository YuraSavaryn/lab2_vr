import './style.css'
import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer, model;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; 
    container.appendChild(renderer.domElement);

    // Світло для золотого матеріалу
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
    scene.add(light);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Посилання на модель
    const modelUrl = 'https://raw.githubusercontent.com/YuraSavaryn/lab2_vr/refs/heads/master/public/scene.gltf';

    const loader = new GLTFLoader();
    loader.load(
        modelUrl,
        (gltf) => {
            model = gltf.scene;

            // АВТО-МАСШТАБУВАННЯ: Робимо модель розміром 0.5 метра
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3()).length();
            const scale = 0.5 / size;
            model.scale.set(scale, scale, scale);

            // ПОЗИЦІЯ: 1.5 метра від камери, трохи нижче рівня очей
            model.position.set(0, -0.2, -1); 
            
            scene.add(model);
            console.log("Модель додана!");
        },
        undefined,
        (error) => console.error("Помилка завантаження:", error)
    );

    // Додаємо кнопку (вона знову з'явиться)
    document.body.appendChild(ARButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    if (model) {
        model.rotation.y += 0.01; // Обертання для демонстрації
    }
    renderer.render(scene, camera);
}