import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Supabase Config
const SUPABASE_URL = "https://ldopgrtrzkyjnypduzhk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkb3BncnRyemt5am55cGR1emhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY2MzgsImV4cCI6MjA5NzA3MjYzOH0.qxTkrYnyZlTwYGreAd3p7r2b10o_E7tKZVlse7878UU";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 🏠 GET all properties
app.get("/properties", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("properties")
      .select("*");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// ➕ POST new property
app.post("/properties", async (req, res) => {
  try {
    const { title, price, location, type, description } = req.body;
    const { data, error } = await supabaseAdmin
      .from("properties")
      .insert([{ title, price, location, type, description }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create property" });
  }
});

// ✏️ PUT update property
app.put("/properties/:id", async (req, res) => {
  try {
    const { title, price, location, type, description } = req.body;
    const { data, error } = await supabaseAdmin
      .from("properties")
      .update({ title, price, location, type, description })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update property" });
  }
});

// 🗑️ DELETE property
app.delete("/properties/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from("properties")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

// 📬 GET all inquiries
app.get("/inquiries", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

// 📩 POST new inquiry
app.post("/inquiries", async (req, res) => {
  try {
    const { property_id, property_title, name, email, phone, message } = req.body;
    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .insert([{
        property_id,
        property_title,
        name,
        email,
        phone: phone || "",
        message,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create inquiry" });
  }
});

// ✅ DELETE inquiry (resolve)
app.delete("/inquiries/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from("inquiries")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

// 🔍 AI Recommendation (Improved)
app.get("/recommend", async (req, res) => {
  try {
    const { location, max_price } = req.query;

    let query = supabase.from("properties").select("*");

    if (location) {
      query = query.eq("location", location);
    }

    if (max_price) {
      query = query.lte("price", max_price);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 🧠 Simple AI logic (sorting by price low → high)
    const sortedData = data.sort((a, b) => a.price - b.price);

    res.json(sortedData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recommendation failed" });
  }
});

// 🧪 TEST API
app.get("/test", async (req, res) => {
  const { data, error } = await supabase.from("properties").select("*");

  if (error) {
    return res.json({ error });
  }

  res.json(data);
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});