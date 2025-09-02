import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { Separator } from './ui/separator';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const ProfilePage = () => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    department: '',
    roll_number: '',
    year_of_study: 1,
    section: '',
    designation: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // For admin users, we already have the profile data from AuthContext
      if (user?.role === 'admin') {
        setProfileData(user);
        // Create stats object from admin profile data
        const adminStats = {
          rank: user.admin_profile?.rank || 'Admin',
          rating: user.admin_profile?.rating || 1000,
          problemsSolved: user.admin_profile?.problems_solved || 0,
          acceptanceRate: user.admin_profile?.acceptance_rate || 0,
          totalSubmissions: user.admin_profile?.total_submissions || 0,
          submissionStats: { easy: { solved: 0, total: 0 }, medium: { solved: 0, total: 0 }, hard: { solved: 0, total: 0 } },
          skills: {},
          badges: [],
          ratingHistory: [],
          activityData: []
        };
        setStatistics(adminStats);
        return;
      }

      // For other roles, fetch from API
      const [profileResponse, statsResponse] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getStatistics()
      ]);

      if (profileResponse.success) {
        setProfileData(profileResponse.data.user);
        initializeFormData(profileResponse.data.user);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFormData = (userData) => {
    let profile;
    if (userData.role === 'student') {
      profile = userData.student_profile;
    } else if (userData.role === 'teacher') {
      profile = userData.teacher_profile;
    } else if (userData.role === 'admin') {
      profile = userData.admin_profile;
    }
    
    setFormData({
      name: userData.name || '',
      phone_no: userData.phone_no || '',
      department: profile?.department || '',
      roll_number: profile?.roll_number || '',
      year_of_study: profile?.year_of_study || 1,
      section: profile?.section || '',
      designation: profile?.designation || ''
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.updateProfile(formData);
      
      if (response.success) {
        // Update local auth context
        await updateAuthProfile(response.data.user);
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditing(false);
        loadProfileData(); // Reload data
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    initializeFormData(profileData);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.changePassword(passwordData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setIsChangingPassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      let errorMessage = "Failed to change password";
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const response = await profileAPI.uploadPhoto(file);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile photo uploaded successfully",
        });
        loadProfileData(); // Reload data
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.deletePhoto();
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile photo deleted successfully",
        });
        loadProfileData(); // Reload data
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatRatingTooltip = (value, name, props) => {
    if (name === 'rating') {
      return [`Rating: ${value}`, props.payload.contest];
    }
    return [value, name];
  };

  const formatHeatmapTooltip = (value, date) => {
    if (!value || !value.count) return null;
    return `${value.count} submissions on ${value.date}`;
  };

  const getHeatmapClassForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count === 1) return 'color-scale-1';
    if (value.count === 2) return 'color-scale-2';
    if (value.count <= 3) return 'color-scale-3';
    return 'color-scale-4';
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile data</p>
          <Button onClick={loadProfileData} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  const currentUser = profileData;
  const stats = statistics || {};
  const submissionStats = stats.submissionStats || { easy: { solved: 0, total: 0 }, medium: { solved: 0, total: 0 }, hard: { solved: 0, total: 0 } };
  const skills = stats.skills || {};
  const badges = stats.badges || [];
  const ratingHistory = stats.ratingHistory || [];
  const activityData = stats.activityData || [];

  const submissionData = [
    { name: 'Easy', value: submissionStats.easy?.solved || 0, total: submissionStats.easy?.total || 0, color: '#10B981' },
    { name: 'Medium', value: submissionStats.medium?.solved || 0, total: submissionStats.medium?.total || 0, color: '#F59E0B' },
    { name: 'Hard', value: submissionStats.hard?.solved || 0, total: submissionStats.hard?.total || 0, color: '#EF4444' }
  ];

  const skillsData = Object.entries(skills).map(([skill, level]) => ({
    skill,
    level,
    fullMark: 100
  }));

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Profile Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser.profile_photo} alt={currentUser.name} />
                    <AvatarFallback className="text-2xl">
                      {currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                    <p className="text-muted-foreground">{currentUser.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className="text-base px-3 py-1">
                      {stats.rank || 'Unranked'}
                    </Badge>
                    <div className="text-lg font-semibold text-primary">
                      Rating: {stats.rating || 0}
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
                  <div className="text-3xl font-bold text-primary mb-2">{stats.problemsSolved || 0}</div>
                  <div className="text-sm text-muted-foreground">Problems Solved</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">{stats.acceptanceRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-info mb-2">{stats.totalSubmissions || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Submissions</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">{badges.length}</div>
                  <div className="text-sm text-muted-foreground">Badges Earned</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submission Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Statistics</CardTitle>
                <CardDescription>Distribution of solved problems by difficulty</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={submissionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {submissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rating History */}
            <Card>
              <CardHeader>
                <CardTitle>Rating History</CardTitle>
                <CardDescription>Your contest performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={ratingHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} formatter={formatRatingTooltip} />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Map</CardTitle>
              <CardDescription>Your coding activity over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <style>
                {`
                  .react-calendar-heatmap .color-empty { fill: hsl(var(--muted)); }
                  .react-calendar-heatmap .color-scale-1 { fill: hsl(var(--primary) / 0.3); }
                  .react-calendar-heatmap .color-scale-2 { fill: hsl(var(--primary) / 0.5); }
                  .react-calendar-heatmap .color-scale-3 { fill: hsl(var(--primary) / 0.7); }
                  .react-calendar-heatmap .color-scale-4 { fill: hsl(var(--primary)); }
                  .react-calendar-heatmap text { fill: hsl(var(--muted-foreground)); font-size: 10px; }
                `}
              </style>
              <CalendarHeatmap
                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                endDate={new Date()}
                values={activityData}
                classForValue={getHeatmapClassForValue}
                tooltipDataAttrs={(value) => {
                  return {
                    'data-tip': formatHeatmapTooltip(value, value?.date),
                  };
                }}
                showWeekdayLabels={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          {/* Badges Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Earned Badges</span>
              </CardTitle>
              <CardDescription>
                Achievements you've unlocked through your coding journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
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

          {/* Skills Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Breakdown</CardTitle>
              <CardDescription>Your proficiency across different topics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                    tickCount={6}
                  />
                  <Radar
                    name="Skill Level"
                    dataKey="level"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
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
                  disabled={isLoading}
                >
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
                    disabled={!isEditing || isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_no: e.target.value }))}
                    disabled={!isEditing || isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    disabled={!isEditing || isLoading}
                  />
                </div>

                {currentUser.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="roll_number">Roll Number</Label>
                      <Input
                        id="roll_number"
                        value={formData.roll_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, roll_number: e.target.value }))}
                        disabled={!isEditing || isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year_of_study">Year of Study</Label>
                      <Select
                        value={formData.year_of_study.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, year_of_study: parseInt(value) }))}
                        disabled={!isEditing || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}st Year
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        value={formData.section}
                        onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                  </>
                )}

                {currentUser.role === 'teacher' && (
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <Button
                  variant="outline"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  disabled={isLoading}
                >
                  {isChangingPassword ? 'Cancel' : 'Change Password'}
                </Button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
                      <Input
                        id="new_password_confirmation"
                        type="password"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handlePasswordChange} disabled={isLoading}>
                      {isLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Photo</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentUser.profile_photo} alt={currentUser.name} />
                    <AvatarFallback className="text-lg">
                      {currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      Upload New Photo
                    </Button>
                    {currentUser.profile_photo && (
                      <Button
                        variant="outline"
                        onClick={handleDeletePhoto}
                        disabled={isLoading}
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
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
