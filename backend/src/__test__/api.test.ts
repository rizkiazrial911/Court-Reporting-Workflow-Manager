import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import router from '../routes/api';

const app = express();
app.use(express.json());
app.use('/api', router);

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    job: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient() as jest.Mocked<any>;

describe('Backend Workflow Guardrails Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should BLOCK an invalid status transition (e.g., NEW directly to COMPLETED)', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'mock-job-1',
      status: 'NEW',
      reporterId: null,
      editorId: null,
    });

    const response = await request(app)
      .put('/api/jobs/mock-job-1/status')
      .send({ status: 'COMPLETED' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid workflow transition');
  });

  it('should BLOCK transition to ASSIGNED if no Court Reporter is present', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'mock-job-2',
      status: 'NEW',
      reporterId: null,
      editorId: null,
    });

    const response = await request(app)
      .put('/api/jobs/mock-job-2/status')
      .send({ status: 'ASSIGNED' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('must assign a Court Reporter');
  });
});