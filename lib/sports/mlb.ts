import type { Player, HistoricalTeam, Era } from '../types';
import { computePlayerScore } from '../algorithms/powerRating';

const MLB_API = 'https://statsapi.mlb.com/api/v1';

// ─── Static team data (MLB teams are stable) ─────────────────────────────────

export const MLB_TEAMS: HistoricalTeam[] = [
  { id: '147', name: 'Yankees', city: 'New York', abbreviation: 'NYY', sport: 'mlb', primaryColor: '#003087', secondaryColor: '#E4002C' },
  { id: '111', name: 'Red Sox', city: 'Boston', abbreviation: 'BOS', sport: 'mlb', primaryColor: '#BD3039', secondaryColor: '#0C2340' },
  { id: '112', name: 'Cubs', city: 'Chicago', abbreviation: 'CHC', sport: 'mlb', primaryColor: '#0E3386', secondaryColor: '#CC3433' },
  { id: '113', name: 'Reds', city: 'Cincinnati', abbreviation: 'CIN', sport: 'mlb', primaryColor: '#C6011F', secondaryColor: '#000000' },
  { id: '116', name: 'Tigers', city: 'Detroit', abbreviation: 'DET', sport: 'mlb', primaryColor: '#0C2340', secondaryColor: '#FA4616' },
  { id: '117', name: 'Astros', city: 'Houston', abbreviation: 'HOU', sport: 'mlb', primaryColor: '#002D62', secondaryColor: '#EB6E1F' },
  { id: '118', name: 'Royals', city: 'Kansas City', abbreviation: 'KC', sport: 'mlb', primaryColor: '#004687', secondaryColor: '#C09A5B' },
  { id: '119', name: 'Dodgers', city: 'Los Angeles', abbreviation: 'LAD', sport: 'mlb', primaryColor: '#005A9C', secondaryColor: '#EF3E42' },
  { id: '133', name: 'Athletics', city: 'Oakland', abbreviation: 'OAK', sport: 'mlb', primaryColor: '#003831', secondaryColor: '#EFB21E' },
  { id: '134', name: 'Pirates', city: 'Pittsburgh', abbreviation: 'PIT', sport: 'mlb', primaryColor: '#27251F', secondaryColor: '#FDB827' },
  { id: '135', name: 'Padres', city: 'San Diego', abbreviation: 'SD', sport: 'mlb', primaryColor: '#2F241D', secondaryColor: '#FFC425' },
  { id: '136', name: 'Mariners', city: 'Seattle', abbreviation: 'SEA', sport: 'mlb', primaryColor: '#0C2C56', secondaryColor: '#005C5C' },
  { id: '137', name: 'Giants', city: 'San Francisco', abbreviation: 'SF', sport: 'mlb', primaryColor: '#FD5A1E', secondaryColor: '#27251F' },
  { id: '138', name: 'Cardinals', city: 'St. Louis', abbreviation: 'STL', sport: 'mlb', primaryColor: '#C41E3A', secondaryColor: '#FEDB00' },
  { id: '139', name: 'Rays', city: 'Tampa Bay', abbreviation: 'TB', sport: 'mlb', primaryColor: '#092C5C', secondaryColor: '#8FBCE6' },
  { id: '140', name: 'Rangers', city: 'Texas', abbreviation: 'TEX', sport: 'mlb', primaryColor: '#003278', secondaryColor: '#C0111F' },
  { id: '141', name: 'Blue Jays', city: 'Toronto', abbreviation: 'TOR', sport: 'mlb', primaryColor: '#134A8E', secondaryColor: '#1D2D5C' },
  { id: '142', name: 'Twins', city: 'Minnesota', abbreviation: 'MIN', sport: 'mlb', primaryColor: '#002B5C', secondaryColor: '#D31145' },
  { id: '143', name: 'Phillies', city: 'Philadelphia', abbreviation: 'PHI', sport: 'mlb', primaryColor: '#E81828', secondaryColor: '#002D72' },
  { id: '144', name: 'Braves', city: 'Atlanta', abbreviation: 'ATL', sport: 'mlb', primaryColor: '#CE1141', secondaryColor: '#13274F' },
  { id: '145', name: 'White Sox', city: 'Chicago', abbreviation: 'CWS', sport: 'mlb', primaryColor: '#27251F', secondaryColor: '#C4CED4' },
  { id: '146', name: 'Marlins', city: 'Miami', abbreviation: 'MIA', sport: 'mlb', primaryColor: '#00A3E0', secondaryColor: '#FF6600' },
  { id: '108', name: 'Angels', city: 'Los Angeles', abbreviation: 'LAA', sport: 'mlb', primaryColor: '#BA0021', secondaryColor: '#003263' },
  { id: '109', name: 'Diamondbacks', city: 'Arizona', abbreviation: 'ARI', sport: 'mlb', primaryColor: '#A71930', secondaryColor: '#E3D4AD' },
  { id: '110', name: 'Orioles', city: 'Baltimore', abbreviation: 'BAL', sport: 'mlb', primaryColor: '#DF4601', secondaryColor: '#000000' },
  { id: '114', name: 'Guardians', city: 'Cleveland', abbreviation: 'CLE', sport: 'mlb', primaryColor: '#00385D', secondaryColor: '#E31937' },
  { id: '115', name: 'Rockies', city: 'Colorado', abbreviation: 'COL', sport: 'mlb', primaryColor: '#33006F', secondaryColor: '#C4CED4' },
  { id: '120', name: 'Nationals', city: 'Washington', abbreviation: 'WSH', sport: 'mlb', primaryColor: '#AB0003', secondaryColor: '#14225A' },
  { id: '121', name: 'Mets', city: 'New York', abbreviation: 'NYM', sport: 'mlb', primaryColor: '#002D72', secondaryColor: '#FF5910' },
  { id: '158', name: 'Brewers', city: 'Milwaukee', abbreviation: 'MIL', sport: 'mlb', primaryColor: '#FFC52F', secondaryColor: '#12284B' },
];

// ─── Fetch player data from MLB Stats API ─────────────────────────────────────

interface MLBApiPlayer {
  person: { id: number; fullName: string };
  position: { abbreviation: string; type: string };
  jerseyNumber?: string;
}

interface MLBApiStats {
  stat: {
    avg?: string;
    homeRuns?: number;
    rbi?: number;
    obp?: string;
    slg?: string;
    ops?: string;
    stolenBases?: number;
    era?: string;
    whip?: string;
    strikeOuts?: number;
    inningsPitched?: string;
    wins?: number;
    saves?: number;
  };
  season: string;
}

function mlbPositionToType(pos: string, type: string): { position: Player['position']; group: Player['positionGroup'] } {
  if (type === 'Pitcher') {
    // We'll figure SP vs RP vs CL from role/stats
    return { position: 'SP', group: 'pitching' };
  }
  const map: Record<string, Player['position']> = {
    'C': 'C_MLB', '1B': '1B', '2B': '2B', '3B': '3B',
    'SS': 'SS', 'LF': 'LF', 'CF': 'CF', 'RF': 'RF',
    'DH': 'DH', 'OF': 'RF',
  };
  return { position: map[pos] ?? 'DH', group: 'offense' };
}

export async function fetchMLBPlayers(team: HistoricalTeam, era: Era): Promise<Player[]> {
  const players: Player[] = [];
  const midYear = Math.round((era.startYear + era.endYear) / 2);
  const yearsToCheck = [era.startYear, midYear, era.endYear].filter((v, i, a) => a.indexOf(v) === i);

  const seenIds = new Set<number>();

  for (const year of yearsToCheck) {
    if (year < 1876 || year > 2024) continue;

    try {
      // Fetch roster
      const rosterRes = await fetch(
        `${MLB_API}/teams/${team.id}/roster?season=${year}&rosterType=active`,
        { next: { revalidate: 3600 } }
      );
      if (!rosterRes.ok) continue;

      const rosterData = await rosterRes.json();
      const roster: MLBApiPlayer[] = rosterData.roster ?? [];

      for (const rosterPlayer of roster.slice(0, 40)) {
        const pid = rosterPlayer.person.id;
        if (seenIds.has(pid)) continue;

        try {
          const statsRes = await fetch(
            `${MLB_API}/people/${pid}/stats?stats=season&season=${year}&group=hitting,pitching`,
            { next: { revalidate: 3600 } }
          );
          if (!statsRes.ok) continue;

          const statsData = await statsRes.json();
          const statGroups: { type: { displayName: string }; splits: { stat: MLBApiStats['stat'] }[] }[] =
            statsData.stats ?? [];

          let playerStats: Player['stats'] = {};
          let isPitcher = rosterPlayer.position.type === 'Pitcher';

          for (const group of statGroups) {
            const split = group.splits?.[0];
            if (!split) continue;
            const stat = split.stat;

            if (group.type.displayName === 'season' && !isPitcher) {
              playerStats = {
                battingAvg: stat.avg ? parseFloat(stat.avg) : undefined,
                homeRuns: stat.homeRuns,
                rbi: stat.rbi,
                onBasePct: stat.obp ? parseFloat(stat.obp) : undefined,
                sluggingPct: stat.slg ? parseFloat(stat.slg) : undefined,
                ops: stat.ops ? parseFloat(stat.ops) : undefined,
                stolenBases: stat.stolenBases,
              };
            } else if (group.type.displayName === 'season' && isPitcher) {
              playerStats = {
                era: stat.era ? parseFloat(stat.era) : undefined,
                whip: stat.whip ? parseFloat(stat.whip) : undefined,
                strikeoutsPerNine: stat.strikeOuts && stat.inningsPitched
                  ? (stat.strikeOuts / parseFloat(stat.inningsPitched)) * 9
                  : undefined,
                wins: stat.wins,
                saves: stat.saves,
                inningsPitched: stat.inningsPitched ? parseFloat(stat.inningsPitched) : undefined,
              };
            }
          }

          // Skip if no meaningful stats
          const hasStats = isPitcher
            ? playerStats.era !== undefined
            : playerStats.ops !== undefined || playerStats.battingAvg !== undefined;
          if (!hasStats) continue;

          const { position, group } = mlbPositionToType(
            rosterPlayer.position.abbreviation,
            rosterPlayer.position.type
          );

          // Classify pitchers more specifically by saves
          let finalPosition = position;
          if (isPitcher) {
            if ((playerStats.saves ?? 0) > 15) finalPosition = 'CL';
            else if ((playerStats.inningsPitched ?? 0) < 70) finalPosition = 'RP';
            else finalPosition = 'SP';
          }

          const p: Player = {
            id: `mlb-${pid}-${year}`,
            name: rosterPlayer.person.fullName,
            position: finalPosition,
            positionGroup: group,
            yearsWithTeam: `${year}`,
            stats: playerStats,
            playerScore: 0,
            isLegend: false,
            isAllStar: false,
          };
          p.playerScore = computePlayerScore(p, 'mlb');
          players.push(p);
          seenIds.add(pid);
        } catch {
          // Skip individual player errors
        }
      }
    } catch {
      // Skip year fetch errors
    }
  }

  // Sort by player score, deduplicate by name, return top 25
  const unique = Array.from(new Map(players.map(p => [p.name, p])).values());
  return unique.sort((a, b) => b.playerScore - a.playerScore).slice(0, 25);
}
