/**
 * usuarios.js - Lógica de control y aprobación de usuarios
 */

(function () {
  'use strict';

  const API_URL = 'http://127.0.0.1:3000/users';

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

      tbody.innerHTML = '';
      users.forEach(u => {
        const tr = document.createElement('tr');
        const initials = String(u.name || u.email || '?').trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
        
        let statusBadge = '<span class="badge-status status-badge-pending">● Pendiente</span>';
        if (u.status === 'approved') statusBadge = '<span class="badge-status status-badge-approved">● Aprobado</span>';
        if (u.status === 'rejected') statusBadge = '<span class="badge-status status-badge-rejected">● Rechazado</span>';

        const roleMap = { admin: 'Administrador', user: 'Usuario', empresa: 'Empresa', colaborador: 'Colaborador' };
        const roleLabel = roleMap[u.role] || u.role || 'Usuario';

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
          <td><span style="font-weight: 600; font-size: 0.825rem; color: var(--navy-dark);">${roleLabel}</span></td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            ${u.status === 'pending' ? `
              <button class="btn-approve" data-id="${esc(u.id)}">Aprobar</button>
              <button class="btn-reject" data-id="${esc(u.id)}">Rechazar</button>
            ` : `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Sin acciones pendientes</span>`}
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Event listeners para botones
      tbody.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', () => updateUserStatus(btn.getAttribute('data-id'), 'approved'));
      });
      tbody.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', () => updateUserStatus(btn.getAttribute('data-id'), 'rejected'));
      });

    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem; color: #EF4444;">No se pudieron cargar los usuarios. Verifica que json-server esté activo en el puerto 3000.</td></tr>';
    }
  };

  const updateUserStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("Fallo al actualizar estado");
      loadUsers();
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      alert("No se pudo actualizar el estado del usuario en el servidor.");
    }
  };

  document.addEventListener('DOMContentLoaded', initUsuarios);
})();
