/**
 * ZoFrancaCR — inicio.js
 * Módulo Vanilla JS para Interacciones Corporativas y Rendimiento
 * 
 * Funcionalidades:
 * 1. IntersectionObserver para Scroll Reveal suave (fade-in + translateY)
 * 2. Contador numérico nativo de alta precisión con Easing Cúbico
 * 3. Header dinámico con cambio de estado al scroll
 * 4. Barra de progreso de lectura proporcional
 * 5. Menú de navegación responsive con accesibilidad (ARIA + Escape)
 * 6. Detección activa de sección en navegación
 */

(function () {
  'use strict';

  // Configuración global del módulo
  const CONFIG = {
    scrollThreshold: 40,
    counterDuration: 1500, // ms
    revealThreshold: 0.15,
    statsThreshold: 0.25,
  };

  /**
   * Inicializador principal al cargar el DOM
   */
  const init = () => {
    initScrollProgress();
    initHeaderScroll();
    initScrollReveal();
    initStatsCounter();
    initMobileNavigation();
    initActiveNavTracking();
    initLoginModal();
  };

  /**
   * 0. Lógica de Login y Registro de la Plataforma (JSON-Server)
   * Usa el módulo auth.js para autenticación contra db.json/users
   */
  const API_BASE = 'http://127.0.0.1:3000';

  const MESSAGES = {
    invalid: 'Correo o contraseña incorrectos.',
    pending: 'Tu cuenta está pendiente de aprobación por el administrador.',
    rejected: 'Tu cuenta ha sido rechazada por el administrador.',
    duplicate: 'Ya existe una cuenta con ese correo electrónico.',
  };

  const initLoginModal = () => {
    const loginModal = document.getElementById('loginModal');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const btnCloseLogin = document.getElementById('btnCloseLogin');
    const formLoginAdmin = document.getElementById('formLoginAdmin');
    const formRegisterUser = document.getElementById('formRegisterUser');
    const loginError = document.getElementById('loginError');
    const tabBtnLogin = document.getElementById('tabBtnLogin');
    const tabBtnRegister = document.getElementById('tabBtnRegister');

    const showError = (msg) => {
      if (loginError) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
      }
    };

    const hideError = () => {
      if (loginError) loginError.style.display = 'none';
    };

    const openModal = (e) => {
      if (e) e.preventDefault();
      loginModal.style.display = 'flex';
      loginModal.classList.remove('hidden');
      loginModal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
      loginModal.style.display = 'none';
      loginModal.classList.add('hidden');
      loginModal.setAttribute('aria-hidden', 'true');
      hideError();
      if (formLoginAdmin) formLoginAdmin.reset();
      if (formRegisterUser) formRegisterUser.reset();
    };

    if (headerLoginBtn) headerLoginBtn.addEventListener('click', openModal);
    if (heroLoginBtn) heroLoginBtn.addEventListener('click', openModal);
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', openModal);
    if (btnCloseLogin) btnCloseLogin.addEventListener('click', closeModal);
    
    // Cerrar si se da click afuera
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeModal();
    });

    // Pestañas
    if (tabBtnLogin && tabBtnRegister) {
      tabBtnLogin.addEventListener('click', () => {
        tabBtnLogin.style.background = '#fff';
        tabBtnLogin.style.color = 'var(--navy-dark)';
        tabBtnLogin.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        tabBtnRegister.style.background = 'transparent';
        tabBtnRegister.style.color = 'var(--text-muted)';
        tabBtnRegister.style.boxShadow = 'none';
        if (formLoginAdmin) formLoginAdmin.style.display = 'block';
        if (formRegisterUser) formRegisterUser.style.display = 'none';
        hideError();
      });

      tabBtnRegister.addEventListener('click', () => {
        tabBtnRegister.style.background = '#fff';
        tabBtnRegister.style.color = 'var(--navy-dark)';
        tabBtnRegister.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        tabBtnLogin.style.background = 'transparent';
        tabBtnLogin.style.color = 'var(--text-muted)';
        tabBtnLogin.style.boxShadow = 'none';
        if (formLoginAdmin) formLoginAdmin.style.display = 'none';
        if (formRegisterUser) formRegisterUser.style.display = 'block';
        hideError();
      });
    }

    // ---- Submit Login ----
    // Autentica contra db.json/users vía json-server
    if (formLoginAdmin) {
      formLoginAdmin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('loginUsername').value.trim().toLowerCase();
        const pass = document.getElementById('loginPassword').value;
        const btn = document.getElementById('btnLoginSubmit');

        if (!emailInput || !pass) {
          showError('Ingresa tu correo y tu contraseña.');
          return;
        }

        btn.textContent = 'Autenticando...';
        btn.disabled = true;
        hideError();

        try {
          // Buscar usuario en la tabla /users de db.json
          const res = await fetch(`${API_BASE}/users?email=${encodeURIComponent(emailInput)}`);
          if (!res.ok) throw new Error('Error conectando con el servidor.');
          const users = await res.json();
          const user = Array.isArray(users)
            ? users.find(u => u.email && u.email.toLowerCase() === emailInput)
            : null;

          if (!user || user.password !== pass) {
            showError(MESSAGES.invalid);
            btn.textContent = 'Ingresar al Panel';
            btn.disabled = false;
            return;
          }

          if (user.status === 'rejected') {
            showError(MESSAGES.rejected);
            btn.textContent = 'Ingresar al Panel';
            btn.disabled = false;
            return;
          }

          if (user.status !== 'approved') {
            showError(MESSAGES.pending);
            btn.textContent = 'Ingresar al Panel';
            btn.disabled = false;
            return;
          }

          // Sesión válida — guardar en localStorage con clave unificada
          const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          };
          localStorage.setItem('zofrancacr_session', JSON.stringify(session));

          // Redirigir al Dashboard corporativo
          window.location.href = '/src/dashboard/dashboard.html';

        } catch (error) {
          console.error('Error en login:', error);
          showError(error.message || 'Error conectando con el servidor. Verifica que json-server esté activo en el puerto 3000.');
          btn.textContent = 'Ingresar al Panel';
          btn.disabled = false;
        }
      });
    }

    // ---- Submit Registro ----
    // Crea usuario nuevo en db.json/users vía json-server (status: pending)
    if (formRegisterUser) {
      formRegisterUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPassword').value;
        const btn = document.getElementById('btnRegSubmit');

        if (!name || !email || !password) {
          showError('Completa todos los campos.');
          return;
        }

        if (password.length < 6) {
          showError('La contraseña debe tener al menos 6 caracteres.');
          return;
        }

        btn.textContent = 'Registrando...';
        btn.disabled = true;
        hideError();

        try {
          // Verificar si ya existe en db.json/users
          const check = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
          const existing = await check.json();
          if (Array.isArray(existing) && existing.length > 0) {
            showError(MESSAGES.duplicate);
            btn.textContent = 'Registrar Cuenta';
            btn.disabled = false;
            return;
          }

          // Crear usuario en db.json vía json-server POST — siempre rol "user"
          const postRes = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              password,
              role: 'user',
              status: 'pending',
            }),
          });

          if (!postRes.ok) throw new Error('Error al guardar en el servidor.');

          alert(`¡Cuenta registrada exitosamente para ${name}!\nQuedará pendiente de aprobación por el Administrador.`);
          formRegisterUser.reset();
          tabBtnLogin.click();
        } catch (err) {
          console.error('Error al registrar:', err);
          showError(err.message || 'Error al procesar el registro.');
        } finally {
          btn.textContent = 'Registrar Cuenta';
          btn.disabled = false;
        }
      });
    }
  };

  /**
   * 1. Barra de Progreso de Lectura
   */
  const initScrollProgress = () => {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    let ticking = false;

    const updateProgress = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / scrollTotal) * 100));
        progressBar.style.width = `${progress}%`;
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  };

  /**
   * 2. Header dinámico con scroll
   */
  const initHeaderScroll = () => {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let isScrolled = false;

    const checkScroll = () => {
      const shouldBeScrolled = window.scrollY > CONFIG.scrollThreshold;
      if (shouldBeScrolled !== isScrolled) {
        isScrolled = shouldBeScrolled;
        header.classList.toggle('is-scrolled', isScrolled);
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll(); // Comprobar estado inicial
  };

  /**
   * 3. IntersectionObserver para Revelación Suave en Scroll
   */
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length || !('IntersectionObserver' in window)) {
      // Fallback para navegadores sin soporte
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-delay');

          if (delay) {
            setTimeout(() => {
              el.classList.add('is-revealed');
            }, parseInt(delay, 10));
          } else {
            el.classList.add('is-revealed');
          }

          observer.unobserve(el);
        }
      });
    }, {
      root: null,
      threshold: CONFIG.revealThreshold,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  };

  /**
   * 4. Contador Numérico Nativo (Impacto en Cifras)
   */
  const initStatsCounter = () => {
    const statsSection = document.getElementById('estadisticas');
    if (!statsSection) return;

    const counterElements = statsSection.querySelectorAll('.kpi-counter');
    if (!counterElements.length) return;

    let hasAnimated = false;

    /**
     * Anima un contador individual usando requestAnimationFrame y easing cúbico
     * @param {HTMLElement} element 
     */
    const animateSingleCounter = (element) => {
      const target = parseInt(element.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      const duration = CONFIG.counterDuration;
      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing cúbico (easeOutCubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(easeOut * target);

        element.textContent = currentVal.toLocaleString('es-CR');

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = target.toLocaleString('es-CR');
        }
      };

      window.requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            counterElements.forEach(animateSingleCounter);
            observer.unobserve(statsSection);
          }
        });
      }, {
        threshold: CONFIG.statsThreshold
      });

      statsObserver.observe(statsSection);
    } else {
      // Fallback sin observer
      counterElements.forEach(animateSingleCounter);
    }
  };

  /**
   * 5. Menú de Navegación Responsive Accesible
   */
  const initMobileNavigation = () => {
    const toggleBtn = document.getElementById('navToggleBtn');
    const drawer = document.getElementById('mobileNavigation');
    if (!toggleBtn || !drawer) return;

    const toggleMenu = (shouldOpen) => {
      const isOpen = typeof shouldOpen === 'boolean' ? shouldOpen : !drawer.classList.contains('is-open');

      drawer.classList.toggle('is-open', isOpen);
      toggleBtn.classList.toggle('is-open', isOpen);

      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      drawer.setAttribute('aria-hidden', String(!isOpen));

      // Bloquear scroll del fondo cuando el drawer está activo
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    toggleBtn.addEventListener('click', () => toggleMenu());

    // Cerrar al hacer clic en cualquier enlace interno
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Accesibilidad: Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    });
  };

  /**
   * 6. Tracking de Sección Activa en el Menú
   */
  const initActiveNavTracking = () => {
    const sections = document.querySelectorAll('main > section, footer');
    const navAnchors = document.querySelectorAll('.main-navigation .nav-anchor');
    if (!sections.length || !navAnchors.length) return;

    const updateActiveSection = () => {
      let activeId = 'inicio';
      const scrollPos = window.scrollY + 160;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          activeId = section.getAttribute('id') || activeId;
        }
      });

      navAnchors.forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href === `#${activeId}`) {
          anchor.classList.add('is-active');
        } else {
          anchor.classList.remove('is-active');
        }
      });
    };

    window.addEventListener('scroll', updateActiveSection, { passive: true });
  };

  // Inicialización cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
