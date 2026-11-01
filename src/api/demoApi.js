// Demo-mode API.
// Products come live from the public https://fakestoreapi.com.
// Accounts, carts and orders are stored in the visitor's own browser
// (localStorage on web, in-memory elsewhere) so the app works with no backend.

const PRODUCTS_URL = 'https://fakestoreapi.com';

// ---------- storage ----------
const memory = {};
const storage = {
    get(key, fallback) {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            }
        } catch (e) { /* ignore */ }
        return key in memory ? memory[key] : fallback;
    },
    set(key, value) {
        memory[key] = value;
        try {
            if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* ignore */ }
    },
};

const USERS_KEY = 'fakestore_demo_users';
const cartKey = (email) => `fakestore_demo_cart_${email}`;
const ordersKey = (email) => `fakestore_demo_orders_${email}`;

// The "token" is just the user's email in demo mode.
const emailFromToken = (token) => token;

// ---------- products ----------
const productCache = {};

async function getJson(path) {
    const res = await fetch(`${PRODUCTS_URL}${path}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

export async function getCategories() {
    return getJson('/products/categories');
}

export async function getProductsByCategory(category) {
    const data = await getJson(`/products/category/${encodeURIComponent(category)}`);
    data.forEach((p) => { productCache[p.id] = p; });
    return data;
}

export async function getProduct(id) {
    if (productCache[id]) return productCache[id];
    const data = await getJson(`/products/${id}`);
    productCache[id] = data;
    return data;
}

// fakestoreapi returns full image URLs; keep working with relative paths too.
export function imageUri(image) {
    if (!image) return undefined;
    return /^https?:\/\//.test(image) ? image : `${PRODUCTS_URL}${image}`;
}

// ---------- users ----------
export async function signUp({ name, email, password }) {
    const users = storage.get(USERS_KEY, {});
    const key = email.trim().toLowerCase();
    if (users[key]) return { status: 'error', message: 'A user with that email already exists.' };
    users[key] = { name, email: key, password };
    storage.set(USERS_KEY, users);
    return { status: 'OK', name, email: key, token: key };
}

export async function signIn({ email, password }) {
    const users = storage.get(USERS_KEY, {});
    const key = email.trim().toLowerCase();
    const user = users[key];
    if (!user) {
        // Demo mode: any new email signs straight in so visitors can try the app.
        const name = key.split('@')[0] || 'Demo User';
        users[key] = { name, email: key, password };
        storage.set(USERS_KEY, users);
        return { status: 'OK', name, email: key, token: key };
    }
    if (user.password !== password) return { status: 'error', message: 'Wrong password.' };
    return { status: 'OK', name: user.name, email: key, token: key };
}

export async function updateUser(token, { name, password }) {
    const users = storage.get(USERS_KEY, {});
    const key = emailFromToken(token);
    if (!users[key]) return { status: 'error', message: 'User not found.' };
    users[key] = { ...users[key], name, password };
    storage.set(USERS_KEY, users);
    return { status: 'OK', name, message: 'Profile updated successfully!' };
}

// ---------- cart ----------
// Stored as full cart items (product fields + quantity).
export async function getCart(token) {
    return storage.get(cartKey(emailFromToken(token)), []);
}

export async function saveCart(token, items) {
    storage.set(cartKey(emailFromToken(token)), items);
}

// ---------- orders ----------
// Same shape the original backend returned.
export async function getOrders(token) {
    return storage.get(ordersKey(emailFromToken(token)), []);
}

export async function createOrder(token, cartItems) {
    if (!cartItems.length) return { status: 'error', message: 'Cart is empty.' };
    const orders = storage.get(ordersKey(emailFromToken(token)), []);
    const items = cartItems.map((i) => ({
        prodID: i.id, price: i.price, quantity: i.quantity, title: i.title, image: i.image,
    }));
    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = {
        id: orders.reduce((max, o) => Math.max(max, o.id), 0) + 1,
        item_numbers: cartItems.reduce((n, i) => n + i.quantity, 0),
        total_price: Math.round(total * 100),
        is_paid: 0,
        is_delivered: 0,
        order_items: JSON.stringify(items),
    };
    orders.push(order);
    storage.set(ordersKey(emailFromToken(token)), orders);
    return { status: 'OK', order };
}

export async function updateOrder(token, { orderID, isPaid, isDelivered }) {
    const key = ordersKey(emailFromToken(token));
    const orders = storage.get(key, []);
    const order = orders.find((o) => o.id === orderID);
    if (!order) return { status: 'error', message: 'Order not found.' };
    order.is_paid = isPaid;
    order.is_delivered = isDelivered;
    storage.set(key, orders);
    return { status: 'OK' };
}
