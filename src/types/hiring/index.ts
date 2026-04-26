export type JobStatus = "open" | "closed" | "draft";
export type CandidateStatus = "applied" | "shortlisted" | "interview" | "offer" | "hired" | "rejected";
export type WorkerAvailability = "available" | "assigned" | "unavailable" | "pending_onboarding";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  posted: string;
  status: JobStatus;
  description?: string;
};

export type Candidate = {
  id: string;
  name: string;
  role: string;
  status: CandidateStatus;
  appliedAt: string;
  jobId?: string;
};

export type Worker = {
  id: string;
  name: string;
  role: string;
  availability: WorkerAvailability;
  assignedProject?: string;
};
