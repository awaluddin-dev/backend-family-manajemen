import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module.js';

// Repository Tokens
import { WALLET_REPOSITORY } from './domain/repositories/wallet.repository.interface.js';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.interface.js';
import { TAX_CONFIG_REPOSITORY } from './domain/repositories/tax-config.repository.interface.js';
import { RECURRING_SCHEDULE_REPOSITORY } from './domain/repositories/recurring-schedule.repository.interface.js';
import { CASHFLOW_TRANSACTION_REPOSITORY } from './domain/repositories/cashflow-transaction.repository.interface.js';

// Drizzle Repository Implementations
import { DrizzleWalletRepository } from './infrastructure/repositories/drizzle-wallet.repository.js';
import { DrizzleCategoryRepository } from './infrastructure/repositories/drizzle-category.repository.js';
import { DrizzleTaxConfigRepository } from './infrastructure/repositories/drizzle-tax-config.repository.js';
import { DrizzleRecurringScheduleRepository } from './infrastructure/repositories/drizzle-recurring-schedule.repository.js';
import { DrizzleCashflowTransactionRepository } from './infrastructure/repositories/drizzle-cashflow-transaction.repository.js';

// Use Cases
import { CreateWalletUseCase } from './application/use-cases/wallet/create-wallet.use-case.js';
import { GetWalletsUseCase } from './application/use-cases/wallet/get-wallets.use-case.js';
import { CreateCategoryUseCase } from './application/use-cases/category/create-category.use-case.js';
import { GetCategoriesUseCase } from './application/use-cases/category/get-categories.use-case.js';
import { CreateTaxConfigUseCase } from './application/use-cases/tax-config/create-tax-config.use-case.js';
import { GetTaxConfigsUseCase } from './application/use-cases/tax-config/get-tax-configs.use-case.js';
import { RecordManualIncomeUseCase } from './application/use-cases/income/record-manual-income.use-case.js';
import { CreateAutoIncomeScheduleUseCase } from './application/use-cases/income/create-auto-income-schedule.use-case.js';
import { SimulateAnnualIncomeUseCase } from './application/use-cases/income/simulate-annual-income.use-case.js';
import { CalculateTaxPreviewUseCase } from './application/use-cases/outcome/calculate-tax-preview.use-case.js';
import { RecordManualOutcomeUseCase } from './application/use-cases/outcome/record-manual-outcome.use-case.js';
import { CreateAutoOutcomeScheduleUseCase } from './application/use-cases/outcome/create-auto-outcome-schedule.use-case.js';
import { GetCashflowTransactionsUseCase } from './application/use-cases/cashflow/get-cashflow-transactions.use-case.js';
import { GetCashflowSummaryUseCase } from './application/use-cases/cashflow/get-cashflow-summary.use-case.js';
import { ProcessDueRecurringSchedulesUseCase } from './application/use-cases/cashflow/process-due-recurring-schedules.use-case.js';

// Scheduler
import { CashflowCronService } from './infrastructure/scheduler/cashflow-cron.service.js';

// Controllers
import { WalletController } from './presentation/controllers/wallet.controller.js';
import { CategoryController } from './presentation/controllers/category.controller.js';
import { TaxConfigController } from './presentation/controllers/tax-config.controller.js';
import { IncomeController } from './presentation/controllers/income.controller.js';
import { OutcomeController } from './presentation/controllers/outcome.controller.js';
import { CashflowController } from './presentation/controllers/cashflow.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [
    WalletController,
    CategoryController,
    TaxConfigController,
    IncomeController,
    OutcomeController,
    CashflowController,
  ],
  providers: [
    // Repositories
    {
      provide: WALLET_REPOSITORY,
      useClass: DrizzleWalletRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: DrizzleCategoryRepository,
    },
    {
      provide: TAX_CONFIG_REPOSITORY,
      useClass: DrizzleTaxConfigRepository,
    },
    {
      provide: RECURRING_SCHEDULE_REPOSITORY,
      useClass: DrizzleRecurringScheduleRepository,
    },
    {
      provide: CASHFLOW_TRANSACTION_REPOSITORY,
      useClass: DrizzleCashflowTransactionRepository,
    },

    // Wallet Use Cases
    CreateWalletUseCase,
    GetWalletsUseCase,

    // Category Use Cases
    CreateCategoryUseCase,
    GetCategoriesUseCase,

    // Tax Config Use Cases
    CreateTaxConfigUseCase,
    GetTaxConfigsUseCase,

    // Income Use Cases
    RecordManualIncomeUseCase,
    CreateAutoIncomeScheduleUseCase,
    SimulateAnnualIncomeUseCase,

    // Outcome Use Cases
    CalculateTaxPreviewUseCase,
    RecordManualOutcomeUseCase,
    CreateAutoOutcomeScheduleUseCase,

    // Cashflow Analytics & Processor Use Cases
    GetCashflowTransactionsUseCase,
    GetCashflowSummaryUseCase,
    ProcessDueRecurringSchedulesUseCase,

    // Cron Service
    CashflowCronService,
  ],
  exports: [
    WALLET_REPOSITORY,
    CATEGORY_REPOSITORY,
    TAX_CONFIG_REPOSITORY,
    RECURRING_SCHEDULE_REPOSITORY,
    CASHFLOW_TRANSACTION_REPOSITORY,
  ],
})
export class CashflowModule {}
