let refreshToken: string | null = null;

export const getRefreshToken = (): string | null => refreshToken;

export const setRefreshToken = (token: string | null): void => {
  refreshToken = token;
};

export const clearRefreshToken = (): void => {
  refreshToken = null;
};
