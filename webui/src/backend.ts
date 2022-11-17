import { BackendUrl } from "./consts";

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

const backendPostRequest = <T, R>(
  suffix: string,
  req: T,
  onSuccess: (res: R) => void,
  onError?: (error: Response) => void,
  onUnrecoverableError?: (error: any) => void,
) =>
  fetch(`${BackendUrl}${suffix}`, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify(req),
    credentials: "include",
  })
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

type ChangePasswordRequest = Readonly<{ currentPassword: string; newPassword: string }>;
type ChangePassResponse = Readonly<{ error?: string }>;

export const sendChangePasswordRequest = (
  req: ChangePasswordRequest,
  onSuccess: (res: ChangePassResponse) => void,
  onError?: (error: Response) => void,
): Promise<void> => backendPostRequest("/api/user/password", req, onSuccess, onError);
