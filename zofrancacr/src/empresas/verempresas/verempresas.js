/**
 * ZoFrancaCR — verempresas.js (Versión Asíncrona conectada a JSON-Server)
 * Lógica para la vista de detalle de empresa
 */

(function () {
  'use strict';

  const API_URL = 'http://localhost:3000/empresas';

  document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Obtener ID de la empresa desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    if (!companyId) {
      alert("Error: No se especificó el ID de la empresa.");
      window.location.href = '../empresas.html';
      return;
    }

    let company = null;

    try {
      // JSON Server acepta ?id=XXX para filtrar
      const res = await fetch(`${API_URL}?id=${companyId}`);
      if (!res.ok) throw new Error('Error al conectar con la base de datos.');
      
      const data = await res.json();
      if (data.length > 0) {
        company = data[0];
      } else {
        throw new Error('Empresa no encontrada.');
      }
    } catch (err) {
      console.error(err);
      alert("Error: No se pudo cargar la información de la empresa.");
      window.location.href = '../empresas.html';
      return;
    }

    // 2. Renderizar datos en pantalla
    const dispCompanyName = document.getElementById('dispCompanyName');
    const dispLegalId = document.getElementById('dispLegalId');
    const dispStatusBadge = document.getElementById('dispStatusBadge');
    const dispTabEmpCount = document.getElementById('dispTabEmpCount');
    const dispRazonSocial = document.getElementById('dispRazonSocial');
    const dispNombreComercial = document.getElementById('dispNombreComercial');
    const dispCedula = document.getElementById('dispCedula');
    const dispCategoria = document.getElementById('dispCategoria');
    const dispFechaIngreso = document.getElementById('dispFechaIngreso');
    const dispParque = document.getElementById('dispParque');
    const dispEdificio = document.getElementById('dispEdificio');
    const dispDistrito = document.getElementById('dispDistrito');

    if (dispCompanyName) dispCompanyName.textContent = company.name;
    if (dispLegalId) dispLegalId.textContent = company.legalId || company.id;
    if (dispRazonSocial) dispRazonSocial.textContent = company.name;
    if (dispNombreComercial) dispNombreComercial.textContent = company.tradeName || company.name.split(' ')[0];
    if (dispCedula) dispCedula.textContent = company.legalId || '3-101-555444';
    if (dispCategoria) dispCategoria.textContent = company.category || `${company.sector} - Régimen Especial`;
    if (dispFechaIngreso) dispFechaIngreso.textContent = company.entryDate || company.registeredDate || '15 de Marzo, 2018';
    if (dispParque) dispParque.textContent = company.park || 'Zona Franca Metropolitana';
    if (dispEdificio) dispEdificio.textContent = company.building || company.location || 'Edificio B, Piso 3';
    if (dispDistrito) dispDistrito.textContent = company.district || 'Heredia, Barreal, Heredia';

    if (dispTabEmpCount) dispTabEmpCount.textContent = company.employees || '0';

    if (dispStatusBadge) {
      const isActive = company.status === 'Activo' || company.status === 'Activa';
      dispStatusBadge.textContent = isActive ? 'Activa' : 'Inactiva';
      dispStatusBadge.className = `status-badge-lg ${isActive ? 'status-badge--active' : 'status-badge--inactive'}`;
    }

    // 3. Manejo de Pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // 4. Modal Corporativo de Confirmación de Eliminación
    const deleteModal = document.getElementById('deleteConfirmModal');
    const deleteModalDesc = document.getElementById('deleteModalDesc');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnAcceptDelete = document.getElementById('btnAcceptDelete');
    const btnDelete = document.getElementById('btnDeleteCompany');

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

    const openDeleteModal = () => {
      if (deleteModalDesc) {
        deleteModalDesc.textContent = `¿Está seguro de que desea eliminar la empresa "${company.name}"? Esta acción no se puede deshacer.`;
      }
      deleteModal.classList.add('is-open');
      deleteModal.setAttribute('aria-hidden', 'false');
    };

    const closeDeleteModal = () => {
      deleteModal.classList.remove('is-open');
      deleteModal.setAttribute('aria-hidden', 'true');
    };

    if (btnDelete) {
      btnDelete.addEventListener('click', openDeleteModal);
    }

    if (btnCancelDelete) {
      btnCancelDelete.addEventListener('click', closeDeleteModal);
    }

    if (deleteModal) {
      deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal.classList.contains('is-open')) closeDeleteModal();
      });
    }

    if (btnAcceptDelete) {
      btnAcceptDelete.addEventListener('click', async () => {
        btnAcceptDelete.textContent = 'Eliminando...';
        btnAcceptDelete.disabled = true;

        try {
          const res = await fetch(`${API_URL}/${company.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Fallo al eliminar');
          
          closeDeleteModal();
          showToast(`Empresa "${company.name}" eliminada exitosamente.`, false);
          
          setTimeout(() => {
            window.location.href = '../empresas.html';
          }, 800);
        } catch (e) {
          console.error(e);
          showToast('Error de red al intentar eliminar la empresa.', true);
          btnAcceptDelete.textContent = 'Eliminar Definitivamente';
          btnAcceptDelete.disabled = false;
        }
      });
    }

    // 5. Botón Editar
    const btnEdit = document.getElementById('btnEditCompany');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        window.location.href = `../añadirempresas/añadir.html?edit=${company.id}`;
      });
    }

  });
})();
