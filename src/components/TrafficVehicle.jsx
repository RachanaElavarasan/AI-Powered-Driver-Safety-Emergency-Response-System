/**
 * SafePilot AI - Traffic Vehicles & Road Obstacles
 * Renders other AI traffic participants (Sedan, SUV, Truck, Obstacle)
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function TrafficVehicle({
  type = 'VEHICLE',
  subType = 'SEDAN',
  lane = 0,
  distanceM = 45.0,
  color = '#cbd5e1',
  speedKmh = 60,
  isObstacle = false,
  isBraking = false,
}) {
  const groupRef = useRef();

  // Dynamic position update: lane mapping to X coordinate (-4.5m, 0m, +4.5m)
  // Distance forward maps to -Z (negative Z is forward)
  const posX = lane * 4.5;
  const posZ = -distanceM;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = posX;
      groupRef.current.position.z = posZ;
    }
  });

  if (isObstacle || type === 'OBSTACLE') {
    return <RoadObstacle groupRef={groupRef} posX={posX} posZ={posZ} />;
  }

  if (subType === 'TRUCK') {
    return <CommercialTruck groupRef={groupRef} posX={posX} posZ={posZ} isBraking={isBraking} />;
  }

  return (
    <group ref={groupRef} position={[posX, 0.35, posZ]}>
      {/* Ground Shadow */}
      <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 4.4]} />
        <meshBasicMaterial color="#000000" opacity={0.6} transparent />
      </mesh>

      {/* Main Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.85, 0.5, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cabin & Windows */}
      <mesh position={[0, 0.65, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.45, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Headlights (forward facing - -Z) */}
      <mesh position={[-0.7, 0.25, -2.11]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.7, 0.25, -2.11]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Tail Lights (rear facing - +Z) */}
      <mesh position={[-0.7, 0.3, 2.11]}>
        <boxGeometry args={[0.32, 0.12, 0.05]} />
        <meshBasicMaterial color={isBraking ? '#ff0033' : '#dc2626'} />
      </mesh>
      <mesh position={[0.7, 0.3, 2.11]}>
        <boxGeometry args={[0.32, 0.12, 0.05]} />
        <meshBasicMaterial color={isBraking ? '#ff0033' : '#dc2626'} />
      </mesh>

      {/* Wheels */}
      <TrafficWheel position={[-0.92, 0.0, -1.2]} speedKmh={speedKmh} />
      <TrafficWheel position={[0.92, 0.0, -1.2]} speedKmh={speedKmh} />
      <TrafficWheel position={[-0.92, 0.0, 1.2]} speedKmh={speedKmh} />
      <TrafficWheel position={[0.92, 0.0, 1.2]} speedKmh={speedKmh} />
    </group>
  );
}

function TrafficWheel({ position, speedKmh = 50 }) {
  const wheelRef = useRef();

  useFrame((_, delta) => {
    if (!wheelRef.current) return;
    const speedMps = (speedKmh * 1000) / 3600;
    const angularVel = speedMps / 0.32;
    wheelRef.current.rotation.x -= angularVel * delta;
  });

  return (
    <group position={position} ref={wheelRef}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.22, 12]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} />
      </mesh>
      {/* Alloy rim with spoke pattern so rotation is clearly visible */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.23, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[0.04, 0.28, 0.02]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

/**
 * Heavy Commercial Truck
 */
function CommercialTruck({ groupRef, posX, posZ, isBraking }) {
  return (
    <group ref={groupRef} position={[posX, 0.5, posZ]}>
      {/* Ground Shadow */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 8.5]} />
        <meshBasicMaterial color="#000000" opacity={0.7} transparent />
      </mesh>

      {/* Truck Cab */}
      <mesh position={[0, 0.8, -3.0]} castShadow>
        <boxGeometry args={[2.4, 2.2, 2.4]} />
        <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Cargo Trailer */}
      <mesh position={[0, 1.3, 0.8]} castShadow>
        <boxGeometry args={[2.5, 2.6, 6.2]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Hazard Warning Stripes on Rear */}
      <mesh position={[0, 0.6, 3.91]}>
        <boxGeometry args={[2.3, 0.4, 0.02]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>

      {/* Rear Tail Lights */}
      <mesh position={[-0.9, 0.5, 3.92]}>
        <boxGeometry args={[0.35, 0.2, 0.04]} />
        <meshBasicMaterial color={isBraking ? '#ff0033' : '#b91c1c'} />
      </mesh>
      <mesh position={[0.9, 0.5, 3.92]}>
        <boxGeometry args={[0.35, 0.2, 0.04]} />
        <meshBasicMaterial color={isBraking ? '#ff0033' : '#b91c1c'} />
      </mesh>
    </group>
  );
}

/**
 * Stationary Cargo / Hazard Obstacle in road
 */
function RoadObstacle({ groupRef, posX, posZ }) {
  return (
    <group ref={groupRef} position={[posX, 0.4, posZ]}>
      {/* Ground Shadow */}
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial color="#000000" opacity={0.65} transparent />
      </mesh>

      {/* Fallen High-Risk Industrial Cargo Container */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[2.2, 1.4, 2.0]} />
        <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Hazard Reflective Band */}
      <mesh position={[0, 0.45, 0]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[2.22, 0.35, 2.02]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      {/* Flashing Hazard Beacon on top */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 12]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color="#ef4444" intensity={4} distance={6} />
    </group>
  );
}
