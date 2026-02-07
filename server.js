// server.js (backend) — project ROOT
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

const PAGE_SIZE = 5;

app.get("/api/concerts", async (req, res) => {
  try {
    const city = req.query.city || "Austin, TX";
    const page = Number.parseInt(req.query.page || "1", 10); // 1-based in UI
    const start = (Math.max(page, 1) - 1) * PAGE_SIZE;

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing SERPAPI_KEY in .env" });

    const params = new URLSearchParams({
      engine: "google_events",
      q: `concerts in ${city}`,
      location: city,
      hl: "en",
      gl: "us",
      start: String(start),
      api_key: apiKey,
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).send(text);
    }

    const data = await resp.json();
    const all = data.events_results || [];

    // SerpAPI returns ~10 per page; we slice to exactly 5 per page for your UI
    const events = all.slice(0, PAGE_SIZE);

    res.json({
      page,
      page_size: PAGE_SIZE,
      events,
      has_more: all.length > PAGE_SIZE, // if we got >5 back, there are more beyond this page
      pagination: data.serpapi_pagination || null,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
