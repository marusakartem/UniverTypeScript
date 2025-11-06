"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.courses = exports.classrooms = exports.professors = void 0;
exports.nextLessonId = nextLessonId;
exports.addProfessor = addProfessor;
const seed_1 = require("../data/seed");
exports.professors = [...seed_1.seedProfessors];
exports.classrooms = [...seed_1.seedClassrooms];
exports.courses = [...seed_1.seedCourses];
exports.schedule = [];
let _lessonId = 1;
function nextLessonId() {
    const id = _lessonId;
    _lessonId += 1;
    return id;
}
// CRUD-хелпери (опційно)
function addProfessor(p) {
    const exists = exports.professors.some(x => x.id === p.id);
    if (exists)
        throw new Error("Professor with this id already exists");
    exports.professors.push(p);
}
