// ============================================
// BOAT REGISTRATION - GOOGLE APPS SCRIPT
// ============================================

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"; // ⬅️ REPLACE WITH YOUR SHEET ID

function doGet(e) {
  try {
    const params = e.parameter || {};
    
    // Check if this is just a test ping
    if (Object.keys(params).length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "ok",
          message: "Boat Registration API is running",
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName("Boat Registration");
    
    if (!sheet) {
      throw new Error("Sheet 'Boat Registration' not found");
    }
    
    // Build row data (19 columns)
    const rowData = [
      new Date(),                         // Timestamp
      params.unit_number || "",           // Unit Number
      params.property_owner || "",        // Property Owner
      params.association_name || "",      // Association Name
      params.renter || "",                // Renter
      params.watercraft_type || "",       // Watercraft Type
      params.manufacturer || "",          // Manufacturer
      params.model || "",                 // Model
      params.year || "",                  // Year
      params.serial_number || "",         // Serial Number
      params.craft_type || "",            // Craft Type
      params.material || "",              // Material
      params.length || "",                // Length
      params.weight || "",                // Weight
      params.color || "",                 // Color
      params.engine_make || "",           // Engine Make
      params.engine_hp || "",             // Engine HP
      params.boat_insurance_link || "",   // Boat Insurance Link (Dropbox)
      params.boat_registration_link || "" // Boat Registration Link (Dropbox)
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Boat registration saved successfully"
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// GOOGLE SHEET HEADERS (19 columns)
// ============================================
/*
Make sure Row 1 has these exact headers:

Timestamp | Unit Number | Property Owner | Association Name | Renter | 
Watercraft Type | Manufacturer | Model | Year | Serial Number | 
Craft Type | Material | Length | Weight | Color | Engine Make | Engine HP | 
Boat Insurance Link | Boat Registration Link

Total: 19 columns
*/

// ============================================
// DEPLOYMENT INSTRUCTIONS
// ============================================
/*
1. Replace SHEET_ID above with your Google Sheet ID
2. Save (Ctrl+S)
3. Deploy → New deployment
4. Type: Web app
5. Execute as: Me
6. Access: Anyone
7. Deploy
8. Copy the URL
9. Test by opening URL in browser - should see {"status":"ok"}
*/
