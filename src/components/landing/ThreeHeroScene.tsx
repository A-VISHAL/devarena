import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Ambient & Interactive Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0x1a2022, 2.0);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xe6a746, 10, 60);
    amberLight.position.set(8, 6, 10);
    scene.add(amberLight);

    const tealLight = new THREE.PointLight(0x83b6a3, 8, 60);
    tealLight.position.set(-8, -6, 8);
    scene.add(tealLight);

    // 3. Ambient Atmospheric 3D Group (Positioned to frame the viewport without occluding UI)
    const backgroundGroup = new THREE.Group();
    scene.add(backgroundGroup);

    // Wireframe Icosahedron (Top-Right Atmospheric Accent)
    const icosaGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const icosaMat = new THREE.MeshStandardMaterial({
      color: 0x141719,
      emissive: 0xe6a746,
      emissiveIntensity: 0.35,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
    icosaMesh.position.set(10.5, 4.5, -4);
    backgroundGroup.add(icosaMesh);

    // Wireframe Dodecahedron (Bottom-Left Atmospheric Accent)
    const dodecaGeo = new THREE.DodecahedronGeometry(1.8, 0);
    const dodecaMat = new THREE.MeshStandardMaterial({
      color: 0x141719,
      emissive: 0x83b6a3,
      emissiveIntensity: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    dodecaMesh.position.set(-11, -4.5, -3);
    backgroundGroup.add(dodecaMesh);

    // Wireframe Octahedron (Top-Left Background Accent)
    const octaGeo = new THREE.OctahedronGeometry(1.4, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x141719,
      emissive: 0xe6a746,
      emissiveIntensity: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const octaMesh = new THREE.Mesh(octaGeo, octaMat);
    octaMesh.position.set(-9, 5.5, -5);
    backgroundGroup.add(octaMesh);

    // Delicate Large Orbital Celestial Ring (Frames background gently with low opacity)
    const ringGeo = new THREE.TorusGeometry(12, 0.025, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe6a746, transparent: true, opacity: 0.15 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3.2;
    ringMesh.position.set(2, 0, -6);
    backgroundGroup.add(ringMesh);

    // 4. Glowing 3D Particle Starfield
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorAmber = new THREE.Color(0xe6a746);
    const colorTeal = new THREE.Color(0x83b6a3);
    const colorWhite = new THREE.Color(0xf2f0e9);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 36;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const c = Math.random() > 0.6 ? colorAmber : Math.random() > 0.4 ? colorTeal : colorWhite;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interactive Mouse Motion Tracking with smooth lerping
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) / windowHalfX;
      mouseY = (e.clientY - windowHalfY) / windowHalfY;

      targetRotationY = mouseX * 0.25;
      targetRotationX = mouseY * 0.2;

      // Move point lights dynamically in 3D
      amberLight.position.x = 8 + mouseX * 6;
      amberLight.position.y = 6 - mouseY * 6;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous subtle parallax rotation
        backgroundGroup.rotation.y += (targetRotationY - backgroundGroup.rotation.y) * 0.04;
        backgroundGroup.rotation.x += (targetRotationX - backgroundGroup.rotation.x) * 0.04;

        // Rotate ambient polyhedra
        icosaMesh.rotation.x = elapsedTime * 0.15;
        icosaMesh.rotation.y = elapsedTime * 0.2;
        icosaMesh.position.y = 4.5 + Math.sin(elapsedTime * 1.2) * 0.35;

        dodecaMesh.rotation.x = -elapsedTime * 0.18;
        dodecaMesh.rotation.y = -elapsedTime * 0.15;
        dodecaMesh.position.y = -4.5 + Math.cos(elapsedTime * 1.1) * 0.35;

        octaMesh.rotation.y = elapsedTime * 0.22;
        octaMesh.position.y = 5.5 + Math.sin(elapsedTime * 0.9) * 0.25;

        ringMesh.rotation.z = elapsedTime * 0.03;

        // Orbit particles slowly
        particles.rotation.y = elapsedTime * 0.025;
        particles.rotation.x = Math.sin(elapsedTime * 0.015) * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 8. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      icosaGeo.dispose();
      icosaMat.dispose();
      dodecaGeo.dispose();
      dodecaMat.dispose();
      octaGeo.dispose();
      octaMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none -z-0 overflow-hidden" 
      aria-hidden="true"
    />
  );
};
