/* React enhancements (loaded via CDN, no build step) */
(() => {
  const { createElement: h, Fragment, useState, useEffect } = React;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1) Typewriter line under the hero heading */
  function Typewriter({ words }) {
    const [text, setText] = useState(reduceMotion ? words[0] : "");
    useEffect(() => {
      if (reduceMotion) return;
      let w = 0, i = 0, deleting = false, t;
      const tick = () => {
        const word = words[w];
        i += deleting ? -1 : 1;
        setText(word.slice(0, i));
        let delay = deleting ? 40 : 90;
        if (!deleting && i === word.length) { deleting = true; delay = 1400; }
        else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
        t = setTimeout(tick, delay);
      };
      t = setTimeout(tick, 400);
      return () => clearTimeout(t);
    }, []);
    return h(Fragment, null,
      h("span", null, text),
      h("span", { className: "typed__caret", "aria-hidden": "true" })
    );
  }

  /* 2) Scroll progress, back-to-top, reveal on scroll, scroll-spy, card tilt */
  function ScrollUI() {
    const [progress, setProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
      let raf;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(max > 0 ? window.scrollY / max : 0);
          setShowTop(window.scrollY > 600);
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
      if (reduceMotion) return;
      const items = document.querySelectorAll(
        ".bio__data, .bio__pic-content, .h2-heading, .skills__column, .project, .contact > div"
      );
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      items.forEach((el, i) => {
        el.classList.add("reveal");
        el.style.transitionDelay = `${(i % 3) * 90}ms`;
        io.observe(el);
      });
      return () => io.disconnect();
    }, []);

    useEffect(() => {
      const links = [...document.querySelectorAll(".navigation_link")];
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) =>
            a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`)
          );
        });
      }, { rootMargin: "-40% 0px -55% 0px" });
      document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
      return () => io.disconnect();
    }, []);

    useEffect(() => {
      if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
      const cleanups = [...document.querySelectorAll(".project")].map((card) => {
        const move = (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-5px)`;
        };
        const leave = () => { card.style.transform = ""; };
        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
        return () => { card.removeEventListener("mousemove", move); card.removeEventListener("mouseleave", leave); };
      });
      return () => cleanups.forEach((c) => c());
    }, []);

    return h(Fragment, null,
      h("div", { className: "scroll-progress", style: { transform: `scaleX(${progress})` } }),
      h("button", {
        className: "back-to-top" + (showTop ? " is-visible" : ""),
        "aria-label": "Back to top",
        onClick: () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }),
      }, "↑")
    );
  }

  const typedEl = document.getElementById("typed-root");
  if (typedEl) {
    ReactDOM.createRoot(typedEl).render(
      h(Typewriter, { words: ["Front-End Developer", "Wordpress "] })
    );
  }
  const uiEl = document.createElement("div");
  document.body.appendChild(uiEl);
  ReactDOM.createRoot(uiEl).render(h(ScrollUI));
})();
