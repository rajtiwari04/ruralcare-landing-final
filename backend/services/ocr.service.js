const Tesseract = require("tesseract.js");
const fs   = require("fs");
const os   = require("os");
const path = require("path");
const axios= require("axios");

async function extractFromPDFBuffer(buffer) {
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    const text = (data.text||"").trim();
    console.log("pdf-parse:", text.length, "chars,", data.numpages, "pages");
    if (text.length > 0) console.log("Preview:", text.substring(0,100).replace(/\n/g," "));
    return { text, confidence: text.length > 50 ? 92 : 15 };
  } catch(err) {
    console.error("pdf-parse error:", err.message);
    return { text:"", confidence:0 };
  }
}

async function extractFromImageBuffer(buffer, mimeType) {
  const ext = (mimeType||"").includes("png") ? ".png" : (mimeType||"").includes("webp") ? ".webp" : ".jpg";
  const tmp = path.join(os.tmpdir(), "rcr_"+Date.now()+ext);
  fs.writeFileSync(tmp, buffer);
  try {
    const { data } = await Tesseract.recognize(tmp, "hin+eng", {
      logger: m => { if (m.status==="recognizing text") process.stdout.write(`\rOCR: ${Math.round(m.progress*100)}%`); }
    });
    process.stdout.write("\n");
    return { text: data.text.trim(), confidence: Math.round(data.confidence) };
  } finally {
    try { fs.unlinkSync(tmp); } catch(_) {}
  }
}

function cleanText(raw) {
  return raw.replace(/\r\n/g,"\n").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}

async function processReportBuffer(buffer, fileType, mimeType) {
  fileType = fileType||"image";
  mimeType = mimeType||"image/jpeg";
  console.log("Processing buffer:", buffer.length, "bytes as", fileType);
  let raw="", confidence=0;
  if (fileType === "pdf") {
    const r = await extractFromPDFBuffer(buffer);
    raw=r.text; confidence=r.confidence;
    if (!raw || raw.length < 20) throw new Error("PDF has no selectable text. Please photograph the report and upload as JPG.");
  } else {
    const r = await extractFromImageBuffer(buffer, mimeType);
    raw=r.text; confidence=r.confidence;
  }
  const extracted = cleanText(raw);
  console.log("Extracted:", extracted.length, "chars, confidence:", confidence+"%");
  if (!extracted || extracted.length < 3) throw new Error("No text found. Please upload a clear image with visible text.");
  return { extractedText: extracted, confidence };
}

async function processReport(fileUrl, fileType, mimeType) {
  const res = await axios.get(fileUrl, { responseType:"arraybuffer", timeout:60000 });
  return processReportBuffer(Buffer.from(res.data), fileType, mimeType);
}

module.exports = { processReportBuffer, processReport, extractFromPDFBuffer, extractFromImageBuffer, cleanText };
