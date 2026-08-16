require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User.model");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const hash = async (pw) => bcrypt.hash(pw, 12);

  const users = [
    {
      fullName: "Dr. Priya Sharma",
      phone:    "9000000001",
      password: await hash("doctor123"),
      role:     "doctor",
      district: "Varanasi",
      tehsil:   "Sadar",
      village:  "Sigra",
      preferredLanguage: "hindi",
      isVerified: true, isActive: true,
    },
    {
      fullName: "Admin User",
      phone:    "9000000002",
      password: await hash("admin123"),
      role:     "admin",
      district: "Varanasi",
      isVerified: true, isActive: true,
    },
    {
      fullName: "Sunita Devi",
      phone:    "9000000003",
      password: await hash("worker123"),
      role:     "healthWorker",
      district: "Varanasi",
      tehsil:   "Sadar",
      village:  "Rampur",
      preferredLanguage: "hindi",
      isVerified: true, isActive: true,
    },
    {
      fullName: "Ramesh Yadav",
      phone:    "9000000004",
      password: await hash("patient123"),
      role:     "patient",
      age: 45, gender: "male",
      district: "Varanasi",
      tehsil:   "Sadar",
      village:  "Rampur",
      preferredLanguage: "hindi",
      isVerified: true, isActive: true,
    },
    {
      fullName: "Meera Devi",
      phone:    "9000000005",
      password: await hash("patient123"),
      role:     "patient",
      age: 28, gender: "female",
      district: "Varanasi",
      tehsil:   "Sadar",
      village:  "Rampur",
      preferredLanguage: "bhojpuri",
      isVerified: true, isActive: true,
    },
  ];

  for (const u of users) {
    await User.findOneAndUpdate({ phone: u.phone }, u, { upsert: true, new: true });
    console.log(`✅ ${u.role.padEnd(12)} ${u.fullName} (${u.phone})`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("────────────────────────────────────────────");
  console.log("Doctor:       9000000001 / doctor123  → /doctor");
  console.log("Admin:        9000000002 / admin123   → /admin");
  console.log("HealthWorker: 9000000003 / worker123  → /health-worker");
  console.log("Patient:      9000000004 / patient123 → /patient");
  console.log("Patient 2:    9000000005 / patient123 → /patient");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
