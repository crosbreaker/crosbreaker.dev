import { MEMBERS } from "../config/members";
import { PROJECT_REPOS } from "../config/projects";
import { createLanyardClient } from "../lib/lanyard/client";
import { applyPresenceToMemberCard, setMemberUnavailable } from "../lib/members";
import { initializeProjects } from "../lib/projects";
import { initializeInteractions, setNavOffsets } from "../lib/ui";

const timeIntervals = new Map<string, number>();
const membersById = new Map(MEMBERS.map((member) => [member.id, member]));
const receivedPresence = new Set<string>();

function initializeApp(): void {
  setNavOffsets();
  initializeInteractions(setNavOffsets);
  initializeProjects(PROJECT_REPOS);

  const lanyardClient = createLanyardClient({
    userIds: MEMBERS.map((member) => member.id),
    onInitState: (state) => {
      MEMBERS.forEach((member) => {
        const presence = state[member.id];
        if (!presence) {
          return;
        }

        applyPresenceToMemberCard(member, presence, timeIntervals);
        receivedPresence.add(member.id);
      });
    },
    onPresenceUpdate: (userId, presence) => {
      const member = membersById.get(userId);
      if (!member) {
        return;
      }

      applyPresenceToMemberCard(member, presence, timeIntervals);
      receivedPresence.add(member.id);
    },
    onError: () => {
      if (receivedPresence.size > 0) {
        return;
      }

      MEMBERS.forEach((member) => {
        setMemberUnavailable(member, timeIntervals);
      });
    }
  });

  lanyardClient.connect();

  window.addEventListener(
    "beforeunload",
    () => {
      lanyardClient.disconnect();
    },
    { once: true }
  );
}

document.addEventListener("DOMContentLoaded", initializeApp);
