import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs for IPL and PSL schedules
const SCHEDULE_URLS = {
  IPL: 'https://www.espncricinfo.com/series/indian-premier-league-2025-1422785/match-schedule-fixtures-and-results',
  PSL: 'https://www.espncricinfo.com/series/pakistan-super-league-2025-1422786/match-schedule-fixtures-and-results'
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
  'Islamabad United': { id: 201, code: 'ISU', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313533.logo.png' },
  'Karachi Kings': { id: 202, code: 'KK', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313534.logo.png' },
  'Lahore Qalandars': { id: 203, code: 'LQ', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313535.logo.png' },
  'Multan Sultans': { id: 204, code: 'MS', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313536.logo.png' },
  'Peshawar Zalmi': { id: 205, code: 'PZ', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313537.logo.png' },
  'Quetta Gladiators': { id: 206, code: 'QG', logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313538.logo.png' }
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
    logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313425.logo.png',
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
    logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313500/313532.logo.png',
    totalMatches: 34,
    location: 'Pakistan',
    teams: PSL_TEAMS
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
    const matchCount = tournamentKey === 'IPL' ? 74 : 34;
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
        : ['Karachi', 'Lahore', 'Islamabad', 'Multan', 'Peshawar', 'Rawalpindi'];
      
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
    const dataDir = path.join(__dirname, '..', 'data');
    
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