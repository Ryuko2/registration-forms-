// ============================================
// UNIVERSAL REGISTRATION SCRIPT
// Handles: Vehicle, Boat, AND Pet registrations
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
          message: "Universal Registration API is running",
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet;
    let rowData;
    
    // ============================================
    // DETECT FORM TYPE & ROUTE TO CORRECT SHEET
    // ============================================
    
    // PET REGISTRATION
    if (params.registration_type) {
      if (params.registration_type === "Service Animal / ESA") {
        sheet = ss.getSheetByName("Service Animal Registration");
        if (!sheet) throw new Error("Sheet 'Service Animal Registration' not found");
        
        rowData = [
          new Date(),
          params.owner_name || "",
          params.unit_number || "",
          params.association_name || "",
          params.animal_name || "",
          params.breed || "",
          params.sex || "",
          params.color || "",
          params.weight || "",
          params.license_number || "",
          params.vet_name || "",
          params.vet_phone || "",
          params.specialized_training || "",
          params.signature_date || "",
          params.signature_link || "",
          params.vaccination_records_link || "",
          params.training_certificates_link || "",
          params.animal_photo_link || "",
          params.licensing_docs_link || "",
          params.accommodation_request_link || ""
        ];
      } else if (params.registration_type === "General Pet") {
        sheet = ss.getSheetByName("General Pet Registration");
        if (!sheet) throw new Error("Sheet 'General Pet Registration' not found");
        
        rowData = [
          new Date(),
          params.owner_name || "",
          params.unit_number || "",
          params.association_name || "",
          params.pet_type || "",
          params.pet_name || "",
          params.pet_age || "",
          params.pet_weight || "",
          params.license_number || "",
          params.breed || "",
          params.signature_date || "",
          params.signature_link || "",
          params.pet_photo_link || ""
        ];
      }
    }
    
    // BOAT REGISTRATION
    else if (params.watercraft_type || params.manufacturer || params.serial_number) {
      sheet = ss.getSheetByName("Boat Registration");
      if (!sheet) throw new Error("Sheet 'Boat Registration' not found");
      
      rowData = [
        new Date(),
        params.unit_number || "",
        params.property_owner || "",
        params.association_name || "",
        params.renter || "",
        params.watercraft_type || "",
        params.manufacturer || "",
        params.model || "",
        params.year || "",
        params.serial_number || "",
        params.craft_type || "",
        params.material || "",
        params.length || "",
        params.weight || "",
        params.color || "",
        params.engine_make || "",
        params.engine_hp || "",
        params.boat_insurance_link || "",
        params.boat_registration_link || ""
      ];
    }
    
    // VEHICLE REGISTRATION
    else if (params.resident_name || params.resident_type || params.vehicle1_make) {
      sheet = ss.getSheetByName("Vehicle Registration");
      if (!sheet) throw new Error("Sheet 'Vehicle Registration' not found");
      
      rowData = [
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
    }
    
    else {
      throw new Error("Unable to detect form type");
    }
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Return success with form type
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: `Registration saved successfully to ${sheet.getName()}`
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
Create ONE spreadsheet with FOUR tabs:

TAB 1: "Vehicle Registration" (26 columns)
Timestamp | Unit Number | Resident Name | Association Name | Resident Type | 
Vehicle 1 Make | Vehicle 1 Model | Vehicle 1 Year | Vehicle 1 Color | Vehicle 1 License | 
Vehicle 1 Insurance Link | Vehicle 1 Registration Link | 
Vehicle 2 Make | Vehicle 2 Model | Vehicle 2 Year | Vehicle 2 Color | Vehicle 2 License | 
Vehicle 2 Insurance Link | Vehicle 2 Registration Link | 
Vehicle 3 Make | Vehicle 3 Model | Vehicle 3 Year | Vehicle 3 Color | Vehicle 3 License | 
Vehicle 3 Insurance Link | Vehicle 3 Registration Link

TAB 2: "Boat Registration" (19 columns)
Timestamp | Unit Number | Property Owner | Association Name | Renter | 
Watercraft Type | Manufacturer | Model | Year | Serial Number | 
Craft Type | Material | Length | Weight | Color | Engine Make | Engine HP | 
Boat Insurance Link | Boat Registration Link

TAB 3: "Service Animal Registration" (20 columns)
Timestamp | Owner Name | Unit Number | Association Name | Animal Name | 
Breed | Sex | Color | Weight | License Number | Vet Name | Vet Phone | 
Specialized Training | Signature Date | Signature Link | 
Vaccination Records Link | Training Certificates Link | Animal Photo Link | 
Licensing Docs Link | Accommodation Request Link

TAB 4: "General Pet Registration" (13 columns)
Timestamp | Owner Name | Unit Number | Association Name | Pet Type | 
Pet Name | Pet Age | Pet Weight | License Number | Breed Description | 
Signature Date | Signature Link | Pet Photo Link
*/

// ============================================
// DEPLOYMENT INSTRUCTIONS
// ============================================
/*
1. Replace SHEET_ID above
2. Create the 4 tabs with headers
3. Save (Ctrl+S)
4. Deploy → New deployment
5. Type: Web app
6. Execute as: Me
7. Access: Anyone
8. Deploy
9. Copy ONE URL
10. Use this SAME URL in ALL THREE HTML forms!
11. Test by opening URL - should see {"status":"ok"}
*/
