import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import './WorldMap3D.css';

interface ConflictZone {
  id: string;
  name: string;
  lat: number;
  lon: number;
  intensity: number; // 0-1
  type: 'active' | 'escalating' | 'deescalating';
  players: string[];
  description: string;
}

interface WorldMap3DProps {
  className?: string;
}

const WorldMap3D: React.FC<WorldMap3DProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const globeRef = useRef<any>(null);
  const gridRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  
  const [selectedConflict, setSelectedConflict] = useState<ConflictZone | null>(null);
  const [mapMode, setMapMode] = useState<'globe' | 'flat' | 'satellite'>('globe');
  const [showGrid, setShowGrid] = useState(true);
  const [showConflicts, setShowConflicts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conflictZones: ConflictZone[] = [
    {
      id: 'ukraine',
      name: 'Ukraine Conflict',
      lat: 48.3794,
      lon: 31.1656,
      intensity: 0.9,
      type: 'active',
      players: ['Ukraine', 'Russia', 'NATO'],
      description: 'Ongoing military conflict in Eastern Europe'
    },
    {
      id: 'gaza',
      name: 'Gaza Conflict',
      lat: 31.5017,
      lon: 34.4668,
      intensity: 0.8,
      type: 'active',
      players: ['Israel', 'Hamas', 'Palestine'],
      description: 'Military operations in Gaza Strip'
    },
    {
      id: 'taiwan',
      name: 'Taiwan Strait',
      lat: 23.5,
      lon: 121.0,
      intensity: 0.6,
      type: 'escalating',
      players: ['China', 'Taiwan', 'USA'],
      description: 'Tensions in Taiwan Strait region'
    },
    {
      id: 'south-china-sea',
      name: 'South China Sea',
      lat: 12.0,
      lon: 113.0,
      intensity: 0.7,
      type: 'active',
      players: ['China', 'Philippines', 'USA'],
      description: 'Territorial disputes in South China Sea'
    },
    {
      id: 'kashmir',
      name: 'Kashmir Region',
      lat: 34.0,
      lon: 74.0,
      intensity: 0.5,
      type: 'deescalating',
      players: ['India', 'Pakistan', 'China'],
      description: 'Border tensions in Kashmir'
    },
    {
      id: 'yemen',
      name: 'Yemen Conflict',
      lat: 15.5527,
      lon: 48.5164,
      intensity: 0.6,
      type: 'active',
      players: ['Houthis', 'Saudi Arabia', 'Iran'],
      description: 'Ongoing civil war and regional conflict'
    }
  ];

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode || mountNode.children.length > 0) {
      return;
    }

    let animationFrameId: number;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000a1e);

    const camera = new THREE.PerspectiveCamera(
      45,
      mountNode.clientWidth / mountNode.clientHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // Centering on India
    const indiaLat = 20.5937;
    const indiaLon = 78.9629;
    const phi = (90 - indiaLat) * (Math.PI / 180);
    const theta = (indiaLon + 180) * (Math.PI / 180);
    
    const radius = 3.5;
    camera.position.x = -radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    
    camera.lookAt(scene.position);
    controls.update();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x406080, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Globe
    const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d4aa,
      shininess: 30,
      transparent: true,
      opacity: 0.1,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Wireframe
    const wireframeGeometry = new THREE.SphereGeometry(1.51, 48, 48);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4aa,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Add conflict markers
    conflictZones.forEach(conflict => {
      const latRad = (90 - conflict.lat) * (Math.PI / 180);
      const lonRad = (conflict.lon + 180) * (Math.PI / 180);
      
      const r = 1.51; // radius to place on wireframe
      const x = -r * Math.sin(latRad) * Math.cos(lonRad);
      const y = r * Math.cos(latRad);
      const z = r * Math.sin(latRad) * Math.sin(lonRad);

      const markerColor = conflict.type === 'active' ? 0xff4444 : conflict.type === 'escalating' ? 0xffaa00 : 0x00ffaa;
      
      const markerGeometry = new THREE.SphereGeometry(0.03, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: markerColor });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      scene.add(marker);

      // Pulsing effect
      const pulseGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const pulseMaterial = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: true,
        opacity: 0.5
      });
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      pulse.position.set(x, y, z);
      scene.add(pulse);

      gsap.to(pulse.scale, {
        duration: 1.5,
        x: 3, y: 3, z: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
      gsap.to(pulse.material, {
        duration: 1.5,
        opacity: 0,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    });

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if(mountNode) {
          const width = mountNode.clientWidth;
          const height = mountNode.clientHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Final setup
    try {
        animate();
        setIsLoading(false);
    } catch (e: any) {
      console.error("Error initializing 3D map:", e);
      setError("Failed to render tactical map. Check console for details.");
      setIsLoading(false);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mountNode && renderer.domElement) {
        // Check if domElement is still a child before removing
        if (mountNode.contains(renderer.domElement)) {
            mountNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Handle map mode changes
  useEffect(() => {
    if (!globeRef.current || !gridRef.current) return;

    switch (mapMode) {
      case 'globe':
        globeRef.current.visible = true;
        gridRef.current.visible = showGrid;
        break;
      case 'flat':
        // Implement flat projection
        break;
      case 'satellite':
        // Implement satellite view
        break;
    }
  }, [mapMode, showGrid]);

  if (isLoading) {
    return (
      <div className={`world-map-3d loading ${className || ''}`}>
        <div className="loading-message">INITIALIZING TACTICAL DISPLAY...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`world-map-3d error ${className || ''}`}>
        <div className="error-message">{error}</div>
        <div className="fallback-display">
          <h3>TACTICAL OVERVIEW</h3>
          <div className="conflict-list">
            {conflictZones.map(conflict => (
              <div key={conflict.id} className="conflict-item">
                <span className="conflict-name">{conflict.name}</span>
                <span className={`conflict-intensity ${conflict.intensity > 0.7 ? 'high' : conflict.intensity > 0.4 ? 'medium' : 'low'}`}>
                  {Math.round(conflict.intensity * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`world-map-3d ${className || ''}`}>
      {isLoading && (
        <div className="map-loading-overlay">
          <div className="loading-spinner"></div>
          <p>INITIALIZING TACTICAL DISPLAY...</p>
        </div>
      )}
      {error && (
        <div className="map-error-overlay">
          <div className="error-icon">⚠️</div>
          <p className="error-title">TACTICAL MAP OFFLINE</p>
          <p className="error-message">{error}</p>
        </div>
      )}
      <div ref={mountRef} className="map-container" />
      
      {/* Controls and other UI elements will be re-added later if needed */}
    </div>
  );
};

export default WorldMap3D; 