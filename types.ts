export type AppMode = 'chat' | 'image' | 'video' | 'voice' | 'search' | 'venus';

export interface Player {
  id: string;
  name: string;
  balance: number;
  isAI: boolean;
  status: 'active' | 'vacation' | 'bankrupt';
  vacationTurns: number;
  loanRemaining: number;
  loanRepaymentMonths: number;
  taxDiscount: number; // For "Optimization"
  color: string;
  usedActions: string[]; // Список ключей уже использованных действий
}

export interface GameLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'danger' | 'warning';
  timestamp: Date;
  playerColor?: string;
}