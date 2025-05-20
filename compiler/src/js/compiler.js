import antlr4 from "antlr4";
import { VeWiGrammarLexer } from '../g4/out/VeWiGrammarLexer.js';
import { VeWiGrammarParser } from '../g4/out/VeWiGrammarParser.js';
import { VeWiGrammarVisitor } from '../g4/out/VeWiGrammarVisitor.js';


class Compiler extends VeWiGrammarVisitor {
    constructor() {
        super();
        this.output = [];
        this.variables = {};
        this.mixins = {};
        this.OperatorSave = 0;
    }

    // Parser rules:
    visitRuleset(ctx) {
        const selectors = ctx.selector();
        let selectorText = "";

        if (Array.isArray(selectors)) {
            selectorText = selectors.map(sel => {
                if (sel.getText().includes("|")) { // attribuut selector
                    return sel.getText().replace(/\|(.+?)\|/, '[$1]');
                }
                return sel.getText();
            }).join(" > ");
        } else if (selectors) { // enkel 1 selector
            selectorText = selectors.getText();
            if (selectorText.includes("|")) {  // attribuut selector
                selectorText = selectorText.replace(/\|(.+?)\|/, '[$1]');
            }
        }

        for (const [varName, value] of Object.entries(this.variables)) { //var in selector krijgen
            const varRegex = new RegExp(varName, 'g');
            selectorText = selectorText.replace(varRegex, value);
        }
        let wasStatement = false;
        if(ctx.children === null){
            throw new Error("Syntax error: VAR starten met een €!");
        }
        for (let child of ctx.children) {
            if(child.constructor.name === 'StatementContext') {
                wasStatement = true;
                this.visitSelector(selectorText,child)
            }
        }
        if(wasStatement){
            return;
        }
        this.output.push(`${selectorText} {`);

        for (let child of ctx.children) {
            if (child.constructor.name === 'DeclarationContext') {
                this.output.push(`  ${this.visitDeclaration(child)}`);
            } else if (child.constructor.name === 'MixinUsageContext') {
                this.output.push(`  ${this.visitMixinUsage(child)}`);
            }
        }

        this.output.push("}");
    }


    // css selectors:
    visitSelector(selectorText,ctx) {
        //  : IDENTIFICATIE (',' IDENTIFICATIE)* // groep selector
        //     | DYNAMIC_CLASS
        //     | '.' IDENTIFICATIE //klasse selector
        //     | '#' IDENTIFICATIE //id selector
        //     | VAR // element selector
        //     | IDENTIFICATIE '|' attributeSelector? '|' // attribuut selector
        //     | '*' //alles selector
        //     | '<' // parent selector

        let sel = ctx.getText();
        if (sel.includes("|")) {  // attribuut selector
            sel = sel.replace(/\|(.+?)\|/, '[$1]');
        }

        const match = sel.match(/^([^[]+)(\[.*\])?$/);
        if (match) {
            const baseSelector = match[1];
            const attributeSelector = match[2];
            if (sel.includes("<")) {  // parent selector
                const baseSelectorParent = baseSelector.replace("<", "").trim();
                this.output.push(`${selectorText}:has(> ${baseSelectorParent}) {`);
            }else{
                this.output.push(`${selectorText} ${baseSelector} {`);
            }

            const attrMatch = attributeSelector.match(/^\[([a-zA-Z-]+)--(.+?)\.\]$/);
            if (attrMatch) {
                const property = attrMatch[1];
                const value = attrMatch[2];
                this.output.push(`  ${property}: ${value};`);
            }
        }

        this.output.push(`}`);
    }

    visitDeclaration(ctx) {
        const property = ctx.IDENTIFICATIE().getText();
        let value = this.visitValue(ctx.value());
        if (value === undefined) {
            value = ctx.value().getText();
        }
        return `${property}: ${value};`;
    }
    visitValue(ctx) {
        if (ctx.VAR()) {
            const varName = ctx.VAR().getText();
            const value = this.variables[varName.replace('€', '$')];
            return this.variables[varName] || value;
        }
        else if (ctx.STRING()) {
            return ctx.STRING().getText();
        }
        else if (ctx.NUMMER()) {

            let value = ctx.NUMMER().getText();
            let unit = null;
            if (ctx.children.length > 1) { // check of er een unit bij staat
                unit = ctx.children[1].getText();
            }
            // check unit
            return this.checkUnit(value,unit);

        }
        else if (ctx.KLEUR()) {
            return ctx.KLEUR().getText();
        }
        else if (ctx.children.length === 3) {
            const leftValue = parseFloat(this.visitValue(ctx.value(0)));
            const operator = ctx.children[1].getText();
            const rightNum = this.visitValue(ctx.value(1));
            const rightValue = parseFloat(rightNum);

            let result;
            switch (operator) {
                case '+': result = leftValue + rightValue; break;
                case '-': result = leftValue - rightValue; break;
                case '*': result = leftValue * rightValue; break;
                case '/': result = leftValue / rightValue; break;
            }

            // check unit
            if(ctx.children[2].getText().includes('pixels')){
                return result.toString()+'px';
            } else if (ctx.children[2].getText().includes('procent')){
                return result.toString()+'%';
            } else if (!ctx.children[2].getText().includes('pixels') && !ctx.children[2].getText().includes('procent') && !ctx.children[2].getText().includes(null)) { //leeg of foute waarde
                throw new Error("Syntax error: enkel pixels en procent zijn geldige units!");
            }else if (ctx.children[2].getText().includes(null)){
                return value.toString();
            }
        }

        return ctx.getText();
    }

    checkUnit(value,unit){
        if (unit === 'pixels') {
            return value.toString()+'px';
        } else if (unit === 'procent') {
            return value.toString()+'%';
        } else if (unit !== 'pixels' && unit !== 'procent' && unit !== null){ //leeg of foute waarde
            throw new Error("Syntax error: units zijn verplicht en enkel pixels en procent zijn geldige units!");
        } else if (unit === null){
            return value.toString();
        }
    }

    visitCheck(ctx) {
        const left = parseInt(this.visitValue(ctx.value(0)))
        if(ctx.children[1] === undefined){
            throw new Error("Syntax error: om iets te vergelijken kan je enkel kleiner,groter,gelijk of niet gebruiken!");
        }
        const operator = ctx.children[1].getText();
        const right = parseInt(this.visitValue(ctx.value(1)));

        switch (operator) {
            case 'kleiner': return left < right;
            case 'groter': return left > right;
            case 'gelijk': return left === right;
            case 'niet': return left !== right;
        }
    }
    visitVariableDeclaration(ctx) {
        const variableName = ctx.VAR()?.getText();
        this.variables[variableName] = ctx.value()?.getText();

        if (ctx.children.length === 4) {
            let str = ctx.children[2].getText();
            let regex = /(€[a-zA-Z]+)([+\-*])(\d+)/;
            let match = str.match(regex);

            if (match) {
                const leftValue = this.OperatorSave
                const rightValue = parseFloat(match[3])

                switch (match[2]) { //operator
                    case '+': this.variables[variableName] = parseFloat(leftValue) + parseFloat(rightValue);
                              this.OperatorSave = leftValue + rightValue; break;
                    case '-': this.variables[variableName] = parseFloat(leftValue) - parseFloat(rightValue);
                              this.OperatorSave = leftValue - rightValue; break;
                    case '*': this.variables[variableName] = parseFloat(leftValue) * parseFloat(rightValue);
                              this.OperatorSave = leftValue * rightValue; break;
                    case '/': this.variables[variableName] = parseFloat(leftValue) / parseFloat(rightValue);
                              this.OperatorSave = leftValue / rightValue; break;
                }

            }

        }
        this.OperatorSave = this.variables[variableName];
    }

    // mixins
    visitMixinDeclaration(ctx) {
        const mixinName = ctx.IDENTIFICATIE().getText();
        const parameters = ctx.param().map(paramCtx => paramCtx.getText());
        const declarations = ctx.declaration();

        this.mixins[mixinName] = { parameters, declarations };
    }

    visitMixinUsage(ctx) {
        const mixinName = ctx.IDENTIFICATIE().getText();
        const providedValues = ctx.value().map(valueCtx => valueCtx.getText());
        const { parameters, declarations } = this.mixins[mixinName];

        const paramMap = {};
        parameters.forEach((paramWithDefault, index) => {
            const [paramName] = paramWithDefault.split(':');
            const cleanParamName = paramName.replace('€', '');
            paramMap[cleanParamName] = providedValues[index] || '';
        });

        let result = '';

        declarations.forEach(declarationCtx => {
            let rawDeclaration = this.visitDeclaration(declarationCtx);
            if (rawDeclaration) {
                Object.entries(paramMap).forEach(([param, value]) => {
                    const paramRegex = new RegExp(`€${param}`, 'g');
                    rawDeclaration = rawDeclaration.replace(paramRegex, value);
                });
                result += `  ${rawDeclaration}\n`;
            }
        });

        return result.trim();
    }

    // controle-structuren (for, while, if-else)
    visitForLus(ctx) {
        // : '@voor' VAR 'van' NUMMER 'tot' NUMMER '[' statement* ']'
        const variableName = ctx.VAR().getText();
        const start = parseInt(ctx.NUMMER(0).getText(), 10);
        const end = parseInt(ctx.NUMMER(1).getText(), 10);
        const loopStatements = ctx.statement();

        for (let i = start; i <= end; i++) {
            this.variables[variableName] = i;

            for (let statement of loopStatements) {
                const result = this.visit(statement);

                if (typeof result === 'string') {
                    this.output.push(result.replace(new RegExp(variableName, 'g'), i));
                }
            }
        }
    }
    visitWhileLus(ctx) {
        //  '@terwijl' check '[' statement* ']'
        const conditionCtx = ctx.check();
        const loopStatements = ctx.statement();

        while (this.visitCheck(conditionCtx)) {
            for (let statement of loopStatements) {
                const result = this.visit(statement);
                if (typeof result === 'string') {
                    this.output.push(result);
                }
            }

        }
    }
    visitIfElse(ctx) {
        // : '@als' check '[' statement* ']' ( '@anders' '[' statement* ']' )?
        const condition = this.visitCheck(ctx.check());
        if (!condition) {
            this.visit(ctx.statement()[0])
        } else {
            this.visit(ctx.statement()[1])
        }
    }


    getGeneratedCode() {
        return this.output.join("\n");
    }
}

export { Compiler };

export function parseText(input) {
    const chars = new antlr4.InputStream(input);
    const lexer = new VeWiGrammarLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new VeWiGrammarParser(tokens);
    const context = parser.stylesheet();
    return context.toStringTree(null, parser);
}

export function compile(input) {
    const chars = new antlr4.InputStream(input);
    const lexer = new VeWiGrammarLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new VeWiGrammarParser(tokens);
    const tree = parser.stylesheet();

    const generator = new Compiler();
    generator.visit(tree);

    return generator.getGeneratedCode();
}