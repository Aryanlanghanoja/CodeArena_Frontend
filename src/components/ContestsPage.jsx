import React, { useState, useMemo } from 'react';
import { mockContests } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const ContestsPage = ({ onContestSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const getContestStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'completed';
  };

  const filteredContests = useMemo(() => {
    return mockContests.filter(contest => {
      const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contest.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'All Status') return matchesSearch;
      
      const status = getContestStatus(contest);
      return matchesSearch && status === statusFilter.toLowerCase();
    });
  }, [searchQuery, statusFilter]);

  const contestsByStatus = useMemo(() => {
    const grouped = {
      upcoming: [],
      active: [],
      completed: []
    };

    filteredContests.forEach(contest => {
      const status = getContestStatus(contest);
      grouped[status].push(contest);
    });

    return grouped;
  }, [filteredContests]);

  const getStatusBadge = (contest) => {
    const status = getContestStatus(contest);
    const variants = {
      upcoming: 'secondary',
      active: 'default',
      completed: 'outline'
    };
    
    const colors = {
      upcoming: 'text-info',
      active: 'text-success',
      completed: 'text-muted-foreground'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getActionButton = (contest) => {
    const status = getContestStatus(contest);
    
    switch (status) {
      case 'upcoming':
        return (
          <Button variant="outline" onClick={() => onContestSelect(contest)}>
            View Details
          </Button>
        );
      case 'active':
        return (
          <Button onClick={() => onContestSelect(contest)}>
            Participate
          </Button>
        );
      case 'completed':
        return (
          <Button variant="outline" onClick={() => onContestSelect(contest)}>
            View Results
          </Button>
        );
      default:
        return null;
    }
  };

  const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );

  const CalendarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const ContestCard = ({ contest }) => {
    const startDateTime = formatDateTime(contest.startTime);
    const endDateTime = formatDateTime(contest.endTime);
    const status = getContestStatus(contest);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{contest.title}</CardTitle>
              <CardDescription className="mt-1">{contest.description}</CardDescription>
            </div>
            {getStatusBadge(contest)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <span>{contest.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span>{startDateTime.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-4 h-4 text-muted-foreground" />
              <span>{contest.participants} participants</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <div>
              <strong>Start:</strong> {startDateTime.date} at {startDateTime.time}
            </div>
            <div>
              <strong>End:</strong> {endDateTime.date} at {endDateTime.time}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {contest.problems.length} problems
            </span>
            {getActionButton(contest)}
          </div>
        </CardContent>
      </Card>
    );
  };

  const SummaryCard = ({ title, count, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{count}</p>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Contests</h1>
        <p className="text-muted-foreground">
          Participate in coding contests to test your skills against other programmers.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Contests"
          count={mockContests.length}
          icon={ClockIcon}
          color="text-primary"
        />
        <SummaryCard
          title="Upcoming"
          count={contestsByStatus.upcoming.length}
          icon={CalendarIcon}
          color="text-info"
        />
        <SummaryCard
          title="Active"
          count={contestsByStatus.active.length}
          icon={UsersIcon}
          color="text-success"
        />
        <SummaryCard
          title="Completed"
          count={contestsByStatus.completed.length}
          icon={ClockIcon}
          color="text-muted-foreground"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search contests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contests Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Contests</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContests.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contestsByStatus.upcoming.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contestsByStatus.active.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contestsByStatus.completed.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredContests.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No contests found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ContestsPage;