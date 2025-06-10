'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import TaskContract from '../utils/TaskContract.json';

const CONTRACT_ADDRESS = '0x4C9580b002527f87649311cB183448ebF18a34d5'; // Endereço do contrato na rede Amoy

type Task = {
  id: number;
  title: string;
  description: string;
  createdAt: number;
  completedAt: number;
  dueDate: number;
  stake: string;
  isCompleted: boolean;
  owner: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [wallet, setWallet] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [stake, setStake] = useState('0.01'); // valor padrão em ETH
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('wallet');
    if (!stored) {
      router.push('/');
    } else {
      setWallet(stored);
    }
  }, [router]);

  const loadTasks = async () => {
    try {
      if (!window.ethereum) throw new Error('MetaMask não encontrada');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TaskContract, provider);

      const count = await contract.tasksCount();
      const loadedTasks: Task[] = [];

      for (let i = 0; i < count; i++) {
        const task = await contract.getTask(i);
        loadedTasks.push({
          id: task.id,
          title: task.title,
          description: task.description,
          createdAt: task.createdAt,
          completedAt: task.completedAt,
          dueDate: task.dueDate,
          stake: ethers.formatEther(task.stake),
          isCompleted: task.isCompleted,
          owner: task.owner,
        });
      }

      setTasks(loadedTasks);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    }
  };

  useEffect(() => {
    if (wallet) loadTasks();
  }, [wallet]);

  useEffect(() => {
    if (!wallet || !window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    let contract: ethers.Contract;

    const listenForEvents = async () => {
      const signer = await provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, TaskContract, signer);

      contract.on("TaskCreated", async () => {
        await loadTasks();
      });
    };

    listenForEvents();

    return () => {
      if (contract) {
        contract.removeAllListeners("TaskCreated");
      }
    };
  }, [wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!window.ethereum) throw new Error('MetaMask não encontrada');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TaskContract, signer);

      const dueDateTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);
      const tx = await contract.createTask(
        title,
        description,
        dueDateTimestamp,
        { value: ethers.parseEther(stake) }
      );
      await tx.wait();

      alert('Tarefa adicionada com sucesso!');
      setTitle('');
      setDescription('');
      setDueDate('');
      setStake('0.01');
      await loadTasks();
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar tarefa.');
    }
  };

  const formatDate = (timestamp: number | bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!wallet) {
    return <p className="text-white p-10">Verificando conexão...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black-900 text-white p-4">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-bold mb-4">🚀 Dashboard</h1>
        <div className="flex flex-col items-end">
          <p className="text-sm mb-2">{wallet}</p>
          <button
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              localStorage.removeItem('wallet');
              router.push('/');
            }}
          >
            Desconectar Wallet
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-md mt-6 max-w-xl w-full self-center"
      >
        <h2 className="text-2xl font-semibold mb-4">Nova Tarefa</h2>

        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="number"
          step="0.001"
          min="0"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          placeholder="Valor em ETH (stake)"
          required
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded w-full"
        >
          Adicionar Tarefa
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">📋 Tarefas</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-400">Nenhuma tarefa encontrada.</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold">{task.title}</h3>
                <p className="text-gray-300">{task.description}</p>
                <p className="text-sm">🗓️ Prazo: {formatDate(task.dueDate)}</p>
                <p className="text-sm">💰 Stake: {task.stake} ETH</p>
                <p className="text-sm">
                  ✅ Status: {task.isCompleted ? 'Completa' : 'Pendente'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


// This component serves as the dashboard for the FlashBootcamp app, allowing users to manage tasks on the blockchain.
