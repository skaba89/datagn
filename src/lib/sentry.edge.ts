/**
 * Sentry Edge Configuration
 * This file is loaded in Edge Runtime
 */

import * as Sentry from '@sentry/nextjs';
import { initSentry } from '@/lib/sentry';

initSentry();

export { Sentry };
