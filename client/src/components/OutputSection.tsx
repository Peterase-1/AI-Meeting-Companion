import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export const OutputSection: React.FC = () => {
  const meeting = useSelector((state: RootState) => state.meeting)

  const hasData = meeting.summary.short || meeting.sentiment.sentiment || meeting.actionItems.length > 0 || meeting.decisions.length > 0

  if (!hasData) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 space-y-8 animate-in fade-in duration-700">
      <h2 className="text-3xl font-bold text-center">Meeting Insights</h2>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
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
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg bg-card/50">
                    <div>
                      <p className="font-medium">{item.what}</p>
                      <p className="text-sm text-muted-foreground">Assignee: {item.who}</p>
                      {item.dueDate && <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>}
                    </div>
                    <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}>
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
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                  <p className="text-2xl font-bold mt-2">{meeting.sentiment.sentiment}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
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
      </Tabs>
    </div>
  )
}
