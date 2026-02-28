import { ref, computed, readonly } from 'vue';
import { BrowserProvider, type Eip1193Provider } from 'ethers';

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

const address = ref<string | null>(null);
const chainId = ref<number>(Number(import.meta.env.VITE_CHAIN_ID) || 97);
const isConnecting = ref(false);
const error = ref<string | null>(null);
const provider = ref<BrowserProvider | null>(null);

export function useWeb3() {
  const isConnected = computed(() => !!address.value);
  const hasWallet = computed(() => typeof window !== 'undefined' && !!window.ethereum);

  async function connect(): Promise<string | null> {
    if (!window.ethereum) {
      error.value = 'No wallet detected. Please install MetaMask.';
      return null;
    }

    isConnecting.value = true;
    error.value = null;

    try {
      const browserProvider = new BrowserProvider(window.ethereum);

      // Wrap eth_requestAccounts with a 30s timeout so we don't spin forever
      // if MetaMask popup is blocked or unresponsive
      const accounts = await Promise.race([
        browserProvider.send('eth_requestAccounts', []),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Wallet connection timed out. Please open MetaMask and try again.')), 30_000),
        ),
      ]);

      if (accounts.length === 0) {
        error.value = 'No accounts found. Please unlock your wallet.';
        return null;
      }

      provider.value = browserProvider;
      address.value = accounts[0];

      // Get current chain
      const network = await browserProvider.getNetwork();
      chainId.value = Number(network.chainId);

      // Listen for account/chain changes
      setupListeners();

      return accounts[0];
    } catch (err: any) {
      if (err.code === 4001) {
        error.value = 'Connection rejected by user.';
      } else {
        error.value = err.message || 'Failed to connect wallet.';
      }
      return null;
    } finally {
      isConnecting.value = false;
    }
  }

  async function disconnect() {
    address.value = null;
    provider.value = null;
    removeListeners();
  }

  async function signMessage(message: string): Promise<string | null> {
    if (!provider.value) {
      error.value = 'Wallet not connected.';
      return null;
    }

    try {
      const signer = await provider.value.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err: any) {
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        error.value = 'Signature rejected by user.';
      } else {
        error.value = err.message || 'Failed to sign message.';
      }
      return null;
    }
  }

  async function switchChain(targetChainId: number) {
    if (!window.ethereum) return;

    const hexChainId = '0x' + targetChainId.toString(16);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      } as any);
      chainId.value = targetChainId;
    } catch (err: any) {
      // Chain not added, try to add it
      if (err.code === 4902) {
        await addBscTestnet();
      } else {
        error.value = err.message || 'Failed to switch chain.';
      }
    }
  }

  async function addBscTestnet() {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x61',
            chainName: 'BNB Smart Chain Testnet',
            nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
            blockExplorerUrls: ['https://testnet.bscscan.com'],
          },
        ],
      } as any);
      chainId.value = 97;
    } catch (err: any) {
      error.value = err.message || 'Failed to add BSC Testnet.';
    }
  }

  // ---- Event listeners for account/chain changes ----
  function onAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      address.value = null;
      provider.value = null;
    } else {
      address.value = accounts[0];
    }
  }

  function onChainChanged(newChainId: string) {
    chainId.value = parseInt(newChainId, 16);
  }

  function setupListeners() {
    if (window.ethereum?.on) {
      window.ethereum.on('accountsChanged', onAccountsChanged);
      window.ethereum.on('chainChanged', onChainChanged);
    }
  }

  function removeListeners() {
    if (window.ethereum?.removeListener) {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged);
      window.ethereum.removeListener('chainChanged', onChainChanged);
    }
  }

  // Try to reconnect if previously connected
  async function tryReconnect(): Promise<string | null> {
    if (!window.ethereum) return null;

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_accounts', []);

      if (accounts.length > 0) {
        provider.value = browserProvider;
        address.value = accounts[0];
        const network = await browserProvider.getNetwork();
        chainId.value = Number(network.chainId);
        setupListeners();
        return accounts[0];
      }
    } catch {
      // Silently fail — user can manually reconnect
    }

    return null;
  }

  return {
    address: readonly(address),
    chainId: readonly(chainId),
    isConnected,
    isConnecting: readonly(isConnecting),
    hasWallet,
    error: readonly(error),
    provider,
    connect,
    disconnect,
    signMessage,
    switchChain,
    tryReconnect,
  };
}
