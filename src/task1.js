import './style.css'
import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let camera, scene, renderer;
let torusMesh, sphereMesh, coneMesh; 
let controls;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Сцена
    scene = new THREE.Scene();

    // Камера [cite: 163]
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    // Об'єкт рендерингу [cite: 163]
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Активація WebXR [cite: 55, 190]
    renderer.xr.enabled = true; 
    container.appendChild(renderer.domElement);
            
    // Світло (необхідне для відображення матеріалів MeshStandardMaterial) [cite: 169, 175]
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4); 
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); 
    scene.add(ambientLight);
    
    // 1. TorusGeometry (Зелений тор)
    const torusGeometry = new THREE.TorusGeometry(0.3, 0.1, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00, 
        metalness: 0.7,
        roughness: 0.2
    });
    torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.position.set(-1, 0, -2);
    scene.add(torusMesh);

    // 2. SphereGeometry (Оновлена сфера - тепер рух буде помітним)
    // Зменшуємо кількість сегментів (наприклад, 12 на 12), щоб було видно грані
    const sphereGeometry = new THREE.SphereGeometry(0.4, 12, 12); 
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4500, // Яскраво-помаранчевий
        wireframe: true, // Включаємо відображення сітки, щоб бачити кожен поворот 
        emissive: 0xff4500,
        emissiveIntensity: 0.5
    });
    sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(0, 0, -2);
    scene.add(sphereMesh);

    // 3. ConeGeometry (Синій конус)
    const coneGeometry = new THREE.ConeGeometry(0.4, 0.8, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000ff,
        metalness: 0.9,
        roughness: 0.4
    });
    coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(1, 0, -2);
    scene.add(coneMesh);

    // Початкова позиція камери для веб-перегляду
    camera.position.z = 3;

    // Контролери OrbitControls (тільки для браузера)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Кнопка входу в AR [cite: 193, 194]
    document.body.appendChild(ARButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render); // Використовуємо setAnimationLoop для WebXR [cite: 196, 197]
}

function render() {
    controls.update();
    rotateObjects(); // Базова анімація [cite: 376, 389]
    renderer.render(scene, camera);
}
    
function rotateObjects() {
    // Анімація обертання для кожної фігури
    torusMesh.rotation.y += 0.01;

    sphereMesh.rotation.x += 0.01;
    
    coneMesh.rotation.z += 0.01;
    coneMesh.rotation.y += 0.01;
}