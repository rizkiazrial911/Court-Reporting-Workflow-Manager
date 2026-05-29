import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding data awal...');

  await prisma.job.deleteMany();
  await prisma.reporter.deleteMany();
  await prisma.editor.deleteMany();

  const editor1 = await prisma.editor.create({ data: { name: 'Rina Melati' } });
  const editor2 = await prisma.editor.create({ data: { name: 'Doni Pratama' } });

  const reporter1 = await prisma.reporter.create({
    data: { name: 'Budi Santoso', location: 'Jakarta', availability: true },
  });
  const reporter2 = await prisma.reporter.create({
    data: { name: 'Siti Aminah', location: 'Surabaya', availability: true },
  });
  const reporter3 = await prisma.reporter.create({
    data: { name: 'Andi Wijaya', location: 'Bandung', availability: false },
  });

  await prisma.job.create({
    data: {
      caseName: 'Audio Rekaman Sidang Niaga No. 12',
      duration: 45,
      locationType: 'PHYSICAL',
      roomLocation: 'Pengadilan Negeri Jakarta Pusat',
      status: 'NEW',
      reporterRate: 2000,
      editorFlatFee: 50000,
    },
  });

  await prisma.job.create({
    data: {
      caseName: 'Sengketa Hak Cipta Perangkat Lunak',
      duration: 120, 
      locationType: 'REMOTE',
      roomLocation: 'Link Zoom Sidang Elektronik',
      status: 'ASSIGNED',
      reporterRate: 2000,
      editorFlatFee: 50000,
      reporterId: reporter2.id,
      editorId: editor1.id,
    },
  });

  await prisma.job.create({
    data: {
      caseName: 'Perkara Perdata Lahan X',
      duration: 90,
      locationType: 'PHYSICAL',
      roomLocation: 'Pengadilan Negeri Surabaya',
      status: 'TRANSCRIBED',
      reporterRate: 2000,
      editorFlatFee: 50000,
      reporterId: reporter2.id,
      editorId: editor2.id,
    },
  });

  await prisma.job.create({
    data: {
      caseName: 'Kesaksian Kasus Korupsi Dana Bantuan',
      duration: 60,
      locationType: 'PHYSICAL',
      roomLocation: 'Gedung KPK Jakarta',
      status: 'COMPLETED',
      reporterRate: 2000,
      editorFlatFee: 50000,
      reporterId: reporter1.id,
      editorId: editor1.id,
    },
  });

  console.log('Seeding berhasil diselesaikan!');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });