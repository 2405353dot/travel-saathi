"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);
    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setFullName(data.full_name || "");
    setRole(data.role || "user");
    setLoading(false);
  }

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
      })
      .eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated successfully!");
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <Navbar />
        <section style={containerStyle}>Loading profile...</section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <Navbar />

      <section style={containerStyle}>
        <h1 style={titleStyle}>My Profile</h1>

        <p style={mutedStyle}>
          Manage your Travel Saathi identity.
        </p>

        <form onSubmit={updateProfile} style={cardStyle}>
          <label style={labelStyle}>Full Name</label>

          <input
            style={inputStyle}
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />

          <label style={labelStyle}>Email</label>

          <input style={inputStyle} type="email" value={email} disabled />

          <label style={labelStyle}>Role</label>

          <input style={inputStyle} type="text" value={role} disabled />

          <button type="submit" style={buttonStyle}>
            Save Profile
          </button>
        </form>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#07111f",
  color: "white",
  paddingTop: "110px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "700px",
  margin: "0 auto",
  padding: "35px 24px 70px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "38px",
  fontWeight: "900",
};

const mutedStyle: React.CSSProperties = {
  color: "#94a3b8",
  marginTop: "8px",
};

const cardStyle: React.CSSProperties = {
  marginTop: "30px",
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
  marginTop: "16px",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontWeight: "700",
};

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "24px",
  padding: "14px",
  border: "none",
  borderRadius: "14px",
  background: "#22d3ee",
  color: "black",
  fontWeight: "900",
  cursor: "pointer",
};