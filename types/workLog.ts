export type TaskStatus = 'development' | 'testing' | 'staging' | 'released';

export interface RepoBranch {
  id: string;
  repository: string;
  branch: string;
}

export interface WorkLog {
  id: string;
  requirement: string;
  note?: string;
  repoBranches: RepoBranch[];
  yunxiaoId: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

export type WorkLogFormData = Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>;
