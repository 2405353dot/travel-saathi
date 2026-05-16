"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

import styles from "./createRide.module.css";

export default function CreateRidePage() {
  const router = useRouter();

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");

  async function handleCreateRide(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("rides")
      .insert([
        {
          user_id: user.id,
          from_location: fromLocation,
          to_location: toLocation,
          ride_date: rideDate,
          seats: Number(seats),
          price: price,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Ride published successfully!");

    router.push("/rides");
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            Create a Ride
          </h1>

          <p className={styles.subtitle}>
            Share your journey and help others
            travel safely.
          </p>

          <form
            className={styles.form}
            onSubmit={handleCreateRide}
          >
            <input
              className={styles.input}
              type="text"
              placeholder="From"
              value={fromLocation}
              onChange={(e) =>
                setFromLocation(e.target.value)
              }
              required
            />

            <input
              className={styles.input}
              type="text"
              placeholder="To"
              value={toLocation}
              onChange={(e) =>
                setToLocation(e.target.value)
              }
              required
            />

            <input
              className={styles.input}
              type="date"
              value={rideDate}
              onChange={(e) =>
                setRideDate(e.target.value)
              }
              required
            />

            <input
              className={styles.input}
              type="number"
              placeholder="Seats available"
              value={seats}
              onChange={(e) =>
                setSeats(e.target.value)
              }
              required
            />

            <input
              className={`${styles.input} ${styles.full}`}
              type="text"
              placeholder="Price per person"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              required
            />

            <button
              type="submit"
              className={styles.button}
            >
              Publish Ride
            </button>
          </form>
        </div>
      </section>
    </main>
  );
} 