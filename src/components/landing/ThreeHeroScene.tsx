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
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x22282a, 2.5);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xe6a746, 12, 50);
    amberLight.position.set(6, 6, 8);
    scene.add(amberLight);

    const tealLight = new THREE.PointLight(0x83b6a3, 8, 50);
    tealLight.position.set(-8, -6, 6);
    scene.add(tealLight);

    // 3. Central 3D Interactive Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Core 3D Puzzle Cubes (A cluster of 3D floating nodes)
    const cubeGroup = new THREE.Group();
    mainGroup.add(cubeGroup);

    const cubeGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const cubeMatAmber = new THREE.MeshStandardMaterial({
      color: 0x1d2224,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xe6a746,
      emissiveIntensity: 0.2
    });

    const cubeMatTeal = new THREE.MeshStandardMaterial({
      color: 0x1a2022,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x83b6a3,
      emissiveIntensity: 0.25
    });

    const wireMatAmber = new THREE.LineBasicMaterial({ color: 0xffbd62, transparent: true, opacity: 0.8 });
    const wireMatTeal = new THREE.LineBasicMaterial({ color: 0x83b6a3, transparent: true, opacity: 0.7 });

    const cubeEdges = new THREE.EdgesGeometry(cubeGeo);

    // Position an offset matrix of dimensional gaming/code cubes
    const cubePositions = [
      { x: -1.8, y: 1.2, z: 0.5, mat: cubeMatAmber, wire: wireMatAmber },
      { x: 1.8, y: -1.2, z: -0.5, mat: cubeMatTeal, wire: wireMatTeal },
      { x: 0, y: 0, z: 1.8, mat: cubeMatAmber, wire: wireMatAmber },
      { x: -2.2, y: -1.6, z: 1.2, mat: cubeMatTeal, wire: wireMatTeal },
      { x: 2.2, y: 1.6, z: -1.2, mat: cubeMatAmber, wire: wireMatAmber }
    ];

    const cubes: THREE.Mesh[] = [];
    cubePositions.forEach((cp) => {
      const mesh = new THREE.Mesh(cubeGeo, cp.mat);
      mesh.position.set(cp.x, cp.y, cp.z);
      const wireframe = new THREE.LineSegments(cubeEdges, cp.wire);
      mesh.add(wireframe);
      cubeGroup.add(mesh);
      cubes.push(mesh);
    });

    // 4. Orbital 3D Geometric Tokens (Icosahedron, Dodecahedron, Torus)
    const icosaGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const icosaMat = new THREE.MeshStandardMaterial({
      color: 0x141719,
      emissive: 0xe6a746,
      emissiveIntensity: 0.4,
      wireframe: true
    });
    const icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
    icosaMesh.position.set(-4.5, 3.2, -2);
    mainGroup.add(icosaMesh);

    const dodecaGeo = new THREE.DodecahedronGeometry(1.1, 0);
    const dodecaMat = new THREE.MeshStandardMaterial({
      color: 0x141719,
      emissive: 0x83b6a3,
      emissiveIntensity: 0.45,
      wireframe: true
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    dodecaMesh.position.set(4.8, -3.2, -2);
    mainGroup.add(dodecaMesh);

    // Thin elegant orbital rings
    const ringGeo = new THREE.TorusGeometry(5.2, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe6a746, transparent: true, opacity: 0.35 });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    mainGroup.add(ringMesh1);

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x83b6a3, transparent: true, opacity: 0.3 });
    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat2);
    ringMesh2.rotation.y = Math.PI / 2.5;
    mainGroup.add(ringMesh2);

    // 5. 3D Floating Particle Constellation
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorAmber = new THREE.Color(0xe6a746);
    const colorTeal = new THREE.Color(0x83b6a3);
    const colorWhite = new THREE.Color(0xf2f0e9);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 28;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const c = Math.random() > 0.5 ? colorAmber : Math.random() > 0.5 ? colorTeal : colorWhite;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse Motion Tracking with smooth lerping
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) / windowHalfX;
      mouseY = (e.clientY - windowHalfY) / windowHalfY;

      targetRotationY = mouseX * 0.45;
      targetRotationX = mouseY * 0.35;

      // Move point lights dynamically in 3D
      amberLight.position.x = 6 + mouseX * 5;
      amberLight.position.y = 6 - mouseY * 5;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous slow floating rotation
        mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
        mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

        // Gentle floating orbit for cubes
        cubeGroup.rotation.y = elapsedTime * 0.25;
        cubeGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;

        cubes.forEach((cube, i) => {
          cube.rotation.x = elapsedTime * 0.4 * (i % 2 === 0 ? 1 : -1);
          cube.rotation.y = elapsedTime * 0.3 * (i % 3 === 0 ? 1 : -1);
          cube.position.y += Math.sin(elapsedTime * 1.5 + i) * 0.003;
        });

        // Rotate geometric tokens
        icosaMesh.rotation.x += 0.008;
        icosaMesh.rotation.y += 0.01;
        icosaMesh.position.y = 3.2 + Math.sin(elapsedTime * 1.2) * 0.3;

        dodecaMesh.rotation.x -= 0.009;
        dodecaMesh.rotation.y -= 0.008;
        dodecaMesh.position.y = -3.2 + Math.cos(elapsedTime * 1.4) * 0.3;

        // Orbit rings
        ringMesh1.rotation.z += 0.004;
        ringMesh2.rotation.z -= 0.005;

        // Swarm particles
        particles.rotation.y = elapsedTime * 0.04;
        particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 9. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose geometries and materials
      cubeGeo.dispose();
      cubeEdges.dispose();
      cubeMatAmber.dispose();
      cubeMatTeal.dispose();
      wireMatAmber.dispose();
      wireMatTeal.dispose();
      icosaGeo.dispose();
      icosaMat.dispose();
      dodecaGeo.dispose();
      dodecaMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringMat2.dispose();
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
