// api/lookup.js

// =========================
// MULTIPLE API KEYS
// =========================

const API_KEYS = [
    "abhay-key-1",
    "abhay-key-2",
    "abhay-key-3",
    "abhay-key-4",
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
        // MOBILE LOOKUP API
        // =========================

        const mobileApi =
            `https://exploitsindia.site/api/number.php?exploits=${number}`;

        const mobileResponse =
            await fetch(mobileApi);

        const mobileText =
            await mobileResponse.text();

        // =========================
        // EXTRACT FUNCTION
        // =========================

        const extract = (regex) => {

            const match =
                mobileText.match(regex);

            return match
                ? match[1].trim()
                : null;

        };

        // =========================
        // MAIN DATA
        // =========================

        const mainData = {

            mobile: number,

            name: extract(
                /👤 Name:\s*(.+)/i
            ),

            father_name: extract(
                /👨‍👦 Father Name:\s*(.+)/i
            ),

            address: extract(
                /🏠 Address:\s*(.+)/i
            ),

            circle: extract(
                /📡 Circle:\s*(.+)/i
            )

        };

        // =========================
        // AADHAAR EXTRACTION
        // =========================

        const aadhaarRegex =
            /🪪 Aadhaar:\s*([0-9]{12})/gi;

        const aadhaarMatches =
            [...mobileText.matchAll(aadhaarRegex)];

        let aadhaars = [];

        aadhaarMatches.forEach(match => {

            aadhaars.push(match[1]);

        });

        aadhaars = [...new Set(aadhaars)];

        // =========================
        // RATION LOOKUP
        // =========================

        let rationResults = [];

        for (const aadhaar of aadhaars) {

            try {

                const rationApi =
                    `https://exploitsindia.site/api/family.php?exploits=${aadhaar}`;

                const rationResponse =
                    await fetch(rationApi);

                const rationText =
                    await rationResponse.text();

                // =========================
                // CLEAN RESPONSE
                // =========================

                const cleanResult = rationText
                    .replace(/💳 BUY API :.*$/gim, "")
                    .replace(/🆘 SUPPORT :.*$/gim, "")
                    .replace(/━━━━━━━━━━━━━━━━━━━━━━━━━━━/g, "")
                    .replace(/[├└┌┐│─]/g, "")
                    .trim();

                // =========================
                // LINE FORMAT
                // =========================

                const lines = cleanResult
                    .split("\n")
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                rationResults.push({

                    aadhaar,

                    result: lines

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

            aadhaar_found:
                aadhaars.length,

            aadhaars,

            ration_lookup:
                rationResults

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
