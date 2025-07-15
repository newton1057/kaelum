'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { SuggestedQuestion } from '@/lib/types';

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelectQuestion: (question: SuggestedQuestion) => void;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {questions.map((q) => (
        <Card
          key={q.id}
          className="cursor-pointer transition-colors hover:bg-muted"
          onClick={() => onSelectQuestion(q)}
        >
          <CardContent className="p-4">
            <p className="text-sm font-medium">{q.question}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
