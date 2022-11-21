export type ResetApiKey = Readonly<{ username: string; password: string }>;
export type ResetApiKeyResponse = Readonly<{ apiKey: string }>;

export type Generate = Readonly<{ prompt: string; seed?: number }>;
export type GenerateResponse = Readonly<{ imageId: string }>;

export type ChangePassword = Readonly<{ currentPassword: string; newPassword: string }>;
export type ChangePasswordResponse = Readonly<{ error?: string }>;

// Admin stuff

export type CreateUser = Readonly<{ username: string }>;
export type CreateUserResponse = Readonly<{ error?: "UserExists" | "BadUserName" | "ServerError" }>;

export type SetUserPassword = Readonly<{ password: string }>;
