"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MODELS } from '@/lib/models';
import type { Model } from '@/lib/types';

interface ModelSelectorProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const handleValueChange = (value: string) => {
    const model = MODELS.find((m) => m.id === value);
    if (model) {
      onModelChange(model);
    }
  };

  return (
    <Select value={selectedModel.id} onValueChange={handleValueChange}>
      <SelectTrigger className="w-auto border-2">
        <SelectValue>
          <span className="font-bold">{selectedModel.name}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <span className="font-bold">{model.name}</span>
              <span className="text-xs text-muted-foreground">
                {model.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
