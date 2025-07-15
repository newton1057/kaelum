'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { SuggestedQuestion } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelectQuestion: (question: SuggestedQuestion) => void;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full mb-4"
    >
      <CarouselContent>
        {questions.map((q) => (
          <CarouselItem key={q.id} className="sm:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
              <Card
                className="cursor-pointer transition-colors hover:bg-muted h-full flex flex-col justify-start"
                onClick={() => onSelectQuestion(q)}
              >
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{q.question}</p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
