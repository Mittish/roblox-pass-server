import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

// Получение GamePass игрока как в PLS DONATE через Catalog API
async function getUserGamePasses(userId) {
    let cursor = "";
    let passes = [];

    while (true) {
        const url = `https://catalog.roblox.com/v1/search/items/details?Category=GamePass&CreatorTargetId=${userId}&Limit=30&Cursor=${cursor}`;

        const response = await fetch(url);
        if (!response.ok) break;

        const json = await response.json();
        if (!json?.data) break;

        json.data.forEach(p => {
            passes.push({
                id: p.id,
                name: p.name,
                price: p.price ?? 0
            });
        });

        if (!json.nextPageCursor) break;
        cursor = json.nextPageCursor;
    }

    return passes;
}

app.get("/api/passes/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!/^\d+$/.test(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const passes = await getUserGamePasses(userId);

        res.json({ passes });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
