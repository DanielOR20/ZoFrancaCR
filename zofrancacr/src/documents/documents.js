document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo de Documentos inicializado correctamente.");

    const btnUpload = document.getElementById('btnBulkUpload');
    if (btnUpload) {
        btnUpload.addEventListener('click', () => {
            alert("Abriendo ventana de carga masiva de archivos...");
        });
    }

    const botonesAccion = document.querySelectorAll('.btn-icon');
    botonesAccion.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tituloDoc = e.target.closest('tr').querySelector('.doc-title').textContent;
            const accion = e.target.getAttribute('title');
            alert(`Acción '${accion}' seleccionada para el documento: ${tituloDoc}`);
        });
    });
});