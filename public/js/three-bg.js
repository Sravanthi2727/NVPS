const canvas = document.getElementById("bg-canvas");

if (canvas && window.THREE) {

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const loader = new THREE.TextureLoader();

  // ✅ LOCAL COFFEE BEAN PNG
  const beanTexture = loader.load(
    "/assets/bean.png",
    () => console.log("Bean texture loaded"),
    undefined,
    err => console.error("Bean texture error", err)
  );

  const beans = [];
  const COUNT = window.innerWidth < 768 ? 22 : 36;

  for (let i = 0; i < COUNT; i++) {
    const material = new THREE.SpriteMaterial({
      map: beanTexture,
      transparent: true,
      opacity: Math.random() * 0.4 + 0.45
    });

    const bean = new THREE.Sprite(material);

    bean.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 6 - 3,
      Math.random() * 2
    );

    const scale = Math.random() * 0.45 + 0.25;
    bean.scale.set(scale, scale, 1);

    bean.userData = {
      speed: Math.random() * 0.008 + 0.004,
      rotation: (Math.random() - 0.5) * 0.04,
      drift: Math.random() * 0.002
    };

    scene.add(bean);
    beans.push(bean);
  }

  function animate() {
    requestAnimationFrame(animate);

    beans.forEach(bean => {
      bean.position.y -= bean.userData.speed;
      bean.position.x += Math.sin(Date.now() * 0.001) * bean.userData.drift;
      bean.material.rotation += bean.userData.rotation;

      if (bean.position.y < -3) {
        bean.position.y = 3;
        bean.position.x = (Math.random() - 0.5) * 10;
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
