import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config/gameConfig';
import { useMatchStore } from '../store/matchStore';

export default function GameContainer() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const runId = useMatchStore((state) => state.runId);
  const screen = useMatchStore((state) => state.screen);
  const settings = useMatchStore((state) => state.settings);
  const mode = useMatchStore((state) => state.mode);

  useEffect(() => {
    if (!rootRef.current || gameRef.current) return;
    gameRef.current = new Phaser.Game(createGameConfig(rootRef.current));
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    game.registry.set('match:mode', mode);
    game.registry.set('match:settings', settings);
    game.events.emit('match:start', runId);
  }, [runId, mode, settings]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    game.registry.set('match:screen', screen);
    game.events.emit('match:screen', screen);
  }, [screen]);

  return <div ref={rootRef} className="game-root" />;
}
