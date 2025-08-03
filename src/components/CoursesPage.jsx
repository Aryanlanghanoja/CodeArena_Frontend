import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Search, 
  Filter,
  PlayCircle,
  Award,
  TrendingUp,
  Code,
  Database,
  Brain
} from 'lucide-react';

const CoursesPage = ({ onCourseSelect, onBackToDashboard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Mock courses data
  const courses = [
    {
      id: '1',
      title: 'Complete Data Structures & Algorithms Masterclass',
      description: 'Master the fundamentals of DSA with hands-on coding exercises and real-world applications.',
      instructor: 'Dr. Sarah Chen',
      duration: '12 weeks',
      level: 'Intermediate',
      rating: 4.8,
      students: 15420,
      progress: 65,
      thumbnail: '/api/placeholder/400/250',
      category: 'Algorithms',
      price: 89,
      lessons: 156,
      skills: ['Arrays', 'Linked Lists', 'Trees', 'Dynamic Programming']
    },
    {
      id: '2',
      title: 'JavaScript Fundamentals for Beginners',
      description: 'Learn JavaScript from scratch with interactive exercises and modern ES6+ features.',
      instructor: 'Mike Johnson',
      duration: '8 weeks',
      level: 'Beginner',
      rating: 4.9,
      students: 23150,
      progress: 0,
      thumbnail: '/api/placeholder/400/250',
      category: 'Programming',
      price: 49,
      lessons: 98,
      skills: ['Variables', 'Functions', 'DOM', 'Async Programming']
    },
    {
      id: '3',
      title: 'Advanced React Development',
      description: 'Build scalable React applications with hooks, context, and modern patterns.',
      instructor: 'Emily Rodriguez',
      duration: '10 weeks',
      level: 'Advanced',
      rating: 4.7,
      students: 8940,
      progress: 30,
      thumbnail: '/api/placeholder/400/250',
      category: 'Frontend',
      price: 129,
      lessons: 124,
      skills: ['Hooks', 'Context API', 'Redux', 'Testing']
    },
    {
      id: '4',
      title: 'Database Design & SQL Mastery',
      description: 'Master database design principles and advanced SQL queries for real applications.',
      instructor: 'Prof. David Kumar',
      duration: '6 weeks',
      level: 'Intermediate',
      rating: 4.6,
      students: 12650,
      progress: 0,
      thumbnail: '/api/placeholder/400/250',
      category: 'Database',
      price: 79,
      lessons: 87,
      skills: ['SQL', 'Database Design', 'Optimization', 'NoSQL']
    },
    {
      id: '5',
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to ML concepts with practical Python implementations and projects.',
      instructor: 'Dr. Lisa Zhang',
      duration: '14 weeks',
      level: 'Advanced',
      rating: 4.9,
      students: 19420,
      progress: 0,
      thumbnail: '/api/placeholder/400/250',
      category: 'AI/ML',
      price: 149,
      lessons: 178,
      skills: ['Python', 'Scikit-learn', 'Neural Networks', 'Data Analysis']
    },
    {
      id: '6',
      title: 'System Design Interview Prep',
      description: 'Prepare for system design interviews with real-world case studies and practice.',
      instructor: 'Alex Thompson',
      duration: '4 weeks',
      level: 'Advanced',
      rating: 4.8,
      students: 7830,
      progress: 0,
      thumbnail: '/api/placeholder/400/250',
      category: 'Interview Prep',
      price: 99,
      lessons: 45,
      skills: ['Scalability', 'Load Balancing', 'Microservices', 'Caching']
    }
  ];

  const categories = ['All', 'Algorithms', 'Programming', 'Frontend', 'Database', 'AI/ML', 'Interview Prep'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-success bg-success/10 border-success/20';
      case 'Intermediate': return 'text-warning bg-warning/10 border-warning/20';
      case 'Advanced': return 'text-error bg-error/10 border-error/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Algorithms': return <Brain className="w-4 h-4" />;
      case 'Programming': return <Code className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button onClick={onBackToDashboard} variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-2">Enhance your skills with our comprehensive learning paths</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
                <div className="text-sm font-semibold text-primary">Trending</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search courses, instructors, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-foreground"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Level Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-foreground"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer group"
              onClick={() => onCourseSelect(course.id)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {getCategoryIcon(course.category)}
                  <span className="ml-2 text-lg font-semibold text-foreground">{course.category}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
                {course.progress !== undefined && course.progress > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-secondary text-secondary-foreground">
                      {course.progress}% Complete
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-6 text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">by {course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${course.price}</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                {course.progress !== undefined && course.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skills.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <PlayCircle className="w-4 h-4 mr-1" />
                      {course.lessons}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-warning mr-1 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students.toLocaleString()} students
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {course.progress !== undefined && course.progress > 0 ? 'Continue' : 'Enroll Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;