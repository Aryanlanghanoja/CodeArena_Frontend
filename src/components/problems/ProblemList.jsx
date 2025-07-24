import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Circle, 
  Clock,
  ThumbsUp,
  Star
} from "lucide-react";

export function ProblemList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const problems = [
    {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      solved: true,
      likes: 1247,
      acceptance: 85,
      tags: ["Array", "Hash Table", "Two Pointers"]
    },
    {
      id: "2", 
      title: "Binary Tree Inorder Traversal",
      difficulty: "Medium",
      category: "Tree",
      solved: false,
      likes: 892,
      acceptance: 73,
      tags: ["Tree", "DFS", "Binary Tree"]
    },
    {
      id: "3",
      title: "Merge k Sorted Lists",
      difficulty: "Hard",
      category: "Linked List",
      solved: false,
      likes: 1156,
      acceptance: 42,
      tags: ["Linked List", "Divide and Conquer", "Heap"]
    },
    {
      id: "4",
      title: "Valid Parentheses",
      difficulty: "Easy",
      category: "Stack",
      solved: true,
      likes: 967,
      acceptance: 91,
      tags: ["String", "Stack"]
    },
    {
      id: "5",
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      category: "String",
      solved: true,
      likes: 1543,
      acceptance: 67,
      tags: ["String", "Dynamic Programming"]
    },
    {
      id: "6",
      title: "Regular Expression Matching",
      difficulty: "Hard",
      category: "Dynamic Programming",
      solved: false,
      likes: 789,
      acceptance: 28,
      tags: ["String", "Dynamic Programming", "Recursion"]
    }
  ];

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "all" || problem.category === categoryFilter;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'danger';
      default: return 'secondary';
    }
  };

  const handleSolveProblem = (problemId) => {
    navigate(`/code-editor/${problemId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Array">Array</SelectItem>
                <SelectItem value="Tree">Tree</SelectItem>
                <SelectItem value="String">String</SelectItem>
                <SelectItem value="Dynamic Programming">DP</SelectItem>
                <SelectItem value="Stack">Stack</SelectItem>
                <SelectItem value="Linked List">Linked List</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Showing {filteredProblems.length} problems</span>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>Solved: {problems.filter(p => p.solved).length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredProblems.map((problem) => (
          <Card key={problem.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {problem.solved ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{problem.title}</h3>
                      <Badge 
                        variant={getDifficultyColor(problem.difficulty)}
                        className="text-xs"
                      >
                        {problem.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      {problem.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{problem.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{problem.acceptance}%</span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleSolveProblem(problem.id)}
                  >
                    Solve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No problems found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}