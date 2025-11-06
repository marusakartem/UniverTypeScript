"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMostPopularCourseType = exports.getClassroomUtilization = exports.getProfessorSchedule = exports.findAvailableClassrooms = exports.cancelLesson = exports.reassignClassroom = exports.validateLesson = exports.addLesson = exports.addProfessor = exports.schedule = exports.courses = exports.classrooms = exports.professors = void 0;
// Підключаємо все, чого потребує додаток
require("./data/seed"); // лише щоб збірник підняв залежності (дані вже імпортуються в store/db)
const db_1 = require("./store/db");
Object.defineProperty(exports, "professors", { enumerable: true, get: function () { return db_1.professors; } });
Object.defineProperty(exports, "classrooms", { enumerable: true, get: function () { return db_1.classrooms; } });
Object.defineProperty(exports, "courses", { enumerable: true, get: function () { return db_1.courses; } });
Object.defineProperty(exports, "schedule", { enumerable: true, get: function () { return db_1.schedule; } });
Object.defineProperty(exports, "addProfessor", { enumerable: true, get: function () { return db_1.addProfessor; } });
const lessons_1 = require("./modules/lessons");
Object.defineProperty(exports, "addLesson", { enumerable: true, get: function () { return lessons_1.addLesson; } });
Object.defineProperty(exports, "validateLesson", { enumerable: true, get: function () { return lessons_1.validateLesson; } });
Object.defineProperty(exports, "reassignClassroom", { enumerable: true, get: function () { return lessons_1.reassignClassroom; } });
Object.defineProperty(exports, "cancelLesson", { enumerable: true, get: function () { return lessons_1.cancelLesson; } });
const queries_1 = require("./modules/queries");
Object.defineProperty(exports, "findAvailableClassrooms", { enumerable: true, get: function () { return queries_1.findAvailableClassrooms; } });
Object.defineProperty(exports, "getProfessorSchedule", { enumerable: true, get: function () { return queries_1.getProfessorSchedule; } });
const analytics_1 = require("./modules/analytics");
Object.defineProperty(exports, "getClassroomUtilization", { enumerable: true, get: function () { return analytics_1.getClassroomUtilization; } });
Object.defineProperty(exports, "getMostPopularCourseType", { enumerable: true, get: function () { return analytics_1.getMostPopularCourseType; } });
// Невеликий демонстраційний сценарій (можна прибрати)
function demo() {
    const ok1 = (0, lessons_1.addLesson)({
        courseId: 100, professorId: 1, classroomNumber: "A101", dayOfWeek: "Monday", timeSlot: "8:30-10:00"
    });
    const ok2 = (0, lessons_1.addLesson)({
        courseId: 101, professorId: 2, classroomNumber: "B205", dayOfWeek: "Monday", timeSlot: "8:30-10:00"
    });
    const free = (0, queries_1.findAvailableClassrooms)("8:30-10:00", "Monday");
    const prof1 = (0, queries_1.getProfessorSchedule)(1);
    const util = (0, analytics_1.getClassroomUtilization)("A101");
    const popular = (0, analytics_1.getMostPopularCourseType)();
    console.log({ ok1, ok2, free, prof1, util, popular, schedule: db_1.schedule });
}
demo();
