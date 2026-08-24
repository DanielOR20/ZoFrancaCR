/**
 * usuarios.js - Lógica de control, aprobación de usuarios y gestión de roles
 * Solo accesible para administradores.
 * 
 * Funcionalidades:
 * - Listar todos los usuarios registrados
 * - Aprobar / Rechazar cuentas pendientes
 * - Cambiar el rol de cualquier usuario (admin, usuario, empresa)
 */

(function () {
  'use strict';

  const API_URL = 'http://127.0.0.1:3000/users';

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Mapa de roles internos a labels de display
  const ROLE_MAP = { admin: 'Administrador', user: 'Usuario', empresa: 'Empresa' };
  const ROLE_OPTIONS = ['admin', 'user', 'empresa'];

  // Obtener sesión actual para saber si somos admin
  const getSession = () => {
    try {
      const raw = localStorage.getItem('zofrancacr_session');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const isAdmin = () => {
    const s = getSession();
    return !!s && s.role === 'admin';
  };

  const initUsuarios = () => {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadUsers);
    loadUsers();
  };

  const loadUsers = async () => {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem; color: var(--text-muted);">Cargando usuarios del servidor...</td></tr>';

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al consultar /users");
      const users = await res.json();

      if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem; color: var(--text-muted);">No hay usuarios registrados en el sistema.</td></tr>';
        return;
      }

      const currentSession = getSession();
      const currentUserId = currentSession ? String(currentSession.id) : null;

      tbody.innerHTML = '';
      users.forEach(u => {
        const tr = document.createElement('tr');
        const initials = String(u.name || u.email || '?').trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
        
        let statusBadge = '<span class="badge-status status-badge-pending">● Pendiente</span>';
        if (u.status === 'approved') statusBadge = '<span class="badge-status status-badge-approved">● Aprobado</span>';
        if (u.status === 'rejected') statusBadge = '<span class="badge-status status-badge-rejected">● Rechazado</span>';

        const roleLabel = ROLE_MAP[u.role] || u.role || 'Usuario';

        // ── Columna de Rol: select editable para admin, texto para otros ──
        let roleCell = '';
        const isSelf = String(u.id) === currentUserId;

        if (isAdmin() && !isSelf) {
          // Admin puede cambiar el rol de otros usuarios (no de sí mismo)
          const options = ROLE_OPTIONS.map(r => {
            const selected = r === u.role ? 'selected' : '';
            return `<option value="${r}" ${selected}>${esc(ROLE_MAP[r])}</option>`;
          }).join('');
          roleCell = `
            <select class="role-select" data-id="${esc(u.id)}" style="padding: 0.4rem 0.6rem; border: 1px solid var(--border-color, #D1D5DB); border-radius: 6px; font-family: inherit; font-size: 0.825rem; font-weight: 600; color: var(--navy-dark, #0F172A); background: #fff; cursor: pointer; outline: none; min-width: 130px;">
              ${options}
            </select>
          `;
        } else if (isSelf) {
          roleCell = `<span style="font-weight: 600; font-size: 0.825rem; color: var(--navy-dark);">${roleLabel} <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 400;">(tú)</span></span>`;
        } else {
          roleCell = `<span style="font-weight: 600; font-size: 0.825rem; color: var(--navy-dark);">${roleLabel}</span>`;
        }

        // ── Columna de Acciones ──
        let actionsCell = '';
        if (u.status === 'pending') {
          actionsCell = `
            <button class="btn-approve" data-id="${esc(u.id)}">Aprobar</button>
            <button class="btn-reject" data-id="${esc(u.id)}">Rechazar</button>
          `;
        } else {
          actionsCell = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Sin acciones pendientes</span>`;
        }

        tr.innerHTML = `
          <td>
            <div class="company-name-cell">
              <div class="user-avatar-sm">${esc(initials)}</div>
              <div>
                <strong style="color: var(--text-main); font-weight: 600;">${esc(u.name || 'Sin nombre')}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${esc(u.id)}</div>
              </div>
            </div>
          </td>
          <td>${esc(u.email)}</td>
          <td>${roleCell}</td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">${actionsCell}</td>
        `;
        tbody.appendChild(tr);
      });

      // ── Event listeners para botones de aprobar/rechazar ──
      tbody.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', () => updateUserStatus(btn.getAttribute('data-id'), 'approved'));
      });
      tbody.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', () => updateUserStatus(btn.getAttribute('data-id'), 'rejected'));
      });

      // ── Event listeners para selects de cambio de rol ──
      tbody.querySelectorAll('.role-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const userId = e.target.getAttribute('data-id');
          const newRole = e.target.value;
          updateUserRole(userId, newRole);
        });
      });

    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem; color: #EF4444;">No se pudieron cargar los usuarios. Verifica que json-server esté activo en el puerto 3000.</td></tr>';
    }
  };

  /**
   * Actualiza el estado de un usuario (approved/rejected)
   */
  const updateUserStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("Fallo al actualizar estado");
      showToast(status === 'approved' ? 'Usuario aprobado exitosamente.' : 'Usuario rechazado.', status !== 'approved');
      loadUsers();
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      showToast('No se pudo actualizar el estado del usuario.', true);
    }
  };

  /**
   * Actualiza el rol de un usuario (admin/user/empresa)
   * Solo disponible para administradores.
   */
  const updateUserRole = async (id, role) => {
    const allowed = ['admin', 'user', 'empresa'];
    if (!allowed.includes(role)) {
      showToast('Rol no válido.', true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      if (!res.ok) throw new Error("Fallo al cambiar rol");
      showToast(`Rol actualizado a "${ROLE_MAP[role] || role}" exitosamente.`, false);
    } catch (err) {
      console.error("Error cambiando rol:", err);
      showToast('No se pudo cambiar el rol del usuario.', true);
      loadUsers(); // Revertir visualmente
    }
  };

  /**
   * Muestra una notificación toast corporativa
   */
  const showToast = (message, isError = false) => {
    const existing = document.querySelector('.usuarios-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'usuarios-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 10000;
      background: ${isError ? '#FEF2F2' : '#F0FDF4'};
      color: ${isError ? '#991B1B' : '#166534'};
      border: 1px solid ${isError ? '#FCA5A5' : '#86EFAC'};
      border-radius: 10px;
      padding: 0.85rem 1.25rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      max-width: 420px;
    `;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
        ${isError 
          ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' 
          : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'}
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  document.addEventListener('DOMContentLoaded', initUsuarios);
})();
