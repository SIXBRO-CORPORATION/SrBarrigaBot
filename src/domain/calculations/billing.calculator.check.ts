import assert from 'node:assert/strict';
import {calculateClassTotals, round2} from './billing.calculator.js';

const base = {
    monthlyFee: 30,
    billingStartDate: new Date('2025-05-01'),
    referenceDate: new Date('2026-09-29T18:00:00Z'),
};
const none = {activeStudents: 0, paidByActive: 0, paidByInactive: 0};

assert.deepEqual(
    calculateClassTotals({...base, ...none, activeStudents: 1}),
    {valorEsperadoTotal: 510, valorContribuidoTotal: 0},
);

assert.deepEqual(
    calculateClassTotals({...base, ...none, paidByInactive: 200}),
    {valorEsperadoTotal: 200, valorContribuidoTotal: 200},
);

assert.deepEqual(
    calculateClassTotals({...base, ...none}),
    {valorEsperadoTotal: 0, valorContribuidoTotal: 0},
);

assert.deepEqual(
    calculateClassTotals({...base, ...none, paidByInactive: 600}),
    {valorEsperadoTotal: 600, valorContribuidoTotal: 600},
);

const totals = calculateClassTotals({...base, ...none, activeStudents: 27, paidByActive: 5271});
assert.equal(totals.valorEsperadoTotal, 13770);
assert.equal(totals.valorContribuidoTotal, 5271);
assert.equal(round2(totals.valorContribuidoTotal - totals.valorEsperadoTotal), -8499);

console.log('billing.calculator: ok');
