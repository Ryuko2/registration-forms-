// ============================================
// PET REGISTRATION - GOOGLE APPS SCRIPT
// Handles both Service Animal and General Pet forms
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
          message: "Pet Registration API is running",
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Determine which sheet based on registration type
    const registrationType = params.registration_type || "";
    let sheet;
    
    if (registrationType === "Service Animal / ESA") {
      sheet = ss.getSheetByName("Service Animal Registration");
    } else {
      sheet = ss.getSheetByName("General Pet Registration");
    }
    
    if (!sheet) {
      throw new Error(`Sheet not found for type: ${registrationType}`);
    }
    
    // Build row data based on form type
    let rowData;
    
    if (registrationType === "Service Animal / ESA") {
      // Service Animal columns (20 columns)
      rowData = [
        new Date(),                               // Timestamp
        params.owner_name || "",                  // Owner Name
        params.unit_number || "",                 // Unit Number
        params.association_name || "",            // Association Name
        params.animal_name || "",                 // Animal Name
        params.breed || "",                       // Breed
        params.sex || "",                         // Sex
        params.color || "",                       // Color
        params.weight || "",                      // Weight
        params.license_number || "",              // License Number
        params.vet_name || "",                    // Vet Name
        params.vet_phone || "",                   // Vet Phone
        params.specialized_training || "",        // Specialized Training
        params.signature_date || "",              // Signature Date
        params.signature_link || "",              // Signature Image Link
        params.vaccination_records_link || "",    // Vaccination Records Link
        params.training_certificates_link || "",  // Training Certificates Link
        params.animal_photo_link || "",           // Animal Photo Link
        params.licensing_docs_link || "",         // Licensing Docs Link
        params.accommodation_request_link || ""   // Accommodation Request Link
      ];
    } else {
      // General Pet columns (14 columns)
      rowData = [
        new Date(),                           // Timestamp
        params.owner_name || "",              // Owner Name
        params.unit_number || "",             // Unit Number
        params.association_name || "",        // Association Name
        params.pet_type || "",                // Pet Type
        params.pet_name || "",                // Pet Name
        params.pet_age || "",                 // Pet Age
        params.pet_weight || "",              // Pet Weight
        params.license_number || "",          // License Number
        params.breed || "",                   // Breed Description
        params.signature_date || "",          // Signature Date
        params.signature_link || "",          // Signature Image Link
        params.pet_photo_link || ""           // Pet Photo Link
      ];
    }
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Pet registration saved successfully"
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
// GOOGLE SHEET SETUP
// ============================================
/*
Create TWO sheets (tabs) in your spreadsheet:

SHEET 1: "Service Animal Registration" (20 columns)
Headers:
Timestamp | Owner Name | Unit Number | Association Name | Animal Name | 
Breed | Sex | Color | Weight | License Number | Vet Name | Vet Phone | 
Specialized Training | Signature Date | Signature Link | 
Vaccination Records Link | Training Certificates Link | Animal Photo Link | 
Licensing Docs Link | Accommodation Request Link

SHEET 2: "General Pet Registration" (13 columns)
Headers:
Timestamp | Owner Name | Unit Number | Association Name | Pet Type | 
Pet Name | Pet Age | Pet Weight | License Number | Breed Description | 
Signature Date | Signature Link | Pet Photo Link

Note: Both sheets will be in the SAME spreadsheet, just different tabs.
*/

// ============================================
// DEPLOYMENT INSTRUCTIONS
// ============================================
/*
1. Replace SHEET_ID above with your Google Sheet ID
2. Create two tabs in your sheet:
   - "Service Animal Registration"
   - "General Pet Registration"
3. Add the headers shown above to each tab
4. Save (Ctrl+S)
5. Deploy → New deployment
6. Type: Web app
7. Execute as: Me
8. Access: Anyone
9. Deploy
10. Copy the URL
11. Test by opening URL in browser - should see {"status":"ok"}
*/
