// import BasicJavaLexer from "./generated/BasicJavaLexer.js";
// import BasicJavaParser from "./generated/BasicJavaParser.js";
// import {CharStream, CommonTokenStream} from "antlr4";
//
// function parseText(input) {
//     const chars = new CharStream(input)
//     const lexer = new BasicJavaLexer(chars)
//     const tokens = new CommonTokenStream(lexer)
//     const parser = new BasicJavaParser(tokens)
//     const context = parser.classDeclaration()
//     console.log(context.toStringTree(null, parser))
// }
//
// parseText(`
// public class Hello {
// }
// `)
