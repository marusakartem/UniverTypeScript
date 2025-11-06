import type { CourseType } from "../types/schedule.types";
import { schedule, courses } from "../store/db";
import { DAYS, SLOTS } from "../utils/constants";

export function getClassroomUtilization(classroomNumber: string): number {
    const total: number = DAYS.length * SLOTS.length; // 25
    if (total === 0) return 0;
    const used: number = schedule.filter(s => s.classroomNumber === classroomNumber).length;
    return Math.round((used / total) * 10000) / 100; // %
}

export function getMostPopularCourseType(): CourseType {
    let lecture = 0, seminar = 0, lab = 0, practice = 0;

    for (let i = 0; i < schedule.length; i += 1) {
        const sl = schedule[i];
        const course = courses.find(c => c.id === sl.courseId);
        if (!course) continue;
        if (course.type === "Lecture") lecture += 1;
        else if (course.type === "Seminar") seminar += 1;
        else if (course.type === "Lab") lab += 1;
        else practice += 1;
    }

    let winner: CourseType = "Lecture";
    let best: number = lecture;
    if (seminar > best) { best = seminar; winner = "Seminar"; }
    if (lab > best)     { best = lab;     winner = "Lab"; }
    if (practice > best){ best = practice; winner = "Practice"; }
    return winner;
}
