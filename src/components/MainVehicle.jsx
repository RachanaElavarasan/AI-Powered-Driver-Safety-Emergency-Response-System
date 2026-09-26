/**
 * SafePilot AI - Main Autonomous Vehicle 3D Model
 * 
 * Features:
 * - Dynamic interactive steering: Front wheels visibly turn (yaw angle)
 * - Vehicle body heading yaw rotation and suspension roll/pitch
 * - Smooth lateral position transition across highway lanes
 * - Speed-synchronized rolling alloy wheels
 * - Full-width OLED rear brake light bar with emergency strobe
 * - Forward LiDAR dome and projector headlights
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MainVehicle({ physics, riskLevel }) {
  const vehicleGroupRef = useRef();
  const frontLeftSteerRef = useRef();
  const frontRightSteerRef = useRef();
  const frontLeftWheelRef = useRef();
  const frontRightWheelRef = useRef();
  const rearLeftWheelRef = useRef();
  const rearRightWheelRef = useRef();

  useFrame(() => {
    if (!vehicleGroupRef.current) return;
    const time = performance.now() * 0.001;
    const isMoving = physics.speedKmh > 0.5;

    // Road texture micro-vibration
    const roadVibration = isMoving ? Math.sin(time * 30) * 0.004 * (physics.speedKmh / 80) : 0;

    // Dynamic 3D Position & Rotation
    vehicleGroupRef.current.position.y = 0.32 + roadVibration;
    vehicleGroupRef.current.rotation.x = physics.pitch || 0; // nose dip on brake
    vehicleGroupRef.current.rotation.z = physics.roll || 0; // body roll on turn
    vehicleGroupRef.current.rotation.y = -(physics.vehicleRotation || 0); // body heading yaw

    // Lateral X position
    const targetX = physics.vehicleX !== undefined ? physics.vehicleX : (physics.laneOffset || 0) * 2.25;
    vehicleGroupRef.current.position.x = THREE.MathUtils.lerp(
      vehicleGroupRef.current.position.x,
      targetX,
      0.15
    );

    // Front Wheel Steering Yaw Angle
    const steerYaw = physics.frontWheelYaw || 0;
    if (frontLeftSteerRef.current) frontLeftSteerRef.current.rotation.y = -steerYaw;
    if (frontRightSteerRef.current) frontRightSteerRef.current.rotation.y = -steerYaw;

    // Rolling Wheel Rotation (Forward driving)
    const rot = physics.wheelRotation || 0;
    if (frontLeftWheelRef.current) frontLeftWheelRef.current.rotation.x = -rot;
    if (frontRightWheelRef.current) frontRightWheelRef.current.rotation.x = -rot;
    if (rearLeftWheelRef.current) rearLeftWheelRef.current.rotation.x = -rot;
    if (rearRightWheelRef.current) rearRightWheelRef.current.rotation.x = -rot;
  });

  const isBraking = (physics.brakingPercent || 0) > 8 || physics.brakeActive;
  const isEmergency = riskLevel === 'CRITICAL';

  return (
    <group ref={vehicleGroupRef} position={[0, 0.32, 0]}>
      {/* 1. Ground Shadow (Soft AO blob) */}
      <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 4.8]} />
        <meshBasicMaterial color="#000000" opacity={0.65} transparent />
      </mesh>

      {/* 2. Main Lower Chassis (Aerodynamic Gunmetal Body) */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.9, 0.45, 4.3]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.85}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* 3. Sleek Cabin & Tinted Glass Canopy */}
      <mesh position={[0, 0.65, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.45, 2.4]} />
        <meshStandardMaterial
          color="#050811"
          metalness={0.9}
          roughness={0.1}
          opacity={0.88}
          transparent
        />
      </mesh>

      {/* 4. Aerodynamic Front Hood Slope */}
      <mesh
        position={[0, 0.35, -1.6]}
        rotation={[Math.PI / 8, 0, 0]}
        castShadow
      >
        <boxGeometry args={[1.82, 0.25, 1.2]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* 5. Rear Fastback Tail Slope */}
      <mesh
        position={[0, 0.45, 1.3]}
        rotation={[-Math.PI / 10, 0, 0]}
        castShadow
      >
        <boxGeometry args={[1.75, 0.3, 1.3]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* 6. Roof LiDAR Sensor Pod (Autonomous Vision Dome) */}
      <group position={[0, 0.92, -0.2]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.26, 0.12, 16]} />
          <meshStandardMaterial color="#030712" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Glowing LiDAR scan ring */}
        <mesh position={[0, 0.02, 0]}>
          <torusGeometry args={[0.24, 0.02, 8, 24]} />
          <meshBasicMaterial color="#00f2ff" />
        </mesh>
      </group>

      {/* 7. Front High-Intensity LED Headlights */}
      {/* Left Headlight */}
      <group position={[-0.72, 0.25, -2.15]}>
        <mesh>
          <boxGeometry args={[0.35, 0.08, 0.1]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <spotLight
          position={[0, 0, 0]}
          target-position={[0, -0.5, -25]}
          color="#e0f2fe"
          intensity={8}
          distance={45}
          angle={Math.PI / 6}
          penumbra={0.4}
        />
      </group>
      {/* Right Headlight */}
      <group position={[0.72, 0.25, -2.15]}>
        <mesh>
          <boxGeometry args={[0.35, 0.08, 0.1]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <spotLight
          position={[0, 0, 0]}
          target-position={[0, -0.5, -25]}
          color="#e0f2fe"
          intensity={8}
          distance={45}
          angle={Math.PI / 6}
          penumbra={0.4}
        />
      </group>

      {/* Front Lightbar Accent (Sleek EV Monobrow) */}
      <mesh position={[0, 0.25, -2.16]}>
        <boxGeometry args={[1.5, 0.03, 0.05]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* 8. Rear Full-Width OLED Tail Light Bar */}
      <group position={[0, 0.35, 2.16]}>
        <mesh>
          <boxGeometry args={[1.7, 0.1, 0.05]} />
          <meshBasicMaterial
            color={isEmergency ? '#ff0033' : isBraking ? '#ef4444' : '#991b1b'}
          />
        </mesh>
        {/* Glow point light during braking */}
        {isBraking && (
          <pointLight
            position={[0, 0, 0.5]}
            color="#ef4444"
            intensity={isEmergency ? 14 : 7}
            distance={9}
          />
        )}
      </group>

      {/* 9. Four Alloy Wheels: Front wheels turn with steering knuckles */}
      {/* Front Left Wheel with Steering Knuckle */}
      <group position={[-0.95, 0.0, -1.3]} ref={frontLeftSteerRef}>
        <group ref={frontLeftWheelRef}>
          <Wheel isLeft />
        </group>
      </group>

      {/* Front Right Wheel with Steering Knuckle */}
      <group position={[0.95, 0.0, -1.3]} ref={frontRightSteerRef}>
        <group ref={frontRightWheelRef}>
          <Wheel isLeft={false} />
        </group>
      </group>

      {/* Rear Left (Fixed yaw, spins on X) */}
      <group position={[-0.95, 0.0, 1.3]} ref={rearLeftWheelRef}>
        <Wheel isLeft />
      </group>

      {/* Rear Right (Fixed yaw, spins on X) */}
      <group position={[0.95, 0.0, 1.3]} ref={rearRightWheelRef}>
        <Wheel isLeft={false} />
      </group>

      {/* 10. Front Radar Sensor Pod */}
      <mesh position={[0, 0.12, -2.16]}>
        <boxGeometry args={[0.3, 0.12, 0.08]} />
        <meshBasicMaterial color="#00f2ff" />
      </mesh>
    </group>
  );
}

/**
 * Procedural Wheel with Rubber Tire, Spoke Rim, and Disc Brake
 */
function Wheel({ isLeft = true }) {
  return (
    <group rotation={[0, isLeft ? -Math.PI / 2 : Math.PI / 2, 0]}>
      {/* Rubber Tire */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.24, 20]} />
        <meshStandardMaterial color="#09090b" roughness={0.9} />
      </mesh>

      {/* Alloy Rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.24, 0.24, 0.22, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Center Cap with Cyan Accent */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 12]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* 5-Spoke Pattern */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0, 0.11]}
          rotation={[0, 0, (i * (Math.PI * 2)) / 5]}
        >
          <boxGeometry args={[0.04, 0.38, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Disc Brake Caliper */}
      <mesh position={[0.12, 0.1, 0.0]}>
        <boxGeometry args={[0.1, 0.12, 0.16]} />
        <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
