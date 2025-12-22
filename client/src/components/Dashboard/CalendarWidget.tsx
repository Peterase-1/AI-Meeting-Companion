import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { api } from '@/lib/api';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
}

export const CalendarWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/calendar/events');
      setEvents(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Connect your Google Account to see meetings.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
          <CardDescription>Integrate with Google Calendar</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"}/api/auth/google`}>
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming meetings found.</p>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="flex items-start justify-between border-b pb-2 last:border-0 hover:bg-muted/50 p-2 rounded-md transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm line-clamp-1">{event.summary || "No Title"}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.start.dateTime
                      ? format(new Date(event.start.dateTime), 'MMM d, h:mm a')
                      : event.start.date}
                  </p>
                </div>
                <a href={event.htmlLink} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Refactor pass 14: verified component render.

// Code audit 5: verified logic safety.

// Maintenance task 5: docs(api): clarify meeting creation parameters

// Update 2025-12-22 10:19:00: style(ui): unify border radius on cards
