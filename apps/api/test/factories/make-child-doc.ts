export function makeChildDoc(overrides: Record<string, unknown> = {}) {
	return {
		nome: 'João Silva',
		dataNascimento: new Date('2020-01-01'),
		bairro: 'Rocinha',
		responsavel: 'Maria Silva',
		saude: { ultimaConsulta: null, vacinasEmDia: true, alertas: [] },
		educacao: null,
		assistenciaSocial: null,
		revisado: false,
		revisadoPor: null,
		revisadoEm: null,
		...overrides,
	};
}
