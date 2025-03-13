import React, { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import Button from './ui/Button';
import { Tournament, Match } from '../types';
import { format } from 'date-fns';

interface ScheduleDownloadOptionsProps {
  tournament: Tournament;
  matches: Match[];
}

const ScheduleDownloadOptions: React.FC<ScheduleDownloadOptionsProps> = ({ tournament, matches }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'json' | 'ical'>('csv');

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      let content = '';
      let filename = `${tournament.name.replace(/\s+/g, '_')}_Schedule`;
      let type = '';
      
      if (downloadFormat === 'csv') {
        content = generateCSV(matches);
        filename += '.csv';
        type = 'text/csv;charset=utf-8;';
      } else if (downloadFormat === 'json') {
        content = generateJSON(matches);
        filename += '.json';
        type = 'application/json;charset=utf-8;';
      } else if (downloadFormat === 'ical') {
        content = generateICalendar(matches, tournament);
        filename += '.ics';
        type = 'text/calendar;charset=utf-8;';
      }
      
      // Create a blob and download link
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading schedule:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const generateCSV = (matches: Match[]): string => {
    let csvContent = "Date,Time,Match,Venue,Format\n";
    
    matches.forEach(match => {
      const date = format(new Date(match.date), 'yyyy-MM-dd');
      const time = format(new Date(match.date), 'HH:mm');
      csvContent += `${date},${time},"${match.name}","${match.venue || 'TBD'}","${match.format || 'T20'}"\n`;
    });
    
    return csvContent;
  };

  const generateJSON = (matches: Match[]): string => {
    const simplifiedMatches = matches.map(match => ({
      id: match.id,
      name: match.name,
      date: match.date,
      venue: match.venue,
      format: match.format,
      team1: match.team1.name,
      team2: match.team2.name,
      status: match.status
    }));
    
    return JSON.stringify(simplifiedMatches, null, 2);
  };

  const generateICalendar = (matches: Match[], tournament: Tournament): string => {
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CrickPredict//Cricket Match Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${tournament.name} Schedule`,
      'X-WR-TIMEZONE:UTC',
    ].join('\r\n') + '\r\n';
    
    matches.forEach(match => {
      const startDate = new Date(match.date);
      const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // Add 4 hours for match duration
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      icalContent += [
        'BEGIN:VEVENT',
        `UID:${match.id}@crickpredict.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${match.name}`,
        `LOCATION:${match.venue || 'TBD'}`,
        `DESCRIPTION:${tournament.name} - ${match.format || 'T20'} match between ${match.team1.name} and ${match.team2.name}`,
        'END:VEVENT',
      ].join('\r\n') + '\r\n';
    });
    
    icalContent += 'END:VCALENDAR';
    
    return icalContent;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-3">Download Schedule</h3>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button
          variant={downloadFormat === 'csv' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDownloadFormat('csv')}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          CSV
        </Button>
        
        <Button
          variant={downloadFormat === 'json' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDownloadFormat('json')}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          JSON
        </Button>
        
        <Button
          variant={downloadFormat === 'ical' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDownloadFormat('ical')}
          className="flex-1"
        >
          <Calendar className="h-4 w-4 mr-2" />
          iCalendar
        </Button>
      </div>
      
      <Button
        variant="primary"
        fullWidth
        onClick={handleDownload}
        isLoading={isDownloading}
      >
        <Download className="h-4 w-4 mr-2" />
        Download {tournament.name} Schedule
      </Button>
      
      <p className="text-xs text-gray-500 mt-2">
        {downloadFormat === 'csv' && 'Download as CSV to open in Excel or Google Sheets'}
        {downloadFormat === 'json' && 'Download as JSON for programmatic use'}
        {downloadFormat === 'ical' && 'Download as iCalendar to import into your calendar app'}
      </p>
    </div>
  );
};

export default ScheduleDownloadOptions;