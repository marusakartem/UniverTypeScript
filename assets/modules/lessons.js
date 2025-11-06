"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLesson = validateLesson;
exports.addLesson = addLesson;
exports.reassignClassroom = reassignClassroom;
exports.cancelLesson = cancelLesson;
const db_1 = require("../store/db");
// Перевірка конфліктів і базова валідація
function validateLesson(lesson) {
    const profClash = db_1.schedule.some(s => s.professorId === lesson.professorId && s.dayOfWeek === lesson.dayOfWeek && s.timeSlot === lesson.timeSlot);
    if (profClash)
        return { type: "ProfessorConflict", lessonDetails: lesson };
    const roomClash = db_1.schedule.some(s => s.classroomNumber === lesson.classroomNumber && s.dayOfWeek === lesson.dayOfWeek && s.timeSlot === lesson.timeSlot);
    if (roomClash)
        return { type: "ClassroomConflict", lessonDetails: lesson };
    const courseOk = db_1.courses.some(c => c.id === lesson.courseId);
    const profOk = db_1.professors.some(p => p.id === lesson.professorId);
    const roomOk = db_1.classrooms.some(c => c.number === lesson.classroomNumber);
    if (!courseOk || !profOk || !roomOk) {
        return { type: !profOk ? "ProfessorConflict" : "ClassroomConflict", lessonDetails: lesson };
    }
    return null;
}
function addLesson(lesson) {
    const conflict = validateLesson(lesson);
    if (conflict !== null)
        return false;
    const entry = Object.assign(Object.assign({}, lesson), { id: (0, db_1.nextLessonId)() });
    db_1.schedule.push(entry);
    return true;
}
function reassignClassroom(lessonId, newClassroomNumber) {
    const idx = db_1.schedule.findIndex(s => s.id === lessonId);
    if (idx === -1)
        return false;
    const exists = db_1.classrooms.some(c => c.number === newClassroomNumber);
    if (!exists)
        return false;
    const current = db_1.schedule[idx];
    const draft = {
        courseId: current.courseId,
        professorId: current.professorId,
        classroomNumber: newClassroomNumber,
        dayOfWeek: current.dayOfWeek,
        timeSlot: current.timeSlot
    };
    // тимчасово прибираємо, щоб не конфліктував сам із собою
    const saved = db_1.schedule[idx];
    db_1.schedule.splice(idx, 1);
    const conflict = validateLesson(draft);
    db_1.schedule.splice(idx, 0, saved);
    if (conflict !== null)
        return false;
    db_1.schedule[idx].classroomNumber = newClassroomNumber;
    return true;
}
function cancelLesson(lessonId) {
    const idx = db_1.schedule.findIndex(s => s.id === lessonId);
    if (idx !== -1)
        db_1.schedule.splice(idx, 1);
}
