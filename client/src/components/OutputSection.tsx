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

export const OutputSection: React.FC = () => {
  const meeting = useSelector((state: RootState) => state.meeting)
  const dispatch = useDispatch<AppDispatch>()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
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
