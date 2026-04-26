import type { Job, Candidate, Worker } from "@/types/hiring";

export async function fetchJobs(): Promise<Job[]> {
  throw new Error("Not implemented — connect to API");
}

export async function fetchCandidates(_jobId?: string): Promise<Candidate[]> {
  throw new Error("Not implemented — connect to API");
}

export async function fetchWorkers(): Promise<Worker[]> {
  throw new Error("Not implemented — connect to API");
}
