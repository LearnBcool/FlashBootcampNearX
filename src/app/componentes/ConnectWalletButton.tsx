'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';

export default function ConnectWalletButton() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet');
    if (storedWallet) setWallet(storedWallet);
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert('Metamask não encontrada!');
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Solicita conexão da carteira
      const accounts = await provider.send('eth_requestAccounts', []);
      const walletAddress = accounts[0];

      // Checa a rede conectada
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 80002) {
        try {
          // Tenta adicionar ou mudar para a rede Amoy
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13882', // Hex de 80002
                chainName: 'Polygon Amoy',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://amoy.polygonscan.com'],
              },
            ],
          });
        } catch (switchError) {
          console.error('Erro ao adicionar rede Amoy:', switchError);
          alert('Não foi possível mudar para a rede Amoy. Veja as instruções abaixo.');
          setShowNetworkInfo(true);
          return;
        }
      }

      setWallet(walletAddress);
      localStorage.setItem('wallet', walletAddress);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('wallet');
    setWallet(null);
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {wallet ? (
        <>
          <p>Wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}</p>
          <button
            onClick={disconnectWallet}
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect Wallet
          </button>
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      )}

      {/* Tooltip ou Widget de Configuração Manual da Rede */}
      <div
        onMouseEnter={() => setShowNetworkInfo(true)}
        onMouseLeave={() => setShowNetworkInfo(false)}
        onClick={() => setShowNetworkInfo(!showNetworkInfo)}
        className="relative cursor-pointer text-sm text-blue-600 underline"
      >
        ⚙️ Add Custom Network Amoy On Metamask
        {showNetworkInfo && (
          <div className="absolute top-6 left-0 bg-white border border-gray-300 shadow-lg rounded p-4 w-[300px] z-50 text-sm text-black">
            <p><strong>Network name:</strong> Amoy</p>
            <p><strong>RPC URL:</strong><br />https://rpc-amoy.polygon.technology</p>
            <p><strong>ChainID:</strong> 80002</p>
            <p><strong>Currency Symbol:</strong> MATIC</p>
            <p><strong>Block Explorer:</strong><br />https://amoy.polygonscan.com</p>
            <p><strong>Faucet:</strong><br />
              <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Polygon Faucet</a>
              <br />
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSe4npoGldJknEs9EBtPaV3AS-0HTso2IuMWDCiMmLEMCx8euQ/viewform?pli=1" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Extra Faucet</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



// This component checks if a wallet is connected and allows the user to connect their wallet using Metamask.