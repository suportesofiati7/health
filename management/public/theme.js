try {
  const saved = localStorage.getItem("sofiati-theme");
  document.documentElement.dataset.theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
} catch {}
