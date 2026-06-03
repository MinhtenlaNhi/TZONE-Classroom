require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to DB');
  const courses = await Course.find({});
  console.log('Total courses:', courses.length);
  console.log('Published courses:', courses.filter(c => c.isPublished).length);
  for (const c of courses) {
    console.log(`- ${c.title}: isPublished=${c.isPublished}, category=${c.categoryId}, id=${c.id}`);
  }
  process.exit(0);
}).catch(console.error);
