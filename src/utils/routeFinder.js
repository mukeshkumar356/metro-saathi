import { STATIONS } from '../data/stations';
import { LINES } from '../data/lines';

/**
 * Finds the shortest station-to-station path via BFS over an adjacency
 * graph built from every line's station sequence, including branch lines
 * (e.g. the Blue Line splits past Yamuna Bank into the Vaishali and Noida
 * Electronic City branches). Branch stations are linked back to the last
 * station of their parent line, so they're reachable like any other stop.
 *
 * Interchange stations (e.g. Rajiv Chowk) are stored once per line under
 * separate ids, so records sharing a name and coordinates are linked with
 * `transfer` edges; without them no route could cross between lines.
 *
 * Pulled out of RouteScreen into its own module so the pathfinding logic
 * can be unit-tested independently of any React Native rendering.
 */
export const findRoute = (fromId, toId) => {
  if (fromId === toId) return null;

  const adj = {};
  STATIONS.forEach(s => { adj[s.id] = []; });

  Object.entries(LINES).forEach(([lineKey, line]) => {
    const stns = line.stations;
    for (let i = 0; i < stns.length; i++) {
      if (!adj[stns[i]]) continue;
      if (i > 0 && adj[stns[i - 1]]) {
        adj[stns[i]].push({ id: stns[i - 1], line: lineKey });
        adj[stns[i - 1]].push({ id: stns[i], line: lineKey });
      }
    }

    if (line.branches) {
      line.branches.forEach(branch => {
        let prev = stns[stns.length - 1];
        branch.forEach(id => {
          if (adj[id] && adj[prev]) {
            adj[id].push({ id: prev, line: lineKey });
            adj[prev].push({ id, line: lineKey });
          }
          prev = id;
        });
      });
    }
  });

  const byPlace = {};
  STATIONS.forEach(s => {
    (byPlace[`${s.name}|${s.lat}|${s.lng}`] ||= []).push(s);
  });
  Object.values(byPlace).forEach(group => {
    group.forEach(a => group.forEach(b => {
      if (a.id !== b.id) adj[a.id].push({ id: b.id, line: b.line, transfer: true });
    }));
  });

  const visited = new Set();
  const queue = [[fromId, [{ id: fromId, line: null }]]];
  visited.add(fromId);

  while (queue.length > 0) {
    const [current, path] = queue.shift();
    if (current === toId) return path;
    for (const neighbor of (adj[current] || [])) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push([neighbor.id, [...path, neighbor]]);
      }
    }
  }
  return null;
};
