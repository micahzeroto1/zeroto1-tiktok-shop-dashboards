import { google, sheets_v4 } from 'googleapis';

let sheetsClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export async function fetchSheetRanges(
  spreadsheetId: string,
  ranges: string[]
): Promise<string[][][]> {
  const client = getSheetsClient();
  const response = await client.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
  });

  return (response.data.valueRanges || []).map(
    (vr) => (vr.values || []) as string[][]
  );
}

/**
 * Fetch ranges for a single client (raw + rollup tabs).
 * Returns null if the tabs are missing/renamed instead of throwing.
 */
export async function fetchClientRangesSafe(
  spreadsheetId: string,
  rawTabName: string,
  rollupTabName: string
): Promise<{ rawRows: string[][]; rollupRows: string[][] } | null> {
  try {
    const [rawRows, rollupRows] = await fetchSheetRanges(spreadsheetId, [
      `'${rawTabName}'!A1:AZ1000`,
      `'${rollupTabName}'!A1:AZ1000`,
    ]);
    return { rawRows, rollupRows };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`Skipping client tabs '${rawTabName}'/'${rollupTabName}': ${msg}`);
    return null;
  }
}
