"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "../../ui/TopNav";
import Button from "../../ui/Button";
import { supabase } from "../../lib/supabaseClient";
import { ensureUserProfile, getUserProfile } from "../../utils/profileUtils";
import {
  getUserWages,
  createWageDisplayString,
  deleteUserWage,
} from "../../utils/wageUtils";
import ProfileCompletionPrompt from "../dashboard/components/ProfileCompletionPrompt";

const sortWages = (items) =>
  [...(items || [])].sort((a, b) =>
    String(a?.position_title || "").localeCompare(String(b?.position_title || ""))
  );

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [wages, setWages] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      if (!supabase) {
        setError("Supabase client is not initialised in this environment.");
        setLoading(false);
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          window.location.href = "/login";
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const authenticatedUser = userData?.user;
        if (!authenticatedUser) {
          setError("No authenticated user found.");
          return;
        }
        if (!cancelled) setUser(authenticatedUser);

        const profileResult = await ensureUserProfile(authenticatedUser);
        if (cancelled) return;

        if (profileResult.success) {
          setProfile(profileResult.profile);
        } else {
          const fallback = await getUserProfile(authenticatedUser.id);
          if (!cancelled) {
            if (fallback.success) {
              setProfile(fallback.profile);
            } else {
              setError(fallback.error || profileResult.error || "Unable to load profile.");
            }
          }
        }

        const wagesResult = await getUserWages(authenticatedUser.id);
        if (!cancelled) {
          if (wagesResult.success) {
            setWages(sortWages(wagesResult.wages || []));
          } else {
            setError((prev) => prev || wagesResult.error || "Unable to load roles.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unexpected error fetching profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = useMemo(() => {
    if (!profile) return "";
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  }, [profile]);

  const initials = useMemo(() => {
    if (!fullName) return profile?.email?.slice(0, 2)?.toUpperCase() || "??";
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }, [fullName, profile?.email]);

  const handleWageCreated = (newWage) => {
    setWages((prev) => sortWages([...(prev || []), newWage]));
    setActionError("");
  };

  const handleDeleteWage = async (wageId) => {
    if (!user?.id || !wageId) return;
    const confirmed = window.confirm("Remove this role from your profile?");
    if (!confirmed) return;
    setDeletingId(wageId);
    setActionError("");
    try {
      const res = await deleteUserWage(user.id, wageId);
      if (!res.success) {
        setActionError(res.error || "Failed to remove role.");
      } else {
        setWages((prev) => (prev || []).filter((w) => w.id !== wageId));
      }
    } catch (err) {
      setActionError(err?.message || "Unexpected error removing role.");
    } finally {
      setDeletingId(null);
    }
  };

  const companyLine = useMemo(() => {
    if (!profile) return "";
    const parts = [profile.position, profile.company].filter(Boolean);
    return parts.join(" @ ");
  }, [profile]);

  const totalRoles = wages?.length || 0;

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 -z-10"
        style={{ overflow: "clip", contain: "paint" }}
      >
        <div className="absolute -top-36 -right-40 h-[28rem] w-[28rem] rounded-full bg-primary-200/25 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 h-[32rem] w-[32rem] rounded-full bg-secondary-200/30 blur-3xl" />
      </div>

      <TopNav />

      <main className="relative max-w-5xl mx-auto px-5 md:px-6 py-10 md:py-12 space-y-8 md:space-y-10">
        {loading ? (
          <div className="space-y-6">
            <div className="app-card p-6 md:p-8 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-neutral-200" />
                <div className="space-y-3 flex-1">
                  <div className="h-4 w-1/3 rounded bg-neutral-200" />
                  <div className="h-3 w-1/2 rounded bg-neutral-200" />
                  <div className="h-3 w-1/4 rounded bg-neutral-200" />
                </div>
              </div>
            </div>
            <div className="app-card p-6 md:p-8 animate-pulse space-y-4">
              <div className="h-4 w-32 bg-neutral-200 rounded" />
              <div className="h-24 rounded bg-neutral-100" />
            </div>
          </div>
        ) : error ? (
          <div className="app-card p-6 md:p-8">
            <div className="px-4 py-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
              {error}
            </div>
            <div className="mt-6">
              <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>Back to dashboard</Button>
            </div>
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl border border-border-light bg-white shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/60 via-secondary-100/40 to-transparent" />
              <div className="relative px-6 md:px-10 py-8 md:py-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-5">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary-500/20 text-primary-700 flex items-center justify-center text-xl md:text-2xl font-semibold">
                      {initials}
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{fullName || "My Profile"}</h1>
                      <div className="text-sm md:text-base text-slate-600">{profile?.email}</div>
                      {companyLine && <div className="text-sm md:text-base text-slate-700">{companyLine}</div>}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="rounded-2xl border border-border-light bg-white/60 backdrop-blur px-4 py-5">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Roles</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{totalRoles}</div>
                    <div className="text-xs text-slate-500">Active positions being tracked</div>
                  </div>
                  <div className="rounded-2xl border border-border-light bg-white/60 backdrop-blur px-4 py-5">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Company</div>
                    <div className="mt-2 text-base font-medium text-slate-900">{profile?.company || "Not provided"}</div>
                    <div className="text-xs text-slate-500">Employer on file</div>
                  </div>
                  <div className="rounded-2xl border border-border-light bg-white/60 backdrop-blur px-4 py-5">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Primary role</div>
                    <div className="mt-2 text-base font-medium text-slate-900">{profile?.position || (wages[0]?.position_title ?? "Not set")}</div>
                    <div className="text-xs text-slate-500">Default shift label</div>
                  </div>
                </div>
              </div>
            </section>

            {actionError && (
              <div className="app-card border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <section className="app-card overflow-hidden">
              <div className="section-header flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Roles & compensation</h2>
                  <p className="text-sm text-slate-600">Manage the positions you track across your shifts.</p>
                </div>
                <Button variant="primary" size="small" onClick={() => setShowRoleModal(true)}>
                  + Add role
                </Button>
              </div>

              <div className="p-5 md:p-6 space-y-4">
                {wages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border-light bg-surface px-6 py-10 text-center">
                    <p className="text-sm text-slate-600">No roles added yet.</p>
                    <Button variant="primary" size="small" className="mt-4" onClick={() => setShowRoleModal(true)}>
                      Create your first role
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wages.map((wage) => (
                      <div key={wage.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border-light bg-white px-4 py-4 shadow-sm">
                        <div>
                          <div className="text-base font-medium text-slate-900">{wage.position_title}</div>
                          <div className="text-sm text-slate-600">{createWageDisplayString(wage)}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="small"
                          disabled={deletingId === wage.id}
                          onClick={() => handleDeleteWage(wage.id)}
                        >
                          {deletingId === wage.id ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

           
          </>
        )}
      </main>

      <ProfileCompletionPrompt
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        userId={user?.id}
        onCreated={handleWageCreated}
      />
    </div>
  );
}
