/**
 * Prescription PDF Service
 * Uses pdf-lib to generate A4 prescription PDFs.
 * All text uses WinAnsi-compatible characters only.
 */

const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { uploadToCloudinary } = require("../middleware/index");

const BLACK  = rgb(0.1, 0.1, 0.1);
const BLUE   = rgb(0.05, 0.35, 0.75);
const GRAY   = rgb(0.45, 0.45, 0.45);
const RED    = rgb(0.75, 0.1, 0.1);
const WHITE  = rgb(1, 1, 1);
const LIGHT  = rgb(0.95, 0.97, 1.0);

async function generatePrescriptionPDF(prescription, doctor, patient) {
  const doc       = await PDFDocument.create();
  const page      = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold  = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontReg   = await doc.embedFont(StandardFonts.Helvetica);

  let y = height - 40;

  // ── Header band ────────────────────────────────────────────────────────────
  page.drawRectangle({ x:0, y:y-30, width, height:70, color:BLUE });
  page.drawText("RuralCare AI",      { x:30, y:y+16, size:20, font:fontBold, color:WHITE });
  page.drawText("Digital Prescription", { x:30, y:y,    size:9,  font:fontReg,  color:rgb(0.8,0.9,1.0) });
  const dateStr = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
  page.drawText(dateStr, { x:width-120, y:y+10, size:8, font:fontReg, color:WHITE });

  y -= 50;

  // ── Doctor info ─────────────────────────────────────────────────────────────
  const docName = /^dr[\.\s]/i.test(doctor.fullName) ? doctor.fullName : "Dr. " + doctor.fullName;
  page.drawText(docName,             { x:30, y, size:13, font:fontBold, color:BLACK });
  page.drawText(doctor.district||"", { x:width-160, y:y+4, size:8, font:fontReg, color:GRAY });
  y -= 16;
  page.drawText(`Phone: ${doctor.phone||""}`, { x:30, y, size:9, font:fontReg, color:GRAY });
  y -= 20;

  // Divider
  page.drawLine({ start:{x:30,y}, end:{x:width-30,y}, thickness:0.5, color:rgb(0.85,0.85,0.85) });
  y -= 20;

  // ── Patient info box ────────────────────────────────────────────────────────
  page.drawRectangle({ x:30, y:y-50, width:width-60, height:60, color:LIGHT, borderColor:rgb(0.8,0.85,0.95), borderWidth:0.5 });
  page.drawText("PATIENT",           { x:40, y:y-8,  size:7,  font:fontBold, color:GRAY });
  page.drawText(patient.fullName||"",{ x:40, y:y-22, size:12, font:fontBold, color:BLACK });
  page.drawText(`Age: ${patient.age||"--"} | Gender: ${patient.gender||"--"} | Phone: ${patient.phone||""}`, { x:40, y:y-36, size:8, font:fontReg, color:GRAY });
  y -= 70;

  // ── Diagnosis ───────────────────────────────────────────────────────────────
  if (prescription.diagnosis) {
    page.drawText("Diagnosis:", { x:30, y, size:9, font:fontBold, color:GRAY });
    y -= 14;
    page.drawText(prescription.diagnosis.substring(0,100), { x:30, y, size:11, font:fontBold, color:RED });
    y -= 24;
  }

  // ── Medicines ───────────────────────────────────────────────────────────────
  page.drawText("Rx  MEDICINES", { x:30, y, size:10, font:fontBold, color:BLUE });
  y -= 6;
  page.drawLine({ start:{x:30,y}, end:{x:width-30,y}, thickness:0.5, color:BLUE });
  y -= 14;

  for (let i=0; i<(prescription.medicines||[]).length; i++) {
    const med = prescription.medicines[i];
    if (y < 160) { y = height-50; } // Simple overflow guard

    page.drawRectangle({ x:30, y:y-38, width:width-60, height:46, color:i%2===0?rgb(0.98,0.99,1.0):WHITE, borderColor:rgb(0.9,0.9,0.95), borderWidth:0.3 });
    page.drawText(`${i+1}. ${(med.name||"").substring(0,60)}`, { x:38, y:y-8,  size:11, font:fontBold, color:BLACK });
    const details = [med.dosage, med.frequency, med.duration].filter(Boolean).join("  |  ");
    page.drawText(details.substring(0,80),    { x:38, y:y-22, size:9,  font:fontReg,  color:GRAY  });
    if (med.instructions) {
      page.drawText(med.instructions.substring(0,60), { x:38, y:y-34, size:8, font:fontReg, color:rgb(0.5,0.5,0.5) });
    }
    y -= 52;
  }

  y -= 10;

  // ── Additional notes ────────────────────────────────────────────────────────
  if (prescription.additionalNotes) {
    page.drawText("Notes:", { x:30, y, size:9, font:fontBold, color:GRAY });
    y -= 14;
    page.drawText(prescription.additionalNotes.substring(0,120), { x:30, y, size:9, font:fontReg, color:BLACK });
    y -= 20;
  }

  // Follow-up
  if (prescription.followUpDate) {
    const fu = new Date(prescription.followUpDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
    page.drawText(`Follow-up: ${fu}`, { x:30, y, size:9, font:fontBold, color:rgb(0.6,0.2,0.8) });
    y -= 20;
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  page.drawLine({ start:{x:30,y:80}, end:{x:width-30,y:80}, thickness:0.5, color:rgb(0.85,0.85,0.85) });
  page.drawText("[+] This prescription was generated digitally by RuralCare AI", { x:30, y:65, size:7, font:fontReg, color:GRAY });
  page.drawText("This is a digital prescription. Show this to your pharmacist.", { x:30, y:52, size:7, font:fontReg, color:GRAY });
  page.drawText(`Generated: ${new Date().toLocaleString("en-IN")}`, { x:30, y:40, size:7, font:fontReg, color:rgb(0.7,0.7,0.7) });

  // Signature area
  page.drawLine({ start:{x:width-160,y:90}, end:{x:width-30,y:90}, thickness:0.5, color:rgb(0.7,0.7,0.7) });
  page.drawText(docName, { x:width-160, y:75, size:8, font:fontBold, color:BLACK });
  page.drawText("Doctor Signature", { x:width-155, y:63, size:7, font:fontReg, color:GRAY });

  const pdfBytes = await doc.save();
  const buffer   = Buffer.from(pdfBytes);

  const result = await uploadToCloudinary(buffer, { folder:"ruralcare/prescriptions", resource_type:"image", format:"pdf" });
  return { pdfUrl: result.secure_url, pdfPublicId: result.public_id };
}

module.exports = { generatePrescriptionPDF };
