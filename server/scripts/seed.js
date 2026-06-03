require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI chưa được cấu hình trong server/.env");
  process.exit(1);
}

const User = require("../src/models/User");
const Category = require("../src/models/Category");

const DEFAULT_PASSWORD = "Tzone@2025";

const SEED_USERS = [
  {
    email: "pdquang050203@gmail.com",
    name: "Phạm Đình Quang",
    phone: "0964767902",
    role: "admin",
    authProvider: "local"
  },
];

const SEED_CATEGORIES = [
  { name: "Tập sự", slug: "tap-su", description: "Dành cho người mất gốc tiếng Anh", order: 1, isActive: true },
  { name: "TOEIC A", slug: "toeic-a", description: "Mục tiêu 450-600+", order: 2, isActive: true },
  { name: "TOEIC B", slug: "toeic-b", description: "Mục tiêu 650-800+", order: 3, isActive: true },
  { name: "TOEIC Speaking & Writing", slug: "toeic-sw", description: "Luyện kỹ năng Nói & Viết", order: 4, isActive: true }
];

async function run() {
  const isReset = process.argv.includes("--reset");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB.\n");

  if (isReset) {
    console.log("🔄 --reset flag: Xóa users và categories...");
    await User.deleteMany({});
    await Category.deleteMany({});
    console.log("   Đã xóa users và categories.\n");
  }

  console.log("📁 Seeding Categories...");
  for (const cat of SEED_CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      console.log(`   ⏭  Skip (đã tồn tại): ${cat.name}`);
      continue;
    }
    await Category.create(cat);
    console.log(`   ✅ Tạo: ${cat.name}`);
  }
  console.log("");

  console.log("👥 Seeding Users...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const u of SEED_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`   ⏭  Skip (đã tồn tại): ${u.email} [${u.role}]`);
      continue;
    }
    await User.create({
      ...u,
      passwordHash,
      isBlocked: false
    });
    console.log(`   ✅ Tạo: ${u.name} <${u.email}> [${u.role}]`);
  }

  const userCount = await User.countDocuments();
  const catCount = await Category.countDocuments();

  console.log("\n════════════════════════════════════════════════");
  console.log("📊 KẾT QUẢ SEED:");
  console.log(`   Users      : ${userCount}`);
  console.log(`   Categories : ${catCount}`);
  console.log("════════════════════════════════════════════════");
  console.log(`\n🔐 Mật khẩu chung cho tất cả tài khoản seed: ${DEFAULT_PASSWORD}`);
  console.log("   Tài khoản admin: pdquang050203@gmail.com");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
