// Підключаємо все, чого потребує додаток
import "./data/seed"; // лише щоб збірник підняв залежності (дані вже імпортуються в store/db)

import { professors, classrooms, courses, schedule, addProfessor } from "./store/db";
import type { Lesson } from "./types/schedule.types";

import { addLesson, validateLesson, reassignClassroom, cancelLesson } from "./modules/lessons";
import { findAvailableClassrooms, getProfessorSchedule } from "./modules/queries";
import { getClassroomUtilization, getMostPopularCourseType } from "./modules/analytics";

// Експортуємо (зручно для console/тестів у браузері)
export {
  professors,
  classrooms,
  courses,
  schedule,
  addProfessor,
  addLesson,
  validateLesson,
  reassignClassroom,
  cancelLesson,
  findAvailableClassrooms,
  getProfessorSchedule,
  getClassroomUtilization,
  getMostPopularCourseType
};

// Невеликий демонстраційний сценарій (можна прибрати)
function demo(): void {
  const ok1: boolean = addLesson({
    courseId: 100, professorId: 1, classroomNumber: "A101", dayOfWeek: "Monday", timeSlot: "8:30-10:00"
  } as Lesson);

  const ok2: boolean = addLesson({
    courseId: 101, professorId: 2, classroomNumber: "B205", dayOfWeek: "Monday", timeSlot: "8:30-10:00"
  } as Lesson);

  const free: string[] = findAvailableClassrooms("8:30-10:00", "Monday");
  const prof1 = getProfessorSchedule(1);
  const util = getClassroomUtilization("A101");
  const popular = getMostPopularCourseType();

  console.log({ ok1, ok2, free, prof1, util, popular, schedule });
}
demo();
