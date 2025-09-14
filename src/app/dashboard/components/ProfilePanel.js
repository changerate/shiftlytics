"use client";
import { useEffect, useState } from 'react';
import Button from '../../../ui/Button';
import { getUserProfile } from '../../../utils/profileUtils';
import { getUserWages, createWageDisplayString } from '../../../utils/wageUtils';
import ProfileCompletionPrompt from './ProfileCompletionPrompt';

export default function ProfilePanel({ isOpen, onClose, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [wages, setWages] = useState([]);
  const [showCreateWage, setShowCreateWage] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [p, w] = await Promise.all([
          getUserProfile(userId),
          getUserWages(userId),
        ]);
        if (cancelled) return;
        if (p.success) setProfile(p.profile); else setError(p.error || 'Failed to load profile');
        if (w.success) setWages(w.wages || []); else setError((prev) => prev || w.error || 'Failed to load wages');
      } catch (e) {
        if (!cancelled) setError('Unexpected error loading profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [isOpen, userId]);

  const handleCreatedWage = () => {
    (async () => {
      const res = await getUserWages(userId);
      if (res.success) setWages(res.wages || []);
    })();
  };

  if (!isOpen) return null;
  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : error ? (
            <div className="px-3 py-2 border border-red-300 rounded bg-red-50 text-red-600 text-sm">{error}</div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Identity</h4>
                <div className="mt-2 text-gray-900">
                  <div className="font-semibold">{fullName || 'Unnamed User'}</div>
                  <div className="text-gray-600 text-sm">{profile?.email}</div>
                  {(profile?.company || profile?.position) && (
                    <div className="text-gray-700 text-sm mt-1">{[profile?.position, profile?.company].filter(Boolean).join(' @ ')}</div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-500">Roles</h4>
                  <Button variant="primary" size="small" onClick={() => setShowCreateWage(true)}>Add Wage</Button>
                </div>
                <div className="mt-2 space-y-2">
                  {wages.length === 0 ? (
                    <div className="text-gray-600 text-sm">No wages yet.</div>
                  ) : (
                    wages.map((w) => (
                      <div key={w.id} className="px-3 py-2 border border-gray-200 rounded">
                        <div className="text-gray-900">{w.position_title}</div>
                        <div className="text-gray-600 text-sm">{createWageDisplayString(w)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button variant="noOutlineBlack" onClick={onClose}>Close</Button>
        </div>
      </div>
      <ProfileCompletionPrompt isOpen={showCreateWage} onClose={() => setShowCreateWage(false)} userId={userId} onCreated={() => { setShowCreateWage(false); handleCreatedWage(); }} />
    </div>
  );
}

