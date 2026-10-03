import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RotateCw, Sparkles, Droplets, Maximize2 } from 'lucide-react'

interface Tree3DProps {
    stageLevel?: number // 1 to 5
    treeType?: 'CHERRY_BLOSSOM' | 'OAK_TREE' | 'BAMBOO' | 'CACTUS' | 'PINE' | 'BONSAI'
    treeName?: string
    growthProgress?: number // 0 - 100%
    onWaterSuccess?: () => void
}

export const Tree3DViewer: React.FC<Tree3DProps> = ({
    stageLevel = 3,
    treeType = 'CHERRY_BLOSSOM',
    treeName = 'Cây Hoa Anh Đào (React 19)',
    growthProgress = 65,
    onWaterSuccess
}) => {
    const mountRef = useRef<HTMLDivElement>(null)
    const [isWatering, setIsWatering] = useState(false)
    const [waterEffect, setWaterEffect] = useState(false)

    useEffect(() => {
        const container = mountRef.current
        if (!container) return

        const width = container.clientWidth
        const height = container.clientHeight

        // 1. Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf4f9f4)
        scene.fog = new THREE.FogExp2(0xf4f9f4, 0.05)

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
        camera.position.set(0, 3, 7)

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        container.appendChild(renderer.domElement)

        // 4. Orbit Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.maxPolarAngle = Math.PI / 2 - 0.05 // Don't go below ground
        controls.minDistance = 3
        controls.maxDistance = 12
        controls.target.set(0, 1.5, 0)

        // 5. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
        scene.add(ambientLight)

        const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.5)
        dirLight.position.set(5, 10, 5)
        dirLight.castShadow = true
        dirLight.shadow.mapSize.width = 1024
        dirLight.shadow.mapSize.height = 1024
        scene.add(dirLight)

        const pointLight = new THREE.PointLight(0x71c786, 1.2, 10)
        pointLight.position.set(0, 2, 0)
        scene.add(pointLight)

        // 6. Garden Island Ground Base (Floating Grass Island)
        const islandGroup = new THREE.Group()

        // Grass top
        const grassGeo = new THREE.CylinderGeometry(2.5, 2.3, 0.4, 32)
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x479e5b, roughness: 0.8 })
        const grassMesh = new THREE.Mesh(grassGeo, grassMat)
        grassMesh.position.y = -0.2
        grassMesh.receiveShadow = true
        islandGroup.add(grassMesh)

        // Soil bottom layer
        const soilGeo = new THREE.CylinderGeometry(2.3, 1.8, 0.8, 32)
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })
        const soilMesh = new THREE.Mesh(soilGeo, soilMat)
        soilMesh.position.y = -0.8
        islandGroup.add(soilMesh)

        scene.add(islandGroup)

        // 7. Procedural 3D Tree Group based on stageLevel & treeType
        const treeGroup = new THREE.Group()
        const scaleFactor = 0.45 + stageLevel * 0.22
        treeGroup.scale.set(scaleFactor, scaleFactor, scaleFactor)

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e473b, roughness: 0.9 })

        if (treeType === 'PINE') {
            // === CÂY THÔNG (PINE) ===
            const trunkGeo = new THREE.CylinderGeometry(0.14, 0.25, 2.2, 12)
            const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat)
            trunkMesh.position.y = 1.1
            trunkMesh.castShadow = true
            treeGroup.add(trunkMesh)

            const pineMat = new THREE.MeshStandardMaterial({ color: 0x1b4d3e, roughness: 0.7 })
            const tiers = [
                { y: 1.5, r: 1.2, h: 1.1 },
                { y: 2.1, r: 0.95, h: 1.0 },
                { y: 2.65, r: 0.7, h: 0.9 },
                { y: 3.1, r: 0.45, h: 0.7 }
            ]
            tiers.forEach(t => {
                const coneGeo = new THREE.ConeGeometry(t.r, t.h, 10)
                const coneMesh = new THREE.Mesh(coneGeo, pineMat)
                coneMesh.position.y = t.y
                coneMesh.castShadow = true
                treeGroup.add(coneMesh)
            })
        } else if (treeType === 'CACTUS') {
            // === CÂY XƯƠNG RỒNG (CACTUS) ===
            const cactusMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 })
            // Main trunk column
            const mainStemGeo = new THREE.CylinderGeometry(0.32, 0.32, 2.4, 16)
            const mainStemMesh = new THREE.Mesh(mainStemGeo, cactusMat)
            mainStemMesh.position.y = 1.2
            mainStemMesh.castShadow = true
            treeGroup.add(mainStemMesh)

            // Top dome
            const domeGeo = new THREE.SphereGeometry(0.32, 16, 16)
            const domeMesh = new THREE.Mesh(domeGeo, cactusMat)
            domeMesh.position.y = 2.4
            treeGroup.add(domeMesh)

            // Left branch
            const leftArmH = new THREE.CylinderGeometry(0.18, 0.18, 0.55, 10)
            const leftArmHMesh = new THREE.Mesh(leftArmH, cactusMat)
            leftArmHMesh.rotation.z = Math.PI / 2
            leftArmHMesh.position.set(-0.45, 1.3, 0)
            treeGroup.add(leftArmHMesh)

            const leftArmV = new THREE.CylinderGeometry(0.18, 0.18, 0.85, 10)
            const leftArmVMesh = new THREE.Mesh(leftArmV, cactusMat)
            leftArmVMesh.position.set(-0.65, 1.7, 0)
            treeGroup.add(leftArmVMesh)

            // Right branch
            const rightArmH = new THREE.CylinderGeometry(0.18, 0.18, 0.55, 10)
            const rightArmHMesh = new THREE.Mesh(rightArmH, cactusMat)
            rightArmHMesh.rotation.z = Math.PI / 2
            rightArmHMesh.position.set(0.45, 1.6, 0)
            treeGroup.add(rightArmHMesh)

            const rightArmV = new THREE.CylinderGeometry(0.18, 0.18, 0.85, 10)
            const rightArmVMesh = new THREE.Mesh(rightArmV, cactusMat)
            rightArmVMesh.position.set(0.65, 2.0, 0)
            treeGroup.add(rightArmVMesh)

            // Flower blossom on top
            const flowerGeo = new THREE.DodecahedronGeometry(0.2, 0)
            const flowerMat = new THREE.MeshStandardMaterial({ color: 0xff3b5c, roughness: 0.3, emissive: 0xaa1122 })
            const flowerMesh = new THREE.Mesh(flowerGeo, flowerMat)
            flowerMesh.position.y = 2.75
            treeGroup.add(flowerMesh)
        } else if (treeType === 'BAMBOO') {
            // === CÂY TRE (BAMBOO) ===
            const bambooMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.6 })
            const nodeMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 })
            const leafMat = new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.5 })

            const stalks = [
                { x: 0, z: 0, height: 2.8, segs: 5 },
                { x: -0.35, z: 0.25, height: 2.3, segs: 4 },
                { x: 0.35, z: -0.2, height: 2.5, segs: 4 }
            ]

            stalks.forEach(s => {
                const segLen = s.height / s.segs
                for (let i = 0; i < s.segs; i++) {
                    const segGeo = new THREE.CylinderGeometry(0.1, 0.11, segLen * 0.95, 10)
                    const segMesh = new THREE.Mesh(segGeo, bambooMat)
                    segMesh.position.set(s.x, i * segLen + segLen / 2, s.z)
                    segMesh.castShadow = true
                    treeGroup.add(segMesh)

                    // Node ring
                    const nodeGeo = new THREE.TorusGeometry(0.115, 0.02, 6, 12)
                    const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat)
                    nodeMesh.rotation.x = Math.PI / 2
                    nodeMesh.position.set(s.x, (i + 1) * segLen, s.z)
                    treeGroup.add(nodeMesh)
                }

                // Bamboo leaves near top
                for (let k = 0; k < 3; k++) {
                    const leafGeo = new THREE.ConeGeometry(0.2, 0.7, 5)
                    const leafMesh = new THREE.Mesh(leafGeo, leafMat)
                    leafMesh.position.set(s.x + (k % 2 === 0 ? 0.25 : -0.25), s.height - 0.2 * k, s.z)
                    leafMesh.rotation.z = k % 2 === 0 ? 0.7 : -0.7
                    treeGroup.add(leafMesh)
                }
            })
        } else if (treeType === 'BONSAI') {
            // === CÂY CẢNH BONSAI ===
            // Bonsai pot
            const potGeo = new THREE.CylinderGeometry(0.9, 0.7, 0.35, 20)
            const potMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.8 })
            const potMesh = new THREE.Mesh(potGeo, potMat)
            potMesh.position.y = 0.15
            potMesh.castShadow = true
            treeGroup.add(potMesh)

            // Curved trunk segments
            const bTrunkMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.9 })
            const seg1 = new THREE.CylinderGeometry(0.18, 0.28, 1.1, 10)
            const seg1Mesh = new THREE.Mesh(seg1, bTrunkMat)
            seg1Mesh.position.set(-0.1, 0.8, 0)
            seg1Mesh.rotation.z = -0.2
            treeGroup.add(seg1Mesh)

            const seg2 = new THREE.CylinderGeometry(0.13, 0.18, 1.0, 10)
            const seg2Mesh = new THREE.Mesh(seg2, bTrunkMat)
            seg2Mesh.position.set(0.15, 1.6, 0)
            seg2Mesh.rotation.z = 0.35
            treeGroup.add(seg2Mesh)

            // Cloud foliage pads
            const cloudMat = new THREE.MeshStandardMaterial({ color: 0x4a5d23, roughness: 0.7 })
            const clouds = [
                { x: 0.5, y: 2.1, z: 0, sx: 0.85, sy: 0.3, sz: 0.7 },
                { x: -0.4, y: 1.5, z: 0.2, sx: 0.7, sy: 0.25, sz: 0.6 },
                { x: 0.1, y: 2.45, z: -0.1, sx: 0.75, sy: 0.3, sz: 0.65 }
            ]
            clouds.forEach(c => {
                const cGeo = new THREE.SphereGeometry(1, 12, 10)
                const cMesh = new THREE.Mesh(cGeo, cloudMat)
                cMesh.scale.set(c.sx, c.sy, c.sz)
                cMesh.position.set(c.x, c.y, c.z)
                cMesh.castShadow = true
                treeGroup.add(cMesh)
            })
        } else {
            // === CHERRY BLOSSOM OR OAK TREE ===
            const isOak = treeType === 'OAK_TREE'
            const trunkGeo = new THREE.CylinderGeometry(isOak ? 0.25 : 0.18, isOak ? 0.45 : 0.35, 2.2, 12)
            const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat)
            trunkMesh.position.y = 1.1
            trunkMesh.castShadow = true
            trunkMesh.receiveShadow = true
            treeGroup.add(trunkMesh)

            const foliageColor = isOak ? 0x2e8b57 : 0xffa7c4
            const leafMat = new THREE.MeshStandardMaterial({
                color: foliageColor,
                roughness: 0.6,
                metalness: 0.1
            })

            const leafClusters = [
                { pos: [0, 2.4, 0], size: isOak ? 1.3 : 1.1 },
                { pos: [-0.6, 2.0, 0.4], size: isOak ? 1.0 : 0.85 },
                { pos: [0.6, 2.1, -0.3], size: isOak ? 0.95 : 0.8 },
                { pos: [0.3, 2.6, 0.4], size: isOak ? 0.9 : 0.75 },
                { pos: [-0.4, 2.5, -0.4], size: isOak ? 0.85 : 0.7 }
            ]

            leafClusters.forEach(c => {
                const leafGeo = new THREE.DodecahedronGeometry(c.size, 1)
                const leafMesh = new THREE.Mesh(leafGeo, leafMat)
                leafMesh.position.set(c.pos[0], c.pos[1], c.pos[2])
                leafMesh.castShadow = true
                treeGroup.add(leafMesh)
            })
        }

        scene.add(treeGroup)

        // 8. Water Droplets Particle System
        const particlesCount = 80
        const particleGeo = new THREE.BufferGeometry()
        const particlePos = new Float32Array(particlesCount * 3)

        for (let i = 0; i < particlesCount * 3; i += 3) {
            particlePos[i] = (Math.random() - 0.5) * 2
            particlePos[i + 1] = Math.random() * 4 + 2
            particlePos[i + 2] = (Math.random() - 0.5) * 2
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
        const particleMat = new THREE.PointsMaterial({
            color: 0x38bdf8,
            size: 0.08,
            transparent: true,
            opacity: 0.8
        })
        const waterParticles = new THREE.Points(particleGeo, particleMat)
        waterParticles.visible = false
        scene.add(waterParticles)

        // 9. Animation Loop
        let animationFrameId: number
        const clock = new THREE.Clock()

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate)
            const elapsedTime = clock.getElapsedTime()

            // Subtle gentle wind sway
            treeGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.08
            treeGroup.rotation.z = Math.sin(elapsedTime * 0.8) * 0.03

            // Water particles animation if active
            if (waterParticles.visible) {
                const positions = waterParticles.geometry.attributes.position.array as Float32Array
                for (let i = 1; i < particlesCount * 3; i += 3) {
                    positions[i] -= 0.1
                    if (positions[i] < 0) {
                        positions[i] = Math.random() * 3 + 3
                    }
                }
                waterParticles.geometry.attributes.position.needsUpdate = true
            }

            controls.update()
            renderer.render(scene, camera)
        }

        animate()

        // Handle Resize
        const handleResize = () => {
            if (!container) return
            const w = container.clientWidth
            const h = container.clientHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }

        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement)
            }
            renderer.dispose()
        }
    }, [stageLevel, treeType])

    const triggerWateringAnimation = () => {
        setIsWatering(true)
        setWaterEffect(true)
        if (onWaterSuccess) onWaterSuccess()

        setTimeout(() => {
            setIsWatering(false)
            setWaterEffect(false)
        }, 3000)
    }

    return (
        <div className="relative w-full h-[380px] bg-gradient-to-b from-sky-50 via-emerald-50/30 to-emerald-100/50 rounded-3xl overflow-hidden border border-emerald-200/80 shadow-inner flex flex-col justify-between">
            {/* 3D Canvas Mount Point */}
            <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

            {/* Top Control Overlay */}
            <div className="relative z-10 p-4 flex items-start justify-between pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <div>
                        <span className="text-xs font-black text-[#20223A] block">{treeName}</span>
                        <span className="text-[10px] font-bold text-emerald-700">Giai đoạn {stageLevel}/5 • Mô hình 3D</span>
                    </div>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-600 flex items-center gap-1 shadow-2xs">
                        <RotateCw className="w-3 h-3 text-emerald-600 animate-spin" /> Kéo xoay 360°
                    </span>
                </div>
            </div>

            {/* Floating Water Effect Badge */}
            {waterEffect && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-sky-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg animate-bounce flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 fill-white" />
                    <span>Đang tưới nước 3D... (+10 XP)</span>
                </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="relative z-10 p-4 bg-gradient-to-t from-emerald-950/40 to-transparent flex items-center justify-between">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Tỷ lệ tăng trưởng</div>
                        <div className="text-xs font-black text-emerald-800">{growthProgress}% Sức Sống</div>
                    </div>
                </div>

                <button
                    onClick={triggerWateringAnimation}
                    disabled={isWatering}
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                    <Droplets className="w-4 h-4 fill-white" />
                    {isWatering ? 'Đang tưới...' : 'Tưới Nước 3D'}
                </button>
            </div>
        </div>
    )
}
