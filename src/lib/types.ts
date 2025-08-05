export type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  reasoning?: string;
  isReasoningComplete?: boolean;
  timestamp?: number;
  isLoading?: boolean;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export type SuggestedQuestion = {
  id: string;
  question: string;
  reasoning: string;
  answer: string;
};

export type PatientData = {
  name: string;
  age?: number;
  gender?: 'Masculino' | 'Femenino' | 'Otro';
  height?: number;
  weight?: number;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
};
