import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import LabResult from './LabResult';

const meta: Meta<typeof LabResult> = {
  title: 'Components/LabResult',
  component: LabResult,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['optimal', 'warning', 'critical'],
    },
    trend: {
      control: { type: 'select' },
      options: ['up', 'down', 'stable'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Optimal: Story = {
  args: {
    id: 'lab-1',
    parameter: 'Aspartate Aminotransferase',
    value: '20.7',
    unit: 'U/L',
    status: 'optimal',
    range: {
      min: 8,
      max: 45,
      warningMin: 10,
      warningMax: 40,
    },
    trend: 'stable',
    onEdit: () => console.log('Edit clicked'),
    onTrend: () => console.log('Trend clicked'),
    onReadMore: () => console.log('Read more clicked'),
  },
};

export const Warning: Story = {
  args: {
    id: 'lab-2',
    parameter: 'Hemoglobin',
    value: '11.2',
    unit: 'g/dL',
    status: 'warning',
    range: {
      min: 12,
      max: 16,
      warningMin: 12.5,
      warningMax: 15.5,
    },
    trend: 'down',
    onEdit: () => console.log('Edit clicked'),
    onTrend: () => console.log('Trend clicked'),
    onReadMore: () => console.log('Read more clicked'),
  },
};

export const Critical: Story = {
  args: {
    id: 'lab-3',
    parameter: 'Creatinine',
    value: '2.8',
    unit: 'mg/dL',
    status: 'critical',
    range: {
      min: 0.6,
      max: 1.2,
      warningMin: 0.8,
      warningMax: 1.0,
    },
    trend: 'up',
    onEdit: () => console.log('Edit clicked'),
    onTrend: () => console.log('Trend clicked'),
    onReadMore: () => console.log('Read more clicked'),
  },
};

export const LongParameterName: Story = {
  args: {
    id: 'lab-4',
    parameter: 'Alanine Aminotransferase (ALT)',
    value: '45.2',
    unit: 'U/L',
    status: 'optimal',
    range: {
      min: 7,
      max: 56,
      warningMin: 10,
      warningMax: 50,
    },
    trend: 'stable',
    onEdit: () => console.log('Edit clicked'),
    onTrend: () => console.log('Trend clicked'),
    onReadMore: () => console.log('Read more clicked'),
  },
};

export const WithoutActions: Story = {
  args: {
    id: 'lab-5',
    parameter: 'Glucose',
    value: '95',
    unit: 'mg/dL',
    status: 'optimal',
    range: {
      min: 70,
      max: 100,
    },
  },
};
