const { google } = require("googleapis");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  };

  // ✅ Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // ✅ Load private key safely
    let rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    if (rawKey.includes("\\n")) rawKey = rawKey.replace(/\\n/g, "\n");
    rawKey = rawKey.replace(/\r/g, "");

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: rawKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // ✅ Handle POST → Append new row
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const { name, email, message } = body;

      console.log("📩 Incoming form data:", body);

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
    }

    // ✅ Handle DELETE → Clear rows (keep headers)
    if (event.httpMethod === "DELETE") {
      console.log("🗑️ Clearing form submissions...");

      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "FormData!A2:D", // 👈 clears everything except row 1 (headers)
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "All form submissions deleted!" }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
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
