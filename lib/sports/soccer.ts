import type { Player, HistoricalTeam, Era } from '../types';
import { computePlayerScore } from '../algorithms/powerRating';
import { generateTeamEras } from '../constants';

export const EPL_TEAMS: HistoricalTeam[] = [
  { id: 'mu',  name: 'Manchester United', city: 'Manchester', abbreviation: 'MUN', sport: 'epl', primaryColor: '#DA291C', secondaryColor: '#FBE122' },
  { id: 'ars', name: 'Arsenal',           city: 'London',     abbreviation: 'ARS', sport: 'epl', primaryColor: '#EF0107', secondaryColor: '#063672' },
  { id: 'che', name: 'Chelsea',           city: 'London',     abbreviation: 'CHE', sport: 'epl', primaryColor: '#034694', secondaryColor: '#034694' },
  { id: 'mc',  name: 'Manchester City',   city: 'Manchester', abbreviation: 'MCI', sport: 'epl', primaryColor: '#6CABDD', secondaryColor: '#1C2C5B' },
  { id: 'liv', name: 'Liverpool',         city: 'Liverpool',  abbreviation: 'LIV', sport: 'epl', primaryColor: '#C8102E', secondaryColor: '#F6EB61' },
  { id: 'lei', name: 'Leicester City',    city: 'Leicester',  abbreviation: 'LEI', sport: 'epl', primaryColor: '#003090', secondaryColor: '#FDBE11' },
];

export const WCUP_TEAMS: HistoricalTeam[] = [
  { id: 'bra', name: 'Brazil',      city: 'Brazil',      abbreviation: 'BRA', sport: 'wcup', primaryColor: '#009C3B', secondaryColor: '#FFDF00' },
  { id: 'ger', name: 'Germany',     city: 'Germany',     abbreviation: 'GER', sport: 'wcup', primaryColor: '#000000', secondaryColor: '#DD0000' },
  { id: 'arg', name: 'Argentina',   city: 'Argentina',   abbreviation: 'ARG', sport: 'wcup', primaryColor: '#74ACDF', secondaryColor: '#FFFFFF' },
  { id: 'fra', name: 'France',      city: 'France',      abbreviation: 'FRA', sport: 'wcup', primaryColor: '#002395', secondaryColor: '#ED2939' },
  { id: 'ita', name: 'Italy',       city: 'Italy',       abbreviation: 'ITA', sport: 'wcup', primaryColor: '#0066CC', secondaryColor: '#FFFFFF' },
  { id: 'esp', name: 'Spain',       city: 'Spain',       abbreviation: 'ESP', sport: 'wcup', primaryColor: '#AA151B', secondaryColor: '#F1BF00' },
  { id: 'eng', name: 'England',     city: 'England',     abbreviation: 'ENG', sport: 'wcup', primaryColor: '#FFFFFF',  secondaryColor: '#CF081F' },
  { id: 'ned', name: 'Netherlands', city: 'Netherlands', abbreviation: 'NED', sport: 'wcup', primaryColor: '#FF6600', secondaryColor: '#FFFFFF' },
];

type SoccerPlayer = {
  name: string;
  position: Player['position'];
  positionGroup: Player['positionGroup'];
  stats: Player['stats'];
  isLegend?: boolean;
  isAllStar?: boolean;
};

const SOCCER_ROSTERS: Record<string, SoccerPlayer[]> = {
  // ── Man United Treble 1998-2002 ─────────────────────────────────────────────
  'mu-epl-mu-1997': [
    { name: 'Peter Schmeichel', position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 35, cleanSheets: 17, savePctSoc: 0.77 } },
    { name: 'Gary Neville',     position: 'RB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 35, tacklesPG: 2.4 } },
    { name: 'Jaap Stam',        position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 34, tacklesPG: 3.2 } },
    { name: 'Ronny Johnsen',    position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 28, tacklesPG: 2.8 } },
    { name: 'Denis Irwin',      position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 35, tacklesPG: 2.2, soccerGoals: 2 } },
    { name: 'Roy Keane',        position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 33, soccerGoals: 5, soccerAssists: 5, tacklesPG: 3.8 } },
    { name: 'Paul Scholes',     position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 33, soccerGoals: 9, soccerAssists: 7, keyPasses: 2.2 } },
    { name: 'David Beckham',    position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 34, soccerGoals: 6, soccerAssists: 10, keyPasses: 2.6 } },
    { name: 'Ryan Giggs',       position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 34, soccerGoals: 8, soccerAssists: 9, keyPasses: 2.4 } },
    { name: 'Dwight Yorke',     position: 'ST',   positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 32, soccerGoals: 18, soccerAssists: 9 } },
    { name: 'Andy Cole',        position: 'CF_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 32, soccerGoals: 17, soccerAssists: 6 } },
  ],
  // ── Man United Ferguson Peak 2007-2009 ──────────────────────────────────────
  'mu-epl-mu-2007': [
    { name: 'Edwin van der Sar', position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 34, cleanSheets: 18, savePctSoc: 0.79 } },
    { name: 'Gary Neville',      position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 20, tacklesPG: 2.2 } },
    { name: 'Rio Ferdinand',     position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 34, tacklesPG: 3.0 } },
    { name: 'Nemanja Vidić',     position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 34, tacklesPG: 3.4 } },
    { name: 'Patrice Evra',      position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 35, tacklesPG: 2.5 } },
    { name: 'Michael Carrick',   position: 'CDM',  positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 35, soccerGoals: 2, soccerAssists: 4, tacklesPG: 2.8 } },
    { name: 'Paul Scholes',      position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 28, soccerGoals: 7, soccerAssists: 6, keyPasses: 2.3 } },
    { name: 'Ryan Giggs',        position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 31, soccerGoals: 6, soccerAssists: 8, keyPasses: 2.2 } },
    { name: 'Nani',              position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 30, soccerGoals: 8, soccerAssists: 9 } },
    { name: 'Wayne Rooney',      position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 35, soccerGoals: 18, soccerAssists: 10 } },
    { name: 'Cristiano Ronaldo', position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 35, soccerGoals: 31, soccerAssists: 9, keyPasses: 2.8 } },
  ],
  // ── Arsenal Invincibles 2003-2004 ────────────────────────────────────────────
  'ars-epl-ars-2002': [
    { name: 'Jens Lehmann',     position: 'GK',   positionGroup: 'goalie',  isAllStar: true, stats: { soccerApps: 38, cleanSheets: 15, savePctSoc: 0.74 } },
    { name: 'Lauren',           position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 36, tacklesPG: 2.3 } },
    { name: 'Sol Campbell',     position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 35, tacklesPG: 3.1 } },
    { name: 'Kolo Touré',       position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 37, tacklesPG: 2.9 } },
    { name: 'Ashley Cole',      position: 'LB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 38, tacklesPG: 2.8, soccerGoals: 1 } },
    { name: 'Patrick Vieira',   position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 38, soccerGoals: 3, soccerAssists: 6, tacklesPG: 4.2 } },
    { name: 'Gilberto Silva',   position: 'CM_S', positionGroup: 'offense',                  stats: { soccerApps: 38, soccerGoals: 1, tacklesPG: 3.2 } },
    { name: 'Robert Pires',     position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 33, soccerGoals: 14, soccerAssists: 9, keyPasses: 2.5 } },
    { name: 'Freddie Ljungberg',position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 30, soccerGoals: 7, soccerAssists: 6 } },
    { name: 'Thierry Henry',    position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 37, soccerGoals: 30, soccerAssists: 10, keyPasses: 3.2 } },
    { name: 'Dennis Bergkamp',  position: 'CF_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 28, soccerGoals: 8, soccerAssists: 11, keyPasses: 3.6 } },
  ],
  // ── Chelsea Mourinho 2004-2006 ──────────────────────────────────────────────
  'che-epl-che-2004': [
    { name: 'Petr Čech',        position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 35, cleanSheets: 24, savePctSoc: 0.80 } },
    { name: 'Paulo Ferreira',   position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 29, tacklesPG: 2.0 } },
    { name: 'John Terry',       position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 38, soccerGoals: 3, tacklesPG: 3.5 } },
    { name: 'William Gallas',   position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 32, tacklesPG: 2.8 } },
    { name: 'Wayne Bridge',     position: 'LB_S', positionGroup: 'defense',                  stats: { soccerApps: 27, tacklesPG: 2.2 } },
    { name: 'Claude Makélélé',  position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 38, tacklesPG: 4.6 } },
    { name: 'Frank Lampard',    position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 38, soccerGoals: 16, soccerAssists: 8, keyPasses: 2.4 } },
    { name: 'Joe Cole',         position: 'CAM',  positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 30, soccerGoals: 8, soccerAssists: 7, keyPasses: 2.0 } },
    { name: 'Arjen Robben',     position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 24, soccerGoals: 7, soccerAssists: 6, keyPasses: 2.6 } },
    { name: 'Damien Duff',      position: 'LW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 28, soccerGoals: 6, soccerAssists: 7 } },
    { name: 'Didier Drogba',    position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 35, soccerGoals: 16, soccerAssists: 8 } },
  ],
  // ── Manchester City Guardiola 2017-2022 ──────────────────────────────────────
  'mc-epl-mc-2017': [
    { name: 'Ederson',          position: 'GK',   positionGroup: 'goalie',  isAllStar: true, stats: { soccerApps: 38, cleanSheets: 20, savePctSoc: 0.78 } },
    { name: 'Kyle Walker',      position: 'RB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 34, tacklesPG: 1.8 } },
    { name: 'Rúben Dias',       position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 35, tacklesPG: 3.2 } },
    { name: 'Aymeric Laporte',  position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 30, tacklesPG: 2.8, soccerGoals: 2 } },
    { name: 'João Cancelo',     position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 34, soccerGoals: 3, soccerAssists: 5, keyPasses: 2.0 } },
    { name: 'Rodri',            position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 35, soccerGoals: 2, soccerAssists: 4, tacklesPG: 3.8 } },
    { name: 'Kevin De Bruyne',  position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 30, soccerGoals: 10, soccerAssists: 16, keyPasses: 3.6 } },
    { name: 'Bernardo Silva',   position: 'CM_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 37, soccerGoals: 6, soccerAssists: 8, keyPasses: 2.0 } },
    { name: 'Riyad Mahrez',     position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 30, soccerGoals: 11, soccerAssists: 7 } },
    { name: 'Phil Foden',       position: 'LW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 35, soccerGoals: 14, soccerAssists: 9 } },
    { name: 'Erling Haaland',   position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 35, soccerGoals: 36, soccerAssists: 7 } },
  ],
  // ── Liverpool Klopp 2018-2020 ────────────────────────────────────────────────
  'liv-epl-liv-2017': [
    { name: 'Alisson Becker',       position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 38, cleanSheets: 21, savePctSoc: 0.80 } },
    { name: 'Trent Alexander-Arnold',position: 'RB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 38, soccerGoals: 4, soccerAssists: 13, keyPasses: 2.5 } },
    { name: 'Virgil van Dijk',       position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 38, soccerGoals: 4, tacklesPG: 2.8 } },
    { name: 'Joël Matip',            position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 32, tacklesPG: 2.5 } },
    { name: 'Andrew Robertson',      position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 38, soccerGoals: 2, soccerAssists: 11 } },
    { name: 'Fabinho',               position: 'CDM',  positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 35, tacklesPG: 3.5 } },
    { name: 'Jordan Henderson',      position: 'CM_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 36, soccerGoals: 5, soccerAssists: 6 } },
    { name: 'Georginio Wijnaldum',   position: 'CAM',  positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 38, soccerGoals: 7, soccerAssists: 4, keyPasses: 1.8 } },
    { name: 'Mohamed Salah',         position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 38, soccerGoals: 23, soccerAssists: 13, keyPasses: 2.8 } },
    { name: 'Roberto Firmino',       position: 'CF_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 34, soccerGoals: 12, soccerAssists: 8, keyPasses: 2.0 } },
    { name: 'Sadio Mané',            position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 36, soccerGoals: 22, soccerAssists: 8 } },
  ],
  // ── Leicester City Miracle 2015-2016 ─────────────────────────────────────────
  'lei-epl-lei-2015': [
    { name: 'Kasper Schmeichel',  position: 'GK',   positionGroup: 'goalie',  isAllStar: true, stats: { soccerApps: 38, cleanSheets: 15, savePctSoc: 0.75 } },
    { name: 'Danny Simpson',      position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 34, tacklesPG: 2.0 } },
    { name: 'Wes Morgan',         position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 38, tacklesPG: 2.8 } },
    { name: 'Robert Huth',        position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 36, tacklesPG: 3.0 } },
    { name: 'Christian Fuchs',    position: 'LB_S', positionGroup: 'defense',                  stats: { soccerApps: 37, tacklesPG: 2.1 } },
    { name: 'N\'Golo Kanté',      position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 37, soccerGoals: 1, soccerAssists: 2, tacklesPG: 5.1 } },
    { name: 'Danny Drinkwater',   position: 'CM_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 36, soccerGoals: 5, soccerAssists: 5 } },
    { name: 'Marc Albrighton',    position: 'RW_S', positionGroup: 'offense',                  stats: { soccerApps: 33, soccerGoals: 4, soccerAssists: 6 } },
    { name: 'Riyad Mahrez',       position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 37, soccerGoals: 17, soccerAssists: 11, keyPasses: 3.0 } },
    { name: 'Jamie Vardy',        position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 36, soccerGoals: 24, soccerAssists: 5 } },
    { name: 'Shinji Okazaki',     position: 'CF_S', positionGroup: 'offense',                  stats: { soccerApps: 36, soccerGoals: 5, soccerAssists: 4 } },
  ],

  // ── WORLD CUP TEAMS ──────────────────────────────────────────────────────────

  // ── Brazil 1970 ──────────────────────────────────────────────────────────────
  'bra-wcup-bra-1970': [
    { name: 'Félix',             position: 'GK',   positionGroup: 'goalie',                   stats: { soccerApps: 6, cleanSheets: 2, savePctSoc: 0.72 } },
    { name: 'Carlos Alberto',    position: 'RB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 1, tacklesPG: 2.5 } },
    { name: 'Brito',             position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 6, tacklesPG: 3.0 } },
    { name: 'Wilson Piazza',     position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 6, tacklesPG: 2.8 } },
    { name: 'Everaldo',          position: 'LB_S', positionGroup: 'defense',                  stats: { soccerApps: 6, tacklesPG: 2.3 } },
    { name: 'Clodoaldo',         position: 'CDM',  positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 1, soccerAssists: 3, tacklesPG: 3.0 } },
    { name: 'Gérson',            position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 5, soccerGoals: 1, soccerAssists: 4, keyPasses: 2.8 } },
    { name: 'Rivelino',          position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 3, soccerAssists: 4 } },
    { name: 'Jairzinho',         position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 7, soccerAssists: 2 } },
    { name: 'Tostão',            position: 'CF_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 5, soccerGoals: 2, soccerAssists: 5 } },
    { name: 'Pelé',              position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 4, soccerAssists: 6, keyPasses: 3.5 } },
  ],
  // ── Brazil 2002 ──────────────────────────────────────────────────────────────
  'bra-wcup-bra-2002': [
    { name: 'Marcos',            position: 'GK',   positionGroup: 'goalie',  isAllStar: true, stats: { soccerApps: 7, cleanSheets: 4, savePctSoc: 0.76 } },
    { name: 'Cafu',              position: 'RB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 2.5, soccerAssists: 3 } },
    { name: 'Lúcio',             position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 3.0 } },
    { name: 'Roque Júnior',      position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 2.8 } },
    { name: 'Roberto Carlos',    position: 'LB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 2, tacklesPG: 2.0 } },
    { name: 'Gilberto Silva',    position: 'CDM',  positionGroup: 'defense',                  stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 3.5 } },
    { name: 'Juninho Pernambucano',position:'CM_S',positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 2, soccerAssists: 3, keyPasses: 2.2 } },
    { name: 'Ronaldinho',        position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 2, soccerAssists: 5, keyPasses: 3.8 } },
    { name: 'Rivaldo',           position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 8, soccerAssists: 3 } },
    { name: 'Ronaldo',           position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 8, soccerAssists: 2 } },
    { name: 'Bebeto',            position: 'CF_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 5, soccerGoals: 3, soccerAssists: 2 } },
  ],
  // ── Germany 2014 ─────────────────────────────────────────────────────────────
  'ger-wcup-ger-2014': [
    { name: 'Manuel Neuer',       position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 7, cleanSheets: 4, savePctSoc: 0.84 } },
    { name: 'Philipp Lahm',       position: 'RB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 0, soccerAssists: 3, tacklesPG: 2.8 } },
    { name: 'Mats Hummels',       position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 3.2 } },
    { name: 'Jérôme Boateng',     position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 3.0 } },
    { name: 'Benedikt Höwedes',   position: 'LB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 2.5 } },
    { name: 'Bastian Schweinsteiger',position:'CDM',positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 2, tacklesPG: 3.5 } },
    { name: 'Toni Kroos',         position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 4, keyPasses: 3.8 } },
    { name: 'Mesut Özil',         position: 'CAM',  positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 0, soccerAssists: 3, keyPasses: 3.2 } },
    { name: 'Thomas Müller',      position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 5, soccerAssists: 5 } },
    { name: 'Miroslav Klose',     position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 4, soccerAssists: 1 } },
    { name: 'André Schürrle',     position: 'LW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 3, soccerAssists: 2 } },
  ],
  // ── Germany 1990 ─────────────────────────────────────────────────────────────
  'ger-wcup-ger-1990': [
    { name: 'Bodo Illgner',       position: 'GK',   positionGroup: 'goalie',                   stats: { soccerApps: 7, cleanSheets: 4, savePctSoc: 0.76 } },
    { name: 'Guido Buchwald',     position: 'RB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 2.6 } },
    { name: 'Klaus Augenthaler',  position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 3.0 } },
    { name: 'Jürgen Kohler',      position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 3.2 } },
    { name: 'Andreas Brehme',     position: 'LB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 2, tacklesPG: 2.4 } },
    { name: 'Thomas Häßler',      position: 'CDM',  positionGroup: 'defense',                  stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 2.8 } },
    { name: 'Lothar Matthäus',    position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 4, soccerAssists: 3, keyPasses: 2.8 } },
    { name: 'Pierre Littbarski',  position: 'RW_S', positionGroup: 'offense',                  stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 3 } },
    { name: 'Karl-Heinz Riedle',  position: 'LW_S', positionGroup: 'offense',                  stats: { soccerApps: 6, soccerGoals: 2, soccerAssists: 2 } },
    { name: 'Rudi Völler',        position: 'CF_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 3, soccerAssists: 2 } },
    { name: 'Jürgen Klinsmann',   position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 4, soccerAssists: 2 } },
  ],
  // ── Argentina 1986 ───────────────────────────────────────────────────────────
  'arg-wcup-arg-1985': [
    { name: 'Nery Pumpido',       position: 'GK',   positionGroup: 'goalie',                   stats: { soccerApps: 6, cleanSheets: 3, savePctSoc: 0.74 } },
    { name: 'José Luis Brown',    position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 6, soccerGoals: 1, tacklesPG: 2.9 } },
    { name: 'Óscar Ruggeri',      position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 6, tacklesPG: 3.2 } },
    { name: 'Julio Olarticoechea',position: 'LB_S', positionGroup: 'defense',                  stats: { soccerApps: 6, tacklesPG: 2.4 } },
    { name: 'Oscar Garré',        position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 5, tacklesPG: 2.2 } },
    { name: 'Sergio Batista',     position: 'CDM',  positionGroup: 'defense',                  stats: { soccerApps: 6, tacklesPG: 3.5 } },
    { name: 'Hector Enrique',     position: 'CM_S', positionGroup: 'offense',                  stats: { soccerApps: 6, soccerGoals: 0, soccerAssists: 3 } },
    { name: 'Diego Maradona',     position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 5, soccerAssists: 5, keyPasses: 4.2 } },
    { name: 'Jorge Valdano',      position: 'LW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 5, soccerAssists: 2 } },
    { name: 'Pedro Pasculli',     position: 'CF_S', positionGroup: 'offense',                  stats: { soccerApps: 5, soccerGoals: 2, soccerAssists: 2 } },
    { name: 'Jorge Burruchaga',   position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 3, soccerAssists: 4 } },
  ],
  // ── Argentina 2022 ───────────────────────────────────────────────────────────
  'arg-wcup-arg-2020': [
    { name: 'Emiliano Martínez',  position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 7, cleanSheets: 4, savePctSoc: 0.82 } },
    { name: 'Nahuel Molina',      position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 2.2 } },
    { name: 'Cristian Romero',    position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 3.2 } },
    { name: 'Nicolás Otamendi',   position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 3.0 } },
    { name: 'Nicolás Tagliafico', position: 'LB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 2.2 } },
    { name: 'Rodrigo De Paul',    position: 'CDM',  positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 0, soccerAssists: 3, tacklesPG: 3.2 } },
    { name: 'Enzo Fernández',     position: 'CM_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 1, soccerAssists: 2, keyPasses: 2.0 } },
    { name: 'Lionel Messi',       position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 7, soccerAssists: 3, keyPasses: 4.0 } },
    { name: 'Ángel Di María',     position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 3, soccerAssists: 5 } },
    { name: 'Julián Álvarez',     position: 'ST',   positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 4, soccerAssists: 2 } },
    { name: 'Lautaro Martínez',   position: 'CF_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 5, soccerGoals: 3, soccerAssists: 2 } },
  ],
  // ── France 1998 ──────────────────────────────────────────────────────────────
  'fra-wcup-fra-1997': [
    { name: 'Fabien Barthez',     position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 7, cleanSheets: 5, savePctSoc: 0.78 } },
    { name: 'Lilian Thuram',      position: 'RB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 2, tacklesPG: 2.8 } },
    { name: 'Marcel Desailly',    position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, tacklesPG: 3.5 } },
    { name: 'Laurent Blanc',      position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 1, tacklesPG: 3.0 } },
    { name: 'Bixente Lizarazu',   position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 6, tacklesPG: 2.5 } },
    { name: 'Didier Deschamps',   position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerAssists: 2, tacklesPG: 4.0 } },
    { name: 'Emmanuel Petit',     position: 'CM_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 2 } },
    { name: 'Zinedine Zidane',    position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 2, soccerAssists: 3, keyPasses: 3.8 } },
    { name: 'Youri Djorkaeff',    position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 3, soccerAssists: 2 } },
    { name: 'Thierry Henry',      position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 3, soccerAssists: 2 } },
    { name: 'David Trezeguet',    position: 'ST',   positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 5, soccerGoals: 2, soccerAssists: 1 } },
  ],
  // ── France 2018 ──────────────────────────────────────────────────────────────
  'fra-wcup-fra-2017': [
    { name: 'Hugo Lloris',        position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 7, cleanSheets: 4, savePctSoc: 0.79 } },
    { name: 'Benjamin Pavard',    position: 'RB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 2.4 } },
    { name: 'Raphaël Varane',     position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 3.2 } },
    { name: 'Samuel Umtiti',      position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 2.8 } },
    { name: 'Lucas Hernandez',    position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 2.5 } },
    { name: 'N\'Golo Kanté',      position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerAssists: 2, tacklesPG: 5.0 } },
    { name: 'Blaise Matuidi',     position: 'CM_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 0, soccerAssists: 3 } },
    { name: 'Antoine Griezmann',  position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 3, soccerAssists: 2, keyPasses: 2.8 } },
    { name: 'Ousmane Dembélé',    position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 5, soccerGoals: 1, soccerAssists: 2 } },
    { name: 'Kylian Mbappé',      position: 'LW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 4, soccerAssists: 2, keyPasses: 2.5 } },
    { name: 'Olivier Giroud',     position: 'ST',   positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 3 } },
  ],
  // ── Italy 1982 ───────────────────────────────────────────────────────────────
  'ita-wcup-ita-1982': [
    { name: 'Dino Zoff',          position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 7, cleanSheets: 4, savePctSoc: 0.77 } },
    { name: 'Claudio Gentile',    position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 3.5 } },
    { name: 'Gaetano Scirea',     position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, tacklesPG: 3.0 } },
    { name: 'Fulvio Collovati',   position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 2.8 } },
    { name: 'Antonio Cabrini',    position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 2.5 } },
    { name: 'Gabriele Oriali',    position: 'CDM',  positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 3.0 } },
    { name: 'Marco Tardelli',     position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 2, soccerAssists: 2 } },
    { name: 'Bruno Conti',        position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 4, keyPasses: 2.2 } },
    { name: 'Francesco Graziani', position: 'LW_S', positionGroup: 'offense',                  stats: { soccerApps: 6, soccerGoals: 2, soccerAssists: 2 } },
    { name: 'Paolo Rossi',        position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 6, soccerAssists: 2 } },
    { name: 'Giancarlo Antognoni',position: 'CAM',  positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 5, soccerGoals: 1, soccerAssists: 3, keyPasses: 2.8 } },
  ],
  // ── Spain 2010 ───────────────────────────────────────────────────────────────
  'esp-wcup-esp-2010': [
    { name: 'Iker Casillas',      position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 7, cleanSheets: 5, savePctSoc: 0.83 } },
    { name: 'Sergio Ramos',       position: 'RB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 0, soccerAssists: 2, tacklesPG: 3.3 } },
    { name: 'Carles Puyol',       position: 'CB_S', positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 1, tacklesPG: 3.5 } },
    { name: 'Gerard Piqué',       position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 3.0 } },
    { name: 'Joan Capdevila',     position: 'LB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, soccerAssists: 2, tacklesPG: 2.2 } },
    { name: 'Sergio Busquets',    position: 'CDM',  positionGroup: 'defense', isLegend: true,  stats: { soccerApps: 7, tacklesPG: 3.8 } },
    { name: 'Xavi Hernández',     position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 0, soccerAssists: 4, keyPasses: 4.5 } },
    { name: 'Andrés Iniesta',     position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 3, keyPasses: 3.8 } },
    { name: 'David Silva',        position: 'LW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 6, soccerGoals: 1, soccerAssists: 3, keyPasses: 2.5 } },
    { name: 'David Villa',        position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 5, soccerAssists: 3 } },
    { name: 'Xabi Alonso',        position: 'RW_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 3, tacklesPG: 2.5 } },
  ],
  // ── England 1990 ─────────────────────────────────────────────────────────────
  'eng-wcup-eng-1990': [
    { name: 'Peter Shilton',      position: 'GK',   positionGroup: 'goalie',  isLegend: true,  stats: { soccerApps: 7, cleanSheets: 4, savePctSoc: 0.76 } },
    { name: 'Paul Parker',        position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 6, tacklesPG: 2.3 } },
    { name: 'Des Walker',         position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 3.2 } },
    { name: 'Mark Wright',        position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 3.0 } },
    { name: 'Stuart Pearce',      position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, tacklesPG: 2.8, soccerGoals: 1 } },
    { name: 'David Platt',        position: 'CDM',  positionGroup: 'defense',                  stats: { soccerApps: 7, soccerGoals: 3, soccerAssists: 2, tacklesPG: 2.5 } },
    { name: 'Paul Gascoigne',     position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 6, soccerGoals: 1, soccerAssists: 4, keyPasses: 3.5 } },
    { name: 'Chris Waddle',       position: 'RW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 4 } },
    { name: 'Steve McMahon',      position: 'CM_S', positionGroup: 'offense',                  stats: { soccerApps: 5, soccerGoals: 0, soccerAssists: 1 } },
    { name: 'Gary Lineker',       position: 'ST',   positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 4, soccerAssists: 2 } },
    { name: 'Peter Beardsley',    position: 'CF_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, soccerAssists: 3 } },
  ],
  // ── Netherlands 1974 ─────────────────────────────────────────────────────────
  'ned-wcup-ned-1974': [
    { name: 'Jan Jongbloed',      position: 'GK',   positionGroup: 'goalie',                   stats: { soccerApps: 7, cleanSheets: 3, savePctSoc: 0.74 } },
    { name: 'Wim Suurbier',       position: 'RB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 2.3 } },
    { name: 'Arie Haan',          position: 'CB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 2, tacklesPG: 2.8 } },
    { name: 'Wim Rijsbergen',     position: 'CB_S', positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 2.5 } },
    { name: 'Ruud Krol',          position: 'LB_S', positionGroup: 'defense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 1, tacklesPG: 2.5 } },
    { name: 'Wim Jansen',         position: 'CDM',  positionGroup: 'defense',                  stats: { soccerApps: 7, tacklesPG: 3.0 } },
    { name: 'Johan Neeskens',     position: 'CM_S', positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 5, soccerAssists: 3, keyPasses: 2.5 } },
    { name: 'Johan Cruyff',       position: 'CAM',  positionGroup: 'offense', isLegend: true,  stats: { soccerApps: 7, soccerGoals: 3, soccerAssists: 5, keyPasses: 4.0 } },
    { name: 'Johnny Rep',         position: 'RW_S', positionGroup: 'offense',                  stats: { soccerApps: 7, soccerGoals: 4, soccerAssists: 2 } },
    { name: 'Rob Rensenbrink',    position: 'LW_S', positionGroup: 'offense', isAllStar: true, stats: { soccerApps: 7, soccerGoals: 4, soccerAssists: 3 } },
    { name: 'Rinus Michels',      position: 'ST',   positionGroup: 'offense',                  stats: { soccerApps: 4, soccerGoals: 1, soccerAssists: 1 } },
  ],
};

export const SOCCER_CURATED_ERA_KEYS = Object.keys(SOCCER_ROSTERS);

export async function fetchSoccerPlayers(team: HistoricalTeam, era: Era): Promise<Player[]> {
  const key = `${team.id}-${era.id}`;
  const roster = SOCCER_ROSTERS[key];
  if (!roster) return fallbackSoccerPlayers(team, era);

  return roster.map((sp, i) => {
    const p: Player = {
      id: `soccer-hist-${team.id}-${i}`,
      name: sp.name,
      position: sp.position,
      positionGroup: sp.positionGroup,
      eraId: era.id,
      teamId: team.id,
      bestSeasonYear: era.startYear + 1,
      yearsWithTeam: `${era.startYear}–${era.endYear}`,
      stats: sp.stats,
      playerScore: 0,
      isLegend: sp.isLegend,
      isAllStar: sp.isAllStar,
    };
    p.playerScore = computePlayerScore(p, era.sport);
    return p;
  }).sort((a, b) => b.playerScore - a.playerScore);
}

function fallbackSoccerPlayers(team: HistoricalTeam, era: Era): Player[] {
  const seed = team.id.charCodeAt(0) * 31 + team.id.charCodeAt(1 % team.id.length);
  const positions: { pos: Player['position']; group: Player['positionGroup'] }[] = [
    { pos: 'GK', group: 'goalie' },
    { pos: 'RB_S', group: 'defense' }, { pos: 'CB_S', group: 'defense' },
    { pos: 'CB_S', group: 'defense' }, { pos: 'LB_S', group: 'defense' },
    { pos: 'CDM', group: 'defense' },
    { pos: 'CM_S', group: 'offense' }, { pos: 'CAM', group: 'offense' },
    { pos: 'RW_S', group: 'offense' },
    { pos: 'ST', group: 'offense' },
    { pos: 'LW_S', group: 'offense' },
  ];
  return positions.map(({ pos, group }, i) => {
    const s = seed + i;
    const stats: Player['stats'] = pos === 'GK'
      ? { soccerApps: 30, cleanSheets: 10 + (s % 8), savePctSoc: 0.72 + (s % 10) / 100 }
      : group === 'defense'
        ? { soccerApps: 30, tacklesPG: 2.0 + (s % 20) / 10, soccerGoals: s % 2, soccerAssists: s % 3 }
        : { soccerApps: 30, soccerGoals: 6 + (s % 12), soccerAssists: 4 + (s % 8), keyPasses: 1.5 + (s % 20) / 10 };
    const p: Player = {
      id: `soccer-fb-${team.id}-${i}`,
      name: `Player ${i + 1}`,
      position: pos,
      positionGroup: group,
      eraId: era.id,
      teamId: team.id,
      yearsWithTeam: `${era.startYear}–${era.endYear}`,
      stats,
      playerScore: 0,
    };
    p.playerScore = computePlayerScore(p, era.sport);
    return p;
  });
}
