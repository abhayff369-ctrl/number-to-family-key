
const API_KEYS = [
    "abhay-key-1",
    "abhay-key-2",
    "abhay-key-3",
    "demo",
    "7day demo"
];

export default async function handler(req, res) {

    res.setHeader("Content-Type", "application/json");

    // =========================
    // API KEY CHECK
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

        const number = req.query.number;

        if (!number) {

            return res.status(400).json({

                success: false,
                error: "Mobile number required",

                developer: {
                    name: "@darkdeveloper02",
                    telegram: "@darkdeveloper02",
                    buy: "@darkdeveloper02"
                }

            });

        }

        // =========================
        // MOBILE API
        // =========================

        const mobileApi = `https://exploitsindia.site/api/number.php?exploits=${number}`;

        const mobileResponse = await fetch(mobileApi);
        const mobileText = await mobileResponse.text();

        // =========================
        // EXTRACT FUNCTION
        // =========================

        const extract = (regex) => {
            const match = mobileText.match(regex);
            return match ? match[1].trim() : null;
        };

        const mainData = {
            mobile: number,
            name: extract(/👤 Name:\s*(.+)/i),
            father_name: extract(/👨‍👦 Father Name:\s*(.+)/i),
            address: extract(/🏠 Address:\s*(.+)/i),
            circle: extract(/📡 Circle:\s*(.+)/i)
        };

        // =========================
        // AADHAAR EXTRACTION
        // =========================

        const aadhaarRegex = /🪪 Aadhaar:\s*([0-9]{12})/gi;
        const aadhaarMatches = [...mobileText.matchAll(aadhaarRegex)];

        let aadhaars = [];

        aadhaarMatches.forEach(m => {
            aadhaars.push(m[1]);
        });

        aadhaars = [...new Set(aadhaars)];

        // =========================
        // RATION PARSER (CLEAN JSON)
        // =========================

        const parseRation = (text) => {

            const clean = text
                .replace(/💳 BUY API :.*$/gim, "")
                .replace(/🆘 SUPPORT :.*$/gim, "")
                .replace(/━━━━━━━━━━━━━━━━━━━━━━━━━━━/g, "")
                .trim();

            const lines = clean
                .split("\n")
                .map(l => l.trim())
                .filter(Boolean);

            return {

                title: lines[0] || null,

                ration_card: {
                    id: lines.find(l => l.includes("Ration Card/Aadhaar"))?.split(":")[1]?.trim() || null,
                    card_no: lines.find(l => l.includes("Card No"))?.split(":")[1]?.trim() || null,
                    scheme: lines.find(l => l.includes("Scheme"))?.split(":")[1]?.trim() || null
                },

                location: {
                    state: lines.find(l => l.includes("State"))?.split(":")[1]?.trim() || null,
                    district: lines.find(l => l.includes("District"))?.split(":")[1]?.trim() || null
                },

                info: {
                    central_repository: lines.find(l => l.includes("Central Repository"))?.split(":")[1]?.trim() || null,
                    duplicate_aadhaar: lines.find(l => l.includes("Duplicate Aadhaar"))?.split(":")[1]?.trim() || null,
                    fps_category: lines.find(l => l.includes("FPS Category"))?.split(":")[1]?.trim() || null,
                    impds: lines.find(l => l.includes("IMPDS"))?.split(":")[1]?.trim() || null
                },

                family_members: lines
                    .filter(l => l.includes("👤"))
                    .map(l => l.replace("👤", "").trim())

            };
        };

        // =========================
        // RATION LOOKUP LOOP
        // =========================

        let rationResults = [];

        for (const aadhaar of aadhaars) {

            try {

                const rationApi = `https://exploitsindia.site/api/family.php?exploits=${aadhaar}`;

                const rationResponse = await fetch(rationApi);
                const rationText = await rationResponse.text();

                rationResults.push({
                    aadhaar,
                    result: parseRation(rationText)
                });

            } catch (err) {

                rationResults.push({
                    aadhaar,
                    error: "Ration API Failed"
                });

            }
        }

        // =========================
        // FINAL RESPONSE
        // =========================

        return res.status(200).json({

            success: true,

            developer: {
                name: "@darkdeveloper02",
                telegram: "@darkdeveloper02",
                buy: "@darkdeveloper02"
            },

            used_key: userKey,

            mobile_lookup: mainData,

            aadhaar_found: aadhaars.length,

            aadhaars,

            ration_lookup: rationResults

        });

    } catch (err) {

        return res.status(500).json({

            success: false,
            error: err.message,

            developer: {
                name: "@darkdeveloper02",
                telegram: "@darkdeveloper02",
                buy: "@darkdeveloper02"
            }

        });

    }
}
