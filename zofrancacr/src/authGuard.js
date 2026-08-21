/**
 * authGuard.js
 * Script global para asegurar que sólo usuarios logueados accedan al panel.
 * También inyecta dinámicamente el nombre de usuario y botón de cerrar sesión.
 */

(function() {
  'use strict';
  
  // 1. Verificación de Rutas (Ejecución Inmediata)
  const sessionString = localStorage.getItem('zofranca_session');
  
  // Determinar si estamos en el index/inicio
  const currentPath = window.location.pathname.toLowerCase();
  const isInInicio = currentPath.includes('/inicio/inicio.html') || currentPath.endsWith('index.html') || currentPath === '/';

  if (!sessionString && !isInInicio) {
    // Expulsar al usuario si no hay sesión y no está en la página principal
    window.location.href = '../inicio/inicio.html';
    return;
  }

  // 2. Inyección Dinámica de Perfil (Al cargar el DOM)
  document.addEventListener('DOMContentLoaded', () => {
    if (sessionString) {
      try {
        const userData = JSON.parse(sessionString);
        
        // Actualizar nombres y roles en cualquier header del panel
        const nameElements = document.querySelectorAll('.user-name');
        const roleElements = document.querySelectorAll('.user-role');
        
        nameElements.forEach(el => el.textContent = userData.nombre || userData.usuario);
        roleElements.forEach(el => {
          let roleDisplay = userData.rol;
          if (userData.rol === 'administrador') roleDisplay = 'Administrador General';
          el.textContent = roleDisplay;
        });
        
        // Buscar el contenedor del perfil para añadir botón Logout
        const profileContainers = document.querySelectorAll('.user-profile');
        
        profileContainers.forEach(container => {
          if (!container.querySelector('.btn-logout')) {
            const btnLogout = document.createElement('button');
            btnLogout.className = 'btn-icon btn-logout';
            btnLogout.title = 'Cerrar Sesión';
            btnLogout.style.marginLeft = '0.5rem';
            btnLogout.style.cursor = 'pointer';
            btnLogout.style.border = 'none';
            btnLogout.style.background = 'transparent';
            btnLogout.innerHTML = `
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            `;
            
            btnLogout.addEventListener('click', () => {
              localStorage.removeItem('zofranca_session');
              window.location.href = '../inicio/inicio.html';
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
