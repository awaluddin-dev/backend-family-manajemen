import 'dotenv/config';

async function run() {
  const baseUrl = 'http://localhost:3000';
  const testEmail = `cashflow_${Date.now()}@family.com`;
  const testPassword = 'PasswordFamily123!';
  const testName = 'Keluarga Bahagia';

  console.log('1. Signing up user for Cashflow test...');
  const signupRes = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  });
  const authData = await signupRes.json();
  if (signupRes.status !== 201) {
    throw new Error(`Signup failed: ${JSON.stringify(authData)}`);
  }
  const token = authData.accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('User signed up successfully. Token obtained.');

  console.log('\n2. Creating Wallets (BCA Utama & Dompet Tunai)...');
  const bcaRes = await fetch(`${baseUrl}/wallets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'BCA Rekening Utama',
      type: 'BANK',
      initialBalance: 1000000,
      accountNumber: '1234567890',
    }),
  });
  const bcaWallet = await bcaRes.json();
  console.log('BCA Wallet created:', bcaWallet.id, 'Balance:', bcaWallet.currentBalance);

  const cashRes = await fetch(`${baseUrl}/wallets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Dompet Tunai',
      type: 'CASH',
      initialBalance: 200000,
    }),
  });
  const cashWallet = await cashRes.json();
  console.log('Cash Wallet created:', cashWallet.id, 'Balance:', cashWallet.currentBalance);

  console.log('\n3. Creating Categories & Tax Config...');
  const catRes = await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Fashion',
      type: 'OUTCOME',
      icon: 'tshirt',
    }),
  });
  const fashionCategory = await catRes.json();
  console.log('Fashion category created:', fashionCategory.id);

  const taxRes = await fetch(`${baseUrl}/tax-configs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'PPN 11%',
      ratePercent: 11,
      isDefault: true,
    }),
  });
  const taxConfig = await taxRes.json();
  console.log('Default tax config created:', taxConfig.name, `${taxConfig.ratePercent}%`);

  console.log('\n4. Recording Manual Income (Claim Poin Harian: Rp 50.000)...');
  const manualIncomeRes = await fetch(`${baseUrl}/cashflow/incomes/manual`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      walletId: bcaWallet.id,
      amount: 50000,
      source: 'Claim Poin Harian',
      forMember: 'Ayah',
      notes: 'Poin harian aplikasi belanja',
    }),
  });
  const manualIncomeData = await manualIncomeRes.json();
  console.log('Manual income recorded. Updated BCA balance:', manualIncomeData.updatedBalance);
  if (manualIncomeData.updatedBalance !== 1050000) {
    throw new Error(`Expected BCA balance 1050000 but got ${manualIncomeData.updatedBalance}`);
  }

  console.log('\n5. Creating Auto Income Schedule (Gaji Bulanan PT XYZ)...');
  const autoIncomeRes = await fetch(`${baseUrl}/cashflow/incomes/auto-schedule`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Gaji Bulanan PT XYZ',
      walletId: bcaWallet.id,
      dayOfMonth: 25,
      forMember: 'Ayah',
      items: [
        { name: 'Gaji Pokok', itemType: 'ALLOWANCE', amount: 10000000 },
        { name: 'Tunjangan Transport', itemType: 'ALLOWANCE', amount: 2000000 },
        { name: 'Potongan PPh 21', itemType: 'DEDUCTION', amount: 500000 },
        { name: 'Potongan BPJS', itemType: 'DEDUCTION', amount: 200000 },
      ],
    }),
  });
  const autoIncomeSchedule = await autoIncomeRes.json();
  console.log('Auto Income Schedule created:');
  console.log('  Net Total per Month:', autoIncomeSchedule.totalAmount);
  console.log('  Next Execution Date:', autoIncomeSchedule.nextExecutionDate);
  if (autoIncomeSchedule.totalAmount !== 11300000) {
    throw new Error(`Expected Net Amount 11300000 but got ${autoIncomeSchedule.totalAmount}`);
  }

  console.log('\n6. Testing 1-Year Annual Income Simulation...');
  const simulationRes = await fetch(`${baseUrl}/cashflow/incomes/simulation/annual`, {
    headers,
  });
  const simulationData = await simulationRes.json();
  console.log('Annual Simulation Results:');
  console.log('  Monthly Net Total:', simulationData.monthlyNetTotal);
  console.log('  Annual Net Total (12 mo):', simulationData.annualNetTotal);
  console.log('  THR Estimate (1x Gaji Pokok):', simulationData.thrEstimate);
  console.log('  Annual Total With THR:', simulationData.annualTotalWithThr);

  if (simulationData.annualNetTotal !== 135600000) {
    throw new Error(`Expected 135600000 but got ${simulationData.annualNetTotal}`);
  }

  console.log('\n7. Testing Tax Preview on Outcome (Base 200.000)...');
  const taxPreviewRes = await fetch(`${baseUrl}/cashflow/outcomes/preview-tax`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ baseAmount: 200000 }),
  });
  const taxPreviewData = await taxPreviewRes.json();
  console.log('Tax Preview:');
  console.log('  Base Amount:', taxPreviewData.baseAmount);
  console.log('  Tax Rate:', taxPreviewData.taxRatePercent, '%');
  console.log('  Predicted Tax:', taxPreviewData.predictedTax);
  console.log('  Estimated Total:', taxPreviewData.estimatedTotal);

  console.log('\n8. Recording Manual Outcome with Actual Tax, Purpose, and Member...');
  const outcomeRes = await fetch(`${baseUrl}/cashflow/outcomes/manual`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      walletId: bcaWallet.id,
      categoryId: fashionCategory.id,
      baseAmount: 200000,
      actualTax: 25000, // overriden from receipt
      channel: 'ONLINE',
      purpose: 'Baju Lebaran',
      forMember: 'Anak 1',
      merchant: 'Shopee',
      notes: 'Beli gamis anak untuk lebaran',
    }),
  });
  const outcomeData = await outcomeRes.json();
  console.log('Manual Outcome recorded:');
  console.log('  Purpose:', outcomeData.transaction.purpose);
  console.log('  For Member:', outcomeData.transaction.forMember);
  console.log('  Channel:', outcomeData.transaction.channel);
  console.log('  Total Deducted:', outcomeData.transaction.totalAmount);
  console.log('  Updated BCA balance:', outcomeData.updatedBalance);

  if (outcomeData.transaction.totalAmount !== 225000) {
    throw new Error(`Expected total 225000 but got ${outcomeData.transaction.totalAmount}`);
  }

  console.log('\n9. Triggering Auto Recurring Scheduler for today...');
  const triggerRes = await fetch(`${baseUrl}/cashflow/trigger-scheduler`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ targetDate: autoIncomeSchedule.nextExecutionDate }),
  });
  const triggerData = await triggerRes.json();
  console.log('Triggered scheduler processed items count:', triggerData.length);

  console.log('\n10. Fetching Comprehensive Cashflow Summary...');
  const summaryRes = await fetch(`${baseUrl}/cashflow/summary`, {
    headers,
  });
  const summary = await summaryRes.json();
  console.log('\n=== CASHFLOW SUMMARY OVERVIEW ===');
  console.log(JSON.stringify(summary, null, 2));

  console.log('\n=== ALL CASHFLOW E2E FLOWS VERIFIED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('Cashflow E2E Test Error:', err);
  process.exit(1);
});
