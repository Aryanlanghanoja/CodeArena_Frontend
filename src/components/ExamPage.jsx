import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, CheckCircle, XCircle, Clock, BookOpen, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExamPage = ({ onBackToDashboard }) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock exam data
  const examQuestions = [
    {
      id: '1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search divides the search space in half with each iteration, resulting in O(log n) time complexity.',
      difficulty: 'medium',
      subject: 'Algorithms'
    },
    {
      id: '2',
      question: 'Which data structure uses LIFO (Last In, First Out) principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 1,
      explanation: 'A stack follows LIFO principle where the last element added is the first one to be removed.',
      difficulty: 'easy',
      subject: 'Data Structures'
    },
    {
      id: '3',
      question: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
      correctAnswer: 1,
      explanation: 'QuickSort has O(n²) worst-case complexity when the pivot is always the smallest or largest element.',
      difficulty: 'hard',
      subject: 'Algorithms'
    }
  ];

  // Timer effect
  useEffect(() => {
    if (examStarted && !examFinished && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setExamFinished(true);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, examFinished, timeRemaining]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    toast({
      title: "Exam Started",
      description: "Good luck! You have 1 hour to complete the exam.",
    });
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setAnswers({ ...answers, [currentQuestion]: selectedAnswer });
      setSelectedAnswer(null);
      
      if (currentQuestion < examQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setExamFinished(true);
        setShowResults(true);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    examQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: examQuestions.length, percentage: Math.round((correct / examQuestions.length) * 100) };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-error';
      default: return 'text-foreground';
    }
  };

  // Pre-exam screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onBackToDashboard} variant="ghost" className="mb-6">
            ← Back to Dashboard
          </Button>
          
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Data Structures & Algorithms Exam</CardTitle>
              <p className="text-muted-foreground mt-2">Test your knowledge with our comprehensive assessment</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground">Duration</h3>
                    <p className="text-muted-foreground">60 minutes</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground">Questions</h3>
                    <p className="text-muted-foreground">{examQuestions.length} Multiple Choice</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 text-warning mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground">Passing Score</h3>
                    <p className="text-muted-foreground">70%</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-muted/10 p-4 rounded-lg border-border border">
                <h3 className="font-semibold text-foreground mb-2">Exam Instructions:</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Read each question carefully before selecting your answer</li>
                  <li>• You can navigate between questions using the Previous/Next buttons</li>
                  <li>• Make sure to answer all questions before time runs out</li>
                  <li>• Once you submit, you cannot modify your answers</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button onClick={handleStartExam} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                  <Timer className="w-5 h-5 mr-2" />
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const score = calculateScore();
    const passed = score.percentage >= 70;
    
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-success/10' : 'bg-error/10'}`}>
                {passed ? <CheckCircle className="w-10 h-10 text-success" /> : <XCircle className="w-10 h-10 text-error" />}
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {passed ? 'Congratulations!' : 'Keep Learning!'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {passed ? 'You have successfully passed the exam!' : 'You need more practice. Try again!'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">{score.percentage}%</div>
                <p className="text-muted-foreground">Your Score</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {score.correct} out of {score.total} questions correct
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Performance Breakdown</h3>
                    <div className="space-y-2">
                      {examQuestions.map((question, index) => (
                        <div key={question.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Question {index + 1}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            {answers[index] === question.correctAnswer ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-error" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Next Steps</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {passed ? (
                        <>
                          <p>• Explore advanced topics</p>
                          <p>• Take practice challenges</p>
                          <p>• Join coding contests</p>
                        </>
                      ) : (
                        <>
                          <p>• Review incorrect answers</p>
                          <p>• Practice more problems</p>
                          <p>• Retake the exam when ready</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={onBackToDashboard} variant="outline">
                  Back to Dashboard
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
                  Retake Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam interface
  const currentQ = examQuestions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / examQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-primary border-primary">
              Question {currentQuestion + 1} of {examQuestions.length}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(currentQ.difficulty)}>
              {currentQ.difficulty}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 bg-card px-4 py-2 rounded-lg border-border border">
            <Timer className="w-5 h-5 text-error" />
            <span className="text-error font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Progress: {Math.round(progressPercentage)}%</p>
        </div>

        {/* Question Card */}
        <Card className="bg-card border-border shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{currentQ.subject}</Badge>
            </div>
            <CardTitle className="text-xl text-foreground leading-relaxed">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                    selectedAnswer === index
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-muted/20 hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => handleAnswerSelect(index)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedAnswer === index ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                    )}
                  </div>
                  <span className="text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {currentQuestion === examQuestions.length - 1 ? 'Finish Exam' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;