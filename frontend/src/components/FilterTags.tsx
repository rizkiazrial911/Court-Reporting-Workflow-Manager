import React from 'react';
import type { Job, JobStatus } from '../types';

interface FilterTagsProps {
  jobs: Job[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({ jobs, activeFilter, setActiveFilter }) => {
  const getCount = (status: JobStatus) => jobs.filter(j => j.status === status).length;

  return (
    <div className="mb-4 d-flex flex-wrap align-items-center gap-2">
      <span className="text-secondary small fw-bold me-2">Tracking Shortcuts:</span>
      
      <button 
        onClick={() => setActiveFilter('ALL')} 
        className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeFilter === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
      >
        All Audio ({jobs.length})
      </button>

      <button 
        onClick={() => setActiveFilter('NEW')} 
        className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeFilter === 'NEW' ? 'btn-primary' : 'btn-outline-primary'}`}
      >
        New ({getCount('NEW')})
      </button>

      <button 
        onClick={() => setActiveFilter('ASSIGNED')} 
        className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeFilter === 'ASSIGNED' ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
      >
        Assigned ({getCount('ASSIGNED')})
      </button>

      <button 
        onClick={() => setActiveFilter('TRANSCRIBED')} 
        className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeFilter === 'TRANSCRIBED' ? 'btn-info text-dark' : 'btn-outline-info'}`}
      >
        Transcribed ({getCount('TRANSCRIBED')})
      </button>

      <button 
        onClick={() => setActiveFilter('REVIEWED')} 
        className={`btn btn-sm rounded-pill px-3 fw-semibold`} 
        style={{
          color: activeFilter === 'REVIEWED' ? '#fff' : '#6f42c1', 
          borderColor: '#6f42c1', 
          backgroundColor: activeFilter === 'REVIEWED' ? '#6f42c1' : 'transparent'
        }}
      >
        Reviewed ({getCount('REVIEWED')})
      </button>

      <button 
        onClick={() => setActiveFilter('COMPLETED')} 
        className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeFilter === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
      >
        Completed ({getCount('COMPLETED')})
      </button>
    </div>
  );
};