import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Video } from 'lucide-react';

export const CalendarWidget: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  const upcomingMeetings = [
    { id: 1, title: 'Weekly Team Sync', time: 'Tomorrow, 10:00 AM', attendees: 5, platform: 'Google Meet' },
    { id: 2, title: 'Product Demo - Client X', time: 'Friday, 2:00 PM', attendees: 3, platform: 'Zoom' },
    { id: 3, title: 'Q4 Strategy Planning', time: 'Mon, Oct 30, 11:00 AM', attendees: 8, platform: 'Teams' },
  ];

  return (
    <Card className="w-full h-full mb-6 border-l-4 border-l-indigo-500 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-600" />
            Upcoming Meetings
          </CardTitle>
          {!isConnected && (
            <Button size="sm" variant="outline" onClick={() => setIsConnected(true)} className="text-xs h-7">
              Connect Calendar
            </Button>
          )}
          {isConnected && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">Connected</span>
          )}
        </div>
        <CardDescription>
          One-click start for your scheduled events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed">
            <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">Connect Google/Outlook to see your schedule.</p>
            <Button onClick={() => setIsConnected(true)} className="bg-white text-black border hover:bg-gray-100">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="h-4 w-4 mr-2" alt="Google" />
              Sign in with Google
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((mtg) => (
              <div key={mtg.id} className="flex items-center justify-between p-3 bg-card hover:bg-accent/50 rounded-lg border transition-colors cursor-pointer group">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{mtg.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mtg.time}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {mtg.attendees}</span>
                  </div>
                </div>
                <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 hover:bg-indigo-700">
                  <Video className="h-3 w-3 mr-1" /> Start
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
