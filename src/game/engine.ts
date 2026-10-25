import * as THREE from 'three';
import { sounds } from './audio';
import { 
  createNanobotModel, 
  createViralPathogenModel, 
  createBacterialRunnerModel, 
  createErythrocyteModel, 
  createDnaHelixModel, 
  createEnergyCrystalModel,
  createBossModel 
} from './models';

export type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  score: number;
  dnaCollected: number;
  empCharges: number;
  wave: number;
  enemiesRemaining: number;
}

export interface EnemyEntity {
  id: number;
  type: 'virus' | 'bacteria' | 'boss';
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  speed: number;
  telegraphTimer: number;
  isCharging?: boolean;
  chargeDirection?: THREE.Vector3;
  shootCooldown: number;
  radius: number;
  core?: THREE.Mesh;
}

export interface Projectile {
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
  speed: number;
  life: number;
  isEnemy: boolean;
  damage: number;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export interface CrystalPickup {
  mesh: THREE.Group;
  crystal: THREE.Mesh;
  position: THREE.Vector3;
  value: number;
}

export class NanoGameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  public state: GameState = 'title';
  public stats: PlayerStats = {
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    score: 0,
    dnaCollected: 0,
    empCharges: 1,
    wave: 1,
    enemiesRemaining: 0,
  };

  // Player object & components
  public playerGroup: THREE.Group;
  public playerCoreRing: THREE.Mesh;
  public playerThrusters: THREE.Mesh[];
  public playerVelocity = new THREE.Vector3();
  public playerAimAngle = 0;
  public isDashing = false;
  public dashTimer = 0;
  public shootCooldown = 0;

  // Pools & Entities
  public enemies: EnemyEntity[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public crystals: CrystalPickup[] = [];
  public bloodCells: THREE.Mesh[] = [];

  // Game feel: camera shake & hitstop
  public cameraShake = 0;
  public hitstopTimer = 0;

  // Input State
  private keys: Record<string, boolean> = {};
  private justPressedKeys: Record<string, boolean> = {};
  private mousePos = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // Callbacks to React HUD
  public onStatsUpdate?: (stats: PlayerStats) => void;
  public onStateChange?: (state: GameState) => void;

  private enemyIdCounter = 0;
  private arenaRadius = 26;

  constructor(canvas: HTMLCanvasElement) {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913); // Deep cellular void
    this.scene.fog = new THREE.FogExp2(0x060913, 0.024);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 150);
    this.camera.position.set(0, 24, 18);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer with ACESFilmicToneMapping
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting Rig (Warm Key + Cool Hemisphere + Bioluminescent ambient)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(15, 25, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.left = -28;
    keyLight.shadow.camera.right = 28;
    keyLight.shadow.camera.top = 28;
    keyLight.shadow.camera.bottom = -28;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x831843, 0.8);
    this.scene.add(hemiLight);

    // 5. Build Environment & Boundaries
    this.buildCellularArena();

    // 6. Build Player Nanobot
    const playerModel = createNanobotModel();
    this.playerGroup = playerModel.group;
    this.playerCoreRing = playerModel.coreRing;
    this.playerThrusters = playerModel.thrusters;
    this.playerGroup.position.set(0, 0.6, 0);
    this.scene.add(this.playerGroup);

    // 7. Bind Inputs
    this.setupInputListeners();
  }

  private buildCellularArena() {
    // Arena Floor Membrane (Vascular Wall)
    const floorGeo = new THREE.CircleGeometry(this.arenaRadius + 6, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Soft Boundary Membrane Ring
    const boundaryGeo = new THREE.TorusGeometry(this.arenaRadius, 0.8, 12, 48);
    const boundaryMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const boundary = new THREE.Mesh(boundaryGeo, boundaryMat);
    boundary.rotation.x = Math.PI / 2;
    boundary.position.y = 0.4;
    this.scene.add(boundary);

    // Floating Erythrocytes (Red Blood Cells) in the background
    for (let i = 0; i < 18; i++) {
      const rbc = createErythrocyteModel();
      const angle = (i / 18) * Math.PI * 2;
      const dist = 6 + Math.random() * (this.arenaRadius - 8);
      rbc.position.set(
        Math.cos(angle) * dist,
        0.8 + Math.random() * 2.5,
        Math.sin(angle) * dist
      );
      rbc.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rbc.scale.setScalar(0.7 + Math.random() * 0.5);
      this.bloodCells.push(rbc);
      this.scene.add(rbc);
    }

    // Floating DNA Double Helices on perimeter
    [-this.arenaRadius * 0.8, this.arenaRadius * 0.8].forEach((x) => {
      const dna = createDnaHelixModel(20, 1.4);
      dna.position.set(x, 4, -12);
      dna.rotation.z = 0.3;
      this.scene.add(dna);
    });
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.justPressedKeys[e.code] = true;

      // Global pause trigger
      if (e.code === 'Escape' && (this.state === 'playing' || this.state === 'paused')) {
        this.togglePause();
      }

      // Start game from title
      if ((e.code === 'Space' || e.code === 'Enter') && this.state === 'title') {
        this.startGame();
      }

      // Bio-EMP Bomb trigger
      if (e.code === 'KeyE' && this.state === 'playing') {
        this.triggerEmpBomb();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.justPressedKeys = {};
    });

    window.addEventListener('mousemove', (e) => {
      this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.state === 'playing') {
        this.fireBlaster();
      }
    });
  }

  public startGame() {
    this.state = 'playing';
    this.stats = {
      hp: 100,
      maxHp: 100,
      energy: 100,
      maxEnergy: 100,
      score: 0,
      dnaCollected: 0,
      empCharges: 1,
      wave: 1,
      enemiesRemaining: 0,
    };
    this.clearEntities();
    this.spawnWave(1);
    sounds.startAmbientLoop();
    this.onStateChange?.(this.state);
    this.onStatsUpdate?.(this.stats);
  }

  public togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
    this.onStateChange?.(this.state);
  }

  public restartGame() {
    this.startGame();
  }

  private clearEntities() {
    this.enemies.forEach((e) => this.scene.remove(e.mesh));
    this.enemies = [];
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.projectiles = [];
    this.crystals.forEach((c) => this.scene.remove(c.mesh));
    this.crystals = [];
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.particles = [];
  }

  public spawnWave(waveNum: number) {
    this.stats.wave = waveNum;

    // Wave 1: 4 Viral Capsids
    // Wave 2: 4 Viral Capsids + 3 Bacterial Runners
    // Wave 3: 6 Viral + 4 Runners + 1 Apex Boss
    const virusCount = 3 + waveNum * 2;
    const runnerCount = waveNum > 1 ? 2 + waveNum : 0;
    const isBossWave = waveNum % 3 === 0;

    for (let i = 0; i < virusCount; i++) {
      this.spawnEnemy('virus');
    }
    for (let i = 0; i < runnerCount; i++) {
      this.spawnEnemy('bacteria');
    }
    if (isBossWave) {
      this.spawnEnemy('boss');
    }

    this.stats.enemiesRemaining = this.enemies.length;
    this.onStatsUpdate?.(this.stats);
  }

  private spawnEnemy(type: 'virus' | 'bacteria' | 'boss') {
    const angle = Math.random() * Math.PI * 2;
    const dist = 14 + Math.random() * 10;
    const spawnX = Math.cos(angle) * dist;
    const spawnZ = Math.sin(angle) * dist;

    let mesh: THREE.Group;
    let radius = 1.0;
    let hp = 40;
    let speed = 2.2;
    let core: THREE.Mesh | undefined;

    if (type === 'virus') {
      const v = createViralPathogenModel(1.0);
      mesh = v.group;
      core = v.core;
      hp = 45 + this.stats.wave * 10;
      speed = 2.4;
      radius = 0.9;
    } else if (type === 'bacteria') {
      const b = createBacterialRunnerModel();
      mesh = b.group;
      hp = 30 + this.stats.wave * 8;
      speed = 3.6;
      radius = 0.8;
    } else {
      const boss = createBossModel();
      mesh = boss.group;
      hp = 300 + this.stats.wave * 100;
      speed = 1.6;
      radius = 2.5;
    }

    mesh.position.set(spawnX, 0.7, spawnZ);
    this.scene.add(mesh);

    this.enemies.push({
      id: ++this.enemyIdCounter,
      type,
      mesh,
      hp,
      maxHp: hp,
      speed,
      telegraphTimer: 0,
      shootCooldown: 1.5 + Math.random() * 2,
      radius,
      core,
    });
  }

  public fireBlaster() {
    if (this.shootCooldown > 0) return;
    this.shootCooldown = 0.15; // fast 6.6 shots/sec

    sounds.playLaser();

    // Dual Forward Blasters offset left and right
    const offsets = [-0.55, 0.55];
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerAimAngle);

    offsets.forEach((offsetX) => {
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerAimAngle);
      const spawnPos = this.playerGroup.position.clone().add(right.multiplyScalar(offsetX)).add(forward.clone().multiplyScalar(0.9));

      const geo = new THREE.CapsuleGeometry(0.06, 0.5, 4, 8);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(spawnPos);
      mesh.rotation.y = this.playerAimAngle;
      this.scene.add(mesh);

      this.projectiles.push({
        mesh,
        direction: forward.clone(),
        speed: 28,
        life: 1.2,
        isEnemy: false,
        damage: 25,
      });
    });
  }

  public triggerDash() {
    if (this.isDashing || this.stats.energy < 25) return;
    this.stats.energy -= 25;
    this.isDashing = true;
    this.dashTimer = 0.28;
    sounds.playDash();

    // Dash particle ring burst
    this.spawnParticleBurst(this.playerGroup.position, 0x38bdf8, 14);
    this.onStatsUpdate?.(this.stats);
  }

  public triggerEmpBomb() {
    if (this.stats.empCharges <= 0) return;
    this.stats.empCharges--;
    sounds.playEmpShockwave();
    this.cameraShake = 0.45;
    this.hitstopTimer = 0.06;

    // Shockwave Ring Expanding FX
    this.spawnParticleBurst(this.playerGroup.position, 0x10b981, 35, 12);

    // Obliterate all enemy projectiles and damage enemies in 16m radius
    this.projectiles = this.projectiles.filter((p) => {
      if (p.isEnemy) {
        this.scene.remove(p.mesh);
        return false;
      }
      return true;
    });

    this.enemies.forEach((e) => {
      const dist = e.mesh.position.distanceTo(this.playerGroup.position);
      if (dist < 16) {
        e.hp -= 120;
        this.spawnParticleBurst(e.mesh.position, 0xec4899, 12);
      }
    });

    this.onStatsUpdate?.(this.stats);
  }

  public spawnParticleBurst(position: THREE.Vector3, colorHex: number, count = 10, speedMult = 5) {
    const geo = new THREE.SphereGeometry(0.08, 4, 4);
    const color = new THREE.Color(colorHex);

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(position);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.5) * Math.PI * 0.5;
      const spd = (1.5 + Math.random() * 3) * (speedMult / 5);

      const velocity = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elev) * spd,
        Math.sin(elev) * spd,
        Math.sin(angle) * Math.cos(elev) * spd
      );

      this.particles.push({
        mesh,
        velocity,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        color,
      });
    }
  }

  public spawnCrystal(position: THREE.Vector3) {
    const c = createEnergyCrystalModel();
    c.group.position.copy(position);
    c.group.position.y = 0.5;
    this.scene.add(c.group);

    this.crystals.push({
      mesh: c.group,
      crystal: c.crystal,
      position: c.group.position,
      value: 20,
    });
  }

  // Core Simulation Tick (Clamped dt for rock-solid 60fps)
  public update(rawDt: number) {
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze (impact emphasis)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Title Screen Live Orbit Pan
    if (this.state === 'title') {
      const time = performance.now() * 0.0006;
      this.camera.position.x = Math.sin(time) * 16;
      this.camera.position.z = Math.cos(time) * 16;
      this.camera.position.y = 12;
      this.camera.lookAt(0, 0, 0);

      this.playerGroup.position.set(0, 1.2 + Math.sin(time * 3) * 0.2, 0);
      this.playerGroup.rotation.y = time * 1.5;
      this.playerCoreRing.rotation.z += dt * 3;
      return;
    }

    if (this.state !== 'playing') return;

    // 1. Player Input & Movement
    let moveX = 0;
    let moveZ = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    if (this.justPressedKeys['ShiftLeft'] || this.justPressedKeys['ShiftRight']) {
      this.triggerDash();
    }
    if (this.keys['Space']) {
      this.fireBlaster();
    }

    // Clear edge-triggered keys for next frame
    this.justPressedKeys = {};

    // Continuous Movement Speed & Acceleration
    const moveDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
    const baseSpeed = this.isDashing ? 22 : 9.5;
    const accel = 35;

    if (moveDir.lengthSq() > 0) {
      this.playerVelocity.lerp(moveDir.multiplyScalar(baseSpeed), accel * dt);
    } else {
      this.playerVelocity.lerp(new THREE.Vector3(0, 0, 0), 12 * dt);
    }

    this.playerGroup.position.addScaledVector(this.playerVelocity, dt);

    // Keep Player within Arena Boundary
    const playerDist = Math.hypot(this.playerGroup.position.x, this.playerGroup.position.z);
    if (playerDist > this.arenaRadius - 1.2) {
      const angle = Math.atan2(this.playerGroup.position.z, this.playerGroup.position.x);
      this.playerGroup.position.x = Math.cos(angle) * (this.arenaRadius - 1.2);
      this.playerGroup.position.z = Math.sin(angle) * (this.arenaRadius - 1.2);
    }

    // Aim Player towards Mouse Pointer on Ground Plane
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersectPoint = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, intersectPoint)) {
      const dx = intersectPoint.x - this.playerGroup.position.x;
      const dz = intersectPoint.z - this.playerGroup.position.z;
      this.playerAimAngle = Math.atan2(dx, dz);
      this.playerGroup.rotation.y = this.playerAimAngle;
    }

    // Nanobot Visual Animations
    this.playerCoreRing.rotation.z += dt * (this.isDashing ? 12 : 4);
    this.playerGroup.position.y = 0.6 + Math.sin(performance.now() * 0.005) * 0.08;

    // Dash timer & Cooldowns
    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) this.isDashing = false;
    }
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // Passive Energy Capacitor Recharge
    if (this.stats.energy < this.stats.maxEnergy) {
      this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + 12 * dt);
    }

    // 2. Update Enemies & AI
    this.enemies.forEach((enemy) => {
      const toPlayer = this.playerGroup.position.clone().sub(enemy.mesh.position);
      const dist = toPlayer.length();
      toPlayer.y = 0;
      toPlayer.normalize();

      if (enemy.type === 'virus') {
        // Orbit and shoot pathogen spores
        if (dist > 8) {
          enemy.mesh.position.addScaledVector(toPlayer, enemy.speed * dt);
        } else {
          // Strafe around player
          const strafe = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x);
          enemy.mesh.position.addScaledVector(strafe, (enemy.speed * 0.8) * dt);
        }

        // Shoot spores
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0 && dist < 18) {
          enemy.shootCooldown = 2.2 + Math.random() * 1.5;
          this.spawnEnemySpore(enemy.mesh.position, toPlayer);
        }

        // Pulsating capsid core animation
        if (enemy.core) {
          const s = 1 + Math.sin(performance.now() * 0.008 + enemy.id) * 0.15;
          enemy.core.scale.set(s, s, s);
        }
        enemy.mesh.rotation.y += dt * 1.2;
      } else if (enemy.type === 'bacteria') {
        // Fast charger with telegraph pause
        if (enemy.isCharging) {
          if (enemy.chargeDirection) {
            enemy.mesh.position.addScaledVector(enemy.chargeDirection, (enemy.speed * 2.2) * dt);
          }
          enemy.telegraphTimer -= dt;
          if (enemy.telegraphTimer <= 0) {
            enemy.isCharging = false;
          }
        } else {
          enemy.mesh.position.addScaledVector(toPlayer, enemy.speed * dt);
          enemy.mesh.lookAt(this.playerGroup.position.x, enemy.mesh.position.y, this.playerGroup.position.z);

          // Trigger charge telegraph
          if (dist < 12 && enemy.telegraphTimer <= 0 && Math.random() < 0.03) {
            enemy.isCharging = true;
            enemy.chargeDirection = toPlayer.clone();
            enemy.telegraphTimer = 0.8;
            sounds.playHit();
          }
        }
      } else if (enemy.type === 'boss') {
        // Boss moves steadily toward arena center & unleashes radial bursts
        enemy.mesh.position.lerp(new THREE.Vector3(0, 0.7, 0), 0.4 * dt);
        enemy.mesh.rotation.y += dt * 0.5;

        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 3.0;
          sounds.playExplosion(false);
          // Radial 8-spore burst
          for (let a = 0; a < 8; a++) {
            const radAngle = (a / 8) * Math.PI * 2;
            const dir = new THREE.Vector3(Math.cos(radAngle), 0, Math.sin(radAngle));
            this.spawnEnemySpore(enemy.mesh.position, dir);
          }
        }
      }

      // Check Collision with Player
      if (dist < enemy.radius + 0.8) {
        if (this.isDashing) {
          // Dash Ram knocks enemy back and damages them
          enemy.hp -= 50;
          enemy.mesh.position.addScaledVector(toPlayer, -3.5);
          sounds.playHit();
          this.cameraShake = 0.2;
          this.hitstopTimer = 0.04;
        } else {
          // Player takes damage
          this.stats.hp -= 18 * dt;
          sounds.playHit();
          this.cameraShake = 0.15;
          if (this.stats.hp <= 0) {
            this.handleGameOver();
          }
        }
      }
    });

    // 3. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.mesh.position.addScaledVector(p.direction, p.speed * dt);
      p.life -= dt;

      // Projectile boundary / death
      if (p.life <= 0 || p.mesh.position.length() > this.arenaRadius + 2) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Player Blaster vs Enemies
      if (!p.isEnemy) {
        let hit = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (p.mesh.position.distanceTo(enemy.mesh.position) < enemy.radius + 0.3) {
            enemy.hp -= p.damage;
            hit = true;
            sounds.playHit();
            this.spawnParticleBurst(p.mesh.position, 0x10b981, 6);

            // Enemy Defeated
            if (enemy.hp <= 0) {
              sounds.playExplosion(enemy.type === 'boss');
              this.spawnParticleBurst(enemy.mesh.position, 0xf43f5e, enemy.type === 'boss' ? 30 : 15);
              this.stats.score += enemy.type === 'boss' ? 500 : 100;
              this.spawnCrystal(enemy.mesh.position);
              this.scene.remove(enemy.mesh);
              this.enemies.splice(j, 1);
              this.stats.enemiesRemaining = this.enemies.length;
            }
            break;
          }
        }

        if (hit) {
          this.scene.remove(p.mesh);
          this.projectiles.splice(i, 1);
        }
      } else {
        // Enemy Spore vs Player
        if (p.mesh.position.distanceTo(this.playerGroup.position) < 0.9) {
          if (!this.isDashing) {
            this.stats.hp -= p.damage;
            sounds.playHit();
            this.cameraShake = 0.25;
            this.spawnParticleBurst(this.playerGroup.position, 0xf43f5e, 8);
            if (this.stats.hp <= 0) {
              this.handleGameOver();
            }
          }
          this.scene.remove(p.mesh);
          this.projectiles.splice(i, 1);
        }
      }
    }

    // 4. Update Crystals & Pickups
    for (let i = this.crystals.length - 1; i >= 0; i--) {
      const c = this.crystals[i];
      c.crystal.rotation.y += dt * 3;
      c.crystal.rotation.x += dt * 1.5;

      const dist = c.position.distanceTo(this.playerGroup.position);
      // Magnetism pull when close
      if (dist < 4.5) {
        const pull = this.playerGroup.position.clone().sub(c.position).normalize();
        c.position.addScaledVector(pull, 10 * dt);
      }

      if (dist < 1.1) {
        sounds.playPickup();
        this.stats.score += 50;
        this.stats.dnaCollected += 1;
        this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + 30);
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 10);

        // Every 5 crystals granting an EMP Bomb charge
        if (this.stats.dnaCollected % 5 === 0) {
          this.stats.empCharges++;
        }

        this.spawnParticleBurst(c.position, 0x34d399, 10);
        this.scene.remove(c.mesh);
        this.crystals.splice(i, 1);
      }
    }

    // 5. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.mesh.position.addScaledVector(pt.velocity, dt);
      pt.life -= dt;
      const opacity = pt.life / pt.maxLife;
      (pt.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;

      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 6. Wave Progression Check
    if (this.enemies.length === 0 && this.state === 'playing') {
      if (this.stats.wave >= 5) {
        this.state = 'victory';
        this.onStateChange?.(this.state);
      } else {
        this.spawnWave(this.stats.wave + 1);
      }
    }

    // 7. Damped Camera Tracking & Decay Camera Shake
    const targetCamX = this.playerGroup.position.x * 0.4;
    const targetCamZ = this.playerGroup.position.z * 0.4 + 18;

    this.camera.position.x += (targetCamX - this.camera.position.x) * (4 * dt);
    this.camera.position.z += (targetCamZ - this.camera.position.z) * (4 * dt);

    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.cameraShake = Math.max(0, this.cameraShake - 2.5 * dt);
    }

    this.camera.lookAt(this.playerGroup.position.x * 0.3, 0, this.playerGroup.position.z * 0.3);

    // Notify React HUD
    this.onStatsUpdate?.(this.stats);
  }

  private spawnEnemySpore(position: THREE.Vector3, direction: THREE.Vector3) {
    const geo = new THREE.SphereGeometry(0.18, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      direction: direction.clone().normalize(),
      speed: 12,
      life: 2.5,
      isEnemy: true,
      damage: 15,
    });
  }

  private handleGameOver() {
    this.state = 'gameover';
    sounds.playExplosion(true);
    this.spawnParticleBurst(this.playerGroup.position, 0xef4444, 30);
    this.onStateChange?.(this.state);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    sounds.stopAmbientLoop();
    this.clearEntities();
    this.renderer.dispose();
  }
}
