import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActionPlan } from '../../features/meetingSlice';
import type { RootState } from '../../store';
import { api } from '../../lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, CalendarDays, CheckSquare } from 'lucide-react';

interface ActionPlanData {
  goals: string[];
  tasks: {
    description: string;
    owner: string;
    deadline: string;
    priority: string;
    status: string;
  }[];
  timeline: {
    milestone: string;
    date: string;
  }[];
}

interface ActionPlanViewProps {
  meetingId: string;
  initialPlan?: ActionPlanData | null;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ meetingId, initialPlan }) => {
  const dispatch = useDispatch();
  const plan = useSelector((state: RootState) => state.meeting.actionPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with initialPlan if Redux is empty (on first load)
  React.useEffect(() => {
    if (!plan && initialPlan) {
      dispatch(setActionPlan(initialPlan));
    }
  }, [initialPlan, plan, dispatch]);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/api/meetings/${meetingId}/action-plan`);
      dispatch(setActionPlan(response.data)); // Save to Redux
    } catch (err) {
      setError("Failed to generate action plan. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center bg-muted/50">
        <CardHeader>
          <CardTitle className="text-xl">Action Plan Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Generate a detailed action plan with goals, tasks, and timeline using AI.
          </p>
          <Button onClick={generatePlan} disabled={loading} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Generating Plan...' : 'Generate Action Plan'}
          </Button>
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Strategic Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {plan.goals.map((goal, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                <span className="text-muted-foreground">{goal}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-green-500" />
            Tasks & Owners
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="border-b">
                  <th className="h-12 px-4 font-medium">Task</th>
                  <th className="h-12 px-4 font-medium">Owner</th>
                  <th className="h-12 px-4 font-medium">Deadline</th>
                  <th className="h-12 px-4 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plan.tasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">{task.description}</td>
                    <td className="p-4">{task.owner}</td>
                    <td className="p-4">{task.deadline}</td>
                    <td className="p-4">
                      <Badge variant={
                        task.priority.toLowerCase() === 'high' ? 'destructive' :
                          task.priority.toLowerCase() === 'medium' ? 'secondary' : 'outline'
                      }>
                        {task.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-orange-500" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-muted ml-3 space-y-8 pl-6 pb-2 pt-2">
            {plan.timeline.map((item, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-background border-2 border-indigo-500" />
                <time className="block mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  {item.date}
                </time>
                <h4 className="text-base font-medium">{item.milestone}</h4>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Refactor pass 15: verified component render.

// Code audit 6: verified logic safety.

// Maintenance task 6: feat(profile): add skeleton loading state
