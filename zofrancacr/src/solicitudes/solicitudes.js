document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo de Solicitudes inicializado correctamente.");

    const btnNueva = document.getElementById('btnNuevaSolicitud');
    if (btnNueva) {
        btnNueva.addEventListener('click', () => {
            alert("Abriendo formulario para crear nueva solicitud interna...");
        });
    }

    const botonesVer = document.querySelectorAll('.btn-action-view');
    botonesVer.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fila = e.target.closest('tr');
            const idReq = fila.querySelector('.req-id').textContent;
            alert(`Visualizando detalles de la solicitud: ${idReq}`);
        });
    });
});