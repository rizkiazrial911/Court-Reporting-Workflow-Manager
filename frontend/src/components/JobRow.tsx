import React from 'react';
import type { Job, Reporter, Editor, JobStatus } from '../types';

interface JobRowProps {
  job: Job;
  reporters: Reporter[];
  editors: Editor[];
  onAssign: (jobId: string, reporterId: string | null, editorId: string | null) => void;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
  onEdit: (job: Job) => void; // Added callback for editing
}

export const JobRow: React.FC<JobRowProps> = ({ job, reporters, editors, onAssign, onUpdateStatus, onEdit }) => {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const isEditorSelectable = job.status === 'TRANSCRIBED' || job.status === 'REVIEWED'; 
  const getStatusClass = (status: JobStatus) => {
    switch (status) {
      case 'NEW': return 'bg-primary';
      case 'ASSIGNED': return 'bg-warning text-dark';
      case 'TRANSCRIBED': return 'bg-info text-dark';
      case 'REVIEWED': return 'bg-purple text-white';
      case 'COMPLETED': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center justify-content-between">
          <div className="fw-bold text-dark">{job.caseName}</div>
          {/* Edit Button Guardrail: Disabled if job is COMPLETED */}
          <button 
            className="btn btn-sm btn-link text-primary p-0 me-2" 
            title={job.status === 'COMPLETED' ? "Cannot edit completed jobs" : "Edit Job Details"}
            onClick={() => onEdit(job)}
            disabled={job.status === 'COMPLETED'}
            style={{ opacity: job.status === 'COMPLETED' ? 0.4 : 1 }}
          >
            <i className="bi bi-pencil-square fs-6"></i>
          </button>
        </div>
        <div className="text-muted small mt-1 d-flex gap-1 align-items-center">
          <span className="badge bg-light text-dark border">{job.duration} mins audio</span>
          <span className={`badge ${job.locationType === 'REMOTE' ? 'bg-purple text-white' : 'bg-secondary'}`}>
            {job.locationType}
          </span>
        </div>
        {job.locationType === 'PHYSICAL' && (
          <div className="text-muted small mt-1">
            <i className="bi bi-geo-alt me-1"></i>{job.roomLocation}
          </div>
        )}
      </td>

      <td>
        <select 
            className="form-select form-select-sm shadow-sm" 
            value={job.reporterId || ''} 
            onChange={(e) => onAssign(job.id, e.target.value || null, job.editorId)}
        >
            <option value="">-- Assign Reporter --</option>
            {reporters.map(r => {
            // Logic: Proximity match check for physical locations
            const isLocalMatch = job.locationType === 'PHYSICAL' && 
                job.roomLocation.toLowerCase().includes(r.location.toLowerCase());
            
            return (
                <option 
                key={r.id} 
                value={r.id}
                disabled={!r.availability} // 🔒 Disable if unavailable
                style={{ color: !r.availability ? '#999' : '#000' }}
                >
                {r.name} ({r.location}) 
                {!r.availability ? ' [⚠️ Unavailable]' : ''}
                {r.availability && isLocalMatch ? ' [📍 Preferred City]' : ''}
                </option>
            );
            })}
        </select>
      </td>

      <td>
        <select 
            className="form-select form-select-sm shadow-sm" 
            value={job.editorId || ''} 
            onChange={(e) => onAssign(job.id, job.reporterId, e.target.value || null)}
            disabled={!isEditorSelectable}
            style={{ 
            opacity: !isEditorSelectable ? 0.5 : 1, 
            cursor: !isEditorSelectable ? 'not-allowed' : 'default',
            backgroundColor: !isEditorSelectable ? '#f8f9fa' : '#ffffff'
            }}
            title={!isEditorSelectable ? "Editor can only be assigned after the job is TRANSCRIBED" : "Assign Editor"}
        >
            <option value="">-- Assign Editor --</option>
            {editors.map(ed => (
            <option key={ed.id} value={ed.id}>{ed.name}</option>
            ))}
        </select>
        {!isEditorSelectable && job.status !== 'COMPLETED' && (
            <span className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>
            🔒 Awaiting Transcription
            </span>
        )}
        </td>

      <td>
        <select 
          className={`form-select form-select-sm fw-semibold text-white shadow-sm ${getStatusClass(job.status)}`} 
          value={job.status} 
          onChange={(e) => onUpdateStatus(job.id, e.target.value as JobStatus)}
        >
          <option value="NEW" className="bg-white text-dark">NEW</option>
          <option value="ASSIGNED" className="bg-white text-dark">ASSIGNED</option>
          <option value="TRANSCRIBED" className="bg-white text-dark">TRANSCRIBED</option>
          <option value="REVIEWED" className="bg-white text-dark">REVIEWED</option>
          <option value="COMPLETED" className="bg-white text-dark">COMPLETED</option>
        </select>
      </td>

      <td className="text-end">
        <div className="fw-bold text-dark">{formatRupiah(job.totalPayout)}</div>
        <div className="text-muted" style={{ fontSize: '11px' }}>
          Rep: {formatRupiah(job.reporterEarnings)} <br/>
          Ed: {formatRupiah(job.editorEarnings)}
        </div>
      </td>
    </tr>
  );
};