// skill_garden-Frontend/src/components/ai/AIMascotViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { AIMascotMood } from '../../types/ai';

interface AIMascotViewerProps {
    size?: number;
    mood?: AIMascotMood;
    interactive?: boolean;
    autoRotate?: boolean;
    className?: string;
    onClick?: () => void;
}

export const AIMascotViewer: React.FC<AIMascotViewerProps> = ({
    size = 120,
    mood = 'idle',
    interactive = true,
    autoRotate = false,
    className = '',
    onClick
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const moodRef = useRef<AIMascotMood>(mood);

    useEffect(() => {
        moodRef.current = mood;
    }, [mood]);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        let animationFrameId: number;
        let isDestroyed = false;

        const width = size;
        const height = size;

        // 1. Scene
        const scene = new THREE.Scene();

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, 3.2);

        // 3. Renderer with transparent background and high pixel ratio
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);

        // 4. Studio Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.0);
        keyLight.position.set(2, 4, 3);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x88ccff, 1.2);
        fillLight.position.set(-3, 1, 2);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xa5f3fc, 1.5);
        rimLight.position.set(0, -2, -2);
        scene.add(rimLight);

        // Group container for model
        const modelGroup = new THREE.Group();
        scene.add(modelGroup);

        // 5. GLTF + DRACO Loader
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        dracoLoader.setDecoderConfig({ type: 'wasm' });

        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        let targetRotationX = 0;
        let targetRotationY = 0;
        let currentRotationX = 0;
        let currentRotationY = 0;
        let basePosY = 0;

        gltfLoader.load(
            '/models/aiskill.optimized.glb',
            (gltf) => {
                if (isDestroyed) return;

                const model = gltf.scene;

                // Center and scale model to fit view frustum nicely
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const modelSize = box.getSize(new THREE.Vector3());

                const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
                const scale = 1.7 / (maxDim || 1);
                model.scale.set(scale, scale, scale);

                model.position.x = -center.x * scale;
                model.position.y = -center.y * scale - 0.1;
                model.position.z = -center.z * scale;
                basePosY = model.position.y;

                // Enhance materials with glowing sheen
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        if (mesh.material) {
                            const mat = mesh.material as THREE.MeshStandardMaterial;
                            mat.envMapIntensity = 1.0;
                            mat.needsUpdate = true;
                        }
                    }
                });

                modelGroup.add(model);
                setIsLoading(false);
            },
            undefined,
            (error) => {
                console.warn('Could not load 3D mascot:', error);
                if (!isDestroyed) {
                    setIsLoading(false);
                    setHasError(true);
                }
            }
        );

        // 6. Interactive Mouse Tracking
        const handleMouseMove = (event: MouseEvent) => {
            if (!interactive) return;
            const rect = container.getBoundingClientRect();
            const mouseX = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
            const mouseY = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);

            targetRotationY = THREE.MathUtils.clamp(mouseX * 0.7, -0.6, 0.6);
            targetRotationX = THREE.MathUtils.clamp(mouseY * 0.4, -0.3, 0.3);
        };

        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        // 7. Animation Loop
        const clock = new THREE.Clock();

        const animate = () => {
            if (isDestroyed) return;
            animationFrameId = requestAnimationFrame(animate);

            // Skip rendering if page is in background to save GPU/battery
            if (document.hidden) return;

            const elapsedTime = clock.getElapsedTime();
            const currentMood = moodRef.current;

            // Smooth interpolation to target mouse rotation
            currentRotationX += (targetRotationX - currentRotationX) * 0.08;
            currentRotationY += (targetRotationY - currentRotationY) * 0.08;

            modelGroup.rotation.x = currentRotationX;
            modelGroup.rotation.y = currentRotationY;

            // Mood-based micro-animations
            if (currentMood === 'thinking') {
                // Gentle continuous spin & wobble
                modelGroup.rotation.y += Math.sin(elapsedTime * 4) * 0.15;
                modelGroup.position.y = Math.sin(elapsedTime * 5) * 0.04;
            } else if (currentMood === 'speaking') {
                // Rhythmic bobbing / nodding like speaking
                modelGroup.position.y = Math.sin(elapsedTime * 8) * 0.03;
                modelGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 6) * 0.08;
            } else if (currentMood === 'happy' || currentMood === 'waving') {
                // Cheerful bounce
                modelGroup.position.y = Math.abs(Math.sin(elapsedTime * 6)) * 0.08;
                modelGroup.rotation.z = Math.sin(elapsedTime * 8) * 0.08;
            } else {
                // Idle breathing float
                modelGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.035;
                if (autoRotate) {
                    modelGroup.rotation.y += 0.01;
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // 8. Cleanup
        return () => {
            isDestroyed = true;
            cancelAnimationFrame(animationFrameId);
            if (interactive) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            dracoLoader.dispose();
            renderer.dispose();
        };
    }, [size, interactive, autoRotate]);

    return (
        <div
            className={`relative flex items-center justify-center select-none cursor-pointer ${className}`}
            style={{ width: size, height: size }}
            onClick={onClick}
        >
            {/* 3D Canvas Mount */}
            <div ref={mountRef} className="w-full h-full flex items-center justify-center" />

            {/* Loading placeholder spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Fallback avatar if WebGL fails */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full text-white font-black text-xs shadow-md">
                    AI
                </div>
            )}
        </div>
    );
};
