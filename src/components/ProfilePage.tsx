import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    university: user.university
  });

  const handleSave = () => {
    // In a real app, this would make an API call to update the user profile
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      university: user.university
    });
    setIsEditing(false);
  };

  const EditIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const TrophyIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );

  const AwardIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and view your coding statistics.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Profile Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profilePhoto} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.university}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className="text-base px-3 py-1">
                      {user.rank}
                    </Badge>
                    <div className="text-lg font-semibold text-primary">
                      Rating: {user.rating}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{user.problemsSolved}</div>
                  <div className="text-sm text-muted-foreground">Problems Solved</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">{user.acceptanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-info mb-2">{user.totalSubmissions}</div>
                  <div className="text-sm text-muted-foreground">Total Submissions</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">{user.badges.length}</div>
                  <div className="text-sm text-muted-foreground">Badges Earned</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Problem Solving Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Solving Progress</CardTitle>
              <CardDescription>Your progress across different difficulty levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Easy Problems</span>
                    <span className="text-sm text-muted-foreground">
                      {user.submissionStats.easy.solved} / {user.submissionStats.easy.total}
                    </span>
                  </div>
                  <Progress 
                    value={(user.submissionStats.easy.solved / user.submissionStats.easy.total) * 100} 
                    className="h-3"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Medium Problems</span>
                    <span className="text-sm text-muted-foreground">
                      {user.submissionStats.medium.solved} / {user.submissionStats.medium.total}
                    </span>
                  </div>
                  <Progress 
                    value={(user.submissionStats.medium.solved / user.submissionStats.medium.total) * 100} 
                    className="h-3"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Hard Problems</span>
                    <span className="text-sm text-muted-foreground">
                      {user.submissionStats.hard.solved} / {user.submissionStats.hard.total}
                    </span>
                  </div>
                  <Progress 
                    value={(user.submissionStats.hard.solved / user.submissionStats.hard.total) * 100} 
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Overview</CardTitle>
              <CardDescription>Your proficiency in different programming topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(user.skills).map(([skill, level]: [string, any]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill as any}</span>
                      <span className="text-sm text-muted-foreground">{level as any}%</span>
                    </div>
                    <Progress value={level as any} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          {/* Badges Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrophyIcon className="w-5 h-5" />
                <span>Earned Badges</span>
              </CardTitle>
              <CardDescription>
                Achievements you've unlocked through your coding journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="text-3xl">{badge.icon}</div>
                    <div>
                      <h4 className="font-semibold">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AwardIcon className="w-5 h-5" />
                <span>Available Badges</span>
              </CardTitle>
              <CardDescription>
                Badges you can still earn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Marathon Runner", icon: "🏃", description: "Solve problems for 30 consecutive days", progress: 65 },
                  { name: "Night Owl", icon: "🦉", description: "Solve 50 problems after midnight", progress: 12 },
                  { name: "Binary Master", icon: "💾", description: "Solve 25 binary tree problems", progress: 88 },
                  { name: "Graph Explorer", icon: "🗺️", description: "Solve 20 graph problems", progress: 45 }
                ].map((badge, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border opacity-60">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <h4 className="font-semibold">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <Button
                  variant="outline"
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Read-only account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Enrollment Number</Label>
                  <Input value={user.enrollmentNo} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Current Rating</Label>
                  <Input value={user.rating} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Rank</Label>
                  <Input value={user.rank} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <Input value="January 2024" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;