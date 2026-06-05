export const MAPS = [];
export const TEAMS = [];
export const H2H_RECORDS = {};

// Fetch dynamic data from the FastAPI backend
export async function fetchInitialData(timeRange = '1y', dataType = 'historical') {
  try {
    const params = `?timeRange=${timeRange}&dataType=${dataType}`;
    const [mapsRes, teamsRes, h2hRes] = await Promise.all([
      fetch(`/api/maps${params}`),
      fetch(`/api/teams${params}`),
      fetch(`/api/h2h${params}`)
    ]);

    if (!mapsRes.ok || !teamsRes.ok || !h2hRes.ok) {
      throw new Error('Failed to fetch API data. Is the backend running?');
    }

    const maps = await mapsRes.json();
    const teams = await teamsRes.json();
    const h2h = await h2hRes.json();

    // Mutate the exported constants so existing synchronous logic doesn't break
    MAPS.length = 0;
    MAPS.push(...maps);

    TEAMS.length = 0;
    TEAMS.push(...teams);

    for (const key in H2H_RECORDS) delete H2H_RECORDS[key];
    Object.assign(H2H_RECORDS, h2h);
    
    console.log('[Data Layer] Successfully loaded dynamic data from backend.');
  } catch (error) {
    console.error('[Data Layer] Error loading data:', error);
    // If backend fails, we could potentially inject a small mock fallback here,
    // but for now let's let it fail so the user knows they need to run the backend.
  }
}

// Standard fallback if H2H is missing
export function getH2H(teamAId, teamBId, mapId) {
  if (H2H_RECORDS[teamAId]?.[teamBId]?.[mapId]) {
    return H2H_RECORDS[teamAId][teamBId][mapId];
  }
  if (H2H_RECORDS[teamBId]?.[teamAId]?.[mapId]) {
    const rev = H2H_RECORDS[teamBId][teamAId][mapId];
    return [rev[1], rev[0]]; // Swap wins
  }
  // Generate pseudo-historical record based on map winrates
  const wA = TEAMS.find(t => t.id === teamAId)?.mapPool[mapId]?.winRate || 50;
  const wB = TEAMS.find(t => t.id === teamBId)?.mapPool[mapId]?.winRate || 50;
  const total = 5;
  const aWins = Math.round((wA / (wA + wB)) * total);
  return [aWins, total - aWins];
}
