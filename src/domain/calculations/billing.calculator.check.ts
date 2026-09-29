import assert from 'node:assert/strict';
import {calculateClassTotals, round2} from './billing.calculator.js';

const base = {
    monthlyFee: 30,
    billingStartDate: new Date('2025-05-01'),
    referenceDate: new Date('2026-09-29T18:00:00Z'),
};

assert.deepEqual(
    calculateClassTotals({...base, students: [{active: true, paidAmount: 0}]}),
    {valorEsperadoTotal: 510, valorContribuidoTotal: 0},
);

assert.deepEqual(
    calculateClassTotals({...base, students: [{active: false, paidAmount: 200}]}),
    {valorEsperadoTotal: 200, valorContribuidoTotal: 200},
);

assert.deepEqual(
    calculateClassTotals({...base, students: [{active: false, paidAmount: 0}]}),
    {valorEsperadoTotal: 0, valorContribuidoTotal: 0},
);

assert.deepEqual(
    calculateClassTotals({...base, students: [{active: false, paidAmount: 600}]}),
    {valorEsperadoTotal: 600, valorContribuidoTotal: 600},
);

const students = [
    {active: true, paidAmount: 5271},
    ...Array.from({length: 26}, () => ({active: true, paidAmount: 0})),
    ...Array.from({length: 3}, () => ({active: false, paidAmount: 0})),
];
const totals = calculateClassTotals({...base, students});
assert.equal(totals.valorEsperadoTotal, 13770);
assert.equal(totals.valorContribuidoTotal, 5271);
assert.equal(round2(totals.valorContribuidoTotal - totals.valorEsperadoTotal), -8499);

console.log('billing.calculator: ok');
