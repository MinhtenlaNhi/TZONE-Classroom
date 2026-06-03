/** Bài học hiển thị cho học viên / giáo viên (ẩn placeholder chương). */
function isVisibleLesson(lesson) {
  if (lesson.isSectionPlaceholder) return false;
  if (
    lesson.title === "Bài học đầu tiên (Vui lòng cập nhật)" &&
    lesson.order === 1 &&
    (!lesson.materials || lesson.materials.length === 0) &&
    !lesson.meetUrl &&
    !lesson.isFreePreview
  ) {
    return false;
  }
  return true;
}

function buildCurriculum(lessons, assignments = []) {
  const curriculum = [];
  lessons.forEach((lesson) => {
    if (!isVisibleLesson(lesson)) return;

    lesson.assignments = assignments.filter(
      (a) => a.lessonRef.toString() === lesson._id.toString()
    );

    let section = curriculum.find((sec) => sec.sectionIndex === lesson.sectionIndex);
    if (!section) {
      section = {
        sectionIndex: lesson.sectionIndex,
        sectionTitle: lesson.sectionTitle,
        lessons: []
      };
      curriculum.push(section);
    }
    section.lessons.push(lesson);
  });

  // Chương chỉ có placeholder (chưa có bài học thật)
  lessons.forEach((lesson) => {
    if (!isVisibleLesson(lesson)) {
      const exists = curriculum.some((sec) => sec.sectionIndex === lesson.sectionIndex);
      if (!exists) {
        curriculum.push({
          sectionIndex: lesson.sectionIndex,
          sectionTitle: lesson.sectionTitle,
          lessons: []
        });
      }
    }
  });

  curriculum.sort((a, b) => a.sectionIndex - b.sectionIndex);
  return curriculum;
}

module.exports = { isVisibleLesson, buildCurriculum };
