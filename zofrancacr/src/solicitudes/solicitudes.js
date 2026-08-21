/**
 * ZoFrancaCR — solicitudes.js
 * Módulo Vanilla JS: Sistema Integral de Instalación y Auditoría
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos Fase 1
    const formFase1 = document.getElementById('formFase1');
    const btnSubmitF1 = document.getElementById('btnSubmitF1');
    const btnTextF1 = document.getElementById('btnTextF1');
    const feedbackFase1 = document.getElementById('feedbackContainerFase1');

    // Elementos Fase 2
    const formFase2 = document.getElementById('formFase2');
    const btnSubmitF2 = document.getElementById('btnSubmitF2');
    const btnTextF2 = document.getElementById('btnTextF2');
    const feedbackFase2 = document.getElementById('feedbackContainerFase2');
    const selectEmpresa = document.getElementById('select_empresa_id');

    // Elementos Panel
    const tablaBody = document.getElementById('tablaSolicitudesBody');
    const btnRefreshTabla = document.getElementById('btnRefreshTabla');

    const API_URL = 'http://localhost:3000/solicitudes_instalacion';
    
    // Fallback array para cuando json-server no esté encendido
    let fallbackStorage = JSON.parse(localStorage.getItem('zofranca_solicitudes_instalacion') || '[]');

    /**
     * Feedback UI Genérico
     */
    const renderFeedback = (container, tipo, titulo, mensaje) => {
      container.innerHTML = ''; 
      
      let iconSvg = '';
      if (tipo === 'success') {
        iconSvg = `<svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      } else if (tipo === 'warning') {
        iconSvg = `<svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      } else {
        iconSvg = `<svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      }

      const alertHTML = `
        <div class="feedback-alert feedback-alert--${tipo}" role="alert">
          ${iconSvg}
          <div class="feedback-content">
            <h4 class="feedback-title">${titulo}</h4>
            <p class="feedback-message">${mensaje}</p>
          </div>
        </div>
      `;
      container.innerHTML = alertHTML;
      
      if(tipo === 'success') {
        setTimeout(() => container.innerHTML = '', 5000);
      }
    };

    /**
     * Formateador de moneda
     */
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    /**
     * ==========================================
     * FASE 1: Solicitud y Priorización (Nuevas)
     * ==========================================
     */
    
    // Función de la IA
    const evaluarInstalacionIA = async (data) => {
      const systemPrompt = `
        Analiza el perfil corporativo: Inversión de $${data.inversion}, y ${data.empleos} empleos proyectados.
        Retorna ESTRICTAMENTE este JSON:
        { "puntaje_afinidad": [0-100], "justificacion": "[texto]" }
      `;

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // Mock simulado
            const inv = parseFloat(data.inversion);
            const emp = parseInt(data.empleos, 10);
            let p = 0;
            let j = "";

            if (inv > 1000000 && emp > 50) {
              p = Math.floor(Math.random() * 16) + 85; // 85-100
              j = "Alta inversión y fuerte dinamismo laboral.";
            } else if (inv < 500000 || emp < 10) {
              p = Math.floor(Math.random() * 40) + 10; // 10-49
              j = "Bajo impacto económico estimado.";
            } else {
              p = Math.floor(Math.random() * 35) + 50; // 50-84
              j = "Impacto moderado dentro del promedio.";
            }

            const mockResponse = "```json\n" + JSON.stringify({
              puntaje_afinidad: p,
              justificacion: j
            }) + "\n```";

            const cleanedResponse = mockResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            resolve(JSON.parse(cleanedResponse));
          } catch (err) { reject(new Error("Error IA")); }
        }, 1500);
      });
    };

    formFase1.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const originalText = btnTextF1.textContent;
      btnSubmitF1.disabled = true;
      btnSubmitF1.classList.add('is-analyzing');
      btnTextF1.textContent = "Evaluando perfil con IA...";
      feedbackFase1.innerHTML = '';

      try {
        const formData = new FormData(formFase1);
        const dataObj = Object.fromEntries(formData.entries());
        dataObj.inversion = parseFloat(dataObj.inversion);
        dataObj.empleos = parseInt(dataObj.empleos, 10);

        // 1. Llamar a IA (Solo trae puntaje y justificacion)
        const analisisIA = await evaluarInstalacionIA(dataObj);

        // 2. Clasificación basada en umbrales (Javascript puro)
        let clasificacion = 'rechaza';
        if (analisisIA.puntaje_afinidad >= 80) clasificacion = 'avanza';
        else if (analisisIA.puntaje_afinidad >= 50) clasificacion = 'revision';

        const payload = {
          id: Date.now().toString(), // ID simulado robusto
          nombre_empresa: dataObj.nombre_empresa,
          inversion_proyectada: dataObj.inversion,
          empleos_proyectados: dataObj.empleos,
          fecha_solicitud: new Date().toISOString(),
          ia_puntaje: analisisIA.puntaje_afinidad,
          ia_justificacion: analisisIA.justificacion,
          clasificacion: clasificacion
          // No tiene reporte_cumplimiento aún
        };

        // 3. Guardar en JSON-Server
        try {
          const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!resp.ok) throw new Error("Fallo de red");
        } catch (e) {
          fallbackStorage.push(payload);
          localStorage.setItem('zofranca_solicitudes_instalacion', JSON.stringify(fallbackStorage));
        }

        renderFeedback(feedbackFase1, 'success', 'Solicitud Procesada', `Clasificación: <strong>${clasificacion.toUpperCase()}</strong>. Puntaje: ${analisisIA.puntaje_afinidad}.`);
        formFase1.reset();
        
        cargarYMostrarTabla(); // Actualiza panel global
      } catch (error) {
        console.error(error);
        renderFeedback(feedbackFase1, 'error', 'Error', 'Ocurrió un error al procesar la solicitud.');
      } finally {
        btnSubmitF1.disabled = false;
        btnSubmitF1.classList.remove('is-analyzing');
        btnTextF1.textContent = "Priorizar Perfil";
      }
    });

    /**
     * ==========================================
     * FASE 2: Auditoría y Cumplimiento (Instaladas)
     * ==========================================
     */

    formFase2.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const originalText = btnTextF2.textContent;
      btnSubmitF2.disabled = true;
      btnTextF2.textContent = "Guardando Reporte...";
      feedbackFase2.innerHTML = '';

      try {
        const formData = new FormData(formFase2);
        const empresaId = formData.get('empresa_id');
        const invReal = parseFloat(formData.get('inversion_real'));
        const empReal = parseInt(formData.get('empleos_actuales'), 10);

        const reporte = {
          inversion_real: invReal,
          empleos_reales: empReal,
          fecha_auditoria: new Date().toISOString()
        };

        // Hacer PATCH a Json-server
        try {
          const resp = await fetch(`${API_URL}/${empresaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reporte_cumplimiento: reporte })
          });
          if (!resp.ok) throw new Error("Fallo PATCH de red");
        } catch (err) {
          // Fallback PATCH
          const index = fallbackStorage.findIndex(x => x.id === empresaId);
          if (index !== -1) {
            fallbackStorage[index].reporte_cumplimiento = reporte;
            localStorage.setItem('zofranca_solicitudes_instalacion', JSON.stringify(fallbackStorage));
          }
        }

        renderFeedback(feedbackFase2, 'success', 'Auditoría Guardada', 'Se registraron los valores de cumplimiento con éxito.');
        formFase2.reset();
        
        cargarYMostrarTabla(); // Refrescar panel

      } catch (error) {
        console.error(error);
        renderFeedback(feedbackFase2, 'error', 'Error', 'No se pudo guardar el reporte de auditoría.');
      } finally {
        btnSubmitF2.disabled = false;
        btnTextF2.textContent = "Guardar Reporte y Auditar";
      }
    });


    /**
     * ==========================================
     * PANEL DE ANALISTA (Lectura y Cruce de Datos)
     * ==========================================
     */
    
    const cargarYMostrarTabla = async () => {
      tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando datos del servidor...</td></tr>';
      
      let data = [];
      let empresasData = [];
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Servidor Json-Server apagado");
        data = await response.json();
        
        const responseEmp = await fetch('http://localhost:3000/empresas');
        if (responseEmp.ok) {
          empresasData = await responseEmp.json();
        }
      } catch (err) {
        data = fallbackStorage;
      }

      // 1. Poblar el Select de la FASE 2 desde el catálogo de EMPRESAS
      selectEmpresa.innerHTML = '<option value="" disabled selected>Seleccione empresa (ID)</option>';
      const empresasParaSelect = empresasData.length > 0 ? empresasData : data; // Fallback
      empresasParaSelect.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.name || d.nombre_empresa} (${d.id})`;
        selectEmpresa.appendChild(opt);
      });

      // 2. Ordenar y Renderizar Tabla (Solicitudes de Instalación)
      data.sort((a, b) => b.ia_puntaje - a.ia_puntaje);

      if (data.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay empresas en el sistema.</td></tr>';
        return;
      }

      tablaBody.innerHTML = '';
      data.forEach(item => {
        
        // Compatibilidad con registros antiguos
        const rawPuntaje = item.ia_puntaje !== undefined ? item.ia_puntaje : (item.ia_metadata?.puntaje_afinidad || 0);
        const rawClasif = (item.clasificacion || item.ia_metadata?.clasificacion || 'indefinida').toUpperCase();
        const rawInvProy = item.inversion_proyectada !== undefined ? item.inversion_proyectada : (item.inversion || 0);
        const rawEmpProy = item.empleos_proyectados !== undefined ? item.empleos_proyectados : (item.empleos || 0);

        // Formateo visual Afinidad
        let scoreClass = 'score-med';
        if (rawPuntaje >= 80) scoreClass = 'score-high';
        else if (rawPuntaje < 50) scoreClass = 'score-low';

        // Lógica de Cruce y Auditoría Visual (Fase 2)
        const proyInv = formatCurrency(rawInvProy);
        const proyEmp = rawEmpProy;
        
        let visualInv = proyInv;
        let visualEmp = proyEmp;
        let statusBadge = `<span class="badge badge-status-pending">Pendiente Aud.</span>`;
        let isAlertRow = false;

        if (item.reporte_cumplimiento) {
          const realInv = formatCurrency(item.reporte_cumplimiento.inversion_real);
          const realEmp = item.reporte_cumplimiento.empleos_reales;
          
          const decInversion = item.reporte_cumplimiento.inversion_real < rawInvProy;
          const decEmpleos = item.reporte_cumplimiento.empleos_reales < rawEmpProy;

          const colorInv = decInversion ? 'text-danger' : 'text-success';
          const colorEmp = decEmpleos ? 'text-danger' : 'text-success';

          visualInv = `<span class="text-muted">${proyInv}</span> <br/> <strong class="${colorInv}">${realInv}</strong>`;
          visualEmp = `<span class="text-muted">${proyEmp}</span> <br/> <strong class="${colorEmp}">${realEmp}</strong>`;

          if (decInversion || decEmpleos) {
            statusBadge = `<span class="badge badge-status-alert">Incumplimiento</span>`;
            isAlertRow = true;
          } else {
            statusBadge = `<span class="badge badge-status-ok">Cumpliendo</span>`;
          }
        }

        const tr = document.createElement('tr');
        if (isAlertRow) tr.classList.add('row-alert'); // Activa background rojizo

        const safeClasifCss = rawClasif.toLowerCase() === 'indefinida' ? 'revision' : rawClasif.toLowerCase();

        tr.innerHTML = `
          <td><strong>${item.nombre_empresa}</strong><br><small class="text-muted">ID: ${item.id}</small></td>
          <td>${visualInv}</td>
          <td>${visualEmp}</td>
          <td class="afinidad-score ${scoreClass}">${rawPuntaje}</td>
          <td><span class="badge clasificacion-${safeClasifCss}">${rawClasif}</span></td>
          <td>${statusBadge}</td>
        `;
        tablaBody.appendChild(tr);
      });
    };

    // Eventos Iniciales
    btnRefreshTabla.addEventListener('click', cargarYMostrarTabla);
    cargarYMostrarTabla();

  });
})();
