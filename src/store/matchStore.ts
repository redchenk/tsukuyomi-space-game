import { create } from 'zustand';

export type TeamId = 'blue' | 'red';
export type MatchScreen = 'menu' | 'playing' | 'paused' | 'settings' | 'result';
export type MatchMode = 'standard' | 'quick' | 'demo';
export type Role = 'fighter' | 'marksman' | 'mage' | 'support';
export type ControlMode = 'moba' | 'wasd';

export interface TeamSnapshot {
  id: TeamId;
  name: string;
  score: number;
  coreHp: number;
  maxCoreHp: number;
  towerHp: number;
  maxTowerHp: number;
}

export interface HeroSnapshot {
  id: string;
  name: string;
  role: Role;
  team: TeamId;
  hp: number;
  maxHp: number;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  respawnTimer: number;
  isPlayer?: boolean;
}

export interface SkillSnapshot {
  key: 'Q' | 'W' | 'E' | 'R';
  name: string;
  cooldown: number;
  maxCooldown: number;
}

export interface MinimapEntity {
  id: string;
  type: 'hero' | 'minion' | 'tower' | 'core' | 'resource';
  team?: TeamId;
  x: number;
  y: number;
  visible: boolean;
}

export interface CaptureSnapshot {
  id: string;
  name: string;
  owner: TeamId | null;
  progress: number;
  contested: boolean;
  cooldown: number;
}

export interface MatchHud {
  timeLeft: number;
  elapsed: number;
  playerHp: number;
  playerMaxHp: number;
  playerLevel: number;
  playerKills: number;
  playerDeaths: number;
  playerAssists: number;
  teams: Record<TeamId, TeamSnapshot>;
  heroes: HeroSnapshot[];
  skills: SkillSnapshot[];
  captures: CaptureSnapshot[];
  minimap: MinimapEntity[];
  killFeed: string[];
}

export interface ResultState {
  winner: TeamId | 'draw';
  title: string;
  reason: string;
  blueScore: number;
  redScore: number;
  elapsed: number;
}

export interface MatchSettings {
  volume: number;
  quality: 'low' | 'medium' | 'high';
  controlMode: ControlMode;
  mobileControls: boolean;
  screenShake: boolean;
}

interface MatchStore {
  screen: MatchScreen;
  previousScreen: MatchScreen;
  mode: MatchMode;
  runId: number;
  scoreboardOpen: boolean;
  hud: MatchHud;
  result: ResultState | null;
  settings: MatchSettings;
  startMatch: (mode: MatchMode) => void;
  pauseMatch: () => void;
  resumeMatch: () => void;
  endMatch: (result: ResultState) => void;
  returnToMenu: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setScoreboardOpen: (open: boolean) => void;
  updateHud: (hud: Partial<MatchHud>) => void;
  updateSettings: (settings: Partial<MatchSettings>) => void;
}

const defaultTeams: Record<TeamId, TeamSnapshot> = {
  blue: { id: 'blue', name: '月辉队', score: 0, coreHp: 1500, maxCoreHp: 1500, towerHp: 800, maxTowerHp: 800 },
  red: { id: 'red', name: '星蚀队', score: 0, coreHp: 1500, maxCoreHp: 1500, towerHp: 800, maxTowerHp: 800 }
};

const defaultHud: MatchHud = {
  timeLeft: 300,
  elapsed: 0,
  playerHp: 680,
  playerMaxHp: 680,
  playerLevel: 1,
  playerKills: 0,
  playerDeaths: 0,
  playerAssists: 0,
  teams: defaultTeams,
  heroes: [],
  skills: [
    { key: 'Q', name: '月影突进', cooldown: 0, maxCooldown: 6 },
    { key: 'W', name: '护月屏障', cooldown: 0, maxCooldown: 9 },
    { key: 'E', name: '弦月斩', cooldown: 0, maxCooldown: 7 },
    { key: 'R', name: '满月裂斩', cooldown: 0, maxCooldown: 32 }
  ],
  captures: [],
  minimap: [],
  killFeed: []
};

const defaultSettings: MatchSettings = {
  volume: 70,
  quality: 'high',
  controlMode: 'moba',
  mobileControls: true,
  screenShake: true
};

function readSave() {
  try {
    return JSON.parse(localStorage.getItem('moon-arena-moba-save') || '{}');
  } catch {
    return {};
  }
}

function writeSave(data: Record<string, unknown>) {
  localStorage.setItem('moon-arena-moba-save', JSON.stringify({ ...readSave(), ...data }));
}

const save = readSave();

export const useMatchStore = create<MatchStore>((set) => ({
  screen: 'menu',
  previousScreen: 'menu',
  mode: 'standard',
  runId: 0,
  scoreboardOpen: false,
  hud: defaultHud,
  result: null,
  settings: { ...defaultSettings, ...(save.settings || {}) },
  startMatch: (mode) => set((state) => ({
    screen: 'playing',
    previousScreen: 'playing',
    mode,
    runId: state.runId + 1,
    scoreboardOpen: false,
    hud: defaultHud,
    result: null
  })),
  pauseMatch: () => set({ screen: 'paused', previousScreen: 'playing' }),
  resumeMatch: () => set({ screen: 'playing', previousScreen: 'playing' }),
  endMatch: (result) => set({ screen: 'result', previousScreen: 'result', result, scoreboardOpen: false }),
  returnToMenu: () => set({ screen: 'menu', previousScreen: 'menu', result: null, scoreboardOpen: false }),
  openSettings: () => set((state) => ({ screen: 'settings', previousScreen: state.screen })),
  closeSettings: () => set((state) => ({ screen: state.previousScreen === 'settings' ? 'menu' : state.previousScreen })),
  setScoreboardOpen: (scoreboardOpen) => set({ scoreboardOpen }),
  updateHud: (hud) => set((state) => ({ hud: { ...state.hud, ...hud } })),
  updateSettings: (settings) => set((state) => {
    const next = { ...state.settings, ...settings };
    writeSave({ settings: next });
    return { settings: next };
  })
}));
