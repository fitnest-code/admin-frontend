export const env = {
  get apiBaseUrl() {
    return process.env.API_BASE_URL?.trim() ?? process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '';
  }
}

export function assertPublicEnv() {
  if (!env.apiBaseUrl) {
    console.warn('API_BASE_URL / NEXT_PUBLIC_API_BASE_URL is not set.')
  }
}
