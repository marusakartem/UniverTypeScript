// Прості типи:
let modalOpen: boolean = false;

// Інтерфейси для даних з JSONPlaceholder:
interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

// DOM-елементи:
const openModalBtn = document.getElementById("openModalBtn") as HTMLButtonElement;
const closeModalBtn = document.getElementById("closeModalBtn") as HTMLButtonElement;
const modalBackdrop = document.getElementById("modalBackdrop") as HTMLDivElement;

const loadPostsBtn = document.getElementById("loadPostsBtn") as HTMLButtonElement;
const loadUsersBtn = document.getElementById("loadUsersBtn") as HTMLButtonElement;
const dataContainer = document.getElementById("dataContainer") as HTMLDivElement;

// Відкрити/закрити модалку:
function openModal(): void {
    modalBackdrop.classList.remove("hidden");
    modalBackdrop.setAttribute("aria-hidden", "false");
    modalOpen = true;
}

function closeModal(): void {
    modalBackdrop.classList.add("hidden");
    modalBackdrop.setAttribute("aria-hidden", "true");
    modalOpen = false;
}

// Обробники кліків:
openModalBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", () => closeModal());
modalBackdrop.addEventListener("click", (e: MouseEvent) => {
    if (e.target === modalBackdrop) closeModal();
});

// Esc для закриття:
document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && modalOpen) closeModal();
});

// IntersectionObserver для анімації появи секцій при скролі:
const observed = document.querySelectorAll<HTMLElement>(".observe");
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
                (entry.target as HTMLElement).classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: [0, 0.25, 1],
        // нижче ми «урізаємо» низ в’юпорта, щоб треба було прокрутити:
        rootMargin: "0px 0px -15% 0px"
    }
);
observed.forEach((el: HTMLElement) => observer.observe(el));

// Завантаження постів:
async function loadPosts(limit: number = 8): Promise<void> {
    clearContainer();
    const res: Response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const posts: Post[] = await res.json();
    posts.slice(0, limit).forEach(renderPostCard);
}

// Завантаження користувачів:
async function loadUsers(limit: number = 8): Promise<void> {
    clearContainer();
    const res: Response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users: User[] = await res.json();
    users.slice(0, limit).forEach(renderUserCard);
}

// Рендер карток:
function renderPostCard(p: Post): void {
    const card: HTMLDivElement = document.createElement("div");
    card.className = "card";
    const title: string = sanitize(p.title);
    const body: string = sanitize(p.body);
    card.innerHTML = `<h4>Пост #${p.id}: ${title}</h4><p>${body}</p>`;
    dataContainer.appendChild(card);
}

function renderUserCard(u: User): void {
    const card: HTMLDivElement = document.createElement("div");
    card.className = "card";
    const name: string = sanitize(u.name);
    const email: string = sanitize(u.email);
    card.innerHTML = `<h4>${name}</h4><p>${email}</p>`;
    dataContainer.appendChild(card);
}

// Корисні утиліти:
function clearContainer(): void {
    dataContainer.innerHTML = "";
}

// дуже проста санітизація тексту:
function sanitize(s: string): string {
    return s.replace(/[&<>"']/g, (c: string): string => {
        const map: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return map[c] ?? c;
    });
}

// Прив’язка кнопок:
loadPostsBtn.addEventListener("click", () => loadPosts(8));
loadUsersBtn.addEventListener("click", () => loadUsers(8));

// loadPosts(8);
