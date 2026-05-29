// Sesuaikan dengan Enum status baru di backend
export type JobStatus = 'NEW' | 'ASSIGNED' | 'TRANSCRIBED' | 'REVIEWED' | 'COMPLETED';

export interface Reporter {
  id: string;
  name: string;
  location: string;
  availability: boolean;
}

export interface Editor {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  caseName: string;
  duration: number;
  locationType: 'PHYSICAL' | 'REMOTE';
  roomLocation: string;
  status: JobStatus;
  reporterId: string | null;
  reporter: any | null;
  editorId: string | null;
  editor: any | null;
  // Kalkulasi Pembayaran
  reporterRate: number;
  editorFlatFee: number;
  reporterEarnings: number;
  editorEarnings: number;
  totalPayout: number;
}