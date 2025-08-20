const { google } = require('googleapis');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

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

    // ✅ Handle both formats (multi-line OR \n escaped)
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";

    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    privateKey = privateKey.replace(/\r/g, ""); // remove carriage returns

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log("✅ Appending to spreadsheet:", spreadsheetId);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "FormData!A:D",
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, email, message, new Date().toISOString()]],
      },
    });

    console.log("✅ Google API response:", response.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Data saved successfully!" }),
    };
  } catch (error) {
    console.error("❌ Full error object:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || "Unknown error",
        details: error.errors || error.stack || error,
      }),
    };
  }
};
