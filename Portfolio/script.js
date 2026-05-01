/**
 * Tanzil Garg site — scroll reveal, nav spy, reduced motion
 */
;(function () {
  "use strict"

  const NAV_LINK_SELECTOR = ".site-nav__link[data-section]"
  const REVEAL_SELECTOR = "[data-reveal]"
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function setCurrentYear() {
    const el = document.getElementById("currentYear")
    if (el) el.textContent = String(new Date().getFullYear())
  }

  function initScrollReveal() {
    const nodes = document.querySelectorAll(REVEAL_SELECTOR)
    if (!nodes.length) return

    const prefersReduced = prefersReducedMotion()

    if (prefersReduced) {
      nodes.forEach((node) => node.classList.add("is-visible"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
          }
        })
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -6% 0px",
      }
    )

    nodes.forEach((node) => observer.observe(node))
  }

  function updateNavSpy() {
    const links = document.querySelectorAll(NAV_LINK_SELECTOR)
    if (!links.length) return
    const sectionIds = Array.from(links)
      .map((link) => link.getAttribute("data-section"))
      .filter(Boolean)

    const triggerY = window.scrollY + Math.min(window.innerHeight * 0.22, 160)
    let activeId = ""

    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const id = sectionIds[i]
      const section = document.getElementById(id)
      if (!section) continue
      const top = section.offsetTop
      if (top <= triggerY) {
        activeId = id
        break
      }
    }

    links.forEach((link) => {
      const sec = link.getAttribute("data-section")
      const isActive = sec === activeId && activeId !== ""
      link.classList.toggle("is-active", isActive)
      if (isActive) link.setAttribute("aria-current", "page")
      else link.removeAttribute("aria-current")
    })
  }

  let ticking = false
  function onScrollOrResize() {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(() => {
      updateNavSpy()
      ticking = false
    })
  }

  function initScrollSpy() {
    updateNavSpy()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize, { passive: true })
  }

  function initThemeToggle() {
    const toggle = document.querySelector(".theme-toggle")

    const saved = window.localStorage.getItem("site-view-mode")
    if (saved === "dark") {
      document.body.classList.add("is-dark")
    }

    if (!toggle) return

    if (document.body.classList.contains("is-dark")) {
      toggle.setAttribute("aria-pressed", "true")
      toggle.setAttribute("aria-label", "Switch to light color theme")
      toggle.textContent = "Light Theme"
    }

    toggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("is-dark")
      toggle.setAttribute("aria-pressed", String(isDark))
      toggle.setAttribute("aria-label", isDark ? "Switch to light color theme" : "Switch to dark color theme")
      toggle.textContent = isDark ? "Light Theme" : "Dark Theme"
      window.localStorage.setItem("site-view-mode", isDark ? "dark" : "light")
    })
  }

  function initMagneticTooltips() {
    const targets = document.querySelectorAll("[data-tooltip], .site-nav__link")
    if (!targets.length) return

    const tip = document.createElement("div")
    tip.className = "magnetic-tooltip"
    tip.setAttribute("role", "status")
    document.body.appendChild(tip)

    const defaultTips = {
      "selected-work": "Browse project folders",
      "featured-case-study": "Read the cover essay",
      process: "See the workflow orbit",
      about: "About the website",
      contact: "Get in touch",
    }

    function show(target, event) {
      const section = target.getAttribute("data-section")
      const label = target.getAttribute("data-tooltip") || defaultTips[section]
      if (!label) return
      tip.textContent = label
      move(event)
      tip.classList.add("is-visible")
    }

    function move(event) {
      tip.style.left = `${event.clientX}px`
      tip.style.top = `${event.clientY - 12}px`
    }

    targets.forEach((target) => {
      target.classList.add("magnetic-tip")
      target.addEventListener("pointerenter", (event) => show(target, event))
      target.addEventListener("pointermove", move)
      target.addEventListener("pointerleave", () => tip.classList.remove("is-visible"))
      target.addEventListener("focus", () => {
        const rect = target.getBoundingClientRect()
        show(target, { clientX: rect.left + rect.width / 2, clientY: rect.top })
      })
      target.addEventListener("blur", () => tip.classList.remove("is-visible"))
    })
  }

  function initFolders() {
    document.querySelectorAll(".work-card__link, .work-category__folder-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href")
        const card = link.closest(".work-card")
        if (card) card.classList.add("is-opening")
        playTinySound(180, 0.045, "sine")
        if (href && !href.startsWith("#") && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault()
          window.setTimeout(() => {
            window.location.href = href
          }, prefersReducedMotion() ? 0 : 360)
        }
      })
    })
  }

  let audioContext
  function playTinySound(frequency, duration, type) {
    if (prefersReducedMotion()) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    audioContext = audioContext || new AudioCtx()
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration)
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.start()
    osc.stop(audioContext.currentTime + duration)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }

  function init() {
    setCurrentYear()
    initScrollReveal()
    initScrollSpy()
    initThemeToggle()
    initMagneticTooltips()
    initFolders()
  }
})()
