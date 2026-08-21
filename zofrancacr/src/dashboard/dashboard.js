/**
 * dashboard.js - Lógica y Métricas del Panel Principal
 */

(function () {
  'use strict';

  const API_BASE = 'http://127.0.0.1:3000';

  const initDashboard = async () => {
    await loadMetrics();
    await loadRecentCompanies();
  };

  /**
   * Carga métricas consolidadas desde json-server
   */
  const loadMetrics = async () => {
    try {
      // 1. Empresas
      const resEmp = await fetch(`${API_BASE}/empresas`);
      const empresas = resEmp.ok ? await resEmp.json() : [];

      const kpiEmpresas = document.getElementById('kpiEmpresas');
      const kpiEmpleos = document.getElementById('kpiEmpleos');

      if (kpiEmpresas) kpiEmpresas.textContent = empresas.length;

      const totalEmpleos = empresas.reduce((acc, curr) => acc + (Number(curr.employees) || 0), 0);
      if (kpiEmpleos) kpiEmpleos.textContent = totalEmpleos.toLocaleString('es-CR');

      // 2. Solicitudes
      const resSol = await fetch(`${API_BASE}/solicitudes_instalacion`);
      const solicitudes = resSol.ok ? await resSol.json() : [];
      const kpiSolicitudes = document.getElementById('kpiSolicitudes');
      if (kpiSolicitudes) kpiSolicitudes.textContent = solicitudes.length;

      // 3. Usuarios pendientes
      const resUsers = await fetch(`${API_BASE}/users`);
      const users = resUsers.ok ? await resUsers.json() : [];
      const pendingUsers = users.filter(u => u.status === 'pending');
      const kpiUsuariosPend = document.getElementById('kpiUsuariosPend');
      if (kpiUsuariosPend) kpiUsuariosPend.textContent = pendingUsers.length;

    } catch (err) {
      console.warn("No se pudieron cargar todas las métricas de db.json:", err);
      // Fallback visual
      const kpiEmpresas = document.getElementById('kpiEmpresas');
      if (kpiEmpresas && kpiEmpresas.textContent === '--') kpiEmpresas.textContent = '6';
    }
  };

  /**
   * Carga la tabla de empresas recientes
   */
  const loadRecentCompanies = async () => {
    const tbody = document.getElementById('dashCompaniesTableBody');
    if (!tbody) return;

    try {
      const res = await fetch(`${API_BASE}/empresas`);
      const empresas = res.ok ? await res.json() : [];

      if (!empresas || empresas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">No hay empresas registradas aún.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      empresas.slice(0, 5).forEach(emp => {
        const tr = document.createElement('tr');
        const badgeClass = emp.status === 'Activo' ? 'badge-status-active' : 'badge-status-inactive';
        
        tr.innerHTML = `
          <td>
            <div class="company-name-cell">
              <div class="company-avatar">${emp.avatar || emp.name.charAt(0)}</div>
              <div>
                <strong style="color: var(--text-main); font-weight: 600;">${emp.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.id}</div>
              </div>
            </div>
          </td>
          <td>${emp.sector}</td>
          <td>${emp.location}</td>
          <td><span class="badge-status ${badgeClass}">● ${emp.status}</span></td>
          <td><strong>${emp.employees}</strong></td>
          <td>
            <a href="/src/empresas/verempresas/verempresas.html?id=${emp.id}" class="btn-action-icon" title="Ver detalles" style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; background: #F1F5F9; color: var(--navy-dark); text-decoration: none;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </a>
          </td>
        `;
        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error("Error al cargar empresas recientes:", err);
      tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: #EF4444;">Error al consultar el servidor local (json-server).</td></tr>';
    }
  };

  document.addEventListener('DOMContentLoaded', initDashboard);
})();
