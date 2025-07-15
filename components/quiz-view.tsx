"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface QuizData {
    questions: QuizQuestion[];
}

interface QuizViewProps {
    quizData: string;
}

export function QuizView({ quizData }: QuizViewProps) {
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const quiz: QuizData | null = useMemo(() => {
        try {
            // The AI sometimes returns a JSON object wrapped in markdown.
            const cleanedJsonString = quizData.replace(/```json\n|```/g, '').trim();
            return JSON.parse(cleanedJsonString);
        } catch (error) {
            console.error("Failed to parse quiz data:", error);
            return null;
        }
    }, [quizData]);

    if (!quiz) {
        return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Could not load the quiz. The data might be malformed.</AlertDescription>
            </Alert>
        );
    }
    
    const handleAnswerChange = (questionIndex: number, value: string) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: value }));
    };

    const handleSubmit = () => {
        let currentScore = 0;
        quiz.questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                currentScore++;
            }
        });
        setScore(currentScore);
        setSubmitted(true);
    };

    const isCorrect = (questionIndex: number) => {
        return userAnswers[questionIndex] === quiz.questions[questionIndex].correctAnswer;
    }
    
    const getOptionClass = (questionIndex: number, option: string) => {
        if (!submitted) return "";
        const question = quiz.questions[questionIndex];
        if (option === question.correctAnswer) {
            return "text-orange-600 dark:text-orange-400 font-bold";
        }
        if (option === userAnswers[questionIndex] && option !== question.correctAnswer) {
            return "text-red-600 dark:text-red-400 font-bold line-through";
        }
        return "text-muted-foreground";
    };

    return (
        <div className="space-y-6">
            {quiz.questions.map((q, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                        <CardDescription>{q.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            onValueChange={(value) => handleAnswerChange(index, value)}
                            disabled={submitted}
                            value={userAnswers[index]}
                        >
                            {q.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`q${index}-o${optionIndex}`} />
                                    <Label htmlFor={`q${index}-o${optionIndex}`} className={getOptionClass(index, option)}>
                                        {option}
                                    </Label>
                                    {submitted && option === q.correctAnswer && <CheckCircle className="h-4 w-4 text-orange-500" />}
                                    {submitted && userAnswers[index] === option && option !== q.correctAnswer && <XCircle className="h-4 w-4 text-red-500" />}
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}

            {submitted ? (
                 <Alert className="mt-6 border-blue-500 text-blue-800 dark:border-blue-400 dark:text-blue-300">
                    <AlertTitle className="font-bold">Quiz Complete!</AlertTitle>
                    <AlertDescription>You scored {score} out of {quiz.questions.length}.</AlertDescription>
                </Alert>
            ) : (
                <Button onClick={handleSubmit} className="w-full">
                    Submit Quiz
                </Button>
            )}
        </div>
    );
}
