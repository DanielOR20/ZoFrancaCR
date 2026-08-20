/**
 * ZoFrancaCR — añadir.js
 * Lógica Vanilla JS para la vista de Añadir Empresa:
 * 1. Validación en tiempo real (solo números para teléfonos/empleados, @ para correos)
 * 2. Mensajes de error corporativos inline (eliminando los globos nativos del navegador)
 * 3. Navegación activa suave por secciones
 * 4. Persistencia en localStorage y retorno a empresas.html
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('addCompanyForm');
    const btnSaveTop = document.getElementById('btnSaveTop');
    const sectionNavLinks = document.querySelectorAll('.section-nav-link');
    const formCards = document.querySelectorAll('.form-card');

    // Campos del formulario
    const fields = {
      razonSocial: document.getElementById('razonSocial'),
      cedulaJuridica: document.getElementById('cedulaJuridica'),
      nombreComercial: document.getElementById('nombreComercial'),
      sectorIndustrial: document.getElementById('sectorIndustrial'),
      actividadPrincipal: document.getElementById('actividadPrincipal'),
      emailOficial: document.getElementById('emailOficial'),
      telefonoPrincipal: document.getElementById('telefonoPrincipal'),
      sitioWeb: document.getElementById('sitioWeb'),
      direccionExacta: document.getElementById('direccionExacta'),
      provinciaSelect: document.getElementById('provinciaSelect'),
      cantonSelect: document.getElementById('cantonSelect'),
      repNombreCompleto: document.getElementById('repNombreCompleto'),
      repIdentificacion: document.getElementById('repIdentificacion'),
      repNacionalidad: document.getElementById('repNacionalidad'),
      repEmail: document.getElementById('repEmail'),
      repTelefono: document.getElementById('repTelefono'),
      ftzEmpleados: document.getElementById('ftzEmpleados'),
      ftzFechaIngreso: document.getElementById('ftzFechaIngreso'),
      ftzUbicacionInterna: document.getElementById('ftzUbicacionInterna'),
      ftzEstadoInicial: document.getElementById('ftzEstadoInicial'),
    };

    /**
     * Helper: Muestra u oculta mensaje de error inline
     */
    const setFieldError = (input, errorMessage = '') => {
      if (!input) return;
      const group = input.closest('.form-group');
      if (!group) return;

      let errorEl = group.querySelector('.form-error-msg');

      if (errorMessage) {
        group.classList.add('has-error');
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'form-error-msg';
          group.appendChild(errorEl);
        }
        errorEl.textContent = errorMessage;
      } else {
        group.classList.remove('has-error');
        if (errorEl) {
          errorEl.remove();
        }
      }
    };

    /**
     * 1. RESTRICCIÓN EN TIEMPO REAL: Teléfonos solo números y caracteres de marcado (+, -, espacios)
     */
    const enforcePhoneInput = (input) => {
      if (!input) return;
      input.addEventListener('input', (e) => {
        // Permitir números, espacio, guion y signo + al inicio
        let val = e.target.value;
        const cleaned = val.replace(/[^0-9+\-\s]/g, '');
        if (val !== cleaned) {
          e.target.value = cleaned;
        }
        setFieldError(input, '');
      });
    };

    enforcePhoneInput(fields.telefonoPrincipal);
    enforcePhoneInput(fields.repTelefono);

    // Restricción para números de empleados: solo enteros positivos
    if (fields.ftzEmpleados) {
      fields.ftzEmpleados.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        setFieldError(fields.ftzEmpleados, '');
      });
    }

    // Limpiar errores al escribir o cambiar
    Object.values(fields).forEach(input => {
      if (!input) return;
      input.addEventListener('input', () => setFieldError(input, ''));
      input.addEventListener('change', () => setFieldError(input, ''));
    });

    /**
     * 2. VALIDACIÓN ESTRICTA Y VERIFICACIÓN DE ESCRITURA
     */
    const validateForm = () => {
      let isValid = true;
      let firstErrorField = null;

      // Razón Social
      if (!fields.razonSocial.value.trim()) {
        setFieldError(fields.razonSocial, 'Por favor, ingrese la razón social de la empresa.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.razonSocial;
      } else if (fields.razonSocial.value.trim().length < 3) {
        setFieldError(fields.razonSocial, 'La razón social debe tener al menos 3 caracteres.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.razonSocial;
      }

      // Cédula Jurídica
      if (!fields.cedulaJuridica.value.trim()) {
        setFieldError(fields.cedulaJuridica, 'Ingrese la cédula jurídica (ej: 3-101-123456).');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.cedulaJuridica;
      }

      // Sector Industrial
      if (!fields.sectorIndustrial.value) {
        setFieldError(fields.sectorIndustrial, 'Seleccione el sector industrial correspondiente.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.sectorIndustrial;
      }

      // Correo Oficial
      const emailVal = fields.emailOficial.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        setFieldError(fields.emailOficial, 'El correo electrónico oficial es obligatorio.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.emailOficial;
      } else if (!emailVal.includes('@')) {
        setFieldError(fields.emailOficial, 'El correo debe incluir el símbolo "@" (ej: contacto@empresa.com).');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.emailOficial;
      } else if (!emailRegex.test(emailVal)) {
        setFieldError(fields.emailOficial, 'Ingrese un formato de correo válido (ej: contacto@empresa.com).');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.emailOficial;
      }

      // Teléfono Principal
      const telVal = fields.telefonoPrincipal.value.trim().replace(/[^0-9]/g, '');
      if (!fields.telefonoPrincipal.value.trim()) {
        setFieldError(fields.telefonoPrincipal, 'Ingrese el número telefónico principal.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.telefonoPrincipal;
      } else if (telVal.length < 8) {
        setFieldError(fields.telefonoPrincipal, 'El teléfono debe contener al menos 8 dígitos numéricos.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.telefonoPrincipal;
      }

      // Representante Legal: Nombre
      if (!fields.repNombreCompleto.value.trim()) {
        setFieldError(fields.repNombreCompleto, 'Ingrese el nombre completo del representante legal.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.repNombreCompleto;
      }

      // Representante Legal: Identificación
      if (!fields.repIdentificacion.value.trim()) {
        setFieldError(fields.repIdentificacion, 'Ingrese la identificación del representante legal.');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.repIdentificacion;
      }

      // Representante Legal: Email (Opcional pero si lo llena debe ser válido)
      if (fields.repEmail.value.trim()) {
        const repEmailVal = fields.repEmail.value.trim();
        if (!repEmailVal.includes('@') || !emailRegex.test(repEmailVal)) {
          setFieldError(fields.repEmail, 'Ingrese un correo electrónico válido con "@".');
          isValid = false;
          if (!firstErrorField) firstErrorField = fields.repEmail;
        }
      }

      // Scroll suave hacia el primer campo con error
      if (!isValid && firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return isValid;
    };

    /**
     * 3. Toast Notificación Corporativa
     */
    const showToast = (message, isError = false) => {
      const existingToast = document.querySelector('.corporate-toast');
      if (existingToast) existingToast.remove();

      const toast = document.createElement('div');
      toast.className = `corporate-toast ${isError ? 'corporate-toast--error' : ''}`;
      toast.innerHTML = `
        <svg style="width: 1.25rem; height: 1.25rem; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      }, 4000);
    };

    /**
     * 4. Tracking de navegación lateral por scroll
     */
    const updateActiveSectionNav = () => {
      const scrollPos = window.scrollY + 180;

      formCards.forEach(card => {
        const top = card.offsetTop;
        const height = card.offsetHeight;
        const id = card.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          sectionNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('is-active');
            } else {
              link.classList.remove('is-active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', updateActiveSectionNav, { passive: true });

    sectionNavLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 90,
            behavior: 'smooth'
          });
        }
      });
    });

    /**
     * 5. Botón superior dispara validación
     */
    if (btnSaveTop) {
      btnSaveTop.addEventListener('click', () => {
        submitForm();
      });
    }

    /**
     * 6. Submit y guardado de datos
     */
    const submitForm = () => {
      if (!validateForm()) {
        showToast('Por favor, revise los campos requeridos marcados en rojo.', true);
        return;
      }

      const razonSocial = fields.razonSocial.value.trim();
      const cedulaJuridica = fields.cedulaJuridica.value.trim();
      const nombreComercial = fields.nombreComercial.value.trim();
      const sector = fields.sectorIndustrial.value;
      const ubicacion = fields.ftzUbicacionInterna.value.trim() || fields.direccionExacta.value.trim() || 'Edificio Principal';
      const empleados = parseInt(fields.ftzEmpleados.value, 10) || 0;
      const estado = fields.ftzEstadoInicial.value === 'Inactivo' ? 'Inactivo' : 'Activo';

      // Formateo de fecha
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;

      // Crear objeto empresa
      const newCompany = {
        id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: razonSocial || nombreComercial,
        avatar: (nombreComercial || razonSocial).charAt(0).toUpperCase(),
        sector: sector,
        location: ubicacion,
        status: estado,
        employees: empleados,
        registeredDate: formattedDate,
        legalId: cedulaJuridica
      };

      // Guardar en localStorage
      try {
        const storedCompanies = JSON.parse(localStorage.getItem('zofranca_companies') || '[]');
        storedCompanies.unshift(newCompany);
        localStorage.setItem('zofranca_companies', JSON.stringify(storedCompanies));
      } catch (err) {
        console.error('Error guardando en localStorage:', err);
      }

      showToast(`¡Empresa "${newCompany.name}" registrada con éxito!`, false);

      setTimeout(() => {
        window.location.href = '../empresas.html';
      }, 1000);
    };

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm();
      });
    }

  });
})();
