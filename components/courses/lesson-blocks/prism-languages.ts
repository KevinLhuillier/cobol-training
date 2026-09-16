import Prism from "prismjs";
import "prismjs/components/prism-cobol";
import "prismjs/components/prism-sql";
import type { CodeBlockLanguage } from "./types";

// Prism n'a pas de grammaire JCL intégrée : définition minimale maison, suffisante pour
// distinguer visuellement les commentaires (//*), le marqueur d'instruction (//), les
// mots-clés de contrôle, les chaînes et les paramètres CLE=VALEUR (PGM=, DSN=, DISP=, ...).
Prism.languages.jcl = {
    comment: {
        pattern: /^\/\/\*.*/m,
        greedy: true,
    },
    string: {
        pattern: /'(?:[^'\r\n]|'')*'/,
        greedy: true,
    },
    keyword: /\b(?:JOB|EXEC|DD|PROC|PEND|SET|IF|THEN|ELSE|ENDIF|INCLUDE|OUTPUT|JCLLIB)\b/,
    parameter: /\b[A-Z][A-Z0-9]*(?=\s*=)/,
    "jcl-marker": /^\/\//m,
    number: /\b\d+\b/,
    punctuation: /[.,()=*]/,
};

export { Prism };

export const CODE_BLOCK_LANGUAGES: { value: CodeBlockLanguage; label: string }[] = [
    { value: "cobol", label: "COBOL" },
    { value: "jcl", label: "JCL" },
    { value: "sql", label: "SQL" },
];
