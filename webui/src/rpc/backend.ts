import { ChangePassword, ChangePasswordResponse, Generate, GenerateResponse } from "./models";

const BackendUrl = (() => {
  const location = document.location;
  const main =
    process.env.NODE_ENV === "development" ? "http://localhost:5437" : `${location.protocol}//${location.host}`;
  return `${main}/sd`;
})();

export const gridImageUrl = (imageId: string) => `${BackendUrl}/image/${imageId}`;
export const imageUrl = (imageId: string, imageIndex: number) => `${gridImageUrl(imageId)}/${imageIndex}`;

export const LoginUrl = `${BackendUrl}/login`;

type LoggedIn = Readonly<{ loggedIn: boolean }>;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const checkIsLoggedIn = (): Promise<LoggedIn> => {
  const tryFetch = () => fetch(`${BackendUrl}/loggedIn`, { method: "GET", credentials: "include" }).then(r => r.json());
  const loop = () =>
    tryFetch().catch(e => {
      console.error("error checking logged in status", e);
      sleep(1000).then(loop);
    });
  return loop();
};

export const navigateToLogout = () => document.location.assign(`${BackendUrl}/logout`);

const backendRequest = <R>(
  suffix: string,
  opts: RequestInit,
  onSuccess: (res: R) => void,
  onError?: (error: Response) => void,
  onUnrecoverableError?: (error: any) => void,
) =>
  fetch(`${BackendUrl}${suffix}`, { redirect: "follow", credentials: "include", ...opts })
    .then(res => {
      if (res.status === 401) window.location.reload();
      else if (res.ok) res.json().then(onSuccess);
      else {
        console.error("Error during backend call", res);
        onError?.(res);
      }
    })
    .catch(e => {
      console.error("Unrecoverable error during backend call", e);
      onUnrecoverableError?.(e);
    });

const backendGetRequest = <R>(
  suffix: string,
  onSuccess: (res: R) => void,
  onError?: (error: Response) => void,
  onUnrecoverableError?: (error: any) => void,
) => backendRequest(suffix, { method: "GET" }, onSuccess, onError, onUnrecoverableError);

const backendPostRequest = <T, R>(
  suffix: string,
  req: T,
  onSuccess: (res: R) => void,
  onError?: (error: Response) => void,
  onUnrecoverableError?: (error: any) => void,
) => backendRequest(suffix, { method: "POST", body: JSON.stringify(req) }, onSuccess, onError, onUnrecoverableError);

export const imageSearch = (prompt: string, onSuccess: (gr: GenerateResponse) => void, async = false) =>
  Promise.resolve("/api/generate" + (async ? "?async=true" : "")).then(url =>
    backendPostRequest(url, { prompt }, onSuccess),
  );

export const fetchRequest = (imageId: string, onSuccess: (frr: Generate) => void, onError: (r: Response) => void) =>
  backendGetRequest(`/api/prompt/${imageId}`, onSuccess, onError);

export const sendChangePasswordRequest = (
  req: ChangePassword,
  onSuccess: (res: ChangePasswordResponse) => void,
  onError?: (error: Response) => void,
): Promise<void> => backendPostRequest("/api/user/password", req, onSuccess, onError);
