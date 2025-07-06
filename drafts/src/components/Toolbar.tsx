'use client';

import { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
}

interface ToolbarButton {
  label: string;
  action: () => boolean;
  isActive: () => boolean;
  icon: string;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) {
    return null;
  }

  const buttons: ToolbarButton[] = [
    {
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
      icon: 'B',
    },
    {
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
      icon: 'I',
    },
    {
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
      icon: 'U',
    },
  ];

  return (
    <div className="border-b border-[#000000] p-2 flex gap-2 font-[Manrope]">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => button.action()}
          className={`p-2 rounded text-gray-700 hover:bg-gray-100 ${
            button.isActive() ? 'bg-gray-200 font-bold' : ''
          }`}
          title={button.label}
          type="button"
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};

export default Toolbar; 