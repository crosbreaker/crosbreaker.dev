import type { MemberProfile } from "../config/members";
import type { DiscordActivity, LanyardPresence } from "./lanyard/types";
import { formatActivityText } from "./ui";

function capitalize(value: string): string {
  if (!value) {
    return "Unknown";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getPrimaryActivity(activities: DiscordActivity[]): DiscordActivity | undefined {
  const flagged = activities.find((activity) => activity.flags === 1);
  if (flagged) {
    return flagged;
  }

  return activities.find((activity) => activity.type !== 4);
}

function setTimeDisplay(
  cardId: string,
  startTime: number | null,
  timers: Map<string, number>
): void {
  const card = document.getElementById(cardId);
  if (!card) {
    return;
  }

  const timeTextEl = card.querySelector<HTMLElement>(".time-text");
  const clockIconEl = card.querySelector<HTMLElement>(".clock-icon");

  if (!timeTextEl) {
    return;
  }

  const existingTimer = timers.get(cardId);
  if (existingTimer) {
    window.clearInterval(existingTimer);
    timers.delete(cardId);
  }

  if (!startTime) {
    timeTextEl.style.display = "none";
    if (clockIconEl) {
      clockIconEl.style.display = "none";
    }
    return;
  }

  const render = () => {
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    timeTextEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    timeTextEl.className = "time-text";
    timeTextEl.style.display = "";

    if (clockIconEl) {
      clockIconEl.style.display = "";
    }
  };

  render();
  const interval = window.setInterval(render, 1000);
  timers.set(cardId, interval);
}

export function applyPresenceToMemberCard(
  member: MemberProfile,
  presence: LanyardPresence,
  timers: Map<string, number>
): void {
  const cardId = `member-${member.id}`;
  const card = document.getElementById(cardId);
  if (!card) {
    return;
  }

  const avatarImageEl = card.querySelector<HTMLImageElement>(".member-avatar-image");
  const indicatorEl = card.querySelector<HTMLElement>(".status-indicator");
  const nameEl = card.querySelector<HTMLElement>(".member-name");
  const userStatusEl = card.querySelector<HTMLElement>(".user-status");
  const activityTextEl = card.querySelector<HTMLElement>(".activity-text");

  const user = presence.discord_user;
  const displayName = user.global_name || user.username;

  if (avatarImageEl) {
    avatarImageEl.alt = displayName;
  }

  if (indicatorEl) {
    indicatorEl.className = `status-indicator status-${presence.discord_status}`;
  }

  if (nameEl) {
    nameEl.textContent = displayName;
    nameEl.className = "member-name";

    if (member.github) {
      nameEl.onclick = () => {
        window.open(member.github, "_blank", "noopener,noreferrer");
      };
    } else {
      nameEl.classList.add("no-link");
      nameEl.onclick = null;
    }
  }

  const activities = presence.activities ?? [];
  const customStatus = activities.find((activity) => activity.type === 4);
  const statusText = customStatus?.state || capitalize(presence.discord_status);

  if (userStatusEl) {
    userStatusEl.textContent = statusText;
    userStatusEl.className = "user-status";
  }

  let activityText = "No activity";
  let activityStartTime: number | null = null;

  if (presence.listening_to_spotify && presence.spotify) {
    activityText = `${presence.spotify.song} by ${presence.spotify.artist}`;
    activityStartTime = presence.spotify.timestamps?.start ?? null;
  } else {
    const primary = getPrimaryActivity(activities);
    if (primary) {
      activityText = formatActivityText(primary);
      activityStartTime = primary.timestamps?.start ?? null;
    }
  }

  if (activityTextEl) {
    activityTextEl.textContent = activityText;
    activityTextEl.className = "activity-text";
  }

  setTimeDisplay(cardId, activityStartTime, timers);
}

export function setMemberUnavailable(member: MemberProfile, timers: Map<string, number>): void {
  const cardId = `member-${member.id}`;
  const card = document.getElementById(cardId);
  if (!card) {
    return;
  }

  const nameEl = card.querySelector<HTMLElement>(".member-name");
  const userStatusEl = card.querySelector<HTMLElement>(".user-status");
  const activityTextEl = card.querySelector<HTMLElement>(".activity-text");
  const indicatorEl = card.querySelector<HTMLElement>(".status-indicator");

  if (nameEl && nameEl.classList.contains("loading")) {
    nameEl.textContent = "Unavailable";
    nameEl.className = "member-name no-link";
    nameEl.onclick = null;
  }

  if (userStatusEl && userStatusEl.classList.contains("loading")) {
    userStatusEl.textContent = "Unknown";
    userStatusEl.className = "user-status";
  }

  if (activityTextEl && activityTextEl.classList.contains("loading")) {
    activityTextEl.textContent = "Unable to fetch presence";
    activityTextEl.className = "activity-text";
  }

  if (indicatorEl) {
    indicatorEl.className = "status-indicator status-offline";
  }

  setTimeDisplay(cardId, null, timers);
}
