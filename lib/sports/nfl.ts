import type { Player, HistoricalTeam, Era } from '../types';
import { computePlayerScore } from '../algorithms/powerRating';

export const NFL_TEAMS: HistoricalTeam[] = [
  { id: '22', name: 'Cardinals',  city: 'Arizona',      abbreviation: 'ARI', sport: 'nfl', primaryColor: '#97233F', secondaryColor: '#000000' },
  { id: '1',  name: 'Falcons',    city: 'Atlanta',      abbreviation: 'ATL', sport: 'nfl', primaryColor: '#A71930', secondaryColor: '#000000' },
  { id: '33', name: 'Ravens',     city: 'Baltimore',    abbreviation: 'BAL', sport: 'nfl', primaryColor: '#241773', secondaryColor: '#000000' },
  { id: '2',  name: 'Bills',      city: 'Buffalo',      abbreviation: 'BUF', sport: 'nfl', primaryColor: '#00338D', secondaryColor: '#C60C30' },
  { id: '29', name: 'Panthers',   city: 'Carolina',     abbreviation: 'CAR', sport: 'nfl', primaryColor: '#0085CA', secondaryColor: '#101820' },
  { id: '3',  name: 'Bears',      city: 'Chicago',      abbreviation: 'CHI', sport: 'nfl', primaryColor: '#0B162A', secondaryColor: '#C83803' },
  { id: '4',  name: 'Bengals',    city: 'Cincinnati',   abbreviation: 'CIN', sport: 'nfl', primaryColor: '#FB4F14', secondaryColor: '#000000' },
  { id: '5',  name: 'Browns',     city: 'Cleveland',    abbreviation: 'CLE', sport: 'nfl', primaryColor: '#311D00', secondaryColor: '#FF3C00' },
  { id: '6',  name: 'Cowboys',    city: 'Dallas',       abbreviation: 'DAL', sport: 'nfl', primaryColor: '#003594', secondaryColor: '#041E42' },
  { id: '7',  name: 'Broncos',    city: 'Denver',       abbreviation: 'DEN', sport: 'nfl', primaryColor: '#FB4F14', secondaryColor: '#002244' },
  { id: '8',  name: 'Lions',      city: 'Detroit',      abbreviation: 'DET', sport: 'nfl', primaryColor: '#0076B6', secondaryColor: '#B0B7BC' },
  { id: '9',  name: 'Packers',    city: 'Green Bay',    abbreviation: 'GB',  sport: 'nfl', primaryColor: '#203731', secondaryColor: '#FFB612' },
  { id: '34', name: 'Texans',     city: 'Houston',      abbreviation: 'HOU', sport: 'nfl', primaryColor: '#03202F', secondaryColor: '#A71930' },
  { id: '11', name: 'Colts',      city: 'Indianapolis', abbreviation: 'IND', sport: 'nfl', primaryColor: '#002C5F', secondaryColor: '#A2AAAD' },
  { id: '30', name: 'Jaguars',    city: 'Jacksonville', abbreviation: 'JAX', sport: 'nfl', primaryColor: '#101820', secondaryColor: '#D7A22A' },
  { id: '12', name: 'Chiefs',     city: 'Kansas City',  abbreviation: 'KC',  sport: 'nfl', primaryColor: '#E31837', secondaryColor: '#FFB81C' },
  { id: '13', name: 'Raiders',    city: 'Las Vegas',    abbreviation: 'LV',  sport: 'nfl', primaryColor: '#000000', secondaryColor: '#A5ACAF' },
  { id: '24', name: 'Chargers',   city: 'Los Angeles',  abbreviation: 'LAC', sport: 'nfl', primaryColor: '#0080C6', secondaryColor: '#FFC20E' },
  { id: '14', name: 'Rams',       city: 'Los Angeles',  abbreviation: 'LAR', sport: 'nfl', primaryColor: '#003594', secondaryColor: '#FFA300' },
  { id: '15', name: 'Dolphins',   city: 'Miami',        abbreviation: 'MIA', sport: 'nfl', primaryColor: '#008E97', secondaryColor: '#FC4C02' },
  { id: '16', name: 'Vikings',    city: 'Minnesota',    abbreviation: 'MIN', sport: 'nfl', primaryColor: '#4F2683', secondaryColor: '#FFC62F' },
  { id: '17', name: 'Patriots',   city: 'New England',  abbreviation: 'NE',  sport: 'nfl', primaryColor: '#002244', secondaryColor: '#C60C30' },
  { id: '18', name: 'Saints',     city: 'New Orleans',  abbreviation: 'NO',  sport: 'nfl', primaryColor: '#D3BC8D', secondaryColor: '#101820' },
  { id: '19', name: 'Giants',     city: 'New York',     abbreviation: 'NYG', sport: 'nfl', primaryColor: '#0B2265', secondaryColor: '#A71930' },
  { id: '20', name: 'Jets',       city: 'New York',     abbreviation: 'NYJ', sport: 'nfl', primaryColor: '#125740', secondaryColor: '#000000' },
  { id: '21', name: 'Eagles',     city: 'Philadelphia', abbreviation: 'PHI', sport: 'nfl', primaryColor: '#004C54', secondaryColor: '#A5ACAF' },
  { id: '23', name: 'Steelers',   city: 'Pittsburgh',   abbreviation: 'PIT', sport: 'nfl', primaryColor: '#101820', secondaryColor: '#FFB612' },
  { id: '25', name: '49ers',      city: 'San Francisco',abbreviation: 'SF',  sport: 'nfl', primaryColor: '#AA0000', secondaryColor: '#B3995D' },
  { id: '26', name: 'Seahawks',   city: 'Seattle',      abbreviation: 'SEA', sport: 'nfl', primaryColor: '#002244', secondaryColor: '#69BE28' },
  { id: '27', name: 'Buccaneers', city: 'Tampa Bay',    abbreviation: 'TB',  sport: 'nfl', primaryColor: '#D50A0A', secondaryColor: '#FF7900' },
  { id: '10', name: 'Titans',     city: 'Tennessee',    abbreviation: 'TEN', sport: 'nfl', primaryColor: '#0C2340', secondaryColor: '#4B92DB' },
  { id: '28', name: 'Commanders', city: 'Washington',   abbreviation: 'WAS', sport: 'nfl', primaryColor: '#5A1414', secondaryColor: '#FFB612' },
];

// ─── Hardcoded historical rosters (real players, pre-API era) ─────────────────
// Key: `${teamId}-${eraId}`
type HistoricalPlayer = { name: string; position: Player['position']; group: Player['positionGroup']; stats: Player['stats']; isLegend?: boolean };

const HISTORICAL_ROSTERS: Record<string, HistoricalPlayer[]> = {
  // Steel Curtain Steelers 1975-1979
  '23-nfl-23-1975': [
    { name: 'Terry Bradshaw',   position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 2915, passingTDs: 28, passerRating: 84, interceptions: 14 } },
    { name: 'Franco Harris',    position: 'RB', group: 'offense', isLegend: true,  stats: { rushingYards: 1246, rushingTDs: 10, receptions: 33 } },
    { name: 'Rocky Bleier',     position: 'RB', group: 'offense',                  stats: { rushingYards: 740, rushingTDs: 5, receptions: 24 } },
    { name: 'Lynn Swann',       position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 880, receivingTDs: 11, receptions: 49 } },
    { name: 'John Stallworth',  position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 798, receivingTDs: 9, receptions: 41 } },
    { name: 'Randy Grossman',   position: 'TE', group: 'offense',                  stats: { receivingYards: 345, receivingTDs: 3, receptions: 28 } },
    { name: 'Roy Gerela',       position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Mean Joe Greene',  position: 'DT', group: 'defense', isLegend: true,  stats: { sacks: 10, tackles: 52 } },
    { name: 'Ernie Holmes',     position: 'DT', group: 'defense',                  stats: { sacks: 6, tackles: 44 } },
    { name: 'L.C. Greenwood',   position: 'DE', group: 'defense',                  stats: { sacks: 11, tackles: 48 } },
    { name: 'Dwight White',     position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 40 } },
    { name: 'Jack Ham',         position: 'LB', group: 'defense', isLegend: true,  stats: { sacks: 5, tackles: 95, interceptions: 4 } },
    { name: 'Jack Lambert',     position: 'LB', group: 'defense', isLegend: true,  stats: { sacks: 6, tackles: 120, interceptions: 5, forcedFumbles: 3 } },
    { name: 'Andy Russell',     position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 88, interceptions: 2 } },
    { name: 'Mel Blount',       position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 7, tackles: 62, passDeflections: 12 } },
    { name: 'J.T. Thomas',      position: 'CB', group: 'defense',                  stats: { interceptions: 4, tackles: 55, passDeflections: 8 } },
    { name: 'Mike Wagner',      position: 'S',  group: 'defense',                  stats: { interceptions: 5, tackles: 70 } },
    { name: 'Glen Edwards',     position: 'S',  group: 'defense',                  stats: { interceptions: 4, tackles: 60 } },
  ],
  // Montana 49ers 1980-1984
  '25-nfl-25-1980': [
    { name: 'Joe Montana',      position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 3521, passingTDs: 26, passerRating: 102, interceptions: 8 } },
    { name: 'Roger Craig',      position: 'RB', group: 'offense', isLegend: true,  stats: { rushingYards: 1050, rushingTDs: 9, receptions: 66 } },
    { name: 'Tom Rathman',      position: 'RB', group: 'offense',                  stats: { rushingYards: 420, rushingTDs: 6, receptions: 41 } },
    { name: 'Jerry Rice',       position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1570, receivingTDs: 22, receptions: 106 } },
    { name: 'John Taylor',      position: 'WR', group: 'offense',                  stats: { receivingYards: 1011, receivingTDs: 10, receptions: 60 } },
    { name: 'Dwight Clark',     position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 840, receivingTDs: 6, receptions: 70 } },
    { name: 'Russ Francis',     position: 'TE', group: 'offense',                  stats: { receivingYards: 665, receivingTDs: 7, receptions: 44 } },
    { name: 'Mike Cofer',       position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Charles Haley',    position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 15, tackles: 55, forcedFumbles: 4 } },
    { name: 'Jeff Stover',      position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 48 } },
    { name: 'Michael Carter',   position: 'DT', group: 'defense',                  stats: { sacks: 5, tackles: 60 } },
    { name: 'Pete Kugler',      position: 'DT', group: 'defense',                  stats: { sacks: 3, tackles: 44 } },
    { name: 'Keena Turner',     position: 'LB', group: 'defense',                  stats: { sacks: 5, tackles: 100, interceptions: 2 } },
    { name: 'Matt Millen',      position: 'LB', group: 'defense',                  stats: { sacks: 3, tackles: 95 } },
    { name: 'Riki Ellison',     position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 88 } },
    { name: 'Ronnie Lott',      position: 'S',  group: 'defense', isLegend: true,  stats: { interceptions: 9, tackles: 80, passDeflections: 15 } },
    { name: 'Carlton Williamson',position: 'S', group: 'defense',                  stats: { interceptions: 5, tackles: 72 } },
    { name: 'Eric Wright',      position: 'CB', group: 'defense',                  stats: { interceptions: 7, tackles: 58, passDeflections: 11 } },
    { name: 'Dwight Hicks',     position: 'CB', group: 'defense',                  stats: { interceptions: 6, tackles: 64 } },
  ],
  // Montana/Young 49ers 1985-1989
  '25-nfl-25-1985': [
    { name: 'Joe Montana',      position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 3521, passingTDs: 26, passerRating: 102, interceptions: 8 } },
    { name: 'Roger Craig',      position: 'RB', group: 'offense', isLegend: true,  stats: { rushingYards: 1050, rushingTDs: 9, receptions: 66 } },
    { name: 'Tom Rathman',      position: 'RB', group: 'offense',                  stats: { rushingYards: 420, rushingTDs: 6, receptions: 41 } },
    { name: 'Jerry Rice',       position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1570, receivingTDs: 22, receptions: 106 } },
    { name: 'John Taylor',      position: 'WR', group: 'offense',                  stats: { receivingYards: 1011, receivingTDs: 10, receptions: 60 } },
    { name: 'Dwight Clark',     position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 840, receivingTDs: 6, receptions: 70 } },
    { name: 'Russ Francis',     position: 'TE', group: 'offense',                  stats: { receivingYards: 665, receivingTDs: 7, receptions: 44 } },
    { name: 'Mike Cofer',       position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Charles Haley',    position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 15, tackles: 55, forcedFumbles: 4 } },
    { name: 'Jeff Stover',      position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 48 } },
    { name: 'Michael Carter',   position: 'DT', group: 'defense',                  stats: { sacks: 5, tackles: 60 } },
    { name: 'Pete Kugler',      position: 'DT', group: 'defense',                  stats: { sacks: 3, tackles: 44 } },
    { name: 'Keena Turner',     position: 'LB', group: 'defense',                  stats: { sacks: 5, tackles: 100, interceptions: 2 } },
    { name: 'Matt Millen',      position: 'LB', group: 'defense',                  stats: { sacks: 3, tackles: 95 } },
    { name: 'Riki Ellison',     position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 88 } },
    { name: 'Ronnie Lott',      position: 'S',  group: 'defense', isLegend: true,  stats: { interceptions: 9, tackles: 80, passDeflections: 15 } },
    { name: 'Carlton Williamson',position: 'S', group: 'defense',                  stats: { interceptions: 5, tackles: 72 } },
    { name: 'Eric Wright',      position: 'CB', group: 'defense',                  stats: { interceptions: 7, tackles: 58, passDeflections: 11 } },
    { name: 'Dwight Hicks',     position: 'CB', group: 'defense',                  stats: { interceptions: 6, tackles: 64 } },
  ],
  // Dallas Dynasty 1990-1994
  '6-nfl-6-1990': [
    { name: 'Troy Aikman',      position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 3200, passingTDs: 23, passerRating: 94, interceptions: 10 } },
    { name: 'Emmitt Smith',     position: 'RB', group: 'offense', isLegend: true,  stats: { rushingYards: 1484, rushingTDs: 21, receptions: 50 } },
    { name: 'Daryl Johnston',   position: 'RB', group: 'offense',                  stats: { rushingYards: 225, rushingTDs: 3, receptions: 44 } },
    { name: 'Michael Irvin',    position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1241, receivingTDs: 9, receptions: 88 } },
    { name: 'Alvin Harper',     position: 'WR', group: 'offense',                  stats: { receivingYards: 771, receivingTDs: 8, receptions: 48 } },
    { name: 'Kevin Williams',   position: 'WR', group: 'offense',                  stats: { receivingYards: 490, receivingTDs: 4, receptions: 36 } },
    { name: 'Jay Novacek',      position: 'TE', group: 'offense',                  stats: { receivingYards: 705, receivingTDs: 5, receptions: 68 } },
    { name: 'Lin Elliott',      position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Charles Haley',    position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 13, tackles: 50, forcedFumbles: 5 } },
    { name: 'Tony Tolbert',     position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 45 } },
    { name: 'Russell Maryland', position: 'DT', group: 'defense',                  stats: { sacks: 5, tackles: 55 } },
    { name: 'Leon Lett',        position: 'DT', group: 'defense',                  stats: { sacks: 6, tackles: 50 } },
    { name: 'Ken Norton Jr.',   position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 115, interceptions: 2 } },
    { name: 'Robert Jones',     position: 'LB', group: 'defense',                  stats: { sacks: 5, tackles: 100 } },
    { name: 'Darrin Smith',     position: 'LB', group: 'defense',                  stats: { sacks: 3, tackles: 88 } },
    { name: 'Deion Sanders',    position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 8, tackles: 48, passDeflections: 18 } },
    { name: 'Kevin Smith',      position: 'CB', group: 'defense',                  stats: { interceptions: 5, tackles: 60, passDeflections: 10 } },
    { name: 'Darren Woodson',   position: 'S',  group: 'defense', isLegend: true,  stats: { interceptions: 5, tackles: 105 } },
    { name: 'Thomas Everett',   position: 'S',  group: 'defense',                  stats: { interceptions: 4, tackles: 78 } },
  ],
  // Dallas Cowboys 1995-1999
  '6-nfl-6-1995': [
    { name: 'Troy Aikman',      position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 3304, passingTDs: 23, passerRating: 93, interceptions: 12 } },
    { name: 'Emmitt Smith',     position: 'RB', group: 'offense', isLegend: true,  stats: { rushingYards: 1773, rushingTDs: 25, receptions: 62 } },
    { name: 'Daryl Johnston',   position: 'RB', group: 'offense',                  stats: { rushingYards: 186, rushingTDs: 4, receptions: 43 } },
    { name: 'Michael Irvin',    position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1603, receivingTDs: 10, receptions: 111 } },
    { name: 'Alvin Harper',     position: 'WR', group: 'offense',                  stats: { receivingYards: 564, receivingTDs: 3, receptions: 34 } },
    { name: 'Eric Bjornson',    position: 'TE', group: 'offense',                  stats: { receivingYards: 470, receivingTDs: 3, receptions: 41 } },
    { name: 'Deion Sanders',    position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 6, tackles: 42, passDeflections: 20 } },
    { name: 'Kevin Smith',      position: 'CB', group: 'defense',                  stats: { interceptions: 4, tackles: 58, passDeflections: 9 } },
    { name: 'Darren Woodson',   position: 'S',  group: 'defense', isLegend: true,  stats: { interceptions: 6, tackles: 110 } },
    { name: 'Brock Marion',     position: 'S',  group: 'defense',                  stats: { interceptions: 4, tackles: 72 } },
    { name: 'Charles Haley',    position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 10, tackles: 44, forcedFumbles: 3 } },
    { name: 'Tony Tolbert',     position: 'DE', group: 'defense',                  stats: { sacks: 7, tackles: 40 } },
    { name: 'Leon Lett',        position: 'DT', group: 'defense',                  stats: { sacks: 5, tackles: 48 } },
    { name: 'Chad Hennings',    position: 'DT', group: 'defense',                  stats: { sacks: 4, tackles: 42 } },
    { name: 'Robert Jones',     position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 95 } },
    { name: 'Darrin Smith',     position: 'LB', group: 'defense',                  stats: { sacks: 3, tackles: 82 } },
    { name: 'Dixon Edwards',    position: 'LB', group: 'defense',                  stats: { sacks: 2, tackles: 90 } },
  ],
  // Belichick Dynasty I (Patriots 2000-2004)
  '17-nfl-17-2000': [
    { name: 'Tom Brady',        position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 4806, passingTDs: 50, passerRating: 117, interceptions: 8 } },
    { name: 'Corey Dillon',     position: 'RB', group: 'offense',                  stats: { rushingYards: 1635, rushingTDs: 12, receptions: 15 } },
    { name: 'Kevin Faulk',      position: 'RB', group: 'offense',                  stats: { rushingYards: 390, rushingTDs: 3, receptions: 49 } },
    { name: 'Randy Moss',       position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1493, receivingTDs: 23, receptions: 98 } },
    { name: 'Wes Welker',       position: 'WR', group: 'offense',                  stats: { receivingYards: 1175, receivingTDs: 8, receptions: 112 } },
    { name: 'Troy Brown',       position: 'WR', group: 'offense',                  stats: { receivingYards: 890, receivingTDs: 6, receptions: 83 } },
    { name: 'Ben Watson',       position: 'TE', group: 'offense',                  stats: { receivingYards: 540, receivingTDs: 4, receptions: 44 } },
    { name: 'Adam Vinatieri',   position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Richard Seymour',  position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 10, tackles: 55, forcedFumbles: 3 } },
    { name: 'Jarvis Green',     position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 45 } },
    { name: 'Vince Wilfork',    position: 'DT', group: 'defense', isLegend: true,  stats: { sacks: 4, tackles: 68, forcedFumbles: 2 } },
    { name: 'Ted Washington',   position: 'DT', group: 'defense',                  stats: { sacks: 3, tackles: 55 } },
    { name: 'Mike Vrabel',      position: 'LB', group: 'defense',                  stats: { sacks: 9, tackles: 98, interceptions: 2 } },
    { name: 'Tedy Bruschi',     position: 'LB', group: 'defense',                  stats: { sacks: 5, tackles: 120, interceptions: 4, forcedFumbles: 2 } },
    { name: 'Willie McGinest',  position: 'LB', group: 'defense',                  stats: { sacks: 11, tackles: 88, forcedFumbles: 4 } },
    { name: 'Ty Law',           position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 10, tackles: 55, passDeflections: 16 } },
    { name: 'Asante Samuel',    position: 'CB', group: 'defense',                  stats: { interceptions: 9, tackles: 48, passDeflections: 14 } },
    { name: 'Rodney Harrison',  position: 'S',  group: 'defense',                  stats: { interceptions: 5, tackles: 95 } },
    { name: 'Eugene Wilson',    position: 'S',  group: 'defense',                  stats: { interceptions: 4, tackles: 72 } },
  ],
  // Belichick Dynasty I (Patriots 2005-2009)
  '17-nfl-17-2005': [
    { name: 'Tom Brady',        position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 4806, passingTDs: 50, passerRating: 117, interceptions: 8 } },
    { name: 'Corey Dillon',     position: 'RB', group: 'offense',                  stats: { rushingYards: 1635, rushingTDs: 12, receptions: 15 } },
    { name: 'Kevin Faulk',      position: 'RB', group: 'offense',                  stats: { rushingYards: 390, rushingTDs: 3, receptions: 49 } },
    { name: 'Randy Moss',       position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1493, receivingTDs: 23, receptions: 98 } },
    { name: 'Wes Welker',       position: 'WR', group: 'offense',                  stats: { receivingYards: 1175, receivingTDs: 8, receptions: 112 } },
    { name: 'Troy Brown',       position: 'WR', group: 'offense',                  stats: { receivingYards: 890, receivingTDs: 6, receptions: 83 } },
    { name: 'Ben Watson',       position: 'TE', group: 'offense',                  stats: { receivingYards: 540, receivingTDs: 4, receptions: 44 } },
    { name: 'Adam Vinatieri',   position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Richard Seymour',  position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 10, tackles: 55, forcedFumbles: 3 } },
    { name: 'Jarvis Green',     position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 45 } },
    { name: 'Vince Wilfork',    position: 'DT', group: 'defense', isLegend: true,  stats: { sacks: 4, tackles: 68, forcedFumbles: 2 } },
    { name: 'Ted Washington',   position: 'DT', group: 'defense',                  stats: { sacks: 3, tackles: 55 } },
    { name: 'Mike Vrabel',      position: 'LB', group: 'defense',                  stats: { sacks: 9, tackles: 98, interceptions: 2 } },
    { name: 'Tedy Bruschi',     position: 'LB', group: 'defense',                  stats: { sacks: 5, tackles: 120, interceptions: 4, forcedFumbles: 2 } },
    { name: 'Willie McGinest',  position: 'LB', group: 'defense',                  stats: { sacks: 11, tackles: 88, forcedFumbles: 4 } },
    { name: 'Ty Law',           position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 10, tackles: 55, passDeflections: 16 } },
    { name: 'Asante Samuel',    position: 'CB', group: 'defense',                  stats: { interceptions: 9, tackles: 48, passDeflections: 14 } },
    { name: 'Rodney Harrison',  position: 'S',  group: 'defense',                  stats: { interceptions: 5, tackles: 95 } },
    { name: 'Eugene Wilson',    position: 'S',  group: 'defense',                  stats: { interceptions: 4, tackles: 72 } },
  ],
  // Belichick Dynasty II (Patriots 2010-2014)
  '17-nfl-17-2010': [
    { name: 'Tom Brady',        position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 4770, passingTDs: 40, passerRating: 112, interceptions: 9 } },
    { name: 'Stevan Ridley',    position: 'RB', group: 'offense',                  stats: { rushingYards: 1263, rushingTDs: 12, receptions: 9 } },
    { name: 'Danny Woodhead',   position: 'RB', group: 'offense',                  stats: { rushingYards: 350, rushingTDs: 5, receptions: 62 } },
    { name: 'Wes Welker',       position: 'WR', group: 'offense',                  stats: { receivingYards: 1569, receivingTDs: 9, receptions: 122 } },
    { name: 'Julian Edelman',   position: 'WR', group: 'offense',                  stats: { receivingYards: 1056, receivingTDs: 7, receptions: 105 } },
    { name: 'Brandon Lloyd',    position: 'WR', group: 'offense',                  stats: { receivingYards: 911, receivingTDs: 4, receptions: 74 } },
    { name: 'Rob Gronkowski',   position: 'TE', group: 'offense', isLegend: true,  stats: { receivingYards: 1327, receivingTDs: 17, receptions: 90 } },
    { name: 'Stephen Gostkowski', position: 'K', group: 'offense',                 stats: {} },
    { name: 'Chandler Jones',   position: 'DE', group: 'defense',                  stats: { sacks: 12, tackles: 48, forcedFumbles: 5 } },
    { name: 'Rob Ninkovich',    position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 52 } },
    { name: 'Vince Wilfork',    position: 'DT', group: 'defense', isLegend: true,  stats: { sacks: 5, tackles: 70, forcedFumbles: 3 } },
    { name: 'Tommy Kelly',      position: 'DT', group: 'defense',                  stats: { sacks: 4, tackles: 50 } },
    { name: 'Jerod Mayo',       position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 138, interceptions: 2 } },
    { name: 'Dont\'a Hightower',position: 'LB', group: 'defense',                  stats: { sacks: 7, tackles: 105, forcedFumbles: 3 } },
    { name: 'Brandon Spikes',   position: 'LB', group: 'defense',                  stats: { sacks: 3, tackles: 98 } },
    { name: 'Darrelle Revis',   position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 5, tackles: 55, passDeflections: 19 } },
    { name: 'Malcolm Butler',   position: 'CB', group: 'defense',                  stats: { interceptions: 5, tackles: 60, passDeflections: 15 } },
    { name: 'Devin McCourty',   position: 'S',  group: 'defense', isLegend: true,  stats: { interceptions: 7, tackles: 80 } },
    { name: 'Patrick Chung',    position: 'S',  group: 'defense',                  stats: { interceptions: 3, tackles: 78 } },
  ],
  // Belichick Dynasty II (Patriots 2015-2019)
  '17-nfl-17-2015': [
    { name: 'Tom Brady',        position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 4770, passingTDs: 40, passerRating: 112, interceptions: 9 } },
    { name: 'Stevan Ridley',    position: 'RB', group: 'offense',                  stats: { rushingYards: 1263, rushingTDs: 12, receptions: 9 } },
    { name: 'Danny Woodhead',   position: 'RB', group: 'offense',                  stats: { rushingYards: 350, rushingTDs: 5, receptions: 62 } },
    { name: 'Wes Welker',       position: 'WR', group: 'offense',                  stats: { receivingYards: 1569, receivingTDs: 9, receptions: 122 } },
    { name: 'Julian Edelman',   position: 'WR', group: 'offense',                  stats: { receivingYards: 1056, receivingTDs: 7, receptions: 105 } },
    { name: 'Brandon Lloyd',    position: 'WR', group: 'offense',                  stats: { receivingYards: 911, receivingTDs: 4, receptions: 74 } },
    { name: 'Rob Gronkowski',   position: 'TE', group: 'offense', isLegend: true,  stats: { receivingYards: 1327, receivingTDs: 17, receptions: 90 } },
    { name: 'Stephen Gostkowski', position: 'K', group: 'offense',                 stats: {} },
    { name: 'Chandler Jones',   position: 'DE', group: 'defense',                  stats: { sacks: 12, tackles: 48, forcedFumbles: 5 } },
    { name: 'Rob Ninkovich',    position: 'DE', group: 'defense',                  stats: { sacks: 8, tackles: 52 } },
    { name: 'Vince Wilfork',    position: 'DT', group: 'defense', isLegend: true,  stats: { sacks: 5, tackles: 70, forcedFumbles: 3 } },
    { name: 'Tommy Kelly',      position: 'DT', group: 'defense',                  stats: { sacks: 4, tackles: 50 } },
    { name: 'Jerod Mayo',       position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 138, interceptions: 2 } },
    { name: 'Dont\'a Hightower',position: 'LB', group: 'defense',                  stats: { sacks: 7, tackles: 105, forcedFumbles: 3 } },
    { name: 'Brandon Spikes',   position: 'LB', group: 'defense',                  stats: { sacks: 3, tackles: 98 } },
    { name: 'Darrelle Revis',   position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 5, tackles: 55, passDeflections: 19 } },
    { name: 'Malcolm Butler',   position: 'CB', group: 'defense',                  stats: { interceptions: 5, tackles: 60, passDeflections: 15 } },
    { name: 'Devin McCourty',   position: 'S',  group: 'defense', isLegend: true,  stats: { interceptions: 7, tackles: 80 } },
    { name: 'Patrick Chung',    position: 'S',  group: 'defense',                  stats: { interceptions: 3, tackles: 78 } },
  ],
  // Mahomes Chiefs 2015-2019
  '12-nfl-12-2015': [
    { name: 'Alex Smith',       position: 'QB', group: 'offense',                  stats: { passingYards: 3346, passingTDs: 26, passerRating: 104, interceptions: 5 } },
    { name: 'Kareem Hunt',      position: 'RB', group: 'offense',                  stats: { rushingYards: 1327, rushingTDs: 8, receptions: 53 } },
    { name: 'Spencer Ware',     position: 'RB', group: 'offense',                  stats: { rushingYards: 921, rushingTDs: 3, receptions: 33 } },
    { name: 'Tyreek Hill',      position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1183, receivingTDs: 7, receptions: 75 } },
    { name: 'Jeremy Maclin',    position: 'WR', group: 'offense',                  stats: { receivingYards: 1088, receivingTDs: 8, receptions: 87 } },
    { name: 'Albert Wilson',    position: 'WR', group: 'offense',                  stats: { receivingYards: 554, receivingTDs: 3, receptions: 42 } },
    { name: 'Travis Kelce',     position: 'TE', group: 'offense', isLegend: true,  stats: { receivingYards: 1125, receivingTDs: 4, receptions: 85 } },
    { name: 'Cairo Santos',     position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Justin Houston',   position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 22, tackles: 55, forcedFumbles: 6 } },
    { name: 'Dee Ford',         position: 'DE', group: 'defense',                  stats: { sacks: 13, tackles: 40 } },
    { name: 'Dontari Poe',      position: 'DT', group: 'defense',                  stats: { sacks: 7, tackles: 58 } },
    { name: 'Bennie Logan',     position: 'DT', group: 'defense',                  stats: { sacks: 3, tackles: 44 } },
    { name: 'Derrick Johnson',  position: 'LB', group: 'defense', isLegend: true,  stats: { sacks: 4, tackles: 122, interceptions: 3 } },
    { name: 'Josh Mauga',       position: 'LB', group: 'defense',                  stats: { sacks: 2, tackles: 98 } },
    { name: 'Tamba Hali',       position: 'LB', group: 'defense',                  stats: { sacks: 8, tackles: 60, forcedFumbles: 3 } },
    { name: 'Marcus Peters',    position: 'CB', group: 'defense', isLegend: true,  stats: { interceptions: 8, tackles: 48, passDeflections: 15 } },
    { name: 'Phillip Gaines',   position: 'CB', group: 'defense',                  stats: { interceptions: 3, tackles: 55, passDeflections: 8 } },
    { name: 'Eric Berry',       position: 'S',  group: 'defense', isLegend: true,  stats: { interceptions: 5, tackles: 78 } },
    { name: 'Ron Parker',       position: 'S',  group: 'defense',                  stats: { interceptions: 4, tackles: 65 } },
  ],
  // Mahomes Chiefs 2020-2024
  '12-nfl-12-2020': [
    { name: 'Patrick Mahomes',  position: 'QB', group: 'offense', isLegend: true,  stats: { passingYards: 5250, passingTDs: 50, passerRating: 113, interceptions: 12 } },
    { name: 'Isiah Pacheco',    position: 'RB', group: 'offense',                  stats: { rushingYards: 935, rushingTDs: 7, receptions: 20 } },
    { name: 'Jerick McKinnon',  position: 'RB', group: 'offense',                  stats: { rushingYards: 215, rushingTDs: 9, receptions: 56 } },
    { name: 'Tyreek Hill',      position: 'WR', group: 'offense', isLegend: true,  stats: { receivingYards: 1276, receivingTDs: 9, receptions: 90 } },
    { name: 'Mecole Hardman',   position: 'WR', group: 'offense',                  stats: { receivingYards: 711, receivingTDs: 6, receptions: 59 } },
    { name: 'Marquez Valdes-Scantling', position: 'WR', group: 'offense',          stats: { receivingYards: 858, receivingTDs: 5, receptions: 47 } },
    { name: 'Travis Kelce',     position: 'TE', group: 'offense', isLegend: true,  stats: { receivingYards: 1338, receivingTDs: 12, receptions: 110 } },
    { name: 'Harrison Butker',  position: 'K',  group: 'offense',                  stats: {} },
    { name: 'Chris Jones',      position: 'DE', group: 'defense', isLegend: true,  stats: { sacks: 15, tackles: 50, forcedFumbles: 4 } },
    { name: 'Frank Clark',      position: 'DE', group: 'defense',                  stats: { sacks: 9, tackles: 44 } },
    { name: 'Derrick Nnadi',    position: 'DT', group: 'defense',                  stats: { sacks: 3, tackles: 55 } },
    { name: 'Khalen Saunders',  position: 'DT', group: 'defense',                  stats: { sacks: 2, tackles: 44 } },
    { name: 'Willie Gay Jr.',   position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 78, interceptions: 2, forcedFumbles: 2 } },
    { name: 'Nick Bolton',      position: 'LB', group: 'defense',                  stats: { sacks: 3, tackles: 131 } },
    { name: 'Drue Tranquill',   position: 'LB', group: 'defense',                  stats: { sacks: 4, tackles: 105 } },
    { name: 'L\'Jarius Sneed',  position: 'CB', group: 'defense',                  stats: { interceptions: 4, tackles: 62, passDeflections: 12 } },
    { name: 'Trent McDuffie',   position: 'CB', group: 'defense',                  stats: { interceptions: 3, tackles: 55, passDeflections: 10 } },
    { name: 'Justin Reid',      position: 'S',  group: 'defense',                  stats: { interceptions: 4, tackles: 82 } },
    { name: 'Juan Thornhill',   position: 'S',  group: 'defense',                  stats: { interceptions: 5, tackles: 70 } },
  ],
};

export const NFL_CURATED_ERA_KEYS = Object.keys(HISTORICAL_ROSTERS);

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

interface ESPNAthlete {
  id: string;
  displayName: string;
  position?: { abbreviation: string };
  statistics?: { displayValue?: string; name?: string }[];
}

function nflPositionMap(pos: string): { position: Player['position']; group: Player['positionGroup'] } {
  const offense: Record<string, Player['position']> = { QB: 'QB', RB: 'RB', HB: 'RB', FB: 'RB', WR: 'WR', TE: 'TE', K: 'K', P: 'K' };
  const defense: Record<string, Player['position']> = { DE: 'DE', DT: 'DT', NT: 'DT', OLB: 'LB', MLB: 'LB', ILB: 'LB', LB: 'LB', CB: 'CB', FS: 'S', SS: 'S', S: 'S', DB: 'CB' };
  if (offense[pos]) return { position: offense[pos], group: 'offense' };
  if (defense[pos]) return { position: defense[pos], group: 'defense' };
  return { position: 'LB', group: 'defense' };
}

function extractNFLStats(position: Player['position'], stats: Record<string, number>): Player['stats'] {
  switch (position) {
    case 'QB':  return { passingYards: stats['passingYards'] ?? 0, passingTDs: stats['passingTouchdowns'] ?? 0, passerRating: stats['QBRating'] ?? 85, interceptions: stats['interceptions'] ?? 0 };
    case 'RB':  return { rushingYards: stats['rushingYards'] ?? 0, rushingTDs: stats['rushingTouchdowns'] ?? 0, receptions: stats['receptions'] ?? 0 };
    case 'WR':
    case 'TE':  return { receivingYards: stats['receivingYards'] ?? 0, receivingTDs: stats['receivingTouchdowns'] ?? 0, receptions: stats['receptions'] ?? 0 };
    case 'DE':
    case 'DT':  return { sacks: stats['sacks'] ?? 0, tackles: stats['totalTackles'] ?? 0, forcedFumbles: stats['fumblesForced'] ?? 0 };
    case 'LB':  return { sacks: stats['sacks'] ?? 0, tackles: stats['totalTackles'] ?? 0, interceptions: stats['interceptions'] ?? 0, forcedFumbles: stats['fumblesForced'] ?? 0 };
    case 'CB':
    case 'S':   return { interceptions: stats['interceptions'] ?? 0, tackles: stats['totalTackles'] ?? 0, passDeflections: stats['passesDefended'] ?? 0 };
    default:    return {};
  }
}

async function fetchESPNRoster(teamId: string, year: number): Promise<Player[]> {
  try {
    const res = await fetch(`${ESPN_BASE}/teams/${teamId}/roster?season=${year}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const athletes: ESPNAthlete[] = [
      ...(data.athletes?.[0]?.items ?? []),
      ...(data.athletes?.[1]?.items ?? []),
      ...(data.athletes?.[2]?.items ?? []),
    ];

    return athletes.map(athlete => {
      const pos = athlete.position?.abbreviation ?? 'LB';
      const { position, group } = nflPositionMap(pos);
      const statsMap: Record<string, number> = {};
      for (const s of athlete.statistics ?? []) {
        if (s.name && s.displayValue) {
          const v = parseFloat(s.displayValue.replace(',', ''));
          if (!isNaN(v)) statsMap[s.name] = v;
        }
      }
      const p: Player = {
        id: `nfl-${athlete.id}-${year}`,
        name: athlete.displayName,
        position,
        positionGroup: group,
        yearsWithTeam: `${year}`,
        stats: extractNFLStats(position, statsMap),
        playerScore: 0,
      };
      p.playerScore = computePlayerScore(p, 'nfl');
      return p;
    }).filter(p => p.name && p.name.trim().length > 0);
  } catch {
    return [];
  }
}

export async function fetchNFLPlayers(team: HistoricalTeam, era: Era): Promise<Player[]> {
  // Check hardcoded historical roster first
  const key = `${team.id}-${era.id}`;
  if (HISTORICAL_ROSTERS[key]) {
    return HISTORICAL_ROSTERS[key].map((hp, i) => {
      const p: Player = {
        id: `nfl-hist-${team.id}-${i}`,
        name: hp.name,
        position: hp.position,
        positionGroup: hp.group,
        eraId: era.id,
        teamId: team.id,
        yearsWithTeam: `${era.startYear}–${era.endYear}`,
        stats: hp.stats,
        playerScore: 0,
        isLegend: hp.isLegend,
      };
      p.playerScore = computePlayerScore(p, 'nfl');
      return p;
    }).sort((a, b) => b.playerScore - a.playerScore);
  }

  // ESPN API: sample up to 4 evenly-spaced years across the era
  const years = eraYears(era.startYear, era.endYear, 4);
  const byName = new Map<string, Player>();

  await Promise.all(years.map(async year => {
    const players = await fetchESPNRoster(team.id, year);
    for (const p of players) {
      const existing = byName.get(p.name);
      if (!existing || p.playerScore > existing.playerScore) {
        p.eraId = era.id;
        p.teamId = team.id;
        p.yearsWithTeam = `${era.startYear}–${era.endYear}`;
        byName.set(p.name, p);
      }
    }
  }));

  const all = Array.from(byName.values()).sort((a, b) => b.playerScore - a.playerScore);
  if (all.length < 8) return generateFallbackNFLPlayers(team, era);
  return all;
}

function eraYears(start: number, end: number, n: number): number[] {
  const clampedEnd = Math.min(end, 2024);
  const clampedStart = Math.max(start, 1970);
  if (clampedStart >= clampedEnd) return [clampedEnd];
  const step = (clampedEnd - clampedStart) / Math.max(n - 1, 1);
  return Array.from({ length: n }, (_, i) => Math.round(clampedStart + i * step));
}

const NFL_FIRST = ['Dak', 'Lamar', 'Josh', 'Patrick', 'Justin', 'Jalen', 'Trevor', 'Tua', 'Sam', 'Marcus', 'Tyreek', 'Davante', 'Stefon', 'Travis', 'Dalton', 'Micah', 'Myles', 'Von', 'Aaron', 'Richard', 'Derrick', 'Christian', 'Nick', 'Roquan', 'Chandler'];
const NFL_LAST  = ['Smith', 'Jackson', 'Allen', 'Mahomes', 'Herbert', 'Hurts', 'Lawrence', 'Tagovailoa', 'Carr', 'Jones', 'Hill', 'Adams', 'Diggs', 'Kelce', 'Schultz', 'Parsons', 'Garrett', 'Miller', 'Donald', 'Sherman', 'Henry', 'McCaffrey', 'Chubb', 'Walker', 'Jones'];

function nflFakeName(seed: number): string {
  return `${NFL_FIRST[seed % NFL_FIRST.length]} ${NFL_LAST[(seed * 7 + 5) % NFL_LAST.length]}`;
}

function generateFallbackNFLPlayers(team: HistoricalTeam, era: Era): Player[] {
  const templates: Array<{ pos: Player['position']; group: Player['positionGroup']; idx: number }> = [
    { pos: 'QB', group: 'offense', idx: 0 },
    { pos: 'RB', group: 'offense', idx: 1 }, { pos: 'RB', group: 'offense', idx: 2 },
    { pos: 'WR', group: 'offense', idx: 3 }, { pos: 'WR', group: 'offense', idx: 4 }, { pos: 'WR', group: 'offense', idx: 5 },
    { pos: 'TE', group: 'offense', idx: 6 }, { pos: 'TE', group: 'offense', idx: 7 },
    { pos: 'K',  group: 'offense', idx: 8 },
    { pos: 'DE', group: 'defense', idx: 9  }, { pos: 'DE', group: 'defense', idx: 10 },
    { pos: 'DT', group: 'defense', idx: 11 }, { pos: 'DT', group: 'defense', idx: 12 },
    { pos: 'LB', group: 'defense', idx: 13 }, { pos: 'LB', group: 'defense', idx: 14 }, { pos: 'LB', group: 'defense', idx: 15 },
    { pos: 'CB', group: 'defense', idx: 16 }, { pos: 'CB', group: 'defense', idx: 17 },
    { pos: 'S',  group: 'defense', idx: 18 }, { pos: 'S',  group: 'defense', idx: 19 },
  ];
  const teamSeed = parseInt(team.id, 10) * 11;
  return templates.map(({ pos, group, idx }) => {
    const s = teamSeed + idx;
    let stats: Player['stats'] = {};
    if (pos === 'QB') stats = { passingYards: 3500 + (s * 97 % 1500), passingTDs: 25 + (s * 13 % 15), passerRating: 85 + (s * 7 % 15), interceptions: 6 + (s % 8) };
    else if (pos === 'RB') stats = { rushingYards: 900 + (s * 83 % 700), rushingTDs: 8 + (s * 11 % 7), receptions: 30 + (s % 30) };
    else if (pos === 'WR') stats = { receivingYards: 800 + (s * 73 % 700), receivingTDs: 6 + (s * 9 % 8), receptions: 60 + (s % 40) };
    else if (pos === 'TE') stats = { receivingYards: 600 + (s * 61 % 500), receivingTDs: 5 + (s % 6), receptions: 50 + (s % 30) };
    else if (pos === 'DE') stats = { sacks: 10 + (s * 3 % 10), tackles: 50 + (s * 5 % 30), forcedFumbles: 1 + s % 4 };
    else if (pos === 'DT') stats = { sacks: 5 + (s * 2 % 6), tackles: 45 + (s * 4 % 25), forcedFumbles: s % 3 };
    else if (pos === 'LB') stats = { sacks: 4 + (s % 5), tackles: 100 + (s * 7 % 50), interceptions: s % 3, forcedFumbles: 1 + s % 3 };
    else if (pos === 'CB' || pos === 'S') stats = { interceptions: 2 + (s * 3 % 5), tackles: 65 + (s * 6 % 35), passDeflections: 6 + (s % 8) };
    const p: Player = { id: `nfl-fb-${team.id}-${idx}`, name: nflFakeName(s), position: pos, positionGroup: group, eraId: era.id, teamId: team.id, yearsWithTeam: `${era.startYear}–${era.endYear}`, stats, playerScore: 0 };
    p.playerScore = computePlayerScore(p, 'nfl');
    return p;
  }).sort((a, b) => b.playerScore - a.playerScore);
}
