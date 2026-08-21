import { getSession, fetchUser, clearSession, appUrl } from "../auth/auth.js";

function showSkeleton(show) {
  const el = document.getElementById("bootSkeleton");
  if (el) el.classList.toggle("is-hidden", !show);
}

function reveal() {
  showSkeleton(false);
  const content = document.getElementById("appContent");
  if (content) content.classList.add("is-ready");
}

function renderHeader(u) {
  const nameEl = document.getElementById("headerUserName");
  const roleEl = document.getElementById("headerUserRole");
  const navUsers = document.getElementById("navUsers");
  const roleMap = { admin: "Administrador General", user: "Usuario" };
  if (nameEl) nameEl.textContent = u.name || "Usuario";
  if (roleEl) roleEl.textContent = roleMap[u.role] || u.role;
  if (navUsers) navUsers.style.display = u.role === "admin" ? "" : "none";
}

async function boot() {
  const session = getSession();
  if (!session) { clearSession(); window.location.href = appUrl("login"); return; }
  try {
    const fresh = await fetchUser(session.id);
    if (!fresh || fresh.status !== "approved") {
      clearSession();
      window.location.href = appUrl("login");
      return;
    }
    renderHeader(fresh);
  } catch (err) {
    console.warn("No se pudo verificar la sesión en el servidor", err);
    renderHeader(session);
  }
  document.getElementById("logoutBtn")?.addEventListener("click", () => clearSession());
  reveal();
  if (window.lucide) lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", boot);
