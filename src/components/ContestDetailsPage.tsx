import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const ContestDetailsPage = ({ contest, onBackToContests, onProblemSelect }: any) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (now < start) {
        // Contest hasn't started
        const diff = start.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`Starts in ${days}d ${hours}h ${minutes}m`);
      } else if (now >= start && now <= end) {
        // Contest is active
        const diff = end.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        // Contest has ended
        setTimeRemaining('Contest ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest.startTime, contest.endTime]);

  const getContestStatus = () => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
  };

  const getStatusBadge = () => {
    const status = getContestStatus();
    const variants = {
      upcoming: 'secondary',
      live: 'default',
      ended: 'outline'
    };
    
    const colors = {
      upcoming: 'text-info',
      live: 'text-success',
      ended: 'text-muted-foreground'
    };

    const labels = {
      upcoming: 'Upcoming',
      live: 'Live',
      ended: 'Ended'
    };

    return (
      <Badge variant={variants[status] as any} className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getProblemStatusIcon = (problem) => {
    if (problem.solved) {
      return (
        <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (problem.attempted) {
      return (
        <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
      </svg>
    );
  };

  const getActionButton = (problem) => {
    const status = getContestStatus();
    
    if (status === 'ended') {
      return (
        <Button variant="outline" size="sm" disabled>
          View Solution
        </Button>
      );
    }
    
    if (status === 'upcoming') {
      return (
        <Button variant="outline" size="sm" disabled>
          Not Started
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={() => onProblemSelect(problem)}>
        {problem.solved ? 'Review' : problem.attempted ? 'Continue' : 'Solve'}
      </Button>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    const solvedProblems = contest.problems.filter(p => p.solved).length;
    return (solvedProblems / contest.problems.length) * 100;
  };

  const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

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

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBackToContests} className="mb-4">
        <BackIcon className="w-4 h-4 mr-2" />
        Back to Contests
      </Button>

      {/* Contest Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{contest.title}</CardTitle>
              <CardDescription className="text-base">{contest.description}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Contest Timer</span>
              </div>
              <span className="text-lg font-mono font-bold text-primary">
                {timeRemaining}
              </span>
            </div>
          </div>

          {/* Contest Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">DURATION</h4>
              <p className="font-medium">{contest.duration}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">START TIME</h4>
              <p className="font-medium">{formatDateTime(contest.startTime)}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">END TIME</h4>
              <p className="font-medium">{formatDateTime(contest.endTime)}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center space-x-4">
            <UsersIcon className="w-5 h-5 text-muted-foreground" />
            <span>{contest.participants} / {contest.maxParticipants} participants</span>
            <Progress 
              value={(contest.participants / contest.maxParticipants) * 100} 
              className="w-32"
            />
          </div>

          {/* Your Progress */}
          {getContestStatus() !== 'upcoming' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Your Progress</h4>
                <span className="text-sm text-muted-foreground">
                  {contest.problems.filter(p => p.solved).length} / {contest.problems.length} solved
                </span>
              </div>
              <Progress value={getProgressPercentage()} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
          <CardDescription>
            Solve all problems to complete the contest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contest.problems.map((problem, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell>
                    {getProblemStatusIcon(problem)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => onProblemSelect(problem)}
                      className="text-left hover:text-primary transition-colors font-medium"
                      disabled={getContestStatus() === 'upcoming'}
                    >
                      {problem.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{problem.points} pts</Badge>
                  </TableCell>
                  <TableCell>
                    {getActionButton(problem)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rules and Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contest Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Scoring</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each problem has a fixed point value</li>
                <li>• Faster submissions receive higher scores</li>
                <li>• Wrong submissions incur time penalties</li>
                <li>• Final ranking based on total score</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Individual participation only</li>
                <li>• No external help or collaboration</li>
                <li>• Use any programming language</li>
                <li>• Standard library functions allowed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContestDetailsPage;