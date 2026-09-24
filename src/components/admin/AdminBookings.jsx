import { useState, useEffect } from 'react';
import { Ticket, Calendar, User, DollarSign } from 'lucide-react';
import { apiFetch } from '../../api/client';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const res = await apiFetch('/admin/bookings');
        setBookings(res);
      } catch (err) {
        console.error('Fetch admin bookings error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bookings Audit Log</h1>
        <p className="text-xs text-gray-400 mt-1">Real-time record of all ticket reservations and payment status</p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading bookings log…</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-400 font-semibold border-b border-gray-800 uppercase">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-850 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-400">{b.bookingCode}</td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{b.user?.name}</p>
                      <p className="text-[10px] text-gray-500">{b.user?.email}</p>
                    </td>
                    <td className="p-4 font-medium text-white max-w-[180px] truncate">
                      {b.showtime?.event?.title}
                    </td>
                    <td className="p-4 font-mono">
                      {b.seats?.map(s => `${s.seat.rowLabel}-${s.seat.seatNumber}`).join(', ')}
                    </td>
                    <td className="p-4 font-bold text-white">₹{b.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-400 font-semibold rounded-full border border-green-500/20">
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
