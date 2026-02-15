import type { ProjectRepo } from "../config/projects";

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
}

function clearLoading(el: Element | null): void {
  if (!el) {
    return;
  }

  el.classList.remove("loading");
}

async function loadProjectData(project: ProjectRepo, cardId: string): Promise<void> {
  const card = document.getElementById(cardId);
  if (!card) {
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${project.owner}/${project.repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "crosbreaker-dev"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub responded with ${response.status}`);
    }

    const data = (await response.json()) as GitHubRepoResponse;

    const nameEl = card.querySelector<HTMLAnchorElement>(".project-name");
    const descriptionEl = card.querySelector<HTMLElement>(".project-description");
    const descriptionTextEl = card.querySelector<HTMLElement>(".project-description-text");
    const starCountEl = card.querySelector<HTMLElement>(".project-star-count");
    const forkCountEl = card.querySelector<HTMLElement>(".project-fork-count");

    if (nameEl) {
      nameEl.textContent = data.name;
      nameEl.href = data.html_url;
      clearLoading(nameEl);
    }

    if (descriptionTextEl) {
      descriptionTextEl.textContent = data.description || "No description available";
    }

    if (descriptionEl) {
      descriptionEl.classList.remove("loading", "error");
    }

    if (starCountEl) {
      starCountEl.textContent = String(data.stargazers_count);
      clearLoading(starCountEl);
    }

    if (forkCountEl) {
      forkCountEl.textContent = String(data.forks_count);
      clearLoading(forkCountEl);
    }

    card.classList.remove("error");
  } catch {
    const nameEl = card.querySelector<HTMLElement>(".project-name");
    const descriptionEl = card.querySelector<HTMLElement>(".project-description");
    const descriptionTextEl = card.querySelector<HTMLElement>(".project-description-text");
    const starCountEl = card.querySelector<HTMLElement>(".project-star-count");
    const forkCountEl = card.querySelector<HTMLElement>(".project-fork-count");

    if (nameEl) {
      nameEl.textContent = "Failed to load";
      nameEl.removeAttribute("href");
      clearLoading(nameEl);
    }

    if (descriptionTextEl) {
      descriptionTextEl.textContent = "Unable to fetch repository";
    }

    if (descriptionEl) {
      descriptionEl.className = "project-description error";
    }

    if (starCountEl) {
      starCountEl.textContent = "-";
      clearLoading(starCountEl);
    }

    if (forkCountEl) {
      forkCountEl.textContent = "-";
      clearLoading(forkCountEl);
    }

    card.classList.add("error");
  }
}

export function initializeProjects(projects: ProjectRepo[]): void {
  projects.forEach((project, index) => {
    void loadProjectData(project, `project-${index + 1}`);
  });
}
