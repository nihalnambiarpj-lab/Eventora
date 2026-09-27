import { useState, useEffect } from 'react';
import {
  Building2, Grid, MapPin, Layers, Plus, Trash2, X,
  Film, Music, Trophy, Theater, ChevronDown, ChevronUp, Check, AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const VENUE_TYPES = [
  {
    id: 'CINEMA_CURVED',
    label: 'Movie Theater',
    icon: Film,
    color: 'indigo',
    description: 'IMAX, Dolby, multiplex cinemas',
    defaultScreen: { name: 'Audi 1', rowsCount: 10, colsCount: 14, aisleGaps: [4, 10] },
  },
  {
    id: 'STAGE_CONCERT',
    label: 'Stadium / Arena',
    icon: Trophy,
    color: 'emerald',
    description: 'Sports stadiums & concert arenas',
    defaultScreen: { name: 'Main Stand', rowsCount: 12, colsCount: 20, aisleGaps: [5, 15] },
  },
  {
    id: 'CONCERT_HALL',
    label: 'Concert Hall',
    icon: Music,
    color: 'amber',
    description: 'Indoor concert & music venues',
    defaultScreen: { name: 'Concert Floor', rowsCount: 10, colsCount: 16, aisleGaps: [5, 11] },
  },
  {
    id: 'THEATRE',
    label: 'Theatre',
    icon: Theater,
    color: 'purple',
    description: 'Drama, comedy & performing arts',
    defaultScreen: { name: 'Main Stage', rowsCount: 10, colsCount: 12, aisleGaps: [4, 8] },
  },
];

const COLOR_MAP = {
  indigo: { badge: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300', icon: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', ring: 'border-indigo-500 bg-indigo-600/10' },
  emerald: { badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', ring: 'border-emerald-500 bg-emerald-600/10' },
  amber: { badge: 'bg-amber-500/10 border-amber-500/30 text-amber-300', icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400', ring: 'border-amber-500 bg-amber-600/10' },
  purple: { badge: 'bg-purple-500/10 border-purple-500/30 text-purple-300', icon: 'bg-purple-500/10 border-purple-500/20 text-purple-400', ring: 'border-purple-500 bg-purple-600/10' },
};

function getTypeInfo(screenType) {
  return VENUE_TYPES.find(t => t.id === screenType) || VENUE_TYPES[0];
}

function ScreenEditor({ screen, index, onChange, onRemove, canRemove }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
          Zone / Screen {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div>
        <label className="block text-gray-400 text-xs mb-1">Name / Zone Label</label>
        <input
          type="text"
          required
          value={screen.name}
          onChange={e => onChange({ ...screen, name: e.target.value })}
          placeholder="e.g. IMAX Audi 1, North Stand, Main Stage"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 text-xs mb-1">Rows (A–Z)</label>
          <input
            type="number"
            min="2"
            max="15"
            required
            value={screen.rowsCount}
            onChange={e => onChange({ ...screen, rowsCount: parseInt(e.target.value, 10) || 10 })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Columns / Seats per Row</label>
          <input
            type="number"
            min="4"
            max="30"
            required
            value={screen.colsCount}
            onChange={e => onChange({ ...screen, colsCount: parseInt(e.target.value, 10) || 12 })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-900 rounded-xl px-3 py-2 border border-gray-800">
        <span className="text-xs text-gray-400">Total Seats</span>
        <span className="text-xs font-bold text-white font-mono">
          {screen.rowsCount * screen.colsCount} seats
        </span>
      </div>

      {/* Mini tier preview */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: 'RECLINER', color: 'bg-amber-500/20 border-amber-500/50 text-amber-300', rows: '2 rows' },
          { label: 'PREMIUM', color: 'bg-purple-500/20 border-purple-500/50 text-purple-300', rows: '2 rows' },
          { label: 'GOLD', color: 'bg-teal-500/20 border-teal-500/50 text-teal-300', rows: '2 rows' },
          { label: 'SILVER', color: 'bg-sky-500/20 border-sky-500/50 text-sky-300', rows: 'remaining' },
        ].map(t => (
          <span key={t.label} className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${t.color}`}>
            {t.label} · {t.rows}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  // Form state
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [screenType, setScreenType] = useState('CINEMA_CURVED');
  const [screens, setScreens] = useState([{ name: 'Audi 1', rowsCount: 10, colsCount: 14 }]);
  const [expandedVenue, setExpandedVenue] = useState(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/venues');
      setVenues(res);
    } catch (err) {
      console.error('Fetch admin venues error:', err);
      addToast('Failed to load venues', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setVenueName('');
    setAddress('');
    setCity('');
    setScreenType('CINEMA_CURVED');
    setScreens([{ name: 'Audi 1', rowsCount: 10, colsCount: 14 }]);
    setShowModal(true);
  }

  function handleTypeSelect(typeId) {
    setScreenType(typeId);
    const typeInfo = VENUE_TYPES.find(t => t.id === typeId);
    if (typeInfo) {
      setScreens([{ ...typeInfo.defaultScreen }]);
    }
  }

  function addScreen() {
    if (screens.length >= 6) {
      addToast('Maximum 6 screens/zones allowed.', 'info');
      return;
    }
    setScreens(prev => [...prev, { name: `Zone ${prev.length + 1}`, rowsCount: 10, colsCount: 12 }]);
  }

  function updateScreen(index, updated) {
    setScreens(prev => prev.map((s, i) => i === index ? updated : s));
  }

  function removeScreen(index) {
    setScreens(prev => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (screens.length === 0) {
      addToast('Add at least one screen/zone.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const newVenue = await apiFetch('/admin/venues', {
        method: 'POST',
        body: JSON.stringify({
          name: venueName,
          address,
          city,
          screenType,
          screens,
        }),
      });
      addToast(`✅ "${newVenue.name}" created with ${newVenue.screens.length} screen(s)!`, 'success');
      setShowModal(false);
      fetchVenues();
    } catch (err) {
      addToast(err.message || 'Failed to create venue.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This will remove all screens, seats and showtimes linked to this venue.`)) return;
    try {
      await apiFetch(`/admin/venues/${id}`, { method: 'DELETE' });
      addToast(`Venue "${name}" deleted.`, 'info');
      fetchVenues();
    } catch (err) {
      addToast('Failed to delete venue.', 'error');
    }
  }

  const totalSeatsCreating = screens.reduce((sum, s) => sum + (s.rowsCount * s.colsCount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Venues & Hall Layouts</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage movie theaters, stadiums, concert halls & theatres
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Add New Venue
        </button>
      </div>

      {/* Venue Cards */}
      {loading ? (
        <div className="text-gray-400 text-sm animate-pulse">Loading venues…</div>
      ) : venues.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm border border-dashed border-gray-800 rounded-2xl">
          No venues configured yet. Add your first venue above.
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map(v => {
            const typeInfo = getTypeInfo(v.screenType);
            const Icon = typeInfo.icon;
            const colors = COLOR_MAP[typeInfo.color];
            const isExpanded = expandedVenue === v.id;

            return (
              <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Venue Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-base">{v.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase ${colors.badge}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {v.address}, {v.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">
                        <span className="text-white font-bold">{v.screens?.length || 0}</span> screen{v.screens?.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {v.totalSeats?.toLocaleString()} total seats
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedVenue(isExpanded ? null : v.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title="Toggle screens"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(v.id, v.name)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Venue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Screens expanded */}
                {isExpanded && (
                  <div className="p-5 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5" /> Configured Screens / Zones
                    </h4>
                    {v.screens?.map(sc => (
                      <div key={sc.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-indigo-400" /> {sc.name}
                          </p>
                          <p className="text-gray-400">
                            Grid: <span className="text-white font-mono">{sc.rowsCount} Rows × {sc.colsCount} Cols</span>
                          </p>
                          <p className="text-gray-400">
                            Aisle Gaps at columns: <span className="text-indigo-300 font-mono">{sc.aisleGaps}</span>
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 font-semibold rounded-lg border border-green-500/20">
                          {sc.seats?.length || (sc.rowsCount * sc.colsCount)} Seats
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create Venue Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-gray-900 border border-gray-800 text-white rounded-3xl w-full max-w-2xl shadow-2xl my-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-white">Add New Venue</h2>
                <p className="text-xs text-gray-400 mt-0.5">Configure screens, zones & seat layout</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

                {/* ── Venue Type Selector ── */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">Venue Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {VENUE_TYPES.map(type => {
                      const Icon = type.icon;
                      const colors = COLOR_MAP[type.color];
                      const isSelected = screenType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleTypeSelect(type.id)}
                          className={`relative p-3 rounded-2xl border-2 text-left transition-all ${
                            isSelected ? colors.ring + ' border-2' : 'border-gray-800 hover:border-gray-700 bg-gray-950'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            </span>
                          )}
                          <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
                          <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {type.label}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{type.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Basic Info ── */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-300">Venue Details</label>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Venue Name</label>
                    <input
                      type="text"
                      required
                      value={venueName}
                      onChange={e => setVenueName(e.target.value)}
                      placeholder="e.g. PVR IMAX Grand, Wankhede Stadium, NCPA Mumbai"
                      className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Address / Landmark</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="e.g. Phoenix Palladium, Lower Parel"
                        className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Mumbai"
                        className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Screen / Zone Configuration ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-300">
                      Screens / Zones ({screens.length})
                    </label>
                    <button
                      type="button"
                      onClick={addScreen}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Screen
                    </button>
                  </div>

                  <div className="space-y-3">
                    {screens.map((screen, idx) => (
                      <ScreenEditor
                        key={idx}
                        screen={screen}
                        index={idx}
                        onChange={updated => updateScreen(idx, updated)}
                        onRemove={() => removeScreen(idx)}
                        canRemove={screens.length > 1}
                      />
                    ))}
                  </div>

                  {/* Total seat preview */}
                  <div className="flex items-center gap-2 bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-3 text-xs">
                    <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-indigo-300">
                      This venue will have <span className="font-bold text-white">{totalSeatsCreating.toLocaleString()} seats</span> across <span className="font-bold text-white">{screens.length}</span> screen{screens.length !== 1 ? 's' : ''}. Seat tiers (SILVER → RECLINER) are auto-assigned by row position.
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      Create Venue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
