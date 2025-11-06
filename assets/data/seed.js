"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCourses = exports.seedClassrooms = exports.seedProfessors = void 0;
exports.seedProfessors = [
    { id: 1, name: "Dr. Ivanenko", department: "CS" },
    { id: 2, name: "Dr. Shevchenko", department: "Math" }
];
exports.seedClassrooms = [
    { number: "A101", capacity: 60, hasProjector: true },
    { number: "B205", capacity: 40, hasProjector: false },
    { number: "C303", capacity: 120, hasProjector: true }
];
exports.seedCourses = [
    { id: 100, name: "Algorithms", type: "Lecture" },
    { id: 101, name: "Discrete Math", type: "Seminar" },
    { id: 102, name: "Databases", type: "Lab" }
];
