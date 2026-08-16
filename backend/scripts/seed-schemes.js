require("dotenv").config();
const mongoose = require("mongoose");
const { HealthScheme } = require("../models/phase3_4.models");

const SCHEMES = [
  {
    schemeName:    "Ayushman Bharat (PM-JAY)",
    schemeCode:    "PMJAY",
    description:   "Free health insurance up to ₹5 lakh per family per year for secondary and tertiary care hospitalisation.",
    eligibility:   "BPL families and SECC 2011 listed families.",
    benefits:      "₹5 lakh health cover, 1,393+ medical packages, cashless treatment at empanelled hospitals.",
    coverageAmount:500000,
    website:       "https://pmjay.gov.in",
    helplineNumber:"14555",
    categories:    ["BPL","SECC"],
    isActive:      true,
  },
  {
    schemeName:    "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    schemeCode:    "PMMVY",
    description:   "Cash incentive for pregnant and lactating mothers for first live birth.",
    eligibility:   "All pregnant women for first live birth, age 19+.",
    benefits:      "₹5,000 in 3 installments (₹1000 + ₹2000 + ₹2000).",
    coverageAmount:5000,
    website:       "https://wcd.nic.in",
    helplineNumber:"7998799804",
    categories:    ["pregnant","maternal"],
    isActive:      true,
  },
  {
    schemeName:    "Janani Suraksha Yojana (JSY)",
    schemeCode:    "JSY",
    description:   "Cash assistance for institutional delivery to reduce maternal and infant mortality.",
    eligibility:   "All pregnant women (focus on BPL in low-performing states).",
    benefits:      "Rural: ₹1,400 cash. Urban: ₹1,000 cash. Plus transport assistance.",
    coverageAmount:1400,
    website:       "https://nhm.gov.in",
    helplineNumber:"104",
    categories:    ["pregnant","BPL"],
    isActive:      true,
  },
  {
    schemeName:    "Rashtriya Bal Swasthya Karyakram (RBSK)",
    schemeCode:    "RBSK",
    description:   "Free health screening and early intervention for children 0-18 years.",
    eligibility:   "All children from birth to 18 years.",
    benefits:      "Free screening for 4 Ds: Defects at birth, Deficiencies, Diseases, Developmental Delays. Free treatment up to ₹1 lakh.",
    coverageAmount:100000,
    website:       "https://nhm.gov.in",
    helplineNumber:"104",
    categories:    ["children"],
    isActive:      true,
  },
  {
    schemeName:    "National Health Mission (NHM)",
    schemeCode:    "NHM",
    description:   "Comprehensive free healthcare at government facilities including medicines and diagnostics.",
    eligibility:   "All Indian citizens.",
    benefits:      "Free OPD, IPD, medicines from Jan Aushadhi, free diagnostics, free ambulance (108/102).",
    coverageAmount:0,
    website:       "https://nhm.gov.in",
    helplineNumber:"104",
    categories:    ["all"],
    isActive:      true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const scheme of SCHEMES) {
    await HealthScheme.findOneAndUpdate(
      { schemeCode: scheme.schemeCode },
      scheme,
      { upsert: true, new: true }
    );
    console.log(`✅ ${scheme.schemeCode} — ${scheme.schemeName}`);
  }

  console.log("\n🎉 Health schemes seeded!");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
