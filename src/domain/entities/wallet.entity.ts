export interface WalletProps {
  id: string;
  userId: string;
  name: string;
  type: string; // 'BANK' | 'E_WALLET' | 'CASH' | 'POINT'
  currentBalance: number;
  accountNumber?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WalletEntity {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly type: string;
  readonly currentBalance: number;
  readonly accountNumber?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: WalletProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.type = props.type;
    this.currentBalance = Number(props.currentBalance);
    this.accountNumber = props.accountNumber ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
