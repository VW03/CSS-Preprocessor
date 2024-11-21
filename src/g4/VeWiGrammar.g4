grammar VeWiGrammar;

waarde
    : (IDENTIFICATIE | NUMMER | STRING | KLEUR | percentage)+
    ;

/*
 * Lexer rules
 */
IDENTIFICATIE
    : [a-zA-Z_][a-zA-Z0-9_-]*
    ;

STRING
    : '"' .*? '"'
    | '\'' .*? '\''
    ;

KLEUR
    : '#' [0-9a-fA-F]{3,6}
    ;

NUMMER
    : [0-9]+ ('.' [0-9]+)?
    ;

percentage
    : NUMMER '%'
    ;