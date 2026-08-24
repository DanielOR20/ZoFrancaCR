/**
 * src/auth/auth.js
 * Estado global de autenticación + cliente de la API local (json-server).
 * La sesión se persiste en localStorage para sobrevivir a la navegación entre
 * páginas (multi-página sin SPA).
 */

const STORAGE_KEY = "zofrancacr_session";
const API_BASE = "http://127.0.0.1:3000";

export const API = {
  base: API_BASE,
  users: () => `${API_BASE}/users`,
};

/* ---------- Cliente HTTP ---------- */

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.message) || `Solicitud fallida (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/* ---------- Sesión global ---------- */

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

export function isAdmin() {
  const s = getSession();
  return !!s && s.role === "admin";
}

/* ---------- Autenticación ---------- */

/**
 * Valida credenciales contra db/users y comprueba el campo `status`.
 * Devuelve { ok } con un `code` concreto para renderizar mensajes claros:
 *  - invalid   -> credenciales incorrectas
 *  - pending   -> cuenta pendiente de aprobación
 *  - rejected  -> cuenta rechazada
 *  - ok        -> sesión persistida y devuelta
 */
export async function login(email, password) {
  const list = await request(`${API.users()}?email=${encodeURIComponent(normEmail(email))}`);
  const arr = Array.isArray(list) ? list : [];
  const user = arr.find((u) => normEmail(u.email) === normEmail(email));

  if (!user || user.password !== String(password)) {
    return { ok: false, code: "invalid" };
  }
  if (user.status === "rejected") return { ok: false, code: "rejected" };
  if (user.status !== "approved") return { ok: false, code: "pending" };

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
  saveSession(session);
  return { ok: true, session };
}

/**
 * Crea un usuario nuevo. Por seguridad, el `role` siempre es "user" y el
 * `status` siempre es "pending" hasta que un administrador lo apruebe.
 * Solo un administrador puede cambiar el rol desde el panel de usuarios.
 */
export async function register({ name, email, password }) {
  const existing = await listUsers(email);
  if (Array.isArray(existing) && existing.length) {
    return { ok: false, code: "duplicate" };
  }
  const created = await request(API.users(), {
    method: "POST",
    body: JSON.stringify({
      name,
      email: normEmail(email),
      password,
      role: "user",
      status: "pending",
    }),
  });
  return { ok: true, user: created };
}

/* ---------- Gestión de usuarios (admin) ---------- */

export function listUsers(email) {
  const q = email ? `?email=${encodeURIComponent(normEmail(email))}` : "";
  return request(`${API.users()}${q}`);
}

export async function fetchUser(id) {
  return request(`${API.users()}/${encodeURIComponent(id)}`);
}

export async function updateUserStatus(id, status) {
  return request(`${API.users()}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Actualiza el rol de un usuario. Solo debe ser llamado por un administrador.
 * Roles válidos: "admin", "user", "empresa".
 */
export async function updateUserRole(id, role) {
  const allowed = ["admin", "user", "empresa"];
  if (!allowed.includes(role)) throw new Error(`Rol no válido: ${role}`);
  return request(`${API.users()}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/* ---------- Utilidades de navegación ---------- */

/**
 * Resuelve la URL de una página teniendo en cuenta dónde se abrió la app:
 *  - Desde /src/login/  -> rutas relativas (../dashboard/dashboard.html)
 *  - Desde la raíz (/)  -> rutas absolutas (/src/dashboard/dashboard.html)
 */
const PAGE_FILES = {
  login: "login.html",
  dashboard: "dashboard.html",
  usuarios: "usuarios.html",
};
export function appUrl(page) {
  const file = PAGE_FILES[page] || `${page}.html`;
  const onLogin = /\/src\/login\//.test(window.location.pathname);
  if (onLogin) return `../${page}/${file}`;
  return `/src/${page}/${file}`;
}