/**
 * ZoFrancaCR — empresas.js
 * Lógica Vanilla JS para Gestión de Empresas:
 * 1. Renderizado de tabla de datos
 * 2. Búsqueda y filtrado en tiempo real
 * 3. Paginación de resultados
 * 4. Modal para agregar y editar empresas
 * 5. Exportación a CSV
 */

(function () {
  'use strict';

  // Base de datos inicial en memoria con los registros de referencia
  let companiesData = [
    {
      id: 'EMP-1042',
      name: 'TechCorp Industries',
      avatar: 'T',
      sector: 'Tecnología Médica',
      location: 'Edificio B, Piso 3',
      status: 'Activo',
      employees: 342,
      registeredDate: '12 May 2021'
    },
    {
      id: 'EMP-1089',
      name: 'LogisNet Global',
      avatar: 'L',
      sector: 'Logística',
      location: 'Nave Industrial 4',
      status: 'Activo',
      employees: 85,
      registeredDate: '04 Ago 2022'
    },
    {
      id: 'EMP-1102',
      name: 'Synergy Services',
      avatar: 'S',
      sector: 'Servicios Compartidos',
      location: 'Edificio A, Piso 1',
      status: 'Inactivo',
      employees: 12,
      registeredDate: '22 Ene 2023'
    },
    {
      id: 'EMP-1145',
      name: 'BioHealth Costa Rica',
      avatar: 'B',
      sector: 'Tecnología Médica',
      location: 'Edificio C, Piso 2',
      status: 'Activo',
      employees: 210,
      registeredDate: '15 Mar 2023'
    },
    {
      id: 'EMP-1180',
      name: 'CloudSync Solutions',
      avatar: 'C',
      sector: 'Desarrollo de Software',
      location: 'Edificio B, Piso 4',
      status: 'Activo',
      employees: 145,
      registeredDate: '28 Jun 2023'
    },
    {
      id: 'EMP-1205',
      name: 'AeroPrecision CR',
      avatar: 'A',
      sector: 'Manufactura Avanzada',
      location: 'Nave Industrial 2',
      status: 'Activo',
      employees: 320,
      registeredDate: '10 Nov 2023'
    }
  ];

  // Estado de la aplicación
  let state = {
    searchQuery: '',
    selectedSector: 'todos',
    selectedStatus: 'todos',
    currentPage: 1,
    itemsPerPage: 6,
  };

  // Elementos del DOM
  const tableBody = document.getElementById('companiesTableBody');
  const paginationInfo = document.getElementById('paginationInfo');
  const searchInput = document.getElementById('tableSearchInput');
  const btnFilterToggle = document.getElementById('btnFilterToggle');
  const filterMenu = document.getElementById('filterMenu');
  const filterSector = document.getElementById('filterSector');
  const filterEstado = document.getElementById('filterEstado');
  const btnApplyFilters = document.getElementById('btnApplyFilters');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const btnExport = document.getElementById('btnExport');
  const btnPrevPage = document.getElementById('btnPrevPage');
  const btnNextPage = document.getElementById('btnNextPage');
  const paginationNumbers = document.getElementById('paginationNumbers');

  // Modal elements
  const companyModal = document.getElementById('companyModal');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const companyForm = document.getElementById('companyForm');
  const modalTitle = document.getElementById('modalTitle');
  const companyIdField = document.getElementById('companyIdField');
  const companyNameInput = document.getElementById('companyNameInput');
  const companyCodeInput = document.getElementById('companyCodeInput');
  const companySectorInput = document.getElementById('companySectorInput');
  const companyLocationInput = document.getElementById('companyLocationInput');
  const companyEmployeesInput = document.getElementById('companyEmployeesInput');
  const companyStatusInput = document.getElementById('companyStatusInput');

  /**
   * Cargar datos desde localStorage
   */
  const loadData = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('zofranca_companies') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        const storedIds = new Set(stored.map(c => c.id));
        const nonDuplicateDefaults = companiesData.filter(c => !storedIds.has(c.id));
        companiesData = [...stored, ...nonDuplicateDefaults];
      }
    } catch (e) {
      console.error('Error cargando localStorage:', e);
    }
  };

  /**
   * Inicialización
   */
  const init = () => {
    loadData();
    bindEvents();
    render();

    // Actualizar si el usuario regresa con el botón Atrás del navegador (bfcache)
    window.addEventListener('pageshow', () => {
      loadData();
      render();
    });
  };

  /**
   * Filtra las empresas según búsqueda y dropdowns (Muestra todas por defecto)
   */
  const getFilteredData = () => {
    return companiesData.filter(item => {
      const query = (state.searchQuery || '').toLowerCase().trim();
      const matchesSearch = !query || 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.id && item.id.toLowerCase().includes(query)) ||
        (item.sector && item.sector.toLowerCase().includes(query)) ||
        (item.location && item.location.toLowerCase().includes(query));

      const matchesSector = !state.selectedSector || state.selectedSector === 'todos' || 
        (item.sector && item.sector.trim().toLowerCase() === state.selectedSector.trim().toLowerCase());

      const matchesStatus = !state.selectedStatus || state.selectedStatus === 'todos' || 
        (item.status && item.status.trim().toLowerCase().startsWith(state.selectedStatus.trim().toLowerCase()));

      return matchesSearch && matchesSector && matchesStatus;
    });
  };

  /**
   * Renderiza la tabla de empresas y la paginación
   */
  const render = () => {
    const filtered = getFilteredData();
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));

    // Ajustar página si excede el rango
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = Math.min(startIndex + state.itemsPerPage, totalItems);
    const currentPageItems = filtered.slice(startIndex, endIndex);

    // Renderizar filas de la tabla
    if (currentPageItems.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No se encontraron empresas registradas con los criterios seleccionados.
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = currentPageItems.map(comp => `
        <tr>
          <td>
            <a href="./verempresas/verempresas.html?id=${comp.id}" class="company-cell" style="text-decoration: none; color: inherit;">
              <div class="company-avatar" aria-hidden="true">${comp.avatar || comp.name.charAt(0).toUpperCase()}</div>
              <div class="company-meta">
                <span class="company-name">${escapeHtml(comp.name)}</span>
                <span class="company-id">ID: ${escapeHtml(comp.id)}</span>
              </div>
            </a>
          </td>
          <td>${escapeHtml(comp.sector)}</td>
          <td>${escapeHtml(comp.location)}</td>
          <td>
            <span class="status-badge ${comp.status === 'Activo' ? 'status-badge--active' : 'status-badge--inactive'}">
              ${escapeHtml(comp.status)}
            </span>
          </td>
          <td>${Number(comp.employees).toLocaleString('es-CR')}</td>
          <td>${escapeHtml(comp.registeredDate)}</td>
          <td>
            <div class="table-actions-cell">
              <a href="./verempresas/verempresas.html?id=${comp.id}" class="btn-action-icon btn-action-view" data-id="${comp.id}" aria-label="Ver detalles de ${escapeHtml(comp.name)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </a>
              <button class="btn-action-icon btn-action-edit" data-id="${comp.id}" aria-label="Editar empresa ${escapeHtml(comp.name)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-action-icon btn-action-delete" data-id="${comp.id}" aria-label="Eliminar empresa ${escapeHtml(comp.name)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Actualizar texto informativo de paginación
    if (totalItems > 0) {
      paginationInfo.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalItems} empresas`;
    } else {
      paginationInfo.textContent = `Mostrando 0 a 0 de 0 empresas`;
    }

    // Actualizar botones de paginación
    btnPrevPage.disabled = state.currentPage <= 1;
    btnNextPage.disabled = state.currentPage >= totalPages;

    // Números de página
    paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination-num ${i === state.currentPage ? 'is-active' : ''}`;
      btn.textContent = i;
      btn.setAttribute('aria-label', `Ir a la página ${i}`);
      if (i === state.currentPage) {
        btn.setAttribute('aria-current', 'page');
      }
      btn.addEventListener('click', () => {
        state.currentPage = i;
        render();
      });
      paginationNumbers.appendChild(btn);
    }
  };

  /**
   * Escape HTML simple para prevenir inyección en strings renderizadas
   */
  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  /**
   * Modal: Abrir para agregar o editar
   */
  const openModal = (companyToEdit = null) => {
    companyForm.reset();
    if (companyToEdit) {
      modalTitle.textContent = 'Editar Empresa';
      companyIdField.value = companyToEdit.id;
      companyNameInput.value = companyToEdit.name;
      companyCodeInput.value = companyToEdit.id;
      companySectorInput.value = companyToEdit.sector;
      companyLocationInput.value = companyToEdit.location;
      companyEmployeesInput.value = companyToEdit.employees;
      companyStatusInput.value = companyToEdit.status;
    } else {
      modalTitle.textContent = 'Agregar Nueva Empresa';
      companyIdField.value = '';
      companyStatusInput.value = 'Activo';
    }
    companyModal.classList.add('is-open');
    companyModal.setAttribute('aria-hidden', 'false');
    companyNameInput.focus();
  };

  const closeModal = () => {
    companyModal.classList.remove('is-open');
    companyModal.setAttribute('aria-hidden', 'true');
  };

  /**
   * Exportar datos a CSV
   */
  const exportToCSV = () => {
    const data = getFilteredData();
    if (!data.length) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ['ID', 'Nombre', 'Sector', 'Ubicacion', 'Estado', 'Empleados', 'Fecha_Registro'];
    const rows = data.map(item => [
      item.id,
      `"${item.name}"`,
      `"${item.sector}"`,
      `"${item.location}"`,
      item.status,
      item.employees,
      `"${item.registeredDate}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `empresas_zofrancacr_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Enlazar eventos de usuario
   */
  const bindEvents = () => {
    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.currentPage = 1;
      render();
    });

    // Menú de filtros
    btnFilterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = filterMenu.classList.toggle('is-open');
      btnFilterToggle.setAttribute('aria-expanded', String(isOpen));
      filterMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!filterMenu.contains(e.target) && e.target !== btnFilterToggle) {
        filterMenu.classList.remove('is-open');
        btnFilterToggle.setAttribute('aria-expanded', 'false');
        filterMenu.setAttribute('aria-hidden', 'true');
      }
    });

    btnApplyFilters.addEventListener('click', () => {
      state.selectedSector = filterSector.value;
      state.selectedStatus = filterEstado.value;
      state.currentPage = 1;
      filterMenu.classList.remove('is-open');
      btnFilterToggle.setAttribute('aria-expanded', 'false');
      filterMenu.setAttribute('aria-hidden', 'true');
      render();
    });

    btnResetFilters.addEventListener('click', () => {
      filterSector.value = 'todos';
      filterEstado.value = 'todos';
      state.selectedSector = 'todos';
      state.selectedStatus = 'todos';
      state.currentPage = 1;
      render();
    });

    // Exportar
    btnExport.addEventListener('click', exportToCSV);

    // Paginación
    btnPrevPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        render();
      }
    });

    btnNextPage.addEventListener('click', () => {
      const totalPages = Math.ceil(getFilteredData().length / state.itemsPerPage);
      if (state.currentPage < totalPages) {
        state.currentPage++;
        render();
      }
    });

    // Modal eventos
    btnOpenAddModal.addEventListener('click', () => openModal());
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);

    companyModal.addEventListener('click', (e) => {
      if (e.target === companyModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && companyModal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Guardar / Editar Empresa
    companyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const existingId = companyIdField.value;
      const newId = companyCodeInput.value.trim();
      const newName = companyNameInput.value.trim();
      const newSector = companySectorInput.value;
      const newLocation = companyLocationInput.value.trim();
      const newEmployees = parseInt(companyEmployeesInput.value, 10) || 0;
      const newStatus = companyStatusInput.value;

      if (existingId) {
        // Editar existente
        const index = companiesData.findIndex(item => item.id === existingId);
        if (index !== -1) {
          companiesData[index] = {
            ...companiesData[index],
            id: newId,
            name: newName,
            avatar: newName.charAt(0).toUpperCase(),
            sector: newSector,
            location: newLocation,
            employees: newEmployees,
            status: newStatus
          };
        }
      } else {
        // Agregar nuevo registro
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;

        companiesData.unshift({
          id: newId,
          name: newName,
          avatar: newName.charAt(0).toUpperCase(),
          sector: newSector,
          location: newLocation,
          status: newStatus,
          employees: newEmployees,
          registeredDate: formattedDate
        });
      }

      closeModal();
      render();
    });

    // Acciones de fila (Editar y Eliminar) por delegación de eventos
    tableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-action-edit');
      const deleteBtn = e.target.closest('.btn-action-delete');

      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const company = companiesData.find(item => item.id === id);
        if (company) {
          openModal(company);
        }
      }

      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const company = companiesData.find(item => item.id === id);
        if (company && confirm(`¿Está seguro de que desea eliminar la empresa "${company.name}"?`)) {
          companiesData = companiesData.filter(item => item.id !== id);
          render();
        }
      }
    });
  };

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
