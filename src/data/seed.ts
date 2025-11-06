import type { Professor, Classroom, Course } from "../types/schedule.types";

export const seedProfessors: Professor[] = [
    { id: 1, name: "Dr. Ivanenko", department: "CS" },
    { id: 2, name: "Dr. Shevchenko", department: "Math" }
];

export const seedClassrooms: Classroom[] = [
    { number: "A101", capacity: 60, hasProjector: true },
    { number: "B205", capacity: 40, hasProjector: false },
    { number: "C303", capacity: 120, hasProjector: true }
];

export const seedCourses: Course[] = [
    { id: 100, name: "Algorithms", type: "Lecture" },
    { id: 101, name: "Discrete Math", type: "Seminar" },
    { id: 102, name: "Databases", type: "Lab" }
];
