export const LANDING_PATH = "/";
export const LOGIN_PATH = "/login";
export const DEMO_PATH = "/demo";
export const WORKSPACE_PATH = "/workspace";

const PUBLIC_HTML_PATHS = new Set([
  LANDING_PATH,
  LOGIN_PATH,
  DEMO_PATH,
]);

export function isPublicHtmlPath(pathname: string): boolean {
  return PUBLIC_HTML_PATHS.has(pathname);
}

export function isAuthenticatedWorkspacePath(pathname: string): boolean {
  return (
    pathname === WORKSPACE_PATH ||
    pathname.startsWith(`${WORKSPACE_PATH}/`)
  );
}

export function getPostLoginPath(): string {
  return WORKSPACE_PATH;
}
