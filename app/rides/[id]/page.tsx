"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

type Ride = {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  ride_date: string;
  seats: number;
  price: string;
};

type Message = {
  id: string;
  ride_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function RideDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;

  const [ride, setRide] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRide();
    fetchMessages();
    getCurrentUser();

    const channel = supabase
      .channel(`ride-chat-${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ride_messages",
          filter: `ride_id=eq.${rideId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId]);

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setCurrentUserId(user.id);
    }
  }

  async function fetchRide() {
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("id", rideId)
      .single();

    if (error) {
      alert(error.message);
      router.push("/rides");
      return;
    }

    setRide(data);
    setLoading(false);
  }

  async function fetchMessages() {
    const { data, error } = await supabase
      .from("ride_messages")
      .select("*, profiles(full_name, email)")
      .eq("ride_id", rideId)
      .order("created_at", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setMessages((data as unknown as Message[]) || []);
  }

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      router.push("/login");
      return;
    }

    const messageText = newMessage.trim();

    const { error } = await supabase.from("ride_messages").insert([
      {
        ride_id: rideId,
        user_id: user.id,
        message: messageText,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setNewMessage("");
    fetchMessages();
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <Navbar />
        <section style={containerStyle}>
          <p style={mutedStyle}>Loading ride details...</p>
        </section>
      </main>
    );
  }

  if (!ride) return null;

  return (
    <main style={pageStyle}>
      <Navbar />

      <section style={containerStyle}>
        <button onClick={() => router.push("/rides")} style={backBtnStyle}>
          ← Back to rides
        </button>

        <div style={cardStyle}>
          <p style={dateStyle}>{ride.ride_date}</p>

          <h1 style={titleStyle}>{ride.from_location}</h1>

          <p style={toStyle}>to {ride.to_location}</p>

          <div style={infoGridStyle}>
            <div style={miniCardStyle}>
              <p style={mutedStyle}>Seats Available</p>
              <h2 style={valueStyle}>{ride.seats}</h2>
            </div>

            <div style={miniCardStyle}>
              <p style={mutedStyle}>Price Per Person</p>
              <h2 style={valueStyle}>₹{ride.price}</h2>
            </div>

            <div style={miniCardStyle}>
              <p style={mutedStyle}>Ride Status</p>
              <h2 style={valueStyle}>
                {ride.seats > 0 ? "Available" : "Full"}
              </h2>
            </div>
          </div>
        </div>

        <div style={chatCardStyle}>
          <h2 style={chatTitleStyle}>Ride Chat</h2>

          <p style={mutedStyle}>
            Coordinate pickup, timing and travel updates.
          </p>

          <div style={messagesBoxStyle}>
            {messages.length === 0 && (
              <p style={mutedStyle}>No messages yet. Start the conversation.</p>
            )}

            {messages.map((msg) => {
              const isMine = msg.user_id === currentUserId;

              const senderName = isMine
                ? "You"
                : msg.profiles?.full_name ||
                  msg.profiles?.email ||
                  "User";

              return (
                <div
                  key={msg.id}
                  style={{
                    ...messageWrapperStyle,
                    alignItems: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <p
                    style={{
                      ...senderStyle,
                      textAlign: isMine ? "right" : "left",
                    }}
                  >
                    {senderName}
                  </p>

                  <div
                    style={{
                      ...messageBubbleStyle,
                      background: isMine
                        ? "#22d3ee"
                        : "rgba(255,255,255,0.08)",
                      color: isMine ? "black" : "white",
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={sendMessage} style={chatFormStyle}>
            <input
              style={chatInputStyle}
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button type="submit" style={sendBtnStyle}>
              Send
            </button>
          </form>
        </div>
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
  maxWidth: "950px",
  margin: "0 auto",
  padding: "30px 24px 70px",
};

const cardStyle: React.CSSProperties = {
  marginTop: "24px",
  padding: "34px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const backBtnStyle: React.CSSProperties = {
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  padding: "11px 16px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
};

const dateStyle: React.CSSProperties = {
  color: "#67e8f9",
  fontWeight: "800",
};

const titleStyle: React.CSSProperties = {
  marginTop: "16px",
  fontSize: "42px",
  fontWeight: "900",
};

const toStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#94a3b8",
  fontSize: "20px",
};

const infoGridStyle: React.CSSProperties = {
  marginTop: "32px",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
};

const miniCardStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const mutedStyle: React.CSSProperties = {
  color: "#94a3b8",
};

const valueStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#22d3ee",
  fontSize: "24px",
};

const chatCardStyle: React.CSSProperties = {
  marginTop: "28px",
  padding: "26px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const chatTitleStyle: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: "900",
};

const messagesBoxStyle: React.CSSProperties = {
  marginTop: "22px",
  minHeight: "240px",
  maxHeight: "340px",
  overflowY: "auto",
  padding: "16px",
  borderRadius: "20px",
  background: "rgba(0,0,0,0.22)",
};

const messageWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginTop: "12px",
};

const senderStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  marginBottom: "5px",
};

const messageBubbleStyle: React.CSSProperties = {
  maxWidth: "75%",
  padding: "12px 14px",
  borderRadius: "16px",
  fontSize: "15px",
  fontWeight: "600",
};

const chatFormStyle: React.CSSProperties = {
  marginTop: "18px",
  display: "grid",
  gridTemplateColumns: "1fr 110px",
  gap: "12px",
};

const chatInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  outline: "none",
};

const sendBtnStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "14px",
  background: "#22d3ee",
  color: "black",
  fontWeight: "900",
  cursor: "pointer",
}; 