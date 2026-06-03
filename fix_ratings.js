require("dotenv").config({ path: "./server/.env" });
const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Thiếu MONGODB_URI trong server/.env");
  process.exit(1);
}
mongoose.connect(uri).then(async () => {
  const Review = require('./server/src/models/Review');
  const Course = require('./server/src/models/Course');
  const courses = await Course.find();
  for (const c of courses) {
    const result = await Review.aggregate([
      { $match: { courseRef: c._id, isHidden: false } },
      { $group: { _id: '$courseRef', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (result.length > 0) {
      await Course.findByIdAndUpdate(c._id, { rating: Number(result[0].avgRating.toFixed(1)), reviewCount: result[0].count });
    } else {
      await Course.findByIdAndUpdate(c._id, { rating: 0, reviewCount: 0 });
    }
  }
  console.log('Recalculated all course ratings!');
  process.exit(0);
}).catch(console.error);
