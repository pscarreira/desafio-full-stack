import 'reflect-metadata';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { ChildModel } from '../src/infra/database/schemas/child.schema';
import { AlertaSaude } from '../src/core/enums/alerta-saude';
import { AlertaEducacao } from '../src/core/enums/alerta-educacao';
import { AlertaAssistenciaSocial } from '../src/core/enums/alerta-assistencia-social';

const SEED_PATH = path.resolve(__dirname, '../../../data/seed.json');
config({ path: path.resolve(__dirname, '../.env') });

interface SeedSaude {
	ultima_consulta: string | null;
	vacinas_em_dia: boolean;
	alertas: string[];
}

interface SeedEducacao {
	escola: string | null;
	frequencia_percent: number | null;
	alertas: string[];
}

interface SeedAssistenciaSocial {
	cad_unico: boolean;
	beneficio_ativo: boolean;
	alertas: string[];
}

interface SeedChild {
	id: string;
	nome: string;
	data_nascimento: string;
	bairro: string;
	responsavel: string;
	saude: SeedSaude | null;
	educacao: SeedEducacao | null;
	assistencia_social: SeedAssistenciaSocial | null;
	revisado: boolean;
	revisado_por: string | null;
	revisado_em: string | null;
}

function mapSeedToDocument(child: SeedChild) {
	return {
		nome: child.nome,
		dataNascimento: new Date(child.data_nascimento),
		bairro: child.bairro,
		responsavel: child.responsavel,
		saude: child.saude
			? {
					ultimaConsulta: child.saude.ultima_consulta
						? new Date(child.saude.ultima_consulta)
						: null,
					vacinasEmDia: child.saude.vacinas_em_dia,
					alertas: child.saude.alertas as AlertaSaude[],
				}
			: null,
		educacao: child.educacao
			? {
					escola: child.educacao.escola,
					frequenciaPercent: child.educacao.frequencia_percent,
					alertas: child.educacao.alertas as AlertaEducacao[],
				}
			: null,
		assistenciaSocial: child.assistencia_social
			? {
					cadUnico: child.assistencia_social.cad_unico,
					beneficioAtivo: child.assistencia_social.beneficio_ativo,
					alertas: child.assistencia_social.alertas as AlertaAssistenciaSocial[],
				}
			: null,
		revisado: child.revisado,
		revisadoPor: child.revisado_por,
		revisadoEm: child.revisado_em ? new Date(child.revisado_em) : null,
	};
}

async function seed() {
	const mongoUri = process.env.MONGO_URI;
	if (!mongoUri) {
		console.error('Erro: variável MONGO_URI não definida.');
		process.exit(1);
	}

	const raw = fs.readFileSync(SEED_PATH, 'utf-8');
	const seedData: SeedChild[] = JSON.parse(raw);

	await mongoose.connect(mongoUri);
	console.log('Conectado ao MongoDB.');

	const ChildSchema = SchemaFactory.createForClass(ChildModel);
	const ChildModelMongo =
		mongoose.models['ChildModel'] ??
		mongoose.model('ChildModel', ChildSchema, 'children');

	await ChildModelMongo.deleteMany({});
	console.log('Coleção "children" limpa.');

	const docs = seedData.map(mapSeedToDocument);
	await ChildModelMongo.insertMany(docs);
	console.log(`${docs.length} registros inseridos com sucesso.`);

	await mongoose.disconnect();
	console.log('Desconectado.');
}

seed().catch((err) => {
	console.error('Falha ao executar seed:', err);
	process.exit(1);
});
