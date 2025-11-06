/**
 * TypeScript & Enum — University Management System (УСІ ЛОГІКА В ОДНОМУ ФАЙЛІ)
 * - Використані enum-и, інтерфейси, повний клас із валідаціями.
 * - Без модулів/імпортів — усе локально в цьому файлі.
 * - Коментарі пояснюють важливі місця.
 */

/* ========================= Enums ========================= */

// Статус студента
export enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled",
}

// Тип курсу
export enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special",
}

// Семестр
export enum Semester {
    First = "First",
    Second = "Second",
}

// Оцінка (числові значення за умовою)
export enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2,
}

// Факультети
export enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering",
}

/* ========================= Interfaces ========================= */

export interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number; // 1..?
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

export interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

/**
 * Щоб не конфліктувати з enum Grade, інтерфейс оцінки названо GradeRecord.
 * (У вимозі назва "interface Grade", але це збігається з enum — TS не дозволить.)
 */
export interface GradeRecord {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}

/* ============== Допоміжні типи/перевірки для валідацій ============== */

type Registration = { studentId: number; courseId: number };

/** Дозволені переходи статусів: ключ -> набір допустимих нових статусів */
const STATUS_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
    [StudentStatus.Active]: [StudentStatus.Academic_Leave, StudentStatus.Graduated, StudentStatus.Expelled],
    [StudentStatus.Academic_Leave]: [StudentStatus.Active, StudentStatus.Expelled],
    [StudentStatus.Graduated]: [], // фінальний
    [StudentStatus.Expelled]: [],  // фінальний
};

/* ========================= Клас UMS ========================= */

export class UniversityManagementSystem {
    // Зберігання даних в пам’яті (один файл — без БД)
    private students: Student[] = [];
    private courses: Course[] = [];
    private registrations: Registration[] = [];
    private grades: GradeRecord[] = [];

    // Автоінкременти
    private studentIdCounter = 1;
    private courseIdCounter = 1;

    /** Утиліта: знайти студента/курс або кинути помилку */
    private getStudentOrThrow(id: number): Student {
        const s = this.students.find(st => st.id === id);
        if (!s) throw new Error(`Student ${id} not found`);
        return s;
    }
    private getCourseOrThrow(id: number): Course {
        const c = this.courses.find(co => co.id === id);
        if (!c) throw new Error(`Course ${id} not found`);
        return c;
    }

    /** Утиліта: чи зареєстрований студент на курс */
    private isRegistered(studentId: number, courseId: number): boolean {
        return this.registrations.some(r => r.studentId === studentId && r.courseId === courseId);
    }

    /** Публічно: створити курс (зручно для ініціалізації/демо) */
    public createCourse(input: Omit<Course, "id">): Course {
        const c: Course = { id: this.courseIdCounter++, ...input };
        if (c.maxStudents <= 0) throw new Error("Course.maxStudents must be > 0");
        if (c.credits <= 0) throw new Error("Course.credits must be > 0");
        this.courses.push(c);
        return c;
    }

    /* ========================= Вимоги за завданням ========================= */

    /**
     * Додати студента (enroll). id присвоюється автоматично.
     */
    public enrollStudent(student: Omit<Student, "id">): Student {
        // Базова валідація
        if (student.year < 1) throw new Error("Student.year must be >= 1");
        if (!student.fullName.trim()) throw new Error("Student.fullName is required");

        const s: Student = { id: this.studentIdCounter++, ...student };
        this.students.push(s);
        return s;
    }

    /**
     * Зареєструвати студента на курс.
     * Перевірки:
     *  - студент існує і активний (Active)
     *  - курс існує
     *  - відповідність факультетів (курс.faculty === student.faculty)
     *  - кількість зареєстрованих < maxStudents
     *  - не дублювати реєстрацію
     */
    public registerForCourse(studentId: number, courseId: number): void {
        const student = this.getStudentOrThrow(studentId);
        const course = this.getCourseOrThrow(courseId);

        if (student.status !== StudentStatus.Active) {
            throw new Error(`Student ${studentId} is not Active (status = ${student.status})`);
        }
        if (student.faculty !== course.faculty) {
            throw new Error(`Faculty mismatch: student=${student.faculty}, course=${course.faculty}`);
        }
        const already = this.isRegistered(studentId, courseId);
        if (already) return; // ідемпотентність

        const registeredCount = this.registrations.filter(r => r.courseId === courseId).length;
        if (registeredCount >= course.maxStudents) {
            throw new Error(`Course ${courseId} is full`);
        }

        this.registrations.push({ studentId, courseId });
    }

    /**
     * Поставити оцінку студенту за курс.
     * Перевірки:
     *  - студент і курс існують
     *  - студент зареєстрований на курс
     */
    public setGrade(studentId: number, courseId: number, grade: Grade): void {
        this.getStudentOrThrow(studentId);
        const course = this.getCourseOrThrow(courseId);

        if (!this.isRegistered(studentId, courseId)) {
            throw new Error(`Student ${studentId} is not registered for course ${courseId}`);
        }

        // Дозволяємо кілька спроб (перездачі) — зберігаємо історію з датами
        const rec: GradeRecord = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester,
        };
        this.grades.push(rec);
    }

    /**
     * Оновити статус студента з валідацією переходів.
     * Н-д: Active -> Graduated дозволено; Graduated/Expelled — фінальні.
     */
    public updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.getStudentOrThrow(studentId);
        if (student.status === newStatus) return;

        const allowed = STATUS_TRANSITIONS[student.status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new Error(`Invalid status transition: ${student.status} -> ${newStatus}`);
        }

        // Додаткова логіка: при Graduated/Expelled можна (опційно) скасувати всі реєстрації
        // Тут залишимо як є, але можна розкоментувати, якщо потрібно:
        // if (newStatus === StudentStatus.Graduated || newStatus === StudentStatus.Expelled) {
        //   this.registrations = this.registrations.filter(r => r.studentId !== studentId);
        // }

        student.status = newStatus;
    }

    /** Отримати студентів певного факультету */
    public getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    /** Повернути всі оцінки студента (історія спроб включно) */
    public getStudentGrades(studentId: number): GradeRecord[] {
        this.getStudentOrThrow(studentId); // викине, якщо нема
        return this.grades.filter(g => g.studentId === studentId);
    }

    /**
     * Доступні курси по факультету і семестру (і з місцями).
     * За умовою: фільтруємо faculty + semester + є вільні місця.
     */
    public getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(c => {
            if (c.faculty !== faculty) return false;
            if (c.semester !== semester) return false;
            const cnt = this.registrations.filter(r => r.courseId === c.id).length;
            return cnt < c.maxStudents;
        });
    }

    /**
     * Середній бал студента за **останніми** оцінками по кожному курсу.
     * Якщо студент має кілька спроб по курсу — беремо останню.
     * Якщо немає оцінок — повертаємо 0.
     */
    public calculateAverageGrade(studentId: number): number {
        this.getStudentOrThrow(studentId);

        // Знайдемо останні оцінки по кожному courseId
        const mapLatest: Record<number, GradeRecord> = {};
        for (let i = 0; i < this.grades.length; i += 1) {
            const g = this.grades[i];
            if (g.studentId !== studentId) continue;
            const prev = mapLatest[g.courseId];
            if (!prev || prev.date < g.date) {
                mapLatest[g.courseId] = g;
            }
        }

        const entries = Object.values(mapLatest);
        if (entries.length === 0) return 0;

        const sum = entries.reduce((acc, r) => acc + r.grade, 0);
        return Math.round((sum / entries.length) * 100) / 100;
    }

    /**
     * Додатково: список "відмінників" по факультету.
     * Критерій: середній бал (за останніми оцінками) == 5 (Excellent).
     * Можна змінити критерій на >= 4.5, якщо потрібно.
     */
    public getHonorsByFaculty(faculty: Faculty): Student[] {
        const studs = this.getStudentsByFaculty(faculty);
        return studs.filter(s => this.calculateAverageGrade(s.id) === Grade.Excellent);
    }

    /* ========================= Невеликий DEMO (можна видалити) ========================= */
    public static demo(): void {
        const ums = new UniversityManagementSystem();

        // Створимо курси
        const csAlgo = ums.createCourse({
            name: "Algorithms",
            type: CourseType.Mandatory,
            credits: 6,
            semester: Semester.First,
            faculty: Faculty.Computer_Science,
            maxStudents: 2,
        });

        const csDb = ums.createCourse({
            name: "Databases",
            type: CourseType.Special,
            credits: 5,
            semester: Semester.First,
            faculty: Faculty.Computer_Science,
            maxStudents: 2,
        });

        // Додаємо студентів
        const st1 = ums.enrollStudent({
            fullName: "Ivan Ivanenko",
            faculty: Faculty.Computer_Science,
            year: 1,
            status: StudentStatus.Active,
            enrollmentDate: new Date("2024-09-01"),
            groupNumber: "CS-11",
        });

        const st2 = ums.enrollStudent({
            fullName: "Olena Shevchenko",
            faculty: Faculty.Computer_Science,
            year: 1,
            status: StudentStatus.Active,
            enrollmentDate: new Date("2024-09-01"),
            groupNumber: "CS-12",
        });

        // Реєстрація на курси
        ums.registerForCourse(st1.id, csAlgo.id);
        ums.registerForCourse(st1.id, csDb.id);
        ums.registerForCourse(st2.id, csAlgo.id);

        // Оцінки
        ums.setGrade(st1.id, csAlgo.id, Grade.Excellent);
        ums.setGrade(st1.id, csDb.id, Grade.Good);
        ums.setGrade(st2.id, csAlgo.id, Grade.Excellent);

        // Середній бал
        const avg1 = ums.calculateAverageGrade(st1.id); // (5 + 4) / 2 = 4.5
        const avg2 = ums.calculateAverageGrade(st2.id); // 5

        // Доступні курси (має залишитись місце на csDb)
        const available = ums.getAvailableCourses(Faculty.Computer_Science, Semester.First);

        // Відмінники
        const honors = ums.getHonorsByFaculty(Faculty.Computer_Science);

        // Зміна статусу
        ums.updateStudentStatus(st1.id, StudentStatus.Academic_Leave);
        // ums.updateStudentStatus(st1.id, StudentStatus.Graduated); // приклад недозволеного переходу з Academic_Leave -> Graduated (у нас заборонено)

        console.log({ avg1, avg2, available, honors, st1: ums["getStudentOrThrow"](st1.id) });
    }
}
UniversityManagementSystem.demo();
