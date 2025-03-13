import React, { useState } from 'react';
import { Download } from 'lucide-react';
import Button from './ui/Button';
import { Tournament } from '../types';
import { getMatches } from '../lib/api';

interface DownloadScheduleButtonProps {
  tournament: Tournament;
}

const DownloadScheduleButton: React.FC<DownloadScheduleButtonProps> = ({ tournament }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Fetch matches if not already in the tournament object
      let matches = tournament.matches || [];
      if (matches.length === 0) {
        matches = await getMatches(tournament.id);
      }
      
      // Create a CSV string with the schedule
      let csvContent = "Date,Match,Venue\n";
      
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          const date = new Date(match.date).toLocaleDateString();
          csvContent += `${date},"${match.name}","${match.venue || 'TBD'}"\n`;
        });
      }
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${tournament.name.replace(/\s+/g, '_')}_Schedule.csv`);
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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      isLoading={isDownloading}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Schedule
    </Button>
  );
};

export default DownloadScheduleButton;