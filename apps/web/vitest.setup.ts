import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// mock de @base-ui/react/input: substitui por <input> nativo com forwardRef para compatibilidade com jsdom
vi.mock('@base-ui/react/input', () => ({
	Input: React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
		(props, ref) => React.createElement('input', { ...props, ref }),
	),
}));
