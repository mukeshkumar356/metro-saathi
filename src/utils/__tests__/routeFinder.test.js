import { findRoute } from '../routeFinder';

describe('findRoute', () => {
  it('returns null when source and destination are the same station', () => {
    expect(findRoute('DW21', 'DW21')).toBeNull();
  });

  it('finds a route along a single line', () => {
    const path = findRoute('DW21', 'YP');
    expect(path).not.toBeNull();
    expect(path[0].id).toBe('DW21');
    expect(path[path.length - 1].id).toBe('YP');
  });

  it('reaches stations on the Vaishali branch of the Blue Line', () => {
    const path = findRoute('DW21', 'VL');
    expect(path).not.toBeNull();
    expect(path[path.length - 1].id).toBe('VL');
  });

  it('reaches stations on the Noida Electronic City branch of the Blue Line', () => {
    const path = findRoute('DW21', 'NEC');
    expect(path).not.toBeNull();
    expect(path[path.length - 1].id).toBe('NEC');
  });

  it('finds a cross-branch route (one branch to the other, via the shared main line)', () => {
    const path = findRoute('VL', 'NEC');
    expect(path).not.toBeNull();
    expect(path[0].id).toBe('VL');
    expect(path[path.length - 1].id).toBe('NEC');
  });

  it('returns null for an unknown station id', () => {
    expect(findRoute('DW21', 'NOT-A-REAL-STATION')).toBeNull();
  });
});
