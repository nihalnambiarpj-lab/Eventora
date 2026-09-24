import { useState, useEffect } from 'react';
import { Building2, Grid, MapPin, Layers } from 'lucide-react';
import { apiFetch } from '../../api/client';

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoading(true);
        const res = await apiFetch('/admin/venues');
        setVenues(res);
      } catch (err) {
        console.error('Fetch admin venues error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Venues & Hall Layouts</h1>
        <p className="text-xs text-gray-400 mt-1">Configure screens, rows, seat tiers, and aisle gap specifications</p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading venues…</div>
      ) : (
        <div className="space-y-4">
          {venues.map(v => (
            <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{v.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-400" /> {v.address}, {v.city}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold rounded-full border border-gray-700">
                  {v.screenType}
                </span>
              </div>

              {/* Screens Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Configured Screens</h4>
                {v.screens?.map(sc => (
                  <div key={sc.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Grid className="w-4 h-4 text-indigo-400" /> {sc.name}
                      </p>
                      <p className="text-gray-400">
                        Grid Dimensions: <span className="text-white font-mono">{sc.rowsCount} Rows × {sc.colsCount} Cols</span> ({sc.rowsCount * sc.colsCount} seats)
                      </p>
                      <p className="text-gray-400">
                        Aisle Gap Columns: <span className="text-indigo-300 font-mono">{sc.aisleGaps}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 font-semibold rounded-lg border border-green-500/20">
                      {sc.seats?.length || 120} Seats Configured
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
