import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// --- helpers ------------------------------------------------
async function getUserThumbnail(userId) {
  const url = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    return j?.data?.[0]?.imageUrl || null;
  } catch {
    return null;
  }
}

async function getUserGamePassesByCreator(userId) {
  // catalog search for GamePasses created by user
  let passes = [];
  let cursor = "";
  while (true) {
    const url = `https://catalog.roblox.com/v1/search/items/details?Category=GamePass&CreatorTargetId=${userId}&Limit=30${cursor ? "&Cursor="+cursor : ""}`;
    try {
      const r = await fetch(url);
      if (!r.ok) break;
      const j = await r.json();
      if (!j?.data || !j.data.length) break;
      for (const item of j.data) {
        passes.push({
          id: item.id,
          name: item.name,
          price: item.price ?? 0,
          image: item.thumbnails?.[0]?.imageUrl || null
        });
      }
      if (!j.nextPageCursor) break;
      cursor = j.nextPageCursor;
    } catch {
      break;
    }
  }
  return passes;
}

// optional: get username
async function getUsername(userId) {
  try {
    const r = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!r.ok) return null;
    const j = await r.json();
    return j?.name or j?.username or j?.displayName || j?.name || null;
  } catch {
    return null;
  }
}

// --- endpoints ----------------------------------------------
app.get("/", (req, res) => res.send("Roblox PLS-DONATE style API running"));

app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!/^\d+$/.test(userId)) return res.status(400).json({ error: "invalid userId" });
  try {
    const passes = await getUserGamePassesByCreator(userId);
    return res.json({ passes });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/players  { players: [123,456] }  -> returns players array with passes & thumbnail
app.post("/api/players", async (req, res) => {
  const players = req.body.players;
  if (!Array.isArray(players)) return res.status(400).json({ error: "players must be an array" });

  const results = [];
  for (const id of players) {
    if (!/^\d+$/.test(String(id))) continue;
    const thumbnail = await getUserThumbnail(id);
    const passes = await getUserGamePassesByCreator(id);
    // fetch basic username (optional)
    let name = null;
    try {
      const r = await fetch(`https://users.roblox.com/v1/users/${id}`);
      if (r.ok) { const j = await r.json(); name = j.name || j.username || null; }
    } catch {}
    results.push({ userId: Number(id), name, thumbnail, passes });
  }

  return res.json({ players: results });
});

// --- start --------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
