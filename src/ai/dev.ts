import { config } from 'dotenv';
config();

import '@/ai/flows/initial-health-query.ts';
import '@/ai/flows/analyze-lab-results.ts';
import '@/ai/flows/analyze-prescription.ts';
