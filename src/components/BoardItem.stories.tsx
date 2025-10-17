import BoardItem from './BoardItem';

export default {
  title: 'Components/BoardItem',
  component: BoardItem,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    item: {
      control: 'object',
    },
    isSelected: {
      control: 'boolean',
    },
    onUpdate: { action: 'updated' },
    onDelete: { action: 'deleted' },
    onSelect: { action: 'selected' },
  },
};

const sampleTextItem = {
  id: 'text-1',
  type: 'text',
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  content: 'Sample text content',
  color: '#e3f2fd',
  rotation: 0,
};

const sampleShapeItem = {
  id: 'shape-1',
  type: 'shape',
  x: 100,
  y: 100,
  width: 150,
  height: 150,
  content: 'Circle',
  color: '#2196f3',
  rotation: 0,
};

const sampleStickyItem = {
  id: 'sticky-1',
  type: 'sticky',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  content: 'This is a sticky note with some important information',
  color: '#ffeb3b',
  rotation: 0,
};

export const TextItem = {
  args: {
    item: sampleTextItem,
    isSelected: false,
  },
};

export const TextItemSelected = {
  args: {
    item: sampleTextItem,
    isSelected: true,
  },
};

export const ShapeItem = {
  args: {
    item: sampleShapeItem,
    isSelected: false,
  },
};

export const ShapeItemSelected = {
  args: {
    item: sampleShapeItem,
    isSelected: true,
  },
};

export const StickyItem = {
  args: {
    item: sampleStickyItem,
    isSelected: false,
  },
};

export const StickyItemSelected = {
  args: {
    item: sampleStickyItem,
    isSelected: true,
  },
};

export const RotatedItem = {
  args: {
    item: {
      ...sampleTextItem,
      rotation: 15,
    },
    isSelected: false,
  },
};
