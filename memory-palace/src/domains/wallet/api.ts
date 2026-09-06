import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { WalletInfoResponse, WalletRegisterResponse, WalletKeysResponse } from './types';

export const walletApi = {
  register: (wallet: string) =>
    request<WalletRegisterResponse>(ENDPOINTS.wallet.register.path, { method: 'POST', body: { wallet } }),
  getInfo: () => request<WalletInfoResponse>(ENDPOINTS.wallet.info.path),
  getKeys: () => request<WalletKeysResponse>(ENDPOINTS.wallet.keys.path),
};
