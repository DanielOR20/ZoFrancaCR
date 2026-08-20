/**
 * ZoFrancaCR — verempresas.js
 * Lógica para la vista de detalle de empresa:
 * 1. Lee el ID o datos de la empresa desde URL params o localStorage
 * 2. Renderiza la información de la empresa dinámicamente
 * 3. Permite alternar pestañas interactivas
 * 4. Manejo de botones de edición y eliminación con confirmación
 */

(function () {
  'use strict';

  // Base de datos de empresas predeterminada
  const defaultCompanies = [
    {
      id: 'EMP-1042',
      name: 'TechCorp Industries Costa Rica S.A.',
      tradeName: 'TechCorp CR',
      legalId: '3-101-555444',
      sector: 'Tecnología Médica',
      category: 'Servicios - Categoría C',
      entryDate: '15 de Marzo, 2018',
      park: 'Zona Franca Metropolitana',
      building: 'Edificio B, Nave 4',
      district: 'Heredia, Barreal, Heredia',
      status: 'Activa',
      employees: 142
    },
    {
      id: 'EMP-1089',
      name: 'LogisNet Global S.A.',
      tradeName: 'LogisNet',
      legalId: '3-101-689102',
      sector: 'Logística',
      category: 'Logística y Almacenaje - Categoría A',
      entryDate: '04 de Agosto, 2022',
      park: 'Parque Industrial El Coyol',
      building: 'Nave Industrial 4',
      district: 'Alajuela, El Coyol, Alajuela',
      status: 'Activa',
      employees: 85
    },
    {
      id: 'EMP-1102',
      name: 'Synergy Services Limitada',
      tradeName: 'Synergy BPO',
      legalId: '3-102-778899',
      sector: 'Servicios Compartidos',
      category: 'Servicios Corporativos - Categoría B',
      entryDate: '22 de Enero, 2023',
      park: 'Centro Corporativo Plaza Roble',
      building: 'Edificio A, Piso 1',
      district: 'San José, Escazú, San Rafael',
      status: 'Inactiva',
      employees: 12
    }
  ];

  document.addEventListener('DOMContentLoaded', () => {

    // 1. Obtener ID de la empresa desde la URL (ej: verempresas.html?id=EMP-1042)
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id') || 'EMP-1042';

    // Obtener lista completa (localStorage + default)
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('zofranca_companies') || '[]');
    } catch (e) {
      console.error(e);
    }

    const allCompanies = [...stored, ...defaultCompanies];
    let company = allCompanies.find(c => c.id === companyId) || defaultCompanies[0];

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

    // 4. Botón Eliminar
    const btnDelete = document.getElementById('btnDeleteCompany');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        if (confirm(`¿Está seguro de que desea eliminar la empresa "${company.name}"?`)) {
          try {
            const updated = stored.filter(c => c.id !== company.id);
            localStorage.setItem('zofranca_companies', JSON.stringify(updated));
          } catch (e) {}
          alert('Empresa eliminada exitosamente.');
          window.location.href = '../empresas.html';
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
