import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AlertaAssistenciaSocial } from '@/core/enums/alerta-assistencia-social';
import { AlertaEducacao } from '@/core/enums/alerta-educacao';
import { AlertaSaude } from '@/core/enums/alerta-saude';

export type ChildDocument = HydratedDocument<ChildModel>;

@Schema({ _id: false })
class SaudeSchema {
	@Prop({ type: Date, default: null })
	ultimaConsulta: Date | null;

	@Prop({ required: true })
	vacinasEmDia: boolean;

	@Prop({ type: [String], enum: AlertaSaude, default: [] })
	alertas: AlertaSaude[];
}

@Schema({ _id: false })
class EducacaoSchema {
	@Prop({ type: String, default: null })
	escola: string | null;

	@Prop({ type: Number, default: null })
	frequenciaPercent: number | null;

	@Prop({ type: [String], enum: AlertaEducacao, default: [] })
	alertas: AlertaEducacao[];
}

@Schema({ _id: false })
class AssistenciaSocialSchema {
	@Prop({ required: true })
	cadUnico: boolean;

	@Prop({ required: true })
	beneficioAtivo: boolean;

	@Prop({ type: [String], enum: AlertaAssistenciaSocial, default: [] })
	alertas: AlertaAssistenciaSocial[];
}

@Schema({ collection: 'children', timestamps: false })
export class ChildModel {
	@Prop({ required: true })
	nome: string;

	@Prop({ required: true })
	dataNascimento: Date;

	@Prop({ required: true })
	bairro: string;

	@Prop({ required: true })
	responsavel: string;

	@Prop({ type: SaudeSchema, default: null })
	saude: SaudeSchema | null;

	@Prop({ type: EducacaoSchema, default: null })
	educacao: EducacaoSchema | null;

	@Prop({ type: AssistenciaSocialSchema, default: null })
	assistenciaSocial: AssistenciaSocialSchema | null;

	@Prop({ default: false })
	revisado: boolean;

	@Prop({ type: String, default: null })
	revisadoPor: string | null;

	@Prop({ type: Date, default: null })
	revisadoEm: Date | null;
}

export const ChildSchema = SchemaFactory.createForClass(ChildModel);

export type ChildModelType = typeof ChildModel;

ChildSchema.pre('save', async function (_next) {
	if (!this.id) {
		this._id = new Types.ObjectId();
	}
});
