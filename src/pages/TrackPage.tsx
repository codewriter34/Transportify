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

function statusEmoji(status?: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') return '✅';
  if (s === 'in-transit' || s === 'in transit') return '🕒';
  if (s === 'out-for-delivery' || s === 'out for delivery') return '📦';
  if (s === 'processing') return '⚙️';
  if (s === 'pending') return '⏳';
  if (s === 'cancelled') return '❌';
  return 'ℹ️';
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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://transportify-2mf215b8a-swankys-projects-4b0bf2b3.vercel.app';
      const res = await fetch(`${apiBaseUrl}/track/${encodeURIComponent(trackingID.trim())}`);
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

      {/* Light Hero with tracking form */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-[#1E3A8A] mb-4">Track Your Shipment</h1>
          <p className="text-gray-600 mb-6">Enter your tracking number to view real-time status and history.</p>
          <div className="bg-white rounded-lg shadow p-4 flex gap-3">
            <input
              value={trackingID}
              onChange={(e) => setTrackingID(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTrack(); }}
              placeholder="Enter tracking number (e.g., TRANS...)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTrack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-4 mb-6">
            {error}
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6 max-w-6xl mx-auto px-6">
          {/* Header with Logo and Barcode */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="/src/assets/transporify%20logo/logo.png"
                alt="Company Logo"
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
              <div>
                <div className="text-xl font-semibold text-[#1E3A8A]">Transportify</div>
                <div className="text-sm text-gray-500">Shipment Tracking</div>
              </div>
            </div>
            <div className="text-center">
              <svg ref={barcodeRef} className="mx-auto h-20"></svg>
              <div className="mt-2 text-sm tracking-wider text-gray-700">{result.trackingID}</div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1E3A8A]">Shipment Details</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-600 text-sm font-semibold">Tracking ID</div>
                  <div className="text-gray-900">{result.trackingID}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm font-semibold">Status</div>
                  <div className="text-gray-900">{statusEmoji(result.status)} {result.status || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm font-semibold">Estimated Delivery</div>
                  <div className="text-gray-900">{formatDate(result.estimatedDeliveryDate)}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm font-semibold">Last Updated</div>
                  <div className="text-gray-900">{formatDate(result.lastUpdated)}</div>
                </div>
              </div>
            </div>

            {/* Sender & Receiver */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">👥 Sender & Receiver</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-600 text-sm font-semibold">👤 Sender</div>
                  <div className="text-gray-900">
                    {result.sender?.name || '—'}<br/>
                    {result.sender?.email && <span className="text-sm text-gray-600">{result.sender.email}</span>}<br/>
                    {result.sender?.phone && <span className="text-sm text-gray-600">{result.sender.phone}</span>}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm font-semibold">🎯 Receiver</div>
                  <div className="text-gray-900">
                    {result.receiver?.name || '—'}<br/>
                    {result.receiver?.email && <span className="text-sm text-gray-600">{result.receiver.email}</span>}<br/>
                    {result.receiver?.phone && <span className="text-sm text-gray-600">{result.receiver.phone}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Package & Location */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">📦 Package & 📍 Location</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-600 text-sm font-semibold">📦 Package</div>
                  <div className="text-gray-900">
                    {result.package?.description || '—'}<br/>
                    {result.package?.weight && <span className="text-sm text-gray-600">Weight: {result.package.weight}kg</span>}<br/>
                    {result.package?.dimensions && <span className="text-sm text-gray-600">Size: {result.package.dimensions}</span>}<br/>
                    {result.package?.serviceType && <span className="text-sm text-gray-600">Service: {result.package.serviceType}</span>}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm font-semibold">📍 Current Location</div>
                  <div className="text-gray-900">{result.currentLocation?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm font-semibold">🧭 Route</div>
                  <div className="text-gray-900">
                    🟢 From: {formatPlace(result.origin || undefined)}<br/>
                    🏁 To: {formatPlace(result.destination || undefined)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Tracking History</h3>
            <div className="space-y-2">
              {(result.trackingHistory || []).map((h, idx) => (
                <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600 w-32">🕒 {formatDate(h.timestamp)}</div>
                  <div className="text-sm font-medium w-24">{statusEmoji(h.status)} {h.status || '—'}</div>
                  <div className="text-sm text-gray-700 flex-1">{h.location || '—'}</div>
                  {h.notes && <div className="text-xs text-gray-500">{h.notes}</div>}
                </div>
              ))}
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


