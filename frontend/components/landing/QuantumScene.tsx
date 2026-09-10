"use client";

import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { QuantumObjects } from './QuantumObjects'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface QuantumSceneProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  blochGate?: string
}

export function QuantumScene({ scrollContainerRef, blochGate = 'NONE' }: QuantumSceneProps) {
  const progressRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Native scroll listener fallback
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        progressRef.current = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // 2. GSAP ScrollTrigger with slide-by-slide snapping
    let st: ScrollTrigger | undefined
    if (scrollContainerRef?.current) {
      st = ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
          duration: { min: 0.3, max: 0.6 },
          delay: 0.05,
          ease: 'power2.out',
        },
        scrub: 0.6,
        onUpdate: (self) => {
          progressRef.current = self.progress
        },
      })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (st) st.kill()
    }
  }, [scrollContainerRef])

  return (
    <div
      className="fixed inset-0 w-full h-full h-[100dvh] z-[1] pointer-events-auto bg-[#07080c]"
    >
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 8, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-4, -3, 3]} intensity={4.0} color="#00f0ff" />
        <pointLight position={[4, 3, 3]} intensity={4.0} color="#e024c3" />
        <pointLight position={[0, 4, -2]} intensity={2.0} color="#7a8cff" />

        <Suspense fallback={null}>
          <QuantumObjects progressRef={progressRef} blochGate={blochGate} />
        </Suspense>
      </Canvas>
    </div>
  )
}
