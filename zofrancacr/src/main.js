import "./style.css";
import "./login/login.css";
import "./login/login.js";

import { getSession, appUrl } from "./auth/auth.js";

const app = document.querySelector("#app");

// Si ya hay una sesión válida, ir directamente al panel (navegación sin parpadeos).
if (getSession()) {
  window.location.replace(appUrl("dashboard"));
}

if (app) {
  app.innerHTML = `
    <main class="auth-page">
      <div class="auth-page__glow" aria-hidden="true"></div>
      <div class="auth-page__orb auth-page__orb--a" aria-hidden="true"></div>
      <div class="auth-page__orb auth-page__orb--b" aria-hidden="true"></div>

      <section class="auth-shell">
        <aside class="auth-brand">
          <div class="auth-brand__inner">
            <div class="auth-brand__badge" aria-label="ZoFranca Costa Rica">
              <svg class="auth-mascot" viewBox="0 0 120 120" aria-hidden="true">
                <ellipse cx="102" cy="36" rx="16" ry="7" transform="rotate(28 102 36)" fill="rgba(255,255,255,0.5)"/>
                <path d="M34 52 C26 20 20 18 38 34 C46 40 40 48 38 56 Z" fill="#2a6fd1"/>
                <path d="M86 52 C94 20 100 18 82 34 C74 40 80 48 82 56 Z" fill="#2a6fd1"/>
                <ellipse cx="60" cy="66" rx="36" ry="33" fill="#3a86ee"/>
                <ellipse cx="60" cy="74" rx="27" ry="24" fill="#5b9dff"/>
                <ellipse cx="45" cy="72" rx="8.5" ry="12" fill="#0b2f6b"/>
                <ellipse cx="75" cy="72" rx="8.5" ry="12" fill="#0b2f6b"/>
                <circle cx="42" cy="67" r="2.6" fill="#fff"/>
                <circle cx="72" cy="67" r="2.6" fill="#fff"/>
                <circle cx="60" cy="86" r="4.5" fill="#0f2f4a"/>
                <path d="M54 95 Q60 99 66 95" fill="none" stroke="#0f2f4a" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
              <span class="auth-brand__name"><strong>ZO</strong><em>FRANCA</em><small>COSTA RICA</small></span>
            </div>
            <p class="auth-brand__tag">Ohana significa familia. Accede a tu cuenta para gestionar todo de forma limpia, segura y sin parpadeos.</p>
          </div>
        </aside>

        <section class="auth-card">
          <div class="auth-card__topbar" role="tablist" aria-label="Acceso">
            <button class="auth-pill auth-pill--active" type="button" role="tab" data-view-tab="login">Iniciar sesi&oacute;n</button>
            <button class="auth-pill" type="button" role="tab" data-view-tab="register">Registrarse</button>
          </div>

          <div class="auth-panel auth-panel--active" data-view="login">
            <div class="auth-heading">
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa tu correo y contrase&ntilde;a para continuar.</p>
            </div>
            <p class="auth-alert" id="loginAlert" role="status" aria-live="polite"></p>
            <form class="auth-form" id="loginForm" novalidate>
              <label class="field">
                <span class="field__label">Correo electr&oacute;nico</span>
                <input type="email" name="email" placeholder="usuario@empresa.com" autocomplete="email" required>
              </label>
              <label class="field">
                <span class="field__label">Contrase&ntilde;a</span>
                <div class="password-field">
                  <input id="loginPassword" type="password" name="password" placeholder="••••••••" autocomplete="current-password" required>
                  <button class="icon-button" type="button" data-password-toggle aria-label="Mostrar contraseña">
                    <svg class="icon-eye icon-eye--open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>
                    <svg class="icon-eye icon-eye--closed" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18"></path><path d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3 3.7"></path><path d="M6.2 6.2C3.6 8 2 12 2 12s3.5 6 10 6c.8 0 1.5-.1 2.2-.3"></path></svg>
                  </button>
                </div>
              </label>
              <div class="form-row">
                <label class="check"><input type="checkbox" name="remember"><span>Recordarme</span></label>
                <a href="#" class="link">&iquest;Olvidaste tu contrase&ntilde;a?</a>
              </div>
              <button class="primary-button" type="submit"><span class="btn-label">Ingresar</span><span class="spinner" aria-hidden="true"></span></button>
            </form>
          </div>

          <div class="auth-panel" data-view="register">
            <div class="auth-heading">
              <h2>Crear cuenta</h2>
              <p>Tu cuenta quedar&aacute; <strong>pendiente de aprobaci&oacute;n</strong> por el administrador.</p>
            </div>
            <p class="auth-alert" id="registerAlert" role="status" aria-live="polite"></p>
            <form class="auth-form" id="registerForm" novalidate>
              <label class="field">
                <span class="field__label">Nombre completo</span>
                <input type="text" name="name" placeholder="Tu nombre completo" autocomplete="name" required>
              </label>
              <label class="field">
                <span class="field__label">Correo electr&oacute;nico</span>
                <input type="email" name="email" placeholder="correo@dominio.com" autocomplete="email" required>
              </label>
              <label class="field">
                <span class="field__label">Contrase&ntilde;a</span>
                <div class="password-field">
                  <input id="registerPassword" type="password" name="password" placeholder="M&iacute;nimo 6 caracteres" autocomplete="new-password" required>
                  <button class="icon-button" type="button" data-password-toggle aria-label="Mostrar contraseña">
                    <svg class="icon-eye icon-eye--open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>
                    <svg class="icon-eye icon-eye--closed" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18"></path><path d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3 3.7"></path><path d="M6.2 6.2C3.6 8 2 12 2 12s3.5 6 10 6c.8 0 1.5-.1 2.2-.3"></path></svg>
                  </button>
                </div>
              </label>
              <button class="primary-button" type="submit"><span class="btn-label">Registrarse</span><span class="spinner" aria-hidden="true"></span></button>
            </form>
          </div>

          <p class="switch-copy">
            <span data-switch-copy>&iquest;No tienes cuenta? </span>
            <a href="#" class="link" data-switch-link>Registrarse</a>
          </p>
        </section>
      </section>
    </main>
  `;
}
