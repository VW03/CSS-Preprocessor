grammar VeWiGrammar;

// Parser rules
stylesheet
    : statement* EOF
    ;

statement
    : ruleset
    | variableDeclaration
    | mixinDeclaration
    | forLus
    | whileLus
    | ifElse
    ;

ruleset
    : selector '[' statement* declaration* ']'
    | selector '>' selector '[' statement* declaration* ']' //kind selector
    | selector '[' selector '[' statement* declaration* ']' ']' //nesting selector
    | selector mixinUsage
    ;

// css selectors:
selector
    : IDENTIFICATIE (',' IDENTIFICATIE)* // groep selector
    | DYNAMISCHE_KLASSE // voor loops
    | '.' IDENTIFICATIE //klasse selector
    | '#' IDENTIFICATIE //id selector
    | VAR // element selector
    | IDENTIFICATIE '|' attributeSelector? '|' // attribuut selector
    | '*' //alles selector
    | '<' IDENTIFICATIE // parent selector
    ;

pseudoClass
    : ':' IDENTIFICATIE
    ;

pseudoElement
    : '::' IDENTIFICATIE
    ;

attributeSelector
    : IDENTIFICATIE '=' STRING
    | IDENTIFICATIE
    ;
declaration
    : IDENTIFICATIE '--' value '.'
    ;

value
    : VAR
    | STRING
    | NUMMER ('pixels' | 'procent')?
    | KLEUR
    | value '+' value
    | value '-' value
    | value '*' value
    | value '/' value
    ;

check
    : value 'kleiner' value
    | value 'groter' value
    | value 'gelijk' value
    | value 'niet' value
    | value
    ;

variableDeclaration
    : VAR '::' value '.'
    ;

// mixins
mixinDeclaration
    : '@mixin' IDENTIFICATIE '(' (param (',' param)*)? ')' '[' declaration* ']'
    ;

mixinUsage
    : '@includeer' IDENTIFICATIE '('? (value (',' value)*)? ')'? '.'
    ;

param
    : VAR ':'? value?
    ;

//  controle-structuren (for, while, if-else)
forLus
    : '@voor' VAR 'van' NUMMER 'tot' NUMMER '[' statement* ']'
    ;

whileLus
    : '@terwijl' check '[' statement* ']'
    ;

ifElse
    : '@als' check '[' statement* ']' ( '@anders' '[' statement* ']' )?
    ;

// Lexer
DYNAMISCHE_KLASSE
    : '.' IDENTIFICATIE '_' '€'[a-zA-Z_][a-zA-Z0-9_-]* ;

IDENTIFICATIE
    : [a-zA-Z_][a-zA-Z0-9_-]* ; // klassennamen, id's, namen van variabelen

STRING
    : '"' .*? '"' ;

KLEUR
    : '#' [0-9a-fA-F]+ ; // in hex formaat

NUMMER
    : [0-9]+ (',' [0-9]+)? ;

VAR
    : '€' IDENTIFICATIE ; // Matches variables (e.g., $color)
WS
    : [ \t\r\n]+ -> skip ; // Witruimte word genegeerd

COMMENT
    : '^^' ~[\r\n]* -> skip; // 1 lijn commentaar