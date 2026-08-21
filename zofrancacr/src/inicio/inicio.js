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
   * 0. Lógica de Login de Administrador (JSON-Server)
   */
  const initLoginModal = () => {
    const loginModal = document.getElementById('loginModal');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const btnCloseLogin = document.getElementById('btnCloseLogin');
    const formLoginAdmin = document.getElementById('formLoginAdmin');
    const loginError = document.getElementById('loginError');

    const openModal = (e) => {
      e.preventDefault();
      loginModal.style.display = 'flex';
      loginModal.classList.remove('hidden');
      loginModal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
      loginModal.style.display = 'none';
      loginModal.classList.add('hidden');
      loginModal.setAttribute('aria-hidden', 'true');
      loginError.style.display = 'none';
      formLoginAdmin.reset();
    };

    if(headerLoginBtn) headerLoginBtn.addEventListener('click', openModal);
    if(heroLoginBtn) heroLoginBtn.addEventListener('click', openModal);
    if(btnCloseLogin) btnCloseLogin.addEventListener('click', closeModal);
    
    // Cerrar si se da click afuera
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeModal();
    });

    if(formLoginAdmin) {
      formLoginAdmin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUsername').value;
        const pass = document.getElementById('loginPassword').value;
        const btn = formLoginAdmin.querySelector('button[type="submit"]');
        btn.textContent = 'Autenticando...';
        btn.disabled = true;

        try {
          const res = await fetch(`http://localhost:3000/usuarios?usuario=${user}&password=${pass}`);
          const data = await res.json();
          
          if (data.length > 0) {
            // Éxito: Guardar sesión localmente y redirigir al panel (empresas)
            localStorage.setItem('zofranca_session', JSON.stringify(data[0]));
            window.location.href = './empresas/empresas.html';
          } else {
            loginError.style.display = 'block';
            btn.textContent = 'Ingresar al Panel';
            btn.disabled = false;
          }
        } catch (error) {
          console.error("Error conectando con db.json", error);
          alert("Error de conexión. Asegúrate de tener json-server activo en el puerto 3000.");
          btn.textContent = 'Ingresar al Panel';
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
