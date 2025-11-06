"use strict";
/** ========================== БАЗОВІ ТИПИ ========================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.courses = exports.classrooms = exports.professors = void 0;
exports.addProfessor = addProfessor;
exports.addLesson = addLesson;
exports.findAvailableClassrooms = findAvailableClassrooms;
exports.getProfessorSchedule = getProfessorSchedule;
exports.validateLesson = validateLesson;
exports.getClassroomUtilization = getClassroomUtilization;
exports.getMostPopularCourseType = getMostPopularCourseType;
exports.reassignClassroom = reassignClassroom;
exports.cancelLesson = cancelLesson;
/** ========================== ДАНІ (масиви) ========================== */
exports.professors = [
    { id: 1, name: "Dr. Ivanenko", department: "CS" },
    { id: 2, name: "Dr. Shevchenko", department: "Math" }
];
exports.classrooms = [
    { number: "A101", capacity: 60, hasProjector: true },
    { number: "B205", capacity: 40, hasProjector: false },
    { number: "C303", capacity: 120, hasProjector: true }
];
exports.courses = [
    { id: 100, name: "Algorithms", type: "Lecture" },
    { id: 101, name: "Discrete Math", type: "Seminar" },
    { id: 102, name: "Databases", type: "Lab" }
];
// Глобальний розклад (з id)
exports.schedule = [];
// Генератор id для занять
let _lessonIdCounter = 1;
function nextLessonId() {
    const id = _lessonIdCounter;
    _lessonIdCounter += 1;
    return id;
}
/** ========================== СЕРВІСНІ КОНСТАНТИ ========================== */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = [
    "8:30-10:00",
    "10:15-11:45",
    "12:15-13:45",
    "14:00-15:30",
    "15:45-17:15"
];
/** ========================== МУТАЦІЇ ДАНИХ ========================== */
// b) Додати професора
function addProfessor(professor) {
    // проста валідація: унікальність id
    const exists = exports.professors.some(p => p.id === professor.id);
    if (exists)
        throw new Error("Professor with this id already exists");
    exports.professors.push(professor);
}
// c) Додати заняття без конфліктів
function addLesson(lesson) {
    const conflict = validateLesson(lesson);
    if (conflict !== null)
        return false;
    const newEntry = Object.assign(Object.assign({}, lesson), { id: nextLessonId() });
    exports.schedule.push(newEntry);
    return true;
}
/** ========================== ПОШУК ТА ФІЛЬТРАЦІЯ ========================== */
// a) Вільні аудиторії на час/день
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    const busyNumbers = exports.schedule
        .filter(s => s.timeSlot === timeSlot && s.dayOfWeek === dayOfWeek)
        .map(s => s.classroomNumber);
    return exports.classrooms
        .filter(c => busyNumbers.indexOf(c.number) === -1)
        .map(c => c.number);
}
// b) Розклад конкретного професора
function getProfessorSchedule(professorId) {
    return exports.schedule
        .filter(s => s.professorId === professorId)
        .map(s => ({
        courseId: s.courseId,
        professorId: s.professorId,
        classroomNumber: s.classroomNumber,
        dayOfWeek: s.dayOfWeek,
        timeSlot: s.timeSlot
    }));
}
// Перевірка конфліктів: один професор/аудиторія не можуть мати 2 заняття в той самий час
function validateLesson(lesson) {
    // Конфлікт по професору
    const profClash = exports.schedule.some(s => s.professorId === lesson.professorId &&
        s.dayOfWeek === lesson.dayOfWeek &&
        s.timeSlot === lesson.timeSlot);
    if (profClash) {
        return { type: "ProfessorConflict", lessonDetails: lesson };
    }
    // Конфлікт по аудиторії
    const roomClash = exports.schedule.some(s => s.classroomNumber === lesson.classroomNumber &&
        s.dayOfWeek === lesson.dayOfWeek &&
        s.timeSlot === lesson.timeSlot);
    if (roomClash) {
        return { type: "ClassroomConflict", lessonDetails: lesson };
    }
    // Додаткова валідація на існування курсів/аудиторій/викладачів
    const courseOk = exports.courses.some(c => c.id === lesson.courseId);
    const profOk = exports.professors.some(p => p.id === lesson.professorId);
    const roomOk = exports.classrooms.some(c => c.number === lesson.classroomNumber);
    if (!courseOk || !profOk || !roomOk) {
        // Якщо щось не існує — трактуємо як конфлікт аудиторії/професора (базова обробка помилок)
        return {
            type: !profOk ? "ProfessorConflict" : "ClassroomConflict",
            lessonDetails: lesson
        };
    }
    return null;
}
/** ========================== АНАЛІТИКА ========================== */
// a) Завантаженість аудиторії (відсоток): зайняті слоти / всі можливі слоти (5 днів * 5 слотів = 25)
function getClassroomUtilization(classroomNumber) {
    const totalPossible = DAYS.length * SLOTS.length; // 25
    if (totalPossible === 0)
        return 0;
    const occupied = exports.schedule.filter(s => s.classroomNumber === classroomNumber).length;
    const ratio = (occupied / totalPossible) * 100;
    return Math.round(ratio * 100) / 100; // до сотих
}
// b) Найпопулярніший тип занять (рахуємо за розкладом, дивлячись на course.type)
function getMostPopularCourseType() {
    const counts = {
        Lecture: 0,
        Seminar: 0,
        Lab: 0,
        Practice: 0
    };
    for (let i = 0; i < exports.schedule.length; i += 1) {
        const sl = exports.schedule[i];
        const course = exports.courses.find(c => c.id === sl.courseId);
        if (course) {
            counts[course.type] += 1;
        }
    }
    // Визначаємо максимум без дженериків і без складних структур:
    let winner = "Lecture";
    let best = counts.Lecture;
    if (counts.Seminar > best) {
        best = counts.Seminar;
        winner = "Seminar";
    }
    if (counts.Lab > best) {
        best = counts.Lab;
        winner = "Lab";
    }
    if (counts.Practice > best) {
        best = counts.Practice;
        winner = "Practice";
    }
    return winner;
}
/** ========================== МОДИФІКАЦІЯ РОЗКЛАДУ ========================== */
// a) Перепризначити аудиторію (перевіряємо на конфлікт)
function reassignClassroom(lessonId, newClassroomNumber) {
    const idx = exports.schedule.findIndex(s => s.id === lessonId);
    if (idx === -1)
        return false;
    // перевіряємо, що нова аудиторія існує
    const roomExists = exports.classrooms.some(c => c.number === newClassroomNumber);
    if (!roomExists)
        return false;
    const current = exports.schedule[idx];
    const draft = {
        courseId: current.courseId,
        professorId: current.professorId,
        classroomNumber: newClassroomNumber,
        dayOfWeek: current.dayOfWeek,
        timeSlot: current.timeSlot
    };
    // тимчасово видаляємо з порівняння поточний запис, щоб не конфліктувати сам із собою
    const saved = exports.schedule[idx];
    exports.schedule.splice(idx, 1);
    const conflict = validateLesson(draft);
    // повертаємо назад старий запис
    exports.schedule.splice(idx, 0, saved);
    if (conflict !== null)
        return false;
    exports.schedule[idx].classroomNumber = newClassroomNumber;
    return true;
}
// b) Скасувати заняття
function cancelLesson(lessonId) {
    const idx = exports.schedule.findIndex(s => s.id === lessonId);
    if (idx !== -1) {
        exports.schedule.splice(idx, 1);
    }
}
/** ========================== DEMO / ШВИДКА ПЕРЕВІРКА ========================== */
// очищаємо розклад, щоб демо запускалось завжди з нуля
exports.schedule.length = 0;
// додаємо кілька занять
addLesson({
    courseId: 100,
    professorId: 1,
    classroomNumber: "A101",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00"
});
function demo() {
    addLesson({
        courseId: 101,
        professorId: 2,
        classroomNumber: "B205",
        dayOfWeek: "Monday",
        timeSlot: "8:30-10:00"
    });
    addLesson({
        courseId: 102,
        professorId: 1,
        classroomNumber: "C303",
        dayOfWeek: "Tuesday",
        timeSlot: "12:15-13:45"
    });
    // конфлікт: той самий професор у той самий час
    const ok = addLesson({
        courseId: 102,
        professorId: 1,
        classroomNumber: "A101",
        dayOfWeek: "Monday",
        timeSlot: "8:30-10:00"
    });
    // ok повинно бути false
    const freeMonEarly = findAvailableClassrooms("8:30-10:00", "Monday");
    const prof1 = getProfessorSchedule(1);
    const utilA101 = getClassroomUtilization("A101");
    const popular = getMostPopularCourseType();
    // спробуємо перепризначити перше заняття
    const firstId = exports.schedule.length > 0 ? exports.schedule[0].id : -1;
    const moved = reassignClassroom(firstId, "C303"); // може бути false, якщо конфлікт
    // скасуємо друге заняття, якщо є
    if (exports.schedule.length > 1)
        cancelLesson(exports.schedule[1].id);
    console.log("===== DEMO RESULT =====");
    console.log("Конфлікт професора:", ok); // false
    console.log("Вільні аудиторії (Mon 8:30):", freeMonEarly);
    console.log("Розклад проф. 1:", prof1);
    console.log("Використання A101 (%):", utilA101);
    console.log("Найпопулярніший тип занять:", popular);
    console.log("Переміщення першого заняття:", moved);
    console.log("Поточний розклад:", exports.schedule);
    console.log("=======================");
}
demo();
