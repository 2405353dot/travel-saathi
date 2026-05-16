"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import styles from "./rides.module.css";

type Ride = {
  id: string;
  from_location: string;
  to_location: string;
  ride_date: string;
  seats: number;
  price: string;
};

export default function RidesPage() {
  const router = useRouter();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");

  useEffect(() => {
    fetchRides();
  }, []);

  async function fetchRides() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setRides(data || []);
    setLoading(false);
  }

  const filteredRides = rides.filter((ride) => {
    const matchesFrom = ride.from_location
      .toLowerCase()
      .includes(fromSearch.toLowerCase());

    const matchesTo = ride.to_location
      .toLowerCase()
      .includes(toSearch.toLowerCase());

    const matchesDate = dateSearch ? ride.ride_date === dateSearch : true;

    return matchesFrom && matchesTo && matchesDate;
  });

  function clearFilters() {
    setFromSearch("");
    setToSearch("");
    setDateSearch("");
  }

  async function handleJoinRide(ride: Ride) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (ride.seats <= 0) {
      alert("No seats available.");
      return;
    }

    const { data: existingBooking } = await supabase
      .from("ride_bookings")
      .select("id")
      .eq("ride_id", ride.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingBooking) {
      alert("You already joined this ride.");
      return;
    }

    const { error: bookingError } = await supabase
      .from("ride_bookings")
      .insert([
        {
          ride_id: ride.id,
          user_id: user.id,
        },
      ]);

    if (bookingError) {
      alert(bookingError.message);
      return;
    }

    const { error: seatError } = await supabase
      .from("rides")
      .update({
        seats: ride.seats - 1,
      })
      .eq("id", ride.id);

    if (seatError) {
      alert(seatError.message);
      return;
    }

    alert("Ride joined successfully!");
    fetchRides();
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.container}>
        <h1 className={styles.title}>Available Rides</h1>

        <p className={styles.subtitle}>
          Find trusted and verified travel pools near you.
        </p>

        <div className={styles.filterBox}>
          <input
            className={styles.filterInput}
            type="text"
            placeholder="Search from location"
            value={fromSearch}
            onChange={(e) => setFromSearch(e.target.value)}
          />

          <input
            className={styles.filterInput}
            type="text"
            placeholder="Search to location"
            value={toSearch}
            onChange={(e) => setToSearch(e.target.value)}
          />

          <input
            className={styles.filterInput}
            type="date"
            value={dateSearch}
            onChange={(e) => setDateSearch(e.target.value)}
          />

          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        </div>

        {loading && <p className={styles.subtitle}>Loading rides...</p>}

        {!loading && filteredRides.length === 0 && (
          <p className={styles.subtitle}>No rides matched your search.</p>
        )}

        <div className={styles.grid}>
          {filteredRides.map((ride) => (
            <div className={styles.card} key={ride.id}>
              <p className={styles.date}>{ride.ride_date}</p>

              <h2 className={styles.place}>{ride.from_location}</h2>

              <p className={styles.to}>to {ride.to_location}</p>

              <div className={styles.meta}>
                <span>{ride.seats} seats left</span>
                <span className={styles.price}>₹{ride.price}</span>
              </div>

              <button
                className={styles.detailsBtn}
                onClick={() => router.push(`/rides/${ride.id}`)}
              >
                View Details
              </button>

              <button
                className={styles.button}
                onClick={() => handleJoinRide(ride)}
                disabled={ride.seats <= 0}
              >
                {ride.seats <= 0 ? "Full" : "Join Ride"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
} 