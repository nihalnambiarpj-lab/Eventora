import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCancellationTest() {
  console.log('🧪 Starting Ticket Cancellation Test (Partial & Full Cancellation)...');

  // 1. Fetch customer user & a showtime
  const user = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  const showtime = await prisma.showtime.findFirst({
    include: {
      screen: { include: { seats: true } },
      event: true,
      venue: true,
    },
  });

  if (!user || !showtime) {
    console.error('❌ Missing user or showtime. Please run seed first.');
    process.exit(1);
  }

  // 2. Find 2 free seats
  const currentlyBooked = await prisma.bookingSeat.findMany({
    where: { showtimeId: showtime.id },
    select: { seatId: true },
  });
  const bookedSet = new Set(currentlyBooked.map((b) => b.seatId));
  const freeSeats = showtime.screen.seats.filter((s) => !bookedSet.has(s.id));

  if (freeSeats.length < 2) {
    console.error('❌ Need at least 2 free seats for this test.');
    process.exit(1);
  }

  const [seatA, seatB] = freeSeats.slice(0, 2);
  console.log(`📌 Selected 2 seats: [${seatA.rowLabel}-${seatA.seatNumber}] & [${seatB.rowLabel}-${seatB.seatNumber}]`);

  // 3. Create a booking for 2 seats
  const bookingCode = 'EVT-TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const priceA = Math.round(showtime.priceBase * seatA.priceMultiplier);
  const priceB = Math.round(showtime.priceBase * seatB.priceMultiplier);
  const seatsTotal = priceA + priceB;
  const convenienceFee = Math.round(seatsTotal * 0.05);
  const totalAmount = seatsTotal + convenienceFee;

  const booking = await prisma.$transaction(async (tx) => {
    const createdBooking = await tx.booking.create({
      data: {
        bookingCode,
        userId: user.id,
        showtimeId: showtime.id,
        totalAmount,
        convenienceFee,
        status: 'CONFIRMED',
        qrCode: JSON.stringify({ code: bookingCode }),
      },
    });

    await tx.bookingSeat.createMany({
      data: [
        { bookingId: createdBooking.id, seatId: seatA.id, showtimeId: showtime.id, pricePaid: priceA },
        { bookingId: createdBooking.id, seatId: seatB.id, showtimeId: showtime.id, pricePaid: priceB },
      ],
    });

    await tx.payment.create({
      data: {
        bookingId: createdBooking.id,
        paymentMethod: 'UPI',
        transactionId: 'TXN-TEST-CANCEL-' + Date.now(),
        amount: totalAmount,
        status: 'SUCCESS',
      },
    });

    return createdBooking;
  });

  console.log(`✅ Booking created for 2 seats! Booking ID: ${booking.id}, Code: ${booking.bookingCode}`);

  // 4. Test PARTIAL cancellation: Cancel 1 seat (seatA)
  const bookingSeats = await prisma.bookingSeat.findMany({
    where: { bookingId: booking.id },
  });
  const bookingSeatToCancel = bookingSeats.find((bs) => bs.seatId === seatA.id);

  console.log(`🔄 Attempting partial cancellation: cancelling 1 seat (${seatA.rowLabel}-${seatA.seatNumber})...`);

  await prisma.$transaction(async (tx) => {
    // Delete BookingSeat record for seatA
    await tx.bookingSeat.delete({ where: { id: bookingSeatToCancel.id } });
    // Update booking total amount
    const newTotal = booking.totalAmount - bookingSeatToCancel.pricePaid;
    await tx.booking.update({
      where: { id: booking.id },
      data: { totalAmount: newTotal },
    });
  });

  // Verify partial cancellation
  const remainingSeatsAfterPartial = await prisma.bookingSeat.findMany({
    where: { bookingId: booking.id },
  });
  const updatedBookingAfterPartial = await prisma.booking.findUnique({
    where: { id: booking.id },
  });

  if (remainingSeatsAfterPartial.length === 1 && updatedBookingAfterPartial.status === 'CONFIRMED') {
    console.log(`✅ PARTIAL CANCELLATION PASSED! 1 seat was cancelled, 1 seat [${seatB.rowLabel}-${seatB.seatNumber}] remains confirmed.`);
  } else {
    console.error('❌ PARTIAL CANCELLATION FAILED!');
    process.exit(1);
  }

  // 5. Test FULL cancellation: Cancel the second remaining seat (seatB)
  console.log(`🔄 Attempting full cancellation: cancelling remaining seat (${seatB.rowLabel}-${seatB.seatNumber})...`);
  const lastBookingSeat = remainingSeatsAfterPartial[0];

  await prisma.$transaction(async (tx) => {
    await tx.bookingSeat.delete({ where: { id: lastBookingSeat.id } });
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', totalAmount: 0 },
    });
  });

  // Verify full cancellation
  const remainingSeatsAfterFull = await prisma.bookingSeat.findMany({
    where: { bookingId: booking.id },
  });
  const updatedBookingAfterFull = await prisma.booking.findUnique({
    where: { id: booking.id },
  });

  if (remainingSeatsAfterFull.length === 0 && updatedBookingAfterFull.status === 'CANCELLED') {
    console.log('✅ FULL CANCELLATION PASSED! Booking is marked as CANCELLED and all seats are freed up!');
  } else {
    console.error('❌ FULL CANCELLATION FAILED!');
    process.exit(1);
  }

  console.log('🎉 ALL CANCELLATION TESTS PASSED SUCCESSFULLY!');
}

runCancellationTest()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
