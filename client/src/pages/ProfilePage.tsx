import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MeetingHistoryList } from '@/components/Profile/MeetingHistoryList';
import { updateProfile } from '@/features/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { Layout } from '@/components/Layout';
import { CanvasBackground } from '@/components/InteractiveBackground';
import { CalendarWidget } from '@/components/Dashboard/CalendarWidget';
import { AIProxyWidget } from '@/components/Dashboard/AIProxyWidget';

export const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'settings';
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const resultAction = await dispatch(updateProfile({ name, email, password: password || undefined }));
      if (updateProfile.fulfilled.match(resultAction)) {
        setStatus('Profile updated successfully!');
        setPassword('');
      } else {
        setStatus('Failed to update profile.');
      }
    } catch (error) {
      setStatus('An error occurred.');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <p>Please log in to view your profile.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <CanvasBackground />
      <div className="container max-w-4xl mx-auto py-10 relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-white">My Account</h1>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="settings">Profile Settings</TabsTrigger>
            <TabsTrigger value="history">Meeting History</TabsTrigger>
            <TabsTrigger value="assistant">Assistant Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password (Optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {status && (
                    <p className={`text-sm ${status.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                      {status}
                    </p>
                  )}
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Your Past Meetings</h2>
              <MeetingHistoryList />
            </div>
          </TabsContent>

          <TabsContent value="assistant">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Calendar & Schedule</h2>
                <CalendarWidget />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">AI Proxy Attendee</h2>
                <AIProxyWidget />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
