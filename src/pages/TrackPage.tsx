import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RouteMap from '../components/RouteMap';
import logo from '../assets/transportify-logo.png';

type Coordinates = { lat?: number; lng?: number } | null;

type TrackingHistoryEntry = {
  status?: string;
  location?: string;
  timestamp?: string | number | null;
  notes?: string;
};

type ShipmentTracking = {
  trackingID: string;
  status?: string;
  estimatedDeliveryDate?: string | number | null;
  lastUpdated?: string | number | null;
  origin?: { city?: string; state?: string; country?: string; coordinates?: Coordinates } | null;
  destination?: { city?: string; state?: string; country?: string; coordinates?: Coordinates } | null;
  sender?: { name?: string } | null;
  receiver?: { name?: string } | null;
  package?: {
    name?: string;
    description?: string;
    category?: string;
    cost?: number | string;
    weight?: number;
    dimensions?: string;
    serviceType?: string;
    paymentMethod?: string;
  } | null;
  currentLocation?: { name?: string | null; coordinates?: Coordinates } | null;
  trackingHistory?: TrackingHistoryEntry[];
  bill?: {
    title?: string;
    price?: number;
    description?: string;
    sentAt?: string | null;
  } | null;
};

const FLOW = [
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'in-transit', label: 'In transit' },
  { key: 'out-for-delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function statusKey(status?: string): string {
  return (status || '').toLowerCase().replace(/\s+/g, '-');
}

function formatDate(value?: string | number | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function formatPlace(place?: { city?: string; state?: string; country?: string } | null): string {
  if (!place) return '—';
  const text = [place.city, place.state, place.country].filter(Boolean).join(', ');
  return text || '—';
}

const TRACKING_API = 'https://transportify-phi.vercel.app';

function trackingRequestUrls(id: string): string[] {
  const encoded = encodeURIComponent(id.trim());
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const base = (configured || TRACKING_API).replace(/\/$/, '');
  return [`${base}/track/${encoded}`];
}

export default function TrackPage() {
  const navigate = useNavigate();
  const { trackingId: pathId } = useParams();
  const [params] = useSearchParams();
  const requestedId = (pathId || params.get('id') || '').trim();

  const [trackingID, setTrackingID] = useState(requestedId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShipmentTracking | null>(null);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setTrackingID(requestedId);
    if (!requestedId) {
      setResult(null);
      setError(null);
      return;
    }

    let cancelled = false;
    async function lookup() {
      setLoading(true);
      setError(null);
      setResult(null);
      let message = 'The tracking service could not be reached.';
      try {
        for (const url of trackingRequestUrls(requestedId)) {
          try {
            const response = await fetch(url);
            const data = await response.json().catch(() => null);
            if (cancelled) return;
            if (response.ok && data?.success && data.data) {
              setResult(data.data as ShipmentTracking);
              message = '';
              break;
            }
            if (response.status === 404) {
              message = data?.message || 'Tracking number not found';
            } else if (data?.message) {
              message = data.message;
            }
          } catch {
            // Try the next tracking address.
          }
        }
        if (!cancelled && message) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void lookup();
    return () => {
      cancelled = true;
    };
  }, [requestedId, attempt]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const id = trackingID.trim();
    if (!id) return;
    if (id === requestedId) {
      setAttempt((value) => value + 1);
      return;
    }
    navigate(`/track?id=${encodeURIComponent(id)}`);
  }

  async function copyLink() {
    if (!result?.trackingID) return;
    const url = `${window.location.origin}/track?id=${encodeURIComponent(result.trackingID)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const currentKey = statusKey(result?.status);
  const stepIndex = FLOW.findIndex((step) => step.key === currentKey);
  const isException = currentKey === 'cancelled' || currentKey === 'on-hold';
  const history = [...(result?.trackingHistory || [])].reverse();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Track a shipment</h1>
          <p className="text-gray-600 mb-6">Enter a tracking number to see status, route, and updates.</p>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <label htmlFor="tracking-input" className="block text-sm font-medium text-gray-700 mb-2">
              Tracking number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="tracking-input"
                value={trackingID}
                onChange={(event) => setTrackingID(event.target.value)}
                placeholder="Enter your tracking number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <button
                type="submit"
                disabled={loading || !trackingID.trim()}
                className="bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {loading ? 'Looking up...' : 'Track'}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-6 animate-fade-in-up">
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="" className="h-12 w-12 object-contain" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{result.trackingID}</h2>
                    <p className="text-sm text-gray-500">Updated {formatDate(result.lastUpdated)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {copied ? 'Link copied' : 'Copy tracking link'}
                </button>
              </div>

              {isException ? (
                <p className={`mt-6 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${currentKey === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
                  {currentKey === 'cancelled' ? 'Cancelled' : 'On hold'}
                </p>
              ) : (
                <ol className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {FLOW.map((step, index) => {
                    const reached = stepIndex >= index && stepIndex !== -1;
                    return (
                      <li key={step.key} className="min-w-0">
                        <div className={`h-1.5 rounded-full mb-2 ${reached ? 'bg-lime-500' : 'bg-gray-200'}`} />
                        <span className={`text-xs sm:text-sm ${reached ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route</h3>
                <RouteMap
                  origin={result.origin?.coordinates}
                  current={result.currentLocation?.coordinates}
                  destination={result.destination?.coordinates}
                />
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Origin</dt>
                    <dd className="font-medium text-gray-900">{formatPlace(result.origin)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Current location</dt>
                    <dd className="font-medium text-gray-900">{result.currentLocation?.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Destination</dt>
                    <dd className="font-medium text-gray-900">{formatPlace(result.destination)}</dd>
                  </div>
                </dl>
              </section>

              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Updates</h3>
                {history.length === 0 ? (
                  <p className="text-gray-600">No updates have been recorded yet.</p>
                ) : (
                  <ol className="space-y-5">
                    {history.map((entry, index) => (
                      <li key={`${entry.timestamp || 'update'}-${index}`} className="border-l-2 border-lime-500 pl-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-medium text-gray-900 capitalize">{(entry.status || 'Update').replace(/-/g, ' ')}</span>
                          <span className="text-sm text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-gray-700">{entry.location || 'Location not specified'}</p>
                        {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Item</dt>
                    <dd className="font-medium text-gray-900">{result.package?.name || result.package?.description || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Service</dt>
                    <dd className="font-medium text-gray-900 capitalize">{result.package?.serviceType || 'Standard'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Estimated delivery</dt>
                    <dd className="font-medium text-gray-900">{formatDate(result.estimatedDeliveryDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Weight</dt>
                    <dd className="font-medium text-gray-900">{result.package?.weight ? `${result.package.weight} kg` : '—'}</dd>
                  </div>
                  {result.package?.dimensions && (
                    <div>
                      <dt className="text-gray-500">Dimensions</dt>
                      <dd className="font-medium text-gray-900">{result.package.dimensions}</dd>
                    </div>
                  )}
                  {result.package?.category && (
                    <div>
                      <dt className="text-gray-500">Category</dt>
                      <dd className="font-medium text-gray-900 capitalize">{result.package.category}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill</h3>
                {result.bill?.title ? (
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Title</dt>
                      <dd className="font-medium text-gray-900">{result.bill.title}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Amount</dt>
                      <dd className="font-medium text-gray-900">
                        {typeof result.bill.price === 'number' ? `$${result.bill.price.toFixed(2)}` : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Description</dt>
                      <dd className="font-medium text-gray-900">{result.bill.description || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Sent</dt>
                      <dd className="font-medium text-gray-900">{formatDate(result.bill.sentAt)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-gray-600">No bill has been sent for this shipment.</p>
                )}
              </section>

              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Parties</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Sender</dt>
                    <dd className="font-medium text-gray-900">{result.sender?.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Receiver</dt>
                    <dd className="font-medium text-gray-900">{result.receiver?.name || '—'}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
