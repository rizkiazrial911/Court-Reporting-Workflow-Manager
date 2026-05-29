import { Router, Request, Response } from 'express';
import { PrismaClient, JobStatus } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server Express + TypeScript berjalan lancar!' });
});

router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { reporter: true, editor: true },
      orderBy: { createdAt: 'desc' }
    });

    const jobsWithCalculatedPay = jobs.map(job => {
      const reporterEarnings = job.reporterId ? (job.duration * job.reporterRate) : 0;
      const editorEarnings = job.editorId ? job.editorFlatFee : 0;
      const totalPayout = reporterEarnings + editorEarnings;
      
      return {
        ...job,
        reporterEarnings,
        editorEarnings,
        totalPayout
      };
    });

    return res.json(jobsWithCalculatedPay);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch jobs data' });
  }
});

router.post('/jobs', async (req: Request, res: Response) => {
  const { caseName, duration, locationType, roomLocation } = req.body;
  try {
    const newJob = await prisma.job.create({
      data: {
        caseName,
        duration: Number(duration),
        locationType,
        roomLocation,
        status: 'NEW',
        reporterRate: 2000,
        editorFlatFee: 50000,      }
    });
    return res.status(201).json(newJob);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to create new job' });
  }
});

router.put('/jobs/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { caseName, duration, locationType, roomLocation } = req.body;

  try {
    const currentJob = await prisma.job.findUnique({ where: { id } });
    if (!currentJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (currentJob.status === 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Cannot edit details! This job has already been marked as COMPLETED and the financial payouts are locked.' 
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        caseName,
        duration: Number(duration),
        locationType,
        roomLocation
      }
    });

    return res.json(updatedJob);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update job details' });
  }
});

router.put('/jobs/:id/assign', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { reporterId, editorId } = req.body;

  try {
    const currentJob = await prisma.job.findUnique({ where: { id } });
    if (!currentJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (editorId && currentJob.status !== 'TRANSCRIBED' && currentJob.status !== 'REVIEWED') {
      return res.status(400).json({
        error: 'Violation of Rule 3: An Editor can only be assigned after the audio recording has been fully TRANSCRIBED.'
      });
    }

    if (reporterId) {
      const reporter = await prisma.reporter.findUnique({ where: { id: reporterId } });
      
      if (!reporter) {
        return res.status(404).json({ error: 'Reporter not found' });
      }

      if (!reporter.availability) {
        return res.status(400).json({ 
          error: `Violation of Rule 2: ${reporter.name} is currently marked as UNAVAILABLE and cannot be assigned to new jobs.` 
        });
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { reporterId, editorId },
    });

    return res.json(updatedJob);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to assign staff' });
  }
});

router.put('/jobs/:id/status', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { status: nextStatus } = req.body as { status: JobStatus };

  try {
    const currentJob = await prisma.job.findUnique({ where: { id } });
    if (!currentJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const currentStatus = currentJob.status;

    const allowedTransitions: Record<JobStatus, JobStatus | 'NONE'> = {
      NEW: 'ASSIGNED',
      ASSIGNED: 'TRANSCRIBED',
      TRANSCRIBED: 'REVIEWED',
      REVIEWED: 'COMPLETED',
      COMPLETED: 'NONE',
    };

    if (currentStatus !== nextStatus && allowedTransitions[currentStatus] !== nextStatus) {
      return res.status(400).json({
        error: `Invalid workflow transition! Current status [${currentStatus}] can only transition to [${allowedTransitions[currentStatus]}]`,
      });
    }

    if (nextStatus === 'ASSIGNED' && !currentJob.reporterId) {
      return res.status(400).json({
        error: 'Cannot update status! You must assign a Court Reporter before moving to ASSIGNED status.',
      });
    }

    if (nextStatus === 'REVIEWED' && !currentJob.editorId) {
      return res.status(400).json({
        error: 'Cannot update status! You must assign a Transcript Editor before moving to REVIEWED status.',
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: nextStatus },
      include: { reporter: true, editor: true },
    });

    return res.json(updatedJob);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update job workflow status' });
  }
});

router.get('/reporters', async (req: Request, res: Response) => {
  const data = await prisma.reporter.findMany();
  res.json(data);
});

router.get('/editors', async (req: any, res: Response) => {
  const data = await prisma.editor.findMany();
  res.json(data);
});

export default router;