import assert from 'node:assert/strict';
import {chargeCron, formatBRL, renderChargeMessage, validateChargeSetting} from './charge-settings.js';

const vars = {nome: 'Ana', mes: 'Setembro', valor_atraso: '50,00', saldo: '-50,00', mensalidade: '25,00'};

assert.equal(renderChargeMessage('Oi {{nome}}, {{ mes }}: R$ {{valor_atraso}}', vars), 'Oi Ana, Setembro: R$ 50,00');
assert.equal(renderChargeMessage('Saldo: R$ {{saldo}}', vars), 'Saldo: R$ -50,00');
assert.equal(formatBRL(1234.5), '1.234,50');
assert.equal(formatBRL(-50), '-50,00');
assert.equal(formatBRL(-0), '0,00');
assert.equal(chargeCron('1', '08:40'), '40 8 1 * *');

assert.equal(validateChargeSetting('charge_day', '28'), null);
assert.ok(validateChargeSetting('charge_day', '29'));
assert.ok(validateChargeSetting('charge_day', '0'));
assert.ok(validateChargeSetting('charge_day', 'dez'));
assert.equal(validateChargeSetting('charge_time', '08:40'), null);
assert.ok(validateChargeSetting('charge_time', '8:40'));
assert.ok(validateChargeSetting('charge_time', '24:00'));
assert.equal(validateChargeSetting('charge_message_ok', 'Oi {{nome}}, saldo {{saldo}}!'), null);
assert.match(validateChargeSetting('charge_message_ok', 'Oi {{nom}}!')!, /\{\{nom\}\}/);
assert.ok(validateChargeSetting('charge_message_pending', 'Oi {nome}!'));
assert.equal(validateChargeSetting('monthly_fee', 'qualquer'), null);

console.log('charge-settings: ok');
