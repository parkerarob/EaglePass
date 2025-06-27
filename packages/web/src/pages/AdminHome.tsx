/**
 * EaglePass Admin Dashboard
 * System management for users, locations, settings, and audit logs
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserService, LocationService } from '../lib/database-service';
import type { User, Location } from '../lib/database';
import { Button } from '../components/Button';

export default function AdminHome() {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restrict access to admins only
  useEffect(() => {
    if (!authLoading && profile && profile.role !== 'admin') {
      setError('Access denied: Admins only');
    }
  }, [authLoading, profile]);

  // Load users and locations
  useEffect(() => {
    async function loadData() {
      try {
        setDataLoading(true);
        const [users, locations] = await Promise.all([
          UserService.getUsers(),
          LocationService.getLocations()
        ]);
        setUsers(users);
        setLocations(locations);
      } catch (err: any) {
        setError(err.message || 'Failed to load admin data.');
      } finally {
        setDataLoading(false);
      }
    }
    if (profile?.role === 'admin') loadData();
  }, [profile]);

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-700">
        Loading admin dashboard...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage users, locations, system settings, and view audit logs
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Management */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.uid}>
                      <td className="px-4 py-2">{user.displayName}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2 capitalize">{user.role}</td>
                      <td className="px-4 py-2 capitalize">{user.status}</td>
                      <td className="px-4 py-2">
                        {/* TODO: Approve/Block/Role actions */}
                        <Button className="bg-blue-600 text-white text-xs px-2 py-1 mr-2">Edit</Button>
                        <Button className="bg-red-600 text-white text-xs px-2 py-1">Block</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Location Management */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Location Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map(loc => (
                    <tr key={loc.id}>
                      <td className="px-4 py-2">{loc.name}</td>
                      <td className="px-4 py-2 capitalize">{loc.type}</td>
                      <td className="px-4 py-2">{loc.isActive ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2">
                        {/* TODO: Edit/Activate/Deactivate actions */}
                        <Button className="bg-blue-600 text-white text-xs px-2 py-1 mr-2">Edit</Button>
                        <Button className="bg-yellow-600 text-white text-xs px-2 py-1">{loc.isActive ? 'Deactivate' : 'Activate'}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Global Settings & Audit Logs */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Global Settings */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Global Settings</h2>
            {/* TODO: Pass freeze toggle, settings management */}
            <Button className="bg-gray-700 text-white">Toggle Pass Freeze (stub)</Button>
          </section>

          {/* Audit Logs */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
            {/* TODO: Display audit logs */}
            <div className="text-gray-500">Audit log viewer coming soon...</div>
          </section>
        </div>
      </div>
    </div>
  );
} 