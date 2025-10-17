import Toolbar from './Toolbar';

export default {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onAddItem: { action: 'addItem' },
  },
};

export const Default = {
  args: {},
};

export const WithActions = {
  args: {},
};
