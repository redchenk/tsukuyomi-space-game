import Phaser from 'phaser';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x050816, 0.7);
    this.add.ellipse(width / 2, height / 2, 860, 420, 0xc084fc, 0.05).setStrokeStyle(2, 0xc084fc, 0.28);
    this.game.events.on('match:start', this.handleStart, this);
  }

  shutdown() {
    this.game.events.off('match:start', this.handleStart, this);
  }

  private handleStart(runId: number) {
    if (runId > 0) this.scene.start('MatchScene');
  }
}
