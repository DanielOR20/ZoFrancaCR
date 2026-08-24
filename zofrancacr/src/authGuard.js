/**
 * authGuard.js
 * Script global para asegurar que sólo usuarios logueados accedan a las páginas administrativas.
 * Implementa control de acceso basado en roles (RBAC):
 *   - admin:   acceso total a todos los módulos
 *   - empresa: dashboard, empresas (solo lectura), solicitudes
 *   - user:    solo dashboard
 * 
 * Inyecta dinámicamente el nombre de usuario, rol y botón de cerrar sesión.
 * Oculta ítems del sidebar según el rol del usuario autenticado.
 */

(function() {
  'use strict';
  
  // ─────────────────────────────────────────────
  // 1. Verificación de Sesión (Ejecución Inmediata)
  // ─────────────────────────────────────────────
  const sessionString = localStorage.getItem('zofrancacr_session');
  
  const currentPath = window.location.pathname.toLowerCase();
  const isPublicPage = currentPath.endsWith('/') || 
                       currentPath.endsWith('index.html') || 
                       currentPath.includes('/inicio/inicio.html') ||
                       currentPath.includes('/login/login.html');

  if (!sessionString && !isPublicPage) {
    window.location.href = '/index.html';
    return;
  }

  // ─────────────────────────────────────────────
  // 2. Mapa de Permisos por Rol
  // ─────────────────────────────────────────────
  // Cada clave es un fragmento de ruta; el valor es un array de roles permitidos.
  const ROLE_PERMISSIONS = {
    '/dashboard/':     ['admin', 'user', 'empresa'],
    '/empresas/':      ['admin', 'empresa'],
    '/solicitudes/':   ['admin', 'empresa'],
    '/usuarios/':      ['admin'],
    '/reportes/':      ['admin'],
    '/documents/':     ['admin'],
    '/empleados/':     ['admin', 'empresa'],
  };

  // Mapeo de fragmentos de ruta a labels del sidebar para ocultar
  const SIDEBAR_LABELS = {
    '/dashboard/':     'Dashboard',
    '/empresas/':      'Empresas',
    '/solicitudes/':   'Solicitudes',
    '/usuarios/':      'Usuarios',
    '/reportes/':      'Reportes',
    '/documents/':     'Documentos',
    '/empleados/':     'Empleados',
  };

  // ─────────────────────────────────────────────
  // 3. Control de Acceso por Rol
  // ─────────────────────────────────────────────
  if (sessionString && !isPublicPage) {
    try {
      const userData = JSON.parse(sessionString);
      const userRole = userData.role || 'user';

      // Buscar si la ruta actual coincide con algún módulo restringido
      let accessAllowed = true;
      for (const [routeFragment, allowedRoles] of Object.entries(ROLE_PERMISSIONS)) {
        if (currentPath.includes(routeFragment)) {
          if (!allowedRoles.includes(userRole)) {
            accessAllowed = false;
          }
          break;
        }
      }

      if (!accessAllowed) {
        // Redirigir al dashboard con notificación
        sessionStorage.setItem('zofrancacr_access_denied', 'true');
        window.location.href = '/src/dashboard/dashboard.html';
        return;
      }
    } catch (err) {
      console.error("Error verificando permisos de rol:", err);
    }
  }

  // ─────────────────────────────────────────────
  // 4. Inyección Dinámica de Perfil, Logout y Sidebar
  // ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Mostrar notificación de acceso denegado si fue redirigido
    if (sessionStorage.getItem('zofrancacr_access_denied')) {
      sessionStorage.removeItem('zofrancacr_access_denied');
      showAccessDeniedToast();
    }

    if (sessionString) {
      try {
        const userData = JSON.parse(sessionString);
        const userRole = userData.role || 'user';
        
        // Actualizar nombres y roles en cualquier header del panel
        const nameElements = document.querySelectorAll('.user-name, #headerUserName');
        const roleElements = document.querySelectorAll('.user-role, #headerUserRole');
        
        const displayName = userData.nombre || userData.name || userData.usuario || 'Usuario';
        const ROLE_DISPLAY = {
          admin: 'Administrador General',
          user: 'Usuario',
          empresa: 'Empresa',
        };
        const roleDisplay = ROLE_DISPLAY[userRole] || userRole;

        nameElements.forEach(el => el.textContent = displayName);
        roleElements.forEach(el => el.textContent = roleDisplay);
        
        // ── Configurar botón de logout ──
        const existingLogout = document.getElementById('logoutBtn');
        if (existingLogout) {
          existingLogout.addEventListener('click', (e) => {
            e.preventDefault();
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
              localStorage.removeItem('zofrancacr_session');
              window.location.href = '/index.html';
            });
            
            container.appendChild(btnLogout);
          }
        });

        // ── Ocultar ítems del Sidebar según rol ──
        hideSidebarByRole(userRole);

      } catch (err) {
        console.error("Error leyendo objeto de sesión:", err);
      }
    }
  });

  // ─────────────────────────────────────────────
  // 5. Funciones Auxiliares
  // ─────────────────────────────────────────────

  /**
   * Oculta los elementos del sidebar que el usuario no tiene permiso de ver.
   */
  function hideSidebarByRole(role) {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link, .nav-menu .nav-link');
    
    sidebarLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      
      for (const [routeFragment, allowedRoles] of Object.entries(ROLE_PERMISSIONS)) {
        if (href.includes(routeFragment.replace(/\//g, ''))) {
          if (!allowedRoles.includes(role)) {
            // Ocultar el <li> padre completo
            const li = link.closest('li') || link.closest('.nav-item');
            if (li) {
              li.style.display = 'none';
            }
          }
          break;
        }
      }
    });
  }

  /**
   * Muestra una notificación flotante cuando el acceso es denegado.
   */
  function showAccessDeniedToast() {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 10000;
      background: #FEF2F2;
      color: #991B1B;
      border: 1px solid #FCA5A5;
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
      animation: slideInRight 0.35s ease;
    `;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>No tienes permisos para acceder a ese módulo. Contacta al administrador para cambiar tu rol.</span>
    `;

    // Inyectar animación CSS
    if (!document.getElementById('authGuardToastStyle')) {
      const style = document.createElement('style');
      style.id = 'authGuardToastStyle';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }

})();
