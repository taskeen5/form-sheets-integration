const { google } = require('googleapis');

exports.handler = async (event, context) => {
    console.log('Function called!');
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        console.log('Data received:', body);
        
        // Log environment variables (mask private key for security)
        console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
        console.log('Service email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
        console.log('Private key exists:', !!process.env.GOOGLE_PRIVATE_KEY);

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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

        console.log('Success! Data saved to sheet.');
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully!' }),
        };
    } catch (error) {
        console.error('FULL ERROR:', error);
        console.error('Error stack:', error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};