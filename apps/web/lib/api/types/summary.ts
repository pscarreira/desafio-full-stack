export interface ChildSummary {
	totalChildren: number;
	reviewed: number;
	alertsByArea: {
		saude: number;
		educacao: number;
		assistenciaSocial: number;
	};
	percentageWithAlertsByArea: {
		saude: number;
		educacao: number;
		assistenciaSocial: number;
	};
}