import { EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine } from '@codemirror/view';
import { history, historyKeymap, defaultKeymap, indentSelection } from '@codemirror/commands';
import { foldGutter, foldKeymap, indentOnInput, bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { oneDark } from '@codemirror/theme-one-dark';
import { buildCompletionExtensions } from './codeEditorCompletions';

// Language mapping
const languageExtensions = {
  javascript: javascript({ jsx: true, typescript: false }),
  typescript: javascript({ jsx: true, typescript: true }),
  python: python(),
  cpp: cpp(),
  c: cpp(),
  java: java(),
  rust: rust(),
  go: go(),
  // Add more languages as needed
};

/**
 * Get language extension for a given language
 */
export function getLanguageExtension(language) {
  return languageExtensions[language] || javascript();
}

/**
 * Code snippets for common patterns
 */
const snippets = {
  javascript: [
    { label: 'for', type: 'snippet', apply: 'for (let i = 0; i < ${length}; i++) {\n\t${}\n}' },
    { label: 'forof', type: 'snippet', apply: 'for (const ${item} of ${array}) {\n\t${}\n}' },
    { label: 'foreach', type: 'snippet', apply: '${array}.forEach((${item}) => {\n\t${}\n})' },
    { label: 'if', type: 'snippet', apply: 'if (${condition}) {\n\t${}\n}' },
    { label: 'ifelse', type: 'snippet', apply: 'if (${condition}) {\n\t${}\n} else {\n\t${}\n}' },
    { label: 'function', type: 'snippet', apply: 'function ${name}(${params}) {\n\t${}\n}' },
    { label: 'arrow', type: 'snippet', apply: 'const ${name} = (${params}) => {\n\t${}\n}' },
    { label: 'async', type: 'snippet', apply: 'async function ${name}(${params}) {\n\t${}\n}' },
    { label: 'trycatch', type: 'snippet', apply: 'try {\n\t${}\n} catch (${error}) {\n\t${}\n}' },
    { label: 'console', type: 'snippet', apply: 'console.log(${})' },
  ],
  python: [
    { label: 'for', type: 'snippet', apply: 'for ${item} in ${iterable}:\n\t${}' },
    { label: 'forrange', type: 'snippet', apply: 'for i in range(${start}, ${end}):\n\t${}' },
    { label: 'if', type: 'snippet', apply: 'if ${condition}:\n\t${}' },
    { label: 'ifelse', type: 'snippet', apply: 'if ${condition}:\n\t${}\nelse:\n\t${}' },
    { label: 'def', type: 'snippet', apply: 'def ${name}(${params}):\n\t${}' },
    { label: 'class', type: 'snippet', apply: 'class ${name}:\n\tdef __init__(self${params}):\n\t\t${}' },
    { label: 'tryexcept', type: 'snippet', apply: 'try:\n\t${}\nexcept ${error}:\n\t${}' },
    { label: 'print', type: 'snippet', apply: 'print(${})' },
    { label: 'listcomp', type: 'snippet', apply: '[${expr} for ${item} in ${iterable}]' },
  ],
  cpp: [
    { label: 'for', type: 'snippet', apply: 'for (int i = 0; i < ${n}; i++) {\n\t${}\n}' },
    { label: 'forrange', type: 'snippet', apply: 'for (auto& ${item} : ${container}) {\n\t${}\n}' },
    { label: 'if', type: 'snippet', apply: 'if (${condition}) {\n\t${}\n}' },
    { label: 'ifelse', type: 'snippet', apply: 'if (${condition}) {\n\t${}\n} else {\n\t${}\n}' },
    { label: 'function', type: 'snippet', apply: '${returnType} ${name}(${params}) {\n\t${}\n}' },
    { label: 'class', type: 'snippet', apply: 'class ${name} {\npublic:\n\t${}\n};' },
    { label: 'main', type: 'snippet', apply: 'int main() {\n\t${}\n\treturn 0;\n}' },
    { label: 'cout', type: 'snippet', apply: 'std::cout << ${} << std::endl;' },
    { label: 'cin', type: 'snippet', apply: 'std::cin >> ${};' },
  ],
};

/**
 * Enhanced autocomplete with snippets
 */
function createSnippetCompletionSource(language) {
  const languageSnippets = snippets[language] || [];
  return (context) => {
    const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
    if (!word || (word.from == word.to && !context.explicit)) return null;
    
    const options = languageSnippets
      .filter(s => s.label.toLowerCase().startsWith(word.text.toLowerCase()))
      .map(s => ({
        label: s.label,
        type: s.type,
        apply: s.apply,
        boost: 10, // Boost snippets in autocomplete
      }));
    
    return options.length > 0 ? { from: word.from, options } : null;
  };
}

/**
 * Format code using Prettier-like formatting
 * Note: This is a basic formatter. For production, consider using prettier or similar
 */
function formatCode(view, language) {
  const state = view.state;
  const doc = state.doc;
  let formatted = doc.toString();
  
  // Basic formatting rules
  if (language === 'javascript' || language === 'typescript') {
    // Basic JS formatting
    formatted = formatted
      .replace(/\s*{\s*/g, ' { ')
      .replace(/\s*}\s*/g, ' } ')
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ') ')
      .replace(/;\s*/g, ';\n')
      .replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove multiple blank lines
  } else if (language === 'python') {
    // Python formatting (basic)
    formatted = formatted
      .replace(/\s*:\s*/g, ': ')
      .replace(/\n\s*\n\s*\n/g, '\n\n');
  }
  
  // Apply formatting if changed
  if (formatted !== doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: doc.length, insert: formatted },
    });
  }
}

/**
 * Format selection or entire document
 */
const formatKeymap = [
  {
    key: 'Shift-Alt-f',
    run: (view) => {
      // Get language from editor state or default to javascript
      // For now, we'll use a simple approach - format based on common patterns
      formatCode(view, 'javascript');
      return true;
    },
  },
];

// Language field for tracking current language (not used in current implementation but kept for future use)
// const languageField = Symbol('language');

/**
 * Enhanced keybindings (VS Code-like)
 */
const enhancedKeymap = [
  // Multi-cursor support
  {
    key: 'Alt-Click',
    run: (view, event) => {
      // Add cursor at click position
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos !== null) {
        view.dispatch({
          selection: { anchor: pos },
          effects: EditorView.scrollIntoView(pos, { y: 'center' }),
        });
      }
      return true;
    },
  },
  // Duplicate line
  {
    key: 'Shift-Alt-Down',
    run: (view) => {
      const { state } = view;
      const { selection } = state;
      const line = state.doc.lineAt(selection.main.head);
      const lineText = state.doc.sliceString(line.from, line.to);
      view.dispatch({
        changes: { from: line.to, insert: '\n' + lineText },
        selection: { anchor: line.to + 1 + lineText.length },
      });
      return true;
    },
  },
  {
    key: 'Shift-Alt-Up',
    run: (view) => {
      const { state } = view;
      const { selection } = state;
      const line = state.doc.lineAt(selection.main.head);
      const lineText = state.doc.sliceString(line.from, line.to);
      view.dispatch({
        changes: { from: line.from, insert: lineText + '\n' },
        selection: { anchor: line.from },
      });
      return true;
    },
  },
  // Move line up/down
  {
    key: 'Alt-Up',
    run: (view) => {
      const { state } = view;
      const { selection } = state;
      const line = state.doc.lineAt(selection.main.head);
      if (line.number > 1) {
        const prevLine = state.doc.line(line.number - 1);
        const lineText = state.doc.sliceString(line.from, line.to);
        const prevLineText = state.doc.sliceString(prevLine.from, prevLine.to);
        view.dispatch({
          changes: [
            { from: prevLine.from, to: prevLine.to, insert: lineText },
            { from: line.from, to: line.to, insert: prevLineText },
          ],
          selection: { anchor: prevLine.from + selection.main.head - line.from },
        });
      }
      return true;
    },
  },
  {
    key: 'Alt-Down',
    run: (view) => {
      const { state } = view;
      const { selection } = state;
      const line = state.doc.lineAt(selection.main.head);
      if (line.number < state.doc.lines) {
        const nextLine = state.doc.line(line.number + 1);
        const lineText = state.doc.sliceString(line.from, line.to);
        const nextLineText = state.doc.sliceString(nextLine.from, nextLine.to);
        view.dispatch({
          changes: [
            { from: line.from, to: line.to, insert: nextLineText },
            { from: nextLine.from, to: nextLine.to, insert: lineText },
          ],
          selection: { anchor: nextLine.from + selection.main.head - line.from },
        });
      }
      return true;
    },
  },
  // Comment toggle (will be enhanced with language detection)
  {
    key: 'Ctrl-/',
    run: (view) => {
      const { state } = view;
      const { selection } = state;
      // Default to JavaScript-style comments, can be enhanced with language detection
      const commentChars = '// ';
      
      const lines = [];
      for (const range of selection.ranges) {
        const fromLine = state.doc.lineAt(range.from);
        const toLine = state.doc.lineAt(range.to);
        for (let i = fromLine.number; i <= toLine.number; i++) {
          lines.push(state.doc.line(i));
        }
      }
      
      const changes = [];
      let allCommented = true;
      for (const line of lines) {
        const text = line.text;
        if (!text.trim().startsWith(commentChars.trim())) {
          allCommented = false;
          break;
        }
      }
      
      for (const line of lines) {
        if (allCommented) {
          // Uncomment
          const text = line.text;
          const uncommented = text.replace(new RegExp(`^${commentChars.trim()}`), '');
          changes.push({ from: line.from, to: line.to, insert: uncommented });
        } else {
          // Comment
          changes.push({ from: line.from, insert: commentChars });
        }
      }
      
      if (changes.length > 0) {
        view.dispatch({ changes });
      }
      return true;
    },
  },
  // Indent/Unindent
  {
    key: 'Tab',
    run: indentSelection,
  },
  {
    key: 'Shift-Tab',
    run: (view) => {
      const { state } = view;
      const { selection } = state;
      const changes = [];
      for (const range of selection.ranges) {
        const fromLine = state.doc.lineAt(range.from);
        const toLine = state.doc.lineAt(range.to);
        for (let i = fromLine.number; i <= toLine.number; i++) {
          const line = state.doc.line(i);
          if (line.text.startsWith('  ') || line.text.startsWith('\t')) {
            changes.push({ from: line.from, to: line.from + (line.text.startsWith('\t') ? 1 : 2), insert: '' });
          }
        }
      }
      if (changes.length > 0) {
        view.dispatch({ changes });
      }
      return true;
    },
  },
];

/**
 * Build enhanced editor extensions with VS Code-like features
 */
export function buildEnhancedEditorExtensions(language, isDarkMode, options = {}) {
  const {
    enableFormat = true,
    enableSnippets = true,
    enableSearch = true,
    enableLint = false,
    enableMultipleCursors = true,
    enableBracketColorization = true,
    restrictClipboard = false,
    customKeymap = [],
  } = options;

  const extensions = [];

  // Language support
  const langExt = getLanguageExtension(language);
  extensions.push(langExt);

  // Basic editor features
  extensions.push(
    history(),
    foldGutter(),
    drawSelection(),
    EditorView.lineWrapping,
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion({
      activateOnTyping: true,
      maxRenderedOptions: 10,
    }),
    highlightSelectionMatches(),
    highlightActiveLine(),
    highlightSpecialChars(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true })
  );

  // Theme
  if (isDarkMode) {
    extensions.push(oneDark);
  }

  // Enhanced autocomplete with snippets
  if (enableSnippets) {
    const snippetSource = createSnippetCompletionSource(language);
    const completionExts = buildCompletionExtensions(language);
    extensions.push(
      autocompletion({
        override: [
          snippetSource,
          ...(completionExts[0]?.override || []),
        ],
        activateOnTyping: true,
      })
    );
  } else {
    extensions.push(...buildCompletionExtensions(language));
  }

  // Search functionality
  if (enableSearch) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        // Enable search with Ctrl+F
      })
    );
  }

  // Keybindings
  const keymaps = [
    ...defaultKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...closeBracketsKeymap,
    ...completionKeymap,
    ...searchKeymap,
    ...enhancedKeymap,
  ];

  if (enableFormat) {
    keymaps.push(...formatKeymap);
  }

  if (customKeymap.length > 0) {
    keymaps.push(...customKeymap);
  }

  extensions.push(keymap.of(keymaps));

  // Bracket pair colorization (visual enhancement)
  if (enableBracketColorization) {
    extensions.push(
      EditorView.theme({
        '& .cm-matchingBracket': {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          outline: `1px solid ${isDarkMode ? '#4a9eff' : '#0066cc'}`,
        },
        '& .cm-nonmatchingBracket': {
          backgroundColor: isDarkMode ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)',
        },
      })
    );
  }

  // Editor configuration
  extensions.push(
    EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
      },
      '.cm-content': {
        padding: '12px',
        minHeight: '100%',
      },
      '.cm-line': {
        padding: '0 2px',
      },
      '.cm-gutters': {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fafafa',
        border: 'none',
      },
      '.cm-lineNumbers .cm-gutterElement': {
        padding: '0 8px',
        minWidth: '3ch',
      },
      '.cm-foldGutter': {
        width: '16px',
      },
    })
  );

  // Language tracking can be added here if needed in the future

  return extensions;
}

/**
 * Format code helper function
 */
export function formatEditorCode(view, language) {
  formatCode(view, language);
}

/**
 * Get editor configuration for basicSetup prop
 */
export function getBasicSetupConfig(options = {}) {
  const {
    lineNumbers = true,
    foldGutter: fold = true,
    dropCursor = false,
    allowMultipleSelections = true,
    indentOnInput = true,
    bracketMatching = true,
    closeBrackets = true,
    autocompletion: autoComplete = true,
    highlightSelectionMatches = true,
    searchKeymap: search = true,
    defaultKeymap: defaultKeys = true,
    historyKeymap: history = true,
    foldKeymap: foldKeys = true,
    syntaxHighlighting: syntax = true,
  } = options;

  return {
    lineNumbers,
    foldGutter: fold,
    dropCursor,
    allowMultipleSelections,
    indentOnInput,
    bracketMatching,
    closeBrackets,
    autocompletion: autoComplete,
    highlightSelectionMatches,
    searchKeymap: search,
    defaultKeymap: defaultKeys,
    historyKeymap: history,
    foldKeymap: foldKeys,
    syntaxHighlighting: syntax,
  };
}

