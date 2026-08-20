document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll("[data-view-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-view]"));
  const switchLink = document.querySelector("[data-switch-link]");
  const switchCopy = document.querySelector("[data-switch-copy]");
  const passwordToggle = document.querySelector("[data-password-toggle]");
  const passwordInput = document.getElementById("loginPassword");
  const registerRoleSelect = document.getElementById("registerRoleSelect");

  const setView = (view) => {
    tabs.forEach((tab) => {
      tab.classList.toggle("auth-pill--active", tab.dataset.viewTab === view);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("auth-panel--active", panel.dataset.view === view);
    });

    if (switchLink && switchCopy) {
      const loginView = view === "login";
      switchCopy.textContent = loginView ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? ";
      switchLink.textContent = loginView ? "Registrarse" : "Iniciar sesión";
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.viewTab));
  });

  if (switchLink) {
    switchLink.addEventListener("click", (event) => {
      event.preventDefault();
      const nextView = document.querySelector('[data-view="login"]')?.classList.contains("auth-panel--active")
        ? "register"
        : "login";
      setView(nextView);
    });
  }

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const visible = passwordInput.type === "text";
      passwordInput.type = visible ? "password" : "text";
      passwordToggle.classList.toggle("is-visible", !visible);
      passwordToggle.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
    });
  }

  if (registerRoleSelect) {
    registerRoleSelect.addEventListener("change", () => {
      registerRoleSelect.dataset.selected = registerRoleSelect.value;
    });
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => event.preventDefault());
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => event.preventDefault());
  }

  setView("login");
});
