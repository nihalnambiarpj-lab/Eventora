import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/showtimes/:id/seats — Returns venue screen layout + live booked seat IDs
router.get('/:id/seats', async (req, res) => {
  try {
    const showtime = await prisma.showtime.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        venue: true,
        screen: {
          include: {
            seats: true,
          },
        },
        bookingSeats: {
          select: {
            seatId: true,
          },
        },
      },
    });

    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found.' });
    }

    const bookedSeatIds = showtime.bookingSeats.map(bs => bs.seatId);

    res.json({
      showtimeId: showtime.id,
      event: showtime.event,
      venue: showtime.venue,
      screen: {
        id: showtime.screen.id,
        name: showtime.screen.name,
        rowsCount: showtime.screen.rowsCount,
        colsCount: showtime.screen.colsCount,
        aisleGaps: JSON.parse(showtime.screen.aisleGaps || '[5]'),
      },
      priceBase: showtime.priceBase,
      seats: showtime.screen.seats,
      bookedSeatIds,
    });
  } catch (err) {
    console.error('Fetch seats error:', err);
    res.status(500).json({ error: 'Failed to fetch seat layout.' });
  }
});

export default router;
