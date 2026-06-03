/**
 * Cập nhật lộ trình bài học cho TẤT CẢ khóa học TOEIC Speaking & Writing
 * (slug danh mục: "toeic-sw"), áp dụng cho cả khóa cũ lẫn mới.
 *
 * Vì cơ chế seed tự động bỏ qua khóa đã có bài học, script này XÓA bài học cũ
 * (kể cả placeholder chương) + bài tập liên quan rồi tạo lại theo template mới
 * trong server/src/data/toeicSwCurriculum.js.
 *
 * ⚠️  Thao tác này ghi đè — bài học/bài tập cũ của các khóa TOEIC S+W sẽ bị thay thế.
 *
 * Cách chạy (trong thư mục server/):
 *   node scripts/reseed-toeic-sw.js --dry-run   -> chỉ liệt kê, không ghi
 *   node scripts/reseed-toeic-sw.js             -> thực hiện cập nhật
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI chưa được cấu hình trong server/.env");
  process.exit(1);
}

const Course = require("../src/models/Course");
const Category = require("../src/models/Category");
const Lesson = require("../src/models/Lesson");
const Assignment = require("../src/models/Assignment");
const { seedCurriculumForCourse } = require("../src/utils/courseCurriculum");

async function run() {
  const isDryRun = process.argv.includes("--dry-run");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB.\n");

  const cat = await Category.findOne({ slug: "toeic-sw" }).select("_id name slug").lean();
  if (!cat) {
    console.error("❌ Không tìm thấy danh mục slug 'toeic-sw'.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const courses = await Course.find({ categoryRef: cat._id }).select("_id title categoryRef").lean();
  console.log(`📚 Tìm thấy ${courses.length} khóa thuộc danh mục TOEIC S+W.\n`);

  let updated = 0;
  let totalLessons = 0;

  for (const course of courses) {
    const lessonCount = await Lesson.countDocuments({ courseRef: course._id });
    const assignmentCount = await Assignment.countDocuments({ courseRef: course._id });

    if (isDryRun) {
      console.log(
        `   🔍 [dry-run] ${course.title} — sẽ xóa ${lessonCount} bài học, ${assignmentCount} bài tập rồi tạo lại.`
      );
      updated++;
      continue;
    }

    // Xóa dữ liệu cũ để seed lại theo template mới.
    await Lesson.deleteMany({ courseRef: course._id });
    if (assignmentCount > 0) {
      await Assignment.deleteMany({ courseRef: course._id });
    }

    const created = await seedCurriculumForCourse(course);
    totalLessons += created;
    console.log(
      `   ✅ ${course.title} — đã xóa ${lessonCount} bài/${assignmentCount} bài tập, tạo lại ${created} bản ghi.`
    );
    updated++;
  }

  console.log("\n════════════════════════════════════════════════");
  console.log("📊 KẾT QUẢ CẬP NHẬT TOEIC S+W:");
  console.log(`   Số khóa xử lý        : ${updated}`);
  if (!isDryRun) console.log(`   Tổng bản ghi tạo mới : ${totalLessons}`);
  console.log("════════════════════════════════════════════════");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Reseed failed:", err);
  process.exit(1);
});
