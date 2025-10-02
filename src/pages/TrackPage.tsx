import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect, useRef } from 'react';

type TrackingHistoryEntry = {
  status?: string;
  location?: string;
  timestamp?: any;
  notes?: string;
};

type Coordinates = { lat?: number; lng?: number } | null;

type ShipmentTracking = {
  trackingID: string;
  status?: string;
  estimatedDeliveryDate?: any;
  lastUpdated?: any;
  origin?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: Coordinates;
  } | null;
  destination?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: Coordinates;
  } | null;
  sender?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  receiver?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  package?: {
    description?: string;
    weight?: number;
    dimensions?: string;
    serviceType?: string;
    carrierId?: string;
    driverId?: string;
  } | null;
  currentLocation?: {
    name?: string | null;
    coordinates?: Coordinates;
  } | null;
  trackingHistory?: TrackingHistoryEntry[];
};

function formatDate(value?: any): string {
  if (!value) return '—';
  try {
    // Accept ISO strings from server or Firestore-like objects
    if (typeof value === 'string' || typeof value === 'number') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    }
    if (value?.seconds) {
      const d = new Date(value.seconds * 1000);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    }
    if (value?._seconds) {
      const d = new Date(value._seconds * 1000);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    }
    if (value?.toDate && typeof value.toDate === 'function') {
      const d = value.toDate();
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  } catch {
    return '—';
  }
}

function formatPlace(p?: { city?: string; state?: string; country?: string } | null): string {
  if (!p) return '—';
  return [p.city, p.state, p.country].filter(Boolean).join(', ');
}

function getStatusColor(status?: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') return 'text-green-600 bg-green-50 border-green-200';
  if (s === 'in-transit' || s === 'in transit') return 'text-blue-600 bg-blue-50 border-blue-200';
  if (s === 'out-for-delivery' || s === 'out for delivery') return 'text-purple-600 bg-purple-50 border-purple-200';
  if (s === 'processing') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (s === 'pending') return 'text-gray-600 bg-gray-50 border-gray-200';
  if (s === 'cancelled') return 'text-red-600 bg-red-50 border-red-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

function getStatusIcon(status?: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') return '✓';
  if (s === 'in-transit' || s === 'in transit') return '→';
  if (s === 'out-for-delivery' || s === 'out for delivery') return '📦';
  if (s === 'processing') return '⚙';
  if (s === 'pending') return '⏳';
  if (s === 'cancelled') return '✕';
  return 'ℹ';
}

export default function TrackPage() {
  const [trackingID, setTrackingID] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShipmentTracking | null>(null);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [editForm, setEditForm] = useState({
  //   status: '',
  //   location: '',
  //   notes: ''
  // });

  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    async function renderBarcode() {
      if (!result?.trackingID || !barcodeRef.current) return;
      // Load JsBarcode once
      if (!(window as any).JsBarcode) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load barcode library'));
          document.body.appendChild(s);
        });
      }
      try {
        (window as any).JsBarcode(barcodeRef.current, result.trackingID, {
          format: 'code128',
          displayValue: false,
          height: 60,
          margin: 0
        });
      } catch (e) {
        // Ignore barcode errors; UI will still show trackingID text
      }
    }
    renderBarcode();
  }, [result?.trackingID]);

  async function handleTrack() {
    if (!trackingID.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://transportify-qrem85z84-swankys-projects-4b0bf2b3.vercel.app';
      const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/track/${encodeURIComponent(trackingID.trim())}`);
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.message || 'Tracking ID not found');
      } else {
        setResult(data.data as ShipmentTracking);
      }
    } catch (e: any) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  // async function handleUpdateTracking() {
  //   if (!result?.trackingID) return;
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`http://localhost:3009/track/${result.trackingID}/location`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         lat: 0, // Will be updated by geocoding
  //         lng: 0,
  //         locationName: editForm.location,
  //         status: editForm.status,
  //         notes: editForm.notes
  //       })
  //     });
      
  //     if (res.ok) {
  //       await handleTrack(); // Refresh data
  //       setShowEditModal(false);
  //       setEditForm({ status: '', location: '', notes: '' });
  //     } else {
  //       setError('Failed to update tracking');
  //     }
  //   } catch (e) {
  //     setError('Network error');
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24"></div>

      {/* Clean Hero with tracking form */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Shipment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your tracking number to view real-time status, location updates, and delivery information.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="tracking-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  id="tracking-input"
                  value={trackingID}
                  onChange={(e) => setTrackingID(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTrack(); }}
                  placeholder="Enter your tracking number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleTrack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !trackingID.trim()}
                >
                  {loading ? 'Tracking...' : 'Track Shipment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center">
            <div className="text-lg font-medium mb-2">Unable to Track Shipment</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {result && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header with Status */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <img
                    src="/src/assets/transporify%20logo/logo.png"
                    alt="Transportify"
                    className="w-10 h-10"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.src.includes('logo.png')) {
                        img.src = '/src/assets/transporify%20logo/logo.svg';
                      } else if (img.src.includes('logo.svg')) {
                        img.src = '/src/assets/transporify%20logo/logo.jpg';
                      } else {
                        img.style.display = 'none';
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipment Details</h2>
                  <p className="text-gray-600">Tracking ID: {result.trackingID}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center lg:items-end">
                <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(result.status)}`}>
                  <span className="mr-2">{getStatusIcon(result.status)}</span>
                  {result.status || 'Unknown'}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Last updated: {formatDate(result.lastUpdated)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Route Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Route Information</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm text-gray-500">Origin</div>
                    <div className="font-medium text-gray-900">{formatPlace(result.origin || undefined)}</div>
                  </div>
                </div>
                <div className="ml-1.5 border-l-2 border-gray-200 h-8"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm text-gray-500">Destination</div>
                    <div className="font-medium text-gray-900">{formatPlace(result.destination || undefined)}</div>
                  </div>
                </div>
                {result.currentLocation?.name && (
                  <>
                    <div className="ml-1.5 border-l-2 border-gray-200 h-8"></div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="text-sm text-gray-500">Current Location</div>
                        <div className="font-medium text-gray-900">{result.currentLocation.name}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Package Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Service Type</div>
                  <div className="font-medium text-gray-900 capitalize">{result.package?.serviceType || 'Standard'}</div>
                </div>
                {result.package?.weight && (
                  <div>
                    <div className="text-sm text-gray-500">Weight</div>
                    <div className="font-medium text-gray-900">{result.package.weight} kg</div>
                  </div>
                )}
                {result.package?.dimensions && (
                  <div>
                    <div className="text-sm text-gray-500">Dimensions</div>
                    <div className="font-medium text-gray-900">{result.package.dimensions}</div>
                  </div>
                )}
                {result.estimatedDeliveryDate && (
                  <div>
                    <div className="text-sm text-gray-500">Estimated Delivery</div>
                    <div className="font-medium text-gray-900">{formatDate(result.estimatedDeliveryDate)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Sender Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{result.sender?.name || 'Not provided'}</div>
                </div>
                {result.sender?.email && (
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{result.sender.email}</div>
                  </div>
                )}
                {result.sender?.phone && (
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium text-gray-900">{result.sender.phone}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Receiver Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{result.receiver?.name || 'Not provided'}</div>
                </div>
                {result.receiver?.email && (
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{result.receiver.email}</div>
                  </div>
                )}
                {result.receiver?.phone && (
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium text-gray-900">{result.receiver.phone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Tracking History</h3>
              <div className="space-y-6">
                {(result.trackingHistory || []).map((h, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      {idx < (result.trackingHistory?.length || 0) - 1 && (
                        <div className="ml-1.5 w-0.5 h-8 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(h.status)}`}>
                          <span className="mr-1">{getStatusIcon(h.status)}</span>
                          {h.status || 'Update'}
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(h.timestamp)}</div>
                      </div>
                      <div className="mt-2">
                        <div className="text-gray-900 font-medium">{h.location || 'Location not specified'}</div>
                        {h.notes && (
                          <div className="text-sm text-gray-600 mt-1">{h.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Read-only tracking page: updates are done in Admin Dashboard */}

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}




