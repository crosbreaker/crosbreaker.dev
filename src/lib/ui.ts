export function setNavOffsets(): void {
  const nav = document.querySelector<HTMLElement>(".navbar");
  if (!nav) {
    return;
  }

  const styles = window.getComputedStyle(nav);
  const top = Number.parseFloat(styles.top) || 0;
  const offset = Math.ceil(nav.offsetHeight + top + 10);

  document.documentElement.style.setProperty("--nav-offset-desktop", `${offset}px`);
  document.documentElement.style.setProperty("--nav-offset-mobile", `${offset}px`);
}

export function initializeInteractions(onRecalculate: () => void): void {
  window.addEventListener("resize", onRecalculate);
  window.addEventListener("load", onRecalculate);
}

export function formatActivityText(activity: { name?: string; details?: string }): string {
  if (activity.name && activity.details) {
    return `${activity.name}: ${activity.details}`;
  }

  return activity.name || activity.details || "Active";
}
