import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import questionsService from '../../services/questionsService';
import ProblemSolvingPage from '../ProblemSolvingPage';

const StudentQuestionSolver = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const result = await questionsService.getQuestion(questionId);
      
      if (result.success) {
        // Transform the question data to match ProblemSolvingPage format
        const transformedQuestion = transformQuestionData(result.data);
        setQuestion(transformedQuestion);
      } else {
        toast({
          title: "Error",
          description: "Failed to load question details",
          variant: "destructive"
        });
        navigate('/student/practice');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast({
        title: "Error",
        description: "Failed to load question details",
        variant: "destructive"
      });
      navigate('/student/practice');
    } finally {
      setLoading(false);
    }
  };

  const transformQuestionData = (questionData) => {
    // Transform the database question format to match ProblemSolvingPage expected format
    return {
      id: questionData.question_id,
      title: questionData.question_title,
      difficulty: questionData.difficulty,
      topic: questionData.tags || 'General',
      company: 'CodeArena', // Default company
      description: questionData.description,
      constraints: questionData.constraints ? questionData.constraints.split('\n').filter(c => c.trim()) : [],
      examples: questionData.testcases?.filter(tc => tc.is_visible).map((tc, index) => ({
        input: tc.stdin,
        output: tc.expected_output,
        explanation: `Test case ${index + 1}`
      })) || [],
      testCases: questionData.testcases?.filter(tc => tc.is_visible).map(tc => ({
        input: tc.stdin,
        expectedOutput: tc.expected_output
      })) || [],
      starterCode: {
        javascript: `// Write your solution here
function solution() {
    // Your code goes here
}`,
        python: `# Write your solution here
def solution():
    # Your code goes here
    pass`,
        cpp: `// Write your solution here
#include <iostream>
using namespace std;

int main() {
    // Your code goes here
    return 0;
}`,
        java: `// Write your solution here
public class Solution {
    public static void main(String[] args) {
        // Your code goes here
    }
}`,
        c: `// Write your solution here
#include <stdio.h>

int main() {
    // Your code goes here
    return 0;
}`,
        csharp: `// Write your solution here
using System;

class Solution {
    static void Main() {
        // Your code goes here
    }
}`,
        php: `<?php
// Write your solution here
function solution() {
    // Your code goes here
}
?>`,
        ruby: `# Write your solution here
def solution
    # Your code goes here
end`,
        go: `package main

import "fmt"

func main() {
    // Your code goes here
}`,
        rust: `// Write your solution here
fn main() {
    // Your code goes here
}`,
        swift: `// Write your solution here
import Foundation

func solution() {
    // Your code goes here
}`,
        kotlin: `// Write your solution here
fun main() {
    // Your code goes here
}`,
        scala: `// Write your solution here
object Solution {
    def main(args: Array[String]): Unit = {
        // Your code goes here
    }
}`,
        perl: `# Write your solution here
sub solution {
    # Your code goes here
}`,
        haskell: `-- Write your solution here
main = do
    -- Your code goes here
    return ()`,
        lua: `-- Write your solution here
function solution()
    -- Your code goes here
end`,
        r: `# Write your solution here
solution <- function() {
    # Your code goes here
}`,
        dart: `// Write your solution here
void main() {
    // Your code goes here
}`,
        elixir: `# Write your solution here
defmodule Solution do
    def solution do
        # Your code goes here
    end
end`,
        erlang: `% Write your solution here
-module(solution).
-export([solution/0]).

solution() ->
    % Your code goes here
    ok.`,
        clojure: `;; Write your solution here
(defn solution []
    ;; Your code goes here
    )`,
        fsharp: `// Write your solution here
open System

[<EntryPoint>]
let main argv =
    // Your code goes here
    0`,
        fortran: `! Write your solution here
program solution
    ! Your code goes here
end program solution`,
        ocaml: `(* Write your solution here *)
let solution () =
    (* Your code goes here *)
    ()`,
        pascal: `program solution;
begin
    (* Your code goes here *)
end.`,
        prolog: `% Write your solution here
solution :-
    % Your code goes here
    true.`,
        scheme: `;; Write your solution here
(define (solution)
    ;; Your code goes here
    )`,
        vbnet: `' Write your solution here
Module Solution
    Sub Main()
        ' Your code goes here
    End Sub
End Module`,
        bash: `#!/bin/bash
# Write your solution here
solution() {
    # Your code goes here
}`,
        powershell: `# Write your solution here
function solution {
    # Your code goes here
}`,
        typescript: `// Write your solution here
function solution(): void {
    // Your code goes here
}`,
        assembly: `; Write your solution here
section .text
    global _start

_start:
    ; Your code goes here
    mov eax, 1
    int 0x80`,
        cobol: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SOLUTION.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       PROCEDURE DIVISION.
       * Your code goes here
       STOP RUN.`,
        vim: `" Write your solution here
function! Solution()
    " Your code goes here
endfunction`,
        zig: `// Write your solution here
const std = @import("std");

pub fn main() !void {
    // Your code goes here
}`
      },
      acceptanceRate: 85.2, // Default value
      totalSubmissions: 1250, // Default value
      solved: false, // Default value
      bestScore: 0, // Default value
      lastAttempt: null, // Default value
      timeLimit: 1000, // Default value in ms
      memoryLimit: 128, // Default value in MB
      allowedLanguages: ['javascript', 'python', 'cpp']
    };
  };

  const handleBackToProblemList = () => {
    navigate('/student/practice');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Question not found</h3>
          <p className="text-muted-foreground mb-4">The question you're looking for doesn't exist or you don't have access to it.</p>
          <button 
            onClick={handleBackToProblemList}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Practice Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProblemSolvingPage 
      problem={question} 
      onBackToProblemList={handleBackToProblemList}
    />
  );
};

export default StudentQuestionSolver;
