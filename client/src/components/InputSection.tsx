import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Upload, Mic, Link, Loader2 } from 'lucide-react'

import { useDispatch } from 'react-redux'
import { setMeetingData } from '@/features/meetingSlice'

export const InputSection: React.FC = () => {
  const dispatch = useDispatch()
  const [textInput, setTextInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Simulate progress
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isUploading) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 500)
    } else {
      setProgress(100)
    }
    return () => clearInterval(interval)
  }, [isUploading])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadStatus(null)
      setErrorMessage(null)
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Upload success:', data)
          setUploadStatus('Upload successful!')
          // TODO: Trigger processing
        } else {
          console.error('Upload failed')
          setUploadStatus('Upload failed.')
          const errorData = await response.json()
          setErrorMessage(errorData.error || "Upload failed")
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        setUploadStatus('Error uploading file.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return

    setIsUploading(true)
    setErrorMessage(null)
    try {
      const response = await fetch('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: textInput }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Processing success:', data)
        dispatch(setMeetingData(data))
      } else {
        console.error('Processing failed')
        const errorData = await response.json()
        setErrorMessage(errorData.error || "Processing failed")
      }
    } catch (error) {
      console.error('Error processing text:', error)
    } finally {
      setIsUploading(false)
    }
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
              {isUploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              )}
              <p className="text-sm text-muted-foreground mb-4">
                {isUploading ? 'Processing...' : 'Drag and drop or click to upload'}
              </p>
              {isUploading && (
                <Progress value={progress} className="w-[60%] mb-4" />
              )}
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
                accept=".mp3,.m4a,.txt,.docx,.pdf"
                disabled={isUploading}
              />
              <Button asChild variant="outline" disabled={isUploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select File
                </label>
              </Button>
              {uploadStatus && (
                <p className="mt-4 text-sm font-medium text-primary">{uploadStatus}</p>
              )}
              {errorMessage && (
                <div className="mt-4 w-full p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-center">
                  {errorMessage}
                </div>
              )}
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
            <CardFooter className="flex-col space-y-4">
              {isUploading && (
                <div className="w-full space-y-2">
                  <p className="text-sm text-center text-muted-foreground">Processing...</p>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
              {errorMessage && (
                <div className="w-full p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  {errorMessage}
                </div>
              )}
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
    </div >
  )
}
