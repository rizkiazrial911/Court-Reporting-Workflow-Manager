import React from 'react';
import type { Job, Reporter, Editor, JobStatus } from '../types';
import { JobRow } from './JobRow';

interface JobTableProps {
  jobs: Job[];
  reporters: Reporter[];
  editors: Editor[];
  onAssign: (jobId: string, reporterId: string | null, editorId: string | null) => void;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
  onEdit: (job: Job) => void; // Added prop
}

export const JobTable: React.FC<JobTableProps> = ({ jobs, reporters, editors, onAssign, onUpdateStatus, onEdit }) => {
  return (
    <div className="card shadow-sm border-0 bg-white">
      <div className="table-responsive p-3" style={{ overflowX: 'auto' }}>
        <table className="table table-hover align-middle m-0" style={{ minWidth: '1000px' }}>
          <thead className="table-light text-secondary small">
            <tr>
              <th style={{ width: '25%' }}>Audio Recording Details</th>
              <th style={{ width: '18%' }}>1. Assign Reporter</th>
              <th style={{ width: '18%' }}>2. Assign Editor</th>
              <th style={{ width: '18%' }}>3. Track Status</th>
              <th style={{ width: '21%' }} className="text-end">4. Total Payout</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">No transcription jobs found for this filter.</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <JobRow 
                  key={job.id} 
                  job={job} 
                  reporters={reporters} 
                  editors={editors} 
                  onAssign={onAssign} 
                  onUpdateStatus={onUpdateStatus} 
                  onEdit={onEdit} // Passed callback down
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};