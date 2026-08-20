document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo de Empleados cargado correctamente.");

    // Botón de Agregar Empleado
    const btnAgregar = document.getElementById('btnAgregarEmpleado');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            alert("Abriendo panel de registro de nuevo empleado...");
        });
    }

    // Interactividad en la paginación (ejemplo visual)
    const paginas = document.querySelectorAll('.page-num');
    paginas.forEach(pagina => {
        pagina.addEventListener('click', (e) => {
            paginas.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Simular clic en los elementos del menú lateral
    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            menuItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
});