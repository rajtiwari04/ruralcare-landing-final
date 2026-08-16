const cron = require("node-cron");

// 8 AM — ANC & maternal health reminders
cron.schedule("0 8 * * *", async () => {
  try {
    const { MaternalHealth } = require("../models/phase3_4.models");
    const notifService = require("../services/notification.service");

    const records = await MaternalHealth.find({
      pregnancyWeek: { $gt: 0, $lt: 40 },
    }).populate("patient", "_id fullName preferredLanguage");

    for (const r of records) {
      if (!r.patient) continue;

      const week = r.pregnancyWeek;
      const ancVisitsNeeded = Math.floor(week / 8);
      const ancDone = r.ancVisits?.length || 0;

      if (ancDone < ancVisitsNeeded) {
        await notifService.createNotification(
          r.patient._id,
          "maternal",
          "👶 ANC Visit Due",
          `Week ${week}: You have ${
            ancVisitsNeeded - ancDone
          } ANC visit(s) pending. Please visit your nearest health centre.`
        );
      }
    }

    console.log("✅ Maternal reminders sent");
  } catch (e) {
    console.error("Maternal cron:", e.message);
  }
});

// 10 AM — Vaccination reminders
cron.schedule("0 10 * * *", async () => {
  try {
    const { MaternalHealth } = require("../models/phase3_4.models");
    const notifService = require("../services/notification.service");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const records = await MaternalHealth.find({
      "children.vaccines.dueDate": {
        $gte: today,
        $lte: tomorrow,
      },
      "children.vaccines.status": "due",
    }).populate("patient", "_id fullName");

    for (const r of records) {
      if (!r.patient) continue;

      const dueVaccines = [];

      (r.children || []).forEach((child) => {
        (child.vaccines || []).forEach((v) => {
          if (
            v.status === "due" &&
            v.dueDate &&
            new Date(v.dueDate) <= tomorrow
          ) {
            dueVaccines.push(`${v.name} for ${child.name}`);
          }
        });
      });

      if (dueVaccines.length > 0) {
        await notifService.createNotification(
          r.patient._id,
          "vaccination",
          "💉 Vaccination Due",
          `Due soon:
${dueVaccines.map((v) => `• ${v}`).join("\n")}

Visit nearest health centre.`
        );
      }
    }

    console.log("✅ Vaccination reminders sent");
  } catch (e) {
    console.error("Vaccination cron:", e.message);
  }
});

// 6 PM — Epidemic prediction
cron.schedule("0 18 * * *", async () => {
  try {
    const User = require("../models/User.model");
    const HealthRecord = require("../models/HealthRecord.model");
    const { EpidemicPrediction } = require("../models/phase3_4.models");
    const aiService = require("../services/ai.service");

    const districts = await User.distinct("district", {
      role: "patient",
      isActive: true,
    });

    const month = new Date().getMonth() + 1;

    const season =
      month >= 6 && month <= 9
        ? "monsoon"
        : month >= 11 || month <= 2
        ? "winter"
        : "summer";

    const seasonalDiseases = {
      monsoon: "dengue, malaria, typhoid, diarrhea",
      winter: "pneumonia, influenza, cold",
      summer: "heat stroke, dehydration, food poisoning",
    };

    const fourteenDays = new Date(
      Date.now() - 14 * 86400000
    );

    for (const district of districts.filter(Boolean)) {
      const patients = await User.find({
        district,
        role: "patient",
      }).select("_id");

      const ids = patients.map((p) => p._id);

      const records = await HealthRecord.find({
        patient: { $in: ids },
        createdAt: { $gte: fourteenDays },
      }).select("riskLevel extractedSymptoms createdAt");

      if (records.length < 2) continue;

      const symCount = {};

      records
        .flatMap((r) => r.extractedSymptoms || [])
        .forEach((s) => {
          symCount[s] = (symCount[s] || 0) + 1;
        });

      const topSymptoms = Object.entries(symCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const prompt = `District ${district}, ${season} season (${seasonalDiseases[season]}). 14-day symptom data: ${topSymptoms
        .map(([s, c]) => `${s}:${c}`)
        .join(",")}. Total records:${records.length}. 7-day outbreak risk? Return JSON: {"risk":"low|medium|high","probability":0-100,"likelyDisease":"","preventionTips":[]}`;

      let aiResult = {
        risk: "low",
        probability: 10,
      };

      try {
        const rawResponse = await aiService.generateChatResponse(
          prompt,
          "english",
          []
        );

        const cleanedResponse = String(rawResponse || "")
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        // Extract the JSON object even if the model adds extra text.
        const jsonStart = cleanedResponse.indexOf("{");
        const jsonEnd = cleanedResponse.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
          aiResult = JSON.parse(
            cleanedResponse.slice(jsonStart, jsonEnd + 1)
          );
        }
      } catch (error) {
        console.error(
          `AI epidemic prediction failed for ${district}:`,
          error.message
        );
      }

      await EpidemicPrediction.create({
        district,
        predictedDisease:
          aiResult.likelyDisease || "Seasonal illness",
        riskProbability: aiResult.probability || 10,
        forecastDays: 7,
        alertLevel: aiResult.risk || "low",
        seasonalFactor: season,
      });
    }

    console.log(
      `✅ Epidemic predictions generated for ${districts.length} districts`
    );
  } catch (e) {
    console.error("Epidemic cron:", e.message);
  }
});

// Sunday 11 PM — Village leaderboard scoring
cron.schedule("0 23 * * 0", async () => {
  try {
    const User = require("../models/User.model");
    const {
      VillageLeaderboard,
      MaternalHealth,
    } = require("../models/phase3_4.models");

    const {
      MedicationReminder,
      Appointment,
    } = require("../models/index");

    const HealthRecord = require("../models/HealthRecord.model");

    const thirtyDays = new Date(
      Date.now() - 30 * 86400000
    );

    const villages = await User.distinct("village", {
      role: "patient",
      isActive: true,
    });

    const now = new Date();

    const weekNumber = Math.ceil(
      (now - new Date(now.getFullYear(), 0, 1)) /
        604800000
    );

    for (const village of villages.filter(Boolean)) {
      const district =
        (
          await User.findOne({ village }).select(
            "district"
          )
        )?.district || "";

      const patients = await User.find({
        village,
        role: "patient",
      }).select("_id");

      const ids = patients.map((p) => p._id);

      if (ids.length === 0) continue;

      // Medication adherence (30%)
      const reminders = await MedicationReminder.find({
        patient: { $in: ids },
        isActive: true,
      });

      const totalDoses = reminders.reduce((sum, r) => {
        const taken =
          r.takenDates?.filter(
            (d) => new Date(d) >= thirtyDays
          ).length || 0;

        const missed =
          r.missedDates?.filter(
            (d) => new Date(d) >= thirtyDays
          ).length || 0;

        return sum + taken + missed;
      }, 0);

      const takenDoses = reminders.reduce((sum, r) => {
        const taken =
          r.takenDates?.filter(
            (d) => new Date(d) >= thirtyDays
          ).length || 0;

        return sum + taken;
      }, 0);

      const medAdherence =
        totalDoses > 0
          ? Math.round((takenDoses / totalDoses) * 100)
          : 50;

      // Follow-up rate (25%)
      const totalRecords =
        await HealthRecord.countDocuments({
          patient: { $in: ids },
          createdAt: { $gte: thirtyDays },
        });

      const followedUp =
        await HealthRecord.countDocuments({
          patient: { $in: ids },
          isFollowedUp: true,
          createdAt: { $gte: thirtyDays },
        });

      const followUpRate =
        totalRecords > 0
          ? Math.round((followedUp / totalRecords) * 100)
          : 50;

      // ANC compliance (20%)
      const pregnantCount =
        await MaternalHealth.countDocuments({
          patient: { $in: ids },
          pregnancyWeek: { $gt: 0, $lt: 40 },
        });

      const ancCompliance =
        pregnantCount > 0 ? 70 : 50;

      // Vaccination rate (15%)
      const vaccinationRate = 65; // Placeholder

      // Screening rate (10%)
      const screeningRate = 60; // Placeholder

      const total = Math.round(
        medAdherence * 0.3 +
          followUpRate * 0.25 +
          ancCompliance * 0.2 +
          vaccinationRate * 0.15 +
          screeningRate * 0.1
      );

      const grade =
        total >= 90
          ? "S"
          : total >= 75
          ? "A"
          : total >= 60
          ? "B"
          : total >= 45
          ? "C"
          : "D";

      await VillageLeaderboard.findOneAndUpdate(
        {
          village,
          district,
          weekNumber,
          year: now.getFullYear(),
        },
        {
          $set: {
            scores: {
              medicationAdherence: medAdherence,
              followUpRate,
              ancCompliance,
              vaccinationRate,
              screeningRate,
              total,
            },
            grade,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    // Update ranks within each district
    const districts = await User.distinct("district", {
      role: "patient",
    });

    for (const district of districts.filter(Boolean)) {
      const boards = await VillageLeaderboard.find({
        district,
        weekNumber,
        year: now.getFullYear(),
      }).sort({
        "scores.total": -1,
      });

      for (let i = 0; i < boards.length; i++) {
        await VillageLeaderboard.findByIdAndUpdate(
          boards[i]._id,
          {
            rank: i + 1,
          }
        );
      }
    }

    console.log(
      `✅ Leaderboard updated for ${villages.length} villages`
    );
  } catch (e) {
    console.error("Leaderboard cron:", e.message);
  }
});

// Monday 9 AM — Pending lab test reminders
cron.schedule("0 9 * * 1", async () => {
  try {
    const { LabTest } = require("../models/phase3_4.models");
    const notifService = require("../services/notification.service");

    const pending = await LabTest.find({
      status: "ordered",
      orderedAt: {
        $lte: new Date(Date.now() - 2 * 86400000),
      },
    }).populate("patient", "_id fullName");

    for (const t of pending) {
      if (!t.patient) continue;

      await notifService.createNotification(
        t.patient._id,
        "lab_test",
        "🧪 Lab Test Pending",
        `Your ${t.testName} test is still pending. Please collect the sample at your nearest lab.`
      );
    }

    console.log(
      `✅ Lab reminders sent: ${pending.length}`
    );
  } catch (e) {
    console.error("Lab reminder cron:", e.message);
  }
});

console.log("⏰ Phase 3 & 4 cron jobs scheduled");