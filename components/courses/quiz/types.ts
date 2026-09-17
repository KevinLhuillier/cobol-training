export type QuizQuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

export interface QuizAnswer {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
}

export interface QuizQuestion {
    id: string;
    type: QuizQuestionType;
    text: string;
    answers: QuizAnswer[];
}

export interface QuizAttempt {
    id: string;
    score: number;
    total: number;
    passed: boolean;
    createdAt: string;
}
