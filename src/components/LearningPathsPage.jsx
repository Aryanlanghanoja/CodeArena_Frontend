import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Clock, 
  Award, 
  CheckCircle, 
  Play,
  BookOpen,
  Code,
  Database,
  Brain,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

const LearningPathsPage = ({ onPathSelect, onBackToDashboard }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const learningPaths = [
    {
      id: '1',
      title: 'Full Stack Web Developer',
      description: 'Master both frontend and backend development with modern technologies like React, Node.js, and databases.',
      difficulty: 'Intermediate',
      duration: '6 months',
      courses: 12,
      projects: 8,
      skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
      progress: 45,
      enrolled: true,
      category: 'Web Development',
      icon: 'code',
      estimatedHours: 240,
      completionRate: 78,
      nextMilestone: 'React Advanced Patterns'
    },
    {
      id: '2',
      title: 'Data Science & Analytics',
      description: 'Learn data analysis, machine learning, and statistical modeling with Python and popular libraries.',
      difficulty: 'Advanced',
      duration: '8 months',
      courses: 15,
      projects: 10,
      skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'SQL'],
      progress: 0,
      enrolled: false,
      category: 'Data Science',
      icon: 'brain',
      estimatedHours: 320,
      completionRate: 85
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'Build native and cross-platform mobile applications using React Native and Flutter.',
      difficulty: 'Intermediate',
      duration: '5 months',
      courses: 10,
      projects: 6,
      skills: ['React Native', 'Flutter', 'Dart', 'iOS', 'Android', 'Firebase'],
      progress: 20,
      enrolled: true,
      category: 'Mobile Development',
      icon: 'zap',
      estimatedHours: 200,
      completionRate: 82,
      nextMilestone: 'State Management with Redux'
    },
    {
      id: '4',
      title: 'DevOps & Cloud Engineering',
      description: 'Master deployment, CI/CD, containerization, and cloud platforms like AWS and Azure.',
      difficulty: 'Advanced',
      duration: '7 months',
      courses: 14,
      projects: 12,
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux'],
      progress: 0,
      enrolled: false,
      category: 'DevOps',
      icon: 'target',
      estimatedHours: 280,
      completionRate: 79
    },
    {
      id: '5',
      title: 'Cybersecurity Specialist',
      description: 'Learn ethical hacking, network security, and security auditing to protect systems and data.',
      difficulty: 'Advanced',
      duration: '9 months',
      courses: 16,
      projects: 8,
      skills: ['Penetration Testing', 'Network Security', 'Cryptography', 'Risk Assessment'],
      progress: 0,
      enrolled: false,
      category: 'Security',
      icon: 'shield',
      estimatedHours: 360,
      completionRate: 73
    },
    {
      id: '6',
      title: 'Competitive Programming',
      description: 'Master algorithms and data structures for coding competitions and technical interviews.',
      difficulty: 'Intermediate',
      duration: '4 months',
      courses: 8,
      projects: 15,
      skills: ['Algorithms', 'Data Structures', 'Problem Solving', 'Math', 'Graph Theory'],
      progress: 75,
      enrolled: true,
      category: 'Algorithms',
      icon: 'trending-up',
      estimatedHours: 160,
      completionRate: 88,
      nextMilestone: 'Advanced Dynamic Programming'
    }
  ];

  const categories = ['All', 'Web Development', 'Data Science', 'Mobile Development', 'DevOps', 'Security', 'Algorithms'];

  const filteredPaths = learningPaths.filter(path => 
    selectedCategory === 'All' || path.category === selectedCategory
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-success bg-success/10 border-success/20';
      case 'Intermediate': return 'text-warning bg-warning/10 border-warning/20';
      case 'Advanced': return 'text-error bg-error/10 border-error/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'code': return <Code className="w-8 h-8" />;
      case 'brain': return <Brain className="w-8 h-8" />;
      case 'zap': return <Zap className="w-8 h-8" />;
      case 'target': return <Target className="w-8 h-8" />;
      case 'trending-up': return <TrendingUp className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={onBackToDashboard} variant="ghost" className="mb-4">
            ← Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center">
                <MapPin className="w-10 h-10 text-primary mr-3" />
                Learning Paths
              </h1>
              <p className="text-muted-foreground mt-2">Structured roadmaps to master your chosen field</p>
            </div>
            <Card className="bg-primary/10 border-primary/20 hidden md:block">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold text-primary">3 Paths</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Category Filter */}
        <Card className="mb-8 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredPaths.map((path) => (
            <Card 
              key={path.id} 
              className={`bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                path.enrolled ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={() => onPathSelect(path.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      {getIcon(path.icon)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground mb-2">{path.title}</CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed">{path.description}</p>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(path.difficulty)}>
                    {path.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Progress (for enrolled paths) */}
                {path.enrolled && (
                  <div className="bg-muted/20 p-4 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Your Progress</span>
                      <span className="text-sm text-primary font-bold">{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="mb-3" />
                    {path.nextMilestone && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Target className="w-3 h-3 mr-1" />
                        Next: {path.nextMilestone}
                      </div>
                    )}
                  </div>
                )}

                {/* Path Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/10 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{path.courses}</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                  <div className="bg-muted/10 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-secondary">{path.projects}</div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {path.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Path Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {path.duration}
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      {path.completionRate}% success rate
                    </div>
                  </div>
                  <div className="text-xs">
                    ~{path.estimatedHours}hrs
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {path.enrolled ? (
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Path
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPaths.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No learning paths found</h3>
            <p className="text-muted-foreground">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathsPage;