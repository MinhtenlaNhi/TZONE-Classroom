const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const paymentMethodsData = require("./data/paymentMethods");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const courseLinkRoutes = require("./routes/courseLinks");
const adminTeacherRoutes = require("./routes/adminTeachers");
const adminCourseRoutes = require("./routes/adminCourses");
const adminCategoryRoutes = require("./routes/adminCategories");
const coursesRoutes = require("./routes/courses");
const categoriesRoutes = require("./routes/categories");
const instructorsRoutes = require("./routes/instructors");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const enrollmentsRoutes = require("./routes/enrollments");
const assignmentsRoutes = require("./routes/assignments");
const reviewsRoutes = require("./routes/reviews").router;
const adminOrdersRoutes = require("./routes/adminOrders");
const adminReviewsRoutes = require("./routes/adminReviews");
const adminDashboardRoutes = require("./routes/adminDashboard");
const adminUsersRoutes = require("./routes/adminUsers");

const teacherCoursesRoutes = require("./routes/teacherCourses");
const teacherLessonsRoutes = require("./routes/teacherLessons");
const teacherSubmissionsRoutes = require("./routes/teacherSubmissions");

const { isDbReady, mongoReadyState, hasMongoUriConfigured } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ───── Serve uploaded files ───── */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

/* ───── Serve media files ───── */
const mediaDir = path.join(__dirname, "media");
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}
app.use("/media", express.static(mediaDir));

/* ───── Health check ───── */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    mongo: isDbReady() ? "connected" : "disconnected",
    mongoReadyState: mongoReadyState(),
    mongodbUriSet: hasMongoUriConfigured()
  });
});

app.get("/api/payment-methods", (req, res) => {
  res.json({ success: true, data: paymentMethodsData });
});

/* ───── API Routes ───── */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/course-links", courseLinkRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/instructors", instructorsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/reviews", reviewsRoutes);

// ----------------------------------------------------------------------
// GẮN TEACHER ROUTER
// ----------------------------------------------------------------------
app.use("/api/teacher/courses", teacherCoursesRoutes);
app.use("/api/teacher/lessons", teacherLessonsRoutes);
// Chú ý: trong teacherSubmissions.js, có route /:id/submissions dành cho assignment và /:id/grade cho submissions.
// Tuy nhiên để dễ quản lý, ta có thể gắn chung hoặc tách. Tôi sẽ mount cả 2 lên /api/teacher (hoặc bạn có thể tự chỉnh)
app.use("/api/teacher/assignments", teacherSubmissionsRoutes); // catch /api/teacher/assignments/:id/submissions
app.use("/api/teacher/submissions", teacherSubmissionsRoutes); // catch /api/teacher/submissions/:id/grade

// ----------------------------------------------------------------------
// GẮN ADMIN ROUTER
// ----------------------------------------------------------------------
app.use("/api/admin", adminTeacherRoutes);
app.use("/api/admin", adminCourseRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/reviews", adminReviewsRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/users", adminUsersRoutes);

/** Production: serve Vite build from repo root `client/dist` (single deploy: API + SPA same host). */
const clientDist = path.join(__dirname, "../../client/dist");
const hasClientDist = fs.existsSync(clientDist);

if (hasClientDist) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  console.warn(
    "[app] client/dist not found — UI will not load. Deploy must run `npm run build` (e.g. Render Build Command: npm install && npm run build)."
  );
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res
      .status(503)
      .type("text")
      .send(
        "Frontend build missing (no client/dist). Set your host Build Command to: npm install && npm run build — then redeploy."
      );
  });
}

module.exports = app;
