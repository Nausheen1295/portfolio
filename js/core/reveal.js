/* NEXUS — scroll reveal. Adds .is-in once; supports elements added later. */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
  : null;

export function reveal(scope = document) {
  scope.querySelectorAll(".nx-reveal:not(.is-in)").forEach((el) => (io ? io.observe(el) : el.classList.add("is-in")));
}
