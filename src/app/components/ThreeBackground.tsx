import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create glowing particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3,
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create geometric shapes
    const geometries = [
      new THREE.TorusGeometry(10, 3, 16, 100),
      new THREE.OctahedronGeometry(8),
      new THREE.IcosahedronGeometry(7),
    ];

    const shapes: THREE.Mesh[] = [];

    geometries.forEach((geometry, index) => {
      const material = new THREE.MeshPhongMaterial({
        color: [0x00d4ff, 0x0084ff, 0x6a00ff][index],
        transparent: true,
        opacity: 0.1,
        wireframe: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (index - 1) * 30,
        0,
        -20
      );
      shapes.push(mesh);
      scene.add(mesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 2, 100);
    pointLight.position.set(0, 0, 30);
    scene.add(pointLight);

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Rotate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      // Animate geometric shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.001 * (index + 1);
        shape.rotation.y += 0.002 * (index + 1);
        shape.rotation.z += 0.001 * (index + 1);

        // React to mouse movement
        shape.position.x += (mousePosition.current.x * 5 - shape.position.x) * 0.02;
        shape.position.y += (mousePosition.current.y * 5 - shape.position.y) * 0.02;
      });

      // Camera parallax effect
      camera.position.x += (mousePosition.current.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (mousePosition.current.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      geometries.forEach(g => g.dispose());
      shapes.forEach(s => {
        if (s.material instanceof THREE.Material) {
          s.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'linear-gradient(to bottom, #000428, #004e92)' }}
    />
  );
};
