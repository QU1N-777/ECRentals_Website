"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getFirebaseClient } from "@/lib/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export default function SettingsMenu() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mounted, setMounted] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const { auth } = getFirebaseClient();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEmployee = currentUser?.email?.toLowerCase().endsWith("@ecrentals.co.za") || false;

  async function establishSession(idToken: string) {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  }

  async function syncUserToDb(user: User, extra?: { name?: string; company?: string; phone?: string }) {
    await fetch("/api/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: extra?.name || user.displayName || "",
        company: extra?.company || "",
        phone: extra?.phone || "",
      }),
    });
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { auth } = getFirebaseClient();
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await cred.user.getIdToken();
      await establishSession(token);
      await syncUserToDb(cred.user);
      setAuthModalOpen(false);
      setIsOpen(false);
      if (cred.user.email?.toLowerCase().endsWith("@ecrentals.co.za")) {
        window.location.href = "/admin";
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(
        /invalid-credential|user-not-found|wrong-password/i.test(err.message)
          ? "Invalid email or password combination."
          : err.message || "Failed to sign in"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { auth } = getFirebaseClient();
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const token = await cred.user.getIdToken();
      await establishSession(token);
      await syncUserToDb(cred.user, { name, company, phone });
      setAuthModalOpen(false);
      setIsOpen(false);
      if (cred.user.email?.toLowerCase().endsWith("@ecrentals.co.za")) {
        window.location.href = "/admin";
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      const { auth } = getFirebaseClient();
      await firebaseSignOut(auth);
      await fetch("/api/session", { method: "DELETE" });
      setIsOpen(false);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="settings-wrapper" ref={menuRef}>
      {/* Settings / Gear Icon Button in Navbar */}
      <button
        type="button"
        className={`settings-btn ${currentUser ? "is-auth" : ""}`}
        onClick={() => {
          if (currentUser) {
            setIsOpen(!isOpen);
          } else {
            setAuthModalOpen(true);
          }
        }}
        aria-label="Settings and user account"
        title={currentUser ? `Account: ${currentUser.email}` : "Sign In / Settings"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {currentUser && <span className={`status-dot ${isEmployee ? "is-employee" : ""}`} />}
      </button>

      {/* Account Dropdown when logged in */}
      {isOpen && currentUser && (
        <div className="account-dropdown">
          <div className="dropdown-header">
            <span className="user-email">{currentUser.email}</span>
            <span className={`role-badge ${isEmployee ? "role-badge--employee" : "role-badge--client"}`}>
              {isEmployee ? "EC Rentals Employee" : "Client Account"}
            </span>
          </div>

          <div className="dropdown-menu">
            {isEmployee && (
              <Link href="/admin" className="dropdown-link dropdown-link--highlight" onClick={() => setIsOpen(false)}>
                ⚡ Admin Console
              </Link>
            )}
            <Link href="/equipment" className="dropdown-link" onClick={() => setIsOpen(false)}>
              Browse Catalogue
            </Link>
            <Link href="/enquiry" className="dropdown-link" onClick={() => setIsOpen(false)}>
              View Enquiry Cart
            </Link>
          </div>

          <div className="dropdown-footer">
            <button type="button" className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal for Sign In / Sign Up rendered at document.body via Portal */}
      {authModalOpen &&
        mounted &&
        createPortal(
          <div className="auth-modal" role="dialog" aria-modal="true">
            <div className="auth-backdrop" onClick={() => setAuthModalOpen(false)} />
            <div className="auth-dialog">
              <header className="auth-head">
                <div>
                  <h2>EC Rentals Portal</h2>
                  <p>Employees (@ecrentals.co.za) & Client Access</p>
                </div>
                <button
                  type="button"
                  className="auth-close"
                  onClick={() => setAuthModalOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </header>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authMode === "signin" ? "active" : ""}`}
                  onClick={() => {
                    setAuthMode("signin");
                    setError(null);
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
                  onClick={() => {
                    setAuthMode("signup");
                    setError(null);
                  }}
                >
                  Register
                </button>
              </div>

              {authMode === "signin" ? (
                <form onSubmit={handleSignIn} className="auth-form">
                  <label className="auth-field">
                    <span>Email Address</span>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@ecrentals.co.za or your company email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Password</span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>

                  <p className="auth-tip">
                    💡 <b>Staff note:</b> Sign in with your <code>@ecrentals.co.za</code> email to unlock full management controls for equipment, photos, and quotes.
                  </p>

                  {error && <p className="auth-err">{error}</p>}

                  <div className="auth-actions">
                    <button type="submit" className="btn btn--primary" style={{ width: "100%" }} disabled={loading}>
                      {loading ? "Signing in…" : "Sign In to Portal"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="auth-form">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="auth-field">
                      <span>Full Name *</span>
                      <input
                        required
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                    <label className="auth-field">
                      <span>Company Name</span>
                      <input
                        placeholder="Business / Site Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="auth-field">
                      <span>Email Address *</span>
                      <input
                        type="email"
                        required
                        placeholder="name@company.co.za"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                    <label className="auth-field">
                      <span>Phone Number</span>
                      <input
                        placeholder="e.g. 082 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="auth-field">
                    <span>Create Password *</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>

                  {error && <p className="auth-err">{error}</p>}

                  <div className="auth-actions">
                    <button type="submit" className="btn btn--primary" style={{ width: "100%" }} disabled={loading}>
                      {loading ? "Creating account…" : "Register Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

