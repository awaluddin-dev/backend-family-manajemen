export interface CategoryProps {
  id: string;
  userId: string;
  name: string;
  type: string; // 'INCOME' | 'OUTCOME'
  icon?: string | null;
  createdAt?: Date;
}

export class CategoryEntity {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly type: string;
  readonly icon?: string | null;
  readonly createdAt?: Date;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.type = props.type;
    this.icon = props.icon ?? null;
    this.createdAt = props.createdAt;
  }
}
