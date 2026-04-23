import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AlertaAssistenciaSocial } from '@/core/enums/alerta-assistencia-social';
import { AlertaEducacao } from '@/core/enums/alerta-educacao';
import { AlertaSaude } from '@/core/enums/alerta-saude';

export interface SaudeProps {
	ultimaConsulta: Date | null;
	vacinasEmDia: boolean;
	alertas: AlertaSaude[];
}

export interface EducacaoProps {
	escola: string | null;
	frequenciaPercent: number | null;
	alertas: AlertaEducacao[];
}

export interface AssistenciaSocialProps {
	cadUnico: boolean;
	beneficioAtivo: boolean;
	alertas: AlertaAssistenciaSocial[];
}

export interface ChildProps {
	nome: string;
	dataNascimento: Date;
	bairro: string;
	responsavel: string;
	saude: SaudeProps | null;
	educacao: EducacaoProps | null;
	assistenciaSocial: AssistenciaSocialProps | null;
	revisado: boolean;
	revisadoPor: string | null;
	revisadoEm: Date | null;
}

export class Child extends Entity<ChildProps> {
	get nome() {
		return this.props.nome;
	}

	get dataNascimento() {
		return this.props.dataNascimento;
	}

	get bairro() {
		return this.props.bairro;
	}

	get responsavel() {
		return this.props.responsavel;
	}

	get saude() {
		return this.props.saude;
	}

	get educacao() {
		return this.props.educacao;
	}

	get assistenciaSocial() {
		return this.props.assistenciaSocial;
	}

	get revisado() {
		return this.props.revisado;
	}

	get revisadoPor() {
		return this.props.revisadoPor;
	}

	get revisadoEm() {
		return this.props.revisadoEm;
	}

	static create(props: ChildProps, id?: UniqueEntityID) {
		const child = new Child(props, id);
		return child;
	}
}
