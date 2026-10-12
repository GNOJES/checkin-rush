import { describe, it, expect } from 'vitest';
import { initialState, reducer } from './game';
const start = (mode = 'timed') => reducer(initialState, { type: 'START', mode, now: 1000 } as any);
const act = (s: any, type: string, extra = {}) =>
  reducer(s, { type, now: 2000, session: s.session, ...extra } as any);
const solve = (s: any, paid = false) => {
  s = act(s, 'LOOKUP', { code: ' q7m2kd ', surname: ' han ' });
  s = act(s, 'NAME', { surname: 'han', given: ' seojun ', paid });
  s = act(s, 'TIME', { value: '14:05' });
  return act(s, 'GATE', { value: 'C08' });
};
describe('game rules', () => {
  it('issues a free boarding pass after four puzzles', () => {
    const s = act(solve(start()), 'ISSUE');
    expect(s.status).toBe('success');
    expect(s.cost).toBe(0);
    expect(s.done).toEqual([true, true, true, true]);
  });
  it('explains agency code and retries normalized airline code', () => {
    let s = act(start(), 'LOOKUP', { code: 'TR-482193', surname: 'HAN' });
    expect(s.notice).toContain('여행사 주문번호');
    expect(s.done[0]).toBe(false);
    s = act(s, 'LOOKUP', { code: ' q7m2kd ', surname: ' han ' });
    expect(s.done[0]).toBe(true);
    expect(s.wrong).toBe(1);
  });
  it('charges each trap once and can still win', () => {
    let s = act(start(), 'RECOVERY');
    s = act(s, 'RECOVERY');
    s = solve(s, true);
    s = act(s, 'NAME', { surname: 'HAN', given: 'SEOJUN', paid: true });
    s = act(s, 'ISSUE');
    expect(s.cost).toBe(29800);
    expect(s.status).toBe('success');
  });
  it('rejects bad names and choices without blocking retries', () => {
    let s = act(start(), 'LOOKUP', { code: 'Q7M2KD', surname: 'HAN' });
    s = act(s, 'NAME', { surname: 'HAN', given: 'SEOJOON' });
    s = act(s, 'TIME', { value: '15:05' });
    s = act(s, 'GATE', { value: 'B12' });
    expect(s.wrong).toBe(3);
    expect(act(solve(s), 'ISSUE').status).toBe('success');
  });
  it('locks results on timeout even without a tick', () => {
    const s = reducer(solve(start()), { type: 'ISSUE', session: 1, now: 301000 } as any);
    expect(s.status).toBe('failure');
    expect(act(s, 'RECOVERY')).toEqual(s);
  });
  it('practice never times out', () => {
    const s = reducer(start('practice'), { type: 'TICK', now: 900000, session: 1 } as any);
    expect(s.status).toBe('playing');
  });
  it('counts unique hint stages and keeps history', () => {
    let s = act(start(), 'HINT', { puzzle: 0, level: 0 });
    s = act(s, 'HINT', { puzzle: 0, level: 0 });
    s = act(s, 'HINT', { puzzle: 0, level: 1 });
    expect(s.hints).toEqual(['0-0', '0-1']);
  });
  it('ignores stale actions after restart and resets state', () => {
    let s = solve(start());
    s = act(s, 'START', { mode: 'timed', now: 4000 });
    const stale = reducer(s, { type: 'MESSAGE', key: 'code', now: 5000, session: 1 } as any);
    expect(stale).toEqual(s);
    expect(s.done).toEqual([false, false, false, false]);
    expect(s.cost).toBe(0);
    expect(s.session).toBe(2);
  });
  it('cannot issue incomplete puzzles', () => expect(act(start(), 'ISSUE').status).toBe('playing'));
});
