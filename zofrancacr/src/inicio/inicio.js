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
   */
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
      if (loginError) loginError.style.display = 'none';
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
        if (loginError) loginError.style.display = 'none';
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
        if (loginError) loginError.style.display = 'none';
      });
    }

    // Submit Login
    if (formLoginAdmin) {
      formLoginAdmin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userOrEmail = document.getElementById('loginUsername').value.trim();
        const pass = document.getElementById('loginPassword').value;
        const btn = document.getElementById('btnLoginSubmit');
        btn.textContent = 'Autenticando...';
        btn.disabled = true;
        if (loginError) loginError.style.display = 'none';

        try {
          // 1. Intentar en tabla /usuarios
          let res = await fetch(`http://127.0.0.1:3000/usuarios?usuario=${encodeURIComponent(userOrEmail)}&password=${encodeURIComponent(pass)}`);
          let data = await res.json();
          
          let authenticatedUser = null;

          if (data && data.length > 0) {
            authenticatedUser = {
              id: data[0].id,
              name: data[0].nombre || data[0].usuario,
              email: data[0].usuario + '@zofranca.cr',
              role: data[0].rol === 'administrador' ? 'admin' : data[0].rol,
              status: 'approved'
            };
          } else {
            // 2. Intentar en tabla /users
            let resUsers = await fetch(`http://127.0.0.1:3000/users?email=${encodeURIComponent(userOrEmail.toLowerCase())}&password=${encodeURIComponent(pass)}`);
            let dataUsers = await resUsers.json();
            if (dataUsers && dataUsers.length > 0) {
              if (dataUsers[0].status === 'rejected') {
                throw new Error("Esta cuenta ha sido rechazada por el administrador.");
              }
              authenticatedUser = dataUsers[0];
            }
          }

          if (authenticatedUser) {
            // Guardar ambas llaves para compatibilidad
            localStorage.setItem('zofranca_session', JSON.stringify({
              id: authenticatedUser.id,
              usuario: authenticatedUser.name || authenticatedUser.email,
              nombre: authenticatedUser.name || authenticatedUser.email,
              rol: authenticatedUser.role === 'admin' ? 'administrador' : authenticatedUser.role,
              role: authenticatedUser.role
            }));
            localStorage.setItem('zofrancacr_session', JSON.stringify(authenticatedUser));

            // Redirigir al Dashboard corporativo
            window.location.href = '/src/dashboard/dashboard.html';
          } else {
            if (loginError) {
              loginError.textContent = 'Usuario o contraseña incorrectos.';
              loginError.style.display = 'block';
            }
            btn.textContent = 'Ingresar al Panel';
            btn.disabled = false;
          }
        } catch (error) {
          console.error("Error en login:", error);
          if (loginError) {
            loginError.textContent = error.message || 'Error conectando con el servidor. Verifica que json-server esté activo en el puerto 3000.';
            loginError.style.display = 'block';
          }
          btn.textContent = 'Ingresar al Panel';
          btn.disabled = false;
        }
      });
    }

    // Submit Registro
    if (formRegisterUser) {
      formRegisterUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const role = document.getElementById('regRole').value;
        const password = document.getElementById('regPassword').value;
        const btn = document.getElementById('btnRegSubmit');

        btn.textContent = 'Registrando...';
        btn.disabled = true;
        if (loginError) loginError.style.display = 'none';

        try {
          // Verificar si ya existe
          const check = await fetch(`http://127.0.0.1:3000/users?email=${encodeURIComponent(email)}`);
          const existing = await check.json();
          if (existing && existing.length > 0) {
            throw new Error("Ya existe una cuenta con este correo electrónico.");
          }

          const newUser = {
            id: String(Date.now()),
            name,
            email,
            password,
            role,
            status: "pending"
          };

          const postRes = await fetch('http://127.0.0.1:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
          });

          if (!postRes.ok) throw new Error("Error al guardar en el servidor.");

          alert(`¡Cuenta registrada exitosamente para ${name}! Quedará pendiente de aprobación por el Administrador.`);
          formRegisterUser.reset();
          tabBtnLogin.click();
        } catch (err) {
          console.error("Error al registrar:", err);
          if (loginError) {
            loginError.textContent = err.message || 'Error al procesar el registro.';
            loginError.style.display = 'block';
          }
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
