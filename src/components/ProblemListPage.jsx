import React, { useState, useMemo } from 'react';
import { mockProblems, companies, topics, difficulties, statusOptions } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const ProblemListPage = ({ onViewChange, onProblemSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');

  const filteredProblems = useMemo(() => {
    return mockProblems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           problem.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'All' || 
                           (statusFilter === 'Solved' && problem.status === 'solved') ||
                           (statusFilter === 'Attempted' && problem.status === 'attempted') ||
                           (statusFilter === 'Todo' && !problem.status);
      const matchesTopic = topicFilter === 'All' || problem.topic === topicFilter;
      const matchesCompany = companyFilter === 'All' || problem.company === companyFilter;

      return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic && matchesCompany;
    });
  }, [searchQuery, difficultyFilter, statusFilter, topicFilter, companyFilter]);

  const getStatusIcon = (status) => {
    if (status === 'solved') {
      return (
        <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (status === 'attempted') {
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

  const getDifficultyVariant = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'default';
      case 'Medium': return 'secondary';
      case 'Hard': return 'destructive';
      default: return 'outline';
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-difficulty-easy';
      case 'Medium': return 'text-difficulty-medium';
      case 'Hard': return 'text-difficulty-hard';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Problem List</h1>
        <p className="text-muted-foreground">
          Practice coding problems to improve your algorithmic thinking and problem-solving skills.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Difficulty Filter */}
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Topic Filter */}
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Topics</SelectItem>
                {topics.slice(0, 20).map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Company Filter */}
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilter('All');
                setStatusFilter('All');
                setTopicFilter('All');
                setCompanyFilter('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredProblems.length} of {mockProblems.length} problems
        </p>
      </div>

      {/* Problems Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Acceptance Rate</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProblems.map((problem) => (
                <TableRow key={problem.id} className="hover:bg-muted/50">
                  <TableCell>
                    {getStatusIcon(problem.status)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => onProblemSelect(problem)}
                      className="text-left hover:text-primary transition-colors font-medium"
                    >
                      {problem.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{problem.topic}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getDifficultyClass(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {problem.acceptanceRate}%
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{problem.company}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => onProblemSelect(problem)}
                    >
                      Solve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredProblems.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No problems found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default ProblemListPage;