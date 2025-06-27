import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { EscalationStats, EscalationBadge } from '../components/EscalationDisplay';
import { useAuth } from '../hooks/useAuth';
import { useEscalation } from '../hooks/useEscalation';
import { PassService, LocationService, RealtimeService } from '../lib/database-service';
import type { Pass, Location } from '../lib/database';

interface PassAction {
  passId: string;
  action: 'check-in' | 'return' | 'override';
  loading: boolean;
}

export default function TeacherHome() {
  const { profile, loading: authLoading } = useAuth();
  const { startMonitoring } = useEscalation();
  const [activePasses, setActivePasses] = useState<Pass[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [escalationAlerts, setEscalationAlerts] = useState<Pass[]>([]);
  const [passActions, setPassActions] = useState<PassAction[]>([]);
  const [showCreatePassForm, setShowCreatePassForm] = useState(false);
  const [createPassForm, setCreatePassForm] = useState({
    studentId: '',
    studentName: '',
    destination: '',
    notes: ''
  });
  const [flagStudentForm, setFlagStudentForm] = useState({
    studentId: '',
    studentName: '',
    notes: ''
  });
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile) return;

    const unsubscribeActive = RealtimeService.subscribeToAllActivePasses((passes) => {
      setActivePasses(passes);
      setDataLoading(false);
    });

    const unsubscribeAlerts = RealtimeService.subscribeToEscalationAlerts((passes) => {
      setEscalationAlerts(passes);
    });

    // Start escalation monitoring
    const cleanupMonitoring = startMonitoring();

    return () => {
      unsubscribeActive();
      unsubscribeAlerts();
      if (cleanupMonitoring) cleanupMonitoring();
    };
  }, [profile, startMonitoring]);

  // Load locations
  useEffect(() => {
    async function loadLocations() {
      try {
        const locs = await LocationService.getLocations(true);
        setLocations(locs);
      } catch (err: any) {
        setDataError(err.message || 'Failed to load locations.');
      }
    }
    loadLocations();
  }, []);

  // Filter passes by selected location
  const filteredPasses = selectedLocation === 'all' 
    ? activePasses 
    : activePasses.filter(pass => pass.currentLocationId === selectedLocation);

  // Get pass status color
  function getPassStatusColor(pass: Pass) {
    if (pass.escalationLevel === 'alert') return 'bg-red-500';
    if (pass.escalationLevel === 'warning') return 'bg-yellow-400';
    if (pass.status === 'active') return 'bg-green-500';
    return 'bg-gray-400';
  }

  // Get pass duration in minutes
  function getPassDuration(pass: Pass) {
    const now = new Date();
    const opened = pass.openedAt.toDate();
    return Math.round((now.getTime() - opened.getTime()) / 60000);
  }

  // Handle pass actions
  async function handlePassAction(passId: string, action: 'check-in' | 'return' | 'override') {
    if (!profile) return;

    setPassActions(prev => [...prev, { passId, action, loading: true }]);
    setFormError(null);

    try {
      const pass = activePasses.find(p => p.id === passId);
      if (!pass) throw new Error('Pass not found');

      switch (action) {
        case 'check-in':
          await PassService.checkIn(passId, pass.currentLocationId || pass.destinationLocationId, profile.uid, profile.displayName);
          break;
        case 'return':
          await PassService.returnPass(passId, profile.uid, profile.displayName);
          break;
        case 'override':
          // Close the pass
          await PassService.returnPass(passId, profile.uid, profile.displayName);
          break;
      }
    } catch (err: any) {
      setFormError(err.message || `Failed to ${action} pass.`);
    } finally {
      setPassActions(prev => prev.filter(p => !(p.passId === passId && p.action === action)));
    }
  }

  // Handle create pass form
  async function handleCreatePass(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (!profile) throw new Error('User profile not loaded.');
      
      const destination = locations.find(l => l.id === createPassForm.destination);
      if (!destination) throw new Error('Please select a valid destination.');

      // For now, use the first location as origin (should be replaced with real schedule logic)
      const origin = locations[0];
      if (!origin) throw new Error('No origin location available.');

      await PassService.createPassForStudent({
        studentId: createPassForm.studentId,
        studentName: createPassForm.studentName,
        originLocationId: origin.id,
        originLocationName: origin.name,
        destinationLocationId: destination.id,
        destinationLocationName: destination.name,
        issuedById: profile.uid,
        issuedByName: profile.displayName,
        isOverride: true,
        notes: createPassForm.notes || null
      }, profile.uid, profile.displayName);

      setCreatePassForm({ studentId: '', studentName: '', destination: '', notes: '' });
      setShowCreatePassForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create pass.');
    } finally {
      setFormLoading(false);
    }
  }

  // Handle flag student without pass
  async function handleFlagStudent(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (!profile) throw new Error('User profile not loaded.');
      
      const currentLocation = locations.find(l => l.id === selectedLocation);
      if (!currentLocation && selectedLocation !== 'all') {
        throw new Error('Please select a location first.');
      }

      const locationId = currentLocation?.id || locations[0]?.id;
      const locationName = currentLocation?.name || locations[0]?.name;
      
      if (!locationId || !locationName) {
        throw new Error('No location available.');
      }

      await PassService.flagStudentWithoutPass(
        flagStudentForm.studentId,
        flagStudentForm.studentName,
        locationId,
        locationName,
        profile.uid,
        profile.displayName,
        flagStudentForm.notes
      );

      setFlagStudentForm({ studentId: '', studentName: '', notes: '' });
      setShowFlagForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to flag student.');
    } finally {
      setFormLoading(false);
    }
  }

  // Check if pass action is loading
  function isPassActionLoading(passId: string, action: string) {
    return passActions.some(p => p.passId === passId && p.action === action && p.loading);
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-700">
        Loading teacher dashboard...
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor active passes and manage student movements
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">{activePasses.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Passes</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">{escalationAlerts.filter(p => p.escalationLevel === 'warning').length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Warnings</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">{escalationAlerts.filter(p => p.escalationLevel === 'alert').length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Alerts</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">{locations.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Locations</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Overview */}
        <div className="mb-6">
          <EscalationStats />
        </div>

        {/* Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Location
                </label>
                <select
                  id="location-filter"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setShowCreatePassForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Pass
              </Button>
              <Button
                onClick={() => setShowFlagForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Flag Student
              </Button>
            </div>
          </div>
        </div>

        {/* Active Passes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Passes ({filteredPasses.length})
            </h2>
          </div>
          
          {filteredPasses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No active passes found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPasses.map((pass) => (
                    <tr key={pass.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {pass.studentName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pass.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pass.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pass.destinationLocationName}</div>
                        <div className="text-sm text-gray-500">From: {pass.originLocationName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPassDuration(pass)} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full ${getPassStatusColor(pass)} mr-2`}></span>
                          <span className="text-sm text-gray-900 capitalize">
                            {pass.escalationLevel || pass.status}
                          </span>
                          <EscalationBadge pass={pass} className="ml-2" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handlePassAction(pass.id, 'check-in')}
                            disabled={isPassActionLoading(pass.id, 'check-in')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                          >
                            {isPassActionLoading(pass.id, 'check-in') ? '...' : 'Check-in'}
                          </Button>
                          <Button
                            onClick={() => handlePassAction(pass.id, 'return')}
                            disabled={isPassActionLoading(pass.id, 'return')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                          >
                            {isPassActionLoading(pass.id, 'return') ? '...' : 'Return'}
                          </Button>
                          <Button
                            onClick={() => handlePassAction(pass.id, 'override')}
                            disabled={isPassActionLoading(pass.id, 'override')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                          >
                            {isPassActionLoading(pass.id, 'override') ? '...' : 'Override'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Error Display */}
        {formError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{formError}</div>
          </div>
        )}

        {/* Create Pass Modal */}
        {showCreatePassForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Pass for Student</h3>
                <form onSubmit={handleCreatePass} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student ID</label>
                    <input
                      type="text"
                      value={createPassForm.studentId}
                      onChange={(e) => setCreatePassForm({...createPassForm, studentId: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input
                      type="text"
                      value={createPassForm.studentName}
                      onChange={(e) => setCreatePassForm({...createPassForm, studentName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                    <select
                      value={createPassForm.destination}
                      onChange={(e) => setCreatePassForm({...createPassForm, destination: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select destination</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={createPassForm.notes}
                      onChange={(e) => setCreatePassForm({...createPassForm, notes: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowCreatePassForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {formLoading ? 'Creating...' : 'Create Pass'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Flag Student Modal */}
        {showFlagForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Flag Student Without Pass</h3>
                <form onSubmit={handleFlagStudent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student ID</label>
                    <input
                      type="text"
                      value={flagStudentForm.studentId}
                      onChange={(e) => setFlagStudentForm({...flagStudentForm, studentId: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input
                      type="text"
                      value={flagStudentForm.studentName}
                      onChange={(e) => setFlagStudentForm({...flagStudentForm, studentName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={flagStudentForm.notes}
                      onChange={(e) => setFlagStudentForm({...flagStudentForm, notes: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Reason for flagging..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowFlagForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {formLoading ? 'Flagging...' : 'Flag Student'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 