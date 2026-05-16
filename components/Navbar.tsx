"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import {
  MapPin,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Shield,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

import styles from "./Navbar.module.css";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      checkAdmin(user.id);
    }
  };

  async function checkAdmin(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data?.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;

        setUser(currentUser);

        if (currentUser) {
          checkAdmin(currentUser.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    window.location.href = "/";
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      {/* LEFT */}
      <Link
        href="/"
        className={styles.logoSection}
        onClick={closeMenu}
      >
        <div className={styles.logoIcon}>
          <MapPin size={20} />
        </div>

        <div>
          <h1 className={styles.logoTitle}>
            Travel Saathi
          </h1>

          <p className={styles.logoSubtitle}>
            Verified Ride Pooling
          </p>
        </div>
      </Link>

      {/* CENTER */}
      <div className={styles.centerLinks}>
        <Link href="/rides">
          Find Ride
        </Link>

        {user && (
          <Link href="/create-ride">
            Create Ride
          </Link>
        )}

        {isAdmin && (
          <Link href="/admin">
            Admin
          </Link>
        )}
      </div>

      {/* RIGHT */}
      <div className={styles.rightSection}>
        {!user ? (
          <>
            <Link
              href="/signup"
              className={styles.signupBtn}
            >
              Sign Up
            </Link>

            <Link
              href="/login"
              className={styles.loginBtn}
            >
              <ShieldCheck size={18} />
              Login
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard"
              className={styles.dashboardBtn}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/profile"
              className={styles.dashboardBtn}
            >
              <UserCircle size={18} />
              Profile
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={styles.dashboardBtn}
              >
                <Shield size={18} />
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        )}
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        className={styles.menuBtn}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </button>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link
            href="/rides"
            onClick={closeMenu}
          >
            Find Ride
          </Link>

          {user && (
            <Link
              href="/create-ride"
              onClick={closeMenu}
            >
              Create Ride
            </Link>
          )}

          {!user ? (
            <>
              <Link
                href="/signup"
                onClick={closeMenu}
              >
                Sign Up
              </Link>

              <Link
                href="/login"
                onClick={closeMenu}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </Link>

              <Link
                href="/profile"
                onClick={closeMenu}
              >
                Profile
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
} 