/* Shree Dev — site behaviour.
   No dependencies. No network calls except the configured form endpoint. */
(function () {
  "use strict";

  var CFG = window.SHREEDEV || {};
  var DRAFT_KEY = "shreedev.intake.draft.v1";

  /* ---------- 1. hydrate contact details ---------- */
  function hydrateContact() {
    var el;
    el = document.querySelectorAll('[data-site="email"]');
    el.forEach(function (n) {
      if (CFG.email) {
        n.textContent = CFG.email;
        if (n.tagName === "A") n.href = "mailto:" + CFG.email;
      } else {
        /* Never render a "pending" placeholder in public: hide the element. */
        n.style.display = "none";
        n.removeAttribute("href");
      }
    });
    el = document.querySelectorAll('[data-site="phone"]');
    el.forEach(function (n) {
      if (CFG.phone) {
        n.textContent = CFG.phone;
        if (n.tagName === "A") n.href = "tel:" + CFG.phone.replace(/\s+/g, "");
      } else {
        /* Never render a "pending" placeholder in public: hide the element. */
        n.style.display = "none";
        n.removeAttribute("href");
      }
    });
    el = document.querySelectorAll('[data-site="city"]');
    el.forEach(function (n) { n.textContent = CFG.city || "Rajasthan"; });
    el = document.querySelectorAll('[data-site="cityRegion"]');
    el.forEach(function (n) { n.textContent = CFG.cityRegion || ""; });
  }

  /* ---------- 2. reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 3. intake form: save on every field ---------- */
  function readForm(form) {
    var out = {};
    new FormData(form).forEach(function (v, k) {
      if (out[k] === undefined) out[k] = v;
      else if (Array.isArray(out[k])) out[k].push(v);
      else out[k] = [out[k], v];
    });
    return out;
  }

  function saveDraft(form) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        savedAt: new Date().toISOString(),
        data: readForm(form)
      }));
    } catch (e) { /* storage may be blocked; not fatal */ }
  }

  function restoreDraft(form) {
    var raw;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) { return; }
    if (!raw) return;
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { return; }
    var d = parsed.data || {};
    Object.keys(d).forEach(function (k) {
      var v = d[k];
      var nodes = form.querySelectorAll('[name="' + k + '"]');
      if (!nodes.length) return;
      if (nodes.length === 1 && nodes[0].type === "checkbox") {
        nodes[0].checked = true;
      } else if (nodes.length === 1) {
        nodes[0].value = v;
      } else {
        var arr = Array.isArray(v) ? v : [v];
        nodes.forEach(function (n) {
          if (n.type === "checkbox" || n.type === "radio") n.checked = arr.indexOf(n.value) !== -1;
          else if (n.tagName === "SELECT") n.value = arr[0];
        });
      }
    });
    var banner = document.getElementById("draft-restored");
    if (banner) {
      banner.textContent = "Draft restored from " + new Date(parsed.savedAt).toLocaleString() +
        ". Keep going — nothing was lost.";
      banner.classList.add("show", "form-status--ok");
    }
  }

  function initForm() {
    var form = document.getElementById("intake-form");
    if (!form) return;

    restoreDraft(form);
    saveDraft(form);

    var statusEl = document.getElementById("form-status");
    var devBar = document.getElementById("dev-bar");
    var configured = !!(CFG.formEndpoint && CFG.formEndpoint.length > 6);

    if (!configured && devBar) devBar.hidden = false;

    form.addEventListener("input", function () { saveDraft(form); });
    form.addEventListener("change", function () { saveDraft(form); });

    function fail(fieldName, msg) {
      var wrap = form.querySelector('[data-field="' + fieldName + '"]');
      if (wrap) {
        wrap.classList.add("invalid");
        var e = wrap.querySelector(".err");
        if (e) e.textContent = msg;
      }
      return false;
    }

    function validate() {
      form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
      var ok = true;
      var v = function (n) {
        var el = form.querySelector('[name="' + n + '"]');
        return el ? (el.value || "").trim() : "";
      };
      if (v("business_name").length < 2) ok = fail("business_name", "Please enter your shop or business name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) ok = fail("email", "Please enter a valid email address.");
      if (v("phone").replace(/\D/g, "").length < 10) ok = fail("phone", "Please enter a 10-digit phone number.");
      if (v("category") === "") ok = fail("category", "Please choose the closest category.");
      var consent = form.querySelector('[name="consent"]');
      if (!consent.checked) {
        ok = false;
        showStatus("bad", "Please tick the consent box so we may contact you about this request.");
      }
      return ok;
    }

    function showStatus(kind, msg) {
      if (!statusEl) return;
      statusEl.className = "form-status show form-status--" + kind;
      statusEl.textContent = msg;
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!validate()) {
        showStatus("bad", "Please fix the highlighted fields above.");
        var first = form.querySelector(".field.invalid input, .field.invalid select");
        if (first) first.focus();
        return;
      }

      var payload = readForm(form);
      payload.submittedAt = new Date().toISOString();
      payload.source = "agency-site/start";

      if (!configured) {
        saveDraft(form);
        showStatus("ok",
          "Saved on this device. Nothing was sent to a server yet — the form endpoint is not " +
          "configured (see assets/config.js). This is the development state, not a live submission.");
        if (devBar) devBar.hidden = false;
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      var headers = { "Content-Type": "application/json" };
      if (CFG.formApiKey) {
        headers["apikey"] = CFG.formApiKey;
        headers["Authorization"] = "Bearer " + CFG.formApiKey;
        headers["Prefer"] = "return=minimal";
      }

      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        form.reset();
        showStatus("ok", "Received. We will reply within two working days with your demo link and next step.");
      }).catch(function (err) {
        showStatus("bad",
          "Could not send (" + err.message + "). Your answers are still saved on this device — " +
          "please try again, or email us.");
      }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = "Send my request"; }
      });
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    hydrateContact();
    initReveal();
    initForm();
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
