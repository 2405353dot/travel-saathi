"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

type Ride = {
  id: string;
  from_location: string;
  to_location: string;
  ride_date: string;
  seats: number;
  price: string;
};

type Booking = {
  id: string;
  rides: Ride;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [joinedRides, setJoinedRides] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserAndRides();
  }, []);

  async function getUserAndRides() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserEmail(user.email || "");

    const { data: myRides, error: myRidesError } = await supabase
      .from("rides")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (myRidesError) {
      alert(myRidesError.message);
      setLoading(false);
      return;
    }

    const { data: myBookings, error: bookingsError } = await supabase
      .from("ride_bookings")
      .select("id, rides(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      alert(bookingsError.message);
      setLoading(false);
      return;
    }

    setRides(myRides || []);
    setJoinedRides((myBookings as unknown as Booking[]) || []);
    setLoading(false);
  }

  async function deleteRide(id: string) {
    const confirmDelete = confirm("Delete this ride?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("rides")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setRides((prev) =>
      prev.filter((ride) => ride.id !== id)
    );
  }

  async function cancelJoinedRide(
    bookingId: string,
    ride: Ride
  ) {
    const confirmCancel = confirm(
      "Cancel this joined ride?"
    );

    if (!confirmCancel) return;

    const { error: deleteBookingError } =
      await supabase
        .from("ride_bookings")
        .delete()
        .eq("id", bookingId);

    if (deleteBookingError) {
      alert(deleteBookingError.message);
      return;
    }

    const { error: seatError } = await supabase
      .from("rides")
      .update({
        seats: ride.seats + 1,
      })
      .eq("id", ride.id);

    if (seatError) {
      alert(seatError.message);
      return;
    }

    setJoinedRides((prev) =>
      prev.filter(
        (booking) => booking.id !== bookingId
      )
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#07111f",
        color: "white",
        paddingTop: "110px",
      }}
    >
      <Navbar />

      <section
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
          padding: "30px 24px 70px",
        }}
      >
        <h1
          style={{
            fontSize: "38px",
            fontWeight: "900",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#94a3b8",
            fontSize: "15px",
          }}
        >
          Logged in as:{" "}
          <span style={{ color: "#22d3ee" }}>
            {userEmail}
          </span>
        </p>

        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "18px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={statStyle}>
              {rides.length}
            </h2>

            <p style={mutedStyle}>
              My Created Rides
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={statStyle}>
              {joinedRides.length}
            </h2>

            <p style={mutedStyle}>
              My Joined Rides
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={statStyle}>
              ₹
              {rides.reduce(
                (total, ride) =>
                  total +
                  Number(ride.price || 0),
                0
              )}
            </h2>

            <p style={mutedStyle}>
              Total Ride Value
            </p>
          </div>
        </div>

        <h2 style={sectionHeadingStyle}>
          My Created Rides
        </h2>

        {loading && (
          <p style={mutedStyle}>
            Loading rides...
          </p>
        )}

        {!loading && rides.length === 0 && (
          <p style={mutedStyle}>
            You have not created any rides yet.
          </p>
        )}

        <div style={gridStyle}>
          {rides.map((ride) => (
            <div
              key={ride.id}
              style={cardStyle}
            >
              <RideCard ride={ride} />

              <button
                onClick={() =>
                  deleteRide(ride.id)
                }
                style={deleteBtnStyle}
              >
                Delete Ride
              </button>
            </div>
          ))}
        </div>

        <h2 style={sectionHeadingStyle}>
          My Joined Rides
        </h2>

        {!loading &&
          joinedRides.length === 0 && (
            <p style={mutedStyle}>
              You have not joined any rides
              yet.
            </p>
          )}

        <div style={gridStyle}>
          {joinedRides.map((booking) => (
            <div
              key={booking.id}
              style={cardStyle}
            >
              <RideCard
                ride={booking.rides}
              />

              <button
                onClick={() =>
                  cancelJoinedRide(
                    booking.id,
                    booking.rides
                  )
                }
                style={cancelBtnStyle}
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function RideCard({
  ride,
}: {
  ride: Ride;
}) {
  return (
    <>
      <p
        style={{
          color: "#67e8f9",
          fontWeight: "700",
          fontSize: "14px",
        }}
      >
        {ride.ride_date}
      </p>

      <h3
        style={{
          marginTop: "12px",
          fontSize: "20px",
        }}
      >
        {ride.from_location}
      </h3>

      <p style={mutedStyle}>
        to {ride.to_location}
      </p>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent:
            "space-between",
          fontSize: "14px",
        }}
      >
        <span>{ride.seats} seats</span>

        <span
          style={{
            color: "#22d3ee",
            fontWeight: "800",
          }}
        >
          ₹{ride.price}
        </span>
      </div>
    </>
  );
}

const cardStyle: React.CSSProperties = {
  padding: "20px",
  borderRadius: "20px",
  background:
    "rgba(255,255,255,0.055)",
  border:
    "1px solid rgba(255,255,255,0.1)",
};

const statStyle: React.CSSProperties = {
  fontSize: "28px",
  color: "#22d3ee",
};

const mutedStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "15px",
};

const gridStyle: React.CSSProperties = {
  marginTop: "22px",
  display: "grid",
  gridTemplateColumns:
    "repeat(3, 1fr)",
  gap: "20px",
};

const sectionHeadingStyle: React.CSSProperties = {
  marginTop: "36px",
  fontSize: "24px",
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

const cancelBtnStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "18px",
  padding: "11px",
  border: "none",
  borderRadius: "12px",
  background: "#f59e0b",
  color: "black",
  fontWeight: "800",
  cursor: "pointer",
}; 