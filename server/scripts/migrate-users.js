/**
 * Migration script: chuyển dữ liệu từ EmailRegistration + GoogleAccount → User model thống nhất.
 *
 * Chạy: node server/scripts/migrate-users.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI chưa được cấu hình trong server/.env");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection.db;

  // Kiểm tra collections cũ tồn tại
  const collections = await db.listCollections().toArray();
  const collNames = collections.map((c) => c.name);

  const hasEmailReg = collNames.includes("emailregistrations");
  const hasGoogleAcc = collNames.includes("googleaccounts");
  const hasUsers = collNames.includes("users");

  if (!hasEmailReg && !hasGoogleAcc) {
    console.log("Không tìm thấy collections cũ (emailregistrations, googleaccounts). Không cần migrate.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Collections found: emailregistrations=${hasEmailReg}, googleaccounts=${hasGoogleAcc}, users=${hasUsers}`);

  const usersCollection = db.collection("users");
  let migratedCount = 0;
  let skippedCount = 0;

  // Migrate EmailRegistration → User
  if (hasEmailReg) {
    const emailRegs = await db.collection("emailregistrations").find({}).toArray();
    console.log(`Found ${emailRegs.length} emailregistrations to migrate.`);

    for (const reg of emailRegs) {
      const existing = await usersCollection.findOne({ email: reg.email });
      if (existing) {
        console.log(`  Skip (already exists): ${reg.email}`);
        skippedCount++;
        continue;
      }

      await usersCollection.insertOne({
        email: reg.email,
        name: reg.name || "",
        phone: "",
        avatar: "",
        passwordHash: reg.passwordHash,
        authProvider: "local",
        googlePicture: "",
        role: reg.role || "student",
        teacherApprovalStatus: reg.teacherApprovalStatus || undefined,
        teacherCode: reg.teacherCode || undefined,
        isBlocked: false,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: reg.createdAt || new Date(),
        updatedAt: reg.updatedAt || new Date()
      });
      console.log(`  Migrated (local): ${reg.email} [${reg.role}]`);
      migratedCount++;
    }
  }

  // Migrate GoogleAccount → User
  if (hasGoogleAcc) {
    const googleAccs = await db.collection("googleaccounts").find({}).toArray();
    console.log(`Found ${googleAccs.length} googleaccounts to migrate.`);

    for (const ga of googleAccs) {
      const existing = await usersCollection.findOne({ email: ga.email });
      if (existing) {
        console.log(`  Skip (already exists): ${ga.email}`);
        skippedCount++;
        continue;
      }

      await usersCollection.insertOne({
        email: ga.email,
        name: ga.name || "",
        phone: "",
        avatar: "",
        passwordHash: null,
        authProvider: "google",
        googlePicture: ga.picture || "",
        role: "student",
        isBlocked: false,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: ga.createdAt || new Date(),
        updatedAt: ga.updatedAt || new Date()
      });
      console.log(`  Migrated (google): ${ga.email}`);
      migratedCount++;
    }
  }

  console.log(`\nDone! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
  console.log("Old collections (emailregistrations, googleaccounts) have NOT been deleted — delete manually if no longer needed.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
