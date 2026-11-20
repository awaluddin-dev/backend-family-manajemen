import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordManualIncomeUseCase } from '../income/record-manual-income.use-case.js';
import { CreateAutoIncomeScheduleUseCase } from '../income/create-auto-income-schedule.use-case.js';
import { SimulateAnnualIncomeUseCase } from '../income/simulate-annual-income.use-case.js';
import { RecordManualOutcomeUseCase } from '../outcome/record-manual-outcome.use-case.js';
import { CalculateTaxPreviewUseCase } from '../outcome/calculate-tax-preview.use-case.js';
import { GetCashflowSummaryUseCase } from './get-cashflow-summary.use-case.js';
import { ProcessDueRecurringSchedulesUseCase } from './process-due-recurring-schedules.use-case.js';
import { WalletEntity } from '../../../domain/entities/wallet.entity.js';
import { CategoryEntity } from '../../../domain/entities/category.entity.js';
import { TaxConfigEntity } from '../../../domain/entities/tax-config.entity.js';
import {
  RecurringScheduleEntity,
  RecurringBreakdownItemEntity,
} from '../../../domain/entities/recurring-schedule.entity.js';
import { CashflowTransactionEntity } from '../../../domain/entities/cashflow-transaction.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('Cashflow Use Cases', () => {
  let mockWalletRepo: any;
  let mockCategoryRepo: any;
  let mockTaxConfigRepo: any;
  let mockScheduleRepo: any;
  let mockTransactionRepo: any;

  beforeEach(() => {
    mockWalletRepo = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      updateBalance: vi.fn(),
      incrementBalance: vi.fn(),
      decrementBalance: vi.fn(),
    };

    mockCategoryRepo = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
    };

    mockTaxConfigRepo = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findDefaultByUserId: vi.fn(),
      create: vi.fn(),
    };

    mockScheduleRepo = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findDueSchedules: vi.fn(),
      create: vi.fn(),
      updateNextExecutionDate: vi.fn(),
    };

    mockTransactionRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn(),
      getSummary: vi.fn(),
    };
  });

  describe('RecordManualIncomeUseCase', () => {
    it('should record manual income and increment wallet balance', async () => {
      mockWalletRepo.findById
        .mockResolvedValueOnce(
          new WalletEntity({
            id: 'wallet-1',
            userId: 'user-1',
            name: 'BCA Utama',
            type: 'BANK',
            currentBalance: 5000000,
          }),
        )
        .mockResolvedValueOnce(
          new WalletEntity({
            id: 'wallet-1',
            userId: 'user-1',
            name: 'BCA Utama',
            type: 'BANK',
            currentBalance: 5500000,
          }),
        );

      mockTransactionRepo.create.mockResolvedValue(
        new CashflowTransactionEntity({
          id: 'tx-1',
          userId: 'user-1',
          type: 'INCOME',
          mode: 'MANUAL',
          walletId: 'wallet-1',
          baseAmount: 500000,
          totalAmount: 500000,
          sourceOrMerchant: 'Claim Poin Harian',
          forMember: 'Ayah',
          transactionDate: new Date(),
        }),
      );

      const useCase = new RecordManualIncomeUseCase(
        mockWalletRepo,
        mockTransactionRepo,
      );
      const result = await useCase.execute('user-1', {
        walletId: 'wallet-1',
        amount: 500000,
        source: 'Claim Poin Harian',
        forMember: 'Ayah',
      });

      expect(mockWalletRepo.incrementBalance).toHaveBeenCalledWith(
        'wallet-1',
        500000,
      );
      expect(result.updatedBalance).toBe(5500000);
      expect(result.transaction.totalAmount).toBe(500000);
    });

    it('should throw NotFoundException if wallet does not exist', async () => {
      mockWalletRepo.findById.mockResolvedValue(null);

      const useCase = new RecordManualIncomeUseCase(
        mockWalletRepo,
        mockTransactionRepo,
      );
      await expect(
        useCase.execute('user-1', {
          walletId: 'invalid-wallet',
          amount: 100000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateAutoIncomeScheduleUseCase', () => {
    it('should compute net income and create recurring schedule', async () => {
      mockWalletRepo.findById.mockResolvedValue(
        new WalletEntity({
          id: 'wallet-1',
          userId: 'user-1',
          name: 'BCA',
          type: 'BANK',
          currentBalance: 0,
        }),
      );

      mockScheduleRepo.create.mockImplementation((data: any) =>
        Promise.resolve(
          new RecurringScheduleEntity({
            id: 'sched-1',
            ...data,
          }),
        ),
      );

      const useCase = new CreateAutoIncomeScheduleUseCase(
        mockWalletRepo,
        mockScheduleRepo,
      );
      const result = await useCase.execute('user-1', {
        title: 'Gaji Kantor',
        walletId: 'wallet-1',
        dayOfMonth: 25,
        forMember: 'Ayah',
        items: [
          { name: 'Gaji Pokok', itemType: 'ALLOWANCE', amount: 10000000 },
          {
            name: 'Tunjangan Transport',
            itemType: 'ALLOWANCE',
            amount: 2000000,
          },
          { name: 'Potongan PPh 21', itemType: 'DEDUCTION', amount: 500000 },
        ],
      });

      expect(result.totalAmount).toBe(11500000); // 12,000,000 - 500,000
      expect(result.dayOfMonth).toBe(25);
    });
  });

  describe('SimulateAnnualIncomeUseCase', () => {
    it('should simulate 12-month projection and THR estimate', async () => {
      mockScheduleRepo.findByUserId.mockResolvedValue([
        new RecurringScheduleEntity({
          id: 'sched-1',
          userId: 'user-1',
          title: 'Gaji Bulanan',
          type: 'INCOME',
          walletId: 'wallet-1',
          frequency: 'MONTHLY',
          dayOfMonth: 25,
          totalAmount: 11500000,
          nextExecutionDate: '2026-12-25',
          isActive: true,
          items: [
            new RecurringBreakdownItemEntity({
              name: 'Gaji Pokok',
              itemType: 'ALLOWANCE',
              amount: 10000000,
            }),
            new RecurringBreakdownItemEntity({
              name: 'Tunjangan',
              itemType: 'ALLOWANCE',
              amount: 2000000,
            }),
            new RecurringBreakdownItemEntity({
              name: 'PPh 21',
              itemType: 'DEDUCTION',
              amount: 500000,
            }),
          ],
        }),
      ]);

      const useCase = new SimulateAnnualIncomeUseCase(mockScheduleRepo);
      const simulation = await useCase.execute('user-1');

      expect(simulation.monthlyNetTotal).toBe(11500000);
      expect(simulation.annualNetTotal).toBe(11500000 * 12); // 138,000,000
      expect(simulation.thrEstimate).toBe(10000000); // 1x Gaji Pokok
      expect(simulation.annualTotalWithThr).toBe(138000000 + 10000000); // 148,000,000
    });
  });

  describe('CalculateTaxPreviewUseCase & RecordManualOutcomeUseCase', () => {
    it('should calculate preview tax correctly with default config', async () => {
      mockTaxConfigRepo.findDefaultByUserId.mockResolvedValue(
        new TaxConfigEntity({
          id: 'tax-1',
          userId: 'user-1',
          name: 'PPN 11%',
          ratePercent: 11,
          isDefault: true,
        }),
      );

      const useCase = new CalculateTaxPreviewUseCase(mockTaxConfigRepo);
      const result = await useCase.execute('user-1', { baseAmount: 200000 });

      expect(result.taxRatePercent).toBe(11);
      expect(result.predictedTax).toBe(22000);
      expect(result.estimatedTotal).toBe(222000);
    });

    it('should record outcome with actual tax override, purpose, and member', async () => {
      mockWalletRepo.findById
        .mockResolvedValueOnce(
          new WalletEntity({
            id: 'wallet-1',
            userId: 'user-1',
            name: 'BCA',
            type: 'BANK',
            currentBalance: 1000000,
          }),
        )
        .mockResolvedValueOnce(
          new WalletEntity({
            id: 'wallet-1',
            userId: 'user-1',
            name: 'BCA',
            type: 'BANK',
            currentBalance: 775000,
          }),
        );

      mockTransactionRepo.create.mockResolvedValue(
        new CashflowTransactionEntity({
          id: 'tx-out-1',
          userId: 'user-1',
          type: 'OUTCOME',
          mode: 'MANUAL',
          walletId: 'wallet-1',
          baseAmount: 200000,
          predictedTax: 22000,
          actualTax: 25000, // overridden from receipt
          totalAmount: 225000,
          channel: 'ONLINE',
          purpose: 'Baju Lebaran',
          forMember: 'Anak 1',
          sourceOrMerchant: 'Shopee',
          transactionDate: new Date(),
        }),
      );

      const useCase = new RecordManualOutcomeUseCase(
        mockWalletRepo,
        mockTaxConfigRepo,
        mockTransactionRepo,
      );

      const result = await useCase.execute('user-1', {
        walletId: 'wallet-1',
        baseAmount: 200000,
        taxRatePercent: 11,
        actualTax: 25000,
        channel: 'ONLINE',
        purpose: 'Baju Lebaran',
        forMember: 'Anak 1',
        merchant: 'Shopee',
      });

      expect(mockWalletRepo.decrementBalance).toHaveBeenCalledWith(
        'wallet-1',
        225000,
      );
      expect(result.transaction.totalAmount).toBe(225000);
      expect(result.transaction.purpose).toBe('Baju Lebaran');
      expect(result.transaction.forMember).toBe('Anak 1');
    });
  });

  describe('GetCashflowSummaryUseCase', () => {
    it('should aggregate income, outcome, wallets liquidity, and member breakdown', async () => {
      mockWalletRepo.findByUserId.mockResolvedValue([
        new WalletEntity({
          id: 'w-1',
          userId: 'user-1',
          name: 'BCA',
          type: 'BANK',
          currentBalance: 10000000,
        }),
        new WalletEntity({
          id: 'w-2',
          userId: 'user-1',
          name: 'GoPay',
          type: 'E_WALLET',
          currentBalance: 500000,
        }),
      ]);

      mockCategoryRepo.findByUserId.mockResolvedValue([
        new CategoryEntity({
          id: 'c-1',
          userId: 'user-1',
          name: 'Fashion',
          type: 'OUTCOME',
        }),
      ]);

      mockTransactionRepo.findWithFilters.mockResolvedValue([
        new CashflowTransactionEntity({
          id: 't-1',
          userId: 'user-1',
          type: 'INCOME',
          mode: 'AUTO',
          walletId: 'w-1',
          baseAmount: 11500000,
          totalAmount: 11500000,
          forMember: 'Ayah',
          transactionDate: new Date(),
        }),
        new CashflowTransactionEntity({
          id: 't-2',
          userId: 'user-1',
          type: 'OUTCOME',
          mode: 'MANUAL',
          walletId: 'w-2',
          categoryId: 'c-1',
          baseAmount: 200000,
          totalAmount: 225000,
          channel: 'ONLINE',
          purpose: 'Baju Lebaran',
          forMember: 'Anak 1',
          transactionDate: new Date(),
        }),
      ]);

      const useCase = new GetCashflowSummaryUseCase(
        mockWalletRepo,
        mockCategoryRepo,
        mockTransactionRepo,
      );

      const summary = await useCase.execute('user-1');

      expect(summary.overview.totalIncome).toBe(11500000);
      expect(summary.overview.totalOutcome).toBe(225000);
      expect(summary.overview.netCashflow).toBe(11500000 - 225000);
      expect(summary.overview.totalLiquidity).toBe(10500000);
      expect(summary.byMember.length).toBe(2);
      expect(summary.byChannel.onlineTotal).toBe(225000);
    });
  });

  describe('ProcessDueRecurringSchedulesUseCase', () => {
    it('should process due schedules and update wallet balance', async () => {
      mockScheduleRepo.findDueSchedules.mockResolvedValue([
        new RecurringScheduleEntity({
          id: 'sched-due',
          userId: 'user-1',
          title: 'Gaji Bulanan',
          type: 'INCOME',
          walletId: 'w-1',
          frequency: 'MONTHLY',
          dayOfMonth: 20,
          totalAmount: 10000000,
          nextExecutionDate: '2026-11-20',
          isActive: true,
        }),
      ]);

      const useCase = new ProcessDueRecurringSchedulesUseCase(
        mockWalletRepo,
        mockScheduleRepo,
        mockTransactionRepo,
      );

      const results = await useCase.execute('2026-11-20');

      expect(results.length).toBe(1);
      expect(mockTransactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'INCOME',
          mode: 'AUTO',
          totalAmount: 10000000,
        }),
      );
      expect(mockWalletRepo.incrementBalance).toHaveBeenCalledWith(
        'w-1',
        10000000,
      );
      expect(mockScheduleRepo.updateNextExecutionDate).toHaveBeenCalledWith(
        'sched-due',
        '2026-12-20',
      );
    });
  });
});
