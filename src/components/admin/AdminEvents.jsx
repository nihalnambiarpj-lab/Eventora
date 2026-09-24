import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Star, MapPin } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { addToast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Movies');
  const [priceMin, setPriceMin] = useState('250');
  const [duration, setDuration] = useState('2h 15m');
  const [language, setLanguage] = useState('English');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/events');
      setEvents(res);
    } catch (err) {
      console.error('Fetch admin events error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          subtitle,
          category,
          priceMin: parseInt(priceMin, 10),
          duration,
          language,
          description,
          image: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&q=80',
        }),
      });

      addToast('Event created successfully!', 'success');
      setShowAddModal(false);
      fetchEvents();
      setTitle('');
      setSubtitle('');
      setDescription('');
    } catch (err) {
      addToast(err.message || 'Failed to create event', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await apiFetch(`/admin/events/${id}`, { method: 'DELETE' });
      addToast('Event deleted', 'info');
      fetchEvents();
    } catch (err) {
      addToast('Failed to delete event', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Event Catalog Manager</h1>
          <p className="text-xs text-gray-400 mt-1">Manage movies, concerts, sports events, and showtimes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Events Table / Grid */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading events catalog…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => (
            <div key={ev.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3 flex flex-col">
              <div className="flex items-center gap-3">
                <img src={ev.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md uppercase">
                    {ev.category}
                  </span>
                  <h3 className="font-bold text-white text-sm truncate mt-1">{ev.title}</h3>
                  <p className="text-xs text-gray-400 truncate">{ev.subtitle}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1 bg-gray-950 p-2.5 rounded-xl border border-gray-800 flex-1">
                <p><span className="text-gray-500">Starting Price:</span> ₹{ev.priceMin.toLocaleString()}</p>
                <p><span className="text-gray-500">Duration:</span> {ev.duration} · {ev.language}</p>
                <p><span className="text-gray-500">Showtimes count:</span> {ev.showtimes?.length || 0}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-xs text-gray-400 font-medium">ID: {ev.id.substr(0, 8)}…</span>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold">Create New Event</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Avatar 3"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="e.g. The Fire Na'vi Saga"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-indigo-500 text-white"
                  >
                    <option>Movies</option>
                    <option>Concerts</option>
                    <option>Sports</option>
                    <option>Comedy</option>
                    <option>Theatre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-indigo-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
