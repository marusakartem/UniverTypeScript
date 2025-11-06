"use strict";
// Прості типи:
let modalOpen = false;
// DOM-елементи:
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const loadPostsBtn = document.getElementById("loadPostsBtn");
const loadUsersBtn = document.getElementById("loadUsersBtn");
const dataContainer = document.getElementById("dataContainer");
// Відкрити/закрити модалку:
function openModal() {
    modalBackdrop.classList.remove("hidden");
    modalBackdrop.setAttribute("aria-hidden", "false");
    modalOpen = true;
}
function closeModal() {
    modalBackdrop.classList.add("hidden");
    modalBackdrop.setAttribute("aria-hidden", "true");
    modalOpen = false;
}
// Обробники кліків:
openModalBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", () => closeModal());
modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop)
        closeModal();
});
// Esc для закриття:
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOpen)
        closeModal();
});
// IntersectionObserver для анімації появи секцій при скролі:
const observed = document.querySelectorAll(".observe");
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: [0, 0.25, 1],
    // нижче ми «урізаємо» низ в’юпорта, щоб треба було прокрутити:
    rootMargin: "0px 0px -15% 0px"
});
observed.forEach((el) => observer.observe(el));
// Завантаження постів:
async function loadPosts(limit = 8) {
    clearContainer();
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const posts = await res.json();
    posts.slice(0, limit).forEach(renderPostCard);
}
// Завантаження користувачів:
async function loadUsers(limit = 8) {
    clearContainer();
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await res.json();
    users.slice(0, limit).forEach(renderUserCard);
}
// Рендер карток:
function renderPostCard(p) {
    const card = document.createElement("div");
    card.className = "card";
    const title = sanitize(p.title);
    const body = sanitize(p.body);
    card.innerHTML = `<h4>Пост #${p.id}: ${title}</h4><p>${body}</p>`;
    dataContainer.appendChild(card);
}
function renderUserCard(u) {
    const card = document.createElement("div");
    card.className = "card";
    const name = sanitize(u.name);
    const email = sanitize(u.email);
    card.innerHTML = `<h4>${name}</h4><p>${email}</p>`;
    dataContainer.appendChild(card);
}
// Корисні утиліти:
function clearContainer() {
    dataContainer.innerHTML = "";
}
// дуже проста санітизація тексту:
function sanitize(s) {
    return s.replace(/[&<>"']/g, (c) => {
        var _a;
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return (_a = map[c]) !== null && _a !== void 0 ? _a : c;
    });
}
// Прив’язка кнопок:
loadPostsBtn.addEventListener("click", () => loadPosts(8));
loadUsersBtn.addEventListener("click", () => loadUsers(8));
// loadPosts(8);
