import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs for IPL and PSL schedules
const SCHEDULE_URLS = {
  IPL: 'https://www.espncricinfo.com/series/indian-premier-league-2025-1422785/match-schedule-fixtures-and-results',
  PSL: 'https://www.espncricinfo.com/series/pakistan-super-league-2025-1422786/match-schedule-fixtures-and-results',
  CPL: 'https://www.espncricinfo.com/series/caribbean-premier-league-2025-1422787/match-schedule-fixtures-and-results',
  BBL: 'https://www.espncricinfo.com/series/big-bash-league-2025-26-1422788/match-schedule-fixtures-and-results',
  T20_BLAST: 'https://www.ecb.co.uk/t20-blast/fixtures'
};

// Team mappings for IPL
const IPL_TEAMS = {
  'Mumbai Indians': { id: 101, code: 'MI', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/317000/317005.png' },
  'Chennai Super Kings': { id: 102, code: 'CSK', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313421.logo.png' },
  'Royal Challengers Bangalore': { id: 103, code: 'RCB', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313418.logo.png' },
  'Kolkata Knight Riders': { id: 104, code: 'KKR', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313419.logo.png' },
  'Delhi Capitals': { id: 105, code: 'DC', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313422.logo.png' },
  'Punjab Kings': { id: 106, code: 'PBKS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/317000/317003.png' },
  'Rajasthan Royals': { id: 107, code: 'RR', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313423.logo.png' },
  'Sunrisers Hyderabad': { id: 108, code: 'SRH', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313424.logo.png' },
  'Gujarat Titans': { id: 109, code: 'GT', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/334700/334707.png' },
  'Lucknow Super Giants': { id: 110, code: 'LSG', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/334700/334708.png' }
};

// Team mappings for PSL
const PSL_TEAMS = {
  'Islamabad United': { id: 201, code: 'ISU', logo: 'https://www.psl-t20.com/downloads/teams/islamabad-united-logo.png' },
  'Karachi Kings': { id: 202, code: 'KK', logo: 'https://www.psl-t20.com/downloads/teams/karachi-kings-logo.png' },
  'Lahore Qalandars': { id: 203, code: 'LQ', logo: 'https://www.psl-t20.com/downloads/teams/lahore-qalandars-logo.png' },
  'Multan Sultans': { id: 204, code: 'MS', logo: 'https://www.psl-t20.com/downloads/teams/multan-sultans-logo.png' },
  'Peshawar Zalmi': { id: 205, code: 'PZ', logo: 'https://www.psl-t20.com/downloads/teams/peshawar-zalmi-logo.png' },
  'Quetta Gladiators': { id: 206, code: 'QG', logo: 'https://www.psl-t20.com/downloads/teams/quetta-gladiators-logo.png' }
};

// Team mappings for T20 Blast
const T20_BLAST_TEAMS = {
  'Birmingham Bears': { id: 301, code: 'WARKS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313428.logo.png' },
  'Derbyshire': { id: 302, code: 'DERBY', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313429.logo.png' },
  'Durham': { id: 303, code: 'DUR', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313430.logo.png' },
  'Essex': { id: 304, code: 'ESS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313431.logo.png' },
  'Glamorgan': { id: 305, code: 'GLAM', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313432.logo.png' },
  'Gloucestershire': { id: 306, code: 'GLOUCS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313433.logo.png' },
  'Hampshire': { id: 307, code: 'HANTS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313434.logo.png' },
  'Kent': { id: 308, code: 'KENT', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313435.logo.png' },
  'Lancashire': { id: 309, code: 'LANCS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313436.logo.png' },
  'Leicestershire': { id: 310, code: 'LEICS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313437.logo.png' },
  'Middlesex': { id: 311, code: 'MDX', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313438.logo.png' },
  'Northamptonshire': { id: 312, code: 'NORTHANTS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313439.logo.png' },
  'Nottinghamshire': { id: 313, code: 'NOTTS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313440.logo.png' },
  'Somerset': { id: 314, code: 'SOM', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313441.logo.png' },
  'Surrey': { id: 315, code: 'SURREY', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313442.logo.png' },
  'Sussex': { id: 316, code: 'SUSSEX', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313443.logo.png' },
  'Worcestershire': { id: 317, code: 'WORCS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313444.logo.png' },
  'Yorkshire': { id: 318, code: 'YORKS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313445.logo.png' }
};

// Team mappings for CPL
const CPL_TEAMS = {
  'Trinbago Knight Riders': { id: 401, code: 'TKR', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313539.png' },
  'Guyana Amazon Warriors': { id: 402, code: 'GAW', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313540.png' },
  'Barbados Royals': { id: 403, code: 'BR', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313541.png' },
  'St Kitts & Nevis Patriots': { id: 404, code: 'SNP', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313542.png' },
  'Saint Lucia Kings': { id: 405, code: 'SLK', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313543.png' },
  'Jamaica Tallawahs': { id: 406, code: 'JT', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313544.png' }
};

// Team mappings for BBL
const BBL_TEAMS = {
  'Adelaide Strikers': { id: 501, code: 'ADS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313446.png' },
  'Brisbane Heat': { id: 502, code: 'BRH', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313447.png' },
  'Hobart Hurricanes': { id: 503, code: 'HBH', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313448.png' },
  'Melbourne Renegades': { id: 504, code: 'MLR', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313449.png' },
  'Melbourne Stars': { id: 505, code: 'MLS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313450.png' },
  'Perth Scorchers': { id: 506, code: 'PER', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313451.png' },
  'Sydney Sixers': { id: 507, code: 'SYD', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313452.png' },
  'Sydney Thunder': { id: 508, code: 'THU', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313453.png' }
};

// Tournament data
const TOURNAMENTS = {
  IPL: {
    id: 2025001,
    name: 'Indian Premier League 2025',
    startDate: '2025-03-22',
    endDate: '2025-05-24',
    format: 'T20',
    category: 'National',
    logo: 'https://i.imgur.com/Yd2xm0K.png',
    totalMatches: 74,
    location: 'India',
    teams: IPL_TEAMS
  },
  PSL: {
    id: 2025002,
    name: 'Pakistan Super League 2025',
    startDate: '2025-02-15',
    endDate: '2025-03-15',
    format: 'T20',
    category: 'National',
    logo: 'https://i.imgur.com/Yd2xm0K.png',
    totalMatches: 34,
    location: 'Pakistan',
    teams: PSL_TEAMS
  },
  CPL: {
    id: 2025004,
    name: 'Caribbean Premier League 2025',
    startDate: '2025-08-01',
    endDate: '2025-09-15',
    format: 'T20',
    category: 'National',
    logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313545.png',
    totalMatches: 34,
    location: 'Caribbean',
    teams: CPL_TEAMS
  },
  BBL: {
    id: 2025005,
    name: 'Big Bash League 2025-26',
    startDate: '2025-12-05',
    endDate: '2026-01-25',
    format: 'T20',
    category: 'National',
    logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313454.png',
    totalMatches: 61,
    location: 'Australia',
    teams: BBL_TEAMS
  },
  T20_BLAST: {
    id: 2025003,
    name: 'T20 Blast 2025',
    startDate: '2025-05-30',
    endDate: '2025-09-21',
    format: 'T20',
    category: 'National',
    logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313427.logo.png',
    totalMatches: 133,
    location: 'England',
    teams: T20_BLAST_TEAMS
  }
};

// Function to fetch and parse schedule from ESPNCricinfo
async function fetchSchedule(tournamentKey) {
  try {
    console.log(`Fetching ${tournamentKey} schedule...`);
    
    // In a real implementation, we would fetch from the actual URL
    // const response = await axios.get(SCHEDULE_URLS[tournamentKey]);
    // const $ = cheerio.load(response.data);
    
    // For this example, we'll create mock data since we can't actually fetch future schedules
    const tournament = TOURNAMENTS[tournamentKey];
    const teams = tournament.teams;
    const teamNames = Object.keys(teams);
    const matches = [];
    
    // Generate mock matches
    const matchCount = tournamentKey === 'IPL' ? 74 : tournamentKey === 'T20_BLAST' ? 133 : 34;
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    const daySpan = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysPerMatch = daySpan / matchCount;
    
    for (let i = 0; i < matchCount; i++) {
      const team1Index = i % teamNames.length;
      const team2Index = (i + 1 + Math.floor(i / teamNames.length)) % teamNames.length;
      
      if (team1Index === team2Index) continue;
      
      const team1Name = teamNames[team1Index];
      const team2Name = teamNames[team2Index];
      const team1 = teams[team1Name];
      const team2 = teams[team2Name];
      
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + Math.floor(i * daysPerMatch));
      
      // Random venue selection
      const venues = tournamentKey === 'IPL' 
        ? ['Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Delhi', 'Hyderabad', 'Ahmedabad', 'Lucknow']
        : tournamentKey === 'PSL'
          ? ['Karachi', 'Lahore', 'Islamabad', 'Multan', 'Peshawar', 'Rawalpindi']
          : ['Edgbaston', 'The Oval', 'Lords', 'Old Trafford', 'Trent Bridge', 'Headingley', 'Rose Bowl', 'Cardiff'];
      
      const venue = venues[Math.floor(Math.random() * venues.length)];
      
      matches.push({
        id: tournament.id * 1000 + i + 1,
        tournamentId: tournament.id,
        name: `${team1Name} vs ${team2Name}`,
        status: 'upcoming',
        date: matchDate.toISOString(),
        team1: {
          id: team1.id,
          name: team1Name,
          code: team1.code,
          logo: team1.logo
        },
        team2: {
          id: team2.id,
          name: team2Name,
          code: team2.code,
          logo: team2.logo
        },
        format: 'T20',
        venue: `${venue} Stadium`,
        predictions: {
          team1Percentage: Math.floor(Math.random() * 40) + 30,
          team2Percentage: Math.floor(Math.random() * 40) + 30,
          drawPercentage: Math.floor(Math.random() * 10)
        }
      });
    }
    
    return {
      tournament,
      matches
    };
  } catch (error) {
    console.error(`Error fetching ${tournamentKey} schedule:`, error);
    return { tournament: TOURNAMENTS[tournamentKey], matches: [] };
  }
}

// Main function to fetch all schedules and save them
async function fetchAllSchedules() {
  try {
    const results = {};
    
    for (const tournamentKey of Object.keys(SCHEDULE_URLS)) {
      results[tournamentKey] = await fetchSchedule(tournamentKey);
    }
    
    // Prepare data for saving
    const tournaments = Object.values(results).map(result => result.tournament);
    const matches = Object.values(results).flatMap(result => result.matches);
    
    // Save to JSON files
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
      console.log('Data directory already exists');
    }
    
    await fs.writeFile(
      path.join(dataDir, 'tournaments.json'),
      JSON.stringify(tournaments, null, 2)
    );
    
    await fs.writeFile(
      path.join(dataDir, 'matches.json'),
      JSON.stringify(matches, null, 2)
    );
    
    console.log('Schedules fetched and saved successfully!');
  } catch (error) {
    console.error('Error fetching schedules:', error);
  }
}

// Run the main function
fetchAllSchedules();