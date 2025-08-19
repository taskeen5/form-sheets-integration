const { google } = require('googleapis');

exports.handler = async (event, context) => {
    console.log('=== FUNCTION CALLED ===');
    
    if (event.httpMethod !== 'POST') {
        console.log('Method not allowed:', event.httpMethod);
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        console.log('Received data:', body);

        // Check if environment variables exist
        console.log('Checking environment variables...');
        console.log('GOOGLE_SHEET_ID exists:', !!process.env.GOOGLE_SHEET_ID);
        console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL exists:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
        console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);

        if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SHEET_ID) {
            throw new Error('Missing environment variables');
        }

        console.log('Authenticating with Google Sheets...');
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
        
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'FormData!A:D',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[body.name, body.email, body.message, new Date().toISOString()]],
            },
        });

        console.log('Google Sheets API response:', response.status);
        console.log('✅ Data saved successfully!');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully!' }),
        };
    } catch (error) {
        console.error('❌ FULL ERROR:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error type:', error.constructor.name);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                type: error.constructor.name
            }),
        };
    }
};