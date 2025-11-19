// ============================================
// SIMPLE GET-BASED VEHICLE REGISTRATION SCRIPT
// NO CORS ISSUES - Uses GET requests only
// ============================================

const SHEET_ID = "1msMnNnKMz-RkT_3Tf-jocpoA5Nf8tuJz8W8wn42avps";

function doGet(e) {
  try {
    const params = e.parameter || {};
    
    // Check if this is just a test ping
    if (Object.keys(params).length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "ok",
          message: "API is running",
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName("Vehicle Registration");
    
    if (!sheet) {
      throw new Error("Sheet 'Vehicle Registration' not found");
    }
    
    // Build row data (26 columns)
    const rowData = [
      new Date(),
      params.unit_number || "",
      params.resident_name || "",
      params.association_name || "",
      params.resident_type || "",
      
      params.vehicle1_make || "",
      params.vehicle1_model || "",
      params.vehicle1_year || "",
      params.vehicle1_color || "",
      params.vehicle1_license || "",
      params.vehicle1_insurance_link || "",
      params.vehicle1_registration_link || "",
      
      params.vehicle2_make || "",
      params.vehicle2_model || "",
      params.vehicle2_year || "",
      params.vehicle2_color || "",
      params.vehicle2_license || "",
      params.vehicle2_insurance_link || "",
      params.vehicle2_registration_link || "",
      
      params.vehicle3_make || "",
      params.vehicle3_model || "",
      params.vehicle3_year || "",
      params.vehicle3_color || "",
      params.vehicle3_license || "",
      params.vehicle3_insurance_link || "",
      params.vehicle3_registration_link || ""
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Registration saved successfully"
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

/*
DEPLOYMENT INSTRUCTIONS:
1. Replace ALL code with this
2. Save (Ctrl+S)
3. Deploy → New deployment
4. Type: Web app
5. Execute as: Me
6. Access: Anyone
7. Deploy
8. Copy the URL
9. Test by opening URL in browser - should see {"status":"ok"}
*/
