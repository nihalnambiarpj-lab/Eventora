import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/bookings — Create booking atomically with transaction
router.post('/', authenticateToken, async (req, res) => {
  const { showtimeId, seatIds, paymentMethod } = req.body;

  if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Showtime ID and at least one seat selection are required.' });
  }

  if (seatIds.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 seats allowed per booking.' });
  }

  try {
    // Execute atomic Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch showtime & seats info
      const showtime = await tx.showtime.findUnique({
        where: { id: showtimeId },
        include: { event: true, venue: true },
      });

      if (!showtime) {
        throw new Error('SHOWTIME_NOT_FOUND');
      }

      // 2. Check if any seat is already booked for this showtime
      const existingBookedSeats = await tx.bookingSeat.findMany({
        where: {
          showtimeId,
          seatId: { in: seatIds },
        },
      });

      if (existingBookedSeats.length > 0) {
        throw new Error('SEATS_ALREADY_BOOKED');
      }

      // 3. Fetch seat details to compute total amount
      const seats = await tx.seat.findMany({
        where: { id: { in: seatIds } },
      });

      let totalSeatsAmount = 0;
      seats.forEach(s => {
        totalSeatsAmount += Math.round(showtime.priceBase * s.priceMultiplier);
      });

      const convenienceFee = Math.round(totalSeatsAmount * 0.05);
      const totalAmount = totalSeatsAmount + convenienceFee;

      // 4. Generate unique booking code
      const bookingCode = 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const qrPayload = JSON.stringify({
        code: bookingCode,
        event: showtime.event.title,
        venue: showtime.venue.name,
        seatsCount: seatIds.length,
      });

      // 5. Create Booking
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId: req.user.userId,
          showtimeId,
          totalAmount,
          convenienceFee,
          status: 'CONFIRMED',
          qrCode: qrPayload,
        },
      });

      // 6. Create BookingSeats records (Triggers @@unique([showtimeId, seatId]) if race condition happens)
      const bookingSeatData = seats.map(seat => ({
        bookingId: booking.id,
        seatId: seat.id,
        showtimeId,
        pricePaid: Math.round(showtime.priceBase * seat.priceMultiplier),
      }));

      await tx.bookingSeat.createMany({
        data: bookingSeatData,
      });

      // 7. Create Payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          paymentMethod: paymentMethod || 'CARD',
          transactionId: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          amount: totalAmount,
          status: 'SUCCESS',
        },
      });

      return { booking, seats, payment, event: showtime.event, venue: showtime.venue, showtime };
    });

    res.status(201).json({
      message: 'Booking created successfully!',
      booking: result.booking,
      seats: result.seats,
      payment: result.payment,
      event: result.event,
      venue: result.venue,
    });
  } catch (err) {
    if (err.message === 'SEATS_ALREADY_BOOKED' || err.code === 'P2002') {
      return res.status(409).json({
        error: 'One or more of your selected seats were just booked by another user. Please choose available seats.',
      });
    }
    if (err.message === 'SHOWTIME_NOT_FOUND') {
      return res.status(404).json({ error: 'Selected showtime was not found.' });
    }
    console.error('Booking transaction error:', err);
    res.status(500).json({ error: 'Failed to process booking. Please try again.' });
  }
});

// GET /api/bookings/my-bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        showtime: {
          include: {
            event: true,
            venue: true,
          },
        },
        seats: {
          include: {
            seat: true,
          },
        },
        payment: true,
      },
    });

    res.json(bookings);
  } catch (err) {
    console.error('Fetch my-bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch booking history.' });
  }
});

export default router;
