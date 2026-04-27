const API = "http://127.0.0.1:5000/api";

/* =========================
   STATE & FORMATTING
========================= */
let cart = [];

const money = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
});

/* =========================
   AUTH LOGIC
========================= */

async function getCurrentUser() {
    try {
        const res = await fetch(`${API}/me`, { credentials: "include" });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
        window.location.href = data.role === 'admin' ? 'admin.html' : 'home.html';
    } else {
        alert(data.error || "Login failed");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    if (res.ok) {
        alert("Account created! Please login.");
        location.reload(); 
    } else {
        alert("Registration failed. Email might be in use.");
    }
}

/* =========================
   DYNAMIC NAVIGATION
========================= */

async function buildNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const user = await getCurrentUser();
    nav.innerHTML = ''; // Clear it first

    // Core links everyone sees
    const links = [
        { text: 'Home', href: 'home.html' },
        { text: 'Produce', href: 'produce.html' },
        { text: 'Producers', href: 'producers.html' }
    ];

    // 1. Add standard links
    links.forEach(l => {
        const a = document.createElement('a');
        a.textContent = l.text;
        a.href = l.href;
        // Highlight active page
        if (window.location.pathname.includes(l.href)) a.className = 'active';
        nav.appendChild(a);
    });

    // 2. Add Role-Based links
    if (user) {
        const profile = document.createElement('a');
        if (user.role === 'admin') {
            profile.textContent = 'Admin Panel';
            profile.href = 'admin.html';
        } else {
            profile.textContent = 'My Account';
            profile.href = 'account.html';
        }
        if (window.location.pathname.includes(profile.href)) profile.className = 'active';
        nav.appendChild(profile);

        // 3. Secure Logout
        const logout = document.createElement('a');
        logout.href = '#';
        logout.textContent = 'Logout';
        logout.style.cursor = 'pointer';
        logout.onclick = async (e) => {
            e.preventDefault();
            await fetch(`${API}/logout`, { method: 'POST', credentials: "include" });
            window.location.href = 'login.html';
        };
        nav.appendChild(logout);
    } else {
        // 4. Show Login if guest
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = 'Login';
        if (window.location.pathname.includes('login.html')) loginLink.className = 'active';
        nav.appendChild(loginLink);
    }
}


/* =========================
   CART OPERATIONS
========================= */

function loadCart() {
    fetch(`${API}/cart`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            cart = data;
            updateCartDisplay();
            renderCartSidebar();
        });
}

function updateCartDisplay() {
    let count = 0;
    let total = 0;
    cart.forEach(i => {
        count += (i.quantity || 1);
        total += i.price * (i.quantity || 1);
    });
    if(document.getElementById('cart-count')) document.getElementById('cart-count').textContent = count;
    if(document.getElementById('cart-total')) document.getElementById('cart-total').textContent = total.toFixed(2);
}

function renderCartSidebar() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('sidebar-total');
    if (!container || !totalEl) return;

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * (item.quantity || 1);
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<strong>${item.name}</strong><br>${money.format(item.price)} x ${item.quantity || 1}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => {
            fetch(`${API}/cart/remove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: item.name })
            }).then(loadCart);
        };
        div.appendChild(removeBtn);
        container.appendChild(div);
    });
    totalEl.textContent = money.format(total);
}

function addToCart(name, price) {
    fetch(`${API}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, price, quantity: 1 })
    }).then(() => {
        showCartMessage(name);
        loadCart();
    });
}

/* =========================
   UI & ACCESSIBILITY
========================= */

function openCart() {
    document.getElementById('cart-sidebar')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('show');
}

function closeCart() {
    document.getElementById('cart-sidebar')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('show');
}

function showCartMessage(name) {
    let msg = document.getElementById('cart-message');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'cart-message';
        document.body.appendChild(msg);
    }
    msg.textContent = `${name} added to cart!`;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 1500);
}

function loadProduce() {
    const container = document.getElementById("produce-container");
    if (!container) return;

    fetch(`${API}/produce`)
        .then(res => res.json())
        .then(items => {
            container.innerHTML = "";
            items.forEach(item => {
                const div = document.createElement("div");
                div.className = "boxes";
                div.innerHTML = `
                    <h2>${item.name}</h2>
                    <h3>${item.producer}</h3>
                    <p>${item.description}</p>
                    <h3>${money.format(item.price)}</h3>
                    <button class="add-to-cart">Add to Cart</button>
                `;
                div.querySelector('.add-to-cart').onclick = () => addToCart(item.name, item.price);
                container.appendChild(div);
            });
        });
}

/* =========================
   INITIALIZATION
========================= */

window.addEventListener('DOMContentLoaded', () => {
    buildNav();
    loadCart();
    loadProduce();

    // UI Listeners
    document.getElementById('cart')?.addEventListener('click', openCart);
    document.getElementById('close-cart')?.addEventListener('click', closeCart);
    document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
    
    // Form Listeners
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-content, .tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
            btn.classList.add('active');
        };
    });

    // Accessibility
    const accBtn = document.getElementById('accessibility-btn');
    const accPanel = document.getElementById('accessibility-panel');
    accBtn?.addEventListener('click', () => {
        accPanel.style.display = accPanel.style.display === 'block' ? 'none' : 'block';
    });

    let fontSize = 100;
    document.getElementById('increase-font')?.addEventListener('click', () => {
        fontSize += 10; document.body.style.fontSize = fontSize + '%';
    });
    document.getElementById('decrease-font')?.addEventListener('click', () => {
        fontSize -= 10; document.body.style.fontSize = fontSize + '%';
    });
});
