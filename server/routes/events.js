import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    const where = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subtitle: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        showtimes: {
          include: {
            venue: true,
          },
        },
      },
    });

    res.json(events);
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ error: 'Failed to fetch events catalog.' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        showtimes: {
          include: {
            venue: true,
            screen: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching event details.' });
  }
});

export default router;
