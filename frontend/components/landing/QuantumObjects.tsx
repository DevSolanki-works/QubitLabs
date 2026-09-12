"use client";

import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { soundManager } from '@/lib/sound'

// --- Custom Shaders ---

// 1. Dynamic Fresnel Glow Material for Superposition Spheres
const createSphereShader = (coreHex: string, glowHex: string) => ({
  uniforms: {
    uTime: { value: 0 },
    uColorCore: { value: new THREE.Color(coreHex) },
    uColorGlow: { value: new THREE.Color(glowHex) },
    uIntensity: { value: 1.5 },
    uHover: { value: 0.0 },
    uFresnelPower: { value: 2.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform float uHover;
    uniform float uTime;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      float pulse = sin(pos.y * 6.0 + uTime * 4.0) * 0.04 * (1.0 + uHover * 2.5);
      pos += normal * pulse;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vPosition = mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorCore;
    uniform vec3 uColorGlow;
    uniform float uIntensity;
    uniform float uHover;
    uniform float uFresnelPower;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), uFresnelPower);
      
      float swirl = sin(vPosition.y * 7.0 + vPosition.x * 4.0 + uTime * 5.0) * 0.5 + 0.5;
      vec3 base = mix(uColorCore, uColorGlow, fresnel * 0.65 + swirl * 0.35);
      vec3 flareColor = mix(base, vec3(1.0, 1.0, 1.0), uHover * 0.65);
      
      float alpha = clamp(fresnel * (uIntensity + uHover * 2.5) + 0.3, 0.0, 1.0);
      gl_FragColor = vec4(flareColor, alpha);
    }
  `,
})

// 2. High-Energy Entanglement Filament Shader
const EnergyFilamentShader = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0.0 },
    uColorA: { value: new THREE.Color('#00f0ff') },
    uColorB: { value: new THREE.Color('#ff00b3') },
    uCoreColor: { value: new THREE.Color('#ffffff') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vPosition = mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uCoreColor;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      float speed = 9.0 + uHover * 18.0;
      float movingStripe1 = sin(vUv.x * 45.0 - uTime * speed) * 0.5 + 0.5;
      float movingStripe2 = cos(vUv.x * 75.0 + uTime * (speed * 1.3)) * 0.5 + 0.5;
      float spark = pow(movingStripe1 * movingStripe2, 2.0) * (1.8 + uHover * 3.0);
      
      vec3 grad = mix(uColorA, uColorB, vUv.x);
      vec3 finalColor = mix(grad, uCoreColor, clamp(spark, 0.0, 1.0));

      float edge = sin(vUv.y * 3.14159);
      float alpha = (spark * 0.9 + 0.35 + uHover * 0.5) * edge;
      gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
    }
  `,
}

// 3. Dynamic Waveform Mesh with Interactive Mouse Ripple
const WaveGridShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorLow: { value: new THREE.Color('#002288') },
    uColorMid: { value: new THREE.Color('#00f0ff') },
    uColorPeak: { value: new THREE.Color('#ff0077') },
  },
  vertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      vec2 center1 = vec2(-0.8, 0.1);
      vec2 center2 = vec2(0.8, 0.3);
      float d1 = distance(pos.xy, center1);
      float d2 = distance(pos.xy, center2);
      
      float wave1 = sin(d1 * 6.5 - uTime * 2.8) / (d1 * 1.6 + 1.0);
      float wave2 = sin(d2 * 6.0 - uTime * 2.4) / (d2 * 1.4 + 1.0);
      
      float peak1 = exp(-d1 * d1 * 3.5) * 1.7 * (1.0 + 0.25 * sin(uTime * 3.0));
      float peak2 = exp(-d2 * d2 * 4.2) * 1.3 * (1.0 + 0.25 * cos(uTime * 2.5));

      // Cursor ripple
      float dMouse = distance(pos.xy, uMouse * 2.5);
      float mouseRipple = exp(-dMouse * dMouse * 3.5) * 0.85 * sin(dMouse * 16.0 - uTime * 9.0);

      pos.z = (wave1 * 0.26 + wave2 * 0.22) + peak1 + peak2 + mouseRipple;
      vElevation = pos.z;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorLow;
    uniform vec3 uColorMid;
    uniform vec3 uColorPeak;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      float normElev = clamp((vElevation + 0.2) / 1.7, 0.0, 1.0);
      vec3 col = mix(uColorLow, uColorMid, smoothstep(0.0, 0.45, normElev));
      col = mix(col, uColorPeak, smoothstep(0.45, 1.0, normElev));

      float gridX = step(0.89, sin(vUv.x * 3.14159 * 52.0));
      float gridY = step(0.89, sin(vUv.y * 3.14159 * 52.0));
      float c = max(gridX, gridY);

      gl_FragColor = vec4(col * (c * 0.85 + 0.35), c * 0.85 + 0.25);
    }
  `,
}

interface QuantumObjectsProps {
  progressRef: React.RefObject<number> | { current: number }
  blochGate?: string
}

export function QuantumObjects({ progressRef, blochGate = 'NONE' }: QuantumObjectsProps) {
  // Main groups
  const heroGroupRef = useRef<any>(null)
  const superpositionGroupRef = useRef<any>(null)
  const circuitGroupRef = useRef<any>(null)
  const waveGroupRef = useRef<any>(null)
  const appGroupRef = useRef<any>(null)

  // Sub references
  const sphere0Ref = useRef<any>(null)
  const sphere1Ref = useRef<any>(null)
  const sphere0MeshRef = useRef<any>(null)
  const sphere1MeshRef = useRef<any>(null)
  const bridgeRef = useRef<any>(null)
  const gateHRef = useRef<any>(null)
  const gateXRef = useRef<any>(null)
  const gateCNOTRef = useRef<any>(null)
  const chipRef = useRef<any>(null)
  const blochInteractiveRef = useRef<any>(null)
  const blochStateVectorRef = useRef<any>(null)
  const mouseLightRef = useRef<any>(null)

  // Hover states - 100% rock-solid
  const [hoverHero, setHoverHero] = useState(false)
  const [hoverSphere0, setHoverSphere0] = useState(false)
  const [hoverSphere1, setHoverSphere1] = useState(false)
  const [hoverBridge, setHoverBridge] = useState(false)
  const [hoverGateH, setHoverGateH] = useState(false)
  const [hoverGateX, setHoverGateX] = useState(false)
  const [hoverCNOT, setHoverCNOT] = useState(false)
  const [hoverChip, setHoverChip] = useState(false)
  const [hoverBloch, setHoverBloch] = useState(false)

  // Smooth scroll tracking
  const smoothProgress = useRef(0)

  // Transparent Hit Material (100% invisible to human eyes, 100% solid & reliable to Three.js Raycaster)
  const hitMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      }),
    []
  )

  // Shaders
  const sphereMat0 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...createSphereShader('#00f0ff', '#4f39f6'),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  const sphereMat1 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...createSphereShader('#e024c3', '#00f0ff'),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  const filamentMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...EnergyFilamentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  const waveMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...WaveGridShader,
        transparent: true,
        wireframe: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  // Normalized Bezier curve for entanglement bridge (-1.0 to +1.0 along X)
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.0, 0, 0),
      new THREE.Vector3(-0.5, 0.26, 0.2),
      new THREE.Vector3(0, -0.20, -0.15),
      new THREE.Vector3(0.5, 0.26, 0.2),
      new THREE.Vector3(1.0, 0, 0),
    ])
  }, [])

  // Quantum star dust
  const particleCount = 280
  const [particlePositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 18
      pos[i + 1] = (Math.random() - 0.5) * 14
      pos[i + 2] = (Math.random() - 0.5) * 10 - 2
    }
    return [pos]
  }, [])

  // Target angles for Bloch vector
  const targetBlochAngles = useRef({ theta: Math.PI / 4, phi: 0 })

  useMemo(() => {
    if (blochGate === 'H') {
      targetBlochAngles.current = { theta: Math.PI / 2, phi: 0 } // |+>
    } else if (blochGate === 'X') {
      targetBlochAngles.current = { theta: Math.PI, phi: 0 } // |1>
    } else if (blochGate === 'Z') {
      targetBlochAngles.current = { theta: Math.PI / 2, phi: Math.PI } // |->
    } else if (blochGate === 'RESET') {
      targetBlochAngles.current = { theta: 0.05, phi: 0 } // |0>
    }
  }, [blochGate])

  // Frame tick
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const mouse = state.pointer

    // Dynamic viewport & screen responsiveness
    const isMobile = state.size.width < 768
    const isTablet = state.size.width >= 768 && state.size.width < 1024

    // Responsive positioning targets:
    // On desktop: keep objects on the right side (x = 2.10) where they belong!
    // On mobile: objects are horizontally centered (x = 0) and vertically offset slightly below the text
    const baseObjX = isMobile ? 0.0 : (isTablet ? 1.35 : 2.15)
    const baseObjY = isMobile ? -0.32 : 0.0
    const baseScale = isMobile ? 0.65 : (isTablet ? 0.85 : 0.95)

    // 1. Damped scroll progress (snaps to slide targets with smooth inertia)
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      progressRef.current || 0,
      4.2,
      delta
    )
    const p = smoothProgress.current

    // 2. Dynamic Interactive Mouse Point Light in 3D space
    if (mouseLightRef.current) {
      const targetLightX = mouse.x * (isMobile ? 2.5 : 4.8)
      const targetLightY = mouse.y * (isMobile ? 2.0 : 3.2)
      mouseLightRef.current.position.x = THREE.MathUtils.damp(
        mouseLightRef.current.position.x,
        targetLightX,
        10.0,
        delta
      )
      mouseLightRef.current.position.y = THREE.MathUtils.damp(
        mouseLightRef.current.position.y,
        targetLightY,
        10.0,
        delta
      )
    }

    // 3. Cinematic Camera Choreography along the 6 snapped slides
    let targetCamX = 0
    let targetCamY = 0
    let targetCamZ = 7.0

    if (isMobile) {
      // Mobile camera: centered, pulled back to z = 9.0 for full, generous framing of 3D objects
      targetCamX = mouse.x * 0.12
      targetCamY = mouse.y * 0.12
      targetCamZ = 9.0
      state.camera.lookAt(0, -0.2, 0)
    } else {
      // Desktop camera: focused on right side
      targetCamX = 0.5 + mouse.x * 0.25
      targetCamY = mouse.y * 0.2
      targetCamZ = 7.0

      if (p < 0.15) {
        // Slide 0: Hero
        targetCamX = 0.4 + mouse.x * 0.25
      } else if (p >= 0.15 && p < 0.35) {
        // Slide 1: Superposition
        targetCamX = 0.5 + mouse.x * 0.25
      } else if (p >= 0.35 && p < 0.55) {
        // Slide 2: Entanglement (both spheres + bridge 100% visible on right)
        targetCamX = 0.5 + mouse.x * 0.25
      } else if (p >= 0.55 && p < 0.75) {
        // Slide 3: Circuit (isometric elevated angle)
        targetCamX = 0.5 + mouse.x * 0.25
        targetCamY = 0.3 + mouse.y * 0.2
      } else if (p >= 0.75 && p < 0.90) {
        // Slide 4: Waveform (low angle)
        targetCamX = 0.5 + mouse.x * 0.25
        targetCamY = -0.2 + mouse.y * 0.2
      } else {
        // Slide 5: Bloch Application
        targetCamX = 0.4 + mouse.x * 0.25
      }
      state.camera.lookAt(0.5, 0, 0)
    }

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetCamX, 3.5, delta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetCamY, 3.5, delta)
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetCamZ, 3.5, delta)

    // Update shaders
    sphereMat0.uniforms.uTime.value = time
    sphereMat1.uniforms.uTime.value = time
    filamentMat.uniforms.uTime.value = time
    waveMat.uniforms.uTime.value = time
    waveMat.uniforms.uMouse.value.set(mouse.x, mouse.y)

    // Hover lerps for shaders
    sphereMat0.uniforms.uHover.value = THREE.MathUtils.damp(
      sphereMat0.uniforms.uHover.value,
      hoverSphere0 ? 1.0 : 0.0,
      8.0,
      delta
    )
    sphereMat1.uniforms.uHover.value = THREE.MathUtils.damp(
      sphereMat1.uniforms.uHover.value,
      hoverSphere1 ? 1.0 : 0.0,
      8.0,
      delta
    )
    filamentMat.uniforms.uHover.value = THREE.MathUtils.damp(
      filamentMat.uniforms.uHover.value,
      hoverBridge ? 1.0 : 0.0,
      8.0,
      delta
    )

    // ----------------------------------------------------
    // STAGE 0: HERO (Slide 0: p = 0.00)
    // ----------------------------------------------------
    if (heroGroupRef.current) {
      const heroAlpha = 1.0 - THREE.MathUtils.smoothstep(p, 0.06, 0.16)
      heroGroupRef.current.visible = heroAlpha > 0.001

      heroGroupRef.current.position.x = THREE.MathUtils.damp(
        heroGroupRef.current.position.x,
        baseObjX,
        6.0,
        delta
      )
      heroGroupRef.current.position.y = THREE.MathUtils.damp(
        heroGroupRef.current.position.y,
        baseObjY,
        6.0,
        delta
      )

      // Magnetic tilt towards cursor
      const heroTiltX = THREE.MathUtils.damp(
        heroGroupRef.current.rotation.x,
        Math.sin(time * 0.3) * 0.15 - mouse.y * (isMobile ? 0.15 : 0.35),
        4.0,
        delta
      )
      heroGroupRef.current.rotation.x = heroTiltX
      heroGroupRef.current.rotation.y = time * (hoverHero ? 0.45 : 0.15) + mouse.x * (isMobile ? 0.15 : 0.35)

      const heroScale = THREE.MathUtils.damp(
        heroGroupRef.current.scale.x,
        heroAlpha * baseScale * (isMobile ? 1.08 : 1.14) * (hoverHero ? 1.2 : 1.0),
        6.0,
        delta
      )
      heroGroupRef.current.scale.setScalar(heroScale)
    }

    // ----------------------------------------------------
    // STAGE 1 & 2: SUPERPOSITION & ENTANGLEMENT (Slide 1: p=0.20, Slide 2: p=0.40)
    // ----------------------------------------------------
    if (superpositionGroupRef.current) {
      let superAlpha = 0
      if (p >= 0.08 && p < 0.16) {
        superAlpha = THREE.MathUtils.smoothstep(p, 0.08, 0.16)
      } else if (p >= 0.16 && p <= 0.46) {
        superAlpha = 1.0
      } else if (p > 0.46 && p <= 0.54) {
        superAlpha = 1.0 - THREE.MathUtils.smoothstep(p, 0.46, 0.54)
      }

      superpositionGroupRef.current.visible = superAlpha > 0.001

      superpositionGroupRef.current.position.x = THREE.MathUtils.damp(
        superpositionGroupRef.current.position.x,
        baseObjX,
        6.0,
        delta
      )
      superpositionGroupRef.current.position.y = THREE.MathUtils.damp(
        superpositionGroupRef.current.position.y,
        baseObjY,
        6.0,
        delta
      )
      superpositionGroupRef.current.rotation.y = THREE.MathUtils.damp(
        superpositionGroupRef.current.rotation.y,
        Math.sin(time * 0.2) * 0.1 + mouse.x * (isMobile ? 0.15 : 0.25),
        4.0,
        delta
      )

      // Slide 1 (Superposition): comfortable separated distance, NEVER touching or meeting!
      const baseSpread = isMobile ? 0.86 : (isTablet ? 1.15 : 1.38)
      // Slide 2 (Entanglement): expanded distance so the bridge spans two clearly separated qubits
      const entangledSpread = isMobile ? 1.12 : (isTablet ? 1.45 : 1.76)

      // Smooth expansion between Slide 1 (p ~ 0.20) and Slide 2 (p ~ 0.40)
      const expandProgress = THREE.MathUtils.smoothstep(p, 0.22, 0.38)
      const currentSpread = THREE.MathUtils.lerp(baseSpread, entangledSpread, expandProgress)

      if (sphere0Ref.current && sphere1Ref.current) {
        const sphereScale = (isMobile ? 0.76 : 1.0)
        const targetScale0 = superAlpha * sphereScale * (hoverSphere0 ? 1.12 : 1.0)
        const targetScale1 = superAlpha * sphereScale * (hoverSphere1 ? 1.12 : 1.0)

        sphere0Ref.current.scale.setScalar(
          THREE.MathUtils.damp(sphere0Ref.current.scale.x, targetScale0, 8.0, delta)
        )
        sphere1Ref.current.scale.setScalar(
          THREE.MathUtils.damp(sphere1Ref.current.scale.x, targetScale1, 8.0, delta)
        )

        sphere0Ref.current.position.x = -currentSpread
        sphere1Ref.current.position.x = currentSpread
        sphere0Ref.current.position.y = Math.sin(time * 1.6) * 0.06 + (hoverSphere0 ? 0.1 : 0)
        sphere1Ref.current.position.y = Math.cos(time * 1.6) * 0.06 + (hoverSphere1 ? 0.1 : 0)

        // Rotate only internal 3D meshes so the state labels ALWAYS face the user and never turn backward!
        if (sphere0MeshRef.current) {
          sphere0MeshRef.current.rotation.y = time * (hoverSphere0 ? 0.65 : 0.3)
        }
        if (sphere1MeshRef.current) {
          sphere1MeshRef.current.rotation.y = -time * (hoverSphere1 ? 0.65 : 0.3)
        }
      }

      // Entanglement bridge filament: active at Slide 2 (p = 0.40)
      if (bridgeRef.current) {
        let bridgeAlpha = 0
        if (p >= 0.26 && p < 0.35) {
          bridgeAlpha = THREE.MathUtils.smoothstep(p, 0.26, 0.35)
        } else if (p >= 0.35 && p <= 0.46) {
          bridgeAlpha = 1.0
        } else if (p > 0.46 && p <= 0.54) {
          bridgeAlpha = 1.0 - THREE.MathUtils.smoothstep(p, 0.46, 0.54)
        }

        bridgeRef.current.visible = bridgeAlpha > 0.001
        bridgeRef.current.scale.set(
          currentSpread * bridgeAlpha,
          (hoverBridge ? 1.35 : 1.0) * bridgeAlpha * (isMobile ? 0.75 : 1.0),
          (hoverBridge ? 1.35 : 1.0) * bridgeAlpha * (isMobile ? 0.75 : 1.0)
        )
      }
    }

    // ----------------------------------------------------
    // STAGE 3: PHYSICAL CIRCUITS (Slide 3: p = 0.60)
    // ----------------------------------------------------
    if (circuitGroupRef.current) {
      let circuitAlpha = 0
      if (p >= 0.52 && p < 0.58) {
        circuitAlpha = THREE.MathUtils.smoothstep(p, 0.52, 0.58)
      } else if (p >= 0.58 && p <= 0.66) {
        circuitAlpha = 1.0
      } else if (p > 0.66 && p <= 0.74) {
        circuitAlpha = 1.0 - THREE.MathUtils.smoothstep(p, 0.66, 0.74)
      }

      circuitGroupRef.current.visible = circuitAlpha > 0.001
      circuitGroupRef.current.scale.setScalar(circuitAlpha * 1.15 * baseScale)

      circuitGroupRef.current.position.x = THREE.MathUtils.damp(
        circuitGroupRef.current.position.x,
        baseObjX,
        6.0,
        delta
      )
      circuitGroupRef.current.position.y = THREE.MathUtils.damp(
        circuitGroupRef.current.position.y,
        baseObjY,
        6.0,
        delta
      )

      // Isometric orientation + magnetic responsive tilt
      circuitGroupRef.current.rotation.x = 0.62 + Math.sin(time * 0.35) * 0.02 - mouse.y * (isMobile ? 0.1 : 0.25)
      circuitGroupRef.current.rotation.y = -0.52 + Math.cos(time * 0.35) * 0.02 + mouse.x * (isMobile ? 0.1 : 0.3)
      circuitGroupRef.current.rotation.z = 0.30

      // Gate levitations on hover
      if (gateHRef.current) {
        gateHRef.current.position.z = THREE.MathUtils.damp(
          gateHRef.current.position.z,
          hoverGateH ? 0.55 : 0.0,
          8.0,
          delta
        )
        gateHRef.current.scale.setScalar(
          THREE.MathUtils.damp(gateHRef.current.scale.x, hoverGateH ? 1.35 : 1.0, 8.0, delta)
        )
      }
      if (gateXRef.current) {
        gateXRef.current.rotation.y += hoverGateX ? 0.12 : 0
        gateXRef.current.scale.setScalar(
          THREE.MathUtils.damp(gateXRef.current.scale.x, hoverGateX ? 1.35 : 1.0, 8.0, delta)
        )
      }
      if (gateCNOTRef.current) {
        gateCNOTRef.current.scale.setScalar(
          THREE.MathUtils.damp(gateCNOTRef.current.scale.x, hoverCNOT ? 1.35 : 1.0, 8.0, delta)
        )
      }
      if (chipRef.current) {
        chipRef.current.rotation.y = hoverChip ? time * 1.0 : -0.3
        chipRef.current.scale.setScalar(
          THREE.MathUtils.damp(chipRef.current.scale.x, hoverChip ? 1.25 : 1.0, 8.0, delta)
        )
      }
    }

    // ----------------------------------------------------
    // STAGE 4: WAVEFORM GRID (Slide 4: p = 0.80)
    // ----------------------------------------------------
    if (waveGroupRef.current) {
      let waveAlpha = 0
      if (p >= 0.72 && p < 0.78) {
        waveAlpha = THREE.MathUtils.smoothstep(p, 0.72, 0.78)
      } else if (p >= 0.78 && p <= 0.86) {
        waveAlpha = 1.0
      } else if (p > 0.86 && p <= 0.92) {
        waveAlpha = 1.0 - THREE.MathUtils.smoothstep(p, 0.86, 0.92)
      }

      waveGroupRef.current.visible = waveAlpha > 0.001
      waveGroupRef.current.scale.setScalar(waveAlpha * 1.08 * baseScale)

      waveGroupRef.current.position.x = THREE.MathUtils.damp(
        waveGroupRef.current.position.x,
        baseObjX,
        6.0,
        delta
      )
      waveGroupRef.current.position.y = THREE.MathUtils.damp(
        waveGroupRef.current.position.y,
        baseObjY + (isMobile ? 0.1 : -0.3),
        6.0,
        delta
      )

      waveGroupRef.current.rotation.x = -1.02 + Math.sin(time * 0.25) * 0.04 - mouse.y * (isMobile ? 0.1 : 0.25)
      waveGroupRef.current.rotation.z = -0.42 + Math.cos(time * 0.25) * 0.04 + mouse.x * (isMobile ? 0.1 : 0.3)
    }

    // ----------------------------------------------------
    // STAGE 5: BLOCH APPLICATION (Slide 5: p = 1.00)
    // ----------------------------------------------------
    if (appGroupRef.current) {
      const appAlpha = THREE.MathUtils.smoothstep(p, 0.88, 0.96)
      appGroupRef.current.visible = appAlpha > 0.001

      appGroupRef.current.position.x = THREE.MathUtils.damp(
        appGroupRef.current.position.x,
        baseObjX,
        6.0,
        delta
      )
      appGroupRef.current.position.y = THREE.MathUtils.damp(
        appGroupRef.current.position.y,
        baseObjY + (isMobile ? 0.1 : 0.0),
        6.0,
        delta
      )

      const blochScale = THREE.MathUtils.damp(
        appGroupRef.current.scale.x,
        appAlpha * 1.25 * baseScale * (hoverBloch ? 1.15 : 1.0),
        6.0,
        delta
      )
      appGroupRef.current.scale.setScalar(blochScale)

      if (blochInteractiveRef.current) {
        blochInteractiveRef.current.rotation.y =
          time * 0.3 + (hoverBloch ? mouse.x * 1.4 : mouse.x * 0.3)
        blochInteractiveRef.current.rotation.x =
          Math.sin(time * 0.2) * 0.15 - (hoverBloch ? mouse.y * 1.2 : mouse.y * 0.2)
      }

      if (blochStateVectorRef.current) {
        const { theta, phi } = targetBlochAngles.current
        const r = 1.25
        const targetX = r * Math.sin(theta) * Math.cos(phi)
        const targetY = r * Math.cos(theta)
        const targetZ = r * Math.sin(theta) * Math.sin(phi)

        blochStateVectorRef.current.position.x = THREE.MathUtils.damp(
          blochStateVectorRef.current.position.x,
          targetX,
          5.0,
          delta
        )
        blochStateVectorRef.current.position.y = THREE.MathUtils.damp(
          blochStateVectorRef.current.position.y,
          targetY,
          5.0,
          delta
        )
        blochStateVectorRef.current.position.z = THREE.MathUtils.damp(
          blochStateVectorRef.current.position.z,
          targetZ,
          5.0,
          delta
        )
      }
    }
  })

  return (
    <>
      {/* 3D Realtime Mouse Point Light (Specular reflections dynamically follow cursor) */}
      <pointLight
        ref={mouseLightRef}
        position={[0, 0, 2.5]}
        intensity={3.8}
        distance={8.0}
        color="#00f0ff"
      />

      {/* Background Quantum Dust */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#00f0ff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 1. HERO BLOCH ORBITALS */}
      <group ref={heroGroupRef} position={[0, 0, 0]}>
        {/* SOLID INVISIBLE HITBOX (Catches 100% of raycasts across full volume) */}
        <mesh
          material={hitMat}
          onClick={(e) => {
            e.stopPropagation()
            soundManager.playQuantumTopic('singularity')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHoverHero(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setHoverHero(false)
            document.body.style.cursor = 'auto'
          }}
        >
          <sphereGeometry args={[2.3, 16, 16]} />
        </mesh>

        <mesh>
          <sphereGeometry args={[2.0, 32, 32]} />
          <meshBasicMaterial
            wireframe
            color={hoverHero ? '#00f0ff' : '#4d70b8'}
            transparent
            opacity={hoverHero ? 0.55 : 0.28}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.98, 2.03, 64]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={hoverHero ? 0.95 : 0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[0.4, 0.8, 0]}>
          <ringGeometry args={[1.98, 2.03, 64]} />
          <meshBasicMaterial
            color="#e024c3"
            transparent
            opacity={hoverHero ? 0.9 : 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[-0.6, -0.4, 0]}>
          <ringGeometry args={[1.98, 2.03, 64]} />
          <meshBasicMaterial
            color="#6f8cff"
            transparent
            opacity={hoverHero ? 0.9 : 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[hoverHero ? 0.18 : 0.12, 16, 16]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </group>

      {/* 2. & 3. SUPERPOSITION & ENTANGLEMENT (Separated right-aligned 3D pair) */}
      <group ref={superpositionGroupRef} position={[0, 0, 0]}>
        {/* State |0> Sphere */}
        <group ref={sphere0Ref} position={[0, 0, 0]}>
          {/* SOLID INVISIBLE HITBOX */}
          <mesh
            material={hitMat}
            onClick={(e) => {
              e.stopPropagation()
              soundManager.playQuantumTopic('ground_state')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoverSphere0(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setHoverSphere0(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <sphereGeometry args={[1.18, 16, 16]} />
          </mesh>

          {/* Rotating internal 3D visuals */}
          <group ref={sphere0MeshRef}>
            <mesh material={sphereMat0}>
              <sphereGeometry args={[0.78, 48, 48]} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.92, 24, 24]} />
              <meshBasicMaterial
                color="#00f0ff"
                transparent
                opacity={hoverSphere0 ? 0.55 : 0.18}
                wireframe
              />
            </mesh>
            {/* Subtle quantum orbital equator ring */}
            <mesh rotation={[1.1, 0.3, 0]}>
              <ringGeometry args={[1.01, 1.04, 48]} />
              <meshBasicMaterial
                color="#00f0ff"
                transparent
                opacity={hoverSphere0 ? 0.65 : 0.28}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>

          {/* Front-Facing Billboard State Label: NEVER turns backward or sideways! */}
          <Billboard position={[0, 0, 1.02]}>
            <Text fontSize={0.48} color="#ffffff" anchorX="center" anchorY="middle">
              |0⟩
            </Text>
          </Billboard>

          {/* Hover Info: Pure text, zero boxes */}
          {hoverSphere0 && (
            <Billboard position={[0, 1.45, 0]}>
              <Text position={[0, 0.12, 0]} fontSize={0.20} color="#00f0ff" anchorX="center" anchorY="middle">
                Ground State |0⟩
              </Text>
              <Text position={[0, -0.12, 0]} fontSize={0.14} color="#b0bece" anchorX="center" anchorY="middle">
                Probability P(|0⟩) = |α|²
              </Text>
            </Billboard>
          )}
        </group>

        {/* State |1> Sphere */}
        <group ref={sphere1Ref} position={[0, 0, 0]}>
          {/* SOLID INVISIBLE HITBOX */}
          <mesh
            material={hitMat}
            onClick={(e) => {
              e.stopPropagation()
              soundManager.playQuantumTopic('excited_state')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoverSphere1(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setHoverSphere1(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <sphereGeometry args={[1.18, 16, 16]} />
          </mesh>

          {/* Rotating internal 3D visuals */}
          <group ref={sphere1MeshRef}>
            <mesh material={sphereMat1}>
              <sphereGeometry args={[0.78, 48, 48]} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.92, 24, 24]} />
              <meshBasicMaterial
                color="#e024c3"
                transparent
                opacity={hoverSphere1 ? 0.55 : 0.18}
                wireframe
              />
            </mesh>
            {/* Subtle quantum orbital equator ring */}
            <mesh rotation={[-1.1, -0.3, 0]}>
              <ringGeometry args={[1.01, 1.04, 48]} />
              <meshBasicMaterial
                color="#e024c3"
                transparent
                opacity={hoverSphere1 ? 0.65 : 0.28}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>

          {/* Front-Facing Billboard State Label: NEVER turns backward or sideways! */}
          <Billboard position={[0, 0, 1.02]}>
            <Text fontSize={0.48} color="#ffffff" anchorX="center" anchorY="middle">
              |1⟩
            </Text>
          </Billboard>

          {/* Hover Info: Pure text, zero boxes */}
          {hoverSphere1 && (
            <Billboard position={[0, 1.45, 0]}>
              <Text position={[0, 0.12, 0]} fontSize={0.20} color="#e024c3" anchorX="center" anchorY="middle">
                Excited State |1⟩
              </Text>
              <Text position={[0, -0.12, 0]} fontSize={0.14} color="#b0bece" anchorX="center" anchorY="middle">
                Probability P(|1⟩) = |β|²
              </Text>
            </Billboard>
          )}
        </group>

        {/* Entanglement Bridge */}
        <group ref={bridgeRef}>
          {/* SOLID INVISIBLE HITBOX */}
          <mesh
            material={hitMat}
            onClick={(e) => {
              e.stopPropagation()
              soundManager.playQuantumTopic('entanglement')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoverBridge(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setHoverBridge(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <tubeGeometry args={[curve, 32, 0.45, 8, false]} />
          </mesh>

          <mesh material={filamentMat}>
            <tubeGeometry args={[curve, 64, 0.08, 12, false]} />
          </mesh>
        </group>

        {/* Bridge Hover Info: Pure text, zero boxes */}
        {hoverBridge && (
          <Billboard position={[0, 1.25, 0]}>
            <Text position={[0, 0.12, 0]} fontSize={0.20} color="#ff00b3" anchorX="center" anchorY="middle">
              Quantum Bridge |Φ⁺⟩
            </Text>
            <Text position={[0, -0.12, 0]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
              Maximal Bell State Entanglement
            </Text>
          </Billboard>
        )}
      </group>

      {/* 4. QUANTUM CIRCUIT RAILS & GATES */}
      <group ref={circuitGroupRef} position={[0, 0, 0]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 5.6, 16]} />
          <meshStandardMaterial color="#9cb5ea" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 5.6, 16]} />
          <meshStandardMaterial color="#9cb5ea" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Gate H */}
        <group ref={gateHRef} position={[-1.2, 0.8, 0]}>
          {/* SOLID INVISIBLE HITBOX */}
          <mesh
            material={hitMat}
            onClick={(e) => {
              e.stopPropagation()
              soundManager.playQuantumTopic('gate_h')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoverGateH(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setHoverGateH(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <boxGeometry args={[1.0, 1.0, 0.7]} />
          </mesh>

          <mesh>
            <boxGeometry args={[0.68, 0.68, 0.36]} />
            <meshStandardMaterial
              color={hoverGateH ? '#22487e' : '#141e30'}
              emissive="#00f0ff"
              emissiveIntensity={hoverGateH ? 1.0 : 0.35}
              metalness={0.75}
              roughness={0.2}
            />
          </mesh>
          <Text position={[0, 0, 0.21]} fontSize={0.34} color="#00f0ff" anchorX="center" anchorY="middle">
            H
          </Text>
        </group>

        {/* CNOT Control & Target */}
        <group ref={gateCNOTRef} position={[0.2, 0.8, 0]}>
          <mesh
            material={hitMat}
            position={[0, -0.6, 0]}
            onClick={(e) => {
              e.stopPropagation()
              soundManager.playQuantumTopic('cnot')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoverCNOT(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setHoverCNOT(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <boxGeometry args={[0.9, 1.8, 0.7]} />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={hoverCNOT ? 1.0 : 0.7}
            />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.2, 12]} />
            <meshStandardMaterial
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={hoverCNOT ? 0.9 : 0.5}
            />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
            <torusGeometry args={[0.24, 0.045, 16, 32]} />
            <meshStandardMaterial
              color="#e024c3"
              emissive="#e024c3"
              emissiveIntensity={hoverCNOT ? 1.0 : 0.65}
            />
          </mesh>
        </group>

        {/* Gate X */}
        <group ref={gateXRef} position={[1.4, -0.4, 0]}>
          <mesh
            material={hitMat}
            onClick={(e) => {
              e.stopPropagation()
              soundManager.playQuantumTopic('gate_x')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoverGateX(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setHoverGateX(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <boxGeometry args={[1.0, 1.0, 0.7]} />
          </mesh>

          <mesh>
            <boxGeometry args={[0.68, 0.68, 0.36]} />
            <meshStandardMaterial
              color={hoverGateX ? '#481c5c' : '#23122e'}
              emissive="#e024c3"
              emissiveIntensity={hoverGateX ? 1.0 : 0.35}
              metalness={0.75}
              roughness={0.2}
            />
          </mesh>
          <Text position={[0, 0, 0.21]} fontSize={0.34} color="#e024c3" anchorX="center" anchorY="middle">
            X
          </Text>
        </group>

        {/* Quantum IC Package */}
        <group ref={chipRef} position={[2.2, 1.2, 0.4]} rotation={[0.2, -0.3, 0.1]}>
          <mesh
            material={hitMat}
            onClick={(e) => {
              e.stopPropagation()
              soundManager.playQuantumTopic('qpu_chip')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoverChip(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setHoverChip(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <boxGeometry args={[1.6, 1.6, 0.6]} />
          </mesh>

          <mesh>
            <boxGeometry args={[1.15, 1.15, 0.14]} />
            <meshStandardMaterial
              color={hoverChip ? '#182740' : '#0c1017'}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.64, 0.64, 0.02]} />
            <meshStandardMaterial
              color={hoverChip ? '#ffe655' : '#ffd700'}
              metalness={0.95}
              roughness={0.15}
              emissive={hoverChip ? '#ffa500' : '#000000'}
              emissiveIntensity={hoverChip ? 0.35 : 0}
            />
          </mesh>
          {[-0.45, -0.2, 0.05, 0.3].map((x, idx) => (
            <mesh key={idx} position={[x, -0.65, 0]}>
              <boxGeometry args={[0.08, 0.16, 0.04]} />
              <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 5. DATA / WAVEFORM PROBABILITY MESH */}
      <group ref={waveGroupRef} position={[0, -0.3, 0]}>
        <mesh
          material={waveMat}
          onClick={(e) => {
            e.stopPropagation()
            soundManager.playQuantumTopic('wave_interference')
          }}
          onPointerMove={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'crosshair'
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'auto'
          }}
        >
          <planeGeometry args={[4.8, 4.8, 64, 64]} />
        </mesh>
      </group>

      {/* 6. INTERACTIVE BLOCH SPHERE APP */}
      <group ref={appGroupRef} position={[0, 0, 0]}>
        {/* SOLID INVISIBLE HITBOX FOR FULL SPHERE */}
        <mesh
          material={hitMat}
          onClick={(e) => {
            e.stopPropagation()
            soundManager.playQuantumTopic('bloch_sphere')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHoverBloch(true)
            document.body.style.cursor = 'grab'
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setHoverBloch(false)
            document.body.style.cursor = 'auto'
          }}
        >
          <sphereGeometry args={[1.8, 16, 16]} />
        </mesh>

        <group ref={blochInteractiveRef}>
          <mesh>
            <sphereGeometry args={[1.5, 32, 24]} />
            <meshStandardMaterial
              wireframe
              color={hoverBloch ? '#9cb6f0' : '#5c729e'}
              transparent
              opacity={hoverBloch ? 0.65 : 0.35}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 3.4, 16]} />
            <meshBasicMaterial color="#00f0ff" opacity={0.8} transparent />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.016, 0.016, 3.4, 16]} />
            <meshBasicMaterial color="#e024c3" opacity={0.8} transparent />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 3.4, 16]} />
            <meshBasicMaterial color="#7a8cff" opacity={0.8} transparent />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.49, 1.51, 64]} />
            <meshBasicMaterial
              color="#00f0ff"
              side={THREE.DoubleSide}
              transparent
              opacity={hoverBloch ? 0.95 : 0.6}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[1.49, 1.51, 64]} />
            <meshBasicMaterial
              color="#e024c3"
              side={THREE.DoubleSide}
              transparent
              opacity={hoverBloch ? 0.95 : 0.6}
            />
          </mesh>

          {/* State Vector Arrow */}
          <group ref={blochStateVectorRef} position={[0.7, 0.7, 0]}>
            <mesh>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <cylinderGeometry args={[0.028, 0.006, 1.2, 12]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
          </group>

          <Text position={[0, 1.75, 0]} fontSize={0.28} color="#00f0ff">
            |0⟩
          </Text>
          <Text position={[0, -1.75, 0]} fontSize={0.28} color="#e024c3">
            |1⟩
          </Text>
        </group>
      </group>
    </>
  )
}
