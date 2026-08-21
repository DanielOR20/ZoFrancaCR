const fs = require('fs');
const path = require('path');

function replaceLink(filePath, originalStr, newStr) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(originalStr, newStr);
        fs.writeFileSync(filePath, content);
        console.log("Updated: " + filePath);
    }
}

// 1. Dashboard de Alex -> Enlazar a Empresas (nuestro)
const fileD = 'src/dashboard/dashboard.html';
const oldDashLink = `<a href="#" class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs font-medium">
          <i data-lucide="building-2" class="w-4 h-4"></i> Empresas
        </a>`;
const newDashLink = `<a href="../empresas/empresas.html" class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs font-medium">
          <i data-lucide="building-2" class="w-4 h-4"></i> Empresas
        </a>`;
replaceLink(fileD, oldDashLink, newDashLink);

// 1.1 Y agregar el enlace a Solicitudes bajo Usuarios
const oldDashUsers = `<a id="navUsers" href="../usuarios/usuarios.html" class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs font-medium">
          <i data-lucide="user-cog" class="w-4 h-4"></i> Usuarios
        </a>`;
const newDashUsers = `<a id="navUsers" href="../usuarios/usuarios.html" class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs font-medium">
          <i data-lucide="user-cog" class="w-4 h-4"></i> Usuarios
        </a>
        <a href="../solicitudes/solicitudes.html" class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs font-medium">
          <i data-lucide="file-text" class="w-4 h-4"></i> Solicitudes
        </a>`;
replaceLink(fileD, oldDashUsers, newDashUsers);


// 2. Usuarios de Alex -> Enlazar a Empresas (nuestro)
const fileU = 'src/usuarios/usuarios.html';
if(fs.existsSync(fileU)){
    replaceLink(fileU, oldDashLink, newDashLink);
    const oldUsrUsers = `<a href="../usuarios/usuarios.html" class="flex items-center gap-3 px-3 py-2.5 bg-sky-600 text-white rounded-lg text-xs font-medium">
          <i data-lucide="user-cog" class="w-4 h-4"></i> Usuarios
        </a>`;
    const newUsrUsers = `<a href="../usuarios/usuarios.html" class="flex items-center gap-3 px-3 py-2.5 bg-sky-600 text-white rounded-lg text-xs font-medium">
          <i data-lucide="user-cog" class="w-4 h-4"></i> Usuarios
        </a>
        <a href="../solicitudes/solicitudes.html" class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs font-medium">
          <i data-lucide="file-text" class="w-4 h-4"></i> Solicitudes
        </a>`;
    replaceLink(fileU, oldUsrUsers, newUsrUsers);
}

// 3. Solicitudes (nuestro) -> Enlazar a Dashboard y Usuarios de Alex
const fileS = 'src/solicitudes/solicitudes.html';
if(fs.existsSync(fileS)){
    let cS = fs.readFileSync(fileS, 'utf8');
    // Dashboard (esta a '../inicio/inicio.html')
    cS = cS.replace('<a href="../inicio/inicio.html" class="nav-link">', '<a href="../dashboard/dashboard.html" class="nav-link">');
    // Usuarios
    const usrRegex = /<a href="#" class="nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\s*<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"><\/path>\s*<circle cx="12" cy="7" r="4"><\/circle>\s*<\/svg>\s*<span>Usuarios<\/span>\s*<\/a>/s;
    const usrNew = `<a href="../usuarios/usuarios.html" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Usuarios</span>
            </a>`;
    cS = cS.replace(usrRegex, usrNew);
    fs.writeFileSync(fileS, cS);
    console.log("Updated: " + fileS);
}

// 4. Empresas (nuestro) -> Enlazar a Dashboard y Usuarios de Alex
const fileE = 'src/empresas/empresas.html';
if(fs.existsSync(fileE)){
    let cE = fs.readFileSync(fileE, 'utf8');
    // Dashboard (esta apuntando a "#")
    const dshRegex = /<a href="#" class="nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\s*<rect x="3" y="3" width="7" height="7"><\/rect>\s*<rect x="14" y="3" width="7" height="7"><\/rect>\s*<rect x="14" y="14" width="7" height="7"><\/rect>\s*<rect x="3" y="14" width="7" height="7"><\/rect>\s*<\/svg>\s*<span>Dashboard<\/span>\s*<\/a>/s;
    const dshNew = `<a href="../dashboard/dashboard.html" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard</span>
            </a>`;
    cE = cE.replace(dshRegex, dshNew);
    
    // Usuarios (apunta a "#")
    const usrRegexE = /<a href="#" class="nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\s*<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"><\/path>\s*<circle cx="12" cy="7" r="4"><\/circle>\s*<\/svg>\s*<span>Usuarios<\/span>\s*<\/a>/s;
    const usrNewE = `<a href="../usuarios/usuarios.html" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Usuarios</span>
            </a>`;
    cE = cE.replace(usrRegexE, usrNewE);
    
    // Solicitudes (apunta a "#")
    const solRegexE = /<a href="#" class="nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\s*<rect x="3" y="4" width="18" height="18" rx="2" ry="2"><\/rect>\s*<line x1="16" y1="2" x2="16" y2="6"><\/line>\s*<line x1="8" y1="2" x2="8" y2="6"><\/line>\s*<line x1="3" y1="10" x2="21" y2="10"><\/line>\s*<\/svg>\s*<span>Solicitudes<\/span>\s*<\/a>/s;
    const solNewE = `<a href="../solicitudes/solicitudes.html" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Solicitudes</span>
            </a>`;
    cE = cE.replace(solRegexE, solNewE);
    fs.writeFileSync(fileE, cE);
    console.log("Updated: " + fileE);
}
