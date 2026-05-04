import Phaser from 'phaser';
import type { GameObjects } from 'phaser';
import type { MatchScreen, TeamId, SkillSnapshot, CaptureSnapshot, HeroSnapshot, TeamSnapshot, MatchSettings } from '../../store/matchStore';
import { useMatchStore } from '../../store/matchStore';
import { mapConfig } from '../config/map';
import { matchConfig } from '../config/match';
import { structureBalance } from '../config/balance';
import { skillConfigs } from '../config/skills';
import Hero from '../entities/Hero';
import Minion from '../entities/Minion';
import Unit from '../entities/Unit';
import Structure from '../entities/Structure';
import Projectile from '../entities/Projectile';
import CapturePoint from '../entities/CapturePoint';
import ParticleSystem from '../systems/ParticleSystem';
import FishBackgroundSystem from '../systems/FishBackgroundSystem';
import TeamSystem from '../systems/TeamSystem';
import MinionSpawnSystem from '../systems/MinionSpawnSystem';
import CombatSystem, { type CombatTarget } from '../systems/CombatSystem';
import SkillSystem from '../systems/SkillSystem';
import TowerSystem from '../systems/TowerSystem';
import CapturePointSystem from '../systems/CapturePointSystem';
import MinimapSystem from '../systems/MinimapSystem';
import { distance } from '../utils/math';
import { nearestEnemy } from '../utils/target';
import { lanePathForTeam } from '../utils/pathfinding';

export default class MatchScene extends Phaser.Scene {
  private player!: Hero;
  private heroes: Hero[] = [];
  private minions: Minion[] = [];
  private structures: Structure[] = [];
  private captures: CapturePoint[] = [];
  private projectiles: Projectile[] = [];
  private teamSystem!: TeamSystem;
  private particles!: ParticleSystem;
  private fish!: FishBackgroundSystem;
  private combat!: CombatSystem;
  private skills!: SkillSystem;
  private towers!: TowerSystem;
  private spawner!: MinionSpawnSystem;
  private captureSystem!: CapturePointSystem;
  private minimap!: MinimapSystem;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private elapsed = 0;
  private timeLeft = matchConfig.duration;
  private ended = false;
  private pausedByStore = false;
  private feed: string[] = [];
  private graphics!: GameObjects.Graphics;
  private moveMarker?: Phaser.GameObjects.Arc;
  private mobileVector = new Phaser.Math.Vector2(0, 0);

  constructor() {
    super('MatchScene');
  }

  create() {
    this.elapsed = 0;
    this.timeLeft = matchConfig.duration;
    this.ended = false;
    this.feed = [];
    this.createWorld();
    this.teamSystem = new TeamSystem();
    this.particles = new ParticleSystem(this);
    this.fish = new FishBackgroundSystem(this, this.getSettings().quality);
    this.combat = new CombatSystem(this, this.particles);
    this.skills = new SkillSystem(this, this.particles);
    this.towers = new TowerSystem(this.combat);
    this.spawner = new MinionSpawnSystem(this);
    this.captureSystem = new CapturePointSystem(this.teamSystem);
    this.minimap = new MinimapSystem();
    this.createStructures();
    this.createHeroes();
    this.createCapturePoints();
    this.keys = this.input.keyboard!.addKeys('Q,W,E,R,A,S,D,TAB,SPACE,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.game.events.on('match:screen', this.handleScreen, this);
    window.addEventListener('match:mobile-action', this.handleMobileAction as EventListener);
    this.cameras.main.setBounds(0, 0, mapConfig.width, mapConfig.height);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.syncHud();
  }

  shutdown() {
    this.input.off('pointerdown', this.handlePointerDown, this);
    this.game.events.off('match:screen', this.handleScreen, this);
    window.removeEventListener('match:mobile-action', this.handleMobileAction as EventListener);
    this.particles?.destroy();
    this.fish?.destroy();
  }

  update(_: number, delta: number) {
    if (this.pausedByStore || this.ended) return;
    const dt = delta / 1000;
    this.elapsed += dt;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.fish.update(delta);
    this.updateInput();
    this.updateUnits(delta);
    this.spawner.update(delta, (minion) => this.minions.push(minion));
    this.updateAI(delta);
    this.updateAttacks(delta);
    this.towers.update(this.structures.filter((item) => item.type === 'tower'), this.units(), this.projectiles, delta);
    this.captureSystem.update(this.captures, this.heroes, delta, (message) => this.pushFeed(message));
    this.combat.updateProjectiles(this.projectiles, this.targets(), delta, (projectile, target, damage) => this.handleProjectileHit(projectile, target, damage));
    this.projectiles = this.projectiles.filter((projectile) => {
      if (projectile.alive) return true;
      projectile.destroy();
      return false;
    });
    this.cleanupDead();
    this.particles.update(delta);
    this.syncHud();
    this.checkVictory();
  }

  private createWorld() {
    this.add.rectangle(mapConfig.width / 2, mapConfig.height / 2, mapConfig.width, mapConfig.height, 0x050816).setDepth(-40);
    this.graphics = this.add.graphics().setDepth(-20);
    this.graphics.fillGradientStyle(0x0b1224, 0x160b2e, 0x061a2e, 0x2a0b1c, 0.96);
    this.graphics.fillRect(0, 0, mapConfig.width, mapConfig.height);
    this.graphics.lineStyle(5, 0x7dd3fc, 0.28);
    this.graphics.strokeRoundedRect(90, 90, mapConfig.width - 180, mapConfig.height - 180, 80);
    this.graphics.lineStyle(18, 0xc084fc, 0.16);
    this.graphics.beginPath();
    this.graphics.moveTo(260, 700);
    this.graphics.lineTo(2140, 700);
    this.graphics.strokePath();
    this.graphics.lineStyle(2, 0x7dd3fc, 0.15);
    for (let i = 0; i < 11; i += 1) this.graphics.strokeEllipse(mapConfig.width / 2, mapConfig.height / 2, 360 + i * 120, 160 + i * 64);
    this.add.text(150, 130, '月辉队', { color: '#7dd3fc', fontSize: '28px', fontStyle: 'bold' }).setDepth(-5);
    this.add.text(mapConfig.width - 260, 130, '星蚀队', { color: '#fb7185', fontSize: '28px', fontStyle: 'bold' }).setDepth(-5);
  }

  private createStructures() {
    this.structures = [
      new Structure(this, { team: 'blue', type: 'core', x: mapConfig.blueBase.x, y: mapConfig.blueBase.y, hp: structureBalance.coreHp }),
      new Structure(this, { team: 'red', type: 'core', x: mapConfig.redBase.x, y: mapConfig.redBase.y, hp: structureBalance.coreHp }),
      new Structure(this, { team: 'blue', type: 'tower', x: mapConfig.blueTower.x, y: mapConfig.blueTower.y, hp: structureBalance.towerHp, range: structureBalance.towerRange, damage: structureBalance.towerDamage, interval: structureBalance.towerAttackInterval }),
      new Structure(this, { team: 'red', type: 'tower', x: mapConfig.redTower.x, y: mapConfig.redTower.y, hp: structureBalance.towerHp, range: structureBalance.towerRange, damage: structureBalance.towerDamage, interval: structureBalance.towerAttackInterval })
    ];
  }

  private createHeroes() {
    this.player = new Hero(this, 'blue', 'moon_blade', 360, 760, true);
    this.heroes = [
      this.player,
      new Hero(this, 'blue', 'star_archer', 310, 620),
      new Hero(this, 'blue', 'lunar_mage', 390, 680),
      new Hero(this, 'red', 'moon_blade', 2040, 640),
      new Hero(this, 'red', 'star_archer', 2090, 760),
      new Hero(this, 'red', 'star_lamp', 2010, 700)
    ];
  }

  private createCapturePoints() {
    this.captures = mapConfig.capturePoints.map((point) => new CapturePoint(this, point.id, point.name, point.x, point.y));
  }

  private updateInput() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) useMatchStore.getState().pauseMatch();
    if (this.keys.TAB.isDown) useMatchStore.getState().setScoreboardOpen(true);
    else useMatchStore.getState().setScoreboardOpen(false);
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    const pointer = this.input.activePointer;
    const point = new Phaser.Math.Vector2(pointer.worldX || this.player.x + 1, pointer.worldY || this.player.y);
    if (Phaser.Input.Keyboard.JustDown(this.keys.A)) this.commandAttack(point);
    (['Q', 'W', 'E', 'R'] as const).forEach((key, index) => {
      if (Phaser.Input.Keyboard.JustDown(this.keys[key])) this.skills.cast(this.player, index, point, this.units(), this.structures, this.projectiles);
    });
    if (this.getSettings().controlMode === 'wasd') {
      const x = Number(this.keys.D.isDown) - Number(this.keys.A.isDown) + this.mobileVector.x;
      const y = Number(this.keys.S.isDown) - Number(this.keys.W.isDown) + this.mobileVector.y;
      if (x || y) this.player.targetPoint = new Phaser.Math.Vector2(this.player.x + x * 120, this.player.y + y * 120);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const point = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    if (pointer.rightButtonDown()) {
      this.player.targetPoint = point;
      this.showMoveMarker(point.x, point.y);
    } else if (pointer.leftButtonDown()) {
      this.commandAttack(point);
    }
  }

  private commandAttack(point: Phaser.Math.Vector2) {
    const target = nearestEnemy(this.player, [...this.units(), ...this.structures], this.player.attackRange + 80);
    if (target) this.attackUnit(this.player, target);
    else this.skills.cast(this.player, 0, point, this.units(), this.structures, this.projectiles);
  }

  private updateUnits(delta: number) {
    [...this.heroes, ...this.minions].forEach((unit) => unit.updateTimers(delta));
    this.structures.forEach((structure) => structure.update(delta));
    this.heroes.forEach((hero) => {
      if (hero.alive && hero.targetPoint) hero.moveToward(hero.targetPoint);
      else hero.stop();
      if (!hero.alive && hero.respawnTimer <= 0) this.respawnHero(hero);
    });
    this.minions.forEach((minion) => {
      if (!minion.alive) return;
      const path = lanePathForTeam(minion.team);
      const current = path[minion.pathIndex];
      if (current && distance(minion, current) < 36) {
        minion.pathIndex += 1;
      }
      const next = path[minion.pathIndex] || (minion.team === 'blue' ? mapConfig.redBase : mapConfig.blueBase);
      minion.moveToward(next);
    });
    [...this.heroes, ...this.minions].forEach((unit) => {
      unit.sprite.x = Phaser.Math.Clamp(unit.x, 80, mapConfig.width - 80);
      unit.sprite.y = Phaser.Math.Clamp(unit.y, 90, mapConfig.height - 90);
    });
  }

  private updateAI(delta: number) {
    if (Math.floor(this.elapsed * 3) === Math.floor((this.elapsed - delta / 1000) * 3)) return;
    const cores = this.structures.filter((item) => item.type === 'core');
    this.heroes.filter((hero) => !hero.isPlayer && hero.alive).forEach((hero) => {
      const home = hero.team === 'blue' ? mapConfig.blueBase : mapConfig.redBase;
      if (hero.hp / hero.maxHp < 0.25) {
        hero.aiState = 'retreat';
        hero.targetPoint = new Phaser.Math.Vector2(home.x, home.y);
        return;
      }
      const resource = this.captures.find((point) => point.cooldown <= 0 && distance(hero, point) < 760);
      if (resource && Math.random() < 0.24) {
        hero.aiState = 'capture_resource';
        hero.targetPoint = new Phaser.Math.Vector2(resource.x, resource.y);
        return;
      }
      const enemyHero = nearestEnemy(hero, this.heroes, 420);
      if (enemyHero && enemyHero.hp < hero.hp * 1.15) {
        hero.aiState = 'attack_hero';
        hero.targetPoint = new Phaser.Math.Vector2(enemyHero.x, enemyHero.y);
        this.tryCastAI(hero, enemyHero);
        return;
      }
      const enemyTower = nearestEnemy(hero, this.structures.filter((item) => item.type === 'tower'), 620);
      const friendlyMinionsNearTower = this.minions.some((minion) => minion.team === hero.team && enemyTower && distance(minion, enemyTower) < 260);
      if (enemyTower && friendlyMinionsNearTower) {
        hero.aiState = 'push_tower';
        hero.targetPoint = new Phaser.Math.Vector2(enemyTower.x, enemyTower.y);
        return;
      }
      const enemyCore = cores.find((core) => core.team !== hero.team);
      const path = lanePathForTeam(hero.team);
      hero.aiState = 'laning';
      const laneTarget = path[Math.min(Math.max(hero.team === 'blue' ? 2 : 2, 0), path.length - 1)] || enemyCore;
      hero.targetPoint = new Phaser.Math.Vector2(laneTarget.x + (hero.team === 'blue' ? 160 : -160), laneTarget.y + (hero.id.endsWith('2') ? -90 : 90));
    });
  }

  private tryCastAI(hero: Hero, target: CombatTarget) {
    const point = new Phaser.Math.Vector2(target.x, target.y);
    const index = hero.hp / hero.maxHp < 0.55 ? 1 : target.hp < 180 ? 3 : 0;
    this.skills.cast(hero, index, point, this.units(), this.structures, this.projectiles);
  }

  private updateAttacks(_delta: number) {
    this.units().filter((unit) => unit.alive).forEach((unit) => {
      const target = nearestEnemy(unit, [...this.units(), ...this.structures], unit.attackRange);
      if (!target) return;
      this.attackUnit(unit, target);
    });
  }

  private attackUnit(attacker: Unit, target: CombatTarget) {
    if (!attacker.canAttack()) return;
    if (attacker.attackRange > 120) this.combat.projectileAttack(attacker, target, this.projectiles);
    else {
      const damage = this.combat.meleeAttack(attacker, target);
      if (damage) this.afterDamage(attacker, target, damage);
    }
  }

  private handleProjectileHit(projectile: Projectile, target: CombatTarget, damage: number) {
    const attacker = this.units().find((unit) => unit.team === projectile.team && unit.alive && distance(unit, target) < 720);
    if (attacker) this.afterDamage(attacker, target, damage);
  }

  private afterDamage(attacker: Unit | Structure, target: CombatTarget, damage: number) {
    if (target instanceof Structure && target.type === 'core') this.teamSystem.coreDamage(attacker.team, damage);
    if (target.alive) return;
    if (target instanceof Unit) this.handleUnitDeath(target, attacker.team, attacker instanceof Unit ? attacker : undefined);
    else this.handleStructureDeath(target, attacker.team);
  }

  private handleUnitDeath(unit: Unit, killerTeam: TeamId, killer?: Unit) {
    if (unit.kind === 'hero') {
      unit.deaths += 1;
      unit.respawnTimer = matchConfig.respawnTime;
      this.teamSystem.heroKill(killerTeam);
      if (killer) {
        killer.kills += 1;
        killer.gainExp(80);
      }
      this.pushFeed(`${killerTeam === 'blue' ? '月辉队' : '星蚀队'}击败了 ${unit.name}`);
    } else {
      this.teamSystem.minionKill(killerTeam, unit instanceof Minion && unit.minionType === 'core' ? 15 : 0);
      if (killer) killer.gainExp(10);
    }
    this.particles.burst(unit.x, unit.y, unit.team === 'blue' ? 0x7dd3fc : 0xfb7185, unit.kind === 'hero' ? 22 : 10);
  }

  private handleStructureDeath(structure: Structure, killerTeam: TeamId) {
    if (structure.type === 'tower') {
      this.teamSystem.towerDestroy(killerTeam);
      this.pushFeed(`${killerTeam === 'blue' ? '月辉队' : '星蚀队'}摧毁了防御塔`);
    }
    this.particles.burst(structure.x, structure.y, structure.color, 28);
  }

  private cleanupDead() {
    this.minions = this.minions.filter((minion) => {
      if (minion.alive) return true;
      minion.destroy();
      return false;
    });
  }

  private respawnHero(hero: Hero) {
    const base = hero.team === 'blue' ? mapConfig.blueBase : mapConfig.redBase;
    hero.respawn(base.x + (hero.team === 'blue' ? 120 : -120), base.y + Phaser.Math.Between(-90, 90));
    this.pushFeed(`${hero.name} 已复活`);
  }

  private checkVictory() {
    const blueCore = this.core('blue');
    const redCore = this.core('red');
    if (blueCore.hp <= 0) return this.finish('red', '星蚀队摧毁了月辉核心');
    if (redCore.hp <= 0) return this.finish('blue', '月辉队摧毁了星蚀核心');
    if (this.timeLeft <= 0) {
      if (this.teamSystem.scores.blue > this.teamSystem.scores.red) return this.finish('blue', '时间结束，月辉队积分领先');
      if (this.teamSystem.scores.red > this.teamSystem.scores.blue) return this.finish('red', '时间结束，星蚀队积分领先');
      return this.finish('draw', '时间结束，双方积分相同');
    }
  }

  private finish(winner: TeamId | 'draw', reason: string) {
    if (this.ended) return;
    this.ended = true;
    useMatchStore.getState().endMatch({
      winner,
      title: winner === 'blue' ? '月辉队胜利' : winner === 'red' ? '星蚀队胜利' : '平局',
      reason,
      blueScore: this.teamSystem.scores.blue,
      redScore: this.teamSystem.scores.red,
      elapsed: this.elapsed
    });
    this.scene.start('ResultScene');
  }

  private syncHud() {
    const blueCore = this.core('blue');
    const redCore = this.core('red');
    const blueTower = this.tower('blue');
    const redTower = this.tower('red');
    const teams: Record<TeamId, TeamSnapshot> = {
      blue: { id: 'blue', name: '月辉队', score: this.teamSystem.scores.blue, coreHp: blueCore.hp, maxCoreHp: blueCore.maxHp, towerHp: blueTower?.hp || 0, maxTowerHp: blueTower?.maxHp || structureBalance.towerHp },
      red: { id: 'red', name: '星蚀队', score: this.teamSystem.scores.red, coreHp: redCore.hp, maxCoreHp: redCore.maxHp, towerHp: redTower?.hp || 0, maxTowerHp: redTower?.maxHp || structureBalance.towerHp }
    };
    const skills = this.player.skillIds.map((id, index) => {
      const skill = skillConfigs[id];
      return { key: (['Q', 'W', 'E', 'R'] as const)[index], name: skill.name, cooldown: this.player.cooldowns[id] || 0, maxCooldown: skill.cooldown } satisfies SkillSnapshot;
    });
    const captures = this.captures.map((point) => ({
      id: point.id,
      name: point.name,
      owner: point.owner,
      progress: point.progress,
      contested: point.contested,
      cooldown: point.cooldown
    } satisfies CaptureSnapshot));
    const heroes = this.heroes.map((hero) => ({
      id: hero.id,
      name: hero.name,
      role: hero.role as HeroSnapshot['role'],
      team: hero.team,
      hp: hero.hp,
      maxHp: hero.maxHp,
      level: hero.level,
      kills: hero.kills,
      deaths: hero.deaths,
      assists: hero.assists,
      respawnTimer: hero.respawnTimer,
      isPlayer: hero.isPlayer
    }));
    useMatchStore.getState().updateHud({
      timeLeft: this.timeLeft,
      elapsed: this.elapsed,
      playerHp: this.player.hp,
      playerMaxHp: this.player.maxHp,
      playerLevel: this.player.level,
      playerKills: this.player.kills,
      playerDeaths: this.player.deaths,
      playerAssists: this.player.assists,
      teams,
      skills,
      captures,
      heroes,
      minimap: this.minimap.build(this.units(), this.structures, this.captures),
      killFeed: this.feed
    });
  }

  private showMoveMarker(x: number, y: number) {
    this.moveMarker?.destroy();
    this.moveMarker = this.add.circle(x, y, 18, 0x7dd3fc, 0.12).setStrokeStyle(2, 0x7dd3fc, 0.6).setDepth(4);
    this.tweens.add({ targets: this.moveMarker, alpha: 0, scaleX: 1.8, scaleY: 1.8, duration: 420, onComplete: () => this.moveMarker?.destroy() });
  }

  private pushFeed(message: string) {
    this.feed = [message, ...this.feed].slice(0, 5);
  }

  private handleScreen(screen: MatchScreen) {
    if (screen === 'paused' || screen === 'settings') {
      this.pausedByStore = true;
      this.physics.pause();
    }
    if (screen === 'playing' && this.pausedByStore) {
      this.pausedByStore = false;
      this.physics.resume();
    }
  }

  private handleMobileAction = (event: CustomEvent<'attack' | 'Q' | 'W' | 'E' | 'R' | { action: 'move'; x: number; y: number }>) => {
    if (typeof event.detail === 'object') {
      this.mobileVector.set(event.detail.x, event.detail.y);
      return;
    }
    const pointer = this.input.activePointer;
    const point = new Phaser.Math.Vector2(pointer.worldX || this.player.x + 1, pointer.worldY || this.player.y);
    if (event.detail === 'attack') this.commandAttack(point);
    const index = ['Q', 'W', 'E', 'R'].indexOf(event.detail);
    if (index >= 0) this.skills.cast(this.player, index, point, this.units(), this.structures, this.projectiles);
  };

  private units(): Unit[] {
    return [...this.heroes, ...this.minions];
  }

  private targets(): CombatTarget[] {
    return [...this.units(), ...this.structures];
  }

  private core(team: TeamId) {
    return this.structures.find((structure) => structure.team === team && structure.type === 'core')!;
  }

  private tower(team: TeamId) {
    return this.structures.find((structure) => structure.team === team && structure.type === 'tower');
  }

  private getSettings(): MatchSettings {
    return this.registry.get('match:settings') || useMatchStore.getState().settings;
  }
}
