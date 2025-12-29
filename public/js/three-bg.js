// Check if we're on the franchise page - if so, don't run Three.js background
const franchisePage = document.querySelector('.franchise-page');
if (franchisePage) {
  console.log('Franchise page detected - skipping Three.js background');
  // Hide the canvas if it exists
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    canvas.style.display = 'none';
  }
} else {
  // Original Three.js code for other pages
  const canvas = document.getElementById("bg-canvas");

  if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const loader = new THREE.TextureLoader();
  
  // Optimized texture loading with WebP support
  const loadOptimizedTexture = (basePath) => {
    return new Promise((resolve) => {
      // Try WebP first if supported
      if (window.imageOptimizer && window.imageOptimizer.supportsWebP) {
        const webpPath = basePath.replace(/\.(png|jpg|jpeg)$/, '.webp');
        const webpTexture = loader.load(
          webpPath,
          (texture) => resolve(texture),
          undefined,
          () => {
            // Fallback to original format
            const originalTexture = loader.load(basePath);
            resolve(originalTexture);
          }
        );
      } else {
        const originalTexture = loader.load(basePath);
        resolve(originalTexture);
      }
    });
  };

  // Load bean texture with optimization
  let beanTexture;
  loadOptimizedTexture("/assets/bean.png").then(texture => {
    beanTexture = texture;
    initializeBeans();
  });

  const beans = [];

  // ✔ More beans, but still safe
  const BEAN_COUNT = window.innerWidth < 768 ? 30 : 46;

  function initializeBeans() {
    if (!beanTexture) return;

    for (let i = 0; i < BEAN_COUNT; i++) {
      const material = new THREE.SpriteMaterial({
        map: beanTexture,
        transparent: true,
        opacity: Math.random() * 0.01 + 0.98,
      });

      const bean = new THREE.Sprite(material);
   
      // ✔ Spread across entire viewport
      bean.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6
      );

      // ✔ Smaller beans
      const scale = Math.random() * 0.35 + 0.25;
      bean.scale.set(scale, scale, 1);

      // ✔ Faster but still smooth
      bean.userData = {
        speed: Math.random() * 0.004 + 0.002,
        drift: Math.random() * 0.004,
        rotation: (Math.random() - 0.5) * 0.01,
      };

      scene.add(bean);
      beans.push(bean);
    }

    // Start animation after beans are loaded
    animate();
  }

  function animate() {
    if (beans.length === 0) return; // Don't animate until beans are loaded
    
    requestAnimationFrame(animate);

    beans.forEach((bean) => {
      bean.position.y += bean.userData.speed;
      bean.position.x += Math.sin(Date.now() * 0.001) * bean.userData.drift;
      bean.material.rotation += bean.userData.rotation;

      // recycle when out of view
      if (bean.position.y > 6) {
        bean.position.y = -6;
        bean.position.x = (Math.random() - 0.5) * 14;
      }
    });

    renderer.render(scene, camera);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
}
