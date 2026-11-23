// ==========================================================================
// Emmanuel Olaleye (@manuelextra) — Campaign Interactivity
// ==========================================================================

(function () {
  // 1. Mobile Navigation Drawer
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 2. Scroll Reveal Observer
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // 3. Lookbook Story Lightbox
  const lookCards = Array.from(document.querySelectorAll(".look-card"));
  const lightbox = document.getElementById("lightbox");
  const lightboxBackdrop = document.getElementById("lightboxBackdrop");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxTag = document.getElementById("lightboxTag");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxStory = document.getElementById("lightboxStory");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let activeIndex = 0;

  function openLightbox(index) {
    if (!lookCards.length || !lightbox) return;
    activeIndex = (index + lookCards.length) % lookCards.length;
    const card = lookCards[activeIndex];

    lightboxImg.src = card.dataset.image || "";
    lightboxImg.alt = card.dataset.title || "Lookbook Portrait";
    lightboxTag.textContent = card.dataset.tag || "";
    lightboxTitle.textContent = card.dataset.title || "";
    lightboxStory.textContent = card.dataset.story || "";

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  lookCards.forEach((card, idx) => {
    card.addEventListener("click", () => openLightbox(idx));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => openLightbox(activeIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => openLightbox(activeIndex + 1));

  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openLightbox(activeIndex - 1);
    if (e.key === "ArrowRight") openLightbox(activeIndex + 1);
  });

  // 4. Supporter Pledge Counter & Share Actions
  const pledgeBtn = document.getElementById("pledgeBtn");
  const pledgeBtnText = document.getElementById("pledgeBtnText");
  const pledgeCountEl = document.getElementById("pledgeCount");
  const pledgeFeedback = document.getElementById("pledgeFeedback");
  const copyShareBtn = document.getElementById("copyShareBtn");
  const whatsappShareLink = document.getElementById("whatsappShareLink");

  const STORAGE_KEY = "emmanuel_campaign_pledged";
  const LOCAL_COUNT_KEY = "emmanuel_campaign_local_count";
  const COUNTER_NAMESPACE = "manuelextra-caclha-fashion-2026";
  const COUNTER_KEY = "votes";
  const COUNTER_GET_URL = `https://abacus.jasoncameron.dev/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;
  const COUNTER_HIT_URL = `https://abacus.jasoncameron.dev/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;

  const shareText =
    "I just pledged my vote for Emmanuel Olaleye (@manuelextra) for Most Fashionable Male at CAC Lighthouse Youth Fellowship! Clean code, sharper style, and a story of grace. Go cast yours too!";

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  if (whatsappShareLink) {
    whatsappShareLink.href = whatsappUrl;
  }

  let currentCount = Number(localStorage.getItem(LOCAL_COUNT_KEY)) || 0;

  function renderPledgeUI(count) {
    const increased = count > currentCount;
    currentCount = count;
    localStorage.setItem(LOCAL_COUNT_KEY, String(count));
    if (pledgeCountEl) {
      pledgeCountEl.textContent = String(count);
      if (increased) {
        pledgeCountEl.classList.remove("bump");
        void pledgeCountEl.offsetWidth;
        pledgeCountEl.classList.add("bump");
      }
    }
    const hasPledged = localStorage.getItem(STORAGE_KEY) === "true";
    if (hasPledged && pledgeBtnText) {
      pledgeBtnText.textContent = "Vote Pledged — Notify on WhatsApp ✦";
    }
  }

  async function fetchLiveCount() {
    try {
      const res = await fetch(COUNTER_GET_URL, { cache: "no-store" });
      const data = await res.json();
      if (typeof data.value === "number") {
        renderPledgeUI(data.value);
      } else if (data.error === "Key not found") {
        renderPledgeUI(0);
      }
    } catch {
      // Offline or blocked: keep local fallback count
    }
  }

  renderPledgeUI(currentCount);
  fetchLiveCount();

  // Keep vote count synced in real time across all visitors
  setInterval(() => {
    if (document.visibilityState === "visible") {
      fetchLiveCount();
    }
  }, 4000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      fetchLiveCount();
    }
  });

  if (pledgeBtn) {
    pledgeBtn.addEventListener("click", async () => {
      localStorage.setItem(STORAGE_KEY, "true");
      renderPledgeUI(currentCount + 1);

      // Increment shared live counter in the background
      try {
        const res = await fetch(COUNTER_HIT_URL, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.value === "number") {
            renderPledgeUI(data.value);
          }
        }
      } catch {
        // Keep optimistic local increment
      }

      if (pledgeFeedback) {
        pledgeFeedback.textContent =
          "Your vote is counted! Opening WhatsApp so you can notify Emmanuel or share with your chat.";
      }

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  }

  if (copyShareBtn) {
    copyShareBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(shareText);
        const original = copyShareBtn.textContent;
        copyShareBtn.textContent = "Copied to Clipboard!";
        setTimeout(() => {
          copyShareBtn.textContent = original;
        }, 2200);
      } catch {
        if (pledgeFeedback) {
          pledgeFeedback.textContent = shareText;
        }
      }
    });
  }

  // 5. Subtle Gold Dust Particles (Echoing the Nominee Poster)
  const canvas = document.getElementById("gold-dust");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    const COUNT = 38;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.5,
        vy: Math.random() * 0.25 + 0.08,
        alpha: Math.random() * 0.6 + 0.2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 229, 171, ${p.alpha})`;
        ctx.fill();
        p.y -= p.vy;
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();
    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });
  }
})();

