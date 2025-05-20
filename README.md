## CSS Preprocessor [VeWiCSS in .vwcss formaat] - Vera Wise

### Project opzetten:

1. Download de 'Complete ANTLR 4.13.2 Java binaries jar' van:
https://www.antlr.org/download.html

2. Voer volgende commandos uit: (vervang het pad van de jar, als het op een andere plek staat)
```shell
cd ~/WebstormProjects/vera.wise/compiler/
npm i
cd src/g4
java -jar ~/Downloads/antlr-4.13.2-complete.jar -Dlanguage=JavaScript -visitor -o ./out VeWiGrammar.g4
```

3. Zet de exports telkens onderaan in de gegeneerde lexer, parser en visitor files:
```
export { VeWiGrammarLexer };
export { VeWiGrammarParser };
export { VeWiGrammarVisitor };
```

### Webpack Loader Applicatie
Om de webpack plugin app te runnen, voer deze commandos uit in de root van het project:
```shell
cd webpack_loader/
npm i
```

### Demo Applicatie
Om de demo app te runnen en zodat de html pagina laadt, voer deze 3 commandos uit in de root van het project:
```shell
cd demo/
npm i
npx webpack 
cp dist/main.css src/main.css
```

Nu is de .vwcss goed getransformeerd naar .css en kan de html mooi getoond worden op webstorm zelf in de index.html pagina.
Daar staat ook een optie om het in een webbrowser te openen.

Of met deze 2 commandos wordt een http server opgestart (via vite) en kan het rechtstreeks getoond worden op eender welke lokale browser.
```shell
cd demo/
npm run build
npm run dev
```
De pagina is nu beschikbaar op: http://localhost:5173/

### Testen
Om alle testen te runnen kan dat of via de package.json. Of via dit commando:
```shell
cd compiler/
npm run test
```

### De compilatie-output:
code (.vwcss):
```
^^ Kind selector
header > nav [
    font-size -- 28pixels.
]
^^ Groep selector
header, footer [
    color -- #5323ff.
]
^^ Klasse selector:
.title [
    font-size -- 23pixels.
    color -- #123abc.
]
.subtitle [
    margin-top -- 2procent.
]
^^ Element selector:
div [
    background -- #bbe3ff.
]
^^ Attribuut selector
ul |padding| [
    padding -- 5procent.
]
li |padding="extra"| [
    padding-left -- 5procent.
]
^^ Nesting selector:
span [ a [
    background-color -- #94a4f2.
]]
^^ Parent selector:
p [
    span [
        color -- #9d62ff.
    ]
    <a [
        background-color -- #c5afe8.
    ]
]
^^ Alles selector
* [
    margin -- 2pixels. ^^ rond heel de pagina
]
^^--------------------------------------------^^
^^ Variabelen
€main-color :: #123abc.
a [
    color -- €main-color.
]
^^--------------------------------------------^^
@mixin button(€bg-color: #ffffff, €text-color: #ffffff) [
    background -- €bg-color.
    color -- €text-color.
    padding -- 10pixels.
    border-radius -- 5pixels.
    margin -- 2procent.
]
.m-button @includeer button(#94a4f2, #123abc).

@mixin noparam() [
    background -- #c996f2.
    color -- #123abc.
    padding -- 10pixels.
    border-radius -- 5pixels.
    margin -- 2procent.
]
.n-button @includeer noparam().
^^--------------------------------------------^^
^^ if-else:
@als €main-color gelijk #123abc [
  .button @includeer button(#9cf296, #123abc).
]
@anders [
  .button @includeer button(#f29696, #123abc).
]

@als €main-color niet #123abc [
  .else-button @includeer button(#9cf296, #123abc).
]
@anders [
  .else-button @includeer button(#f29696, #123abc).
]
€size :: 10procent.
@als €size groter 12 [
  .if-button @includeer button(#c996f2, #123abc).
]
^^--------------------------------------------^^
^^ for lus:
@voor €i van 1 tot 3 [
  .color_€i [
    width -- €i * 20 pixels.
  ]
]
^^ while lus:
€j :: 1.
@terwijl €j kleiner 4 [
  .box_€j [
    width -- €j * 2 procent.
  ]
  €j :: €j + 1.
]
^^--------------------------------------------^^
```
output (.css):
```
/*!***************************************************************************************************************************!*\
  !*** css ./node_modules/css-loader/dist/cjs.js!../webpack_loader/loader.js??ruleSet[1].rules[0].use[2]!./src/index.vwcss ***!
  \***************************************************************************************************************************/
header > nav {
  font-size: 28px;
}
header,footer {
  color: #5323ff;
}
.title {
  font-size: 23px;
  color: #123abc;
}
.subtitle {
  margin-top: 2%;
}
div {
  background: #bbe3ff;
}
ul[padding] {
  padding: 5%;
}
li[padding="extra"] {
  padding-left: 5%;
}
span a {
  background-color: #94a4f2;
}
p span {
  color: #9d62ff;
}
p:has(> a) {
  background-color: #c5afe8;
}
* {
  margin: 2px;
}
a {
  color: #123abc;
}
.m-button {
  background: #94a4f2;
  color: #123abc;
  padding: 10px;
  border-radius: 5px;
  margin: 2%;
}
.n-button {
  background: #c996f2;
  color: #123abc;
  padding: 10px;
  border-radius: 5px;
  margin: 2%;
}
.button {
  background: #9cf296;
  color: #123abc;
  padding: 10px;
  border-radius: 5px;
  margin: 2%;
}
.else-button {
  background: #f29696;
  color: #123abc;
  padding: 10px;
  border-radius: 5px;
  margin: 2%;
}
.if-button {
  background: #c996f2;
  color: #123abc;
  padding: 10px;
  border-radius: 5px;
  margin: 2%;
}
.color_1 {
  width: 20px;
}
.color_2 {
  width: 40px;
}
.color_3 {
  width: 60px;
}
.box_1 {
  width: 2%;
}
.box_2 {
  width: 4%;
}
.box_3 {
  width: 6%;
}
```

### EBNF-beschrijving grammatica:
#### Parser rules:
stylesheet ::= statement* EOF

statement ::= ruleset
    | variableDeclaration
    | mixinDeclaration
    | forLus
    | whileLus
    | ifElse;

ruleset ::= selector '[' statement* declaration* ']'
    | selector '>' selector '[' statement* declaration* ']' 
    | selector '[' selector '[' statement* declaration* ']' ']' 
    | selector mixinUsage
    ;

selector ::= IDENTIFICATIE (',' IDENTIFICATIE)* 
    | DYNAMISCHE_KLASSE 
    | '.' IDENTIFICATIE 
    | '#' IDENTIFICATIE 
    | VAR 
    | IDENTIFICATIE '|' attributeSelector? '|' 
    | '*' //alles selector
    | '<' IDENTIFICATIE 
    ;                   

pseudoClass ::= ":" IDENTIFICATIE;

pseudoElement ::= "::" IDENTIFICATIE;

attributeSelector ::= IDENTIFICATIE "=" STRING 
    | IDENTIFICATIE
    ;

declaration ::= IDENTIFICATIE "--" value ".";

value ::= VAR
    | STRING
    | NUMMER [ "pixels" | "procent" ]
    | KLEUR
    | value "+" value
    | value "-" value
    | value "*" value
    | value "/" value
    ;

check ::= value "kleiner" value
    | value "groter" value
    | value "gelijk" value
    | value "niet" value
    | value
    ;

variableDeclaration ::= VAR "::" value ".";

mixinDeclaration ::= '@mixin' IDENTIFICATIE '(' (param (',' param)*)? ')' '[' declaration* ']' ;

mixinUsage ::= '@includeer' IDENTIFICATIE '('? (value (',' value)*)? ')'? '.' ;

param ::= VAR ':'? value? ;

forLus ::= '@voor' VAR 'van' NUMMER 'tot' NUMMER '[' statement* ']' ;

whileLus ::= '@terwijl' check '[' statement* ']' ;

ifElse ::= '\@als' check '[' statement* ']' ( '\@anders' '[' statement* ']' )? ;

#### Lexer rules:
DYNAMISCHE_KLASSE ::= '.' IDENTIFICATIE '_' '€'[a-zA-Z_][a-zA-Z0-9_-]* ;

IDENTIFICATIE ::= [a-zA-Z_][a-zA-Z0-9_-]* ;

STRING ::= '"' .*? '"' ;

KLEUR ::= '#' [0-9a-fA-F]+ ;

NUMMER ::= [0-9]+ (',' [0-9]+)? ;

VAR ::= '€' IDENTIFICATIE ;

WS ::= [ \t\r\n]+ -> skip ;

COMMENT ::= '^^' {~[\r\n]}* -> skip