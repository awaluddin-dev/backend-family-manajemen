export interface CashflowTransactionProps {
  id: string;
  userId: string;
  type: 'INCOME' | 'OUTCOME';
  mode: 'MANUAL' | 'AUTO';
  recurringScheduleId?: string | null;
  walletId: string;
  categoryId?: string | null;
  baseAmount: number;
  taxRatePercent?: number | null;
  predictedTax?: number | null;
  actualTax?: number | null;
  totalAmount: number;
  channel?: string | null; // 'ONLINE' | 'OFFLINE'
  purpose?: string | null;
  forMember?: string | null;
  sourceOrMerchant?: string | null;
  notes?: string | null;
  transactionDate: Date;
  createdAt?: Date;
}

export class CashflowTransactionEntity {
  readonly id: string;
  readonly userId: string;
  readonly type: 'INCOME' | 'OUTCOME';
  readonly mode: 'MANUAL' | 'AUTO';
  readonly recurringScheduleId?: string | null;
  readonly walletId: string;
  readonly categoryId?: string | null;
  readonly baseAmount: number;
  readonly taxRatePercent: number;
  readonly predictedTax: number;
  readonly actualTax: number;
  readonly totalAmount: number;
  readonly channel: string;
  readonly purpose?: string | null;
  readonly forMember?: string | null;
  readonly sourceOrMerchant?: string | null;
  readonly notes?: string | null;
  readonly transactionDate: Date;
  readonly createdAt?: Date;

  constructor(props: CashflowTransactionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.mode = props.mode;
    this.recurringScheduleId = props.recurringScheduleId ?? null;
    this.walletId = props.walletId;
    this.categoryId = props.categoryId ?? null;
    this.baseAmount = Number(props.baseAmount);
    this.taxRatePercent = Number(props.taxRatePercent ?? 0);
    this.predictedTax = Number(props.predictedTax ?? 0);
    this.actualTax = Number(props.actualTax ?? 0);
    this.totalAmount = Number(props.totalAmount);
    this.channel = props.channel ?? 'OFFLINE';
    this.purpose = props.purpose ?? null;
    this.forMember = props.forMember ?? null;
    this.sourceOrMerchant = props.sourceOrMerchant ?? null;
    this.notes = props.notes ?? null;
    this.transactionDate =
      props.transactionDate instanceof Date
        ? props.transactionDate
        : new Date(props.transactionDate);
    this.createdAt = props.createdAt;
  }
}
