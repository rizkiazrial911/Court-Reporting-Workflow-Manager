import { useEffect, useState } from 'react';
import type { Job, Reporter, Editor, JobStatus } from './types'; 

import { FilterTags } from './components/FilterTags';
import { JobTable } from './components/JobTable';
import { JobModal } from './components/JobModal';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null); // Added state
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const fetchData = async () => {
    try {
      const [jobsRes, reportersRes, editorsRes] = await Promise.all([
        fetch('http://localhost:5000/api/jobs'),
        fetch('http://localhost:5000/api/reporters'),
        fetch('http://localhost:5000/api/editors'),
      ]);
      setJobs(await jobsRes.json());
      setReporters(await reportersRes.json());
      setEditors(await editorsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignStaff = async (jobId: string, reporterId: string | null, editorId: string | null) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterId, editorId }),
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  const handleUpdateStatus = async (jobId: string, status: JobStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }
      
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Dual-purpose handler: Handles both Ingestion (POST) and Editing (PUT)
  const handleSaveJob = async (data: { caseName: string; duration: string; locationType: string; roomLocation: string }) => {
    try {
      const url = editingJob 
        ? `http://localhost:5000/api/jobs/${editingJob.id}` 
        : 'http://localhost:5000/api/jobs';
      
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      setEditingJob(null);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save job details:', error);
    }
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'ALL') return true;
    return job.status === activeFilter;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 min-vh-100 d-flex bg-light">
      {/* SIDEBAR */}
      <div className="bg-dark text-white p-3 d-none d-md-flex flex-column" style={{ width: '260px' }}>
        <div className="mb-4 px-2 py-3 border-bottom border-secondary text-center">
          <h5 className="fw-bold text-white m-0 tracking-wide">COURT AGENCY</h5>
          <span className="text-muted small">Workflow Manager</span>
        </div>
        <div className="flex-grow-1">
          <a href="#" className="sidebar-link active"><i className="bi bi-briefcase me-2"></i> Job Board</a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 p-4" style={{ overflowX: 'hidden' }}>
        <header className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h4 fw-bold text-dark m-0">Transcription Job Board</h1>
            <p className="text-muted small m-0">Assign jobs to reporters, track reviews, and calculate payouts.</p>
          </div>
          <button className="btn btn-primary fw-semibold shadow-sm px-3" onClick={handleOpenCreateModal}>
            + Ingest New Audio
          </button>
        </header>

        {/* TRACKING FILTER SHORTCUTS */}
        <FilterTags jobs={jobs} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {/* WORKFLOW BOARD TABLE */}
        <JobTable 
          jobs={filteredJobs} 
          reporters={reporters} 
          editors={editors} 
          onAssign={handleAssignStaff} 
          onUpdateStatus={handleUpdateStatus} 
          onEdit={handleOpenEditModal} // Passed handler
        />
      </div>

      {/* INGESTION / EDIT MODAL FORM */}
      <JobModal 
        show={showModal} 
        onClose={() => { setShowModal(false); setEditingJob(null); }} 
        onSave={handleSaveJob} 
        editingJob={editingJob} // Passed state
      />
    </div>
  );
}

export default App;