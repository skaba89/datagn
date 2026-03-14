/**
 * Sentry Server Configuration
 * This file is loaded on the server side
 */

import * as Sentry from '@sentry/nextjs';
import { initSentry } from '@/lib/sentry';

initSentry();

export { Sentry };
