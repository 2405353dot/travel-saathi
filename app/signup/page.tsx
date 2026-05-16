"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";

import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

import styles from "./signup.module.css";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: "user",
          },
        ]);

      if (profileError) {
        alert(profileError.message);
        setLoading(false);
        return;
      }
    }

    alert("Account created successfully! Please check your email.");

    setFullName("");
    setEmail("");
    setPassword("");

    setLoading(false);
  };

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <User size={30} />
          </div>

          <h1 className={styles.title}>Create Account</h1>

          <p className={styles.subtitle}>
            Join Travel Saathi and travel smarter.
          </p>

          <form
            className={styles.form}
            onSubmit={handleSignup}
          >
            <div className={styles.field}>
              <label>Full Name</label>

              <div className={styles.inputBox}>
                <User size={18} />

                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email Address</label>

              <div className={styles.inputBox}>
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Password</label>

              <div className={styles.inputBox}>
                <Lock size={18} />

                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <p className={styles.bottom}>
            Already have an account?{" "}
            <Link href="/login">
              Login
            </Link>
          </p>

          <p className={styles.secure}>
            VERIFIED SIGNUP
          </p>
        </div>
      </section>
    </main>
  );
} 