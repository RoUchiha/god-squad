import type { Player, HistoricalTeam, Era } from '../types';
import { computePlayerScore } from '../algorithms/powerRating';

const NHL_API = 'https://api-web.nhle.com/v1';
const NHL_STATS_API = 'https://api.nhle.com/stats/rest/en';

export const NHL_TEAMS: HistoricalTeam[] = [
  { id: 'BOS', name: 'Bruins', city: 'Boston', abbreviation: 'BOS', sport: 'nhl', primaryColor: '#FFB81C', secondaryColor: '#000000' },
  { id: 'BUF', name: 'Sabres', city: 'Buffalo', abbreviation: 'BUF', sport: 'nhl', primaryColor: '#003087', secondaryColor: '#FCB514' },
  { id: 'CGY', name: 'Flames', city: 'Calgary', abbreviation: 'CGY', sport: 'nhl', primaryColor: '#C8102E', secondaryColor: '#F1BE48' },
  { id: 'CAR', name: 'Hurricanes', city: 'Carolina', abbreviation: 'CAR', sport: 'nhl', primaryColor: '#CC0000', secondaryColor: '#000000' },
  { id: 'CHI', name: 'Blackhawks', city: 'Chicago', abbreviation: 'CHI', sport: 'nhl', primaryColor: '#CF0A2C', secondaryColor: '#000000' },
  { id: 'COL', name: 'Avalanche', city: 'Colorado', abbreviation: 'COL', sport: 'nhl', primaryColor: '#6F263D', secondaryColor: '#236192' },
  { id: 'CBJ', name: 'Blue Jackets', city: 'Columbus', abbreviation: 'CBJ', sport: 'nhl', primaryColor: '#002654', secondaryColor: '#CE1126' },
  { id: 'DAL', name: 'Stars', city: 'Dallas', abbreviation: 'DAL', sport: 'nhl', primaryColor: '#006847', secondaryColor: '#8F8F8C' },
  { id: 'DET', name: 'Red Wings', city: 'Detroit', abbreviation: 'DET', sport: 'nhl', primaryColor: '#CE1126', secondaryColor: '#FFFFFF' },
  { id: 'EDM', name: 'Oilers', city: 'Edmonton', abbreviation: 'EDM', sport: 'nhl', primaryColor: '#FF4C00', secondaryColor: '#041E42' },
  { id: 'FLA', name: 'Panthers', city: 'Florida', abbreviation: 'FLA', sport: 'nhl', primaryColor: '#041E42', secondaryColor: '#C8102E' },
  { id: 'LAK', name: 'Kings', city: 'Los Angeles', abbreviation: 'LAK', sport: 'nhl', primaryColor: '#111111', secondaryColor: '#A2AAAD' },
  { id: 'MIN', name: 'Wild', city: 'Minnesota', abbreviation: 'MIN', sport: 'nhl', primaryColor: '#154734', secondaryColor: '#DDCBA4' },
  { id: 'MTL', name: 'Canadiens', city: 'Montréal', abbreviation: 'MTL', sport: 'nhl', primaryColor: '#AF1E2D', secondaryColor: '#192168' },
  { id: 'NSH', name: 'Predators', city: 'Nashville', abbreviation: 'NSH', sport: 'nhl', primaryColor: '#FFB81C', secondaryColor: '#041E42' },
  { id: 'NJD', name: 'Devils', city: 'New Jersey', abbreviation: 'NJD', sport: 'nhl', primaryColor: '#CE1126', secondaryColor: '#000000' },
  { id: 'NYI', name: 'Islanders', city: 'New York', abbreviation: 'NYI', sport: 'nhl', primaryColor: '#00539B', secondaryColor: '#F47D30' },
  { id: 'NYR', name: 'Rangers', city: 'New York', abbreviation: 'NYR', sport: 'nhl', primaryColor: '#0038A8', secondaryColor: '#CE1126' },
  { id: 'OTT', name: 'Senators', city: 'Ottawa', abbreviation: 'OTT', sport: 'nhl', primaryColor: '#C52032', secondaryColor: '#C69214' },
  { id: 'PHI', name: 'Flyers', city: 'Philadelphia', abbreviation: 'PHI', sport: 'nhl', primaryColor: '#F74902', secondaryColor: '#000000' },
  { id: 'PIT', name: 'Penguins', city: 'Pittsburgh', abbreviation: 'PIT', sport: 'nhl', primaryColor: '#000000', secondaryColor: '#FCB514' },
  { id: 'SEA', name: 'Kraken', city: 'Seattle', abbreviation: 'SEA', sport: 'nhl', primaryColor: '#001628', secondaryColor: '#99D9D9' },
  { id: 'SJS', name: 'Sharks', city: 'San Jose', abbreviation: 'SJS', sport: 'nhl', primaryColor: '#006D75', secondaryColor: '#EA7200' },
  { id: 'STL', name: 'Blues', city: 'St. Louis', abbreviation: 'STL', sport: 'nhl', primaryColor: '#002F87', secondaryColor: '#FCB514' },
  { id: 'TBL', name: 'Lightning', city: 'Tampa Bay', abbreviation: 'TBL', sport: 'nhl', primaryColor: '#002868', secondaryColor: '#FFFFFF' },
  { id: 'TOR', name: 'Maple Leafs', city: 'Toronto', abbreviation: 'TOR', sport: 'nhl', primaryColor: '#003E7E', secondaryColor: '#FFFFFF' },
  { id: 'VAN', name: 'Canucks', city: 'Vancouver', abbreviation: 'VAN', sport: 'nhl', primaryColor: '#001F5B', secondaryColor: '#00843D' },
  { id: 'VGK', name: 'Golden Knights', city: 'Vegas', abbreviation: 'VGK', sport: 'nhl', primaryColor: '#B4975A', secondaryColor: '#333F42' },
  { id: 'WSH', name: 'Capitals', city: 'Washington', abbreviation: 'WSH', sport: 'nhl', primaryColor: '#041E42', secondaryColor: '#C8102E' },
  { id: 'WPG', name: 'Jets', city: 'Winnipeg', abbreviation: 'WPG', sport: 'nhl', primaryColor: '#041E42', secondaryColor: '#004C97' },
];

function nhlPositionMap(pos: string): { position: Player['position']; group: Player['positionGroup'] } {
  switch (pos?.toUpperCase()) {
    case 'L': return { position: 'LW', group: 'offense' };
    case 'R': return { position: 'RW', group: 'offense' };
    case 'C': return { position: 'C_NHL', group: 'offense' };
    case 'D': return { position: 'D', group: 'defense' };
    case 'G': return { position: 'G_NHL', group: 'goalie' };
    default: return { position: 'C_NHL', group: 'offense' };
  }
}

export async function fetchNHLPlayers(team: HistoricalTeam, era: Era): Promise<Player[]> {
  const players: Player[] = [];
  const season = `${era.endYear - 1}${era.endYear}`; // NHL season format e.g. "20222023"

  try {
    // Try current roster stats endpoint
    const url = `${NHL_API}/club-stats/${team.id}/${season}/2`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (res.ok) {
      const data = await res.json();
      const skaters: { playerId: number; firstName: { default: string }; lastName: { default: string }; positionCode: string; points: number; goals: number; assists: number; plusMinus: number; penaltyMinutes: number; powerPlayGoals: number }[] =
        data.skaters ?? [];
      const goalies: { playerId: number; firstName: { default: string }; lastName: { default: string }; savePercentage: number; goalsAgainstAverage: number; wins: number }[] =
        data.goalies ?? [];

      for (const s of skaters.slice(0, 20)) {
        const { position, group } = nhlPositionMap(s.positionCode);
        const p: Player = {
          id: `nhl-${s.playerId}-${season}`,
          name: `${s.firstName.default} ${s.lastName.default}`,
          position,
          positionGroup: group,
          yearsWithTeam: `${era.startYear}–${era.endYear}`,
          stats: {
            goals: s.goals,
            nhlAssists: s.assists,
            nhlPoints: s.points,
            plusMinus: s.plusMinus,
            penaltyMinutes: s.penaltyMinutes,
            powerPlayGoals: s.powerPlayGoals,
          },
          playerScore: 0,
        };
        p.playerScore = computePlayerScore(p, 'nhl');
        players.push(p);
      }

      for (const g of goalies.slice(0, 2)) {
        const p: Player = {
          id: `nhl-g-${g.playerId}-${season}`,
          name: `${g.firstName.default} ${g.lastName.default}`,
          position: 'G_NHL',
          positionGroup: 'goalie',
          yearsWithTeam: `${era.startYear}–${era.endYear}`,
          stats: {
            savePct: g.savePercentage,
            goalsAgainstAvg: g.goalsAgainstAverage,
          },
          playerScore: 0,
        };
        p.playerScore = computePlayerScore(p, 'nhl');
        players.push(p);
      }
    }
  } catch {
    // Fallback handled below
  }

  if (players.length === 0) {
    return generateFallbackNHLPlayers(team, era);
  }

  return players.sort((a, b) => b.playerScore - a.playerScore).slice(0, 25);
}

function generateFallbackNHLPlayers(team: HistoricalTeam, era: Era): Player[] {
  // Generate plausible placeholder players when API fails
  const positions: Array<{ pos: Player['position']; group: Player['positionGroup']; label: string }> = [
    { pos: 'C_NHL', group: 'offense', label: 'C' },
    { pos: 'LW', group: 'offense', label: 'LW' },
    { pos: 'RW', group: 'offense', label: 'RW' },
    { pos: 'C_NHL', group: 'offense', label: 'C' },
    { pos: 'LW', group: 'offense', label: 'LW' },
    { pos: 'RW', group: 'offense', label: 'RW' },
    { pos: 'D', group: 'defense', label: 'D' },
    { pos: 'D', group: 'defense', label: 'D' },
    { pos: 'D', group: 'defense', label: 'D' },
    { pos: 'D', group: 'defense', label: 'D' },
    { pos: 'G_NHL', group: 'goalie', label: 'G' },
    { pos: 'G_NHL', group: 'goalie', label: 'G' },
  ];

  return positions.map((pos, i) => {
    const pts = pos.group === 'offense' ? Math.round(45 + Math.random() * 55) : pos.group === 'defense' ? Math.round(20 + Math.random() * 40) : 0;
    const p: Player = {
      id: `nhl-fb-${team.id}-${i}`,
      name: `${team.city} ${pos.label} ${i + 1}`,
      position: pos.pos,
      positionGroup: pos.group,
      yearsWithTeam: `${era.startYear}–${era.endYear}`,
      stats: pos.group === 'goalie'
        ? { savePct: 0.905 + Math.random() * 0.02, goalsAgainstAvg: 2.5 + Math.random() * 0.8 }
        : { nhlPoints: pts, goals: Math.round(pts * 0.4), nhlAssists: Math.round(pts * 0.6), plusMinus: Math.round((Math.random() - 0.3) * 30) },
      playerScore: 0,
    };
    p.playerScore = computePlayerScore(p, 'nhl');
    return p;
  }).sort((a, b) => b.playerScore - a.playerScore);
}
