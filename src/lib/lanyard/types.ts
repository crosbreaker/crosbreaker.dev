export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
}

export interface DiscordActivity {
  type: number;
  name?: string;
  details?: string;
  state?: string;
  flags?: number;
  timestamps?: {
    start?: number;
    end?: number;
  };
}

export interface SpotifyActivity {
  song: string;
  artist: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
}

export interface LanyardPresence {
  user_id?: string;
  discord_user: DiscordUser;
  discord_status: string;
  activities?: DiscordActivity[];
  listening_to_spotify?: boolean;
  spotify?: SpotifyActivity | null;
}

export interface LanyardHello {
  heartbeat_interval: number;
}

export interface LanyardInitState {
  [userId: string]: LanyardPresence;
}
