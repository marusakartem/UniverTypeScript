"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassroomUtilization = getClassroomUtilization;
exports.getMostPopularCourseType = getMostPopularCourseType;
const db_1 = require("../store/db");
const constants_1 = require("../utils/constants");
function getClassroomUtilization(classroomNumber) {
    const total = constants_1.DAYS.length * constants_1.SLOTS.length; // 25
    if (total === 0)
        return 0;
    const used = db_1.schedule.filter(s => s.classroomNumber === classroomNumber).length;
    return Math.round((used / total) * 10000) / 100; // %
}
function getMostPopularCourseType() {
    let lecture = 0, seminar = 0, lab = 0, practice = 0;
    for (let i = 0; i < db_1.schedule.length; i += 1) {
        const sl = db_1.schedule[i];
        const course = db_1.courses.find(c => c.id === sl.courseId);
        if (!course)
            continue;
        if (course.type === "Lecture")
            lecture += 1;
        else if (course.type === "Seminar")
            seminar += 1;
        else if (course.type === "Lab")
            lab += 1;
        else
            practice += 1;
    }
    let winner = "Lecture";
    let best = lecture;
    if (seminar > best) {
        best = seminar;
        winner = "Seminar";
    }
    if (lab > best) {
        best = lab;
        winner = "Lab";
    }
    if (practice > best) {
        best = practice;
        winner = "Practice";
    }
    return winner;
}
