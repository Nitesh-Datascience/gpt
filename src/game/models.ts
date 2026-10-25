import * as THREE from 'three';

// Procedural Canvas Texture for Nanobot Hull & Carbon Composite
export function createTechGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, 248, 248);

  // Tech grid lines
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 16; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 1. Hero Nanobot (Composite 8-Part Procedural Model)
export function createNanobotModel(): { group: THREE.Group; coreRing: THREE.Mesh; thrusters: THREE.Mesh[] } {
  const group = new THREE.Group();

  // Shared PBR Materials
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15,
  });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const glowCyanMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  const glowEmeraldMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
  });

  // Part 1: Main Fuselage / Hull (Aerodynamic elongated pod)
  const hullGeo = new THREE.ConeGeometry(0.7, 2.2, 8);
  hullGeo.rotateX(Math.PI / 2);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.castShadow = true;
  group.add(hull);

  // Part 2: Cockpit Visor / Bio-Sensor Canopy
  const canopyGeo = new THREE.SphereGeometry(0.42, 16, 12);
  canopyGeo.scale(1, 0.7, 1.4);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.25, 0.1);
  group.add(canopy);

  // Part 3 & 4: Left & Right Swept Nanotech Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(1.4, -0.6);
  wingShape.lineTo(1.2, -1.2);
  wingShape.lineTo(0, -0.8);
  wingShape.closePath();

  const wingExtrude = new THREE.ExtrudeGeometry(wingShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
  wingExtrude.center();

  const leftWing = new THREE.Mesh(wingExtrude, hullMat);
  leftWing.position.set(-0.8, 0, -0.2);
  leftWing.rotation.x = Math.PI / 2;
  leftWing.rotation.y = 0.1;
  leftWing.castShadow = true;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingExtrude, hullMat);
  rightWing.position.set(0.8, 0, -0.2);
  rightWing.rotation.x = Math.PI / 2;
  rightWing.rotation.y = -0.1;
  rightWing.rotation.z = Math.PI;
  rightWing.castShadow = true;
  group.add(rightWing);

  // Part 5: Dual Forward Plasma Blaster Cannons
  const cannonGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.9, 8);
  cannonGeo.rotateX(Math.PI / 2);

  const leftCannon = new THREE.Mesh(cannonGeo, goldMat);
  leftCannon.position.set(-0.55, -0.05, 0.6);
  group.add(leftCannon);

  const rightCannon = new THREE.Mesh(cannonGeo, goldMat);
  rightCannon.position.set(0.55, -0.05, 0.6);
  group.add(rightCannon);

  // Part 6: Plasma Emitter Muzzles
  const muzzleGeo = new THREE.RingGeometry(0.02, 0.08, 8);
  const leftMuzzle = new THREE.Mesh(muzzleGeo, glowEmeraldMat);
  leftMuzzle.position.set(-0.55, -0.05, 1.06);
  group.add(leftMuzzle);

  const rightMuzzle = new THREE.Mesh(muzzleGeo, glowEmeraldMat);
  rightMuzzle.position.set(0.55, -0.05, 1.06);
  group.add(rightMuzzle);

  // Part 7: Magnetic Gyro Core Ring (Animates/Rotates)
  const ringGeo = new THREE.TorusGeometry(0.5, 0.04, 8, 24);
  const coreRing = new THREE.Mesh(ringGeo, glowCyanMat);
  coreRing.position.set(0, 0, -0.1);
  group.add(coreRing);

  // Part 8: Vertical Stabilizer Tail Fin
  const finGeo = new THREE.BoxGeometry(0.06, 0.6, 0.8);
  finGeo.translate(0, 0.3, -0.7);
  const fin = new THREE.Mesh(finGeo, goldMat);
  group.add(fin);

  // Thrusters
  const thrusterGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.4, 8);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  leftThruster.position.set(-0.5, 0, -1.1);
  group.add(leftThruster);

  const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  rightThruster.position.set(0.5, 0, -1.1);
  group.add(rightThruster);

  // Contact Shadow Plane (Direct Grounding)
  const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 64;
  shadowCanvas.height = 64;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 64, 64);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);

  const shadowMesh = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -0.6;
  group.add(shadowMesh);

  return { group, coreRing, thrusters: [leftThruster, rightThruster] };
}

// 2. Viral Capsid Invader (Icosahedron + Protein Spikes + Pulsing Nucleus)
export function createViralPathogenModel(scale = 1): { group: THREE.Group; core: THREE.Mesh } {
  const group = new THREE.Group();

  const capsidMat = new THREE.MeshStandardMaterial({
    color: 0xd946ef, // Neon violet
    roughness: 0.35,
    metalness: 0.3,
  });

  const spikeMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e, // Crimson spike tips
    roughness: 0.2,
    metalness: 0.6,
  });

  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xfb7185,
  });

  // Capsid Body
  const capsidGeo = new THREE.IcosahedronGeometry(0.7 * scale, 1);
  const capsid = new THREE.Mesh(capsidGeo, capsidMat);
  capsid.castShadow = true;
  group.add(capsid);

  // Radiating Spikes (12 vertices of icosahedron)
  const spikeGeo = new THREE.CylinderGeometry(0.04 * scale, 0.08 * scale, 0.5 * scale, 6);
  spikeGeo.translate(0, 0.25 * scale, 0);

  const pos = capsidGeo.attributes.position;
  const addedVectors: THREE.Vector3[] = [];

  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    // deduplicate
    const isClose = addedVectors.some((av) => av.distanceTo(v) < 0.2);
    if (!isClose) {
      addedVectors.push(v);
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.copy(v.clone().multiplyScalar(0.65 * scale));
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
      group.add(spike);
    }
  }

  // Inner RNA Nucleus
  const coreGeo = new THREE.SphereGeometry(0.35 * scale, 12, 10);
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  return { group, core };
}

// 3. Bacterial Flagellate Runner (Capsule Body + Swiveling Flagella)
export function createBacterialRunnerModel(): { group: THREE.Group; flagella: THREE.Group } {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16, // Toxic lime green
    roughness: 0.4,
    metalness: 0.2,
  });

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // Segmented Capsule Body
  const bodyGeo = new THREE.CapsuleGeometry(0.4, 0.9, 8, 12);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  group.add(body);

  // Red Bio-Sensors / Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMat);
  eyeL.position.set(-0.2, 0.15, 0.65);
  group.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMat);
  eyeR.position.set(0.2, 0.15, 0.65);
  group.add(eyeR);

  // Flagella Tails
  const flagella = new THREE.Group();
  const tailGeo = new THREE.CylinderGeometry(0.02, 0.04, 1.2, 6);
  tailGeo.translate(0, -0.6, 0);

  [-0.15, 0, 0.15].forEach((xOffset, i) => {
    const tail = new THREE.Mesh(tailGeo, new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 }));
    tail.position.set(xOffset, 0, -0.7);
    tail.rotation.x = Math.PI / 2 + (i - 1) * 0.1;
    flagella.add(tail);
  });
  group.add(flagella);

  return { group, flagella };
}

// 4. Red Blood Cell (Erythrocyte) - Floating Biological Obstacle
export function createErythrocyteModel(): THREE.Mesh {
  // Torus scaled to look like biconcave disc
  const geo = new THREE.TorusGeometry(0.8, 0.45, 12, 24);
  geo.scale(1, 1, 0.45);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xbe123c, // Deep crimson blood red
    roughness: 0.25,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

// 5. DNA Double Helix Strand (Procedural Molecular Structure)
export function createDnaHelixModel(length = 12, radius = 1.2): THREE.Group {
  const group = new THREE.Group();

  const backboneMatA = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
  const backboneMatB = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });
  const rungMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

  const steps = 30;
  const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, radius * 2, 6);
  const sphereGeo = new THREE.SphereGeometry(0.1, 8, 8);

  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 4;
    const y = (i / steps) * length - length / 2;
    const x1 = Math.cos(t) * radius;
    const z1 = Math.sin(t) * radius;
    const x2 = -x1;
    const z2 = -z1;

    // Backbone nodes
    const node1 = new THREE.Mesh(sphereGeo, backboneMatA);
    node1.position.set(x1, y, z1);
    group.add(node1);

    const node2 = new THREE.Mesh(sphereGeo, backboneMatB);
    node2.position.set(x2, y, z2);
    group.add(node2);

    // Connecting nucleotide base-pair rung
    if (i % 2 === 0) {
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -t;
      group.add(rung);
    }
  }

  return group;
}

// 6. Bio-Energy / DNA Crystal Pickup
export function createEnergyCrystalModel(): { group: THREE.Group; crystal: THREE.Mesh } {
  const group = new THREE.Group();

  const crystalGeo = new THREE.OctahedronGeometry(0.35, 0);
  crystalGeo.scale(0.8, 1.4, 0.8);

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.4,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.95,
  });

  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  group.add(crystal);

  // Tiny orbiting energy ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.02, 6, 16),
    new THREE.MeshBasicMaterial({ color: 0x34d399 })
  );
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  return { group, crystal };
}

// 7. Apex Cytomegalovirus Boss
export function createBossModel(): { group: THREE.Group; shield: THREE.Mesh } {
  const group = new THREE.Group();

  const bossMat = new THREE.MeshStandardMaterial({
    color: 0x4c1d95,
    metalness: 0.7,
    roughness: 0.25,
  });

  // Massive Dodecahedron Core
  const coreGeo = new THREE.DodecahedronGeometry(2.2, 1);
  const core = new THREE.Mesh(coreGeo, bossMat);
  core.castShadow = true;
  group.add(core);

  // Armored Plates
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xd946ef, metalness: 0.8, roughness: 0.2 })
    );
    plate.position.set(Math.cos(angle) * 2.4, Math.sin(angle) * 0.8, Math.sin(angle) * 2.4);
    plate.lookAt(0, 0, 0);
    group.add(plate);
  }

  // Energy Shield
  const shieldGeo = new THREE.SphereGeometry(3.2, 16, 16);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.35,
    wireframe: true,
  });
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  group.add(shield);

  return { group, shield };
}
