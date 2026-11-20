export interface RecurringBreakdownItemProps {
  id?: string;
  scheduleId?: string;
  name: string;
  itemType: 'ALLOWANCE' | 'DEDUCTION';
  amount: number;
}

export class RecurringBreakdownItemEntity {
  readonly id?: string;
  readonly scheduleId?: string;
  readonly name: string;
  readonly itemType: 'ALLOWANCE' | 'DEDUCTION';
  readonly amount: number;

  constructor(props: RecurringBreakdownItemProps) {
    this.id = props.id;
    this.scheduleId = props.scheduleId;
    this.name = props.name;
    this.itemType = props.itemType;
    this.amount = Number(props.amount);
  }
}

export interface RecurringScheduleProps {
  id: string;
  userId: string;
  title: string;
  type: 'INCOME' | 'OUTCOME';
  walletId: string;
  categoryId?: string | null;
  frequency: string;
  dayOfMonth: number;
  totalAmount: number;
  nextExecutionDate: string; // YYYY-MM-DD
  isActive: boolean;
  forMember?: string | null;
  items?: RecurringBreakdownItemEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class RecurringScheduleEntity {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly type: 'INCOME' | 'OUTCOME';
  readonly walletId: string;
  readonly categoryId?: string | null;
  readonly frequency: string;
  readonly dayOfMonth: number;
  readonly totalAmount: number;
  readonly nextExecutionDate: string;
  readonly isActive: boolean;
  readonly forMember?: string | null;
  readonly items: RecurringBreakdownItemEntity[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: RecurringScheduleProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.type = props.type;
    this.walletId = props.walletId;
    this.categoryId = props.categoryId ?? null;
    this.frequency = props.frequency;
    this.dayOfMonth = Number(props.dayOfMonth);
    this.totalAmount = Number(props.totalAmount);
    this.nextExecutionDate = props.nextExecutionDate;
    this.isActive = Boolean(props.isActive);
    this.forMember = props.forMember ?? null;
    this.items = props.items ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
