const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.json({
    message: "Travel Saathi Backend Running",
  });
});

app.get("/api/rides", async (req, res) => {
  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  res.json(data);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});