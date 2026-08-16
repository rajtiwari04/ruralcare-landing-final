const { Feedback } = require("../models/phase5_6.models");

async function submitFeedback(patientId, feedbackType, referenceId, rating, comment, language, platform) {
  return Feedback.create({ patient:patientId, feedbackType, referenceId, rating, comment, language, platform });
}

async function getFeedbackStats(days=30) {
  const since = new Date(Date.now()-days*86400000);
  const byType = await Feedback.aggregate([{ $match:{createdAt:{$gte:since}} },{ $group:{_id:"$feedbackType",avgRating:{$avg:"$rating"},count:{$sum:1}} },{ $sort:{avgRating:-1} }]);
  const overall= await Feedback.aggregate([{ $match:{createdAt:{$gte:since}} },{ $group:{_id:null,avgRating:{$avg:"$rating"},total:{$sum:1}} }]);
  return { byType, overall:overall[0] };
}

module.exports = { submitFeedback, getFeedbackStats };
