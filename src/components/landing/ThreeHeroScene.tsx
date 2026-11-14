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

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x22282a, 2.2);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xe6a746, 14, 60);
    amberLight.position.set(9, 6, 8);
    scene.add(amberLight);

    const tealLight = new THREE.PointLight(0x83b6a3, 10, 60);
    tealLight.position.set(5, -6, 6);
    scene.add(tealLight);

    // 3. Right-Aligned 3D Cluster
    // Positioned strictly in the right half of the viewport (x = 5.8)
    // All child meshes stay within [x - 2.8, x + 4.8], meaning world X is strictly in [3.0, 10.6].
    // Left text is at world X <= 0, guaranteeing zero overlap or collision.
    const right3DGroup = new THREE.Group();
    right3DGroup.position.set(5.8, 0, -3.5);
    scene.add(right3DGroup);

    // 3D Bevelled Puzzle Cubes with Glowing Wireframe Edges
    const cubeGeo = new THREE.BoxGeometry(1.35, 1.35, 1.35);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeo);

    const cubeMatAmber = new THREE.MeshStandardMaterial({
      color: 0x1d2224,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xe6a746,
      emissiveIntensity: 0.32
    });

    const cubeMatTeal = new THREE.MeshStandardMaterial({
      color: 0x171f21,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x83b6a3,
      emissiveIntensity: 0.35
    });

    const wireMatAmber = new THREE.LineBasicMaterial({ color: 0xffbd62, transparent: true, opacity: 0.9 });
    const wireMatTeal = new THREE.LineBasicMaterial({ color: 0x83b6a3, transparent: true, opacity: 0.85 });

    // Cubes clustered in 3D around the right visual nexus card
    // local coordinates: x between -2.6 and +4.2
    const cubePositions = [
      { x: -2.5, y: 1.8, z: 0.8, mat: cubeMatAmber, wire: wireMatAmber },
      { x: 3.4, y: -2.2, z: 0.6, mat: cubeMatTeal, wire: wireMatTeal },
      { x: -2.2, y: -1.9, z: -0.4, mat: cubeMatTeal, wire: wireMatTeal },
      { x: 3.6, y: 1.9, z: -0.8, mat: cubeMatAmber, wire: wireMatAmber },
      { x: 0.6, y: 3.4, z: -1.2, mat: cubeMatAmber, wire: wireMatAmber },
      { x: -1.2, y: 2.8, z: -0.6, mat: cubeMatTeal, wire: wireMatTeal }
    ];

    const cubes: THREE.Mesh[] = [];
    cubePositions.forEach((cp) => {
      const mesh = new THREE.Mesh(cubeGeo, cp.mat);
      mesh.position.set(cp.x, cp.y, cp.z);
      const wireframe = new THREE.LineSegments(cubeEdges, cp.wire);
      mesh.add(wireframe);
      right3DGroup.add(mesh);
      cubes.push(mesh);
    });

    // 3D Geometric Polyhedra (Framing outer right perimeter of the 3D cluster)
    const icosaGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const icosaMat = new THREE.MeshStandardMaterial({
      color: 0x141719,
      emissive: 0xe6a746,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
    icosaMesh.position.set(4.2, 2.6, -1);
    right3DGroup.add(icosaMesh);

    const dodecaGeo = new THREE.DodecahedronGeometry(1.1, 0);
    const dodecaMat = new THREE.MeshStandardMaterial({
      color: 0x141719,
      emissive: 0x83b6a3,
      emissiveIntensity: 0.55,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    dodecaMesh.position.set(4.0, -2.8, -1);
    right3DGroup.add(dodecaMesh);

    // Orbital 3D Rings framing the right 3D centerpiece (radius 4.2 stays within x = [1.6, 10.0])
    const ringGeo = new THREE.TorusGeometry(4.2, 0.025, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe6a746, transparent: true, opacity: 0.35 });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    right3DGroup.add(ringMesh1);

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x83b6a3, transparent: true, opacity: 0.3 });
    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat2);
    ringMesh2.rotation.y = Math.PI / 2.5;
    right3DGroup.add(ringMesh2);

    // 4. Subtle Distant 3D Starfield across entire viewport (Very small particles, zero text obstruction)
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorAmber = new THREE.Color(0xe6a746);
    const colorTeal = new THREE.Color(0x83b6a3);
    const colorWhite = new THREE.Color(0xf2f0e9);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 40;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 28;
      particlePos[i * 3 + 2] = -5 - Math.random() * 20; // Deep in the background

      const c = Math.random() > 0.6 ? colorAmber : Math.random() > 0.4 ? colorTeal : colorWhite;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
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

      targetRotationY = mouseX * 0.35;
      targetRotationX = mouseY * 0.25;

      amberLight.position.x = 9 + mouseX * 4;
      amberLight.position.y = 6 - mouseY * 4;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous subtle rotation of the right 3D group
        right3DGroup.rotation.y += (targetRotationY - right3DGroup.rotation.y) * 0.05;
        right3DGroup.rotation.x += (targetRotationX - right3DGroup.rotation.x) * 0.05;

        cubes.forEach((cube, i) => {
          cube.rotation.x = elapsedTime * 0.35 * (i % 2 === 0 ? 1 : -1);
          cube.rotation.y = elapsedTime * 0.28 * (i % 3 === 0 ? 1 : -1);
          cube.position.y += Math.sin(elapsedTime * 1.5 + i) * 0.003;
        });

        icosaMesh.rotation.x = elapsedTime * 0.2;
        icosaMesh.rotation.y = elapsedTime * 0.25;

        dodecaMesh.rotation.x = -elapsedTime * 0.22;
        dodecaMesh.rotation.y = -elapsedTime * 0.18;

        ringMesh1.rotation.z = elapsedTime * 0.04;
        ringMesh2.rotation.z = -elapsedTime * 0.05;

        particles.rotation.y = elapsedTime * 0.015;
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

      // On narrow mobile screens, shift group to center
      if (newWidth < 1024) {
        right3DGroup.position.x = 0;
        right3DGroup.position.y = -3;
      } else {
        right3DGroup.position.x = 5.8;
        right3DGroup.position.y = 0;
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    if (width < 1024) {
      right3DGroup.position.x = 0;
      right3DGroup.position.y = -3;
    }

    // 8. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

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
