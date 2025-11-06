/* ===================== Крок 1. Типи товарів ===================== */

export type BaseProduct = {
    id: number;
    name: string;
    price: number;
    inStock?: boolean;
    tags?: string[];
    rating?: number; // 0..5
};

export type Electronics = BaseProduct & {
    category: "electronics";
    brand: string;
    warrantyMonths?: number;
};

export type Clothing = BaseProduct & {
    category: "clothing";
    size: "XS" | "S" | "M" | "L" | "XL";
    material?: string;
    gender?: "men" | "women" | "unisex";
};

export type Book = BaseProduct & {
    category: "book";
    author: string;
    pages: number;
    isbn?: string;
};

/* ===================== Крок 2. Пошук та фільтри ===================== */

/**
 * Знайти товар за id у масиві будь-яких продуктів T (які розширюють BaseProduct).
 * Повертає елемент типу T або undefined.
 */
export const findProduct = <T extends BaseProduct>(
    products: readonly T[],
    id: number
): T | undefined => {
    if (!Number.isFinite(id)) return undefined;
    return products.find(p => p.id === id);
};

/**
 * Відфільтрувати товари за діапазоном ціни [minPrice; maxPrice].
 * Параметри мають валідовуватись; негативні ціни обрізаємо до 0.
 * Повертає НОВИЙ масив T[] (без мутацій).
 */
export const filterByPrice = <T extends BaseProduct>(
    products: readonly T[],
    maxPrice: number,
    minPrice: number = 0
): T[] => {
    const max = Number.isFinite(maxPrice) ? Math.max(0, maxPrice) : Infinity;
    const min = Number.isFinite(minPrice) ? Math.max(0, minPrice) : 0;
    if (min > max) return [];
    return products.filter(p => p.price >= min && p.price <= max);
};

/* ===================== Крок 3. Кошик ===================== */

export type CartItem<T extends BaseProduct> = {
    product: T;
    quantity: number; // > 0
};

/**
 * Додати товар у кошик. Якщо такий товар уже є — збільшує кількість.
 * Повертає НОВИЙ масив (іммутабельно).
 * Якщо product === undefined або quantity < 1 — повертає копію кошика без змін.
 */
export const addToCart = <T extends BaseProduct>(
    cart: readonly CartItem<T>[],
    product: T | undefined,
    quantity: number
): CartItem<T>[] => {
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

/**
 * Підрахувати загальну вартість кошика.
 * Некоректні ціни/кількості (наприклад, від’ємні) ігноруються.
 */
export const calculateTotal = <T extends BaseProduct>(cart: readonly CartItem<T>[]): number => {
    let total = 0;
    for (let i = 0; i < cart.length; i += 1) {
        const { product, quantity } = cart[i];
        if (!Number.isFinite(product.price) || !Number.isFinite(quantity)) continue;
        if (product.price < 0 || quantity <= 0) continue;
        total += product.price * quantity;
    }
    return Math.round(total * 100) / 100; // до копійок
};

/* ===== Додатково (не обов’язково, але корисно): оновлення / видалення ===== */

/** Оновити кількість; quantity<=0 означає видалення позиції. */
export const setQuantity = <T extends BaseProduct>(
    cart: readonly CartItem<T>[],
    productId: number,
    quantity: number
): CartItem<T>[] => {
    const idx = cart.findIndex(ci => ci.product.id === productId);
    if (idx === -1) return [...cart];
    if (!Number.isFinite(quantity) || quantity <= 0) {
        return cart.filter(ci => ci.product.id !== productId);
    }
    const next = [...cart];
    next[idx] = { product: cart[idx].product, quantity };
    return next;
};

/** Видалити товар із кошика. */
export const removeFromCart = <T extends BaseProduct>(
    cart: readonly CartItem<T>[],
    productId: number
): CartItem<T>[] => cart.filter(ci => ci.product.id !== productId);

/* ===================== Крок 4. Тестові дані та демо ===================== */

export const electronics: Electronics[] = [
    { id: 1, name: "Телефон", price: 10000, category: "electronics", brand: "Xiaomi", warrantyMonths: 24, inStock: true },
    { id: 2, name: "Навушники", price: 2500, category: "electronics", brand: "Sony", inStock: true }
];

export const clothes: Clothing[] = [
    { id: 10, name: "Футболка", price: 600, category: "clothing", size: "M", material: "cotton", gender: "unisex", inStock: true },
    { id: 11, name: "Худі", price: 1700, category: "clothing", size: "L", material: "fleece", gender: "men" }
];

export const books: Book[] = [
    { id: 20, name: "Clean Code", price: 1500, category: "book", author: "Robert C. Martin", pages: 464, isbn: "9780132350884" },
    { id: 21, name: "You Don't Know JS", price: 1200, category: "book", author: "Kyle Simpson", pages: 278 }
];

/* Приклад використання (можна прибрати або лишити для перевірки) */
export const demo = (): void => {
    // findProduct + addToCart
    const phone = findProduct(electronics, 1);
    let cart: CartItem<BaseProduct>[] = [];
    cart = addToCart<BaseProduct>(cart, phone, 1);
    cart = addToCart<BaseProduct>(cart, phone, 2);
    cart = addToCart<BaseProduct>(cart, findProduct(clothes, 10), 2);

    // filterByPrice
    const cheapBooks = filterByPrice(books, 1300);

    // update/remove
    cart = setQuantity(cart, 1, 2);
    cart = removeFromCart(cart, 10);

    const total = calculateTotal(cart);

    console.log({
        phone,
        cart,
        cheapBooks,
        total
    });

    // Прості перевірки
    console.assert(phone?.id === 1, "phone not found");
    console.assert(total >= 0, "total must be >= 0");
};
demo();
