import React, { useRef, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { saveMeeting } from '@/features/meetingSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Calendar, Save, Loader2, Check } from 'lucide-react'
import { ActionPlanView } from './MeetingFeatures/ActionPlanView'
import { ChatAssistant } from './MeetingFeatures/ChatAssistant'
import { TopicClusterMap } from './MeetingFeatures/TopicClusterMap'
import { DocExport } from './MeetingFeatures/DocExport'
import { SummaryVariantSelector } from './MeetingFeatures/SummaryVariantSelector'
import GanttView from './MeetingFeatures/GanttView'
import { api } from '@/lib/api'
import { setMeetingData } from '@/features/meetingSlice'

export const OutputSection: React.FC = () => {
  const meeting = useSelector((state: RootState) => state.meeting)
  const dispatch = useDispatch<AppDispatch>()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("General")

  const hasData = meeting.summary.short || meeting.sentiment.sentiment || meeting.actionItems.length > 0 || meeting.decisions.length > 0

  useEffect(() => {
    if (hasData && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [hasData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await dispatch(saveMeeting(meeting)).unwrap()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save meeting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    if (!meeting.id && !meeting.transcript) return; // Need transcript or ID
    setSelectedRole(newRole);
    setRoleLoading(true);

    try {
      // If meeting is saved (has ID), use regenerate endpoint
      // If not saved (just in memory), we might need a different endpoint or just re-analyze.
      // But for now, let's assume we can regenerate if we have valid data.
      // Since user might filter BEFORE saving, we typically need to call 'analyzeMeeting' properly.
      // The current backend flow for '/' POST analyzes. 
      // Let's assume for this feature, if no ID, we can't easily regenerate via the '/:id/regenerate' endpoint.
      // Correction: If the meeting is not saved, we can't use /:id/regenerate.
      // However, we can add a logic: if no ID, we probably shouldn't show the selector or we should handle it client side?
      // No, let's assume this feature works best on saved meetings OR we reuse the analyze logic.

      let response;
      if (meeting.id) {
        response = await api.post(`/api/meetings/${meeting.id}/regenerate`, { role: newRole });
      } else {
        // Fallback for unsaved meetings? Typically we just save first or warn.
        // Or we can just mock it for "Showcase" if needed, but let's try to do it right.
        // We can call a new endpoint '/api/meetings/analyze' that takes transcript and role.
        // But implementing that is extra work. 
        // Simplified: Only show selector if meeting.id exists? 
        // Or enable it and alert if not saved.
        // Actually, we can use the existing save flow but that's complex.
        // Let's just limit to saved meetings for now, or assume we only use it after save.
        // But wait, the user instructions didn't specify.
        // Let's try to support it: we can just call a specialized endpoint that doesn't require ID if we send transcript.
        // But simpler: just alert "Please save meeting first".
        // Better: auto-save then regenerate?
        // Let's stick to: if (meeting.id) call endpoint. Else, alert.
        if (!meeting.id) {
          alert("Please save the meeting first to use Role-Based summaries.");
          setRoleLoading(false);
          return;
        }
        response = await api.post(`/api/meetings/${meeting.id}/regenerate`, { role: newRole });
      }

      const newData = response.data;
      dispatch(setMeetingData({
        summary: newData.summary,
        actionItems: newData.actionItems, // Update these too as they might change
        decisions: newData.decisions
      }));

    } catch (err) {
      console.error("Role update failed", err);
    } finally {
      setRoleLoading(false);
    }
  }

  if (!hasData) {
    return null
  }

  return (
    <div ref={sectionRef} className="w-full max-w-4xl mx-auto mt-12 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-center flex-1">Meeting Insights</h2>
        <Button onClick={handleSave} disabled={isSaving || !!meeting.id} variant={saveSuccess ? "outline" : "default"}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saveSuccess || meeting.id ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Saving...' : saveSuccess || meeting.id ? 'Saved' : 'Save Results'}
        </Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="flex justify-between items-center bg-card border rounded-lg p-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground ml-2">View As:</span>
            <SummaryVariantSelector
              selectedRole={selectedRole}
              onRoleChange={handleRoleChange}
              loading={roleLoading}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{meeting.summary.short}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed whitespace-pre-wrap">{meeting.summary.long}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meeting.actionItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg bg-card/50 hover:bg-card transition-colors gap-4">
                    <div className="space-y-2">
                      <p className="font-medium leading-normal">{item.what}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.who}
                        </span>
                        {item.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'} className="flex-shrink-0">
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <CardTitle>Key Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {meeting.decisions.map((decision, index) => (
                  <li key={index} className="text-lg">{decision}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment & Tone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center bg-muted/20">
                  <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                  <p className="text-2xl font-bold mt-2">{meeting.sentiment.sentiment}</p>
                </div>
                <div className="p-4 border rounded-lg text-center bg-muted/20">
                  <p className="text-sm text-muted-foreground">Tone</p>
                  <p className="text-2xl font-bold mt-2">{meeting.sentiment.tone}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Highlights</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {meeting.sentiment.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics">
          {meeting.id ? (
            <TopicClusterMap meetingId={meeting.id} />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Please save the meeting to view topics.
            </div>
          )}
        </TabsContent>

        <TabsContent value="plan">
          {meeting.id ? (
            <ActionPlanView meetingId={meeting.id} initialPlan={meeting.actionPlan} />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Please save the meeting to generate an action plan.
            </div>
          )}
        </TabsContent>

        <TabsContent value="gantt">
          {meeting.id ? (
            <GanttView />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Please save the meeting to generate a project timeline (Gantt).
            </div>
          )}
        </TabsContent>

        <TabsContent value="export">
          {meeting.id ? (
            <DocExport meetingId={meeting.id} />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Please save the meeting to generate documents.
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat">
          {meeting.id ? (
            <ChatAssistant meetingId={meeting.id} />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Please save the meeting to use the Q&A assistant.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Refactor pass 8: verified component render.
