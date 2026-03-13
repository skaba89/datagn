import { Queue } from "bullmq";
import { JobType } from "@prisma/client";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

// File principale pour les jobs DataGN
export const dataGNQueue = new Queue<DataGNJobPayload>("datagn-jobs", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export interface DataGNJobPayload {
  type: JobType;
  workspaceId: string;
  jobRunId: string;
  datasetVersionId?: string;
  question?: string;
}

export { redisConnection };
