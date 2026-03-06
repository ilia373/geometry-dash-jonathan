import { describe, it, expect, vi } from 'vitest';

vi.mock('../../config/firebase', () => ({ db: {}, auth: {} }));
vi.mock('../skinManager', () => ({
  getSelectedSkin: vi.fn(() => ({
    colors: { primary: '#000', secondary: '#000', glow: '#000', accent: '#000' },
    emoji: '',
  })),
}));

import { applyDamageToQuant, updateQuantFlash } from '../gamePhysics';
import { QUANT_HP_CONFIG } from '../../constants/gameConfig';
import type { Quant } from '../../types/game';

const makeQuant = (overrides: Partial<Quant> = {}): Quant => ({
  id: 1,
  x: 500,
  y: 580,
  width: 35,
  height: 35,
  type: 'static',
  vx: 0,
  vy: 0,
  baseY: 580,
  color: '#8B00FF',
  isDead: false,
  coinDrop: 5,
  hp: 20,
  maxHp: 20,
  flashTimer: 0,
  ...overrides,
});

describe('applyDamageToQuant', () => {
  it('basic damage: hp=20, damage=5 → hp=15, flashTimer=6, isDead=false', () => {
    const quant = makeQuant();
    applyDamageToQuant(quant, 5);
    expect(quant.hp).toBe(15);
    expect(quant.flashTimer).toBe(6);
    expect(quant.isDead).toBe(false);
  });

  it('lethal damage: hp=20, damage=25 → hp=0 (clamped), isDead=true', () => {
    const quant = makeQuant();
    applyDamageToQuant(quant, 25);
    expect(quant.hp).toBe(0);
    expect(quant.isDead).toBe(true);
  });

  it('exact lethal: hp=20, damage=20 → hp=0, isDead=true', () => {
    const quant = makeQuant();
    applyDamageToQuant(quant, 20);
    expect(quant.hp).toBe(0);
    expect(quant.isDead).toBe(true);
  });

  it('near-lethal: hp=20, damage=19 → hp=1, isDead=false', () => {
    const quant = makeQuant();
    applyDamageToQuant(quant, 19);
    expect(quant.hp).toBe(1);
    expect(quant.isDead).toBe(false);
  });

  it('flash timer set to 6 on any damage call', () => {
    const quant = makeQuant({ flashTimer: 0 });
    applyDamageToQuant(quant, 1);
    expect(quant.flashTimer).toBe(6);
  });

  it('isDead not set prematurely when hp > 0 after damage', () => {
    const quant = makeQuant({ hp: 20, isDead: false });
    applyDamageToQuant(quant, 10);
    expect(quant.hp).toBe(10);
    expect(quant.isDead).toBe(false);
  });

  it('overkill: hp=5, damage=100 → hp=0 (not negative), isDead=true', () => {
    const quant = makeQuant({ hp: 5, maxHp: 5 });
    applyDamageToQuant(quant, 100);
    expect(quant.hp).toBe(0);
    expect(quant.isDead).toBe(true);
  });

  it('sequential damage: hp=20 → damage=10 → hp=10 → damage=10 → hp=0, isDead=true', () => {
    const quant = makeQuant();
    applyDamageToQuant(quant, 10);
    expect(quant.hp).toBe(10);
    expect(quant.flashTimer).toBe(6);
    expect(quant.isDead).toBe(false);

    applyDamageToQuant(quant, 10);
    expect(quant.hp).toBe(0);
    expect(quant.flashTimer).toBe(6);
    expect(quant.isDead).toBe(true);
  });
});

describe('updateQuantFlash', () => {
  it('flashTimer=6 → after update: flashTimer=5', () => {
    const quant = makeQuant({ flashTimer: 6 });
    updateQuantFlash(quant);
    expect(quant.flashTimer).toBe(5);
  });

  it('flashTimer=1 → after update: flashTimer=0', () => {
    const quant = makeQuant({ flashTimer: 1 });
    updateQuantFlash(quant);
    expect(quant.flashTimer).toBe(0);
  });

  it('flashTimer=0 → stays 0 (no decrement below 0)', () => {
    const quant = makeQuant({ flashTimer: 0 });
    updateQuantFlash(quant);
    expect(quant.flashTimer).toBe(0);
  });

  it('multiple frames: call 6 times on quant with flashTimer=6 → flashTimer=0', () => {
    const quant = makeQuant({ flashTimer: 6 });
    for (let i = 0; i < 6; i++) {
      updateQuantFlash(quant);
    }
    expect(quant.flashTimer).toBe(0);
  });
});

describe('QUANT_HP_CONFIG', () => {
  it('baseHp.static === 20', () => {
    expect(QUANT_HP_CONFIG.baseHp.static).toBe(20);
  });

  it('baseHp.moving === 40', () => {
    expect(QUANT_HP_CONFIG.baseHp.moving).toBe(40);
  });

  it('baseHp.jumping === 60', () => {
    expect(QUANT_HP_CONFIG.baseHp.jumping).toBe(60);
  });

  it('levelMultipliers[0] === 1.0', () => {
    expect(QUANT_HP_CONFIG.levelMultipliers[0]).toBe(1.0);
  });

  it('levelMultipliers[1] === 1.5', () => {
    expect(QUANT_HP_CONFIG.levelMultipliers[1]).toBe(1.5);
  });

  it('levelMultipliers[2] === 2.0', () => {
    expect(QUANT_HP_CONFIG.levelMultipliers[2]).toBe(2.0);
  });
});
