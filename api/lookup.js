const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {

    res.setHeader("Content-Type", "application/json");

    // =========================
    // API KEY CHECK
    // =========================

    const userKey =
        req.headers["x-api-key"] ||
        req.query.key;

    if (!userKey || userKey !== API_KEY) {

        return res.status(401).json({
            success: false,
            error: "Invalid API Key"
        });

    }

    try {

        const number = req.query.number;

        if (!number) {

            return res.status(400).json({
                success: false,
                error: "Mobile number required"
            });

        }

        // =========================
        // MOBILE LOOKUP API
        // =========================

        const mobileApi =
            `YOUR_MOBILE_API${number}`;

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
                    `YOUR_RATION_API${aadhaar}`;

                const rationResponse =
                    await fetch(rationApi);

                const rationText =
                    await rationResponse.text();

                rationResults.push({

                    aadhaar,
                    result: rationText

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
            error: err.message

        });

    }

}
