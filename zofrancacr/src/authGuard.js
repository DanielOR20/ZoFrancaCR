/**
 * authGuard.js
 * Script global para asegurar que sólo usuarios logueados accedan a las páginas administrativas.
 * Inyecta dinámicamente el nombre de usuario, rol y botón de cerrar sesión.
 */

(function() {
  'use strict';
  
  // 1. Verificación de Rutas (Ejecución Inmediata)
  const sessionString = localStorage.getItem('zofranca_session') || localStorage.getItem('zofrancacr_session');
  
  // Determinar si estamos en el index/inicio o en el portal público
  const currentPath = window.location.pathname.toLowerCase();
  const isPublicPage = currentPath.endsWith('/') || 
                       currentPath.endsWith('index.html') || 
                       currentPath.includes('/inicio/inicio.html') ||
                       currentPath.includes('/login/login.html');

  if (!sessionString && !isPublicPage) {
    // Redirigir al inicio público si no hay sesión
    window.location.href = '/index.html';
    return;
  }

  // 2. Inyección Dinámica de Perfil y Logout
  document.addEventListener('DOMContentLoaded', () => {
    if (sessionString) {
      try {
        const userData = JSON.parse(sessionString);
        
        // Actualizar nombres y roles en cualquier header del panel
        const nameElements = document.querySelectorAll('.user-name, #headerUserName');
        const roleElements = document.querySelectorAll('.user-role, #headerUserRole');
        
        const displayName = userData.nombre || userData.name || userData.usuario || 'Administrador';
        let roleDisplay = userData.rol || userData.role || 'Administrador';
        if (roleDisplay === 'administrador' || roleDisplay === 'admin') {
          roleDisplay = 'Administrador General';
        }

        nameElements.forEach(el => el.textContent = displayName);
        roleElements.forEach(el => el.textContent = roleDisplay);
        
        // Configurar botón de logout existente o inyectarlo
        const existingLogout = document.getElementById('logoutBtn');
        if (existingLogout) {
          existingLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('zofranca_session');
            localStorage.removeItem('zofrancacr_session');
            window.location.href = '/index.html';
          });
        }

        const profileContainers = document.querySelectorAll('.user-profile, .topbar-user-area');
        profileContainers.forEach(container => {
          if (!container.querySelector('.btn-logout-injected') && !container.querySelector('#logoutBtn')) {
            const btnLogout = document.createElement('button');
            btnLogout.className = 'btn-icon btn-logout-injected';
            btnLogout.title = 'Cerrar Sesión';
            btnLogout.style.marginLeft = '0.75rem';
            btnLogout.style.cursor = 'pointer';
            btnLogout.style.border = 'none';
            btnLogout.style.background = 'transparent';
            btnLogout.style.display = 'flex';
            btnLogout.style.alignItems = 'center';
            btnLogout.innerHTML = `
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            `;
            
            btnLogout.addEventListener('click', () => {
              localStorage.removeItem('zofranca_session');
              localStorage.removeItem('zofrancacr_session');
              window.location.href = '/index.html';
            });
            
            container.appendChild(btnLogout);
          }
        });
      } catch (err) {
        console.error("Error leyendo objeto de sesión:", err);
      }
    }
  });
})();
