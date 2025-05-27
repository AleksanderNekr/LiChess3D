export const LICHESS_CLIENT_ID = 'AlexDevCID';

export const getLichessRedirectUri = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/callback`;
  }
  return 'http://localhost:3000/callback'; // Default or placeholder
};
