import {BusinessException} from '../../domain/exceptions/business.exception.js';
import {SystemConfigRepositoryPort} from '../../core/persistence/system-config.repository.port.js';

export async function loadBillingConfig(
    repository: SystemConfigRepositoryPort,
    action: string,
): Promise<{monthlyFee: number; billingStartDate: Date}> {
    const configs = await repository.findByKeys(['monthly_fee', 'billing_start_date']);
    const monthlyFee = configs.get('monthly_fee');
    const billingStartDate = configs.get('billing_start_date');

    if (!monthlyFee || !billingStartDate) {
        throw new BusinessException(
            `Configure a mensalidade e a data de início de cobrança em /config antes de ${action}.`,
        );
    }

    return {monthlyFee: Number(monthlyFee.value), billingStartDate: new Date(billingStartDate.value)};
}
