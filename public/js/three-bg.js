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
  const beanTexture = loader.load("/assets/bean.png");

  const beans = [];

  // ✔ More beans, but still safe
  const BEAN_COUNT = window.innerWidth < 768 ? 30 : 46;

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

  function animate() {
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

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
