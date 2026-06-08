import type { Player, HistoricalTeam, Era } from '../types';
import { computePlayerScore } from '../algorithms/powerRating';
import { fetchESPNCurrentRoster, LIVE_ERA_THRESHOLD } from './nba-espn';

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

type HistoricalNBAPlayer = { name: string; position: Player['position']; stats: Player['stats']; isLegend?: boolean; isAllStar?: boolean };

const NBA_HISTORICAL_ROSTERS: Record<string, HistoricalNBAPlayer[]> = {
  // Lakers Showtime I 1980-1984
  '14-nba-14-1980': [
    { name: 'Magic Johnson',       position: 'PG', isLegend: true,  stats: { points: 18.6, rebounds: 7.7, assists: 9.5,  steals: 1.9, blocks: 0.5, fieldGoalPct: 0.521, threePointPct: 0.303, freeThrowPct: 0.760 } },
    { name: 'Norm Nixon',          position: 'PG',                   stats: { points: 17.1, rebounds: 3.0, assists: 8.6,  steals: 1.5, blocks: 0.1, fieldGoalPct: 0.485, threePointPct: 0.225, freeThrowPct: 0.712 } },
    { name: 'Eddie Jordan',        position: 'PG',                   stats: { points: 7.2,  rebounds: 1.8, assists: 4.2,  steals: 1.3, blocks: 0.1, fieldGoalPct: 0.430, threePointPct: 0.200, freeThrowPct: 0.740 } },
    { name: 'Michael Cooper',      position: 'SG',                   stats: { points: 8.9,  rebounds: 3.1, assists: 3.3,  steals: 1.2, blocks: 0.4, fieldGoalPct: 0.484, threePointPct: 0.321, freeThrowPct: 0.814 } },
    { name: 'Mike McGee',          position: 'SG',                   stats: { points: 9.4,  rebounds: 1.9, assists: 1.0,  steals: 0.6, blocks: 0.2, fieldGoalPct: 0.471, threePointPct: 0.200, freeThrowPct: 0.720 } },
    { name: 'Jamaal Wilkes',       position: 'SF', isAllStar: true,  stats: { points: 22.6, rebounds: 6.5, assists: 2.2,  steals: 1.0, blocks: 0.4, fieldGoalPct: 0.522, threePointPct: 0.250, freeThrowPct: 0.773 } },
    { name: 'James Worthy',        position: 'SF', isLegend: true,   stats: { points: 17.6, rebounds: 5.1, assists: 2.9,  steals: 1.3, blocks: 0.7, fieldGoalPct: 0.578, threePointPct: 0.167, freeThrowPct: 0.756 } },
    { name: 'Jim Brewer',          position: 'PF',                   stats: { points: 4.5,  rebounds: 5.5, assists: 0.9,  steals: 0.7, blocks: 0.6, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.610 } },
    { name: 'Kurt Rambis',         position: 'PF',                   stats: { points: 7.8,  rebounds: 8.0, assists: 1.4,  steals: 1.0, blocks: 0.6, fieldGoalPct: 0.558, threePointPct: 0.000, freeThrowPct: 0.626 } },
    { name: 'Bob McAdoo',          position: 'PF', isAllStar: true,  stats: { points: 16.2, rebounds: 7.3, assists: 1.8,  steals: 0.7, blocks: 1.4, fieldGoalPct: 0.540, threePointPct: 0.200, freeThrowPct: 0.762 } },
    { name: 'Kareem Abdul-Jabbar', position: 'C',  isLegend: true,   stats: { points: 27.2, rebounds: 10.2, assists: 3.4, steals: 1.2, blocks: 3.4, fieldGoalPct: 0.574, threePointPct: 0.000, freeThrowPct: 0.722 } },
    { name: 'Mitch Kupchak',       position: 'C',                    stats: { points: 9.6,  rebounds: 6.8, assists: 1.1,  steals: 0.4, blocks: 0.7, fieldGoalPct: 0.558, threePointPct: 0.000, freeThrowPct: 0.672 } },
    { name: 'Mark Landsberger',    position: 'PF',                   stats: { points: 5.4,  rebounds: 7.1, assists: 0.5,  steals: 0.4, blocks: 0.3, fieldGoalPct: 0.501, threePointPct: 0.000, freeThrowPct: 0.544 } },
  ],
  // Lakers Showtime II 1985-1989
  '14-nba-14-1985': [
    { name: 'Magic Johnson',       position: 'PG', isLegend: true,  stats: { points: 23.9, rebounds: 6.3, assists: 12.2, steals: 1.8, blocks: 0.5, fieldGoalPct: 0.522, threePointPct: 0.196, freeThrowPct: 0.848 } },
    { name: 'Byron Scott',         position: 'SG', isAllStar: true,  stats: { points: 21.7, rebounds: 3.4, assists: 3.0,  steals: 1.7, blocks: 0.3, fieldGoalPct: 0.491, threePointPct: 0.356, freeThrowPct: 0.840 } },
    { name: 'Michael Cooper',      position: 'SG',                   stats: { points: 10.5, rebounds: 3.2, assists: 3.7,  steals: 1.4, blocks: 0.5, fieldGoalPct: 0.492, threePointPct: 0.349, freeThrowPct: 0.807 } },
    { name: 'Adrian Branch',       position: 'SG',                   stats: { points: 5.1,  rebounds: 1.5, assists: 0.8,  steals: 0.5, blocks: 0.2, fieldGoalPct: 0.449, threePointPct: 0.220, freeThrowPct: 0.720 } },
    { name: 'James Worthy',        position: 'SF', isLegend: true,   stats: { points: 21.1, rebounds: 5.7, assists: 3.8,  steals: 1.5, blocks: 0.8, fieldGoalPct: 0.548, threePointPct: 0.111, freeThrowPct: 0.771 } },
    { name: 'Billy Thompson',      position: 'SF',                   stats: { points: 6.2,  rebounds: 3.8, assists: 1.0,  steals: 0.6, blocks: 0.5, fieldGoalPct: 0.483, threePointPct: 0.150, freeThrowPct: 0.660 } },
    { name: 'A.C. Green',          position: 'PF',                   stats: { points: 12.6, rebounds: 8.9, assists: 1.2,  steals: 1.1, blocks: 0.7, fieldGoalPct: 0.527, threePointPct: 0.311, freeThrowPct: 0.752 } },
    { name: 'Kurt Rambis',         position: 'PF',                   stats: { points: 7.0,  rebounds: 7.5, assists: 1.5,  steals: 0.9, blocks: 0.5, fieldGoalPct: 0.542, threePointPct: 0.000, freeThrowPct: 0.624 } },
    { name: 'Mychal Thompson',     position: 'C',                    stats: { points: 9.8,  rebounds: 6.1, assists: 1.7,  steals: 0.6, blocks: 1.2, fieldGoalPct: 0.510, threePointPct: 0.000, freeThrowPct: 0.690 } },
    { name: 'Kareem Abdul-Jabbar', position: 'C',  isLegend: true,   stats: { points: 23.4, rebounds: 8.4, assists: 2.9,  steals: 0.9, blocks: 2.8, fieldGoalPct: 0.562, threePointPct: 0.000, freeThrowPct: 0.722 } },
    { name: 'Jeff Lamp',           position: 'SG',                   stats: { points: 5.8,  rebounds: 1.7, assists: 0.9,  steals: 0.4, blocks: 0.1, fieldGoalPct: 0.457, threePointPct: 0.290, freeThrowPct: 0.812 } },
    { name: 'Tony Campbell',       position: 'SG',                   stats: { points: 7.3,  rebounds: 2.1, assists: 1.4,  steals: 0.7, blocks: 0.3, fieldGoalPct: 0.461, threePointPct: 0.000, freeThrowPct: 0.744 } },
  ],
  // Celtics Big Three 1980-1984
  '2-nba-2-1980': [
    { name: 'Larry Bird',        position: 'SF', isLegend: true,   stats: { points: 23.6, rebounds: 10.4, assists: 6.1, steals: 1.9, blocks: 0.8, fieldGoalPct: 0.496, threePointPct: 0.427, freeThrowPct: 0.888 } },
    { name: 'Kevin McHale',      position: 'PF', isLegend: true,   stats: { points: 18.3, rebounds: 7.9, assists: 1.9, steals: 0.6, blocks: 1.7, fieldGoalPct: 0.559, threePointPct: 0.000, freeThrowPct: 0.832 } },
    { name: 'Robert Parish',     position: 'C',  isLegend: true,   stats: { points: 18.9, rebounds: 10.5, assists: 2.0, steals: 1.2, blocks: 1.5, fieldGoalPct: 0.549, threePointPct: 0.000, freeThrowPct: 0.754 } },
    { name: 'Dennis Johnson',    position: 'PG', isLegend: true,   stats: { points: 12.9, rebounds: 4.0, assists: 6.1, steals: 1.7, blocks: 0.4, fieldGoalPct: 0.445, threePointPct: 0.245, freeThrowPct: 0.783 } },
    { name: 'Danny Ainge',       position: 'SG', isAllStar: true,  stats: { points: 14.8, rebounds: 3.4, assists: 4.0, steals: 1.7, blocks: 0.2, fieldGoalPct: 0.467, threePointPct: 0.381, freeThrowPct: 0.812 } },
    { name: 'Cedric Maxwell',    position: 'PF',                   stats: { points: 12.5, rebounds: 6.8, assists: 2.4, steals: 0.9, blocks: 0.6, fieldGoalPct: 0.542, threePointPct: 0.000, freeThrowPct: 0.811 } },
    { name: 'Quinn Buckner',     position: 'PG',                   stats: { points: 5.0,  rebounds: 2.5, assists: 4.0, steals: 1.5, blocks: 0.1, fieldGoalPct: 0.435, threePointPct: 0.200, freeThrowPct: 0.637 } },
    { name: 'Gerald Henderson',  position: 'SG',                   stats: { points: 9.8,  rebounds: 2.3, assists: 2.9, steals: 1.3, blocks: 0.2, fieldGoalPct: 0.473, threePointPct: 0.188, freeThrowPct: 0.762 } },
    { name: 'Scott Wedman',      position: 'SF',                   stats: { points: 12.0, rebounds: 3.6, assists: 1.4, steals: 0.7, blocks: 0.3, fieldGoalPct: 0.497, threePointPct: 0.374, freeThrowPct: 0.843 } },
    { name: 'Rick Robey',        position: 'C',                    stats: { points: 7.7,  rebounds: 6.3, assists: 1.5, steals: 0.4, blocks: 0.4, fieldGoalPct: 0.516, threePointPct: 0.000, freeThrowPct: 0.658 } },
    { name: 'M.L. Carr',         position: 'SF',                   stats: { points: 5.2,  rebounds: 2.9, assists: 1.2, steals: 1.1, blocks: 0.3, fieldGoalPct: 0.440, threePointPct: 0.220, freeThrowPct: 0.724 } },
    { name: 'Charles Bradley',   position: 'SG',                   stats: { points: 4.7,  rebounds: 1.9, assists: 0.9, steals: 0.8, blocks: 0.2, fieldGoalPct: 0.412, threePointPct: 0.000, freeThrowPct: 0.691 } },
  ],
  // Celtics Big Three 1985-1989
  '2-nba-2-1985': [
    { name: 'Larry Bird',        position: 'SF', isLegend: true,   stats: { points: 28.1, rebounds: 9.8, assists: 7.6, steals: 2.0, blocks: 0.9, fieldGoalPct: 0.496, threePointPct: 0.400, freeThrowPct: 0.910 } },
    { name: 'Kevin McHale',      position: 'PF', isLegend: true,   stats: { points: 21.3, rebounds: 8.6, assists: 2.2, steals: 0.7, blocks: 2.0, fieldGoalPct: 0.604, threePointPct: 0.000, freeThrowPct: 0.841 } },
    { name: 'Robert Parish',     position: 'C',  isLegend: true,   stats: { points: 17.0, rebounds: 9.8, assists: 1.8, steals: 1.1, blocks: 1.5, fieldGoalPct: 0.551, threePointPct: 0.000, freeThrowPct: 0.739 } },
    { name: 'Dennis Johnson',    position: 'PG', isLegend: true,   stats: { points: 11.7, rebounds: 3.9, assists: 6.0, steals: 1.6, blocks: 0.3, fieldGoalPct: 0.452, threePointPct: 0.280, freeThrowPct: 0.786 } },
    { name: 'Danny Ainge',       position: 'SG', isAllStar: true,  stats: { points: 13.5, rebounds: 3.0, assists: 3.9, steals: 1.5, blocks: 0.2, fieldGoalPct: 0.459, threePointPct: 0.394, freeThrowPct: 0.828 } },
    { name: 'Bill Walton',       position: 'C',  isLegend: true,   stats: { points: 7.6,  rebounds: 6.8, assists: 2.1, steals: 0.7, blocks: 1.3, fieldGoalPct: 0.562, threePointPct: 0.000, freeThrowPct: 0.675 } },
    { name: 'Scott Wedman',      position: 'SF',                   stats: { points: 12.2, rebounds: 3.5, assists: 1.5, steals: 0.6, blocks: 0.3, fieldGoalPct: 0.501, threePointPct: 0.379, freeThrowPct: 0.840 } },
    { name: 'Jerry Sichting',    position: 'PG',                   stats: { points: 6.8,  rebounds: 1.6, assists: 3.5, steals: 0.7, blocks: 0.0, fieldGoalPct: 0.536, threePointPct: 0.300, freeThrowPct: 0.834 } },
    { name: 'Jim Paxson',        position: 'SG',                   stats: { points: 7.5,  rebounds: 1.9, assists: 2.0, steals: 0.7, blocks: 0.1, fieldGoalPct: 0.469, threePointPct: 0.318, freeThrowPct: 0.817 } },
    { name: 'Fred Roberts',      position: 'PF',                   stats: { points: 7.0,  rebounds: 3.8, assists: 1.2, steals: 0.5, blocks: 0.4, fieldGoalPct: 0.497, threePointPct: 0.286, freeThrowPct: 0.771 } },
    { name: 'Brad Lohaus',       position: 'C',                    stats: { points: 5.8,  rebounds: 3.6, assists: 0.8, steals: 0.4, blocks: 0.8, fieldGoalPct: 0.455, threePointPct: 0.333, freeThrowPct: 0.706 } },
    { name: 'Mark Acres',        position: 'C',                    stats: { points: 3.9,  rebounds: 4.1, assists: 0.4, steals: 0.3, blocks: 0.4, fieldGoalPct: 0.512, threePointPct: 0.000, freeThrowPct: 0.609 } },
  ],
  // Bulls First Three-Peat 1990-1994
  '5-nba-5-1990': [
    { name: 'Michael Jordan',    position: 'SG', isLegend: true,   stats: { points: 32.6, rebounds: 6.0, assists: 6.1, steals: 2.8, blocks: 1.0, fieldGoalPct: 0.539, threePointPct: 0.312, freeThrowPct: 0.851 } },
    { name: 'Scottie Pippen',    position: 'SF', isLegend: true,   stats: { points: 21.4, rebounds: 8.7, assists: 5.9, steals: 2.9, blocks: 1.1, fieldGoalPct: 0.476, threePointPct: 0.301, freeThrowPct: 0.740 } },
    { name: 'Horace Grant',      position: 'PF',                   stats: { points: 14.2, rebounds: 9.0, assists: 2.7, steals: 1.6, blocks: 1.1, fieldGoalPct: 0.527, threePointPct: 0.000, freeThrowPct: 0.661 } },
    { name: 'B.J. Armstrong',    position: 'PG',                   stats: { points: 14.3, rebounds: 2.0, assists: 3.4, steals: 1.0, blocks: 0.1, fieldGoalPct: 0.494, threePointPct: 0.359, freeThrowPct: 0.839 } },
    { name: 'John Paxson',       position: 'SG',                   stats: { points: 8.7,  rebounds: 1.7, assists: 3.0, steals: 0.7, blocks: 0.1, fieldGoalPct: 0.511, threePointPct: 0.440, freeThrowPct: 0.873 } },
    { name: 'Toni Kukoc',        position: 'SF', isAllStar: true,  stats: { points: 13.1, rebounds: 4.7, assists: 3.6, steals: 1.0, blocks: 0.4, fieldGoalPct: 0.480, threePointPct: 0.400, freeThrowPct: 0.760 } },
    { name: 'Bill Cartwright',   position: 'C',                    stats: { points: 7.9,  rebounds: 5.8, assists: 1.9, steals: 0.4, blocks: 0.8, fieldGoalPct: 0.501, threePointPct: 0.000, freeThrowPct: 0.684 } },
    { name: 'Stacey King',       position: 'C',                    stats: { points: 5.4,  rebounds: 3.5, assists: 0.9, steals: 0.3, blocks: 0.6, fieldGoalPct: 0.476, threePointPct: 0.000, freeThrowPct: 0.700 } },
    { name: 'Scott Williams',    position: 'C',                    stats: { points: 4.6,  rebounds: 4.9, assists: 0.7, steals: 0.4, blocks: 0.7, fieldGoalPct: 0.504, threePointPct: 0.000, freeThrowPct: 0.594 } },
    { name: 'Craig Hodges',      position: 'SG',                   stats: { points: 6.4,  rebounds: 1.2, assists: 1.5, steals: 0.5, blocks: 0.0, fieldGoalPct: 0.455, threePointPct: 0.482, freeThrowPct: 0.857 } },
    { name: 'Will Perdue',       position: 'C',                    stats: { points: 3.2,  rebounds: 3.3, assists: 0.5, steals: 0.2, blocks: 0.6, fieldGoalPct: 0.512, threePointPct: 0.000, freeThrowPct: 0.612 } },
    { name: 'Bobby Hansen',      position: 'SG',                   stats: { points: 4.1,  rebounds: 1.5, assists: 1.2, steals: 0.6, blocks: 0.1, fieldGoalPct: 0.443, threePointPct: 0.333, freeThrowPct: 0.800 } },
  ],
  // Bulls Second Three-Peat 1995-1999
  '5-nba-5-1995': [
    { name: 'Michael Jordan',    position: 'SG', isLegend: true,   stats: { points: 30.4, rebounds: 5.9, assists: 4.3, steals: 2.2, blocks: 0.5, fieldGoalPct: 0.496, threePointPct: 0.374, freeThrowPct: 0.833 } },
    { name: 'Scottie Pippen',    position: 'SF', isLegend: true,   stats: { points: 20.2, rebounds: 7.9, assists: 5.3, steals: 2.3, blocks: 0.8, fieldGoalPct: 0.475, threePointPct: 0.347, freeThrowPct: 0.717 } },
    { name: 'Dennis Rodman',     position: 'PF', isLegend: true,   stats: { points: 5.7,  rebounds: 16.1, assists: 2.5, steals: 0.7, blocks: 0.6, fieldGoalPct: 0.489, threePointPct: 0.231, freeThrowPct: 0.587 } },
    { name: 'Ron Harper',        position: 'PG',                   stats: { points: 7.4,  rebounds: 2.7, assists: 2.8, steals: 1.3, blocks: 0.4, fieldGoalPct: 0.458, threePointPct: 0.329, freeThrowPct: 0.734 } },
    { name: 'Toni Kukoc',        position: 'SF', isAllStar: true,  stats: { points: 13.1, rebounds: 4.7, assists: 3.6, steals: 1.0, blocks: 0.4, fieldGoalPct: 0.480, threePointPct: 0.400, freeThrowPct: 0.760 } },
    { name: 'Steve Kerr',        position: 'PG',                   stats: { points: 8.5,  rebounds: 1.5, assists: 2.6, steals: 0.7, blocks: 0.1, fieldGoalPct: 0.490, threePointPct: 0.524, freeThrowPct: 0.922 } },
    { name: 'Luc Longley',       position: 'C',                    stats: { points: 9.1,  rebounds: 5.7, assists: 2.5, steals: 0.6, blocks: 1.0, fieldGoalPct: 0.512, threePointPct: 0.000, freeThrowPct: 0.679 } },
    { name: 'Jud Buechler',      position: 'SF',                   stats: { points: 4.0,  rebounds: 2.2, assists: 0.7, steals: 0.5, blocks: 0.2, fieldGoalPct: 0.451, threePointPct: 0.410, freeThrowPct: 0.768 } },
    { name: 'Jason Caffey',      position: 'PF',                   stats: { points: 5.5,  rebounds: 3.4, assists: 0.5, steals: 0.4, blocks: 0.3, fieldGoalPct: 0.491, threePointPct: 0.000, freeThrowPct: 0.651 } },
    { name: 'Dickey Simpkins',   position: 'PF',                   stats: { points: 3.8,  rebounds: 3.1, assists: 0.5, steals: 0.3, blocks: 0.2, fieldGoalPct: 0.477, threePointPct: 0.000, freeThrowPct: 0.620 } },
    { name: 'Randy Brown',       position: 'PG',                   stats: { points: 4.0,  rebounds: 1.8, assists: 2.3, steals: 1.2, blocks: 0.2, fieldGoalPct: 0.440, threePointPct: 0.100, freeThrowPct: 0.704 } },
    { name: 'Scott Burrell',     position: 'SF',                   stats: { points: 5.4,  rebounds: 2.9, assists: 1.1, steals: 0.9, blocks: 0.4, fieldGoalPct: 0.432, threePointPct: 0.379, freeThrowPct: 0.720 } },
  ],
  // Bad Boy Pistons 1985-1989
  '9-nba-9-1985': [
    { name: 'Isiah Thomas',      position: 'PG', isLegend: true,   stats: { points: 20.0, rebounds: 3.6, assists: 10.0, steals: 2.0, blocks: 0.2, fieldGoalPct: 0.456, threePointPct: 0.261, freeThrowPct: 0.779 } },
    { name: 'Joe Dumars',        position: 'SG', isLegend: true,   stats: { points: 17.2, rebounds: 2.9, assists: 4.6,  steals: 1.1, blocks: 0.2, fieldGoalPct: 0.491, threePointPct: 0.333, freeThrowPct: 0.851 } },
    { name: 'Adrian Dantley',    position: 'SF', isLegend: true,   stats: { points: 21.5, rebounds: 4.4, assists: 2.7,  steals: 0.7, blocks: 0.2, fieldGoalPct: 0.533, threePointPct: 0.136, freeThrowPct: 0.851 } },
    { name: 'Vinnie Johnson',    position: 'SG',                   stats: { points: 15.5, rebounds: 2.8, assists: 3.3,  steals: 0.8, blocks: 0.1, fieldGoalPct: 0.476, threePointPct: 0.244, freeThrowPct: 0.774 } },
    { name: 'Dennis Rodman',     position: 'PF', isLegend: true,   stats: { points: 8.8,  rebounds: 13.0, assists: 2.0, steals: 0.9, blocks: 0.7, fieldGoalPct: 0.561, threePointPct: 0.000, freeThrowPct: 0.595 } },
    { name: 'Rick Mahorn',       position: 'PF',                   stats: { points: 10.7, rebounds: 8.4, assists: 1.4,  steals: 0.7, blocks: 1.2, fieldGoalPct: 0.472, threePointPct: 0.000, freeThrowPct: 0.682 } },
    { name: 'Bill Laimbeer',     position: 'C',  isAllStar: true,  stats: { points: 13.6, rebounds: 9.6, assists: 2.3,  steals: 0.5, blocks: 0.7, fieldGoalPct: 0.466, threePointPct: 0.310, freeThrowPct: 0.845 } },
    { name: 'John Salley',       position: 'C',                    stats: { points: 8.0,  rebounds: 5.2, assists: 1.4,  steals: 0.8, blocks: 1.5, fieldGoalPct: 0.512, threePointPct: 0.000, freeThrowPct: 0.691 } },
    { name: 'Sidney Green',      position: 'PF',                   stats: { points: 6.4,  rebounds: 6.0, assists: 0.8,  steals: 0.5, blocks: 0.4, fieldGoalPct: 0.459, threePointPct: 0.000, freeThrowPct: 0.628 } },
    { name: 'Chuck Nevitt',      position: 'C',                    stats: { points: 2.1,  rebounds: 2.3, assists: 0.2,  steals: 0.1, blocks: 0.9, fieldGoalPct: 0.450, threePointPct: 0.000, freeThrowPct: 0.550 } },
    { name: 'John Long',         position: 'SG',                   stats: { points: 8.2,  rebounds: 1.8, assists: 1.6,  steals: 0.7, blocks: 0.1, fieldGoalPct: 0.453, threePointPct: 0.250, freeThrowPct: 0.795 } },
  ],
  // Bad Boy Pistons 1990-1994
  '9-nba-9-1990': [
    { name: 'Isiah Thomas',      position: 'PG', isLegend: true,   stats: { points: 18.3, rebounds: 3.3, assists: 9.3,  steals: 1.9, blocks: 0.2, fieldGoalPct: 0.452, threePointPct: 0.275, freeThrowPct: 0.785 } },
    { name: 'Joe Dumars',        position: 'SG', isLegend: true,   stats: { points: 20.4, rebounds: 3.1, assists: 4.4,  steals: 1.0, blocks: 0.2, fieldGoalPct: 0.489, threePointPct: 0.355, freeThrowPct: 0.875 } },
    { name: 'Dennis Rodman',     position: 'PF', isLegend: true,   stats: { points: 8.8,  rebounds: 15.0, assists: 2.5, steals: 1.0, blocks: 0.7, fieldGoalPct: 0.579, threePointPct: 0.000, freeThrowPct: 0.615 } },
    { name: 'Mark Aguirre',      position: 'SF',                   stats: { points: 18.9, rebounds: 4.6, assists: 3.1,  steals: 0.7, blocks: 0.3, fieldGoalPct: 0.481, threePointPct: 0.321, freeThrowPct: 0.764 } },
    { name: 'Bill Laimbeer',     position: 'C',  isAllStar: true,  stats: { points: 11.6, rebounds: 9.1, assists: 2.0,  steals: 0.5, blocks: 0.7, fieldGoalPct: 0.456, threePointPct: 0.340, freeThrowPct: 0.839 } },
    { name: 'John Salley',       position: 'C',                    stats: { points: 8.0,  rebounds: 5.2, assists: 1.4,  steals: 0.8, blocks: 1.5, fieldGoalPct: 0.512, threePointPct: 0.000, freeThrowPct: 0.691 } },
    { name: 'James Edwards',     position: 'C',                    stats: { points: 11.3, rebounds: 4.2, assists: 1.0,  steals: 0.3, blocks: 0.8, fieldGoalPct: 0.493, threePointPct: 0.000, freeThrowPct: 0.748 } },
    { name: 'Vinnie Johnson',    position: 'SG',                   stats: { points: 13.5, rebounds: 2.5, assists: 2.8,  steals: 0.7, blocks: 0.1, fieldGoalPct: 0.469, threePointPct: 0.195, freeThrowPct: 0.760 } },
    { name: 'Orlando Woolridge', position: 'SF',                   stats: { points: 10.2, rebounds: 3.1, assists: 1.5,  steals: 0.6, blocks: 0.5, fieldGoalPct: 0.509, threePointPct: 0.000, freeThrowPct: 0.718 } },
    { name: 'Lance Blanks',      position: 'SG',                   stats: { points: 5.2,  rebounds: 1.6, assists: 2.4,  steals: 0.6, blocks: 0.1, fieldGoalPct: 0.418, threePointPct: 0.329, freeThrowPct: 0.752 } },
  ],
  // Sixers Moses 1980-1984
  '23-nba-23-1980': [
    { name: 'Julius Erving',     position: 'SF', isLegend: true,   stats: { points: 24.4, rebounds: 6.8, assists: 3.7, steals: 1.9, blocks: 1.4, fieldGoalPct: 0.518, threePointPct: 0.212, freeThrowPct: 0.777 } },
    { name: 'Moses Malone',      position: 'C',  isLegend: true,   stats: { points: 24.5, rebounds: 15.3, assists: 1.3, steals: 1.2, blocks: 1.3, fieldGoalPct: 0.501, threePointPct: 0.000, freeThrowPct: 0.796 } },
    { name: 'Maurice Cheeks',    position: 'PG', isLegend: true,   stats: { points: 15.6, rebounds: 3.9, assists: 7.0, steals: 2.3, blocks: 0.3, fieldGoalPct: 0.526, threePointPct: 0.244, freeThrowPct: 0.795 } },
    { name: 'Andrew Toney',      position: 'SG', isAllStar: true,  stats: { points: 17.7, rebounds: 2.8, assists: 3.9, steals: 1.1, blocks: 0.2, fieldGoalPct: 0.486, threePointPct: 0.296, freeThrowPct: 0.822 } },
    { name: 'Bobby Jones',       position: 'SF',                   stats: { points: 9.0,  rebounds: 5.5, assists: 2.1, steals: 1.7, blocks: 1.3, fieldGoalPct: 0.572, threePointPct: 0.000, freeThrowPct: 0.763 } },
    { name: 'Marc Iavaroni',     position: 'PF',                   stats: { points: 5.4,  rebounds: 5.0, assists: 1.5, steals: 0.7, blocks: 0.7, fieldGoalPct: 0.472, threePointPct: 0.000, freeThrowPct: 0.563 } },
    { name: 'Darryl Dawkins',    position: 'C',  isAllStar: true,  stats: { points: 12.8, rebounds: 6.3, assists: 1.2, steals: 0.6, blocks: 1.4, fieldGoalPct: 0.572, threePointPct: 0.000, freeThrowPct: 0.617 } },
    { name: 'Clint Richardson', position: 'SG',                    stats: { points: 9.2,  rebounds: 2.7, assists: 2.5, steals: 1.0, blocks: 0.2, fieldGoalPct: 0.468, threePointPct: 0.182, freeThrowPct: 0.720 } },
    { name: 'Franklin Edwards',  position: 'PG',                   stats: { points: 7.4,  rebounds: 1.7, assists: 3.2, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.449, threePointPct: 0.200, freeThrowPct: 0.731 } },
    { name: 'Reggie Johnson',    position: 'PF',                   stats: { points: 5.0,  rebounds: 4.5, assists: 0.7, steals: 0.4, blocks: 0.5, fieldGoalPct: 0.501, threePointPct: 0.000, freeThrowPct: 0.648 } },
    { name: 'Earl Cureton',      position: 'PF',                   stats: { points: 4.8,  rebounds: 5.4, assists: 0.8, steals: 0.5, blocks: 0.6, fieldGoalPct: 0.481, threePointPct: 0.000, freeThrowPct: 0.590 } },
  ],
  // Rockets Hakeem I 1990-1994
  '11-nba-11-1990': [
    { name: 'Hakeem Olajuwon',   position: 'C',  isLegend: true,   stats: { points: 27.8, rebounds: 11.8, assists: 3.0, steals: 2.7, blocks: 4.2, fieldGoalPct: 0.519, threePointPct: 0.111, freeThrowPct: 0.714 } },
    { name: 'Otis Thorpe',       position: 'PF', isAllStar: true,  stats: { points: 18.1, rebounds: 10.8, assists: 2.0, steals: 0.9, blocks: 0.6, fieldGoalPct: 0.564, threePointPct: 0.000, freeThrowPct: 0.667 } },
    { name: 'Kenny Smith',       position: 'PG',                   stats: { points: 17.1, rebounds: 2.8, assists: 7.4, steals: 1.3, blocks: 0.1, fieldGoalPct: 0.460, threePointPct: 0.394, freeThrowPct: 0.843 } },
    { name: 'Vernon Maxwell',    position: 'SG',                   stats: { points: 17.0, rebounds: 3.4, assists: 3.9, steals: 1.5, blocks: 0.3, fieldGoalPct: 0.427, threePointPct: 0.347, freeThrowPct: 0.794 } },
    { name: 'Robert Horry',      position: 'PF',                   stats: { points: 10.1, rebounds: 5.5, assists: 2.4, steals: 1.3, blocks: 1.3, fieldGoalPct: 0.457, threePointPct: 0.329, freeThrowPct: 0.764 } },
    { name: 'Scott Brooks',      position: 'PG',                   stats: { points: 7.1,  rebounds: 1.6, assists: 4.0, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.443, threePointPct: 0.333, freeThrowPct: 0.821 } },
    { name: 'Buck Johnson',      position: 'SF',                   stats: { points: 9.2,  rebounds: 3.8, assists: 1.5, steals: 0.7, blocks: 0.4, fieldGoalPct: 0.487, threePointPct: 0.200, freeThrowPct: 0.752 } },
    { name: 'Carl Herrera',      position: 'PF',                   stats: { points: 5.5,  rebounds: 4.2, assists: 0.7, steals: 0.5, blocks: 0.7, fieldGoalPct: 0.501, threePointPct: 0.000, freeThrowPct: 0.618 } },
    { name: 'Matt Bullard',      position: 'PF',                   stats: { points: 7.4,  rebounds: 3.0, assists: 0.6, steals: 0.3, blocks: 0.3, fieldGoalPct: 0.447, threePointPct: 0.386, freeThrowPct: 0.821 } },
    { name: 'Eric Riley',        position: 'C',                    stats: { points: 3.8,  rebounds: 3.9, assists: 0.4, steals: 0.2, blocks: 0.9, fieldGoalPct: 0.489, threePointPct: 0.000, freeThrowPct: 0.552 } },
  ],
  // Rockets Hakeem II 1995-1999
  '11-nba-11-1995': [
    { name: 'Hakeem Olajuwon',   position: 'C',  isLegend: true,   stats: { points: 26.9, rebounds: 10.3, assists: 3.6, steals: 2.0, blocks: 3.4, fieldGoalPct: 0.513, threePointPct: 0.125, freeThrowPct: 0.726 } },
    { name: 'Clyde Drexler',     position: 'SG', isLegend: true,   stats: { points: 21.3, rebounds: 6.3, assists: 5.9, steals: 2.4, blocks: 0.8, fieldGoalPct: 0.465, threePointPct: 0.338, freeThrowPct: 0.783 } },
    { name: 'Charles Barkley',   position: 'PF', isLegend: true,   stats: { points: 21.6, rebounds: 11.7, assists: 4.0, steals: 1.3, blocks: 0.8, fieldGoalPct: 0.514, threePointPct: 0.227, freeThrowPct: 0.741 } },
    { name: 'Sam Cassell',       position: 'PG', isAllStar: true,  stats: { points: 19.3, rebounds: 3.8, assists: 7.2, steals: 1.3, blocks: 0.2, fieldGoalPct: 0.476, threePointPct: 0.331, freeThrowPct: 0.866 } },
    { name: 'Mario Elie',        position: 'SG',                   stats: { points: 11.9, rebounds: 3.0, assists: 3.1, steals: 1.2, blocks: 0.2, fieldGoalPct: 0.479, threePointPct: 0.416, freeThrowPct: 0.830 } },
    { name: 'Kevin Willis',      position: 'PF',                   stats: { points: 13.7, rebounds: 9.3, assists: 1.2, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.492, threePointPct: 0.000, freeThrowPct: 0.718 } },
    { name: 'Sedale Threatt',    position: 'PG',                   stats: { points: 7.8,  rebounds: 2.1, assists: 4.3, steals: 1.1, blocks: 0.1, fieldGoalPct: 0.453, threePointPct: 0.313, freeThrowPct: 0.800 } },
    { name: 'Othella Harrington', position: 'C',                   stats: { points: 5.3,  rebounds: 4.8, assists: 0.6, steals: 0.4, blocks: 0.9, fieldGoalPct: 0.517, threePointPct: 0.000, freeThrowPct: 0.601 } },
    { name: 'Brent Price',       position: 'PG',                   stats: { points: 9.4,  rebounds: 2.3, assists: 5.6, steals: 0.9, blocks: 0.1, fieldGoalPct: 0.441, threePointPct: 0.358, freeThrowPct: 0.827 } },
  ],
  // Jazz Stockton-Malone 1995-1999
  '29-nba-29-1995': [
    { name: 'Karl Malone',       position: 'PF', isLegend: true,   stats: { points: 27.0, rebounds: 9.9, assists: 4.5, steals: 1.4, blocks: 0.7, fieldGoalPct: 0.522, threePointPct: 0.221, freeThrowPct: 0.740 } },
    { name: 'John Stockton',     position: 'PG', isLegend: true,   stats: { points: 14.1, rebounds: 2.7, assists: 11.4, steals: 2.2, blocks: 0.2, fieldGoalPct: 0.515, threePointPct: 0.350, freeThrowPct: 0.823 } },
    { name: 'Jeff Hornacek',     position: 'SG', isAllStar: true,  stats: { points: 14.5, rebounds: 3.3, assists: 4.0, steals: 1.4, blocks: 0.2, fieldGoalPct: 0.509, threePointPct: 0.434, freeThrowPct: 0.879 } },
    { name: 'Bryon Russell',     position: 'SF',                   stats: { points: 9.3,  rebounds: 3.8, assists: 1.7, steals: 1.3, blocks: 0.3, fieldGoalPct: 0.454, threePointPct: 0.381, freeThrowPct: 0.745 } },
    { name: 'Antoine Carr',      position: 'C',                    stats: { points: 11.2, rebounds: 4.7, assists: 1.2, steals: 0.6, blocks: 0.8, fieldGoalPct: 0.538, threePointPct: 0.000, freeThrowPct: 0.763 } },
    { name: 'Greg Ostertag',     position: 'C',                    stats: { points: 4.1,  rebounds: 6.4, assists: 0.5, steals: 0.4, blocks: 2.3, fieldGoalPct: 0.530, threePointPct: 0.000, freeThrowPct: 0.536 } },
    { name: 'Howard Eisley',     position: 'PG',                   stats: { points: 7.8,  rebounds: 2.1, assists: 4.7, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.432, threePointPct: 0.358, freeThrowPct: 0.807 } },
    { name: 'Adam Keefe',        position: 'PF',                   stats: { points: 5.8,  rebounds: 5.7, assists: 0.8, steals: 0.6, blocks: 0.5, fieldGoalPct: 0.502, threePointPct: 0.000, freeThrowPct: 0.680 } },
    { name: 'Chris Morris',      position: 'SF',                   stats: { points: 6.4,  rebounds: 3.5, assists: 0.9, steals: 0.7, blocks: 0.5, fieldGoalPct: 0.434, threePointPct: 0.333, freeThrowPct: 0.710 } },
    { name: 'John Crotty',       position: 'PG',                   stats: { points: 4.3,  rebounds: 1.3, assists: 2.8, steals: 0.6, blocks: 0.0, fieldGoalPct: 0.449, threePointPct: 0.380, freeThrowPct: 0.825 } },
  ],
  // Spurs Dynasty I 2000-2004
  '27-nba-27-2000': [
    { name: 'Tim Duncan',        position: 'PF', isLegend: true,   stats: { points: 25.5, rebounds: 12.7, assists: 3.9, steals: 0.9, blocks: 2.9, fieldGoalPct: 0.513, threePointPct: 0.000, freeThrowPct: 0.702 } },
    { name: 'David Robinson',    position: 'C',  isLegend: true,   stats: { points: 14.2, rebounds: 8.9, assists: 2.0, steals: 1.1, blocks: 2.4, fieldGoalPct: 0.487, threePointPct: 0.000, freeThrowPct: 0.714 } },
    { name: 'Tony Parker',       position: 'PG', isLegend: true,   stats: { points: 15.5, rebounds: 2.9, assists: 5.5, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.480, threePointPct: 0.280, freeThrowPct: 0.748 } },
    { name: 'Manu Ginobili',     position: 'SG', isLegend: true,   stats: { points: 14.4, rebounds: 3.4, assists: 3.7, steals: 1.5, blocks: 0.4, fieldGoalPct: 0.453, threePointPct: 0.371, freeThrowPct: 0.823 } },
    { name: 'Steve Smith',       position: 'SG',                   stats: { points: 8.3,  rebounds: 2.4, assists: 2.3, steals: 0.9, blocks: 0.2, fieldGoalPct: 0.433, threePointPct: 0.392, freeThrowPct: 0.808 } },
    { name: 'Bruce Bowen',       position: 'SF',                   stats: { points: 7.8,  rebounds: 3.0, assists: 1.1, steals: 1.5, blocks: 0.3, fieldGoalPct: 0.431, threePointPct: 0.401, freeThrowPct: 0.784 } },
    { name: 'Stephen Jackson',   position: 'SF',                   stats: { points: 9.5,  rebounds: 3.5, assists: 2.2, steals: 1.0, blocks: 0.3, fieldGoalPct: 0.441, threePointPct: 0.338, freeThrowPct: 0.762 } },
    { name: 'Charlie Ward',      position: 'PG',                   stats: { points: 5.9,  rebounds: 2.2, assists: 4.1, steals: 1.0, blocks: 0.2, fieldGoalPct: 0.418, threePointPct: 0.349, freeThrowPct: 0.779 } },
    { name: 'Kevin Willis',      position: 'PF',                   stats: { points: 8.7,  rebounds: 6.1, assists: 0.9, steals: 0.5, blocks: 0.5, fieldGoalPct: 0.478, threePointPct: 0.000, freeThrowPct: 0.690 } },
    { name: 'Jaren Jackson',     position: 'SG',                   stats: { points: 5.4,  rebounds: 1.7, assists: 1.1, steals: 0.6, blocks: 0.1, fieldGoalPct: 0.408, threePointPct: 0.349, freeThrowPct: 0.800 } },
  ],
  // Spurs Dynasty II 2005-2009
  '27-nba-27-2005': [
    { name: 'Tim Duncan',        position: 'PF', isLegend: true,   stats: { points: 20.0, rebounds: 11.4, assists: 3.2, steals: 0.7, blocks: 2.3, fieldGoalPct: 0.500, threePointPct: 0.000, freeThrowPct: 0.693 } },
    { name: 'Tony Parker',       position: 'PG', isLegend: true,   stats: { points: 19.6, rebounds: 3.5, assists: 5.5, steals: 0.9, blocks: 0.1, fieldGoalPct: 0.503, threePointPct: 0.256, freeThrowPct: 0.755 } },
    { name: 'Manu Ginobili',     position: 'SG', isLegend: true,   stats: { points: 19.5, rebounds: 4.4, assists: 4.5, steals: 2.2, blocks: 0.5, fieldGoalPct: 0.489, threePointPct: 0.382, freeThrowPct: 0.847 } },
    { name: 'Bruce Bowen',       position: 'SF',                   stats: { points: 8.0,  rebounds: 3.1, assists: 1.2, steals: 1.5, blocks: 0.4, fieldGoalPct: 0.433, threePointPct: 0.407, freeThrowPct: 0.791 } },
    { name: 'Michael Finley',    position: 'SG',                   stats: { points: 11.7, rebounds: 3.0, assists: 2.5, steals: 0.9, blocks: 0.2, fieldGoalPct: 0.451, threePointPct: 0.360, freeThrowPct: 0.820 } },
    { name: 'Robert Horry',      position: 'PF',                   stats: { points: 5.2,  rebounds: 4.5, assists: 1.3, steals: 0.7, blocks: 0.9, fieldGoalPct: 0.423, threePointPct: 0.330, freeThrowPct: 0.682 } },
    { name: 'Brent Barry',       position: 'SG',                   stats: { points: 7.1,  rebounds: 2.3, assists: 2.3, steals: 0.6, blocks: 0.2, fieldGoalPct: 0.459, threePointPct: 0.410, freeThrowPct: 0.866 } },
    { name: 'Francisco Elson',   position: 'C',                    stats: { points: 4.4,  rebounds: 4.2, assists: 0.6, steals: 0.4, blocks: 1.0, fieldGoalPct: 0.502, threePointPct: 0.000, freeThrowPct: 0.620 } },
    { name: 'Fabricio Oberto',   position: 'C',                    stats: { points: 4.0,  rebounds: 4.6, assists: 1.1, steals: 0.4, blocks: 0.6, fieldGoalPct: 0.517, threePointPct: 0.000, freeThrowPct: 0.643 } },
    { name: 'Matt Bonner',       position: 'PF',                   stats: { points: 6.3,  rebounds: 3.6, assists: 0.5, steals: 0.3, blocks: 0.4, fieldGoalPct: 0.453, threePointPct: 0.432, freeThrowPct: 0.855 } },
  ],
  // Heat Wade-Shaq 2005-2009
  '16-nba-16-2005': [
    { name: 'Dwyane Wade',       position: 'SG', isLegend: true,   stats: { points: 27.4, rebounds: 5.7, assists: 6.6, steals: 1.9, blocks: 0.9, fieldGoalPct: 0.497, threePointPct: 0.265, freeThrowPct: 0.752 } },
    { name: "Shaquille O'Neal",  position: 'C',  isLegend: true,   stats: { points: 20.0, rebounds: 9.2, assists: 2.7, steals: 0.5, blocks: 1.8, fieldGoalPct: 0.601, threePointPct: 0.000, freeThrowPct: 0.468 } },
    { name: 'Gary Payton',       position: 'PG', isLegend: true,   stats: { points: 13.2, rebounds: 3.9, assists: 5.7, steals: 1.4, blocks: 0.2, fieldGoalPct: 0.477, threePointPct: 0.261, freeThrowPct: 0.765 } },
    { name: 'Jason Williams',    position: 'PG',                   stats: { points: 7.6,  rebounds: 2.3, assists: 5.0, steals: 0.9, blocks: 0.1, fieldGoalPct: 0.421, threePointPct: 0.345, freeThrowPct: 0.769 } },
    { name: 'Udonis Haslem',     position: 'PF',                   stats: { points: 10.8, rebounds: 9.3, assists: 1.0, steals: 0.6, blocks: 0.5, fieldGoalPct: 0.507, threePointPct: 0.000, freeThrowPct: 0.705 } },
    { name: 'Antoine Walker',    position: 'PF',                   stats: { points: 12.3, rebounds: 5.1, assists: 3.1, steals: 0.9, blocks: 0.3, fieldGoalPct: 0.425, threePointPct: 0.328, freeThrowPct: 0.714 } },
    { name: 'James Posey',       position: 'SF',                   stats: { points: 7.2,  rebounds: 4.2, assists: 1.2, steals: 1.1, blocks: 0.4, fieldGoalPct: 0.447, threePointPct: 0.388, freeThrowPct: 0.759 } },
    { name: 'Alonzo Mourning',   position: 'C',  isLegend: true,   stats: { points: 6.2,  rebounds: 5.0, assists: 0.5, steals: 0.4, blocks: 2.3, fieldGoalPct: 0.540, threePointPct: 0.000, freeThrowPct: 0.667 } },
    { name: 'Derek Anderson',    position: 'SG',                   stats: { points: 7.8,  rebounds: 2.4, assists: 2.2, steals: 0.9, blocks: 0.2, fieldGoalPct: 0.434, threePointPct: 0.364, freeThrowPct: 0.816 } },
    { name: 'Damon Jones',       position: 'SG',                   stats: { points: 7.5,  rebounds: 1.7, assists: 2.8, steals: 0.5, blocks: 0.1, fieldGoalPct: 0.413, threePointPct: 0.374, freeThrowPct: 0.841 } },
  ],
  // Heat Big Three 2010-2014
  '16-nba-16-2010': [
    { name: 'LeBron James',      position: 'SF', isLegend: true,   stats: { points: 27.1, rebounds: 7.9, assists: 6.7, steals: 1.8, blocks: 0.9, fieldGoalPct: 0.531, threePointPct: 0.362, freeThrowPct: 0.759 } },
    { name: 'Dwyane Wade',       position: 'SG', isLegend: true,   stats: { points: 24.1, rebounds: 5.0, assists: 4.9, steals: 1.5, blocks: 0.7, fieldGoalPct: 0.497, threePointPct: 0.256, freeThrowPct: 0.739 } },
    { name: 'Chris Bosh',        position: 'C',  isLegend: true,   stats: { points: 18.0, rebounds: 7.6, assists: 1.9, steals: 0.8, blocks: 1.0, fieldGoalPct: 0.497, threePointPct: 0.296, freeThrowPct: 0.796 } },
    { name: 'Mario Chalmers',    position: 'PG',                   stats: { points: 10.2, rebounds: 2.7, assists: 3.6, steals: 1.3, blocks: 0.1, fieldGoalPct: 0.410, threePointPct: 0.347, freeThrowPct: 0.781 } },
    { name: 'Ray Allen',         position: 'SG', isLegend: true,   stats: { points: 9.8,  rebounds: 2.5, assists: 1.8, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.468, threePointPct: 0.453, freeThrowPct: 0.921 } },
    { name: 'Shane Battier',     position: 'SF',                   stats: { points: 7.6,  rebounds: 3.5, assists: 1.4, steals: 1.0, blocks: 0.4, fieldGoalPct: 0.429, threePointPct: 0.388, freeThrowPct: 0.831 } },
    { name: 'Udonis Haslem',     position: 'PF',                   stats: { points: 5.0,  rebounds: 6.0, assists: 0.8, steals: 0.5, blocks: 0.4, fieldGoalPct: 0.502, threePointPct: 0.000, freeThrowPct: 0.700 } },
    { name: 'Mike Miller',       position: 'SF',                   stats: { points: 8.7,  rebounds: 3.7, assists: 1.3, steals: 0.7, blocks: 0.2, fieldGoalPct: 0.479, threePointPct: 0.455, freeThrowPct: 0.875 } },
    { name: 'Norris Cole',       position: 'PG',                   stats: { points: 5.0,  rebounds: 2.2, assists: 2.1, steals: 1.0, blocks: 0.3, fieldGoalPct: 0.443, threePointPct: 0.316, freeThrowPct: 0.710 } },
    { name: 'Joel Anthony',      position: 'C',                    stats: { points: 3.1,  rebounds: 4.3, assists: 0.3, steals: 0.4, blocks: 1.4, fieldGoalPct: 0.528, threePointPct: 0.000, freeThrowPct: 0.524 } },
    { name: 'Chris Andersen',    position: 'PF',                   stats: { points: 5.7,  rebounds: 5.4, assists: 0.5, steals: 0.5, blocks: 1.6, fieldGoalPct: 0.604, threePointPct: 0.000, freeThrowPct: 0.586 } },
  ],
  // Suns Steve Nash 2005-2009
  '24-nba-24-2005': [
    { name: 'Steve Nash',        position: 'PG', isLegend: true,   stats: { points: 18.8, rebounds: 3.2, assists: 11.6, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.512, threePointPct: 0.432, freeThrowPct: 0.901 } },
    { name: 'Amare Stoudemire',  position: 'C',  isLegend: true,   stats: { points: 26.0, rebounds: 9.6, assists: 1.9,  steals: 0.9, blocks: 1.6, fieldGoalPct: 0.559, threePointPct: 0.000, freeThrowPct: 0.820 } },
    { name: 'Shawn Marion',      position: 'SF', isAllStar: true,  stats: { points: 21.8, rebounds: 11.6, assists: 1.9, steals: 2.4, blocks: 1.6, fieldGoalPct: 0.503, threePointPct: 0.356, freeThrowPct: 0.761 } },
    { name: 'Raja Bell',         position: 'SG',                   stats: { points: 11.1, rebounds: 3.0, assists: 1.7,  steals: 1.4, blocks: 0.2, fieldGoalPct: 0.434, threePointPct: 0.390, freeThrowPct: 0.793 } },
    { name: 'Leandro Barbosa',   position: 'PG',                   stats: { points: 14.6, rebounds: 2.0, assists: 3.7,  steals: 0.9, blocks: 0.2, fieldGoalPct: 0.477, threePointPct: 0.344, freeThrowPct: 0.821 } },
    { name: 'Boris Diaw',        position: 'SF',                   stats: { points: 13.3, rebounds: 6.9, assists: 6.2,  steals: 1.0, blocks: 0.5, fieldGoalPct: 0.493, threePointPct: 0.343, freeThrowPct: 0.749 } },
    { name: 'Kurt Thomas',       position: 'C',                    stats: { points: 6.7,  rebounds: 6.3, assists: 0.9,  steals: 0.5, blocks: 1.0, fieldGoalPct: 0.482, threePointPct: 0.000, freeThrowPct: 0.724 } },
    { name: 'Tim Thomas',        position: 'PF',                   stats: { points: 9.3,  rebounds: 4.3, assists: 1.0,  steals: 0.5, blocks: 0.6, fieldGoalPct: 0.455, threePointPct: 0.378, freeThrowPct: 0.788 } },
    { name: 'James Jones',       position: 'SG',                   stats: { points: 5.8,  rebounds: 2.0, assists: 0.8,  steals: 0.4, blocks: 0.2, fieldGoalPct: 0.418, threePointPct: 0.416, freeThrowPct: 0.855 } },
    { name: 'Pat Burke',         position: 'C',                    stats: { points: 3.9,  rebounds: 2.9, assists: 0.4,  steals: 0.3, blocks: 0.4, fieldGoalPct: 0.466, threePointPct: 0.000, freeThrowPct: 0.698 } },
  ],
  // Warriors Dynasty 2015-2019
  '10-nba-10-2015': [
    { name: 'Stephen Curry',     position: 'PG', isLegend: true,   stats: { points: 30.1, rebounds: 5.1, assists: 6.7, steals: 2.1, blocks: 0.2, fieldGoalPct: 0.504, threePointPct: 0.441, freeThrowPct: 0.908 } },
    { name: 'Klay Thompson',     position: 'SG', isLegend: true,   stats: { points: 22.3, rebounds: 3.8, assists: 2.5, steals: 1.1, blocks: 0.6, fieldGoalPct: 0.470, threePointPct: 0.421, freeThrowPct: 0.841 } },
    { name: 'Draymond Green',    position: 'PF', isLegend: true,   stats: { points: 11.7, rebounds: 8.3, assists: 7.4, steals: 1.7, blocks: 1.3, fieldGoalPct: 0.453, threePointPct: 0.310, freeThrowPct: 0.696 } },
    { name: 'Kevin Durant',      position: 'SF', isLegend: true,   stats: { points: 25.1, rebounds: 8.3, assists: 4.8, steals: 1.1, blocks: 1.8, fieldGoalPct: 0.537, threePointPct: 0.415, freeThrowPct: 0.888 } },
    { name: 'Andre Iguodala',    position: 'SF', isAllStar: true,  stats: { points: 7.6,  rebounds: 4.6, assists: 3.6, steals: 1.3, blocks: 0.5, fieldGoalPct: 0.476, threePointPct: 0.349, freeThrowPct: 0.729 } },
    { name: 'Shaun Livingston',  position: 'PG',                   stats: { points: 8.3,  rebounds: 2.3, assists: 2.5, steals: 0.6, blocks: 0.4, fieldGoalPct: 0.500, threePointPct: 0.111, freeThrowPct: 0.707 } },
    { name: 'David West',        position: 'PF',                   stats: { points: 6.0,  rebounds: 3.9, assists: 1.7, steals: 0.5, blocks: 0.5, fieldGoalPct: 0.493, threePointPct: 0.250, freeThrowPct: 0.730 } },
    { name: 'Zaza Pachulia',     position: 'C',                    stats: { points: 6.1,  rebounds: 5.8, assists: 1.6, steals: 0.6, blocks: 0.5, fieldGoalPct: 0.531, threePointPct: 0.000, freeThrowPct: 0.694 } },
    { name: 'JaVale McGee',      position: 'C',                    stats: { points: 7.0,  rebounds: 4.4, assists: 0.5, steals: 0.4, blocks: 1.5, fieldGoalPct: 0.640, threePointPct: 0.000, freeThrowPct: 0.518 } },
    { name: 'Nick Young',        position: 'SG',                   stats: { points: 7.3,  rebounds: 1.8, assists: 0.6, steals: 0.4, blocks: 0.2, fieldGoalPct: 0.408, threePointPct: 0.375, freeThrowPct: 0.821 } },
    { name: 'Patrick McCaw',     position: 'SG',                   stats: { points: 5.4,  rebounds: 1.7, assists: 1.5, steals: 0.9, blocks: 0.2, fieldGoalPct: 0.445, threePointPct: 0.358, freeThrowPct: 0.742 } },
    { name: 'Ian Clark',         position: 'SG',                   stats: { points: 7.1,  rebounds: 1.3, assists: 1.2, steals: 0.5, blocks: 0.2, fieldGoalPct: 0.461, threePointPct: 0.388, freeThrowPct: 0.857 } },
  ],
  // Warriors Post-Durant 2020-2024
  '10-nba-10-2020': [
    { name: 'Stephen Curry',     position: 'PG', isLegend: true,   stats: { points: 32.0, rebounds: 5.5, assists: 5.8, steals: 1.3, blocks: 0.4, fieldGoalPct: 0.476, threePointPct: 0.421, freeThrowPct: 0.916 } },
    { name: 'Klay Thompson',     position: 'SG', isLegend: true,   stats: { points: 18.4, rebounds: 3.7, assists: 2.1, steals: 0.7, blocks: 0.4, fieldGoalPct: 0.446, threePointPct: 0.388, freeThrowPct: 0.844 } },
    { name: 'Draymond Green',    position: 'PF', isLegend: true,   stats: { points: 8.0,  rebounds: 7.2, assists: 7.0, steals: 1.3, blocks: 0.8, fieldGoalPct: 0.455, threePointPct: 0.284, freeThrowPct: 0.625 } },
    { name: 'Andrew Wiggins',    position: 'SF', isAllStar: true,  stats: { points: 17.2, rebounds: 4.5, assists: 2.1, steals: 1.0, blocks: 0.6, fieldGoalPct: 0.479, threePointPct: 0.386, freeThrowPct: 0.706 } },
    { name: 'Jordan Poole',      position: 'SG',                   stats: { points: 18.5, rebounds: 3.4, assists: 4.0, steals: 0.9, blocks: 0.3, fieldGoalPct: 0.447, threePointPct: 0.370, freeThrowPct: 0.888 } },
    { name: 'Kevon Looney',      position: 'C',                    stats: { points: 5.6,  rebounds: 7.1, assists: 2.2, steals: 0.5, blocks: 0.5, fieldGoalPct: 0.614, threePointPct: 0.000, freeThrowPct: 0.596 } },
    { name: 'Otto Porter Jr.',   position: 'SF',                   stats: { points: 8.1,  rebounds: 4.4, assists: 1.1, steals: 0.6, blocks: 0.4, fieldGoalPct: 0.504, threePointPct: 0.432, freeThrowPct: 0.776 } },
    { name: 'Gary Payton II',    position: 'SG',                   stats: { points: 7.1,  rebounds: 3.5, assists: 1.5, steals: 1.4, blocks: 0.7, fieldGoalPct: 0.598, threePointPct: 0.404, freeThrowPct: 0.672 } },
    { name: 'Juan Toscano-Anderson', position: 'SF',               stats: { points: 5.9,  rebounds: 3.6, assists: 2.2, steals: 0.9, blocks: 0.4, fieldGoalPct: 0.526, threePointPct: 0.367, freeThrowPct: 0.741 } },
    { name: 'Moses Moody',       position: 'SG',                   stats: { points: 7.0,  rebounds: 2.2, assists: 1.0, steals: 0.6, blocks: 0.3, fieldGoalPct: 0.441, threePointPct: 0.381, freeThrowPct: 0.759 } },
    { name: 'Nemanja Bjelica',   position: 'PF',                   stats: { points: 8.7,  rebounds: 4.5, assists: 2.5, steals: 0.5, blocks: 0.3, fieldGoalPct: 0.481, threePointPct: 0.425, freeThrowPct: 0.857 } },
  ],
  // Cavaliers LeBron 2015-2019
  '6-nba-6-2015': [
    { name: 'LeBron James',      position: 'SF', isLegend: true,   stats: { points: 26.1, rebounds: 8.6,  assists: 8.7, steals: 1.2, blocks: 0.6, fieldGoalPct: 0.548, threePointPct: 0.341, freeThrowPct: 0.744 } },
    { name: 'Kyrie Irving',      position: 'PG', isLegend: true,   stats: { points: 24.4, rebounds: 3.2,  assists: 5.8, steals: 1.2, blocks: 0.4, fieldGoalPct: 0.482, threePointPct: 0.405, freeThrowPct: 0.899 } },
    { name: 'Kevin Love',        position: 'PF', isLegend: true,   stats: { points: 19.0, rebounds: 11.1, assists: 2.0, steals: 0.7, blocks: 0.5, fieldGoalPct: 0.449, threePointPct: 0.367, freeThrowPct: 0.836 } },
    { name: 'J.R. Smith',        position: 'SG',                   stats: { points: 12.4, rebounds: 3.3,  assists: 2.1, steals: 0.8, blocks: 0.3, fieldGoalPct: 0.416, threePointPct: 0.374, freeThrowPct: 0.785 } },
    { name: 'Tristan Thompson',  position: 'C',                    stats: { points: 8.3,  rebounds: 10.4, assists: 1.1, steals: 0.5, blocks: 0.6, fieldGoalPct: 0.556, threePointPct: 0.000, freeThrowPct: 0.638 } },
    { name: 'Iman Shumpert',     position: 'SG',                   stats: { points: 7.6,  rebounds: 3.9,  assists: 1.4, steals: 1.2, blocks: 0.3, fieldGoalPct: 0.400, threePointPct: 0.342, freeThrowPct: 0.694 } },
    { name: 'Matthew Dellavedova', position: 'PG',                 stats: { points: 5.9,  rebounds: 2.8,  assists: 3.9, steals: 1.1, blocks: 0.1, fieldGoalPct: 0.412, threePointPct: 0.358, freeThrowPct: 0.818 } },
    { name: 'Channing Frye',     position: 'PF',                   stats: { points: 9.8,  rebounds: 4.2,  assists: 1.1, steals: 0.3, blocks: 0.5, fieldGoalPct: 0.455, threePointPct: 0.411, freeThrowPct: 0.857 } },
    { name: 'Richard Jefferson', position: 'SF',                   stats: { points: 8.6,  rebounds: 3.3,  assists: 1.8, steals: 0.6, blocks: 0.4, fieldGoalPct: 0.463, threePointPct: 0.371, freeThrowPct: 0.783 } },
    { name: 'Larry Nance Jr.',   position: 'PF',                   stats: { points: 7.4,  rebounds: 5.5,  assists: 1.0, steals: 0.8, blocks: 1.3, fieldGoalPct: 0.567, threePointPct: 0.321, freeThrowPct: 0.735 } },
  ],
  // Celtics Big Three 2.0 2005-2009
  '2-nba-2-2005': [
    { name: 'Paul Pierce',       position: 'SF', isLegend: true,   stats: { points: 19.6, rebounds: 5.7, assists: 4.5, steals: 1.0, blocks: 0.5, fieldGoalPct: 0.461, threePointPct: 0.387, freeThrowPct: 0.828 } },
    { name: 'Kevin Garnett',     position: 'PF', isLegend: true,   stats: { points: 18.8, rebounds: 9.2, assists: 3.4, steals: 1.3, blocks: 1.4, fieldGoalPct: 0.494, threePointPct: 0.250, freeThrowPct: 0.810 } },
    { name: 'Ray Allen',         position: 'SG', isLegend: true,   stats: { points: 17.4, rebounds: 3.9, assists: 2.8, steals: 1.1, blocks: 0.2, fieldGoalPct: 0.464, threePointPct: 0.393, freeThrowPct: 0.907 } },
    { name: 'Rajon Rondo',       position: 'PG', isAllStar: true,  stats: { points: 10.6, rebounds: 5.0, assists: 8.7, steals: 2.5, blocks: 0.3, fieldGoalPct: 0.480, threePointPct: 0.258, freeThrowPct: 0.598 } },
    { name: 'Kendrick Perkins',  position: 'C',                    stats: { points: 6.9,  rebounds: 7.6, assists: 1.0, steals: 0.5, blocks: 1.0, fieldGoalPct: 0.514, threePointPct: 0.000, freeThrowPct: 0.553 } },
    { name: 'Glen Davis',        position: 'PF',                   stats: { points: 8.4,  rebounds: 5.1, assists: 0.9, steals: 0.5, blocks: 0.6, fieldGoalPct: 0.487, threePointPct: 0.000, freeThrowPct: 0.688 } },
    { name: 'Eddie House',       position: 'SG',                   stats: { points: 7.4,  rebounds: 1.4, assists: 1.3, steals: 0.5, blocks: 0.1, fieldGoalPct: 0.435, threePointPct: 0.401, freeThrowPct: 0.897 } },
    { name: 'Tony Allen',        position: 'SG',                   stats: { points: 8.5,  rebounds: 3.2, assists: 1.3, steals: 1.6, blocks: 0.5, fieldGoalPct: 0.490, threePointPct: 0.267, freeThrowPct: 0.617 } },
    { name: 'James Posey',       position: 'SF',                   stats: { points: 7.8,  rebounds: 4.2, assists: 1.8, steals: 1.2, blocks: 0.4, fieldGoalPct: 0.435, threePointPct: 0.396, freeThrowPct: 0.812 } },
    { name: 'P.J. Brown',        position: 'PF',                   stats: { points: 5.6,  rebounds: 5.5, assists: 0.8, steals: 0.6, blocks: 0.9, fieldGoalPct: 0.468, threePointPct: 0.000, freeThrowPct: 0.754 } },
  ],
  // Lakers Shaq-Kobe 2000-2004
  '14-nba-14-2000': [
    { name: 'Shaquille O\'Neal', position: 'C',  isLegend: true,   stats: { points: 29.7, rebounds: 13.6, assists: 3.4, steals: 0.5, blocks: 2.9, fieldGoalPct: 0.584, threePointPct: 0.000, freeThrowPct: 0.528 } },
    { name: 'Kobe Bryant',       position: 'SG', isLegend: true,   stats: { points: 27.6, rebounds: 5.5,  assists: 5.0, steals: 1.7, blocks: 0.5, fieldGoalPct: 0.465, threePointPct: 0.337, freeThrowPct: 0.835 } },
    { name: 'Derek Fisher',      position: 'PG',                   stats: { points: 7.2,  rebounds: 1.7,  assists: 3.0, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.410, threePointPct: 0.318, freeThrowPct: 0.840 } },
    { name: 'Robert Horry',      position: 'PF',                   stats: { points: 7.0,  rebounds: 5.2,  assists: 1.7, steals: 0.7, blocks: 1.1, fieldGoalPct: 0.423, threePointPct: 0.350, freeThrowPct: 0.679 } },
    { name: 'Rick Fox',          position: 'SF',                   stats: { points: 11.3, rebounds: 3.8,  assists: 2.8, steals: 1.1, blocks: 0.4, fieldGoalPct: 0.438, threePointPct: 0.360, freeThrowPct: 0.731 } },
    { name: 'Ron Harper',        position: 'SG',                   stats: { points: 6.9,  rebounds: 2.8,  assists: 2.7, steals: 1.1, blocks: 0.3, fieldGoalPct: 0.445, threePointPct: 0.315, freeThrowPct: 0.726 } },
    { name: 'Horace Grant',      position: 'PF',                   stats: { points: 7.5,  rebounds: 6.3,  assists: 1.5, steals: 0.7, blocks: 0.6, fieldGoalPct: 0.491, threePointPct: 0.000, freeThrowPct: 0.706 } },
    { name: 'Brian Shaw',        position: 'PG',                   stats: { points: 6.0,  rebounds: 2.8,  assists: 3.2, steals: 0.7, blocks: 0.2, fieldGoalPct: 0.430, threePointPct: 0.356, freeThrowPct: 0.753 } },
    { name: 'Devean George',     position: 'SF',                   stats: { points: 8.5,  rebounds: 4.2,  assists: 1.1, steals: 0.6, blocks: 0.6, fieldGoalPct: 0.447, threePointPct: 0.374, freeThrowPct: 0.756 } },
    { name: 'Samaki Walker',     position: 'C',                    stats: { points: 5.9,  rebounds: 5.7,  assists: 0.6, steals: 0.4, blocks: 0.7, fieldGoalPct: 0.488, threePointPct: 0.000, freeThrowPct: 0.590 } },
  ],
  // Lakers Kobe-Gasol 2005-2009
  '14-nba-14-2005': [
    { name: 'Kobe Bryant',       position: 'SG', isLegend: true,   stats: { points: 35.4, rebounds: 5.3, assists: 4.5, steals: 1.8, blocks: 0.4, fieldGoalPct: 0.450, threePointPct: 0.347, freeThrowPct: 0.860 } },
    { name: 'Pau Gasol',         position: 'PF', isLegend: true,   stats: { points: 18.8, rebounds: 9.7, assists: 3.5, steals: 0.8, blocks: 1.9, fieldGoalPct: 0.515, threePointPct: 0.133, freeThrowPct: 0.782 } },
    { name: 'Lamar Odom',        position: 'PF', isAllStar: true,  stats: { points: 13.7, rebounds: 8.9, assists: 3.4, steals: 1.0, blocks: 0.6, fieldGoalPct: 0.465, threePointPct: 0.355, freeThrowPct: 0.671 } },
    { name: 'Derek Fisher',      position: 'PG',                   stats: { points: 8.1,  rebounds: 1.9, assists: 2.8, steals: 0.7, blocks: 0.1, fieldGoalPct: 0.416, threePointPct: 0.355, freeThrowPct: 0.828 } },
    { name: 'Andrew Bynum',      position: 'C',  isAllStar: true,  stats: { points: 15.1, rebounds: 8.7, assists: 1.1, steals: 0.5, blocks: 2.1, fieldGoalPct: 0.550, threePointPct: 0.000, freeThrowPct: 0.726 } },
    { name: 'Jordan Farmar',     position: 'PG',                   stats: { points: 9.2,  rebounds: 1.9, assists: 3.7, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.426, threePointPct: 0.362, freeThrowPct: 0.801 } },
    { name: 'Vladimir Radmanovic', position: 'SF',                 stats: { points: 8.8,  rebounds: 4.1, assists: 1.4, steals: 0.6, blocks: 0.5, fieldGoalPct: 0.437, threePointPct: 0.381, freeThrowPct: 0.786 } },
    { name: 'Luke Walton',       position: 'SF',                   stats: { points: 5.5,  rebounds: 3.9, assists: 4.0, steals: 0.6, blocks: 0.3, fieldGoalPct: 0.483, threePointPct: 0.369, freeThrowPct: 0.712 } },
    { name: 'Ronny Turiaf',      position: 'C',                    stats: { points: 5.5,  rebounds: 4.1, assists: 0.6, steals: 0.4, blocks: 1.0, fieldGoalPct: 0.558, threePointPct: 0.000, freeThrowPct: 0.674 } },
    { name: 'Sasha Vujacic',     position: 'SG',                   stats: { points: 6.5,  rebounds: 1.9, assists: 1.3, steals: 0.6, blocks: 0.2, fieldGoalPct: 0.421, threePointPct: 0.367, freeThrowPct: 0.798 } },
  ],
  // Nuggets Jokic Era 2020-2024
  '8-nba-8-2020': [
    { name: 'Nikola Jokic',      position: 'C',  isLegend: true,   stats: { points: 27.1, rebounds: 13.8, assists: 7.9, steals: 1.5, blocks: 0.8, fieldGoalPct: 0.577, threePointPct: 0.358, freeThrowPct: 0.820 } },
    { name: 'Jamal Murray',      position: 'PG', isAllStar: true,  stats: { points: 21.2, rebounds: 4.1,  assists: 6.0, steals: 0.9, blocks: 0.3, fieldGoalPct: 0.464, threePointPct: 0.404, freeThrowPct: 0.831 } },
    { name: 'Michael Porter Jr.', position: 'SF',                  stats: { points: 19.4, rebounds: 7.7,  assists: 1.7, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.483, threePointPct: 0.398, freeThrowPct: 0.838 } },
    { name: 'Aaron Gordon',      position: 'PF', isAllStar: true,  stats: { points: 15.7, rebounds: 6.8,  assists: 3.5, steals: 0.9, blocks: 0.8, fieldGoalPct: 0.543, threePointPct: 0.306, freeThrowPct: 0.712 } },
    { name: 'Kentavious Caldwell-Pope', position: 'SG',             stats: { points: 13.0, rebounds: 2.9,  assists: 2.0, steals: 1.2, blocks: 0.2, fieldGoalPct: 0.449, threePointPct: 0.418, freeThrowPct: 0.797 } },
    { name: 'Bruce Brown',       position: 'SG',                   stats: { points: 11.8, rebounds: 4.2,  assists: 3.4, steals: 0.8, blocks: 0.3, fieldGoalPct: 0.531, threePointPct: 0.350, freeThrowPct: 0.717 } },
    { name: 'Bones Hyland',      position: 'PG',                   stats: { points: 10.8, rebounds: 2.7,  assists: 3.2, steals: 0.7, blocks: 0.2, fieldGoalPct: 0.418, threePointPct: 0.340, freeThrowPct: 0.849 } },
    { name: 'Jeff Green',        position: 'PF',                   stats: { points: 8.9,  rebounds: 3.9,  assists: 1.3, steals: 0.6, blocks: 0.5, fieldGoalPct: 0.495, threePointPct: 0.381, freeThrowPct: 0.796 } },
    { name: 'Zeke Nnaji',        position: 'C',                    stats: { points: 6.3,  rebounds: 4.4,  assists: 0.7, steals: 0.4, blocks: 0.5, fieldGoalPct: 0.561, threePointPct: 0.000, freeThrowPct: 0.717 } },
    { name: 'Thomas Bryant',     position: 'C',                    stats: { points: 10.3, rebounds: 6.0,  assists: 0.9, steals: 0.5, blocks: 1.1, fieldGoalPct: 0.566, threePointPct: 0.338, freeThrowPct: 0.794 } },
  ],
  // Bucks Giannis Era 2020-2024
  '17-nba-17-2020': [
    { name: 'Giannis Antetokounmpo', position: 'PF', isLegend: true, stats: { points: 29.9, rebounds: 11.6, assists: 5.8, steals: 1.1, blocks: 1.4, fieldGoalPct: 0.553, threePointPct: 0.276, freeThrowPct: 0.685 } },
    { name: 'Khris Middleton',   position: 'SF', isAllStar: true,  stats: { points: 20.4, rebounds: 5.4,  assists: 5.4, steals: 1.1, blocks: 0.3, fieldGoalPct: 0.498, threePointPct: 0.401, freeThrowPct: 0.886 } },
    { name: 'Jrue Holiday',      position: 'PG', isAllStar: true,  stats: { points: 18.0, rebounds: 4.5,  assists: 6.8, steals: 1.6, blocks: 0.6, fieldGoalPct: 0.479, threePointPct: 0.362, freeThrowPct: 0.759 } },
    { name: 'Brook Lopez',       position: 'C',  isAllStar: true,  stats: { points: 14.1, rebounds: 4.9,  assists: 1.4, steals: 0.6, blocks: 2.2, fieldGoalPct: 0.484, threePointPct: 0.344, freeThrowPct: 0.810 } },
    { name: 'Bobby Portis',      position: 'PF',                   stats: { points: 14.6, rebounds: 9.1,  assists: 1.4, steals: 0.6, blocks: 0.4, fieldGoalPct: 0.488, threePointPct: 0.408, freeThrowPct: 0.799 } },
    { name: 'P.J. Tucker',       position: 'PF',                   stats: { points: 7.1,  rebounds: 5.5,  assists: 1.4, steals: 1.0, blocks: 0.5, fieldGoalPct: 0.421, threePointPct: 0.378, freeThrowPct: 0.722 } },
    { name: 'Semi Ojeleye',      position: 'SF',                   stats: { points: 5.7,  rebounds: 3.1,  assists: 0.7, steals: 0.7, blocks: 0.4, fieldGoalPct: 0.439, threePointPct: 0.368, freeThrowPct: 0.773 } },
    { name: 'Serge Ibaka',       position: 'C',                    stats: { points: 8.6,  rebounds: 5.7,  assists: 1.1, steals: 0.6, blocks: 1.4, fieldGoalPct: 0.493, threePointPct: 0.310, freeThrowPct: 0.786 } },
    { name: 'Jevon Carter',      position: 'PG',                   stats: { points: 5.5,  rebounds: 1.7,  assists: 1.8, steals: 1.2, blocks: 0.2, fieldGoalPct: 0.431, threePointPct: 0.382, freeThrowPct: 0.773 } },
    { name: 'Pat Connaughton',   position: 'SG',                   stats: { points: 9.4,  rebounds: 4.9,  assists: 1.7, steals: 0.6, blocks: 0.5, fieldGoalPct: 0.461, threePointPct: 0.392, freeThrowPct: 0.883 } },
  ],
  // Hawks Dominique Era I 1985-1989
  '1-nba-1-1985': [
    { name: 'Dominique Wilkins', position: 'SF', isAllStar: true,  stats: { points: 30.3, rebounds: 6.1,  assists: 2.6, steals: 1.3, blocks: 0.5, fieldGoalPct: 0.467, threePointPct: 0.210, freeThrowPct: 0.805 } },
    { name: 'Doc Rivers',        position: 'PG', isAllStar: true,  stats: { points: 14.2, rebounds: 3.0,  assists: 6.3, steals: 2.0, blocks: 0.2, fieldGoalPct: 0.452, threePointPct: 0.280, freeThrowPct: 0.782 } },
    { name: 'Kevin Willis',      position: 'PF',                   stats: { points: 12.8, rebounds: 9.9,  assists: 1.0, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.501, threePointPct: 0.000, freeThrowPct: 0.701 } },
    { name: 'Randy Wittman',     position: 'SG',                   stats: { points: 11.5, rebounds: 2.3,  assists: 2.8, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.502, threePointPct: 0.000, freeThrowPct: 0.813 } },
    { name: 'Antoine Carr',      position: 'PF',                   stats: { points: 9.1,  rebounds: 3.5,  assists: 0.9, steals: 0.5, blocks: 0.6, fieldGoalPct: 0.510, threePointPct: 0.000, freeThrowPct: 0.730 } },
    { name: 'Spud Webb',         position: 'PG',                   stats: { points: 10.7, rebounds: 2.1,  assists: 5.0, steals: 1.3, blocks: 0.0, fieldGoalPct: 0.460, threePointPct: 0.300, freeThrowPct: 0.840 } },
    { name: 'Cliff Levingston',  position: 'PF',                   stats: { points: 8.6,  rebounds: 5.9,  assists: 0.8, steals: 0.9, blocks: 0.7, fieldGoalPct: 0.497, threePointPct: 0.000, freeThrowPct: 0.657 } },
    { name: 'Tree Rollins',      position: 'C',                    stats: { points: 7.2,  rebounds: 6.8,  assists: 0.8, steals: 0.5, blocks: 2.5, fieldGoalPct: 0.530, threePointPct: 0.000, freeThrowPct: 0.621 } },
    { name: 'Jon Koncak',        position: 'C',                    stats: { points: 5.2,  rebounds: 5.1,  assists: 0.5, steals: 0.4, blocks: 1.2, fieldGoalPct: 0.478, threePointPct: 0.000, freeThrowPct: 0.590 } },
    { name: 'Glenn Rivers',      position: 'SG',                   stats: { points: 9.0,  rebounds: 2.5,  assists: 4.0, steals: 1.5, blocks: 0.1, fieldGoalPct: 0.440, threePointPct: 0.260, freeThrowPct: 0.760 } },
  ],
  // Hawks Dominique Era II 1990-1994
  '1-nba-1-1990': [
    { name: 'Dominique Wilkins', position: 'SF', isAllStar: true,  stats: { points: 29.9, rebounds: 6.0,  assists: 2.7, steals: 1.2, blocks: 0.6, fieldGoalPct: 0.469, threePointPct: 0.263, freeThrowPct: 0.838 } },
    { name: 'Kevin Willis',      position: 'PF', isAllStar: true,  stats: { points: 18.3, rebounds: 11.0, assists: 1.3, steals: 0.8, blocks: 0.9, fieldGoalPct: 0.511, threePointPct: 0.000, freeThrowPct: 0.720 } },
    { name: 'Mookie Blaylock',   position: 'PG', isAllStar: true,  stats: { points: 17.0, rebounds: 4.1,  assists: 6.4, steals: 2.9, blocks: 0.2, fieldGoalPct: 0.430, threePointPct: 0.330, freeThrowPct: 0.780 } },
    { name: 'Danny Manning',     position: 'PF',                   stats: { points: 16.5, rebounds: 6.3,  assists: 2.5, steals: 1.0, blocks: 0.8, fieldGoalPct: 0.510, threePointPct: 0.100, freeThrowPct: 0.760 } },
    { name: 'Stacey Augmon',     position: 'SG',                   stats: { points: 13.0, rebounds: 4.0,  assists: 2.5, steals: 1.6, blocks: 0.4, fieldGoalPct: 0.501, threePointPct: 0.100, freeThrowPct: 0.710 } },
    { name: 'Doc Rivers',        position: 'PG',                   stats: { points: 12.0, rebounds: 2.8,  assists: 5.8, steals: 1.8, blocks: 0.1, fieldGoalPct: 0.445, threePointPct: 0.290, freeThrowPct: 0.790 } },
    { name: 'Duane Ferrell',     position: 'SG',                   stats: { points: 8.0,  rebounds: 2.5,  assists: 1.0, steals: 0.7, blocks: 0.2, fieldGoalPct: 0.490, threePointPct: 0.200, freeThrowPct: 0.750 } },
    { name: 'Blair Rasmussen',   position: 'C',                    stats: { points: 6.0,  rebounds: 4.0,  assists: 0.7, steals: 0.3, blocks: 0.8, fieldGoalPct: 0.480, threePointPct: 0.000, freeThrowPct: 0.640 } },
    { name: 'Rumeal Robinson',   position: 'PG',                   stats: { points: 7.2,  rebounds: 2.0,  assists: 4.5, steals: 0.9, blocks: 0.1, fieldGoalPct: 0.440, threePointPct: 0.250, freeThrowPct: 0.740 } },
    { name: 'Jon Koncak',        position: 'C',                    stats: { points: 4.5,  rebounds: 4.8,  assists: 0.6, steals: 0.4, blocks: 1.1, fieldGoalPct: 0.475, threePointPct: 0.000, freeThrowPct: 0.590 } },
  ],
  // Hawks Mutombo Era 1995-1999
  '1-nba-1-1995': [
    { name: 'Dikembe Mutombo',   position: 'C',  isAllStar: true,  stats: { points: 13.0, rebounds: 12.0, assists: 1.5, steals: 0.5, blocks: 3.3, fieldGoalPct: 0.540, threePointPct: 0.000, freeThrowPct: 0.620 } },
    { name: 'Steve Smith',       position: 'SG', isAllStar: true,  stats: { points: 20.1, rebounds: 3.8,  assists: 4.5, steals: 1.3, blocks: 0.3, fieldGoalPct: 0.453, threePointPct: 0.358, freeThrowPct: 0.852 } },
    { name: 'Mookie Blaylock',   position: 'PG', isAllStar: true,  stats: { points: 17.5, rebounds: 4.3,  assists: 6.0, steals: 2.5, blocks: 0.2, fieldGoalPct: 0.435, threePointPct: 0.340, freeThrowPct: 0.775 } },
    { name: 'Christian Laettner', position: 'PF', isAllStar: true, stats: { points: 18.0, rebounds: 8.7,  assists: 3.5, steals: 1.0, blocks: 0.7, fieldGoalPct: 0.490, threePointPct: 0.320, freeThrowPct: 0.800 } },
    { name: 'Grant Long',        position: 'PF',                   stats: { points: 8.5,  rebounds: 6.5,  assists: 1.8, steals: 1.1, blocks: 0.5, fieldGoalPct: 0.467, threePointPct: 0.150, freeThrowPct: 0.700 } },
    { name: 'Ken Norman',        position: 'SF',                   stats: { points: 10.5, rebounds: 4.2,  assists: 1.8, steals: 0.8, blocks: 0.4, fieldGoalPct: 0.488, threePointPct: 0.200, freeThrowPct: 0.720 } },
    { name: 'Tyrone Corbin',     position: 'SF',                   stats: { points: 7.5,  rebounds: 4.5,  assists: 1.5, steals: 1.1, blocks: 0.4, fieldGoalPct: 0.460, threePointPct: 0.280, freeThrowPct: 0.710 } },
    { name: 'Andrew Lang',       position: 'C',                    stats: { points: 6.0,  rebounds: 5.0,  assists: 0.5, steals: 0.4, blocks: 1.3, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.650 } },
    { name: 'Donnie Boyce',      position: 'SG',                   stats: { points: 4.5,  rebounds: 1.5,  assists: 1.0, steals: 0.6, blocks: 0.1, fieldGoalPct: 0.445, threePointPct: 0.310, freeThrowPct: 0.740 } },
    { name: 'Alan Henderson',    position: 'PF',                   stats: { points: 8.0,  rebounds: 6.0,  assists: 0.8, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.488, threePointPct: 0.000, freeThrowPct: 0.700 } },
  ],
  // Hawks Millsap-Horford Era 2015-2019
  '1-nba-1-2015': [
    { name: 'Paul Millsap',      position: 'PF', isAllStar: true,  stats: { points: 18.1, rebounds: 7.7,  assists: 3.7, steals: 1.6, blocks: 1.1, fieldGoalPct: 0.474, threePointPct: 0.323, freeThrowPct: 0.784 } },
    { name: 'Al Horford',        position: 'C',  isAllStar: true,  stats: { points: 15.2, rebounds: 7.3,  assists: 3.2, steals: 0.9, blocks: 1.1, fieldGoalPct: 0.516, threePointPct: 0.350, freeThrowPct: 0.798 } },
    { name: 'Jeff Teague',       position: 'PG', isAllStar: true,  stats: { points: 15.9, rebounds: 2.6,  assists: 7.5, steals: 1.6, blocks: 0.2, fieldGoalPct: 0.439, threePointPct: 0.348, freeThrowPct: 0.818 } },
    { name: 'Kyle Korver',       position: 'SG', isAllStar: true,  stats: { points: 12.0, rebounds: 3.1,  assists: 1.5, steals: 1.1, blocks: 0.3, fieldGoalPct: 0.491, threePointPct: 0.492, freeThrowPct: 0.902 } },
    { name: 'DeMarre Carroll',   position: 'SF',                   stats: { points: 12.0, rebounds: 5.2,  assists: 1.7, steals: 1.4, blocks: 0.5, fieldGoalPct: 0.450, threePointPct: 0.376, freeThrowPct: 0.751 } },
    { name: 'Dennis Schroder',   position: 'PG',                   stats: { points: 11.0, rebounds: 2.5,  assists: 4.5, steals: 1.2, blocks: 0.1, fieldGoalPct: 0.440, threePointPct: 0.330, freeThrowPct: 0.780 } },
    { name: 'Kent Bazemore',     position: 'SG',                   stats: { points: 8.0,  rebounds: 3.2,  assists: 1.8, steals: 1.3, blocks: 0.3, fieldGoalPct: 0.432, threePointPct: 0.351, freeThrowPct: 0.720 } },
    { name: 'Thabo Sefolosha',   position: 'SF',                   stats: { points: 7.0,  rebounds: 3.5,  assists: 1.5, steals: 1.5, blocks: 0.5, fieldGoalPct: 0.450, threePointPct: 0.340, freeThrowPct: 0.720 } },
    { name: 'Mike Muscala',      position: 'C',                    stats: { points: 5.5,  rebounds: 3.8,  assists: 0.8, steals: 0.3, blocks: 0.7, fieldGoalPct: 0.490, threePointPct: 0.380, freeThrowPct: 0.800 } },
    { name: 'Pero Antic',        position: 'C',                    stats: { points: 5.5,  rebounds: 4.0,  assists: 0.9, steals: 0.4, blocks: 0.8, fieldGoalPct: 0.430, threePointPct: 0.360, freeThrowPct: 0.750 } },
  ],
  // Celtics Big Three 2.1 2010-2014
  '2-nba-2-2010': [
    { name: 'Paul Pierce',       position: 'SF', isAllStar: true,  stats: { points: 18.9, rebounds: 5.2,  assists: 3.8, steals: 1.2, blocks: 0.5, fieldGoalPct: 0.462, threePointPct: 0.392, freeThrowPct: 0.839 } },
    { name: 'Kevin Garnett',     position: 'PF', isAllStar: true,  stats: { points: 14.9, rebounds: 8.9,  assists: 3.3, steals: 1.0, blocks: 1.3, fieldGoalPct: 0.479, threePointPct: 0.000, freeThrowPct: 0.806 } },
    { name: 'Ray Allen',         position: 'SG', isAllStar: true,  stats: { points: 16.3, rebounds: 3.4,  assists: 2.4, steals: 1.0, blocks: 0.2, fieldGoalPct: 0.460, threePointPct: 0.433, freeThrowPct: 0.918 } },
    { name: 'Rajon Rondo',       position: 'PG', isAllStar: true,  stats: { points: 11.9, rebounds: 4.7,  assists: 9.8, steals: 2.5, blocks: 0.2, fieldGoalPct: 0.479, threePointPct: 0.250, freeThrowPct: 0.690 } },
    { name: 'Glen Davis',        position: 'PF',                   stats: { points: 10.2, rebounds: 5.5,  assists: 1.2, steals: 0.5, blocks: 0.6, fieldGoalPct: 0.490, threePointPct: 0.200, freeThrowPct: 0.720 } },
    { name: 'Nate Robinson',     position: 'PG',                   stats: { points: 9.5,  rebounds: 2.0,  assists: 3.5, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.415, threePointPct: 0.350, freeThrowPct: 0.810 } },
    { name: 'Tony Allen',        position: 'SG',                   stats: { points: 9.0,  rebounds: 3.0,  assists: 1.5, steals: 1.8, blocks: 0.4, fieldGoalPct: 0.475, threePointPct: 0.280, freeThrowPct: 0.710 } },
    { name: 'Kendrick Perkins',  position: 'C',                    stats: { points: 7.0,  rebounds: 7.1,  assists: 0.8, steals: 0.5, blocks: 1.0, fieldGoalPct: 0.521, threePointPct: 0.000, freeThrowPct: 0.588 } },
    { name: 'Marquis Daniels',   position: 'SG',                   stats: { points: 5.5,  rebounds: 2.2,  assists: 1.5, steals: 0.9, blocks: 0.2, fieldGoalPct: 0.445, threePointPct: 0.250, freeThrowPct: 0.720 } },
    { name: 'Von Wafer',         position: 'SG',                   stats: { points: 4.5,  rebounds: 1.5,  assists: 0.8, steals: 0.5, blocks: 0.1, fieldGoalPct: 0.430, threePointPct: 0.320, freeThrowPct: 0.760 } },
  ],
  // Nets Petrovic-Coleman Era 1990-1994
  '3-nba-3-1990': [
    { name: 'Derrick Coleman',   position: 'PF', isAllStar: true,  stats: { points: 20.2, rebounds: 10.3, assists: 3.2, steals: 1.2, blocks: 1.2, fieldGoalPct: 0.468, threePointPct: 0.305, freeThrowPct: 0.735 } },
    { name: 'Kenny Anderson',    position: 'PG', isAllStar: true,  stats: { points: 18.8, rebounds: 3.5,  assists: 9.6, steals: 2.0, blocks: 0.2, fieldGoalPct: 0.435, threePointPct: 0.290, freeThrowPct: 0.775 } },
    { name: 'Drazen Petrovic',   position: 'SG',                   stats: { points: 22.3, rebounds: 2.9,  assists: 3.1, steals: 0.9, blocks: 0.2, fieldGoalPct: 0.518, threePointPct: 0.445, freeThrowPct: 0.880 } },
    { name: 'Chris Morris',      position: 'SF',                   stats: { points: 14.5, rebounds: 5.0,  assists: 1.8, steals: 1.0, blocks: 0.8, fieldGoalPct: 0.450, threePointPct: 0.300, freeThrowPct: 0.730 } },
    { name: 'Mookie Blaylock',   position: 'PG',                   stats: { points: 12.0, rebounds: 3.0,  assists: 5.5, steals: 2.3, blocks: 0.2, fieldGoalPct: 0.420, threePointPct: 0.290, freeThrowPct: 0.750 } },
    { name: 'Terry Mills',       position: 'PF',                   stats: { points: 8.0,  rebounds: 5.0,  assists: 1.0, steals: 0.4, blocks: 0.5, fieldGoalPct: 0.470, threePointPct: 0.320, freeThrowPct: 0.750 } },
    { name: 'Rick Mahorn',       position: 'PF',                   stats: { points: 8.0,  rebounds: 6.5,  assists: 1.2, steals: 0.8, blocks: 0.8, fieldGoalPct: 0.480, threePointPct: 0.000, freeThrowPct: 0.680 } },
    { name: 'Sam Bowie',         position: 'C',                    stats: { points: 8.5,  rebounds: 6.5,  assists: 2.0, steals: 0.5, blocks: 1.2, fieldGoalPct: 0.480, threePointPct: 0.000, freeThrowPct: 0.680 } },
    { name: 'Jayson Williams',   position: 'C',                    stats: { points: 5.5,  rebounds: 6.0,  assists: 0.8, steals: 0.5, blocks: 0.7, fieldGoalPct: 0.480, threePointPct: 0.000, freeThrowPct: 0.600 } },
    { name: 'Tate George',       position: 'PG',                   stats: { points: 5.0,  rebounds: 1.5,  assists: 2.5, steals: 0.6, blocks: 0.1, fieldGoalPct: 0.455, threePointPct: 0.250, freeThrowPct: 0.760 } },
  ],
  // Nets Jason Kidd Era 2000-2004
  '3-nba-3-2000': [
    { name: 'Jason Kidd',        position: 'PG', isAllStar: true,  stats: { points: 14.7, rebounds: 7.3,  assists: 9.9, steals: 2.2, blocks: 0.4, fieldGoalPct: 0.410, threePointPct: 0.344, freeThrowPct: 0.782 } },
    { name: 'Kenyon Martin',     position: 'PF', isAllStar: true,  stats: { points: 17.6, rebounds: 9.0,  assists: 2.1, steals: 1.3, blocks: 1.7, fieldGoalPct: 0.495, threePointPct: 0.000, freeThrowPct: 0.634 } },
    { name: 'Richard Jefferson', position: 'SF',                   stats: { points: 18.5, rebounds: 5.5,  assists: 2.8, steals: 0.9, blocks: 0.5, fieldGoalPct: 0.480, threePointPct: 0.350, freeThrowPct: 0.796 } },
    { name: 'Kerry Kittles',     position: 'SG',                   stats: { points: 14.5, rebounds: 3.5,  assists: 2.5, steals: 1.6, blocks: 0.3, fieldGoalPct: 0.445, threePointPct: 0.380, freeThrowPct: 0.800 } },
    { name: 'Todd MacCulloch',   position: 'C',                    stats: { points: 9.0,  rebounds: 5.5,  assists: 0.5, steals: 0.4, blocks: 1.0, fieldGoalPct: 0.540, threePointPct: 0.000, freeThrowPct: 0.700 } },
    { name: 'Lucious Harris',    position: 'SG',                   stats: { points: 8.5,  rebounds: 2.5,  assists: 1.8, steals: 0.8, blocks: 0.2, fieldGoalPct: 0.450, threePointPct: 0.370, freeThrowPct: 0.800 } },
    { name: 'Aaron Williams',    position: 'PF',                   stats: { points: 6.0,  rebounds: 5.5,  assists: 0.5, steals: 0.5, blocks: 0.9, fieldGoalPct: 0.500, threePointPct: 0.000, freeThrowPct: 0.620 } },
    { name: 'Anthony Johnson',   position: 'PG',                   stats: { points: 6.0,  rebounds: 1.8,  assists: 3.0, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.420, threePointPct: 0.310, freeThrowPct: 0.760 } },
    { name: 'Jason Collins',     position: 'C',                    stats: { points: 5.0,  rebounds: 4.5,  assists: 0.8, steals: 0.5, blocks: 0.9, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.610 } },
    { name: 'Brian Scalabrine',  position: 'PF',                   stats: { points: 4.5,  rebounds: 3.5,  assists: 1.0, steals: 0.4, blocks: 0.3, fieldGoalPct: 0.450, threePointPct: 0.330, freeThrowPct: 0.750 } },
  ],
  // Nets Deron Williams Era 2010-2014
  '3-nba-3-2010': [
    { name: 'Deron Williams',    position: 'PG', isAllStar: true,  stats: { points: 21.4, rebounds: 3.3,  assists: 8.7, steals: 0.8, blocks: 0.3, fieldGoalPct: 0.440, threePointPct: 0.368, freeThrowPct: 0.832 } },
    { name: 'Brook Lopez',       position: 'C',  isAllStar: true,  stats: { points: 19.4, rebounds: 7.5,  assists: 1.2, steals: 0.6, blocks: 1.9, fieldGoalPct: 0.495, threePointPct: 0.000, freeThrowPct: 0.796 } },
    { name: 'Joe Johnson',       position: 'SG', isAllStar: true,  stats: { points: 16.1, rebounds: 3.4,  assists: 3.8, steals: 0.8, blocks: 0.3, fieldGoalPct: 0.431, threePointPct: 0.362, freeThrowPct: 0.789 } },
    { name: 'Gerald Wallace',    position: 'SF', isAllStar: true,  stats: { points: 14.6, rebounds: 7.2,  assists: 2.8, steals: 1.6, blocks: 0.9, fieldGoalPct: 0.440, threePointPct: 0.310, freeThrowPct: 0.754 } },
    { name: 'Kris Humphries',    position: 'PF',                   stats: { points: 13.8, rebounds: 11.0, assists: 1.0, steals: 0.5, blocks: 0.5, fieldGoalPct: 0.520, threePointPct: 0.000, freeThrowPct: 0.740 } },
    { name: 'Andray Blatche',    position: 'PF',                   stats: { points: 13.0, rebounds: 6.5,  assists: 1.5, steals: 0.6, blocks: 1.0, fieldGoalPct: 0.465, threePointPct: 0.200, freeThrowPct: 0.710 } },
    { name: 'MarShon Brooks',    position: 'SG',                   stats: { points: 11.5, rebounds: 2.8,  assists: 1.5, steals: 0.7, blocks: 0.2, fieldGoalPct: 0.438, threePointPct: 0.340, freeThrowPct: 0.820 } },
    { name: 'Jordan Farmar',     position: 'PG',                   stats: { points: 7.5,  rebounds: 1.8,  assists: 3.5, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.415, threePointPct: 0.330, freeThrowPct: 0.790 } },
    { name: 'Reggie Evans',      position: 'PF',                   stats: { points: 5.0,  rebounds: 8.0,  assists: 0.5, steals: 0.5, blocks: 0.3, fieldGoalPct: 0.530, threePointPct: 0.000, freeThrowPct: 0.550 } },
    { name: 'Johan Petro',       position: 'C',                    stats: { points: 4.5,  rebounds: 4.0,  assists: 0.5, steals: 0.3, blocks: 0.8, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.640 } },
  ],
  // Nets Brook Lopez Era 2015-2019
  '3-nba-3-2015': [
    { name: 'Brook Lopez',       position: 'C',                    stats: { points: 20.0, rebounds: 6.4,  assists: 1.5, steals: 0.6, blocks: 1.8, fieldGoalPct: 0.502, threePointPct: 0.000, freeThrowPct: 0.808 } },
    { name: 'Jeremy Lin',        position: 'PG',                   stats: { points: 14.5, rebounds: 3.0,  assists: 5.1, steals: 0.8, blocks: 0.2, fieldGoalPct: 0.430, threePointPct: 0.320, freeThrowPct: 0.810 } },
    { name: 'Thaddeus Young',    position: 'PF',                   stats: { points: 14.0, rebounds: 5.0,  assists: 1.8, steals: 1.5, blocks: 0.4, fieldGoalPct: 0.495, threePointPct: 0.300, freeThrowPct: 0.760 } },
    { name: 'Joe Johnson',       position: 'SG',                   stats: { points: 13.5, rebounds: 3.2,  assists: 2.8, steals: 0.7, blocks: 0.3, fieldGoalPct: 0.420, threePointPct: 0.330, freeThrowPct: 0.780 } },
    { name: 'Jarrett Jack',      position: 'PG',                   stats: { points: 12.0, rebounds: 2.8,  assists: 5.5, steals: 1.0, blocks: 0.1, fieldGoalPct: 0.435, threePointPct: 0.320, freeThrowPct: 0.820 } },
    { name: 'Bojan Bogdanovic',  position: 'SF',                   stats: { points: 10.8, rebounds: 2.5,  assists: 1.2, steals: 0.5, blocks: 0.2, fieldGoalPct: 0.440, threePointPct: 0.370, freeThrowPct: 0.830 } },
    { name: 'Randy Foye',        position: 'SG',                   stats: { points: 9.5,  rebounds: 2.5,  assists: 2.2, steals: 0.8, blocks: 0.2, fieldGoalPct: 0.405, threePointPct: 0.350, freeThrowPct: 0.800 } },
    { name: 'Wayne Ellington',   position: 'SG',                   stats: { points: 7.5,  rebounds: 1.8,  assists: 1.0, steals: 0.5, blocks: 0.1, fieldGoalPct: 0.425, threePointPct: 0.370, freeThrowPct: 0.820 } },
    { name: 'Shane Larkin',      position: 'PG',                   stats: { points: 6.5,  rebounds: 1.5,  assists: 2.5, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.415, threePointPct: 0.320, freeThrowPct: 0.790 } },
    { name: 'Thomas Robinson',   position: 'PF',                   stats: { points: 6.0,  rebounds: 5.5,  assists: 0.5, steals: 0.5, blocks: 0.5, fieldGoalPct: 0.470, threePointPct: 0.000, freeThrowPct: 0.650 } },
  ],
  // Hornets LJ-Alonzo Era 1995-1999
  '4-nba-4-1995': [
    { name: 'Alonzo Mourning',   position: 'C',  isAllStar: true,  stats: { points: 21.5, rebounds: 10.3, assists: 1.5, steals: 0.8, blocks: 3.1, fieldGoalPct: 0.511, threePointPct: 0.000, freeThrowPct: 0.741 } },
    { name: 'Larry Johnson',     position: 'PF', isAllStar: true,  stats: { points: 22.1, rebounds: 9.0,  assists: 4.3, steals: 1.0, blocks: 0.6, fieldGoalPct: 0.499, threePointPct: 0.310, freeThrowPct: 0.760 } },
    { name: 'Hersey Hawkins',    position: 'SG', isAllStar: true,  stats: { points: 19.1, rebounds: 4.3,  assists: 3.5, steals: 2.3, blocks: 0.4, fieldGoalPct: 0.462, threePointPct: 0.407, freeThrowPct: 0.877 } },
    { name: 'Dell Curry',        position: 'SG',                   stats: { points: 16.3, rebounds: 2.5,  assists: 2.5, steals: 0.9, blocks: 0.2, fieldGoalPct: 0.466, threePointPct: 0.408, freeThrowPct: 0.879 } },
    { name: 'Muggsy Bogues',     position: 'PG',                   stats: { points: 10.8, rebounds: 3.3,  assists: 8.0, steals: 1.9, blocks: 0.0, fieldGoalPct: 0.470, threePointPct: 0.280, freeThrowPct: 0.837 } },
    { name: 'Kenny Gattison',    position: 'PF',                   stats: { points: 9.0,  rebounds: 5.5,  assists: 1.0, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.502, threePointPct: 0.000, freeThrowPct: 0.690 } },
    { name: 'Matt Geiger',       position: 'C',                    stats: { points: 8.0,  rebounds: 6.0,  assists: 0.8, steals: 0.5, blocks: 0.8, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.680 } },
    { name: 'Scott Burrell',     position: 'SF',                   stats: { points: 8.5,  rebounds: 4.5,  assists: 2.0, steals: 1.2, blocks: 0.6, fieldGoalPct: 0.450, threePointPct: 0.350, freeThrowPct: 0.740 } },
    { name: 'Robert Parish',     position: 'C',                    stats: { points: 7.5,  rebounds: 5.8,  assists: 0.8, steals: 0.5, blocks: 0.9, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.700 } },
    { name: 'David Wingate',     position: 'SG',                   stats: { points: 6.0,  rebounds: 2.5,  assists: 2.0, steals: 1.1, blocks: 0.3, fieldGoalPct: 0.445, threePointPct: 0.300, freeThrowPct: 0.720 } },
  ],
  // Hornets Baron Davis Era 2000-2004
  '4-nba-4-2000': [
    { name: 'Jamal Mashburn',    position: 'SF', isAllStar: true,  stats: { points: 21.6, rebounds: 5.7,  assists: 3.8, steals: 1.1, blocks: 0.4, fieldGoalPct: 0.450, threePointPct: 0.360, freeThrowPct: 0.792 } },
    { name: 'Baron Davis',       position: 'PG', isAllStar: true,  stats: { points: 18.5, rebounds: 4.0,  assists: 7.5, steals: 2.2, blocks: 0.6, fieldGoalPct: 0.415, threePointPct: 0.325, freeThrowPct: 0.723 } },
    { name: 'Eddie Jones',       position: 'SG', isAllStar: true,  stats: { points: 17.5, rebounds: 4.2,  assists: 2.8, steals: 2.0, blocks: 0.5, fieldGoalPct: 0.445, threePointPct: 0.361, freeThrowPct: 0.800 } },
    { name: 'Jamaal Magloire',   position: 'C',  isAllStar: true,  stats: { points: 13.0, rebounds: 10.3, assists: 1.0, steals: 0.6, blocks: 1.2, fieldGoalPct: 0.500, threePointPct: 0.000, freeThrowPct: 0.670 } },
    { name: 'David Wesley',      position: 'SG',                   stats: { points: 14.0, rebounds: 2.8,  assists: 4.5, steals: 1.4, blocks: 0.2, fieldGoalPct: 0.425, threePointPct: 0.345, freeThrowPct: 0.840 } },
    { name: 'Elden Campbell',    position: 'C',                    stats: { points: 12.5, rebounds: 7.5,  assists: 1.5, steals: 0.8, blocks: 1.7, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.690 } },
    { name: 'P.J. Brown',        position: 'PF',                   stats: { points: 10.5, rebounds: 8.0,  assists: 1.5, steals: 0.9, blocks: 1.0, fieldGoalPct: 0.480, threePointPct: 0.200, freeThrowPct: 0.730 } },
    { name: 'Derrick Coleman',   position: 'PF',                   stats: { points: 10.5, rebounds: 6.5,  assists: 2.0, steals: 0.7, blocks: 0.6, fieldGoalPct: 0.440, threePointPct: 0.280, freeThrowPct: 0.720 } },
    { name: 'Lee Nailon',        position: 'SF',                   stats: { points: 9.0,  rebounds: 3.5,  assists: 0.8, steals: 0.5, blocks: 0.3, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.750 } },
    { name: 'Gerald Wallace',    position: 'SG',                   stats: { points: 7.0,  rebounds: 3.0,  assists: 1.0, steals: 1.0, blocks: 0.4, fieldGoalPct: 0.430, threePointPct: 0.250, freeThrowPct: 0.680 } },
  ],
  // Hornets Gerald Wallace Era 2010-2014
  '4-nba-4-2010': [
    { name: 'Gerald Wallace',    position: 'SF', isAllStar: true,  stats: { points: 18.0, rebounds: 9.4,  assists: 2.8, steals: 2.3, blocks: 1.3, fieldGoalPct: 0.465, threePointPct: 0.320, freeThrowPct: 0.700 } },
    { name: 'Stephen Jackson',   position: 'SG',                   stats: { points: 17.0, rebounds: 4.5,  assists: 3.5, steals: 1.5, blocks: 0.4, fieldGoalPct: 0.435, threePointPct: 0.350, freeThrowPct: 0.790 } },
    { name: 'Corey Maggette',    position: 'SF',                   stats: { points: 14.0, rebounds: 4.5,  assists: 2.0, steals: 1.0, blocks: 0.4, fieldGoalPct: 0.445, threePointPct: 0.290, freeThrowPct: 0.820 } },
    { name: 'Raymond Felton',    position: 'PG',                   stats: { points: 12.5, rebounds: 3.5,  assists: 6.0, steals: 1.0, blocks: 0.2, fieldGoalPct: 0.430, threePointPct: 0.315, freeThrowPct: 0.810 } },
    { name: 'D.J. Augustin',     position: 'PG',                   stats: { points: 11.0, rebounds: 1.8,  assists: 4.5, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.415, threePointPct: 0.355, freeThrowPct: 0.850 } },
    { name: 'Tyson Chandler',    position: 'C',                    stats: { points: 10.5, rebounds: 11.6, assists: 1.0, steals: 0.7, blocks: 1.4, fieldGoalPct: 0.550, threePointPct: 0.000, freeThrowPct: 0.625 } },
    { name: 'Boris Diaw',        position: 'SF',                   stats: { points: 9.5,  rebounds: 5.5,  assists: 4.5, steals: 0.9, blocks: 0.5, fieldGoalPct: 0.455, threePointPct: 0.310, freeThrowPct: 0.730 } },
    { name: 'Dante Cunningham',  position: 'PF',                   stats: { points: 7.5,  rebounds: 4.5,  assists: 1.0, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.480, threePointPct: 0.280, freeThrowPct: 0.700 } },
    { name: 'Nazr Mohammed',     position: 'C',                    stats: { points: 7.0,  rebounds: 6.0,  assists: 0.7, steals: 0.4, blocks: 0.9, fieldGoalPct: 0.500, threePointPct: 0.000, freeThrowPct: 0.660 } },
    { name: 'Sherron Collins',   position: 'PG',                   stats: { points: 3.5,  rebounds: 1.0,  assists: 2.0, steals: 0.5, blocks: 0.0, fieldGoalPct: 0.400, threePointPct: 0.280, freeThrowPct: 0.750 } },
  ],
  // Bulls Derrick Rose Era 2010-2014
  '5-nba-5-2010': [
    { name: 'Derrick Rose',      position: 'PG', isAllStar: true,  stats: { points: 25.0, rebounds: 3.8,  assists: 7.7, steals: 0.9, blocks: 0.6, fieldGoalPct: 0.449, threePointPct: 0.299, freeThrowPct: 0.858 } },
    { name: 'Carlos Boozer',     position: 'PF', isAllStar: true,  stats: { points: 17.5, rebounds: 9.6,  assists: 2.6, steals: 0.8, blocks: 0.5, fieldGoalPct: 0.511, threePointPct: 0.000, freeThrowPct: 0.752 } },
    { name: 'Luol Deng',         position: 'SF', isAllStar: true,  stats: { points: 17.2, rebounds: 7.7,  assists: 3.3, steals: 1.5, blocks: 0.8, fieldGoalPct: 0.458, threePointPct: 0.348, freeThrowPct: 0.796 } },
    { name: 'Joakim Noah',       position: 'C',  isAllStar: true,  stats: { points: 12.3, rebounds: 11.3, assists: 5.4, steals: 1.0, blocks: 1.5, fieldGoalPct: 0.473, threePointPct: 0.000, freeThrowPct: 0.643 } },
    { name: 'Rip Hamilton',      position: 'SG',                   stats: { points: 10.5, rebounds: 2.5,  assists: 2.5, steals: 0.8, blocks: 0.2, fieldGoalPct: 0.440, threePointPct: 0.300, freeThrowPct: 0.840 } },
    { name: 'Taj Gibson',        position: 'PF',                   stats: { points: 9.5,  rebounds: 6.5,  assists: 0.8, steals: 0.7, blocks: 1.2, fieldGoalPct: 0.521, threePointPct: 0.000, freeThrowPct: 0.699 } },
    { name: 'Kirk Hinrich',      position: 'PG',                   stats: { points: 9.0,  rebounds: 2.8,  assists: 4.5, steals: 1.2, blocks: 0.2, fieldGoalPct: 0.430, threePointPct: 0.350, freeThrowPct: 0.800 } },
    { name: 'Jimmy Butler',      position: 'SG',                   stats: { points: 8.6,  rebounds: 3.3,  assists: 1.4, steals: 1.1, blocks: 0.4, fieldGoalPct: 0.451, threePointPct: 0.318, freeThrowPct: 0.790 } },
    { name: 'Ronnie Brewer',     position: 'SG',                   stats: { points: 7.5,  rebounds: 3.0,  assists: 1.5, steals: 1.5, blocks: 0.4, fieldGoalPct: 0.445, threePointPct: 0.300, freeThrowPct: 0.720 } },
    { name: 'Nate Robinson',     position: 'PG',                   stats: { points: 9.8,  rebounds: 2.0,  assists: 3.8, steals: 0.9, blocks: 0.1, fieldGoalPct: 0.420, threePointPct: 0.348, freeThrowPct: 0.810 } },
  ],
  // Cavaliers Mid-Era 1985-1989
  '6-nba-6-1985': [
    { name: 'Ron Harper',        position: 'SG',                   stats: { points: 14.5, rebounds: 4.0,  assists: 3.8, steals: 1.8, blocks: 0.5, fieldGoalPct: 0.448, threePointPct: 0.280, freeThrowPct: 0.730 } },
    { name: 'World B. Free',     position: 'SG',                   stats: { points: 16.0, rebounds: 2.5,  assists: 3.2, steals: 1.0, blocks: 0.2, fieldGoalPct: 0.441, threePointPct: 0.300, freeThrowPct: 0.830 } },
    { name: 'Roy Hinson',        position: 'PF',                   stats: { points: 14.0, rebounds: 6.8,  assists: 1.0, steals: 0.6, blocks: 1.8, fieldGoalPct: 0.510, threePointPct: 0.000, freeThrowPct: 0.680 } },
    { name: 'John Bagley',       position: 'PG',                   stats: { points: 11.0, rebounds: 2.8,  assists: 7.5, steals: 1.2, blocks: 0.1, fieldGoalPct: 0.440, threePointPct: 0.250, freeThrowPct: 0.760 } },
    { name: 'Mel Turpin',        position: 'C',                    stats: { points: 11.0, rebounds: 5.5,  assists: 0.8, steals: 0.4, blocks: 1.2, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.700 } },
    { name: 'Phil Hubbard',      position: 'PF',                   stats: { points: 10.2, rebounds: 6.1,  assists: 1.2, steals: 0.8, blocks: 0.4, fieldGoalPct: 0.500, threePointPct: 0.000, freeThrowPct: 0.720 } },
    { name: 'Mark West',         position: 'C',                    stats: { points: 7.0,  rebounds: 6.5,  assists: 0.5, steals: 0.5, blocks: 1.5, fieldGoalPct: 0.600, threePointPct: 0.000, freeThrowPct: 0.560 } },
    { name: 'Johnny Davis',      position: 'PG',                   stats: { points: 6.5,  rebounds: 1.5,  assists: 4.0, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.430, threePointPct: 0.200, freeThrowPct: 0.800 } },
    { name: 'Ben Poquette',      position: 'SF',                   stats: { points: 5.5,  rebounds: 4.5,  assists: 0.8, steals: 0.5, blocks: 0.6, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.710 } },
    { name: 'Edgar Jones',       position: 'PF',                   stats: { points: 5.0,  rebounds: 4.0,  assists: 0.5, steals: 0.4, blocks: 1.0, fieldGoalPct: 0.480, threePointPct: 0.000, freeThrowPct: 0.650 } },
  ],
  // Cavaliers Mark Price Era 1990-1994
  '6-nba-6-1990': [
    { name: 'Brad Daugherty',    position: 'C',  isAllStar: true,  stats: { points: 21.0, rebounds: 10.9, assists: 3.5, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.533, threePointPct: 0.000, freeThrowPct: 0.804 } },
    { name: 'Mark Price',        position: 'PG', isAllStar: true,  stats: { points: 18.9, rebounds: 2.6,  assists: 8.0, steals: 1.5, blocks: 0.1, fieldGoalPct: 0.472, threePointPct: 0.401, freeThrowPct: 0.948 } },
    { name: 'Larry Nance',       position: 'PF', isAllStar: true,  stats: { points: 17.0, rebounds: 8.0,  assists: 2.0, steals: 1.0, blocks: 2.1, fieldGoalPct: 0.550, threePointPct: 0.000, freeThrowPct: 0.770 } },
    { name: 'Ron Harper',        position: 'SG',                   stats: { points: 19.1, rebounds: 4.5,  assists: 5.2, steals: 2.2, blocks: 0.7, fieldGoalPct: 0.451, threePointPct: 0.300, freeThrowPct: 0.740 } },
    { name: 'Hot Rod Williams',  position: 'C',                    stats: { points: 14.0, rebounds: 7.5,  assists: 1.5, steals: 0.9, blocks: 2.0, fieldGoalPct: 0.520, threePointPct: 0.000, freeThrowPct: 0.740 } },
    { name: 'John Battle',       position: 'SG',                   stats: { points: 13.0, rebounds: 2.0,  assists: 3.5, steals: 0.8, blocks: 0.1, fieldGoalPct: 0.470, threePointPct: 0.330, freeThrowPct: 0.850 } },
    { name: 'Craig Ehlo',        position: 'SG',                   stats: { points: 10.0, rebounds: 4.5,  assists: 3.2, steals: 1.2, blocks: 0.3, fieldGoalPct: 0.460, threePointPct: 0.340, freeThrowPct: 0.770 } },
    { name: 'Steve Kerr',        position: 'PG',                   stats: { points: 6.0,  rebounds: 1.2,  assists: 2.5, steals: 0.7, blocks: 0.0, fieldGoalPct: 0.480, threePointPct: 0.420, freeThrowPct: 0.890 } },
    { name: 'Winston Bennett',   position: 'SF',                   stats: { points: 5.5,  rebounds: 4.0,  assists: 0.8, steals: 0.6, blocks: 0.3, fieldGoalPct: 0.460, threePointPct: 0.000, freeThrowPct: 0.700 } },
    { name: 'Darnell Valentine', position: 'PG',                   stats: { points: 4.0,  rebounds: 1.5,  assists: 3.0, steals: 0.7, blocks: 0.1, fieldGoalPct: 0.430, threePointPct: 0.280, freeThrowPct: 0.800 } },
  ],
  // Cavaliers Young LeBron Era 2005-2009
  '6-nba-6-2005': [
    { name: 'LeBron James',      position: 'SF', isAllStar: true,  stats: { points: 31.4, rebounds: 7.0,  assists: 8.6, steals: 1.6, blocks: 0.8, fieldGoalPct: 0.480, threePointPct: 0.335, freeThrowPct: 0.738 } },
    { name: 'Zydrunas Ilgauskas', position: 'C', isAllStar: true,  stats: { points: 16.9, rebounds: 7.8,  assists: 1.4, steals: 0.5, blocks: 1.8, fieldGoalPct: 0.490, threePointPct: 0.000, freeThrowPct: 0.790 } },
    { name: 'Larry Hughes',      position: 'SG',                   stats: { points: 16.0, rebounds: 4.5,  assists: 3.8, steals: 2.0, blocks: 0.5, fieldGoalPct: 0.420, threePointPct: 0.330, freeThrowPct: 0.800 } },
    { name: 'Drew Gooden',       position: 'PF',                   stats: { points: 12.0, rebounds: 8.5,  assists: 1.2, steals: 0.6, blocks: 0.5, fieldGoalPct: 0.470, threePointPct: 0.000, freeThrowPct: 0.720 } },
    { name: 'Sasha Pavlovic',    position: 'SF',                   stats: { points: 9.5,  rebounds: 2.8,  assists: 1.5, steals: 0.7, blocks: 0.3, fieldGoalPct: 0.440, threePointPct: 0.350, freeThrowPct: 0.780 } },
    { name: 'Donyell Marshall',  position: 'PF',                   stats: { points: 9.0,  rebounds: 6.0,  assists: 0.8, steals: 0.5, blocks: 0.6, fieldGoalPct: 0.450, threePointPct: 0.390, freeThrowPct: 0.740 } },
    { name: 'Eric Snow',         position: 'PG',                   stats: { points: 5.5,  rebounds: 2.5,  assists: 5.0, steals: 1.0, blocks: 0.1, fieldGoalPct: 0.420, threePointPct: 0.250, freeThrowPct: 0.780 } },
    { name: 'Boobie Gibson',     position: 'SG',                   stats: { points: 9.0,  rebounds: 2.0,  assists: 2.5, steals: 0.7, blocks: 0.2, fieldGoalPct: 0.430, threePointPct: 0.360, freeThrowPct: 0.850 } },
    { name: 'Anderson Varejao',  position: 'C',                    stats: { points: 8.0,  rebounds: 8.5,  assists: 1.0, steals: 0.7, blocks: 0.8, fieldGoalPct: 0.530, threePointPct: 0.000, freeThrowPct: 0.630 } },
    { name: 'Wally Szczerbiak',  position: 'SF',                   stats: { points: 11.0, rebounds: 2.8,  assists: 1.5, steals: 0.5, blocks: 0.2, fieldGoalPct: 0.462, threePointPct: 0.408, freeThrowPct: 0.860 } },
  ],
  // Raptors Championship Era 2015-2019
  '28-nba-28-2015': [
    { name: 'Kawhi Leonard',     position: 'SF', isLegend: true,   stats: { points: 26.6, rebounds: 7.3, assists: 3.3, steals: 1.8, blocks: 0.4, fieldGoalPct: 0.496, threePointPct: 0.370, freeThrowPct: 0.770 } },
    { name: 'Kyle Lowry',        position: 'PG', isLegend: true,   stats: { points: 16.2, rebounds: 4.7, assists: 7.4, steals: 1.5, blocks: 0.3, fieldGoalPct: 0.439, threePointPct: 0.361, freeThrowPct: 0.823 } },
    { name: 'Pascal Siakam',     position: 'PF', isAllStar: true,  stats: { points: 16.9, rebounds: 6.9, assists: 3.1, steals: 1.2, blocks: 0.9, fieldGoalPct: 0.492, threePointPct: 0.329, freeThrowPct: 0.732 } },
    { name: 'Marc Gasol',        position: 'C',  isLegend: true,   stats: { points: 8.8,  rebounds: 6.2, assists: 4.0, steals: 0.8, blocks: 1.5, fieldGoalPct: 0.415, threePointPct: 0.316, freeThrowPct: 0.800 } },
    { name: 'Serge Ibaka',       position: 'PF', isAllStar: true,  stats: { points: 15.4, rebounds: 8.0, assists: 1.4, steals: 0.7, blocks: 2.0, fieldGoalPct: 0.511, threePointPct: 0.323, freeThrowPct: 0.793 } },
    { name: 'Norman Powell',     position: 'SG',                   stats: { points: 10.9, rebounds: 2.8, assists: 1.7, steals: 0.8, blocks: 0.3, fieldGoalPct: 0.444, threePointPct: 0.360, freeThrowPct: 0.827 } },
    { name: 'Fred VanVleet',     position: 'PG',                   stats: { points: 11.0, rebounds: 3.7, assists: 6.0, steals: 1.9, blocks: 0.2, fieldGoalPct: 0.415, threePointPct: 0.377, freeThrowPct: 0.843 } },
    { name: 'Danny Green',       position: 'SG',                   stats: { points: 10.3, rebounds: 3.4, assists: 1.7, steals: 1.2, blocks: 0.3, fieldGoalPct: 0.434, threePointPct: 0.453, freeThrowPct: 0.827 } },
    { name: 'OG Anunoby',        position: 'SF',                   stats: { points: 8.0,  rebounds: 3.4, assists: 0.9, steals: 1.5, blocks: 0.6, fieldGoalPct: 0.478, threePointPct: 0.387, freeThrowPct: 0.721 } },
    { name: 'Delon Wright',      position: 'PG',                   stats: { points: 7.7,  rebounds: 3.4, assists: 3.7, steals: 1.4, blocks: 0.5, fieldGoalPct: 0.453, threePointPct: 0.318, freeThrowPct: 0.751 } },
  ],
};

const FIRST_NAMES = ['Marcus', 'DeShawn', 'Tyrell', 'Jordan', 'Andre', 'Kevin', 'Darius', 'Malik', 'Jalen', 'Trae', 'Donovan', 'Bam', 'Jaylen', 'Brandon', 'Miles', 'Gary', 'Isaiah', 'Chris', 'Paul', 'Tony', 'Dwight', 'Shawn', 'Allen', 'Grant', 'Chauncey'];
const LAST_NAMES  = ['Williams', 'Johnson', 'Mitchell', 'Davis', 'Brown', 'Thompson', 'Jackson', 'Harris', 'Robinson', 'Walker', 'Carter', 'Edwards', 'Green', 'Baker', 'Nelson', 'Hill', 'Thomas', 'Martin', 'Scott', 'Young', 'Collins', 'Parker', 'Adams', 'Moore', 'White'];

function fakeName(seed: number): string {
  return `${FIRST_NAMES[seed % FIRST_NAMES.length]} ${LAST_NAMES[(seed * 7 + 3) % LAST_NAMES.length]}`;
}

export const NBA_CURATED_ERA_KEYS = Object.keys(NBA_HISTORICAL_ROSTERS);

export async function fetchNBAPlayers(team: HistoricalTeam, era: Era, _apiKey?: string): Promise<Player[]> {
  // For current eras (2020+), try ESPN live roster first so trade news is reflected
  if (era.startYear >= LIVE_ERA_THRESHOLD) {
    const espnPlayers = await fetchESPNCurrentRoster(team, era);
    if (espnPlayers && espnPlayers.length >= 5) {
      return espnPlayers;
    }
  }

  // Check hardcoded historical roster
  const key = `${team.id}-${era.id}`;
  if (NBA_HISTORICAL_ROSTERS[key]) {
    return NBA_HISTORICAL_ROSTERS[key].map((hp, i) => {
      const p: Player = {
        id: `nba-hist-${team.id}-${i}`,
        name: hp.name,
        position: hp.position,
        positionGroup: 'offense',
        eraId: era.id,
        teamId: team.id,
        yearsWithTeam: `${era.startYear}–${era.endYear}`,
        stats: hp.stats,
        playerScore: 0,
        isLegend: hp.isLegend,
        isAllStar: hp.isAllStar,
      };
      p.playerScore = computePlayerScore(p, 'nba');
      return p;
    }).sort((a, b) => b.playerScore - a.playerScore);
  }

  // Final fallback: generate plausible-looking players
  return generateFallbackNBAPlayers(team, era);
}

// 15-player era pool (5 starters + 10 rotation players)
const STARTER_TEMPLATES: Array<{ pos: Player['position']; idx: number }> = [
  { pos: 'PG', idx: 0 }, { pos: 'SG', idx: 1 }, { pos: 'SF', idx: 2 }, { pos: 'PF', idx: 3 }, { pos: 'C',  idx: 4 },
  { pos: 'PG', idx: 5 }, { pos: 'SG', idx: 6 }, { pos: 'SF', idx: 7 }, { pos: 'PF', idx: 8 }, { pos: 'C',  idx: 9 },
  { pos: 'PG', idx: 10 }, { pos: 'SG', idx: 11 }, { pos: 'SF', idx: 12 }, { pos: 'PF', idx: 13 }, { pos: 'C', idx: 14 },
];

function generateFallbackNBAPlayers(team: HistoricalTeam, era: Era): Player[] {
  const teamSeed = parseInt(team.id, 10) * 13;

  return STARTER_TEMPLATES.map(({ pos, idx }) => {
    const s = teamSeed + idx;
    // Generate peak-season caliber stats (not average — this is their best year)
    const basePts = pos === 'PG' ? 22 : pos === 'SG' ? 20 : pos === 'SF' ? 19 : pos === 'PF' ? 17 : 15;
    const pts = basePts + (s % 12);
    const p: Player = {
      id: `nba-fb-${team.id}-${idx}`,
      name: fakeName(s),
      position: pos,
      positionGroup: 'offense',
      eraId: era.id,
      teamId: team.id,
      yearsWithTeam: `${era.startYear}–${era.endYear}`,
      stats: {
        points: pts,
        rebounds: (pos === 'C' ? 10 : pos === 'PF' ? 8 : 4) + (s * 3 % 4),
        assists: (pos === 'PG' ? 7 : pos === 'SG' ? 4 : 3) + (s * 5 % 4),
        steals: Math.round(((s % 18) / 10) * 10) / 10,
        blocks: pos === 'C' ? 1.5 + (s % 10) / 10 : Math.round(((s * 2 % 12) / 10) * 10) / 10,
        fieldGoalPct: (pos === 'C' ? 0.52 : 0.44) + (s * 7 % 10) / 100,
        threePointPct: (pos === 'PG' || pos === 'SG' ? 0.36 : 0.32) + (s * 11 % 8) / 100,
        freeThrowPct: 0.74 + (s * 9 % 18) / 100,
      },
      playerScore: 0,
    };
    p.playerScore = computePlayerScore(p, 'nba');
    return p;
  }).sort((a, b) => b.playerScore - a.playerScore);
}
