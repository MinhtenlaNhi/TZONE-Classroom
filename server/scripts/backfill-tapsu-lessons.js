/**
 * Backfill lộ trình bài học Tập sự cho các khóa học ĐÃ TỒN TẠI nhưng chưa có bài học.
 *
 * Dùng khi khóa Tập sự được tạo trước khi tính năng tự động tạo lộ trình ra đời.
 *
 * Cách chạy (trong thư mục server/):
 *   node scripts/backfill-tapsu-lessons.js            -> chỉ seed khóa chưa có bài học
 *   node scripts/backfill-tapsu-lessons.js --dry-run  -> chỉ liệt kê, không ghi
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
const { seedCurriculumForCourse } = require("../src/utils/courseCurriculum");

async function run() {
  const isDryRun = process.argv.includes("--dry-run");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB.\n");

  const tapSu = await Category.findOne({ slug: "tap-su" }).select("_id name slug").lean();
  if (!tapSu) {
    console.error("❌ Không tìm thấy danh mục slug 'tap-su'.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const courses = await Course.find({ categoryRef: tapSu._id }).select("_id title categoryRef").lean();
  console.log(`📚 Tìm thấy ${courses.length} khóa thuộc danh mục Tập sự.\n`);

  let seededCount = 0;
  let skippedCount = 0;

  for (const course of courses) {
    const existing = await Lesson.countDocuments({ courseRef: course._id });
    if (existing > 0) {
      console.log(`   ⏭  Skip (đã có ${existing} bài học): ${course.title}`);
      skippedCount++;
      continue;
    }

    if (isDryRun) {
      console.log(`   🔍 [dry-run] Sẽ tạo lộ trình cho: ${course.title}`);
      seededCount++;
      continue;
    }

    const created = await seedCurriculumForCourse(course);
    if (created > 0) {
      console.log(`   ✅ Đã tạo ${created} bản ghi (chương + bài học): ${course.title}`);
      seededCount++;
    } else {
      console.log(`   ⚠️  Không tạo được lộ trình: ${course.title}`);
    }
  }

  console.log("\n════════════════════════════════════════════════");
  console.log("📊 KẾT QUẢ BACKFILL:");
  console.log(`   Khóa đã seed lộ trình : ${seededCount}`);
  console.log(`   Khóa bỏ qua           : ${skippedCount}`);
  console.log("════════════════════════════════════════════════");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
