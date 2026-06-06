import type { Player, HistoricalTeam, Era } from '../types';
import { computePlayerScore } from '../algorithms/powerRating';

const NBA_API = 'https://api.balldontlie.io/v1';

export const NBA_TEAMS: HistoricalTeam[] = [
  { id: '1', name: 'Hawks', city: 'Atlanta', abbreviation: 'ATL', sport: 'nba', primaryColor: '#E03A3E', secondaryColor: '#C1D32F' },
  { id: '2', name: 'Celtics', city: 'Boston', abbreviation: 'BOS', sport: 'nba', primaryColor: '#007A33', secondaryColor: '#BA9653' },
  { id: '3', name: 'Nets', city: 'Brooklyn', abbreviation: 'BKN', sport: 'nba', primaryColor: '#000000', secondaryColor: '#FFFFFF' },
  { id: '4', name: 'Hornets', city: 'Charlotte', abbreviation: 'CHA', sport: 'nba', primaryColor: '#1D1160', secondaryColor: '#00788C' },
  { id: '5', name: 'Bulls', city: 'Chicago', abbreviation: 'CHI', sport: 'nba', primaryColor: '#CE1141', secondaryColor: '#000000' },
  { id: '6', name: 'Cavaliers', city: 'Cleveland', abbreviation: 'CLE', sport: 'nba', primaryColor: '#860038', secondaryColor: '#FDBB30' },
  { id: '7', name: 'Mavericks', city: 'Dallas', abbreviation: 'DAL', sport: 'nba', primaryColor: '#00538C', secondaryColor: '#002B5E' },
  { id: '8', name: 'Nuggets', city: 'Denver', abbreviation: 'DEN', sport: 'nba', primaryColor: '#0E2240', secondaryColor: '#FEC524' },
  { id: '9', name: 'Pistons', city: 'Detroit', abbreviation: 'DET', sport: 'nba', primaryColor: '#C8102E', secondaryColor: '#1D42BA' },
  { id: '10', name: 'Warriors', city: 'Golden State', abbreviation: 'GSW', sport: 'nba', primaryColor: '#1D428A', secondaryColor: '#FFC72C' },
  { id: '11', name: 'Rockets', city: 'Houston', abbreviation: 'HOU', sport: 'nba', primaryColor: '#CE1141', secondaryColor: '#000000' },
  { id: '12', name: 'Pacers', city: 'Indiana', abbreviation: 'IND', sport: 'nba', primaryColor: '#002D62', secondaryColor: '#FDBB30' },
  { id: '13', name: 'Clippers', city: 'Los Angeles', abbreviation: 'LAC', sport: 'nba', primaryColor: '#C8102E', secondaryColor: '#1D428A' },
  { id: '14', name: 'Lakers', city: 'Los Angeles', abbreviation: 'LAL', sport: 'nba', primaryColor: '#552583', secondaryColor: '#FDB927' },
  { id: '15', name: 'Grizzlies', city: 'Memphis', abbreviation: 'MEM', sport: 'nba', primaryColor: '#5D76A9', secondaryColor: '#12173F' },
  { id: '16', name: 'Heat', city: 'Miami', abbreviation: 'MIA', sport: 'nba', primaryColor: '#98002E', secondaryColor: '#F9A01B' },
  { id: '17', name: 'Bucks', city: 'Milwaukee', abbreviation: 'MIL', sport: 'nba', primaryColor: '#00471B', secondaryColor: '#EEE1C6' },
  { id: '18', name: 'Timberwolves', city: 'Minnesota', abbreviation: 'MIN', sport: 'nba', primaryColor: '#0C2340', secondaryColor: '#236192' },
  { id: '19', name: 'Pelicans', city: 'New Orleans', abbreviation: 'NOP', sport: 'nba', primaryColor: '#0C2340', secondaryColor: '#C8102E' },
  { id: '20', name: 'Knicks', city: 'New York', abbreviation: 'NYK', sport: 'nba', primaryColor: '#006BB6', secondaryColor: '#F58426' },
  { id: '21', name: 'Thunder', city: 'Oklahoma City', abbreviation: 'OKC', sport: 'nba', primaryColor: '#007AC1', secondaryColor: '#EF3B24' },
  { id: '22', name: 'Magic', city: 'Orlando', abbreviation: 'ORL', sport: 'nba', primaryColor: '#0077C0', secondaryColor: '#C4CED4' },
  { id: '23', name: '76ers', city: 'Philadelphia', abbreviation: 'PHI', sport: 'nba', primaryColor: '#006BB6', secondaryColor: '#ED174C' },
  { id: '24', name: 'Suns', city: 'Phoenix', abbreviation: 'PHX', sport: 'nba', primaryColor: '#1D1160', secondaryColor: '#E56020' },
  { id: '25', name: 'Trail Blazers', city: 'Portland', abbreviation: 'POR', sport: 'nba', primaryColor: '#E03A3E', secondaryColor: '#000000' },
  { id: '26', name: 'Kings', city: 'Sacramento', abbreviation: 'SAC', sport: 'nba', primaryColor: '#5A2D81', secondaryColor: '#63727A' },
  { id: '27', name: 'Spurs', city: 'San Antonio', abbreviation: 'SAS', sport: 'nba', primaryColor: '#C4CED4', secondaryColor: '#000000' },
  { id: '28', name: 'Raptors', city: 'Toronto', abbreviation: 'TOR', sport: 'nba', primaryColor: '#CE1141', secondaryColor: '#000000' },
  { id: '29', name: 'Jazz', city: 'Utah', abbreviation: 'UTA', sport: 'nba', primaryColor: '#002B5C', secondaryColor: '#00471B' },
  { id: '30', name: 'Wizards', city: 'Washington', abbreviation: 'WAS', sport: 'nba', primaryColor: '#002B5C', secondaryColor: '#E31837' },
];

export async function fetchNBAPlayers(team: HistoricalTeam, era: Era, apiKey?: string): Promise<Player[]> {
  if (!apiKey) {
    return generateFallbackNBAPlayers(team, era);
  }

  const players: Player[] = [];
  const midYear = Math.round((era.startYear + era.endYear) / 2);

  try {
    // Fetch season stats for this team/year
    const statsUrl = new URL(`${NBA_API}/stats`);
    statsUrl.searchParams.set('team_ids[]', team.id);
    statsUrl.searchParams.set('season', String(midYear));
    statsUrl.searchParams.set('per_page', '50');

    const res = await fetch(statsUrl.toString(), {
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`NBA API: ${res.status}`);

    const data = await res.json();
    const stats: {
      player: { id: number; first_name: string; last_name: string; position: string };
      pts: number; reb: number; ast: number; stl: number; blk: number;
      fg_pct: number; fg3_pct: number; ft_pct: number;
    }[] = data.data ?? [];

    const grouped = new Map<number, typeof stats[0]>();
    for (const s of stats) {
      const existing = grouped.get(s.player.id);
      if (!existing || s.pts > existing.pts) grouped.set(s.player.id, s);
    }

    for (const s of Array.from(grouped.values())) {
      const posMap: Record<string, Player['position']> = {
        'PG': 'PG', 'SG': 'SG', 'SF': 'SF', 'PF': 'PF', 'C': 'C',
        'G': 'SG', 'F': 'SF', 'F-G': 'SG', 'G-F': 'SF', 'F-C': 'PF', 'C-F': 'C',
      };
      const position = posMap[s.player.position] ?? 'SF';

      const p: Player = {
        id: `nba-${s.player.id}-${midYear}`,
        name: `${s.player.first_name} ${s.player.last_name}`,
        position,
        positionGroup: 'offense',
        yearsWithTeam: `${era.startYear}–${era.endYear}`,
        stats: {
          points: s.pts,
          rebounds: s.reb,
          assists: s.ast,
          steals: s.stl,
          blocks: s.blk,
          fieldGoalPct: s.fg_pct,
          threePointPct: s.fg3_pct,
          freeThrowPct: s.ft_pct,
        },
        playerScore: 0,
      };
      p.playerScore = computePlayerScore(p, 'nba');
      players.push(p);
    }
  } catch {
    return generateFallbackNBAPlayers(team, era);
  }

  if (players.length < 5) return generateFallbackNBAPlayers(team, era);

  return players.sort((a, b) => b.playerScore - a.playerScore).slice(0, 20);
}

function generateFallbackNBAPlayers(team: HistoricalTeam, era: Era): Player[] {
  const positions: Array<{ pos: Player['position']; label: string }> = [
    { pos: 'PG', label: 'PG' }, { pos: 'PG', label: 'PG' },
    { pos: 'SG', label: 'SG' }, { pos: 'SG', label: 'SG' },
    { pos: 'SF', label: 'SF' }, { pos: 'SF', label: 'SF' },
    { pos: 'PF', label: 'PF' }, { pos: 'PF', label: 'PF' },
    { pos: 'C', label: 'C' }, { pos: 'C', label: 'C' },
    { pos: 'SF', label: 'SF' }, { pos: 'PF', label: 'PF' },
  ];

  return positions.map((pos, i) => {
    const pts = 12 + Math.round(Math.random() * 18);
    const p: Player = {
      id: `nba-fb-${team.id}-${i}`,
      name: `${team.city} ${pos.label} ${i + 1}`,
      position: pos.pos,
      positionGroup: 'offense',
      yearsWithTeam: `${era.startYear}–${era.endYear}`,
      stats: {
        points: pts,
        rebounds: 3 + Math.round(Math.random() * 7),
        assists: 2 + Math.round(Math.random() * 6),
        steals: Math.round(Math.random() * 2 * 10) / 10,
        blocks: Math.round(Math.random() * 1.5 * 10) / 10,
        fieldGoalPct: 0.42 + Math.round(Math.random() * 12) / 100,
        threePointPct: 0.31 + Math.round(Math.random() * 12) / 100,
        freeThrowPct: 0.70 + Math.round(Math.random() * 20) / 100,
      },
      playerScore: 0,
    };
    p.playerScore = computePlayerScore(p, 'nba');
    return p;
  }).sort((a, b) => b.playerScore - a.playerScore);
}
