import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Your Supabase details
const SUPABASE_URL = "https://ldopgrtrzkyjnypduzhk.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkb3BncnRyemt5am55cGR1emhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY2MzgsImV4cCI6MjA5NzA3MjYzOH0.qxTkrYnyZlTwYGreAd3p7r2b10o_E7tKZVlse7878UU"; // ⚠️ Use regenerated key

// 🏠 GET all properties
app.get("/properties", async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/properties`, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// 🔍 FILTER properties (basic recommendation logic)
app.get("/recommend", async (req, res) => {
  try {
    const { location, max_price } = req.query;

    let url = `${SUPABASE_URL}/rest/v1/properties?select=*`;

    if (location) {
      url += `&location=eq.${location}`;
    }

    if (max_price) {
      url += `&price=lte.${max_price}`;
    }

    const response = await fetch(url, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Recommendation failed" });
  }
});

// 🚀 Start server
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});