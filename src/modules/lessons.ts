import type {
    Lesson,
    ScheduleConflict,
    ScheduledLesson
} from "../types/schedule.types";
import { professors, classrooms, courses, schedule, nextLessonId } from "../store/db";

// Перевірка конфліктів і базова валідація
export function validateLesson(lesson: Lesson): ScheduleConflict | null {
    const profClash: boolean = schedule.some(
        s => s.professorId === lesson.professorId && s.dayOfWeek === lesson.dayOfWeek && s.timeSlot === lesson.timeSlot
    );
    if (profClash) return { type: "ProfessorConflict", lessonDetails: lesson };

    const roomClash: boolean = schedule.some(
        s => s.classroomNumber === lesson.classroomNumber && s.dayOfWeek === lesson.dayOfWeek && s.timeSlot === lesson.timeSlot
    );
    if (roomClash) return { type: "ClassroomConflict", lessonDetails: lesson };

    const courseOk: boolean = courses.some(c => c.id === lesson.courseId);
    const profOk: boolean = professors.some(p => p.id === lesson.professorId);
    const roomOk: boolean = classrooms.some(c => c.number === lesson.classroomNumber);
    if (!courseOk || !profOk || !roomOk) {
        return { type: !profOk ? "ProfessorConflict" : "ClassroomConflict", lessonDetails: lesson };
    }
    return null;
}

export function addLesson(lesson: Lesson): boolean {
    const conflict: ScheduleConflict | null = validateLesson(lesson);
    if (conflict !== null) return false;
    const entry: ScheduledLesson = { ...lesson, id: nextLessonId() };
    schedule.push(entry);
    return true;
}

export function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
    const idx: number = schedule.findIndex(s => s.id === lessonId);
    if (idx === -1) return false;
    const exists: boolean = classrooms.some(c => c.number === newClassroomNumber);
    if (!exists) return false;

    const current: ScheduledLesson = schedule[idx];
    const draft: Lesson = {
        courseId: current.courseId,
        professorId: current.professorId,
        classroomNumber: newClassroomNumber,
        dayOfWeek: current.dayOfWeek,
        timeSlot: current.timeSlot
    };

    // тимчасово прибираємо, щоб не конфліктував сам із собою
    const saved: ScheduledLesson = schedule[idx];
    schedule.splice(idx, 1);
    const conflict: ScheduleConflict | null = validateLesson(draft);
    schedule.splice(idx, 0, saved);

    if (conflict !== null) return false;
    schedule[idx].classroomNumber = newClassroomNumber;
    return true;
}

export function cancelLesson(lessonId: number): void {
    const idx: number = schedule.findIndex(s => s.id === lessonId);
    if (idx !== -1) schedule.splice(idx, 1);
}
