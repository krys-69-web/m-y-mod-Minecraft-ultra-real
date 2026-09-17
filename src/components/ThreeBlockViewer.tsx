import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BlockData } from '../types';
import { RotateCw, Sun, Moon, Maximize2, Sparkles, Layers } from 'lucide-react';

interface ThreeBlockViewerProps {
  block: BlockData;
}

export const ThreeBlockViewer: React.FC<ThreeBlockViewerProps> = ({ block }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState<'golden' | 'daylight' | 'studio'>('golden');
  const [useNormalMap, setUseNormalMap] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0.005, y: 0.005 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.4, 2.0, 2.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer with ACESFilmicToneMapping HDR simulation
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98; // Slightly darkened overall for deep punchy HDR contrast
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffddcf, 0.72); // Warm rose tint with darkened ambient for high contrast
    ambientLightRef.current = ambient;
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xff9e72, 2.85); // Warm rose-orange sunlight with HDR brilliance
    dirLight.position.set(4, 6, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLightRef.current = dirLight;
    scene.add(dirLight);

    // Soft fill light from opposite side (sunset rose-violet ambient bounce)
    const fillLight = new THREE.DirectionalLight(0xde7b64, 0.75);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    // Ground shadow receiver pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.1, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1b2333,
      roughness: 0.8,
      metalness: 0.1
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.8;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Grid helper on pedestal
    const grid = new THREE.GridHelper(3.2, 8, 0x334766, 0x223048);
    grid.position.y = -0.74;
    scene.add(grid);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (meshRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          meshRef.current.rotation.y += 0.008;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse / Touch interaction handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !meshRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      meshRef.current.rotation.y += dx * 0.01;
      meshRef.current.rotation.x += dy * 0.01;
      // Clamp vertical rotation
      meshRef.current.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, meshRef.current.rotation.x));
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !meshRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePosRef.current.x;
      const dy = e.touches[0].clientY - prevMousePosRef.current.y;
      meshRef.current.rotation.y += dx * 0.01;
      meshRef.current.rotation.x += dy * 0.01;
      meshRef.current.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, meshRef.current.rotation.x));
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, []);

  // Update lighting mode
  useEffect(() => {
    if (!dirLightRef.current || !ambientLightRef.current) return;
    if (lightingMode === 'golden') {
      // Warm rose-orange HDR sunlight with high contrast & deeper shadows
      dirLightRef.current.color.setHex(0xff9e72);
      dirLightRef.current.intensity = 2.95;
      ambientLightRef.current.color.setHex(0x382226);
      ambientLightRef.current.intensity = 0.68;
    } else if (lightingMode === 'daylight') {
      // Bright daylight with warm undertone
      dirLightRef.current.color.setHex(0xfff5ee);
      dirLightRef.current.intensity = 2.3;
      ambientLightRef.current.color.setHex(0x40323a);
      ambientLightRef.current.intensity = 0.82;
    } else {
      // Neutral studio light
      dirLightRef.current.color.setHex(0xf5f5f5);
      dirLightRef.current.intensity = 1.8;
      ambientLightRef.current.color.setHex(0x555555);
      ambientLightRef.current.intensity = 0.95;
    }
  }, [lightingMode]);

  // Update Mesh textures when block or normal map toggle changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove existing block mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((m) => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
      meshRef.current.geometry.dispose();
      meshRef.current = null;
    }

    const loader = new THREE.TextureLoader();

    const configureTexture = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.NearestFilter; // Keep clean Minecraft crisp edges
    };

    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);

    const normalTex = (useNormalMap && block.textures.normal)
      ? loader.load(block.textures.normal, configureTexture)
      : null;

    // Multi-face materials support (e.g. grass top, side, bottom)
    if (block.textures.side || block.textures.top) {
      const topTex = loader.load(block.textures.top || block.textures.diffuse, configureTexture);
      const sideTex = loader.load(block.textures.side || block.textures.diffuse, configureTexture);
      const botTex = loader.load(block.textures.bottom || block.textures.diffuse, configureTexture);

      const sideNormal = (useNormalMap && (block.textures.side ? '/realism_pack/textures/blocks/grass_side_normal.png' : block.textures.normal))
        ? loader.load(block.textures.side ? '/realism_pack/textures/blocks/grass_side_normal.png' : block.textures.normal!, configureTexture)
        : null;

      const topMat = new THREE.MeshStandardMaterial({
        map: topTex,
        normalMap: normalTex,
        normalScale: new THREE.Vector2(1.2, 1.2),
        roughness: 0.85,
        metalness: 0.05
      });

      const sideMat = new THREE.MeshStandardMaterial({
        map: sideTex,
        normalMap: sideNormal || normalTex,
        normalScale: new THREE.Vector2(1.2, 1.2),
        roughness: 0.88,
        metalness: 0.05
      });

      const botMat = new THREE.MeshStandardMaterial({
        map: botTex,
        normalMap: normalTex,
        roughness: 0.92,
        metalness: 0.05
      });

      // Box face order in Three.js: +X (right), -X (left), +Y (top), -Y (bottom), +Z (front), -Z (back)
      const materials = [sideMat, sideMat, topMat, botMat, sideMat, sideMat];
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.position.y = 0.0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshRef.current = mesh;
    } else {
      // Single texture block (stone, dirt, planks, etc.)
      const diffuseTex = loader.load(block.textures.diffuse, configureTexture);

      const isGlass = block.id === 'glass';
      const isLeaves = block.id === 'leaves_oak';
      const isWater = block.id.includes('water');

      const material = new THREE.MeshStandardMaterial({
        map: diffuseTex,
        normalMap: normalTex,
        normalScale: isWater ? new THREE.Vector2(1.8, 1.8) : new THREE.Vector2(1.2, 1.2),
        roughness: isWater ? 0.04 : (isGlass ? 0.08 : 0.82),
        metalness: isWater ? 0.05 : (isGlass ? 0.1 : 0.05),
        transparent: isWater || isGlass || isLeaves,
        opacity: isWater ? 0.35 : (isGlass ? 0.65 : 1.0),
        alphaTest: isLeaves ? 0.35 : 0.0,
        depthWrite: !isGlass && !isWater
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshRef.current = mesh;
    }
  }, [block, useNormalMap]);

  // Zoom camera
  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newZoom = Math.max(0.7, Math.min(1.8, zoomLevel + delta));
    setZoomLevel(newZoom);
    cameraRef.current.position.set(2.4 / newZoom, 2.0 / newZoom, 2.8 / newZoom);
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !meshRef.current) return;
    setZoomLevel(1);
    cameraRef.current.position.set(2.4, 2.0, 2.8);
    meshRef.current.rotation.set(0, 0, 0);
  };

  return (
    <div id="three-viewer-container" className="relative w-full h-[460px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing touch-none select-none"
        title="Glissez avec le doigt ou la souris pour inspecter sous tous les angles"
      />

      {/* Top Floating Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Block Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/70 text-xs text-amber-300 font-medium shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{block.name}</span>
          <span className="text-slate-400">({block.resolution})</span>
        </div>

        {/* Viewport Action Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/70 shadow-md">
          <button
            id="btn-toggle-autorotate"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded transition-colors ${autoRotate ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            title={autoRotate ? "Arrêter la rotation automatique" : "Activer la rotation automatique"}
            type="button"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            id="btn-toggle-normal-map"
            onClick={() => setUseNormalMap(!useNormalMap)}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${useNormalMap ? 'bg-indigo-500/25 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}
            title="Activer/Désactiver le relief 3D Normal Map"
            type="button"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">PBR {useNormalMap ? 'ON' : 'OFF'}</span>
          </button>
          <button
            id="btn-reset-view"
            onClick={handleResetCamera}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Réinitialiser la caméra"
            type="button"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Lighting & Ambience Controls */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Lighting Selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/70 shadow-md text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ambiance:</span>
          </span>
          <button
            id="btn-light-golden"
            onClick={() => setLightingMode('golden')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              lightingMode === 'golden'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            type="button"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>HDR Rose-Orangé</span>
          </button>
          <button
            id="btn-light-daylight"
            onClick={() => setLightingMode('daylight')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              lightingMode === 'daylight'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            type="button"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Jour</span>
          </button>
          <button
            id="btn-light-studio"
            onClick={() => setLightingMode('studio')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              lightingMode === 'studio'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            type="button"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
        </div>

        {/* Drag Hint */}
        <div className="pointer-events-auto hidden sm:flex items-center text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
          <span>Glisser pour tourner • Molette pour zoom</span>
        </div>
      </div>
    </div>
  );
};
