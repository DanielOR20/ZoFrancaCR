import { login, register, appUrl } from "../auth/auth.js";

const MESSAGES = {
  invalid: "Correo o contraseña incorrectos.",
  pending: "Tu cuenta está pendiente de aprobación por el administrador.",
  rejected: "Tu cuenta ha sido rechazada por el administrador. No puedes acceder.",
  duplicate: "Ya existe una cuenta con ese correo. Intenta iniciar sesión.",
};

document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll("[data-view-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-view]"));
  const switchLinks = Array.from(document.querySelectorAll("[data-switch-link]"));
  const switchCopies = Array.from(document.querySelectorAll("[data-switch-copy]"));

  const setMessage = (id, type, text) => {
    const box = document.getElementById(id);
    if (!box) return;
    if (text) {
      box.textContent = text;
      box.dataset.type = type;
      box.classList.add("is-visible");
    } else {
      box.textContent = "";
      box.classList.remove("is-visible");
    }
  };

  const setView = (view) => {
    tabs.forEach((t) => t.classList.toggle("auth-pill--active", t.dataset.viewTab === view));
    panels.forEach((p) => p.classList.toggle("auth-panel--active", p.dataset.view === view));
    switchCopies.forEach((_, i) => {
      const loginView = view === "login";
      switchCopies[i].textContent = loginView ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? ";
      switchLinks[i].textContent = loginView ? "Registrarse" : "Iniciar sesión";
    });
    setMessage("loginAlert");
    setMessage("registerAlert");
  };

  tabs.forEach((t) => t.addEventListener("click", () => setView(t.dataset.viewTab)));
  switchLinks.forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const loginActive = document.querySelector('[data-view="login"]')?.classList.contains("auth-panel--active");
      setView(loginActive ? "register" : "login");
    })
  );

  // Mostrar / ocultar contraseña.
  document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    const input = toggle.closest(".password-field")?.querySelector("input");
    if (!input) return;
    toggle.addEventListener("click", () => {
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      toggle.classList.toggle("is-visible", !visible);
      toggle.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
    });
  });

  // Estado de carga del botón.
  const setPending = (btn, busy) => {
    if (!btn) return;
    btn.disabled = busy;
    btn.classList.toggle("is-loading", busy);
  };
  const val = (form, name) => (form.querySelector(`[name="${name}"]`)?.value || "").trim();

  // ---- Iniciar sesión ----
  const loginForm = document.getElementById("loginForm");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = val(loginForm, "email");
    const password = val(loginForm, "password");
    const btn = loginForm.querySelector('button[type="submit"]');
    if (!email || !password) {
      setMessage("loginAlert", "error", "Ingresa tu correo y tu contraseña.");
      return;
    }
    setPending(btn, true);
    setMessage("loginAlert", "info", "Verificando credenciales…");
    try {
      const res = await login(email, password);
      if (res.ok) {
        setMessage("loginAlert", "success", `¡Hola ${res.session.name}! Redirigiendo…`);
        setTimeout(() => { window.location.href = appUrl("dashboard"); }, 600);
      } else {
        setPending(btn, false);
        setMessage("loginAlert", "error", MESSAGES[res.code] || "No se pudo iniciar sesión.");
      }
    } catch (err) {
      setPending(btn, false);
      setMessage("loginAlert", "error", "No se pudo conectar con el servidor. Verifica que json-server esté activo.");
      console.error(err);
    }
  });

  // ---- Registrarse ----
  const registerForm = document.getElementById("registerForm");
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = val(registerForm, "name");
    const email = val(registerForm, "email");
    const password = val(registerForm, "password");
    const btn = registerForm.querySelector('button[type="submit"]');

    if (!name || !email || !password) {
      setMessage("registerAlert", "error", "Completa todos los campos.");
      return;
    }
    if (password.length < 6) {
      setMessage("registerAlert", "error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setPending(btn, true);
    setMessage("registerAlert", "info", "Creando tu cuenta…");
    try {
      const res = await register({ name, email, password });
      setPending(btn, false);
      if (res.ok) {
        setMessage("registerAlert", "success", "Registro exitoso. Tu cuenta quedó pendiente de aprobación.");
        // El correo se precarga en el formulario de inicio de sesión al cambiar de vista.
        setTimeout(() => {
          setView("login");
          const loginEmail = document.querySelector('[data-view="login"] input[name="email"]');
          if (loginEmail) loginEmail.value = email;
          setMessage("loginAlert", "info", "Cuenta creada. Inicia sesión cuando el administrador la apruebe.");
        }, 700);
      } else {
        setMessage("registerAlert", "error", MESSAGES[res.code] || "No se pudo crear la cuenta.");
      }
    } catch (err) {
      setPending(btn, false);
      setMessage("registerAlert", "error", "No se pudo conectar con el servidor. Verifica que json-server esté activo.");
      console.error(err);
    }
  });

  setView("login");
});
