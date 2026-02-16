import type { ComponentType } from 'react';
import Summary from './aiccra/Summary';
import Example from './reportingtool/Example';

export interface TemplateProps {
  data: unknown;
}

export const templates: Record<string, ComponentType<TemplateProps>> = {
  summary: Summary,
  example: Example,
};
