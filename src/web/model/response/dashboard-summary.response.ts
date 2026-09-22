export class DashboardSummaryResponse {
    alunosAtivos: number;
    mensalidade: number;
    metaMensal: number;
    arrecadadoNoMes: number;
    valorEsperadoTotal: number;
    valorContribuidoTotal: number;
    diferencaTotal: number;

    constructor(partial: Partial<DashboardSummaryResponse>) {
        Object.assign(this, partial);
    }
}
