import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Upload, FileText, Mic, Link } from 'lucide-react'

export const InputSection: React.FC = () => {
  const [textInput, setTextInput] = useState('')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('File uploaded:', file.name)
      // TODO: Handle file upload logic
    }
  }

  const handleTextSubmit = () => {
    console.log('Text submitted:', textInput)
    // TODO: Handle text submission logic
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
          <TabsTrigger value="live">Live Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Meeting Data</CardTitle>
              <CardDescription>
                Upload audio (mp3, m4a) or transcript files (txt, docx, pdf).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md m-6">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to upload
              </p>
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
                accept=".mp3,.m4a,.txt,.docx,.pdf"
              />
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select File
                </label>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle>Paste Transcript</CardTitle>
              <CardDescription>
                Paste your meeting transcript or notes directly here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your meeting text here..."
                className="min-h-[200px]"
                value={textInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextInput(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleTextSubmit} className="w-full">
                Process Text
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle>Live Transcript</CardTitle>
              <CardDescription>
                Paste a live transcript link or connect to a meeting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Link className="h-4 w-4 opacity-50" />
                <Input placeholder="Zoom/Teams Transcript URL (Optional)" />
              </div>
              <div className="flex justify-center p-8">
                <Button variant="secondary" className="h-24 w-24 rounded-full">
                  <Mic className="h-10 w-10" />
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Click to start listening (Browser Speech API)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
