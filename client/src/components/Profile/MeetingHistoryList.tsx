import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setMeetingData } from '@/features/meetingSlice';
import type { RootState } from '@/store';

interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  createdAt: string;
}

export const MeetingHistoryList: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/meetings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMeetings(data);
        }
      } catch (error) {
        console.error("Failed to fetch meetings", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMeetings();
  }, [token]);

  const handleViewMeeting = async (id: string) => {
    try {
      // Fetch full details
      const response = await fetch(`${getApiUrl()}/api/meetings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Parse JSON fields if they are strings (backwards compatibility or safety)
        if (typeof data.summary === 'string') data.summary = JSON.parse(data.summary);
        if (typeof data.sentiment === 'string') data.sentiment = JSON.parse(data.sentiment);

        // Load into Redux
        dispatch(setMeetingData(data));

        // Navigate to Home Dashboard to view it
        navigate('/');
      }
    } catch (error) {
      console.error("Failed to load meeting details", error);
    }
  };

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="space-y-4">
      {meetings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No meetings saved yet.
          </CardContent>
        </Card>
      ) : (
        meetings.map((meeting) => (
          <Card key={meeting.id} className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">
                  {meeting.title || "Untitled Meeting"}
                </CardTitle>
                <CardDescription className="flex items-center text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(meeting.date).toLocaleDateString()}
                  <Clock className="ml-3 mr-1 h-3 w-3" />
                  {new Date(meeting.date).toLocaleTimeString()}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleViewMeeting(meeting.id)}>
                View <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
};
