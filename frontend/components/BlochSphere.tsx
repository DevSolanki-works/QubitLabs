"use client";

import {
  OrbitControls,
  Text,
} from "@react-three/drei";

import { Canvas } from "@react-three/fiber";

import { BlochVector } from "@/lib/quantum";

interface BlochSphereProps {
  vector: BlochVector;
  size?: number;
}

function SphereScene({
  vector,
}: {
  vector: BlochVector;
}) {
  const length = Math.sqrt(
    vector.x ** 2 +
      vector.y ** 2 +
      vector.z ** 2
  );

  const normalized =
    length > 0.000001
      ? {
          x: vector.x / length,
          y: vector.y / length,
          z: vector.z / length,
        }
      : {
          x: 0,
          y: 0,
          z: 0,
        };

  const arrowLength =
    Math.min(length, 1) * 1.35;

  return (
    <>
      {/* Ambient lighting */}

      <ambientLight intensity={1.2} />

      <directionalLight
        position={[3, 4, 5]}
        intensity={2}
      />

      {/* Sphere */}

      <mesh>
        <sphereGeometry
          args={[1.35, 48, 48]}
        />

        <meshBasicMaterial
          transparent
          opacity={0.07}
          wireframe
        />
      </mesh>

      {/* Equator */}

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[1.35, 0.008, 8, 64]}
        />

        <meshBasicMaterial
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Vertical axis */}

      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                0,
                -1.55,
                0,
                0,
                1.55,
                0,
              ]),
              3,
            ]}
          />
        </bufferGeometry>

        <lineBasicMaterial
          transparent
          opacity={0.35}
        />
      </line>

      {/* X axis */}

      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -1.55,
                0,
                0,
                1.55,
                0,
                0,
              ]),
              3,
            ]}
          />
        </bufferGeometry>

        <lineBasicMaterial
          transparent
          opacity={0.25}
        />
      </line>

      {/* Y axis */}

      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                0,
                0,
                -1.55,
                0,
                0,
                1.55,
              ]),
              3,
            ]}
          />
        </bufferGeometry>

        <lineBasicMaterial
          transparent
          opacity={0.25}
        />
      </line>

      {/* State vector */}

      {length > 0.000001 && (
        <>
          <mesh
            position={[
              normalized.x *
                arrowLength,
              normalized.z *
                arrowLength,
              normalized.y *
                arrowLength,
            ]}
          >
            <sphereGeometry
              args={[0.08, 20, 20]}
            />

            <meshStandardMaterial
              emissiveIntensity={2}
            />
          </mesh>

          <mesh
            rotation={[
              0,
              0,
              Math.atan2(
                normalized.x,
                normalized.z
              ),
            ]}
          >
            <cylinderGeometry
              args={[
                0.025,
                0.025,
                arrowLength,
                12,
              ]}
            />

            <meshStandardMaterial
              emissiveIntensity={1.5}
            />
          </mesh>
        </>
      )}

      {/* Labels */}

      <Text
        position={[0, 1.75, 0]}
        fontSize={0.18}
        anchorX="center"
      >
        |0⟩
      </Text>

      <Text
        position={[0, -1.75, 0]}
        fontSize={0.18}
        anchorX="center"
      >
        |1⟩
      </Text>

      <Text
        position={[1.7, 0, 0]}
        fontSize={0.15}
        anchorX="center"
      >
        +X
      </Text>

      <Text
        position={[-1.7, 0, 0]}
        fontSize={0.15}
        anchorX="center"
      >
        -X
      </Text>

      <OrbitControls
        enablePan={false}
        minDistance={2.8}
        maxDistance={5}
      />
    </>
  );
}

export default function BlochSphere({
  vector,
  size = 260,
}: BlochSphereProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-black/10"
      style={{
        width: size,
        height: size,
      }}
    >
      <Canvas
        camera={{
          position: [3, 2.5, 3],
          fov: 45,
        }}
      >
        <SphereScene vector={vector} />
      </Canvas>
    </div>
  );
}