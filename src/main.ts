/** ========================== БАЗОВІ ТИПИ ========================== */

// a) Дні тижня (пн–пт)
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

// b) Часові слоти
export type TimeSlot =
    | "8:30-10:00"
    | "10:15-11:45"
    | "12:15-13:45"
    | "14:00-15:30"
    | "15:45-17:15";

// c) Типи занять
export type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

/** ========================== ОСНОВНІ СТРУКТУРИ (type alias) ========================== */

export type Professor = {
    id: number;
    name: string;
    department: string;
};

export type Classroom = {
    number: string;
    capacity: number;
    hasProjector: boolean;
};

export type Course = {
    id: number;
    name: string;
    type: CourseType;
};

export type Lesson = {
    courseId: number;
    professorId: number;
    classroomNumber: string;
    dayOfWeek: DayOfWeek;
    timeSlot: TimeSlot;
};

// Внутрішній тип для збереження заняття з ідентифікатором
export type ScheduledLesson = Lesson & { id: number };

/** ========================== ДАНІ (масиви) ========================== */

export let professors: Professor[] = [
    { id: 1, name: "Dr. Ivanenko", department: "CS" },
    { id: 2, name: "Dr. Shevchenko", department: "Math" }
];

export let classrooms: Classroom[] = [
    { number: "A101", capacity: 60, hasProjector: true },
    { number: "B205", capacity: 40, hasProjector: false },
    { number: "C303", capacity: 120, hasProjector: true }
];

export let courses: Course[] = [
    { id: 100, name: "Algorithms", type: "Lecture" },
    { id: 101, name: "Discrete Math", type: "Seminar" },
    { id: 102, name: "Databases", type: "Lab" }
];

// Глобальний розклад (з id)
export let schedule: ScheduledLesson[] = [];

// Генератор id для занять
let _lessonIdCounter: number = 1;
function nextLessonId(): number {
    const id = _lessonIdCounter;
    _lessonIdCounter += 1;
    return id;
}

/** ========================== СЕРВІСНІ КОНСТАНТИ ========================== */

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS: TimeSlot[] = [
    "8:30-10:00",
    "10:15-11:45",
    "12:15-13:45",
    "14:00-15:30",
    "15:45-17:15"
];

/** ========================== МУТАЦІЇ ДАНИХ ========================== */

// b) Додати професора
export function addProfessor(professor: Professor): void {
    // проста валідація: унікальність id
    const exists = professors.some(p => p.id === professor.id);
    if (exists) throw new Error("Professor with this id already exists");
    professors.push(professor);
}

// c) Додати заняття без конфліктів
export function addLesson(lesson: Lesson): boolean {
    const conflict = validateLesson(lesson);
    if (conflict !== null) return false;
    const newEntry: ScheduledLesson = { ...lesson, id: nextLessonId() };
    schedule.push(newEntry);
    return true;
}

/** ========================== ПОШУК ТА ФІЛЬТРАЦІЯ ========================== */

// a) Вільні аудиторії на час/день
export function findAvailableClassrooms(timeSlot: TimeSlot, dayOfWeek: DayOfWeek): string[] {
    const busyNumbers: string[] = schedule
        .filter(s => s.timeSlot === timeSlot && s.dayOfWeek === dayOfWeek)
        .map(s => s.classroomNumber);

    return classrooms
        .filter(c => busyNumbers.indexOf(c.number) === -1)
        .map(c => c.number);
}

// b) Розклад конкретного професора
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

/** ========================== КОНФЛІКТИ ТА ВАЛІДАЦІЯ ========================== */

export type ScheduleConflictType = "ProfessorConflict" | "ClassroomConflict";

export type ScheduleConflict = {
    type: ScheduleConflictType;
    lessonDetails: Lesson;
};

// Перевірка конфліктів: один професор/аудиторія не можуть мати 2 заняття в той самий час
export function validateLesson(lesson: Lesson): ScheduleConflict | null {
    // Конфлікт по професору
    const profClash = schedule.some(
        s =>
            s.professorId === lesson.professorId &&
            s.dayOfWeek === lesson.dayOfWeek &&
            s.timeSlot === lesson.timeSlot
    );
    if (profClash) {
        return { type: "ProfessorConflict", lessonDetails: lesson };
    }

    // Конфлікт по аудиторії
    const roomClash = schedule.some(
        s =>
            s.classroomNumber === lesson.classroomNumber &&
            s.dayOfWeek === lesson.dayOfWeek &&
            s.timeSlot === lesson.timeSlot
    );
    if (roomClash) {
        return { type: "ClassroomConflict", lessonDetails: lesson };
    }

    // Додаткова валідація на існування курсів/аудиторій/викладачів
    const courseOk = courses.some(c => c.id === lesson.courseId);
    const profOk = professors.some(p => p.id === lesson.professorId);
    const roomOk = classrooms.some(c => c.number === lesson.classroomNumber);

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
export function getClassroomUtilization(classroomNumber: string): number {
    const totalPossible: number = DAYS.length * SLOTS.length; // 25
    if (totalPossible === 0) return 0;

    const occupied: number = schedule.filter(s => s.classroomNumber === classroomNumber).length;
    const ratio: number = (occupied / totalPossible) * 100;
    return Math.round(ratio * 100) / 100; // до сотих
}

// b) Найпопулярніший тип занять (рахуємо за розкладом, дивлячись на course.type)
export function getMostPopularCourseType(): CourseType {
    const counts: { Lecture: number; Seminar: number; Lab: number; Practice: number } = {
        Lecture: 0,
        Seminar: 0,
        Lab: 0,
        Practice: 0
    };

    for (let i = 0; i < schedule.length; i += 1) {
        const sl = schedule[i];
        const course = courses.find(c => c.id === sl.courseId);
        if (course) {
            counts[course.type] += 1;
        }
    }

    // Визначаємо максимум без дженериків і без складних структур:
    let winner: CourseType = "Lecture";
    let best: number = counts.Lecture;

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
export function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
    const idx: number = schedule.findIndex(s => s.id === lessonId);
    if (idx === -1) return false;

    // перевіряємо, що нова аудиторія існує
    const roomExists: boolean = classrooms.some(c => c.number === newClassroomNumber);
    if (!roomExists) return false;

    const current: ScheduledLesson = schedule[idx];
    const draft: Lesson = {
        courseId: current.courseId,
        professorId: current.professorId,
        classroomNumber: newClassroomNumber,
        dayOfWeek: current.dayOfWeek,
        timeSlot: current.timeSlot
    };

    // тимчасово видаляємо з порівняння поточний запис, щоб не конфліктувати сам із собою
    const saved = schedule[idx];
    schedule.splice(idx, 1);

    const conflict = validateLesson(draft);

    // повертаємо назад старий запис
    schedule.splice(idx, 0, saved);

    if (conflict !== null) return false;

    schedule[idx].classroomNumber = newClassroomNumber;
    return true;
}

// b) Скасувати заняття
export function cancelLesson(lessonId: number): void {
    const idx: number = schedule.findIndex(s => s.id === lessonId);
    if (idx !== -1) {
        schedule.splice(idx, 1);
    }
}

/** ========================== DEMO / ШВИДКА ПЕРЕВІРКА ========================== */

// очищаємо розклад, щоб демо запускалось завжди з нуля
schedule.length = 0;

// додаємо кілька занять
addLesson({
    courseId: 100,
    professorId: 1,
    classroomNumber: "A101",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00"
});

function demo(): void {
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
    const firstId = schedule.length > 0 ? schedule[0].id : -1;
    const moved = reassignClassroom(firstId, "C303"); // може бути false, якщо конфлікт

    // скасуємо друге заняття, якщо є
    if (schedule.length > 1) cancelLesson(schedule[1].id);

    console.log("===== DEMO RESULT =====");
    console.log("Конфлікт професора:", ok); // false
    console.log("Вільні аудиторії (Mon 8:30):", freeMonEarly);
    console.log("Розклад проф. 1:", prof1);
    console.log("Використання A101 (%):", utilA101);
    console.log("Найпопулярніший тип занять:", popular);
    console.log("Переміщення першого заняття:", moved);
    console.log("Поточний розклад:", schedule);
    console.log("=======================");
}

demo();
