import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  analyzeLocation,
  fetchAnalysisHistory,
  selectAnalysis,
  clearSelected,
  clearError,
  type AnalysisItem,
} from '@/store/aiMapSlice';

(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ScoreBar({
  value,
  max = 100,
  color,
}: {
  value: number;
  max?: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-secondary">{value}</span>
    </div>
  );
}

type RatingKey = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';

function RatingBadge({ rating }: { rating: string }) {
  const colors: Record<RatingKey, string> = {
    'A+': 'border-emerald-300 bg-emerald-100 text-emerald-800',
    A: 'border-green-300 bg-green-100 text-green-800',
    'B+': 'border-lime-300 bg-lime-100 text-lime-800',
    B: 'border-yellow-300 bg-yellow-100 text-yellow-800',
    'C+': 'border-orange-300 bg-orange-100 text-orange-800',
    C: 'border-red-300 bg-red-100 text-red-800',
    D: 'border-neutral-300 bg-neutral-100 text-neutral-800',
  };
  const colorClass = colors[rating as RatingKey] || colors.B;
  return (
    <span className={`inline-block rounded-lg border-2 px-3 py-1 text-xl font-bold ${colorClass}`}>
      {rating}
    </span>
  );
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: { lat: number; lng: number }) => void;
}) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

function AnalysisPanel({
  analysis,
  onClose,
  className = '',
}: {
  analysis: AnalysisItem;
  onClose: () => void;
  className?: string;
}) {
  const a = analysis.analysis || {};

  return (
    <div
      className={`z-[1000] overflow-y-auto rounded-2xl border border-border bg-surface shadow-token-lg ${className}`}
    >
      <div className="sticky top-0 flex items-start justify-between rounded-t-2xl border-b border-border bg-surface/95 p-4 backdrop-blur">
        <div>
          <h2 className="text-sm font-bold leading-tight text-primary">
            {analysis.address?.slice(0, 60) || 'Location analysis'}
          </h2>
          <p className="mt-0.5 text-xs text-secondary">
            {analysis.coordinates?.lat?.toFixed(5)} , {analysis.coordinates?.lng?.toFixed(5)}
          </p>
        </div>
        <button onClick={onClose} className="ml-2 shrink-0 text-secondary hover:text-primary">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3.5">
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <div className="text-2xl font-black text-blue-700">{a.constructionScore ?? '-'}</div>
            <div className="mt-0.5 text-xs font-medium text-blue-600">Construction score</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-neutral-50 p-3">
            <RatingBadge rating={a.investmentRating || 'B'} />
            <div className="mt-1 text-xs font-medium text-secondary">Investment rating</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs text-secondary">
              <span>Risk score</span>
              <span
                className={
                  (a.riskScore ?? 0) > 60
                    ? 'text-red-500'
                    : (a.riskScore ?? 0) > 30
                      ? 'text-yellow-500'
                      : 'text-green-500'
                }
              >
                {(a.riskScore ?? 0) > 60 ? 'High' : (a.riskScore ?? 0) > 30 ? 'Medium' : 'Low'}
              </span>
            </div>
            <ScoreBar
              value={a.riskScore ?? 50}
              color={
                (a.riskScore ?? 0) > 60
                  ? 'bg-red-400'
                  : (a.riskScore ?? 0) > 30
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
              }
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-secondary">Road connectivity</div>
            <ScoreBar value={a.roadConnectivity ?? 50} color="bg-blue-400" />
          </div>
        </div>

        {analysis.geodata && (
          <div className="rounded-xl bg-slate-50 p-3.5">
            <div className="mb-2 text-xs font-medium text-slate-500">Real data (5 km radius)</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Hospitals', value: analysis.geodata.hospitals },
                { label: 'Schools', value: analysis.geodata.schools },
                { label: 'Transit', value: analysis.geodata.transitStops },
                { label: 'Roads', value: analysis.geodata.majorRoads },
                {
                  label: 'Elevation',
                  value:
                    analysis.geodata.elevationM !== undefined
                      ? `${analysis.geodata.elevationM}m`
                      : undefined,
                },
                { label: 'Quakes', value: analysis.geodata.earthquakesNearby },
              ]
                .filter((d) => d.value !== null && d.value !== undefined)
                .map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-surface p-1.5">
                    <div className="text-xs font-bold text-primary">{value}</div>
                    <div className="text-[10px] text-secondary">{label}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {[
            { label: 'Appreciation', value: a.appreciationRate },
            { label: 'Best use', value: a.bestUseCase },
            { label: 'Zoning', value: a.zoningClassification },
            { label: 'Permit complexity', value: a.permitComplexity },
            { label: 'Utility proximity', value: a.utilityProximity },
            { label: 'Transport access', value: a.transportAccess },
            { label: 'Amenity density', value: a.amenityDensity },
            { label: 'FAR limit', value: a.farLimit },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-neutral-50 p-2.5">
              <div className="text-[10px] leading-tight text-secondary">{label}</div>
              <div className="mt-0.5 truncate font-semibold text-primary">{value || '-'}</div>
            </div>
          ))}
        </div>

        {a.estimatedCostRange && (
          <div className="rounded-xl bg-indigo-50 p-3.5">
            <div className="mb-1 text-xs font-medium text-indigo-600">Estimated construction cost</div>
            <div className="font-bold text-indigo-900">{a.estimatedCostRange}</div>
          </div>
        )}

        {a.projectedROI && (
          <div className="rounded-xl bg-green-50 p-3.5">
            <div className="mb-2 text-xs font-medium text-green-600">Projected ROI</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: '3 year', value: a.projectedROI.threeYear },
                { label: '5 year', value: a.projectedROI.fiveYear },
                { label: '10 year', value: a.projectedROI.tenYear },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-sm font-bold text-green-800">{value || '-'}</div>
                  <div className="text-[10px] text-green-600">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {a.riskAdjustedReturn && (
          <div className="text-xs text-secondary">
            <span className="font-medium">Risk adjusted return:</span> {a.riskAdjustedReturn}
          </div>
        )}

        {a.permittedTypes && a.permittedTypes.length > 0 && (
          <div>
            <div className="mb-1 text-xs font-medium text-secondary">Permitted building types</div>
            <div className="flex flex-wrap gap-1">
              {a.permittedTypes.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {a.summary && (
          <div className="rounded-xl bg-amber-50 p-3.5">
            <div className="mb-1 text-xs font-medium text-amber-600">AI summary</div>
            <p className="text-xs leading-relaxed text-primary">{a.summary}</p>
          </div>
        )}

        {a.recommendations && a.recommendations.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-medium text-secondary">Recommendations</div>
            <ul className="space-y-1">
              {a.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-xs text-primary">
                  <span className="shrink-0 text-green-600">-</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiMapPage() {
  const dispatch = useAppDispatch();
  const orgId = useAppSelector((s) => s.auth.user?.org?.id);
  const { history, selectedAnalysis, analyzing, error } = useAppSelector((s) => s.aiMap);

  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const historyMarkers = useMemo(() => history.filter((item) => item.coordinates), [history]);

  useEffect(() => {
    if (orgId) {
      dispatch(fetchAnalysisHistory({ orgId }));
    }
  }, [orgId, dispatch]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleMapClick = useCallback(
    (latlng: { lat: number; lng: number }) => {
      if (analyzing) return;
      if (!orgId) {
        setLocalError('No organization found. Create or switch to an organization first.');
        return;
      }
      setPin(latlng);
      setLocalError(null);
      dispatch(clearError());
      dispatch(analyzeLocation({ orgId, lat: latlng.lat, lng: latlng.lng }));
    },
    [analyzing, orgId, dispatch]
  );

  const handleSelectHistory = useCallback(
    (analysis: AnalysisItem) => {
      dispatch(selectAnalysis(analysis));
      if (analysis.coordinates) {
        setPin({
          lat: analysis.coordinates.lat,
          lng: analysis.coordinates.lng,
        });
      }
    },
    [dispatch]
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col p-0">
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-surface">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />

          {pin && (
            <Circle
              center={[pin.lat, pin.lng]}
              radius={5000}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.06,
                weight: 2,
                dashArray: '6 4',
              }}
            />
          )}

          {pin && (
            <Marker position={[pin.lat, pin.lng]}>
              <Popup>
                {analyzing ? 'Collecting 5 km radius data...' : selectedAnalysis?.address || 'Selected point'}
              </Popup>
            </Marker>
          )}

          {historyMarkers
            .filter((a) => !pin || a.coordinates?.lat !== pin.lat || a.coordinates?.lng !== pin.lng)
            .map((a) => (
              <Marker
                key={a._id}
                position={[a.coordinates!.lat, a.coordinates!.lng]}
                opacity={0.6}
                eventHandlers={{ click: () => handleSelectHistory(a) }}
              >
                <Popup>
                  <strong>{a.address?.split(',')[0]}</strong>
                  <br />
                  Rating: {a.analysis?.investmentRating} | Score: {a.analysis?.constructionScore}
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {localError && (
          <div className="absolute left-1/2 top-4 z-[1001] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-token-md">
            <div className="flex items-center justify-between gap-3">
              <span>{localError}</span>
              <button
                className="shrink-0 text-red-700 underline underline-offset-2"
                onClick={() => setLocalError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {selectedAnalysis && (
          <AnalysisPanel
            analysis={selectedAnalysis}
            onClose={() => dispatch(clearSelected())}
            className="absolute right-4 top-4 max-h-[calc(100%-7rem)] w-[min(26rem,calc(100%-2rem))]"
          />
        )}

        {!selectedAnalysis && !analyzing && !pin && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-[999] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-white/90 px-5 py-3 shadow-token-md backdrop-blur-sm">
            <p className="text-center text-sm font-medium text-secondary">
              Click anywhere on the map to run AI analysis
            </p>
          </div>
        )}

        {analyzing && pin && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-[999] -translate-x-1/2 rounded-2xl bg-blue-600/90 px-5 py-3 shadow-token-md backdrop-blur-sm">
            <p className="text-center text-sm font-medium text-white">
              Collecting data within 5 km radius...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
