/**
 * ZoFrancaCR — empresas.js (Versión Asíncrona conectada a JSON-Server)
 * Lógica Vanilla JS para Gestión de Empresas
 */

(function () {
  'use strict';

  const API_URL = 'http://localhost:3000/empresas';
  let companiesData = [];

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
  const btnSubmitForm = companyForm.querySelector('button[type="submit"]');

  /**
   * Cargar datos asíncronamente desde json-server
   */
  const loadData = async () => {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Cargando empresas...</td></tr>';
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error en red');
      companiesData = await res.json();
      
      // Ordenar por defecto: más recientes primero (opcional)
      companiesData.reverse(); 
      render();
    } catch (e) {
      console.error('Error cargando empresas:', e);
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red; padding: 2rem;">Error al conectar con la base de datos (json-server).</td></tr>';
    }
  };

  /**
   * Inicialización
   */
  const init = () => {
    bindEvents();
    loadData();

    // Actualizar si el usuario regresa con el botón Atrás del navegador
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) loadData();
    });
  };

  /**
   * Filtra las empresas según búsqueda y dropdowns
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

    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = Math.min(startIndex + state.itemsPerPage, totalItems);
    const currentPageItems = filtered.slice(startIndex, endIndex);

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
              <a href="./verempresas/verempresas.html?id=${comp.id}" class="btn-action-icon btn-action-view" aria-label="Ver detalles">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </a>
              <button class="btn-action-icon btn-action-edit" data-id="${comp.id}" aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-action-icon btn-action-delete" data-id="${comp.id}" aria-label="Eliminar">
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

    if (totalItems > 0) {
      paginationInfo.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalItems} empresas`;
    } else {
      paginationInfo.textContent = `Mostrando 0 a 0 de 0 empresas`;
    }

    btnPrevPage.disabled = state.currentPage <= 1;
    btnNextPage.disabled = state.currentPage >= totalPages;

    paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination-num ${i === state.currentPage ? 'is-active' : ''}`;
      btn.textContent = i;
      btn.setAttribute('aria-label', `Ir a la página ${i}`);
      if (i === state.currentPage) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => {
        state.currentPage = i;
        render();
      });
      paginationNumbers.appendChild(btn);
    }
  };

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
      companyCodeInput.readOnly = true; // El ID de BD no se suele editar
    } else {
      modalTitle.textContent = 'Agregar Nueva Empresa';
      companyIdField.value = '';
      companyStatusInput.value = 'Activo';
      companyCodeInput.readOnly = false;
    }
    companyModal.classList.add('is-open');
    companyModal.setAttribute('aria-hidden', 'false');
    companyNameInput.focus();
  };

  const closeModal = () => {
    companyModal.classList.remove('is-open');
    companyModal.setAttribute('aria-hidden', 'true');
  };

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
    }, 3500);
  };

  /**
   * Exportar a CSV
   */
  const exportToCSV = () => {
    const data = getFilteredData();
    if (!data.length) {
      showToast('No hay datos para exportar.', true);
      return;
    }
    const headers = ['ID', 'Nombre', 'Sector', 'Ubicacion', 'Estado', 'Empleados', 'Fecha_Registro'];
    const rows = data.map(item => [
      item.id, `"${item.name}"`, `"${item.sector}"`, `"${item.location}"`, item.status, item.employees, `"${item.registeredDate}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `empresas_zofrancacr_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV exportado exitosamente.', false);
  };

  // Modal de Eliminación
  const deleteModal = document.getElementById('deleteConfirmModal');
  const deleteModalDesc = document.getElementById('deleteModalDesc');
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const btnAcceptDelete = document.getElementById('btnAcceptDelete');
  let companyToDeleteId = null;

  const openDeleteModal = (company) => {
    companyToDeleteId = company.id;
    if (deleteModalDesc) deleteModalDesc.textContent = `¿Está seguro de que desea eliminar la empresa "${company.name}"?`;
    deleteModal.classList.add('is-open');
    deleteModal.setAttribute('aria-hidden', 'false');
  };

  const closeDeleteModal = () => {
    companyToDeleteId = null;
    deleteModal.classList.remove('is-open');
    deleteModal.setAttribute('aria-hidden', 'true');
  };

  if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal);

  if (btnAcceptDelete) {
    btnAcceptDelete.addEventListener('click', async () => {
      if (!companyToDeleteId) return;
      btnAcceptDelete.textContent = 'Eliminando...';
      btnAcceptDelete.disabled = true;

      try {
        const res = await fetch(`${API_URL}/${companyToDeleteId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        
        showToast('Empresa eliminada con éxito.', false);
        closeDeleteModal();
        await loadData();
      } catch (err) {
        showToast('Error de red al eliminar.', true);
      } finally {
        btnAcceptDelete.textContent = 'Eliminar Empresa';
        btnAcceptDelete.disabled = false;
      }
    });
  }

  /**
   * Enlazar eventos de usuario
   */
  const bindEvents = () => {
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        state.currentPage = 1;
        render();
      });
    }

    if (btnFilterToggle && filterMenu) {
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
        }
      });
    }

    if (btnApplyFilters && filterSector && filterEstado && filterMenu) {
      btnApplyFilters.addEventListener('click', () => {
        state.selectedSector = filterSector.value;
        state.selectedStatus = filterEstado.value;
        state.currentPage = 1;
        filterMenu.classList.remove('is-open');
        render();
      });
    }

    if (btnResetFilters && filterSector && filterEstado) {
      btnResetFilters.addEventListener('click', () => {
        filterSector.value = 'todos'; filterEstado.value = 'todos';
        state.selectedSector = 'todos'; state.selectedStatus = 'todos';
        state.currentPage = 1;
        render();
      });
    }

    if (btnExport) btnExport.addEventListener('click', exportToCSV);

    if (btnPrevPage) {
      btnPrevPage.addEventListener('click', () => {
        if (state.currentPage > 1) { state.currentPage--; render(); }
      });
    }

    if (btnNextPage) {
      btnNextPage.addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredData().length / state.itemsPerPage);
        if (state.currentPage < totalPages) { state.currentPage++; render(); }
      });
    }

    if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', () => openModal());
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Formulario (Guardar o Editar Asíncrono)
    if (companyForm) {
      companyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const existingId = companyIdField ? companyIdField.value : '';
        const newId = companyCodeInput ? companyCodeInput.value.trim() : '';
        const newName = companyNameInput ? companyNameInput.value.trim() : '';
      
      const payload = {
        id: newId || 'EMP-' + Math.floor(Math.random() * 10000), // Fallback ID si está vacío
        name: newName,
        avatar: newName.charAt(0).toUpperCase(),
        sector: companySectorInput.value,
        location: companyLocationInput.value.trim(),
        employees: parseInt(companyEmployeesInput.value, 10) || 0,
        status: companyStatusInput.value,
      };

      btnSubmitForm.textContent = 'Guardando...';
      btnSubmitForm.disabled = true;

      try {
        let res;
        if (existingId) {
          // Editar (PATCH para conservar campos como registeredDate si existen)
          res = await fetch(`${API_URL}/${existingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          // Crear (POST)
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
          const now = new Date();
          payload.registeredDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
          
          res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (!res.ok) throw new Error('Fallo al guardar empresa');

        showToast('Empresa guardada con éxito.', false);
        closeModal();
        await loadData();
      } catch (err) {
        showToast('Error de red al guardar.', true);
        console.error(err);
      } finally {
        btnSubmitForm.textContent = 'Guardar Empresa';
        btnSubmitForm.disabled = false;
      }
    });
    }

    // Delegación de eventos en tabla
    tableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-action-edit');
      const deleteBtn = e.target.closest('.btn-action-delete');

      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const company = companiesData.find(item => String(item.id) === String(id));
        if (company) openModal(company);
      }

      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const company = companiesData.find(item => String(item.id) === String(id));
        if (company) openDeleteModal(company);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


})();
