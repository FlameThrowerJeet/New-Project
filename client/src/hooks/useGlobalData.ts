import { useState, useEffect } from 'react';

// Define interfaces for the data structures
interface MissionChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date | string;
  category: string;
}

interface Session {
  id: number;
  type: 'session' | 'break';
  startTime: string;
  endTime: string;
  notes: string;
  isActive: boolean;
  status: 'upcoming' | 'current' | 'passed';
}

interface DayData {
  dayNumber: number;
  date: string;
  sessions: Session[];
}

interface GlobalData {
  missions: MissionChecklistItem[];
  missionTracker: DayData[];
  loading: boolean;
  error: string | null;
}

const useGlobalData = (): GlobalData => {
  const [data, setData] = useState<GlobalData>({
    missions: [],
    missionTracker: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = () => {
      try {
        // Fetch missions
        const savedMissions = localStorage.getItem('mission-checklist');
        const missions = savedMissions ? JSON.parse(savedMissions) : [];

        // Fetch mission tracker data
        const savedTrackerData = localStorage.getItem('mission-tracker-data');
        const missionTracker = savedTrackerData ? JSON.parse(savedTrackerData) : [];

        setData({
          missions,
          missionTracker,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Failed to fetch or parse global data from localStorage", err);
        setData({
          missions: [],
          missionTracker: [],
          loading: false,
          error: "Could not load data from localStorage.",
        });
      }
    };

    fetchData();

    // Set up an interval to periodically refresh data,
    // as other components might update localStorage.
    const intervalId = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return data;
};

export default useGlobalData; 