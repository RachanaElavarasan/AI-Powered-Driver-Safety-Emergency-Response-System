/**
 * SafePilot AI - Main 3D Vehicle Scene (React Three Fiber)
 * Features:
 * - R3F Canvas with antialiasing & tone mapping
 * - Dynamic camera controller with smooth lerping for 3 views:
 *   (FOLLOW VEHICLE, DRIVER VIEW, TOP VIEW)
 * - Main SafePilot car with active physics
 * - AI traffic vehicles & road hazards
 * - Perception overlays & radar sweep
 * - Continuous moving highway
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import MainVehicle from './MainVehicle';
import TrafficVehicle from './TrafficVehicle';
import Road from './Road';
import DetectionBox, { DistanceLaserBeam } from './DetectionBox';
import RadarOverlay from './RadarOverlay';
import EnvironmentSky from './EnvironmentSky';

export const CAMERA_MODES = {
  FOLLOW: 'FOLLOW',
  DRIVER: 'DRIVER',
  TOP: 'TOP',
};

/**
 * Camera Controller handling smooth transitions between modes
 */
function CameraController({ mode = CAMERA_MODES.FOLLOW, physics }) {
  const currentPos = useRef(new THREE.Vector3(0, 3.5, 8.0));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, -15.0));

  useFrame(({ camera }) => {
    const carX = physics.vehicleX !== undefined ? physics.vehicleX : (physics.laneOffset || 0) * 2.25;

    let targetPos = new THREE.Vector3(0, 3.5, 8.0);
    let targetLookAt = new THREE.Vector3(0, 1.2, -15.0);

    if (mode === CAMERA_MODES.DRIVER) {
      // Cockpit / Windshield POV
      targetPos.set(carX, 1.22, -0.15);
      targetLookAt.set(carX, 1.12, -28.0);
    } else if (mode === CAMERA_MODES.TOP) {
      // Tactical Bird's-Eye View (Encompasses road, ego car, traffic, hazard, and detection zones)
      targetPos.set(0, 42.0, -14.0);
      targetLookAt.set(0, 0, -24.0);
    } else {
      // Follow Vehicle (Chase Cam)
      targetPos.set(carX * 0.45, 3.4, 7.8);
      targetLookAt.set(carX * 0.75, 1.1, -15.0);
    }

    // Smooth lerp (interpolation)
    currentPos.current.lerp(targetPos, 0.06);
    currentLookAt.current.lerp(targetLookAt, 0.06);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

export default function VehicleScene({
  physics,
  hazard,
  traffic = [],
  ttc,
  risk,
  cameraMode = CAMERA_MODES.FOLLOW,
  environment,
}) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 3.5, 8.0], fov: 55, near: 0.1, far: 350 }}
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        className="w-full h-full bg-slate-950"
      >
        {/* Dynamic Smooth Camera Transition */}
        <CameraController mode={cameraMode} physics={physics} />

        {/* Environment, Sky & Fog */}
        <EnvironmentSky
          timeOfDay={environment.timeOfDay}
          weather={environment.weather}
        />

        {/* Infinite Moving Road & Scenery */}
        <Road
          speedKmh={physics.speedKmh}
          weather={environment.weather}
        />

        {/* SafePilot Main Autonomous Vehicle */}
        <MainVehicle
          physics={physics}
          riskLevel={risk.riskLevel}
        />

        {/* Forward Radar Cone & Safe Trajectory Rails */}
        <RadarOverlay
          riskLevel={risk.riskLevel}
          egoSpeedKmh={physics.speedKmh}
          vehicleX={physics.vehicleX || 0}
          vehicleRotation={physics.vehicleRotation || 0}
        />

        {/* Primary Lead Hazard / Target Vehicle */}
        {hazard && hazard.distanceM && (
          <>
            <TrafficVehicle
              type={hazard.type}
              subType={hazard.type === 'OBSTACLE' ? 'OBSTACLE' : 'TRUCK'}
              lane={hazard.lane || 0}
              distanceM={hazard.distanceM}
              color="#e2e8f0"
              speedKmh={hazard.speedKmh}
              isObstacle={hazard.type === 'OBSTACLE'}
              isBraking={risk.actionCode === 'AEB_ACTIVE' || risk.riskLevel === 'CRITICAL'}
            />

            {/* AI Perception Bounding Box */}
            <DetectionBox
              target={hazard}
              riskLevel={risk.riskLevel}
              ttcMetrics={ttc}
              egoSpeedKmh={physics.speedKmh}
            />

            {/* 3D Dynamic Laser Range Strip */}
            <DistanceLaserBeam
              targetDistanceM={hazard.distanceM}
              targetLane={hazard.lane || 0}
              riskLevel={risk.riskLevel}
            />
          </>
        )}

        {/* Secondary AI Traffic Vehicles */}
        {traffic.map((other) => (
          <TrafficVehicle
            key={other.id}
            type="VEHICLE"
            subType={other.label === 'SUV' ? 'SUV' : 'SEDAN'}
            lane={other.lane}
            distanceM={other.distanceM}
            color={other.color}
            speedKmh={other.speedKmh}
          />
        ))}
      </Canvas>
    </div>
  );
}
