import { describe, it, expect } from 'vitest';
import { StreakEngine } from '../src/domain/streak-engine';

describe('StreakEngine', () => {
  const engine = new StreakEngine();

  it('first claim returns day 1', () => {
    const result = engine.nextState(null, new Date('2026-03-01'));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.currentDay).toBe(1);
    }
  });

  it('consecutive day increments streak', () => {
    const r1 = engine.nextState(null, new Date('2026-03-01'));
    expect(r1.success).toBe(true);
    if (!r1.success) return;
    const r2 = engine.nextState(r1.state, new Date('2026-03-02'));
    expect(r2.success).toBe(true);
    if (r2.success) {
      expect(r2.state.currentDay).toBe(2);
    }
  });

  it('streak caps at 6', () => {
    let state = engine.nextState(null, new Date('2026-03-01'));
    expect(state.success).toBe(true);
    if (!state.success) return;
    let current = state.state;
    for (let i = 2; i <= 10; i++) {
      const r = engine.nextState(current, new Date(`2026-03-${String(i).padStart(2, '0')}`));
      expect(r.success).toBe(true);
      if (!r.success) return;
      current = r.state;
    }
    expect(current.currentDay).toBe(6);
  });

  it('gap resets streak to 1', () => {
    const r1 = engine.nextState(null, new Date('2026-03-01'));
    if (!r1.success) return;
    const r2 = engine.nextState(r1.state, new Date('2026-03-02'));
    if (!r2.success) return;
    const r4 = engine.nextState(r2.state, new Date('2026-03-04'));
    expect(r4.success).toBe(true);
    if (r4.success) {
      expect(r4.state.currentDay).toBe(1);
    }
  });

  it('same day claim returns error', () => {
    const r1 = engine.nextState(null, new Date('2026-03-01'));
    if (!r1.success) return;
    const r2 = engine.nextState(r1.state, new Date('2026-03-01'));
    expect(r2.success).toBe(false);
  });

  it('baseEntries follows streak ladder', () => {
    expect(engine.baseEntries(1)).toBe(10);
    expect(engine.baseEntries(2)).toBe(30);
    expect(engine.baseEntries(3)).toBe(60);
    expect(engine.baseEntries(4)).toBe(130);
    expect(engine.baseEntries(5)).toBe(240);
    expect(engine.baseEntries(6)).toBe(300);
  });

  it('baseEntries clamps for out of range', () => {
    expect(engine.baseEntries(0)).toBe(10);
    expect(engine.baseEntries(7)).toBe(300);
  });
});
