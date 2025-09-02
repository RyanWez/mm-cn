import { config } from 'dotenv';
config();

import '@/ai/flows/translate-customer-queries.ts';
import '@/ai/flows/suggest-common-replies.ts';