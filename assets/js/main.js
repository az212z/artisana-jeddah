/* ARTISANA International - main.js
   Guarded vanilla JS. Never hides content on error. */
(function () {
  "use strict";

  /* ---------- Full-screen mobile menu ---------- */
  var burger = document.getElementById("burgerBtn");
  var menu = document.getElementById("mobileMenu");
  var closeBtn = document.getElementById("closeMenuBtn");

  function openMenu() {
    if (!menu) return;
    menu.setAttribute("data-open", "true");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.setAttribute("data-open", "false");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.focus();
    }
    document.body.style.overflow = "";
  }

  if (burger && menu) {
    burger.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menu.querySelectorAll("[data-close]").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.getAttribute("data-open") === "true") closeMenu();
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver + fallback) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || prefersReduced || revealEls.length === 0) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety: guarantee visibility after 2.5s no matter what
    setTimeout(showAll, 2500);
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocused = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.setAttribute("src", src);
    lightboxImg.setAttribute("alt", alt || "");
    lightbox.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute("data-open", "false");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll(".gallery-item").forEach(function (item) {
    var img = item.querySelector("img");
    if (!img) return;
    function trigger() { openLightbox(img.getAttribute("src"), img.getAttribute("alt")); }
    item.addEventListener("click", trigger);
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); }
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.getAttribute("data-open") === "true") closeLightbox();
    });
  }

  /* ---------- Quote form (validation + localStorage demo + toast) ---------- */
  var form = document.getElementById("quoteForm");
  var toast = document.getElementById("toast");
  var toastMsg = document.getElementById("toastMsg");
  var toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    if (toastMsg && msg) toastMsg.textContent = msg;
    toast.setAttribute("data-show", "true");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.setAttribute("data-show", "false"); }, 4500);
  }

  function setError(fieldId, hasError) {
    var input = document.getElementById(fieldId);
    if (!input) return;
    var field = input.closest(".field");
    if (field) field.setAttribute("data-invalid", hasError ? "true" : "false");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name");
      var phone = document.getElementById("phone");
      var service = document.getElementById("service");
      var notes = document.getElementById("notes");
      var ok = true;
      var firstInvalid = null;

      if (!name || name.value.trim().length < 2) { setError("name", true); ok = false; firstInvalid = firstInvalid || name; }
      else setError("name", false);

      var phoneDigits = phone ? phone.value.replace(/\D/g, "") : "";
      if (phoneDigits.length < 9) { setError("phone", true); ok = false; firstInvalid = firstInvalid || phone; }
      else setError("phone", false);

      if (!service || !service.value) { setError("service", true); ok = false; firstInvalid = firstInvalid || service; }
      else setError("service", false);

      if (!ok) { if (firstInvalid && firstInvalid.focus) firstInvalid.focus(); return; }

      // Demo persistence
      try {
        var entry = {
          name: name.value.trim(),
          phone: phone.value.trim(),
          service: service.value,
          notes: notes ? notes.value.trim() : "",
          date: new Date().toISOString()
        };
        var key = "artisana_quotes";
        var list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push(entry);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (err) { /* storage may be blocked; ignore for demo */ }

      var btn = document.getElementById("submitBtn");
      if (btn) {
        var label = btn.textContent;
        btn.disabled = true;
        btn.textContent = "تم الإرسال ✓";
        setTimeout(function () { btn.disabled = false; btn.textContent = label; }, 2500);
      }
      form.reset();
      showToast("تم استلام طلبك. سنتواصل معك قريبًا.");
    });

    // Clear error on input
    ["name", "phone", "service"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", function () { setError(id, false); });
      if (el && el.tagName === "SELECT") el.addEventListener("change", function () { setError(id, false); });
    });
  }
})();
