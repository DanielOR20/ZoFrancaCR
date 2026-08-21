import { listUsers, getSession, clearSession, appUrl, updateUserStatus } from "../auth/auth.js";

const STATUS_META = {
  pending:  { label: "Pendiente", cls: "st-pending" },
  approved: { label: "Aprobado",  cls: "st-approved" },
  rejected: { label: "Rechazado", cls: "st-rejected" },
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

async function boot() {
  const session = getSession();
  if (!session) { clearSession(); window.location.href = appUrl("login"); return; }
  if (session.role !== "admin") { window.location.href = appUrl("dashboard"); return; }
  const n = document.getElementById("headerUserName"); if (n) n.textContent = session.name || "Usuario";
  const r = document.getElementById("headerUserRole"); if (r) r.textContent = "Administrador General";
  document.getElementById("logoutBtn")?.addEventListener("click", () => clearSession());
  document.getElementById("refreshBtn")?.addEventListener("click", () => loadUsers());
  await loadUsers();
  const sk = document.getElementById("bootSkeleton"); if (sk) sk.classList.add("is-hidden");
  const c = document.getElementById("appContent"); if (c) c.classList.add("is-ready");
  if (window.lucide) lucide.createIcons();
}

async function loadUsers() {
  const tbody = document.getElementById("usersBody");
  tbody.innerHTML = `<tr><td colspan="5" class="p-4 empty text-center text-slate-400">Cargando usuarios&#8230;</td></tr>`;
  try {
    const users = await listUsers();
    if (!users || !users.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 empty text-center text-slate-400">No hay usuarios registrados.</td></tr>`;
      return;
    }
    tbody.innerHTML = "";
    users.forEach((u) => tbody.appendChild(buildRow(u)));
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 empty text-center text-rose-500">No se pudieron cargar los usuarios. Verifica que json-server esté activo.</td></tr>`;
  }
}

function buildRow(u) {
  const tr = document.createElement("tr");
  const initials = String(u.name || "? ").trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const st = STATUS_META[u.status] || STATUS_META.pending;
  const role = u.role === "admin" ? "Administrador" : "Usuario";
  tr.innerHTML = `
    <td class="p-3"><div class="flex items-center gap-2.5"><div class="avatar">${esc(initials)}</div><span class="font-semibold">${esc(u.name)}</span></div></td>
    <td class="p-3">${esc(u.email)}</td>
    <td class="p-3"><span class="role-badge">${role}</span></td>
    <td class="p-3"><span class="status-badge ${st.cls}">● ${st.label}</span></td>`;
  const tdActions = document.createElement("td");
  tdActions.className = "p-3";
  if (u.status === "pending") {
    const wrap = document.createElement("div");
    wrap.className = "row-actions";
    wrap.appendChild(button("Aprobar", "act-approve", () => act(u.id, "approved")));
    wrap.appendChild(button("Rechazar", "act-reject", () => act(u.id, "rejected")));
    tdActions.appendChild(wrap);
  } else {
    tdActions.innerHTML = `<span class="muted">—</span>`;
  }
  tr.appendChild(tdActions);
  return tr;
}

function button(label, cls, fn) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "app-button " + cls; b.textContent = label;
  b.addEventListener("click", fn);
  return b;
}

async function act(id, status) {
  try { await updateUserStatus(id, status); }
  catch (err) { console.error(err); alert("No se pudo actualizar el usuario."); }
  await loadUsers();
}

document.addEventListener("DOMContentLoaded", boot);
