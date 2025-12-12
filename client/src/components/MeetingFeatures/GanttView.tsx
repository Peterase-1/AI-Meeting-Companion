import { useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import type { Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useAppSelector, useAppDispatch } from "../../store";
import { setActionPlan } from "../../features/meetingSlice";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Loader2, CalendarRange, RefreshCcw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const GanttView = () => {
  const { id, actionPlan } = useAppSelector((state) => state.meeting);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

  const ganttTasks: Task[] = (actionPlan?.gantt || []).map((t: any) => ({
    start: new Date(t.start),
    end: new Date(t.end),
    name: t.name,
    id: t.id,
    type: "task",
    progress: t.progress,
    isDisabled: true, // Read-only for now
    styles: { progressColor: "#ffbb54", progressSelectedColor: "#ff9e0d" },
  }));

  const handleGenerateGantt = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.post(`/api/meetings/${id}/gantt`);

      // Merge with existing action plan in Redux
      const updatedActionPlan = {
        ...(actionPlan || { goals: [], tasks: [], timeline: [] }),
        gantt: response.data.tasks,
      };

      dispatch(setActionPlan(updatedActionPlan));
    } catch (error) {
      console.error("Failed to generate Gantt chart", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="pl-0 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-purple-500" />
            Project Timeline (Gantt)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(ViewMode.Day)}
              className={viewMode === ViewMode.Day ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : ""}
            >
              Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(ViewMode.Week)}
              className={viewMode === ViewMode.Week ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : ""}
            >
              Week
            </Button>
            {actionPlan?.gantt && (
              <Button variant="ghost" size="sm" onClick={handleGenerateGantt} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pl-0">
          {!actionPlan?.gantt ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-black/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <CalendarRange className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No Gantt Chart Generated</h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                Generate a visual project timeline extracted from the meeting discussion.
              </p>
              <Button onClick={handleGenerateGantt} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  "Generate Gantt Chart"
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <div style={{ minWidth: '800px' }}>
                  <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    onDateChange={() => { }}
                    onDelete={() => { }}
                    onProgressChange={() => { }}
                    onDoubleClick={() => { }}
                    onSelect={() => { }}
                    listCellWidth="155px"
                    columnWidth={60}
                    barFill={70}
                    ganttHeight={400}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttView;
