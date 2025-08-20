const { google } = require('googleapis');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, email, message } = body;

        console.log("📩 Incoming form data:", body);

        // ✅ Fix private key formatting (handles both \n and real line breaks)
        let privateKey = process.env.GOOGLE_PRIVATE_KEY;
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n'); // case: Netlify stores escaped newlines
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        console.log("✅ Appending to spreadsheet:", spreadsheetId);

        // Append to sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'FormData!A:D', // ⚠️ make sure your sheet tab is named "FormData"
            valueInputOption: 'RAW',
            requestBody: {
                values: [[name, email, message, new Date().toISOString()]],
            },
        });

        console.log("✅ Google API response:", response.data);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Data saved successfully!' }),
        };
    } catch (error) {
        console.error("❌ Full error object:", error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || "Unknown error",
                details: error.errors || error.stack || error
            }),
        };
    }
};
