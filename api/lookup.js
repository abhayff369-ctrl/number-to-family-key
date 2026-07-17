

const API_KEYS = [
    "abhay-key-1",
    "abhay-key-2",
    "abhay-key-3",
    "123456",
    "team6months"
];

export default async function handler(req, res) {

    res.setHeader("Content-Type", "application/json");

    // =========================
    // 1. API KEY CHECK
    // =========================

    const userKey =
        req.headers["x-api-key"] ||
        req.query.key;

    if (!userKey || !API_KEYS.includes(userKey)) {
        return res.status(401).json({
            success: false,
            error: "Invalid API Key",
            developer: {
                name: "@darkdeveloper02",
                telegram: "@darkdeveloper02",
                buy: "@darkdeveloper02"
            }
        });
    }

    try {

        // =========================
        // 2. GET MOBILE NUMBER
        // =========================

        const number = req.query.number || req.query.q;

        if (!number) {
            return res.status(400).json({
                success: false,
                error: "Mobile number required (use ?number= or ?q=)",
                developer: {
                    name: "@darkdeveloper02",
                    telegram: "@darkdeveloper02",
                    buy: "@darkdeveloper02"
                }
            });
        }

        // =========================
        // 3. CALL EXTERNAL API
        // =========================

        const externalApi = `https://cognitive-feelings-casting-brian.trycloudflare.com/search?q=${number}`;

        const response = await fetch(externalApi);
        const data = await response.json();

        // =========================
        // 4. CHECK API RESPONSE
        // =========================

        if (!data.status || !data.results || data.results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No results found for this number",
                developer: {
                    name: "@darkdeveloper02",
                    telegram: "@darkdeveloper02",
                    buy: "@darkdeveloper02"
                }
            });
        }

        // =========================
        // 5. CLEAN & FORMAT RESULTS
        // =========================

        const formattedResults = data.results.map(item => ({
            mobile: item.mobile || number,
            name: item.name || null,
            fname: item.fname || null,
            address: item.address ? item.address.replace(/!/g, ", ") : null,
            alt: item.alt || null,
            circle: item.circle || null,
            id: item.id || null,
            email: item.email || null
        }));

        // =========================
        // 6. REMOVE DUPLICATES (based on name + address)
        // =========================

        const uniqueResults = [];
        const seen = new Set();

        for (const item of formattedResults) {
            const key = `${item.name}|${item.address}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(item);
            }
        }

        // =========================
        // 7. FINAL RESPONSE
        // =========================

        return res.status(200).json({
            success: true,
            query: number,
            total_found: data.count || data.results.length,
            total_unique: uniqueResults.length,
            results: uniqueResults,
            developer: {
                name: "@darkdeveloper02",
                telegram: "@darkdeveloper02",
                buy: "@darkdeveloper02"
            },
            used_key: userKey
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message || "Internal Server Error",
            developer: {
                name: "@darkdeveloper02",
                telegram: "@darkdeveloper02",
                buy: "@darkdeveloper02"
            }
        });

    }
            }
