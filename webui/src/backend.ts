const BackendUrl = (process.env.NODE_ENV === "development" ? "http://localhost:5437" : "") + "/sd";

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

type GenerateResult = Readonly<{ imageId: string }>;

export const imageSearch = (prompt: string, onSuccess: (gr: GenerateResult) => void) =>
  backendPostRequest("/api/generate", { prompt }, onSuccess);

type ChangePasswordRequest = Readonly<{ currentPassword: string; newPassword: string }>;
type ChangePassResponse = Readonly<{ error?: string }>;

export const sendChangePasswordRequest = (
  req: ChangePasswordRequest,
  onSuccess: (res: ChangePassResponse) => void,
  onError?: (error: Response) => void,
): Promise<void> => backendPostRequest("/api/user/password", req, onSuccess, onError);
