import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Eventora Database...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const customerPassword = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventora.com' },
    update: {},
    create: { name: 'System Administrator', email: 'admin@eventora.com', password: adminPassword, role: 'ADMIN', phone: '+91 98765 43210' },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'user@eventora.com' },
    update: {},
    create: { name: 'Rahul Sharma', email: 'user@eventora.com', password: customerPassword, role: 'CUSTOMER', phone: '+91 91234 56789' },
  });

  console.log('Users created');

  const venueData = [
    { name: 'PVR IMAX Grand', address: 'Phoenix Palladium, Lower Parel', city: 'Mumbai', totalSeats: 140, screenType: 'CINEMA_CURVED', screens: [{ name: 'IMAX Audi 1', rowsCount: 10, colsCount: 14, aisleGaps: [4, 10] }, { name: 'Audi 2 Dolby Atmos', rowsCount: 8, colsCount: 12, aisleGaps: [4, 8] }] },
    { name: 'INOX Megaplex', address: 'R City Mall, Ghatkopar', city: 'Mumbai', totalSeats: 140, screenType: 'CINEMA_CURVED', screens: [{ name: 'Screen 1 INOX INSIGNIA', rowsCount: 10, colsCount: 14, aisleGaps: [4, 10] }, { name: 'Screen 2 4DX', rowsCount: 8, colsCount: 12, aisleGaps: [4, 8] }] },
    { name: 'Cinepolis VIP', address: 'DLF Mall of India, Noida', city: 'Noida', totalSeats: 120, screenType: 'CINEMA_CURVED', screens: [{ name: 'Premier Screen', rowsCount: 10, colsCount: 12, aisleGaps: [4, 8] }] },
    { name: 'DY Patil Stadium', address: 'Sector 7, Nerul', city: 'Navi Mumbai', totalSeats: 200, screenType: 'STAGE_CONCERT', screens: [{ name: 'Main Stage Arena', rowsCount: 10, colsCount: 20, aisleGaps: [5, 15] }] },
    { name: 'Wankhede Stadium', address: 'D Rd, Churchgate', city: 'Mumbai', totalSeats: 200, screenType: 'STAGE_CONCERT', screens: [{ name: 'Cricket Ground Stands', rowsCount: 10, colsCount: 20, aisleGaps: [5, 15] }] },
    { name: 'NCPA Mumbai', address: 'NCPA Marg, Nariman Point', city: 'Mumbai', totalSeats: 120, screenType: 'THEATRE', screens: [{ name: 'Tata Theatre', rowsCount: 10, colsCount: 12, aisleGaps: [4, 8] }] },
  ];

  const createdVenues = [];
  for (const v of venueData) {
    const venue = await prisma.venue.create({
      data: { name: v.name, address: v.address, city: v.city, totalSeats: v.totalSeats, screenType: v.screenType, screens: { create: v.screens.map(s => ({ name: s.name, rowsCount: s.rowsCount, colsCount: s.colsCount, aisleGaps: JSON.stringify(s.aisleGaps) })) } },
      include: { screens: true },
    });
    createdVenues.push(venue);
  }
  console.log('Venues created');

  async function generateSeatsForScreen(screenId, colsCount) {
    const rowLabels = ['A','B','C','D','E','F','G','H','I','J'];
    const seatsData = [];
    rowLabels.forEach((row, rIdx) => {
      let tier = 'SILVER', multiplier = 1.0;
      if (rIdx >= 8) { tier = 'RECLINER'; multiplier = 2.5; }
      else if (rIdx >= 6) { tier = 'PREMIUM'; multiplier = 1.8; }
      else if (rIdx >= 4) { tier = 'GOLD'; multiplier = 1.4; }
      for (let num = 1; num <= colsCount; num++) {
        seatsData.push({ screenId, rowLabel: row, seatNumber: num, tier, priceMultiplier: multiplier });
      }
    });
    await prisma.seat.createMany({ data: seatsData });
  }

  for (const venue of createdVenues) {
    for (const screen of venue.screens) {
      await generateSeatsForScreen(screen.id, screen.colsCount);
    }
  }
  console.log('Seats created');

  const eventsList = [
    { title: 'Pushpa 2: The Rule', subtitle: 'The fire is back — bigger and unstoppable', category: 'Movies', image: '/posters/pushpa2.jpg', description: 'Pushpa Raj expands his red sandalwood smuggling empire while the ruthless SP Bhanwar Singh Shekawat intensifies his crackdown. A collision course to the most spectacular finale.', duration: '3h 20m', language: 'Telugu / Hindi', rating: 4.8, reviewCount: 124000, priceMin: 200, featured: true, trending: true, tags: JSON.stringify(['Action', 'Allu Arjun', 'Tollywood']) },
    { title: 'Kalki 2898 AD', subtitle: 'The avatar awakens in a dystopian future', category: 'Movies', image: '/posters/kalki2898.jpg', description: 'In a post-apocalyptic 2898 AD, mythology meets science fiction as Kalki — the final avatar of Vishnu — arrives to save humanity from the clutches of an immortal tyrant.', duration: '2h 58m', language: 'Telugu / Hindi', rating: 4.7, reviewCount: 89000, priceMin: 250, featured: true, trending: true, tags: JSON.stringify(['Sci-Fi', 'Mythology', 'IMAX']) },
    { title: 'Stree 2', subtitle: 'Sarkate ka aatank — returns from the fog', category: 'Movies', image: '/posters/stree2.jpg', description: 'The legendary Stree returns in a sequel that shatters every Bollywood record. Chanderi faces a new supernatural menace as our beloved gang gears up for the most terrifying night yet.', duration: '2h 13m', language: 'Hindi', rating: 4.9, reviewCount: 215000, priceMin: 180, featured: true, trending: true, tags: JSON.stringify(['Horror-Comedy', 'Bollywood', 'Must-Watch']) },
    { title: 'Deadpool & Wolverine', subtitle: 'Maximum effort meets adamantium rage', category: 'Movies', image: '/posters/deadpool_wolverine.jpg', description: 'Wade Wilson is back and this time he is dragging Logan into the multiverse. The most irreverent action-packed Marvel team-up ever made.', duration: '2h 7m', language: 'English', rating: 4.6, reviewCount: 178000, priceMin: 250, featured: true, trending: true, tags: JSON.stringify(['Marvel', 'Action', 'Comedy']) },
    { title: 'Inside Out 2', subtitle: 'New emotions, new chaos, one unforgettable journey', category: 'Movies', image: '/posters/inside_out_2.jpg', description: 'Riley is now a teenager and the headquarters inside her mind are about to get a major renovation. Anxiety, Envy, Ennui, and Embarrassment join the crew.', duration: '1h 40m', language: 'English', rating: 4.5, reviewCount: 52000, priceMin: 150, featured: false, trending: true, tags: JSON.stringify(['Animation', 'Family', 'Pixar']) },
    { title: 'Dune: Part Two', subtitle: 'The saga of the spice wars continues', category: 'Movies', image: '/posters/dune2.jpeg', description: 'Paul Atreides unites with the Fremen to wage war against the forces of House Harkonnen while struggling with visions of a terrible future only he can prevent.', duration: '2h 46m', language: 'English', rating: 4.8, reviewCount: 32000, priceMin: 250, featured: true, trending: true, tags: JSON.stringify(['Sci-Fi', 'IMAX 4K', 'Dolby Atmos']) },
    { title: 'Venom: The Last Dance', subtitle: 'One last time. Together.', category: 'Movies', image: '/posters/venom_last_dance.jpg', description: "Eddie Brock and Venom face their greatest threat yet as they are hunted by both authorities and a new alien species.", duration: '1h 49m', language: 'English', rating: 4.1, reviewCount: 42000, priceMin: 180, featured: false, trending: true, tags: JSON.stringify(['Action', 'Marvel', 'Sci-Fi']) },
    { title: 'Taylor Swift: Eras Tour India', subtitle: 'The record-breaking world tour, live in India', category: 'Concerts', image: '/posters/taylor_swift.png', description: 'Taylor Swift brings her history-making Eras Tour to India. Experience 3+ hours of live music spanning all her iconic eras.', duration: '3h 30m', language: 'English', rating: 4.9, reviewCount: 178000, priceMin: 2499, featured: true, trending: true, tags: JSON.stringify(['Pop', 'Live Concert', 'Stadium']) },
    { title: 'Coldplay: Music of the Spheres', subtitle: 'An out-of-this-world live experience', category: 'Concerts', image: '/posters/coldplay.png', description: "Coldplay's breathtaking visual spectacle returns. Every seat has an LED wristband. The sky above the stadium becomes the canvas.", duration: '2h 45m', language: 'English', rating: 4.8, reviewCount: 52000, priceMin: 1800, featured: true, trending: true, tags: JSON.stringify(['Rock', 'Alternative', 'Stadium']) },
    { title: 'Diljit Dosanjh: Dil-Luminati Tour', subtitle: "India's biggest Punjabi concert ever", category: 'Concerts', image: '/posters/diljit_dosanjh.jpg', description: 'Diljit Dosanjh brings his record-shattering Dil-Luminati Tour to India with his biggest-ever production.', duration: '2h 30m', language: 'Punjabi / Hindi', rating: 4.7, reviewCount: 48000, priceMin: 1499, featured: false, trending: true, tags: JSON.stringify(['Punjabi', 'Pop', 'Arena']) },
    { title: 'Arijit Singh: Aashiqui Night', subtitle: "Bollywood's golden voice — live and unplugged", category: 'Concerts', image: '/posters/arijit_singh.jpg', description: "An intimate evening with Bollywood's most beloved voice performing his greatest romantic hits with a full live orchestra.", duration: '2h 30m', language: 'Hindi', rating: 4.9, reviewCount: 67000, priceMin: 999, featured: false, trending: true, tags: JSON.stringify(['Bollywood', 'Acoustic', 'Romantic']) },
    { title: 'IPL 2026 Final', subtitle: 'Mumbai Indians vs Royal Challengers Bangalore', category: 'Sports', image: '/ipl_final_poster.jpg', description: 'The biggest night in Indian cricket — the IPL Final. Two iconic franchises battle under the lights at Wankhede Stadium.', duration: '4h 00m', language: 'Hindi / English', rating: 4.9, reviewCount: 95000, priceMin: 1500, featured: true, trending: true, tags: JSON.stringify(['Cricket', 'IPL', 'T20']) },
    { title: 'FIFA World Cup 2026 Qualifier', subtitle: 'India vs Australia — Road to the World Cup', category: 'Sports', image: '/fifa_qualifier_poster.jpg', description: 'A historic night for Indian football as the Blue Tigers take on Australia in a crucial FIFA World Cup 2026 Qualifier.', duration: '2h 00m', language: 'Hindi / English', rating: 4.6, reviewCount: 38000, priceMin: 500, featured: true, trending: true, tags: JSON.stringify(['Football', 'FIFA', 'International']) },
    { title: 'Pro Kabaddi League Final', subtitle: 'Patna Pirates vs U Mumba — Battle of Giants', category: 'Sports', image: '/posters/pkl_final.png', description: 'The Pro Kabaddi League Final electrifies the arena as Patna Pirates face U Mumba in an explosive clash.', duration: '2h 30m', language: 'Hindi / English', rating: 4.5, reviewCount: 18000, priceMin: 500, featured: false, trending: true, tags: JSON.stringify(['Kabaddi', 'PKL', 'Indoor Sport']) },
    { title: 'Wimbledon Finals Live Screening', subtitle: 'The ultimate tennis experience on the big screen', category: 'Sports', image: '/posters/wimbledon.png', description: 'Experience the Wimbledon Gentlemen and Ladies Finals on a massive 60-foot screen inside the NSCI Dome.', duration: '3h 00m', language: 'English', rating: 4.4, reviewCount: 12000, priceMin: 300, featured: false, trending: true, tags: JSON.stringify(['Tennis', 'Grand Slam']) },
    { title: 'Zakir Khan: Sakht Launda 3.0', subtitle: 'A sold-out comedy special, back by popular demand', category: 'Comedy', image: '/posters/zakir_khan.jpg', description: "India's favourite Sakht Launda returns with brand-new material about life, love, and the chaos of adulthood.", duration: '2h 00m', language: 'Hindi', rating: 4.8, reviewCount: 9500, priceMin: 699, featured: false, trending: true, tags: JSON.stringify(['Stand-up', 'Hindi', 'Adult']) },
    { title: 'Kapil Sharma Live', subtitle: "India's King of Comedy — live on stage", category: 'Comedy', image: '/posters/kapil_sharma.jpg', description: "After his global Netflix special, Kapil Sharma brings his unmatched wit and improvisational genius to a live stage.", duration: '2h 30m', language: 'Hindi / Punjabi', rating: 4.7, reviewCount: 22000, priceMin: 799, featured: false, trending: false, tags: JSON.stringify(['Stand-up', 'Hindi', 'Family']) },
    { title: 'Hamilton — India Premiere', subtitle: 'The Broadway sensation makes its India debut', category: 'Theatre', image: '/posters/hamilton.jpg', description: 'Hamilton, the Pulitzer Prize-winning musical phenomenon, arrives in India for the first time with its original Broadway cast.', duration: '2h 45m', language: 'English', rating: 4.9, reviewCount: 4200, priceMin: 1200, featured: false, trending: false, tags: JSON.stringify(['Musical', 'Broadway', 'English']) },
    { title: 'The Lion King Musical', subtitle: 'The Disney classic reimagined on stage', category: 'Theatre', image: '/posters/the_lion_king.png', description: 'The award-winning global production of The Lion King musical arrives in India with spectacular costumes and breathtaking puppetry.', duration: '2h 30m', language: 'English', rating: 4.8, reviewCount: 3100, priceMin: 1500, featured: false, trending: false, tags: JSON.stringify(['Musical', 'Disney', 'Family']) },
  ];

  const createdEvents = [];
  for (const ev of eventsList) {
    const created = await prisma.event.create({ data: ev });
    createdEvents.push(created);
  }
  console.log('Events created: ' + createdEvents.length);

  function daysFromNow(days, hour = 13) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  const pvr = createdVenues[0];
  const inox = createdVenues[1];
  const cinepolis = createdVenues[2];
  const dyPatil = createdVenues[3];
  const wankhede = createdVenues[4];
  const ncpa = createdVenues[5];

  const showtimeConfigs = [
    [{ venue: pvr, screen: pvr.screens[0], days: 1, hour: 10, price: 250 }, { venue: pvr, screen: pvr.screens[0], days: 1, hour: 14, price: 250 }, { venue: pvr, screen: pvr.screens[0], days: 1, hour: 19, price: 300 }, { venue: inox, screen: inox.screens[0], days: 2, hour: 18, price: 280 }],
    [{ venue: pvr, screen: pvr.screens[0], days: 2, hour: 11, price: 300 }, { venue: pvr, screen: pvr.screens[0], days: 2, hour: 15, price: 300 }, { venue: pvr, screen: pvr.screens[0], days: 2, hour: 19, price: 350 }, { venue: inox, screen: inox.screens[0], days: 3, hour: 17, price: 280 }],
    [{ venue: inox, screen: inox.screens[0], days: 1, hour: 10, price: 200 }, { venue: inox, screen: inox.screens[0], days: 1, hour: 14, price: 200 }, { venue: inox, screen: inox.screens[0], days: 1, hour: 19, price: 220 }, { venue: cinepolis, screen: cinepolis.screens[0], days: 2, hour: 16, price: 200 }],
    [{ venue: pvr, screen: pvr.screens[1], days: 3, hour: 12, price: 280 }, { venue: pvr, screen: pvr.screens[1], days: 3, hour: 16, price: 280 }, { venue: pvr, screen: pvr.screens[1], days: 3, hour: 21, price: 300 }],
    [{ venue: cinepolis, screen: cinepolis.screens[0], days: 4, hour: 10, price: 180 }, { venue: cinepolis, screen: cinepolis.screens[0], days: 4, hour: 13, price: 180 }, { venue: cinepolis, screen: cinepolis.screens[0], days: 4, hour: 16, price: 200 }],
    [{ venue: pvr, screen: pvr.screens[0], days: 5, hour: 11, price: 300 }, { venue: pvr, screen: pvr.screens[0], days: 5, hour: 15, price: 300 }, { venue: pvr, screen: pvr.screens[0], days: 5, hour: 20, price: 350 }],
    [{ venue: inox, screen: inox.screens[1], days: 6, hour: 13, price: 250 }, { venue: inox, screen: inox.screens[1], days: 6, hour: 18, price: 250 }, { venue: cinepolis, screen: cinepolis.screens[0], days: 7, hour: 20, price: 250 }],
    [{ venue: inox, screen: inox.screens[0], days: 8, hour: 12, price: 200 }, { venue: inox, screen: inox.screens[0], days: 8, hour: 17, price: 200 }, { venue: inox, screen: inox.screens[0], days: 8, hour: 21, price: 220 }],
    [{ venue: dyPatil, screen: dyPatil.screens[0], days: 10, hour: 19, price: 2499 }, { venue: dyPatil, screen: dyPatil.screens[0], days: 11, hour: 19, price: 2499 }],
    [{ venue: dyPatil, screen: dyPatil.screens[0], days: 14, hour: 19, price: 2000 }, { venue: dyPatil, screen: dyPatil.screens[0], days: 15, hour: 19, price: 2000 }],
    [{ venue: dyPatil, screen: dyPatil.screens[0], days: 18, hour: 20, price: 1800 }],
    [{ venue: dyPatil, screen: dyPatil.screens[0], days: 20, hour: 19, price: 1200 }, { venue: dyPatil, screen: dyPatil.screens[0], days: 21, hour: 19, price: 1200 }],
    [{ venue: wankhede, screen: wankhede.screens[0], days: 7, hour: 19, price: 1500 }],
    [{ venue: dyPatil, screen: dyPatil.screens[0], days: 9, hour: 18, price: 600 }],
    [{ venue: pvr, screen: pvr.screens[1], days: 5, hour: 17, price: 799 }, { venue: pvr, screen: pvr.screens[1], days: 5, hour: 20, price: 799 }, { venue: inox, screen: inox.screens[1], days: 6, hour: 20, price: 799 }],
    [{ venue: inox, screen: inox.screens[1], days: 12, hour: 17, price: 899 }, { venue: inox, screen: inox.screens[1], days: 12, hour: 20, price: 899 }],
    [{ venue: ncpa, screen: ncpa.screens[0], days: 15, hour: 19, price: 1500 }, { venue: ncpa, screen: ncpa.screens[0], days: 16, hour: 15, price: 1500 }, { venue: ncpa, screen: ncpa.screens[0], days: 16, hour: 19, price: 1800 }],
    [{ venue: ncpa, screen: ncpa.screens[0], days: 20, hour: 15, price: 1800 }, { venue: ncpa, screen: ncpa.screens[0], days: 20, hour: 19, price: 2000 }, { venue: ncpa, screen: ncpa.screens[0], days: 21, hour: 15, price: 1800 }],
  ];

  let totalShowtimes = 0;
  for (let i = 0; i < createdEvents.length; i++) {
    const configs = showtimeConfigs[i] || [];
    for (const cfg of configs) {
      await prisma.showtime.create({
        data: { eventId: createdEvents[i].id, venueId: cfg.venue.id, screenId: cfg.screen.id, startTime: daysFromNow(cfg.days, cfg.hour), priceBase: cfg.price },
      });
      totalShowtimes++;
    }
  }
  console.log('Showtimes created: ' + totalShowtimes);

  const stree2 = createdEvents[2];
  const stree2Showtime = await prisma.showtime.findFirst({ where: { eventId: stree2.id }, include: { screen: { include: { seats: true } } } });
  if (stree2Showtime) {
    const seats = stree2Showtime.screen.seats.filter(s => s.rowLabel === 'A').sort((a, b) => a.seatNumber - b.seatNumber).slice(0, 6);
    const bc = 'EVT-DEMO01';
    const bk = await prisma.booking.create({ data: { bookingCode: bc, userId: customer.id, showtimeId: stree2Showtime.id, totalAmount: 1260, convenienceFee: 60, status: 'CONFIRMED', qrCode: JSON.stringify({ code: bc, event: stree2.title }) } });
    for (const seat of seats) { await prisma.bookingSeat.create({ data: { bookingId: bk.id, seatId: seat.id, showtimeId: stree2Showtime.id, pricePaid: 200 } }); }
    await prisma.payment.create({ data: { bookingId: bk.id, paymentMethod: 'UPI', transactionId: 'TXN-DEMO-001', amount: 1260, status: 'SUCCESS' } });
    console.log('Demo booking created for Stree 2');
  }

  console.log('');
  console.log('Seed complete!');
  console.log('  Admin:    admin@eventora.com / Admin@123');
  console.log('  Customer: user@eventora.com  / User@123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
