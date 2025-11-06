"use strict";
/* ===================== Крок 1. Типи товарів ===================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.demo = exports.books = exports.clothes = exports.electronics = exports.removeFromCart = exports.setQuantity = exports.calculateTotal = exports.addToCart = exports.filterByPrice = exports.findProduct = void 0;
/* ===================== Крок 2. Пошук та фільтри ===================== */
/**
 * Знайти товар за id у масиві будь-яких продуктів T (які розширюють BaseProduct).
 * Повертає елемент типу T або undefined.
 */
const findProduct = (products, id) => {
    if (!Number.isFinite(id))
        return undefined;
    return products.find(p => p.id === id);
};
exports.findProduct = findProduct;
/**
 * Відфільтрувати товари за діапазоном ціни [minPrice; maxPrice].
 * Параметри мають валідовуватись; негативні ціни обрізаємо до 0.
 * Повертає НОВИЙ масив T[] (без мутацій).
 */
const filterByPrice = (products, maxPrice, minPrice = 0) => {
    const max = Number.isFinite(maxPrice) ? Math.max(0, maxPrice) : Infinity;
    const min = Number.isFinite(minPrice) ? Math.max(0, minPrice) : 0;
    if (min > max)
        return [];
    return products.filter(p => p.price >= min && p.price <= max);
};
exports.filterByPrice = filterByPrice;
/**
 * Додати товар у кошик. Якщо такий товар уже є — збільшує кількість.
 * Повертає НОВИЙ масив (іммутабельно).
 * Якщо product === undefined або quantity < 1 — повертає копію кошика без змін.
 */
const addToCart = (cart, product, quantity) => {
    if (!product || !Number.isFinite(quantity) || quantity < 1) {
        return [...cart];
    }
    const idx = cart.findIndex(ci => ci.product.id === product.id);
    if (idx === -1) {
        return [...cart, { product, quantity }];
    }
    const next = [...cart];
    next[idx] = { product: cart[idx].product, quantity: cart[idx].quantity + quantity };
    return next;
};
exports.addToCart = addToCart;
/**
 * Підрахувати загальну вартість кошика.
 * Некоректні ціни/кількості (наприклад, від’ємні) ігноруються.
 */
const calculateTotal = (cart) => {
    let total = 0;
    for (let i = 0; i < cart.length; i += 1) {
        const { product, quantity } = cart[i];
        if (!Number.isFinite(product.price) || !Number.isFinite(quantity))
            continue;
        if (product.price < 0 || quantity <= 0)
            continue;
        total += product.price * quantity;
    }
    return Math.round(total * 100) / 100; // до копійок
};
exports.calculateTotal = calculateTotal;
/* ===== Додатково (не обов’язково, але корисно): оновлення / видалення ===== */
/** Оновити кількість; quantity<=0 означає видалення позиції. */
const setQuantity = (cart, productId, quantity) => {
    const idx = cart.findIndex(ci => ci.product.id === productId);
    if (idx === -1)
        return [...cart];
    if (!Number.isFinite(quantity) || quantity <= 0) {
        return cart.filter(ci => ci.product.id !== productId);
    }
    const next = [...cart];
    next[idx] = { product: cart[idx].product, quantity };
    return next;
};
exports.setQuantity = setQuantity;
/** Видалити товар із кошика. */
const removeFromCart = (cart, productId) => cart.filter(ci => ci.product.id !== productId);
exports.removeFromCart = removeFromCart;
/* ===================== Крок 4. Тестові дані та демо ===================== */
exports.electronics = [
    { id: 1, name: "Телефон", price: 10000, category: "electronics", brand: "Xiaomi", warrantyMonths: 24, inStock: true },
    { id: 2, name: "Навушники", price: 2500, category: "electronics", brand: "Sony", inStock: true }
];
exports.clothes = [
    { id: 10, name: "Футболка", price: 600, category: "clothing", size: "M", material: "cotton", gender: "unisex", inStock: true },
    { id: 11, name: "Худі", price: 1700, category: "clothing", size: "L", material: "fleece", gender: "men" }
];
exports.books = [
    { id: 20, name: "Clean Code", price: 1500, category: "book", author: "Robert C. Martin", pages: 464, isbn: "9780132350884" },
    { id: 21, name: "You Don't Know JS", price: 1200, category: "book", author: "Kyle Simpson", pages: 278 }
];
/* Приклад використання (можна прибрати або лишити для перевірки) */
const demo = () => {
    // findProduct + addToCart
    const phone = (0, exports.findProduct)(exports.electronics, 1);
    let cart = [];
    cart = (0, exports.addToCart)(cart, phone, 1);
    cart = (0, exports.addToCart)(cart, phone, 2);
    cart = (0, exports.addToCart)(cart, (0, exports.findProduct)(exports.clothes, 10), 2);
    // filterByPrice
    const cheapBooks = (0, exports.filterByPrice)(exports.books, 1300);
    // update/remove
    cart = (0, exports.setQuantity)(cart, 1, 2);
    cart = (0, exports.removeFromCart)(cart, 10);
    const total = (0, exports.calculateTotal)(cart);
    console.log({
        phone,
        cart,
        cheapBooks,
        total
    });
    // Прості перевірки
    console.assert((phone === null || phone === void 0 ? void 0 : phone.id) === 1, "phone not found");
    console.assert(total >= 0, "total must be >= 0");
};
exports.demo = demo;
(0, exports.demo)();
