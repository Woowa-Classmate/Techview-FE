import { create } from "zustand";

interface TokenExpiredState {
  isTokenExpired: boolean;
  showTokenExpiredModal: () => void;
  hideTokenExpiredModal: () => void;
}

export const useTokenExpiredStore = create<TokenExpiredState>((set) => ({
  isTokenExpired: false,
  showTokenExpiredModal: () => set({ isTokenExpired: true }),
  hideTokenExpiredModal: () => set({ isTokenExpired: false }),
}));

