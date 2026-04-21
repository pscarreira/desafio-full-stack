import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Home', () => {
	it('deve renderizar o título', () => {
		render(<Home />);
		expect(
			screen.getByRole('heading', { name: /desafio full stack/i }),
		).toBeInTheDocument();
	});
});
