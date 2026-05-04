import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x050816);
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x7dd3fc, 0.2);
    for (let index = 0; index < 12; index += 1) {
      graphics.strokeEllipse(width / 2, height / 2, 320 + index * 76, 160 + index * 42);
    }
    this.game.events.on('match:start', this.handleStart, this);
  }

  shutdown() {
    this.game.events.off('match:start', this.handleStart, this);
  }

  private handleStart(runId: number) {
    if (runId > 0) this.scene.start('MatchScene');
  }
}
