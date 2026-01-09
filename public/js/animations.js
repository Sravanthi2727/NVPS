// Check if GSAP is loaded before using it
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-logo", { opacity: 0, y: -20, duration: 0.8 });
  gsap.from(".hero-title", { opacity: 0, y: 40, duration: 1, delay: 0.3 });
  gsap.from(".hero-subtitle", { opacity: 0, y: 20, duration: 0.8, delay: 0.6 });
  gsap.from(".hero-cta", { opacity: 0, y: 20, duration: 0.8, delay: 0.9 });

  gsap.from(".why-robusta-box", {
    scrollTrigger: { trigger: ".why-robusta-section", start: "top 80%" },
    opacity: 0,
    y: 50,
    duration: 1
  });

  gsap.from(".signature-card", {
    scrollTrigger: { trigger: "#signature", start: "top 80%" },
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 0.8
  });

  gsap.from(".art-section", {
    scrollTrigger: { trigger: ".art-section", start: "top 85%" },
    opacity: 0,
    y: 30,
    duration: 0.8
  });

  /* ================= COFFEE VIDEO SECTION ================= */

  gsap.from(".coffee-video", {
    scrollTrigger: {
      trigger: ".coffee-video-section",
      start: "top 80%",
    },
    opacity: 0,
    scale: 1.05,
    duration: 1.4,
    ease: "power2.out"
  });

  gsap.from(".coffee-video-content .intro-eyebrow", {
    scrollTrigger: {
      trigger: ".coffee-video-section",
      start: "top 75%",
    },
    opacity: 0,
    y: 20,
    duration: 0.6,
    delay: 0.2
  });

  gsap.from(".coffee-video-content .section-title", {
    scrollTrigger: {
      trigger: ".coffee-video-section",
      start: "top 75%",
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.35
  });

  gsap.from(".coffee-video-content .section-text", {
    scrollTrigger: {
      trigger: ".coffee-video-section",
      start: "top 75%",
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.55
  });
} else {
  console.warn('GSAP or ScrollTrigger not loaded - animations disabled');
}
