"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

type Ride = {
  id: string;
  from_location: string;
  to_location: string;
  ride_date: string;
  seats: number;
  price: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [usersCount, setUsersCount] = useState(0);
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  async function checkAdminAndLoadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile || profile.role !== "admin") {
      router.push("/");
      return;
    }

    setAuthorized(true);

    const { count: profileCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { data: allRides } = await supabase
      .from("rides")
      .select("*")
      .order("created_at", { ascending: false });

    const { count: bookingCount } = await supabase
      .from("ride_bookings")
      .select("*", { count: "exact", head: true });

    setUsersCount(profileCount || 0);
    setRides(allRides || []);
    setBookingsCount(bookingCount || 0);
    setLoading(false);
  }

  async function deleteAnyRide(id: string) {
    const confirmDelete = confirm("Delete this ride permanently?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("rides").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setRides((prev) => prev.filter((ride) => ride.id !== id));
  }

  if (loading) {
    return (
      <main style={loadingPageStyle}>
        Checking admin access...
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main style={pageStyle}>
      <Navbar />

      <section style={containerStyle}>
        <h1 style={titleStyle}>Admin Dashboard</h1>

        <p style={mutedStyle}>
          Manage users, rides and platform activity.
        </p>

        <div style={statsGridStyle}>
          <div style={cardStyle}>
            <h2 style={statStyle}>{usersCount}</h2>
            <p style={mutedStyle}>Total Users</p>
          </div>

          <div style={cardStyle}>
            <h2 style={statStyle}>{rides.length}</h2>
            <p style={mutedStyle}>Total Rides</p>
          </div>

          <div style={cardStyle}>
            <h2 style={statStyle}>{bookingsCount}</h2>
            <p style={mutedStyle}>Total Bookings</p>
          </div>
        </div>

        <h2 style={sectionTitleStyle}>Recent Rides</h2>

        <div style={gridStyle}>
          {rides.map((ride) => (
            <div key={ride.id} style={cardStyle}>
              <p style={dateStyle}>{ride.ride_date}</p>

              <h3 style={rideTitleStyle}>{ride.from_location}</h3>

              <p style={mutedStyle}>to {ride.to_location}</p>

              <div style={metaStyle}>
                <span>{ride.seats} seats</span>
                <span style={priceStyle}>₹{ride.price}</span>
              </div>

              <button
                onClick={() => deleteAnyRide(ride.id)}
                style={deleteBtnStyle}
              >
                Delete Ride
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const loadingPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#07111f",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#07111f",
  color: "white",
  paddingTop: "110px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1150px",
  margin: "0 auto",
  padding: "30px 24px 70px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "38px",
  fontWeight: "900",
};

const mutedStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#94a3b8",
  fontSize: "15px",
};

const statsGridStyle: React.CSSProperties = {
  marginTop: "28px",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  padding: "20px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const statStyle: React.CSSProperties = {
  fontSize: "28px",
  color: "#22d3ee",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: "36px",
  fontSize: "24px",
  fontWeight: "800",
};

const gridStyle: React.CSSProperties = {
  marginTop: "22px",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
};

const dateStyle: React.CSSProperties = {
  color: "#67e8f9",
  fontWeight: "700",
  fontSize: "14px",
};

const rideTitleStyle: React.CSSProperties = {
  marginTop: "12px",
  fontSize: "20px",
};

const metaStyle: React.CSSProperties = {
  marginTop: "16px",
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px",
};

const priceStyle: React.CSSProperties = {
  color: "#22d3ee",
  fontWeight: "800",
};

const deleteBtnStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "18px",
  padding: "11px",
  border: "none",
  borderRadius: "12px",
  background: "#ef4444",
  color: "white",
  fontWeight: "800",
  cursor: "pointer",
}; 