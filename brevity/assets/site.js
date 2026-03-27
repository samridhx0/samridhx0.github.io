const cookieKey = "brevity-redesign-cookie-ok";

const onReady = () => {
  const banner = document.querySelector("[data-cookie-banner]");
  const accept = document.querySelector("[data-cookie-accept]");

  if (banner && localStorage.getItem(cookieKey) === "true") {
    banner.classList.add("hidden");
  }

  accept?.addEventListener("click", () => {
    localStorage.setItem(cookieKey, "true");
    banner?.classList.add("hidden");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}
