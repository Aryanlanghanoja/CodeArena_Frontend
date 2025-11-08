// Judge0 Supported Languages
// Based on Judge0 API documentation
// Language IDs and names from Judge0

export const JUDGE0_LANGUAGES = [
  { id: 43, name: 'Plain Text', value: 'plaintext' },
  { id: 44, name: 'Executable', value: 'executable' },
  { id: 45, name: 'Assembly (NASM 2.14.02)', value: 'assembly' },
  { id: 46, name: 'Bash (5.0.0)', value: 'bash' },
  { id: 47, name: 'Basic (FBC 1.07.1)', value: 'basic' },
  { id: 48, name: 'C (GCC 7.4.0)', value: 'c', judge0Id: 48 },
  { id: 49, name: 'C (GCC 8.3.0)', value: 'c', judge0Id: 49 },
  { id: 50, name: 'C (GCC 9.2.0)', value: 'c', judge0Id: 50 },
  { id: 51, name: 'C# (Mono 6.6.0.161)', value: 'csharp', judge0Id: 51 },
  { id: 52, name: 'C++ (GCC 7.4.0)', value: 'cpp', judge0Id: 52 },
  { id: 53, name: 'C++ (GCC 8.3.0)', value: 'cpp', judge0Id: 53 },
  { id: 54, name: 'C++ (GCC 9.2.0)', value: 'cpp', judge0Id: 54 },
  { id: 55, name: 'Common Lisp (SBCL 2.0.0)', value: 'lisp', judge0Id: 55 },
  { id: 56, name: 'D (DMD 2.089.1)', value: 'd', judge0Id: 56 },
  { id: 57, name: 'Elixir (1.9.4)', value: 'elixir', judge0Id: 57 },
  { id: 58, name: 'Erlang (OTP 22.2)', value: 'erlang', judge0Id: 58 },
  { id: 59, name: 'Fortran (GFortran 9.2.0)', value: 'fortran', judge0Id: 59 },
  { id: 60, name: 'Go (1.13.5)', value: 'go', judge0Id: 60 },
  { id: 61, name: 'Haskell (GHC 8.8.1)', value: 'haskell', judge0Id: 61 },
  { id: 62, name: 'Java (OpenJDK 13.0.1)', value: 'java', judge0Id: 62 },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)', value: 'javascript', judge0Id: 63 },
  { id: 64, name: 'Lua (5.3.5)', value: 'lua', judge0Id: 64 },
  { id: 65, name: 'OCaml (4.09.0)', value: 'ocaml', judge0Id: 65 },
  { id: 66, name: 'Octave (5.1.0)', value: 'octave', judge0Id: 66 },
  { id: 67, name: 'Pascal (FPC 3.0.4)', value: 'pascal', judge0Id: 67 },
  { id: 68, name: 'PHP (7.4.1)', value: 'php', judge0Id: 68 },
  { id: 69, name: 'Prolog (GNU Prolog 1.4.5)', value: 'prolog', judge0Id: 69 },
  { id: 70, name: 'Python (2.7.17)', value: 'python2', judge0Id: 70 },
  { id: 71, name: 'Python (3.8.1)', value: 'python', judge0Id: 71 },
  { id: 72, name: 'Ruby (2.7.0)', value: 'ruby', judge0Id: 72 },
  { id: 73, name: 'Rust (1.40.0)', value: 'rust', judge0Id: 73 },
  { id: 74, name: 'TypeScript (3.7.4)', value: 'typescript', judge0Id: 74 },
  { id: 78, name: 'Kotlin (1.3.70)', value: 'kotlin', judge0Id: 78 },
  { id: 79, name: 'OCaml (4.09.0)', value: 'ocaml', judge0Id: 79 },
  { id: 80, name: 'R (4.0.0)', value: 'r', judge0Id: 80 },
  { id: 81, name: 'Scala (2.13.2)', value: 'scala', judge0Id: 81 },
  { id: 82, name: 'Scheme (Gauche 0.9.8)', value: 'scheme', judge0Id: 82 },
  { id: 83, name: 'Swift (5.2.3)', value: 'swift', judge0Id: 83 },
  { id: 84, name: 'VB.NET (vbnc 0.0.0.5943)', value: 'vbnet', judge0Id: 84 },
  { id: 85, name: 'Perl (5.28.1)', value: 'perl', judge0Id: 85 },
  { id: 86, name: 'Clojure (1.10.1)', value: 'clojure', judge0Id: 86 },
  { id: 87, name: 'F# (.NET Core SDK 3.1.202)', value: 'fsharp', judge0Id: 87 },
  { id: 69, name: 'Dart (2.7.2)', value: 'dart', judge0Id: 69 },
];

// Popular languages (most commonly used)
export const POPULAR_LANGUAGES = [
  { id: 71, name: 'Python (3.8.1)', value: 'python', judge0Id: 71 },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)', value: 'javascript', judge0Id: 63 },
  { id: 54, name: 'C++ (GCC 9.2.0)', value: 'cpp', judge0Id: 54 },
  { id: 50, name: 'C (GCC 9.2.0)', value: 'c', judge0Id: 50 },
  { id: 62, name: 'Java (OpenJDK 13.0.1)', value: 'java', judge0Id: 62 },
  { id: 51, name: 'C# (Mono 6.6.0.161)', value: 'csharp', judge0Id: 51 },
  { id: 72, name: 'Ruby (2.7.0)', value: 'ruby', judge0Id: 72 },
  { id: 60, name: 'Go (1.13.5)', value: 'go', judge0Id: 60 },
  { id: 73, name: 'Rust (1.40.0)', value: 'rust', judge0Id: 73 },
  { id: 74, name: 'TypeScript (3.7.4)', value: 'typescript', judge0Id: 74 },
];

// Get language by Judge0 ID
export const getLanguageById = (id) => {
  return JUDGE0_LANGUAGES.find(lang => lang.id === id || lang.judge0Id === id);
};

// Get language by value
export const getLanguageByValue = (value) => {
  return JUDGE0_LANGUAGES.find(lang => lang.value === value);
};

// Get all unique language values (for filtering duplicates)
export const getUniqueLanguages = () => {
  const seen = new Set();
  return JUDGE0_LANGUAGES.filter(lang => {
    if (seen.has(lang.value)) return false;
    seen.add(lang.value);
    return true;
  });
};

