import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { PassService, LocationService } from '../lib/database-service';
import { db } from '../lib/firebase';
import { collection, where, orderBy, getDocs, query } from 'firebase/firestore';
import type { Pass, Location } from '../lib/database';

export default function StudentHome() {
  const { profile, loading: authLoading } = useAuth();
  const [activePass, setActivePass] = useState<Pass | null>(null);
  const [passHistory, setPassHistory] = useState<Pass[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({ destination: '', notes: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Helper to fetch all passes for a student (pass history)
  async function fetchPassHistory(studentId: string): Promise<Pass[]> {
    const passesRef = collection(db, 'passes');
    const q = query(
      passesRef,
      where('studentId', '==', studentId),
      orderBy('openedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pass));
  }

  // Fetch locations, active pass, and pass history
  useEffect(() => {
    async function fetchData() {
      if (!profile || !profile.metadata?.studentId) return;
      setDataLoading(true);
      setDataError(null);
      try {
        const [locs, active, history] = await Promise.all([
          LocationService.getLocations(true),
          PassService.getActivePassesForStudent(profile.metadata.studentId),
          fetchPassHistory(profile.metadata.studentId)
        ]);
        setLocations(locs);
        setActivePass(active[0] || null);
        setPassHistory(history);
      } catch (err: any) {
        setDataError(err.message || 'Failed to load dashboard data.');
      } finally {
        setDataLoading(false);
      }
    }
    if (profile && profile.metadata?.studentId) {
      fetchData();
    }
  }, [profile]);

  // Handle form input changes
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(null);
  }

  // Handle pass creation
  async function handleCreatePass(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (!profile || !profile.metadata?.studentId) throw new Error('User profile not loaded.');
      const studentId = profile.metadata.studentId;
      const studentName = profile.displayName;
      // Find origin location (current scheduled location or fallback)
      // For now, use the first location as origin (should be replaced with real schedule logic)
      const origin = locations[0];
      const destination = locations.find(l => l.id === form.destination);
      if (!origin || !destination) throw new Error('Please select a valid destination.');
      if (origin.id === destination.id) throw new Error('Origin and destination must be different.');
      await PassService.createPass({
        studentId,
        studentName,
        originLocationId: origin.id,
        originLocationName: origin.name,
        destinationLocationId: destination.id,
        destinationLocationName: destination.name,
        issuedById: profile.uid,
        issuedByName: profile.displayName,
        isOverride: false,
        notes: form.notes || null
      });
      setForm({ destination: '', notes: '' });
      // Refresh data
      if (profile && profile.metadata?.studentId) {
        const [active, history] = await Promise.all([
          PassService.getActivePassesForStudent(profile.metadata.studentId),
          fetchPassHistory(profile.metadata.studentId)
        ]);
        setActivePass(active[0] || null);
        setPassHistory(history);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create pass.');
    } finally {
      setFormLoading(false);
    }
  }

  // Color for pass status
  function getPassStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'closed':
      case 'expired':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  }

  // Accessibility: loading and error states
  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-700">
        Loading dashboard...
      </div>
    );
  }
  
  if (dataError) {
    return (
      <div className="flex flex-col items-center min-h-screen text-red-600">
        {dataError}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-blue-900">Student Dashboard</h1>
        <p className="text-gray-600 text-sm">Welcome, {profile?.displayName}</p>
      </div>

      {/* Current Pass Status */}
      <section aria-labelledby="current-pass-heading" className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
        <h2 id="current-pass-heading" className="text-lg font-semibold">Current Pass</h2>
        {activePass ? (
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${getPassStatusColor(activePass.status)}`} aria-label={activePass.status}></span>
            <span className="font-medium">{activePass.status === 'active' ? 'Active' : activePass.status.charAt(0).toUpperCase() + activePass.status.slice(1)}</span>
            <span className="ml-2 text-xs text-gray-500">To: {activePass.destinationLocationName}</span>
            <span className="ml-2 text-xs text-gray-400">Opened: {activePass.openedAt.toDate().toLocaleTimeString()}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400" aria-label="No active pass"></span>
            <span className="font-medium">No active pass</span>
          </div>
        )}
      </section>

      {/* Pass Creation Form */}
      <section aria-labelledby="create-pass-heading" className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
        <h2 id="create-pass-heading" className="text-lg font-semibold">Create New Pass</h2>
        <form className="flex flex-col gap-3" aria-label="Create Pass Form" onSubmit={handleCreatePass}>
          <label htmlFor="destination" className="font-medium">Destination</label>
          <select
            id="destination"
            name="destination"
            className="border rounded px-2 py-1"
            required
            value={form.destination}
            onChange={handleInputChange}
            disabled={!!activePass || formLoading}
          >
            <option value="">Select a location</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>

          <label htmlFor="notes" className="font-medium">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            className="border rounded px-2 py-1"
            rows={2}
            maxLength={120}
            placeholder="Reason or details..."
            value={form.notes}
            onChange={handleInputChange}
            disabled={!!activePass || formLoading}
          />

          {formError && <div className="text-red-600 text-sm" role="alert">{formError}</div>}

          <Button type="submit" className="mt-2 w-full" disabled={!!activePass || formLoading} aria-disabled={!!activePass || formLoading}>
            {formLoading ? 'Requesting...' : 'Request Pass'}
          </Button>
          {activePass && <div className="text-xs text-yellow-600 mt-1">You already have an active pass. Return it before creating a new one.</div>}
        </form>
      </section>

      {/* Pass History */}
      <section aria-labelledby="history-heading" className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
        <h2 id="history-heading" className="text-lg font-semibold">Pass History</h2>
        {passHistory.length === 0 ? (
          <div className="text-gray-500 text-sm">No pass history yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {passHistory.map(pass => (
              <li key={pass.id} className="py-2 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${getPassStatusColor(pass.status)}`} aria-label={pass.status}></span>
                <span className="font-medium text-sm">{pass.destinationLocationName}</span>
                <span className="ml-2 text-xs text-gray-500">{pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}</span>
                <span className="ml-2 text-xs text-gray-400">{pass.openedAt.toDate().toLocaleDateString()} {pass.openedAt.toDate().toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
} 