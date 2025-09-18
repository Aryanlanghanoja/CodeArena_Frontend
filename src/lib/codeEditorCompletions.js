import { autocompletion, CompletionContext } from '@codemirror/autocomplete';

const KEYWORDS = {
  javascript: [
    'break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','finally','for','function','if','import','in','instanceof','let','new','return','super','switch','this','throw','try','typeof','var','void','while','with','yield','await','async','of','foreach'
  ],
  python: [
    'False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield'
  ],
  cpp: [
    'alignas','alignof','and','and_eq','asm','atomic_cancel','atomic_commit','atomic_noexcept','auto','bitand','bitor','bool','break','case','catch','char','char16_t','char32_t','class','compl','concept','const','constexpr','const_cast','continue','co_await','co_return','co_yield','decltype','default','delete','do','double','dynamic_cast','else','enum','explicit','export','extern','false','float','for','friend','goto','if','inline','int','long','mutable','namespace','new','noexcept','not','not_eq','nullptr','operator','or','or_eq','private','protected','public','register','reinterpret_cast','requires','return','short','signed','sizeof','static','static_assert','static_cast','struct','switch','template','this','thread_local','throw','true','try','typedef','typeid','typename','union','unsigned','using','virtual','void','volatile','wchar_t','while','xor','xor_eq','foreach'
  ]
};

function createKeywordCompletionSource(languageKey) {
  const words = KEYWORDS[languageKey] || [];
  const options = words.map(w => ({ label: w, type: 'keyword' }));
  return (context) => {
    const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
    if (!word || (word.from == word.to && !context.explicit)) return null;
    return { from: word.from, options };
  };
}

function identifierCompletionSource(context) {
  const doc = context.state.doc.toString();
  const seen = new Set();
  const re = /[A-Za-z_][A-Za-z0-9_]*/g;
  let m;
  while ((m = re.exec(doc))) {
    const token = m[0];
    if (!KEYWORDS.javascript.includes(token) && !KEYWORDS.python.includes(token) && !KEYWORDS.cpp.includes(token)) {
      seen.add(token);
    }
  }
  const options = Array.from(seen).slice(0, 500).map(label => ({ label, type: 'variable' }));
  const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;
  return { from: word.from, options };
}

export function buildCompletionExtensions(selectedLanguage) {
  let langKey = 'javascript';
  if (selectedLanguage === 'python') langKey = 'python';
  else if (selectedLanguage === 'cpp' || selectedLanguage === 'c') langKey = 'cpp';

  const keywordSource = createKeywordCompletionSource(langKey);
  return [
    autocompletion({
      override: [keywordSource, identifierCompletionSource],
      activateOnTyping: true
    })
  ];
}


