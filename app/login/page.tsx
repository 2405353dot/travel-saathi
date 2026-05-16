"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful!");

    router.push("/dashboard"); 
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <ShieldCheck size={26} />
          </div>

          <h1 className={styles.title}>Welcome Back</h1>

          <p className={styles.subtitle}>
            Login to manage your rides, bookings and trusted travel network.
          </p>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label>Email Address</label>

              <div className={styles.inputBox}>
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Password</label>

              <div className={styles.inputBox}>
                <LockKeyhole size={18} />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.button}>
              Login
            </button>
          </form>

          <p className={styles.bottom}>
            New to Travel Saathi?{" "}
            <Link href="/signup">Create account</Link>
          </p>

          <p className={styles.secure}>SECURE ACCESS</p>
        </div>
      </section>
    </main>
  );
} 