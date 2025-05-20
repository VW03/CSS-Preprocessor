### Dit is het compiler project
Om de compiler op te zetten doe:

1. Download de 'Complete ANTLR 4.13.2 Java binaries jar' van:
   https://www.antlr.org/download.html

2. Voer volgende commandos uit: (vervang het pad van de jar, als het op een andere plek staat)
```shell
cd ~/WebstormProjects/vera.wise/compiler/
npm i
cd src/g4
java -jar ~/Downloads/antlr-4.13.2-complete.jar -Dlanguage=JavaScript -visitor -o ./out VeWiGrammar.g4
```

3. Zet de exports telkens onderaan in de gegeneerde lexer, parser en visitor files: (zie compiler/src/g4/out folder)
```
export { VeWiGrammarLexer };
export { VeWiGrammarParser };
export { VeWiGrammarVisitor };
```

4. Om alle testen te runnen kan dat of via de package.json. Of via dit commando:
```shell
cd compiler/
npm run test
```
