# CrickPredict Data

This directory contains the data files used by the CrickPredict application.

## Files

- `tournaments.json`: Contains information about cricket tournaments, including IPL 2025 and PSL 2025
- `matches.json`: Contains match schedules for the tournaments

## Data Structure

### Tournaments

Each tournament has the following structure:

```json
{
  "id": 2025001,
  "name": "Indian Premier League 2025",
  "startDate": "2025-03-22",
  "endDate": "2025-05-24",
  "format": "T20",
  "category": "National",
  "logo": "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313425.logo.png",
  "totalMatches": 74,
  "location": "India"
}
```

### Matches

Each match has the following structure:

```json
{
  "id": 2025001001,
  "tournamentId": 2025001,
  "name": "Mumbai Indians vs Chennai Super Kings",
  "status": "upcoming",
  "date": "2025-03-22T14:00:00.000Z",
  "team1": {
    "id": 101,
    "name": "Mumbai Indians",
    "code": "MI",
    "logo": "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/317000/317005.png"
  },
  "team2": {
    "id": 102,
    "name": "Chennai Super Kings",
    "code": "CSK",
    "logo": "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160/lsci/db/PICTURES/CMS/313400/313421.logo.png"
  },
  "format": "T20",
  "venue": "Mumbai Stadium",
  "predictions": {
    "team1Percentage": 52,
    "team2Percentage": 45,
    "drawPercentage": 3
  }
}
```

## Data Sources

The data is sourced from cricketdata.org API and is updated using the `fetchSchedules.js` script.

## Updating Data

To update the tournament and match data, run:

```bash
npm run fetch-schedules
```

This will fetch the latest schedules from cricketdata.org and update the JSON files.