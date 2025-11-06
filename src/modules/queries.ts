import type { Lesson, TimeSlot, DayOfWeek } from "../types/schedule.types";
import { classrooms, schedule } from "../store/db";

export function findAvailableClassrooms(timeSlot: TimeSlot, dayOfWeek: DayOfWeek): string[] {
    const busy: string[] = schedule
        .filter(s => s.timeSlot === timeSlot && s.dayOfWeek === dayOfWeek)
        .map(s => s.classroomNumber);

    return classrooms.filter(c => busy.indexOf(c.number) === -1).map(c => c.number);
}

export function getProfessorSchedule(professorId: number): Lesson[] {
    return schedule
        .filter(s => s.professorId === professorId)
        .map(s => ({
            courseId: s.courseId,
            professorId: s.professorId,
            classroomNumber: s.classroomNumber,
            dayOfWeek: s.dayOfWeek,
            timeSlot: s.timeSlot
        }));
}
