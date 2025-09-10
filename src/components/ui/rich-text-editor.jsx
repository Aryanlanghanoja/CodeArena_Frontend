import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Quote,
  Code,
  Eye,
  Edit3
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import ReactMarkdown from 'react-markdown';

export default function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Enter your content...',
  className = '',
  rows = 6 
}) {
  const [activeTab, setActiveTab] = useState('edit');
  const textareaRef = useRef(null);

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertText('**', '**'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertText('*', '*'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: Underline,
      label: 'Underline',
      action: () => insertText('<u>', '</u>'),
      shortcut: 'Ctrl+U'
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertText('`', '`'),
      shortcut: 'Ctrl+`'
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertText('> ', ''),
      shortcut: 'Ctrl+Q'
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertText('- ', ''),
      shortcut: 'Ctrl+Shift+8'
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertText('1. ', ''),
      shortcut: 'Ctrl+Shift+7'
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](url)'),
      shortcut: 'Ctrl+K'
    }
  ];

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*');
          break;
        case 'u':
          e.preventDefault();
          insertText('<u>', '</u>');
          break;
        case '`':
          e.preventDefault();
          insertText('`', '`');
          break;
        case 'q':
          e.preventDefault();
          insertText('> ', '');
          break;
        case 'k':
          e.preventDefault();
          insertText('[', '](url)');
          break;
        default:
          break;
      }
    }
    
    // Handle Shift combinations
    if (e.ctrlKey && e.shiftKey) {
      switch (e.key) {
        case '8':
          e.preventDefault();
          insertText('- ', '');
          break;
        case '7':
          e.preventDefault();
          insertText('1. ', '');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-3">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border border-border rounded-lg bg-muted/30">
            {formatButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={`${button.label} (${button.shortcut})`}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
          
          {/* Text Editor */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm"
          />
          
          {/* Help Text */}
          <div className="text-xs text-muted-foreground">
            <p>Use Markdown formatting or the toolbar above. Keyboard shortcuts available:</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <span>**Bold** or Ctrl+B</span>
              <span>*Italic* or Ctrl+I</span>
              <span>`Code` or Ctrl+`</span>
              <span>&gt; Quote or Ctrl+Q</span>
              <span>- List or Ctrl+Shift+8</span>
              <span>[Link](url) or Ctrl+K</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-3">
          <div className="min-h-[200px] p-4 border border-border rounded-lg bg-muted/20">
            {value ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview yet...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
