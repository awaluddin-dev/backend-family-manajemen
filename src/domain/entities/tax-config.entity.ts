export interface TaxConfigProps {
  id: string;
  userId: string;
  name: string;
  ratePercent: number;
  isDefault: boolean;
  createdAt?: Date;
}

export class TaxConfigEntity {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly ratePercent: number;
  readonly isDefault: boolean;
  readonly createdAt?: Date;

  constructor(props: TaxConfigProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.ratePercent = Number(props.ratePercent);
    this.isDefault = Boolean(props.isDefault);
    this.createdAt = props.createdAt;
  }
}
