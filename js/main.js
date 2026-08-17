/* ==========================================================================
   Songlap — main.js
   Shared behaviour for every page: custom cursor, hero/contact slideshow,
   section-level reveal-on-scroll, homepage side nav, magnetic buttons,
   header scroll state, and the single social-links data source consumed
   by every social list on the site (footer + contact page).
   Vanilla JS, no dependencies, no build step.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
   * Social links — single source of truth. Both the footer (every page)
   * and the contact page's "Social Presence" column render from this
   * same array, in this order, so the priority list only lives here.
   * ---------------------------------------------------------------- */
  var SOCIAL_LINKS = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/paulsonglap?igsh=MTVkMTJtcXp3YjRpcw==",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.1" cy="6.9" r="0.9" fill="currentColor" stroke="none"/></svg>',
    },
    {
      name: "Flickr",
      url: "https://flickr.com/photos/196367894@N05",
      icon:
        '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="6.6" cy="12" r="5.1"/><circle cx="17.4" cy="12" r="5.1"/></svg>',
    },
    {
      name: "Behance",
      url: "https://www.behance.net/songlapmpaul",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M9 8.2h3.3a1.9 1.9 0 0 1 0 3.8H9zM9 12h3.7a1.9 1.9 0 0 1 0 3.8H9z"/></svg>',
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=61592126634239&mibextid=ZbWKwL",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M13.6 19v-6.3h2.1l.3-2.4h-2.4v-1.5c0-.7.2-1.2 1.2-1.2h1.3V5.5c-.2 0-1-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v1.7h-2.1v2.4h2.1V19z"/></svg>',
    },
    {
      name: "Shutterstock",
      url: "https://www.shutterstock.com/g/iamSonglap",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8 15.8 10.76 14.35 15.24 9.65 15.24 8.2 10.76Z" fill="currentColor" stroke="none"/></svg>',
    },
  ];

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderSocialLists() {
    var containers = document.querySelectorAll("[data-social-list]");
    containers.forEach(function (el) {
      var expanded = el.getAttribute("data-social-list") === "expanded";
      el.classList.add("social-list");
      if (expanded) el.classList.add("social-list--expanded");
      var html = SOCIAL_LINKS.map(function (link) {
        var name = escapeAttr(link.name);
        var url = escapeAttr(link.url);
        var labelHtml = expanded
          ? link.icon + "<span>" + name + "</span>"
          : link.icon + '<span class="visually-hidden">' + name + "</span>";
        return (
          '<li><a class="social-list__link" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          name +
          '" title="' +
          name +
          '">' +
          labelHtml +
          "</a></li>"
        );
      }).join("");
      el.innerHTML = html;
    });
  }

  /* ------------------------------------------------------------------
   * Custom cursor — one element, three states (default / link / gallery).
   * Position tracked via a raw rAF loop so movement never feels laggy;
   * only the morph transitions (width/height/border) are eased in CSS.
   * Disabled entirely for touch/coarse-pointer devices.
   * ---------------------------------------------------------------- */
  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    var cursor = document.getElementById("cursor");
    if (!cursor) return;

    document.body.classList.add("has-custom-cursor");

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;

    window.addEventListener(
      "mousemove",
      function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Un-hide on every move, not just the first one ever. The old
        // one-time "hasMoved" gate meant that after ANY later
        // mouseleave (switching tabs, touching the URL bar, opening
        // dev tools, even brushing a scrollbar in some browsers) the
        // cursor would hide and then never be told to reappear again —
        // which is exactly what "sometimes disappears" was.
        cursor.classList.remove("cursor--hidden");
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      cursor.classList.add("cursor--hidden");
    });

    function render() {
      // Both translates must live in the SAME transform string — setting
      // style.transform wipes out whatever the stylesheet had (including
      // the -50%,-50% centering), so it has to be reasserted here every
      // frame alongside the position. Without this, the cursor's
      // top-left corner (not center) tracks the mouse, and the visible
      // offset grows every time the ring resizes between states.
      cursor.style.transform =
        "translate(" + mouseX + "px, " + mouseY + "px) translate(-50%, -50%)";
      requestAnimationFrame(render);
    }
    cursor.classList.add("cursor--hidden");
    requestAnimationFrame(render);

    function bindHoverClass(selector, className) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.addEventListener("mouseenter", function () {
          cursor.classList.add(className);
        });
        el.addEventListener("mouseleave", function () {
          cursor.classList.remove(className);
        });
      });
    }

    bindHoverClass(".gallery-item", "cursor--gallery");
    bindHoverClass(
      "a, button, .side-nav__item, .magnetic",
      "cursor--link"
    );
  }

  /* ------------------------------------------------------------------
   * Header — glass state after a small scroll threshold.
   * ---------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ------------------------------------------------------------------
   * Slideshow — generic crossfade cycler. Supports multiple independent
   * instances per page (used for the hero and, on the contact page, the
   * muted background — same image set, same mechanism, per the brief).
   * ---------------------------------------------------------------- */
  function initSlideshows() {
    document.querySelectorAll("[data-slideshow]").forEach(function (wrap) {
      var slides = wrap.querySelectorAll(".slideshow__slide");
      if (slides.length < 2) return;
      var current = 0;
      if (prefersReducedMotion) return; // first slide stays put
      setInterval(function () {
        slides[current].classList.remove("is-active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("is-active");
      }, 7000);
    });
  }

  /* ------------------------------------------------------------------
   * Magnetic buttons — nudge toward the cursor while hovered, spring
   * back on leave. (Unifies the two slightly different implementations
   * found in the original samples — only one of the two pages actually
   * had working JS for this — into one consistent, working version used
   * everywhere `.magnetic` appears.)
   * ---------------------------------------------------------------- */
  function initMagnetic() {
    if (prefersReducedMotion) return;
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var box = btn.getBoundingClientRect();
        var x = e.clientX - box.left - box.width / 2;
        var y = e.clientY - box.top - box.height / 2;
        btn.style.transform = "translate(" + x * 0.3 + "px, " + y * 0.3 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ------------------------------------------------------------------
   * Reveal on scroll — the contact page's hero card only. One observed
   * unit, reversible (mirrors current intersection state rather than
   * firing once and detaching). Gallery sections use a different,
   * scroll-position-driven mechanism instead — see
   * initGalleryScrollReveal below.
   * ---------------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll(".reveal-simple");
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -22% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
   * Gallery section reveal — scroll-position-driven, not timer-driven.
   * Each section's progress (0 to 1) is computed directly from how far
   * its top edge has scrolled through a fixed-size zone relative to the
   * viewport, and applied straight to opacity/filter/transform on every
   * scroll frame — no CSS transition involved, since a transition would
   * just lag a step behind the per-frame value instead of matching it.
   * That means: scroll slowly and the reveal happens slowly, scroll
   * fast and it keeps up, reverse direction mid-reveal and it reverses
   * from exactly where it was, stop scrolling and it holds in place.
   *
   * Zone: progress is 0 the instant a section's top edge reaches the
   * bottom of the viewport (as early as it can start, since there's
   * nothing to reveal before that), and reaches 1 once that top edge
   * has scrolled up to the viewport's vertical middle — half a
   * viewport-height of scroll distance for the transition to complete.
   * Once a section is fully settled it just stays that way while its
   * own (often much taller) content scrolls past underneath.
   *
   * The animated properties live on .gallery-section__reveal, a child
   * of .gallery-section — not on .gallery-section itself — because an
   * earlier version measured getBoundingClientRect() on the very
   * element carrying the transform, which fed the reveal's own motion
   * back into its trigger condition and caused a visible vibrating/
   * duplicating flicker. Reading position from the stable outer section
   * and applying style only to the inner wrapper avoids that entirely.
   * ---------------------------------------------------------------- */
  function initGalleryScrollReveal() {
    var sections = document.querySelectorAll(".gallery-section");
    if (!sections.length) return;

    var items = Array.prototype.map
      .call(sections, function (section) {
        var wrap = section.querySelector(".gallery-section__reveal");
        return wrap ? { section: section, wrap: wrap, lastProgress: -1 } : null;
      })
      .filter(Boolean);

    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach(function (it) {
        it.wrap.style.opacity = "1";
        it.wrap.style.filter = "none";
        it.wrap.style.transform = "none";
      });
      return;
    }

    var MAX_BLUR = 26;
    var MAX_TRANSLATE = 100;
    var MAX_SCALE = 0.16;

    function update() {
      // Start point unchanged: progress 0 the instant a section's top
      // edge reaches the bottom of the viewport. End point moved to
      // the viewport's vertical middle instead of its top, halving the
      // scroll distance the transition spans — same trigger moment,
      // half the distance to complete, which is what "half the
      // duration" / "twice as fast" mean for a scroll-linked effect
      // that has no literal time component to shorten.
      var startAt = window.innerHeight;
      var endAt = window.innerHeight * 0.5;
      var span = startAt - endAt;

      items.forEach(function (it) {
        var top = it.section.getBoundingClientRect().top;
        var progress = (startAt - top) / span;
        if (progress < 0) progress = 0;
        else if (progress > 1) progress = 1;

        // Skip imperceptible changes so fully-settled or far-off
        // sections (the vast majority at any given scroll moment)
        // don't get restyled every single frame.
        if (Math.abs(progress - it.lastProgress) < 0.003) return;
        it.lastProgress = progress;

        var remaining = 1 - progress;
        var blur = MAX_BLUR * remaining;
        var translateY = -1 * MAX_TRANSLATE * remaining;
        var scale = 1 + MAX_SCALE * remaining;

        it.wrap.style.opacity = progress.toFixed(3);
        it.wrap.style.filter = blur > 0.3 ? "blur(" + blur.toFixed(1) + "px)" : "none";
        it.wrap.style.transform =
          "translateY(" + translateY.toFixed(1) + "px) scale(" + scale.toFixed(4) + ")";
      });
    }

    var ticking = false;
    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  }

  /* ------------------------------------------------------------------
   * Side navigation — homepage only. Highlights the in-view section and
   * fades a label in beside the hovered icon (CSS handles the label
   * transition; this just tracks which section is active).
   * ---------------------------------------------------------------- */
  function initSideNav() {
    var nav = document.querySelector(".side-nav");
    if (!nav) return;
    var allItems = Array.prototype.slice.call(nav.querySelectorAll(".side-nav__item"));

    // Pair each item with its section directly (rather than two parallel
    // arrays) so an item with no data-target — like Contact, which now
    // links straight to the contact page instead of an in-page anchor —
    // can be skipped without shifting the correspondence between every
    // other item and its section.
    var pairs = allItems
      .map(function (item) {
        var id = item.getAttribute("data-target");
        return { item: item, section: id ? document.getElementById(id) : null };
      })
      .filter(function (pair) {
        return pair.section;
      });

    if (!pairs.length) return;

    // Sections routinely run taller than the viewport (a gallery can be
    // several screens tall), so a normal "50% visible" threshold would
    // never fire for most of them — it's asking for more of the element
    // to be in view than the viewport can ever show at once. Instead,
    // watch a thin horizontal band across the vertical middle of the
    // viewport and activate whichever section is passing through it.
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var pair = pairs.filter(function (p) {
            return p.section === entry.target;
          })[0];
          if (!pair) return;
          if (entry.isIntersecting) {
            allItems.forEach(function (it) {
              it.classList.remove("is-active");
            });
            pair.item.classList.add("is-active");
          }
        });
      },
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
    );

    pairs.forEach(function (pair) {
      observer.observe(pair.section);
    });
  }

  /* ------------------------------------------------------------------
   * Masonry grid layout — true shortest-column placement, computed
   * here and applied as absolute-position coordinates (see the
   * .masonry-grid.is-laid-out rules in css/main.css). This replaced an
   * earlier version built on CSS Grid's grid-auto-flow:dense with a
   * JS-computed row-span per item: "dense" fills gaps by scanning
   * row-by-row, which is NOT the same as true bin-packing, and with
   * images this varied in aspect ratio — plus some spanning two
   * columns — it was visibly leaving gaps between images. This version
   * tracks each column's current height directly and always places the
   * next item into whichever column (or column-pair, for a "wide"
   * item) is currently shortest, which is what actually guarantees a
   * tight pack. Aspect ratio comes from the width/height attributes
   * already on each <img>, so there's no need to wait for the image
   * itself to load. Re-runs on resize since column width changes
   * continuously, not just at breakpoints.
   * ---------------------------------------------------------------- */
  function initMasonryGrids() {
    var grids = document.querySelectorAll(".masonry-grid");
    if (!grids.length) return;

    function getColumnCount() {
      if (window.matchMedia("(min-width: 1024px)").matches) return 3;
      if (window.matchMedia("(min-width: 640px)").matches) return 2;
      return 1;
    }

    function getGapPx() {
      var val = getComputedStyle(document.documentElement).getPropertyValue("--gutter-gallery");
      return parseFloat(val) || 0;
    }

    function layoutGrid(grid) {
      var items = grid.querySelectorAll(".gallery-item");
      if (!items.length) return;

      grid.classList.add("is-laid-out");

      var columns = getColumnCount();
      var gap = getGapPx();
      var gridWidth = grid.clientWidth;
      var colWidth = (gridWidth - gap * (columns - 1)) / columns;
      var colHeights = new Array(columns).fill(0);

      items.forEach(function (item) {
        var img = item.querySelector("img");
        if (!img) return;
        var w = parseFloat(img.getAttribute("width"));
        var h = parseFloat(img.getAttribute("height"));
        if (!w || !h) return;

        var isWide = columns >= 2 && item.classList.contains("gallery-item--wide");
        var span = isWide ? Math.min(2, columns) : 1;
        var itemWidth = colWidth * span + gap * (span - 1);
        var itemHeight = itemWidth * (h / w);

        // Among every valid starting column for this item's span, pick
        // the one whose tallest occupied column is currently lowest —
        // i.e. the position that lets this item start as high as
        // possible, which is the whole trick to keeping the pack tight.
        var bestStart = 0;
        var bestTop = Infinity;
        for (var start = 0; start <= columns - span; start++) {
          var windowMax = 0;
          for (var i = start; i < start + span; i++) {
            if (colHeights[i] > windowMax) windowMax = colHeights[i];
          }
          if (windowMax < bestTop) {
            bestTop = windowMax;
            bestStart = start;
          }
        }

        var left = bestStart * (colWidth + gap);
        var top = bestTop;

        item.style.width = itemWidth + "px";
        item.style.height = itemHeight + "px";
        item.style.transform = "translate(" + left + "px, " + top + "px)";

        var newHeight = top + itemHeight + gap;
        for (var j = bestStart; j < bestStart + span; j++) {
          colHeights[j] = newHeight;
        }
      });

      var maxHeight = 0;
      for (var k = 0; k < colHeights.length; k++) {
        if (colHeights[k] > maxHeight) maxHeight = colHeights[k];
      }
      grid.style.height = Math.max(0, maxHeight - gap) + "px";
    }

    function layoutAll() {
      grids.forEach(layoutGrid);
    }

    layoutAll();

    var resizeTimer;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layoutAll, 150);
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------
   * Gallery caption reveal on touch devices — :hover doesn't
   * meaningfully exist on a touchscreen, so without this, captions
   * (and the "highlight" scrim) would simply never be reachable there.
   * Tapping a photo shows its caption; tapping it again, or tapping a
   * different photo, hides it. Fine-pointer devices skip this entirely
   * and rely on CSS :hover/:focus-within.
   * ---------------------------------------------------------------- */
  function initGalleryTapReveal() {
    if (window.matchMedia("(pointer: fine)").matches) return;
    var items = document.querySelectorAll(".gallery-item");
    if (!items.length) return;
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var wasActive = item.classList.contains("is-active");
        items.forEach(function (it) {
          it.classList.remove("is-active");
        });
        if (!wasActive) item.classList.add("is-active");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    renderSocialLists();
    initCursor();
    initHeader();
    initSlideshows();
    initMagnetic();
    initReveal();
    initSideNav();
    initMasonryGrids();
    initGalleryTapReveal();
    // Runs last: sections must already be at their final (masonry-
    // computed) heights before this reads section positions, since a
    // section further down the page depends on the cumulative height
    // of every section above it.
    initGalleryScrollReveal();
  });
})();
