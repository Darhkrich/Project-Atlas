import { mockProviders } from "./providers";
import type { Provider } from "../types/provider";

let providers: Provider[] = [...mockProviders];

export function getProviders(): Provider[] {
  return providers;
}

export function getProviderById(id: string): Provider | undefined {
  return providers.find(p => p.id === id);
}

export function addProvider(provider: Provider) {
  providers = [...providers, provider];
}

export function updateProvider(id: string, updates: Partial<Provider>) {
  providers = providers.map(p => p.id === id ? { ...p, ...updates } : p);
}

export function deleteProvider(id: string) {
  providers = providers.filter(p => p.id !== id);
}