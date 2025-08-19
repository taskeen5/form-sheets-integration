const { google } = require('googleapis');

exports.handler = async (event, context) => {
    console.log('=== FUNCTION CALLED ===');
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        console.log('Received data:', body);

        // DECODE and CLEAN the base64 private key
        const privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY, 'base64')
          .toString('utf8')
          .trim()
          .replace(/\r/g, '');
        
        console.log('Private key cleaned successfully');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        console.log('Attempting to append to sheet:', spreadsheetId);
        
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'FormData!A:D',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[body.name, body.email, body.message, new Date().toISOString()]],
            },
        });

        console.log('✅ Data saved successfully!');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully!' }),
        };
    } catch (error) {
        console.error('❌ FULL ERROR:', error.message);
        console.error('Error stack:', error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};