import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runConcurrencyTest() {
  console.log('🧪 Starting Concurrency Double-Booking Prevention Test...');

  // 1. Get customer user and a showtime
  const user = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  const showtime = await prisma.showtime.findFirst({ include: { screen: { include: { seats: true } } } });

  if (!user || !showtime) {
    console.error('❌ Missing test prerequisites (user or showtime). Run seed first.');
    process.exit(1);
  }

  // Pick an unbooked seat
  const booked = await prisma.bookingSeat.findMany({
    where: { showtimeId: showtime.id },
    select: { seatId: true },
  });
  const bookedIds = new Set(booked.map(b => b.seatId));
  const freeSeat = showtime.screen.seats.find(s => !bookedIds.has(s.id));

  if (!freeSeat) {
    console.error('❌ No free seats available for test.');
    process.exit(1);
  }

  console.log(`🎯 Testing concurrent booking for Seat ${freeSeat.rowLabel}-${freeSeat.seatNumber} (ID: ${freeSeat.id}) on Showtime ID: ${showtime.id}`);

  // Simulated concurrent booking function
  async function attemptBooking(requestId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Check availability
        const existing = await tx.bookingSeat.findFirst({
          where: { showtimeId: showtime.id, seatId: freeSeat.id },
        });

        if (existing) {
          throw new Error('SEATS_ALREADY_BOOKED');
        }

        const code = 'EVT-TEST-' + requestId + '-' + Math.floor(Math.random() * 1000);
        const booking = await tx.booking.create({
          data: {
            bookingCode: code,
            userId: user.id,
            showtimeId: showtime.id,
            totalAmount: 300,
            convenienceFee: 15,
            status: 'CONFIRMED',
            qrCode: JSON.stringify({ code }),
          },
        });

        await tx.bookingSeat.create({
          data: {
            bookingId: booking.id,
            seatId: freeSeat.id,
            showtimeId: showtime.id,
            pricePaid: 300,
          },
        });

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            paymentMethod: 'CARD',
            transactionId: 'TXN-TEST-' + requestId,
            amount: 300,
            status: 'SUCCESS',
          },
        });

        return { success: true, bookingId: booking.id, requestId };
      });
    } catch (err) {
      return { success: false, error: err.message, code: err.code, requestId };
    }
  }

  // Fire 2 concurrent booking requests simultaneously
  const results = await Promise.all([
    attemptBooking('REQ-1'),
    attemptBooking('REQ-2'),
  ]);

  console.log('📊 Test Results:', results);

  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);

  if (successes.length === 1 && failures.length === 1) {
    console.log('✅ CONCURRENCY TEST PASSED! Exactly 1 request succeeded and 1 request was rejected with conflict protection.');
  } else {
    console.error('❌ TEST FAILED! Unexpected concurrency result:', results);
    process.exit(1);
  }
}

runConcurrencyTest()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
