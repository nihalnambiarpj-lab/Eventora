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

// POST /api/admin/venues — Create new venue with screens and seats
router.post('/venues', async (req, res) => {
  try {
    const { name, address, city, screenType, screens } = req.body;

    if (!name || !address || !city || !screenType || !Array.isArray(screens) || screens.length === 0) {
      return res.status(400).json({ error: 'Missing required venue fields.' });
    }

    const totalSeats = screens.reduce((sum, s) => sum + (s.rowsCount * s.colsCount), 0);

    // Create venue + screens in one go
    const venue = await prisma.venue.create({
      data: {
        name,
        address,
        city,
        totalSeats,
        screenType,
        screens: {
          create: screens.map(s => ({
            name: s.name,
            rowsCount: parseInt(s.rowsCount, 10),
            colsCount: parseInt(s.colsCount, 10),
            aisleGaps: JSON.stringify(
              Array.isArray(s.aisleGaps) ? s.aisleGaps : [Math.floor(s.colsCount / 2)]
            ),
          })),
        },
      },
      include: { screens: true },
    });

    // Generate seat records for each screen
    const rowLabels = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];
    for (const screen of venue.screens) {
      const seatsData = [];
      const usedLabels = rowLabels.slice(0, screen.rowsCount);
      usedLabels.forEach((rowLabel, rIdx) => {
        let tier = 'SILVER', multiplier = 1.0;
        if (rIdx >= screen.rowsCount - 2) { tier = 'RECLINER'; multiplier = 2.5; }
        else if (rIdx >= screen.rowsCount - 4) { tier = 'PREMIUM'; multiplier = 1.8; }
        else if (rIdx >= screen.rowsCount - 6) { tier = 'GOLD'; multiplier = 1.4; }
        for (let num = 1; num <= screen.colsCount; num++) {
          seatsData.push({ screenId: screen.id, rowLabel, seatNumber: num, tier, priceMultiplier: multiplier });
        }
      });
      await prisma.seat.createMany({ data: seatsData });
    }

    // Return fresh venue with seat counts
    const fullVenue = await prisma.venue.findUnique({
      where: { id: venue.id },
      include: { screens: { include: { seats: true } } },
    });

    res.status(201).json(fullVenue);
  } catch (err) {
    console.error('Create venue error:', err);
    res.status(500).json({ error: 'Failed to create venue.' });
  }
});

// DELETE /api/admin/venues/:id — Delete venue
router.delete('/venues/:id', async (req, res) => {
  try {
    await prisma.venue.delete({ where: { id: req.params.id } });
    res.json({ message: 'Venue deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete venue.' });
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
