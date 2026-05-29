import React, { useState, useEffect } from 'react';
import type { Job } from '../types';

interface JobFormData {
  caseName: string;
  duration: string;
  locationType: 'PHYSICAL' | 'REMOTE';
  roomLocation: string;
}

interface JobModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: JobFormData) => Promise<void>;
  editingJob: Job | null; // Added prop to handle contextual changes
}

export const JobModal: React.FC<JobModalProps> = ({ show, onClose, onSave, editingJob }) => {
  const [caseName, setCaseName] = useState('');
  const [duration, setDuration] = useState('');
  const [locationType, setLocationType] = useState<'PHYSICAL' | 'REMOTE'>('PHYSICAL');
  const [roomLocation, setRoomLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync state variables when editingJob modal intent toggles
  useEffect(() => {
    if (editingJob) {
      setCaseName(editingJob.caseName);
      setDuration(String(editingJob.duration));
      setLocationType(editingJob.locationType);
      setRoomLocation(editingJob.roomLocation);
    } else {
      setCaseName('');
      setDuration('');
      setLocationType('PHYSICAL');
      setRoomLocation('');
    }
  }, [editingJob, show]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave({ caseName, duration, locationType, roomLocation });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal d-block d-flex align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
      <div className="modal-dialog w-100" style={{ maxWidth: '500px' }}>
        <div className="modal-content border-0 shadow-lg">
          <div className={`modal-header ${editingJob ? 'bg-dark' : 'bg-primary'} text-white`}>
            <h5 className="modal-title fw-bold">
              {editingJob ? 'Edit Job Details' : 'Ingest New Audio Recording'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Case Name / Audio Title</label>
                <input type="text" className="form-control" placeholder="e.g. Commercial Dispute Hearing No.5" value={caseName} onChange={(e) => setCaseName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Audio Duration (Minutes)</label>
                <input type="number" className="form-control" placeholder="e.g. 60" value={duration} onChange={(e) => setDuration(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Location Type</label>
                <select className="form-select" value={locationType} onChange={(e) => setLocationType(e.target.value as 'PHYSICAL' | 'REMOTE')}>
                  <option value="PHYSICAL">PHYSICAL (On-site)</option>
                  <option value="REMOTE">REMOTE (Online / Virtual)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Physical Venue / Online Meeting Link</label>
                <input type="text" className="form-control" placeholder="e.g. Courtroom 3 or Zoom Link" value={roomLocation} onChange={(e) => setRoomLocation(e.target.value)} required />
              </div>
            </div>
            <div className="modal-footer bg-light border-top">
              <button type="button" className="btn btn-sm btn-secondary fw-semibold" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-primary fw-semibold" disabled={submitting}>
                {submitting ? 'Saving...' : editingJob ? 'Save Changes' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};