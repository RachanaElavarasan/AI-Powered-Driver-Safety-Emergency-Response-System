/**
 * SafePilot AI - Continuous Animated Road System
 * Features:
 * - Multi-lane asphalt road with dashed lane dividers
 * - Roadside guardrails with glowing hazard reflectors
 * - Continuous moving streetlights with warm pools of light
 * - Moving roadside trees and vegetation
 * - Dynamic speed-synchronized scrolling
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ROAD_WIDTH = 18; // 4 lanes (approx 4.5m per lane)
const ROAD_LENGTH = 300;
const SEGMENT_COUNT = 15;
const SEGMENT_SPACING = ROAD_LENGTH / SEGMENT_COUNT;

export default function Road({ speedKmh = 75, weather = 'CLEAR' }) {
  const roadMeshRef = useRef();
  const roadGroupRef = useRef();
  const streetlampsRef = useRef();
  const roadsidePropsRef = useRef();

  // Offset accumulator for continuous motion
  const scrollOffsetRef = useRef(0);

  // Generate fixed positions for roadside street lamps (both left and right sides)
  const lampPositions = useMemo(() => {
    const lamps = [];
    const count = 12;
    const spacing = ROAD_LENGTH / count;
    for (let i = 0; i < count; i++) {
      const z = -ROAD_LENGTH / 2 + i * spacing;
      // Left side lamp
      lamps.push({ id: `l-${i}`, x: -ROAD_WIDTH / 2 - 1.8, z, side: -1 });
      // Right side lamp
      lamps.push({ id: `r-${i}`, x: ROAD_WIDTH / 2 + 1.8, z, side: 1 });
    }
    return lamps;
  }, []);

  // Roadside trees and signs
  const roadsideFlora = useMemo(() => {
    const items = [];
    for (let i = 0; i < 20; i++) {
      const z = -ROAD_LENGTH / 2 + (i * ROAD_LENGTH) / 20;
      items.push({
        id: `tree-l-${i}`,
        x: -ROAD_WIDTH / 2 - 4.5 - (i % 3) * 2,
        z,
        scale: 0.8 + (i % 5) * 0.15,
      });
      items.push({
        id: `tree-r-${i}`,
        x: ROAD_WIDTH / 2 + 4.5 + ((i + 1) % 3) * 2,
        z: z + 5,
        scale: 0.8 + ((i + 2) % 5) * 0.15,
      });
    }
    return items;
  }, []);

  // Continuous animation frame hook
  useFrame((_, delta) => {
    const speedMps = (speedKmh * 1000) / 3600;
    const distanceDelta = speedMps * delta;

    scrollOffsetRef.current = (scrollOffsetRef.current + distanceDelta) % SEGMENT_SPACING;

    // Shift streetlamps and loop smoothly
    if (streetlampsRef.current) {
      streetlampsRef.current.children.forEach((lamp) => {
        lamp.position.z += distanceDelta;
        if (lamp.position.z > ROAD_LENGTH / 2) {
          lamp.position.z -= ROAD_LENGTH;
        }
      });
    }

    // Shift roadside trees and loop smoothly
    if (roadsidePropsRef.current) {
      roadsidePropsRef.current.children.forEach((tree) => {
        tree.position.z += distanceDelta;
        if (tree.position.z > ROAD_LENGTH / 2) {
          tree.position.z -= ROAD_LENGTH;
        }
      });
    }
  });

  return (
    <group ref={roadGroupRef}>
      {/* 1. Main Asphalt Surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial
          color={weather === 'RAIN' ? '#080a10' : '#141824'}
          roughness={weather === 'RAIN' ? 0.2 : 0.75}
          metalness={weather === 'RAIN' ? 0.4 : 0.1}
        />
      </mesh>

      {/* 2. Roadside Grass & Shoulder Dirt */}
      {/* Left Grass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-ROAD_WIDTH / 2 - 40, -0.08, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, ROAD_LENGTH]} />
        <meshStandardMaterial color="#0c1712" roughness={0.9} />
      </mesh>
      {/* Right Grass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ROAD_WIDTH / 2 + 40, -0.08, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, ROAD_LENGTH]} />
        <meshStandardMaterial color="#0c1712" roughness={0.9} />
      </mesh>

      {/* 3. Solid White Outer Lane Shoulders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-ROAD_WIDTH / 2 + 0.3, 0.001, 0]}>
        <planeGeometry args={[0.25, ROAD_LENGTH]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROAD_WIDTH / 2 - 0.3, 0.001, 0]}>
        <planeGeometry args={[0.25, ROAD_LENGTH]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>

      {/* 4. Dashed White Lane Lines (Dividers for 3-lane ADAS Highway: Left Divider at -2.5m, Right Divider at +2.5m) */}
      <DashedLaneLines xOffset={-2.5} speedKmh={speedKmh} />
      <DashedLaneLines xOffset={2.5} speedKmh={speedKmh} />

      {/* 5. Steel Guardrails with amber reflectors */}
      <GuardRail xOffset={-ROAD_WIDTH / 2 - 0.6} side={-1} />
      <GuardRail xOffset={ROAD_WIDTH / 2 + 0.6} side={1} />

      {/* 6. Street Lamps with Point Lights */}
      <group ref={streetlampsRef}>
        {lampPositions.map((lamp) => (
          <StreetLamp key={lamp.id} position={[lamp.x, 0, lamp.z]} side={lamp.side} />
        ))}
      </group>

      {/* 7. Roadside Low-Poly Futuristic Trees */}
      <group ref={roadsidePropsRef}>
        {roadsideFlora.map((tree) => (
          <RoadsideTree key={tree.id} position={[tree.x, 0, tree.z]} scale={tree.scale} />
        ))}
      </group>
    </group>
  );
}

/**
 * Animated Dashed Lane Lines that seamlessly scroll
 */
function DashedLaneLines({ xOffset = 0, speedKmh = 75, isCenter = false }) {
  const lineGroupRef = useRef();
  const dashCount = 35;
  const dashLength = 4.0;
  const gapLength = 4.5;
  const patternLength = dashLength + gapLength;
  const totalSpan = dashCount * patternLength;

  useFrame((_, delta) => {
    if (!lineGroupRef.current) return;
    const speedMps = (speedKmh * 1000) / 3600;
    const distanceDelta = speedMps * delta;

    lineGroupRef.current.children.forEach((dash) => {
      dash.position.z += distanceDelta;
      if (dash.position.z > ROAD_LENGTH / 2) {
        dash.position.z -= totalSpan;
      }
    });
  });

  const dashes = useMemo(() => {
    const list = [];
    for (let i = 0; i < dashCount; i++) {
      const z = -totalSpan / 2 + i * patternLength;
      list.push(z);
    }
    return list;
  }, [totalSpan, patternLength]);

  return (
    <group ref={lineGroupRef} position={[xOffset, 0.002, 0]}>
      {dashes.map((z, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]}>
          <planeGeometry args={[isCenter ? 0.22 : 0.18, dashLength]} />
          <meshBasicMaterial
            color={isCenter ? '#06b6d4' : '#e2e8f0'}
            opacity={isCenter ? 0.9 : 0.75}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Guardrail with metallic beams & reflective studs
 */
function GuardRail({ xOffset = 0, side = 1 }) {
  return (
    <group position={[xOffset, 0, 0]}>
      {/* Horizontal rail beam */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.15, 0.35, ROAD_LENGTH]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Support posts */}
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.35, -ROAD_LENGTH / 2 + (i * ROAD_LENGTH) / 24]}
        >
          <boxGeometry args={[0.12, 0.7, 0.15]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Sleek modern LED street lamp
 */
function StreetLamp({ position = [0, 0, 0], side = 1 }) {
  return (
    <group position={position}>
      {/* Vertical post */}
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 7.6, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Overhanging arm */}
      <mesh
        position={[side * 1.2, 7.4, 0]}
        rotation={[0, 0, side * (-Math.PI / 4)]}
      >
        <cylinderGeometry args={[0.06, 0.08, 2.2, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* LED fixture */}
      <mesh position={[side * 2.0, 7.3, 0]}>
        <boxGeometry args={[0.4, 0.12, 0.8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

/**
 * Stylized cyber road-side tree
 */
function RoadsideTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.3, 2.4, 6]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* Foliage Cones */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[1.5, 2.8, 6]} />
        <meshStandardMaterial color="#064e3b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.6, 0]}>
        <coneGeometry args={[1.1, 2.2, 6]} />
        <meshStandardMaterial color="#047857" roughness={0.8} />
      </mesh>
    </group>
  );
}
