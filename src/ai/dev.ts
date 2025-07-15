import { config } from 'dotenv';
config();

import '@/ai/flows/generate-chat-title.ts';
import '@/ai/flows/suggest-follow-up-questions.ts';
import '@/ai/flows/summarize-chat-history.ts';