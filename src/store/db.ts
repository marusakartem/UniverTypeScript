import type {
    Professor,
    Classroom,
    Course,
    ScheduledLesson
} from "../types/schedule.types";
import { seedProfessors, seedClassrooms, seedCourses } from "../data/seed";

export let professors: Professor[] = [...seedProfessors];
export let classrooms: Classroom[] = [...seedClassrooms];
export let courses: Course[] = [...seedCourses];
export let schedule: ScheduledLesson[] = [];

let _lessonId: number = 1;
export function nextLessonId(): number {
    const id: number = _lessonId;
    _lessonId += 1;
    return id;
}

// CRUD-хелпери (опційно)
export function addProfessor(p: Professor): void {
    const exists: boolean = professors.some(x => x.id === p.id);
    if (exists) throw new Error("Professor with this id already exists");
    professors.push(p);
}
