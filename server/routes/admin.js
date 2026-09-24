import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes in this router require authentication + ADMIN role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count();
    const totalEvents = await prisma.event.count();
    const totalUsers = await prisma.user.count();

    const revenueResult = await prisma.booking.aggregate({
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Revenue & bookings by event category
    const events = await prisma.event.findMany({
      include: {
        showtimes: {
          include: {
            bookings: true,
          },
        },
      },
    });

    const categoryStatsMap = {};
    events.forEach(e => {
      if (!categoryStatsMap[e.category]) {
        categoryStatsMap[e.category] = { category: e.category, bookings: 0, revenue: 0 };
      }
      e.showtimes.forEach(st => {
        st.bookings.forEach(b => {
          categoryStatsMap[e.category].bookings += 1;
          categoryStatsMap[e.category].revenue += b.totalAmount;
        });
      });
    });

    const categoryAnalytics = Object.values(categoryStatsMap);

    // Monthly revenue simulation data for Recharts
    const monthlyRevenue = [
      { month: 'Jan', revenue: 45000, bookings: 120 },
      { month: 'Feb', revenue: 62000, bookings: 165 },
      { month: 'Mar', revenue: 78000, bookings: 210 },
      { month: 'Apr', revenue: 94000, bookings: 250 },
      { month: 'May', revenue: 115000, bookings: 310 },
      { month: 'Jun', revenue: 142000, bookings: 380 },
      { month: 'Jul', revenue: 185000, bookings: 490 },
      { month: 'Aug', revenue: totalRevenue > 0 ? totalRevenue : 210000, bookings: totalBookings > 0 ? totalBookings : 540 },
    ];

    res.json({
      metrics: {
        totalRevenue,
        totalBookings,
        totalEvents,
        totalUsers,
      },
      categoryAnalytics,
      monthlyRevenue,
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Failed to generate analytics data.' });
  }
});

// GET /api/admin/events — List all events for admin
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: { showtimes: true },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin events list.' });
  }
});

// POST /api/admin/events — Create new event
router.post('/events', async (req, res) => {
  try {
    const { title, subtitle, category, image, description, duration, language, priceMin, featured, trending, tags } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        title,
        subtitle: subtitle || '',
        category,
        image: image || 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&q=80',
        description: description || '',
        duration: duration || '2h 00m',
        language: language || 'English',
        priceMin: parseInt(priceMin, 10) || 200,
        featured: Boolean(featured),
        trending: Boolean(trending),
        tags: JSON.stringify(tags || []),
      },
    });

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create new event.' });
  }
});

// DELETE /api/admin/events/:id — Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// GET /api/admin/venues — List all venues
router.get('/venues', async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      include: { screens: { include: { seats: true } } },
    });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch venues.' });
  }
});

// GET /api/admin/bookings — All bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        showtime: { include: { event: true, venue: true } },
        seats: { include: { seat: true } },
        payment: true,
      },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings list.' });
  }
});

// GET /api/admin/users — All users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// PUT /api/admin/users/:id/role — Change user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

export default router;
