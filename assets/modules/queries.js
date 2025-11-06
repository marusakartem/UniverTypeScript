"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAvailableClassrooms = findAvailableClassrooms;
exports.getProfessorSchedule = getProfessorSchedule;
const db_1 = require("../store/db");
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    const busy = db_1.schedule
        .filter(s => s.timeSlot === timeSlot && s.dayOfWeek === dayOfWeek)
        .map(s => s.classroomNumber);
    return db_1.classrooms.filter(c => busy.indexOf(c.number) === -1).map(c => c.number);
}
function getProfessorSchedule(professorId) {
    return db_1.schedule
        .filter(s => s.professorId === professorId)
        .map(s => ({
        courseId: s.courseId,
        professorId: s.professorId,
        classroomNumber: s.classroomNumber,
        dayOfWeek: s.dayOfWeek,
        timeSlot: s.timeSlot
    }));
}
