import Canvas from './Canvas';

export default {
  title: 'Components/Canvas',
  component: Canvas,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    items: { control: 'object' },
    selectedItemId: { control: 'text' },
    onUpdateItem: { action: 'updateItem' },
    onDeleteItem: { action: 'deleteItem' },
    onSelectItem: { action: 'selectItem' },
    onFocusRequest: { action: 'focusRequest' },
  },
};

const sampleItems = [
  {
    id: 'item-1',
    type: 'text',
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    content: 'Welcome to the board!',
    color: '#e3f2fd',
    rotation: 0,
  },
  {
    id: 'item-2',
    type: 'shape',
    x: 400,
    y: 200,
    width: 150,
    height: 150,
    content: 'Circle',
    color: '#2196f3',
    rotation: 0,
  },
  {
    id: 'item-3',
    type: 'sticky',
    x: 200,
    y: 400,
    width: 200,
    height: 150,
    content: 'This is a sticky note with important information',
    color: '#ffeb3b',
    rotation: 0,
  },
];

export const EmptyCanvas = {
  args: {
    items: [],
    selectedItemId: null,
  },
};

export const WithItems = {
  args: {
    items: sampleItems,
    selectedItemId: null,
  },
};

export const WithSelectedItem = {
  args: {
    items: sampleItems,
    selectedItemId: 'item-1',
  },
};

export const MultipleItems = {
  args: {
    items: [
      ...sampleItems,
      {
        id: 'item-4',
        type: 'text',
        x: 600,
        y: 100,
        width: 180,
        height: 80,
        content: 'Another text item',
        color: '#f3e5f5',
        rotation: 10,
      },
      {
        id: 'item-5',
        type: 'shape',
        x: 100,
        y: 600,
        width: 120,
        height: 120,
        content: 'Square',
        color: '#4caf50',
        rotation: -5,
      },
    ],
    selectedItemId: 'item-4',
  },
};
