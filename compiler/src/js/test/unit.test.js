import { test, expect } from 'vitest';
import {parseText} from "../compiler.js";

//Unit testen die aantonen dat er een correcte AST  voortkomt uit de taalconstructies:
//-------------------------------------------------------------------//
test('AST variabelen test', async () => {
    const input = `
     €main-color :: #123abc.
     header [
        background -- €main-color.
        width -- 100. ^^ full width
        height -- 50pixels.
      ]
    `
    const out =  parseText(input) // de boom
    expect(out).toBe(
        '(stylesheet (statement (variableDeclaration €main-color :: (value #123abc) .)) (statement (ruleset (selector header) [ (declaration background -- (value €main-color) .) (declaration width -- (value 100) .) (declaration height -- (value 50 pixels) .) ])) <EOF>)');
});
//-------------------------------------------------------------------//
test('AST Kind selector test', async () => {
    const out = parseText(`
    header > nav [
        color -- #123abc.
        width -- 100.
    ]
    `)

    expect(out).toBe(
        '(stylesheet (statement (ruleset (selector header) > (selector nav) [ (declaration color -- (value #123abc) .) (declaration width -- (value 100) .) ])) <EOF>)');
});
//-------------------------------------------------------------------//
test('AST nesting selector test', async () => {
    const out = parseText(`
    ^^ nesting selector:
    div [ p [
        color -- #123abc.
    ]]
    `)
    expect(out).toBe(
        `(stylesheet (statement (ruleset (selector div) [ (statement (ruleset (selector p) [ (declaration color -- (value #123abc) .) ])) ])) <EOF>)`);
});
test('AST parent selector test', async () => {
    const out = parseText(`
    ^^ parent selector:
    div [
        p [
            color -- #123abc.
        ]
        <p [
            background-color -- #456def.
        ]
    ]
    `)

    expect(out).toBe(
        `(stylesheet (statement (ruleset (selector div) [ (statement (ruleset (selector p) [ (declaration color -- (value #123abc) .) ])) (statement (ruleset (selector < p) [ (declaration background-color -- (value #456def) .) ])) ])) <EOF>)`);
});
test('AST id+groep selector test', async () => {
    const out = parseText(`
    ^^ id selector:
    #header [
      background-color -- #123abd.
    ]
    ^^ groep selector:
    h1, h2, h3 [
      color -- #123abc.
    ]
    `)

    expect(out).toBe(
        `(stylesheet (statement (ruleset (selector # header) [ (declaration background-color -- (value #123abd) .) ])) (statement (ruleset (selector h1 , h2 , h3) [ (declaration color -- (value #123abc) .) ])) <EOF>)`);
});
test('AST klasse+element+attribuut selector test', async () => {
    const out = parseText(`
    ^^ klasse selector:
    .button [
      background-color -- #123abd.
    ]
    ^^ element selector:
    p [
      color -- #123abd.
    ]
    ^^ attribuut selector:
    a |href| [
      color -- #123abd.
    ]
    `)

    expect(out).toBe(
        `(stylesheet (statement (ruleset (selector . button) [ (declaration background-color -- (value #123abd) .) ])) (statement (ruleset (selector p) [ (declaration color -- (value #123abd) .) ])) (statement (ruleset (selector a | (attributeSelector href) |) [ (declaration color -- (value #123abd) .) ])) <EOF>)`);
});
//-------------------------------------------------------------------//
test('AST mixins test', async () => {
    const out = parseText(`
    ^^ mixins
    @mixin button(€bg-color: #ffffff, €text-color: #ffffff) [
        background -- €bg-color.
        color -- €text-color.
        padding -- 10.
    ]
    .button @includeer button(#3498db, #123abc).
    `)

    expect(out).toBe(`(stylesheet (statement (mixinDeclaration @mixin button ( (param €bg-color : (value #ffffff)) , (param €text-color : (value #ffffff)) ) [ (declaration background -- (value €bg-color) .) (declaration color -- (value €text-color) .) (declaration padding -- (value 10) .) ])) (statement (ruleset (selector . button) (mixinUsage @includeer button ( (value #3498db) , (value #123abc) ) .))) <EOF>)`);
});
//-------------------------------------------------------------------//
test('AST controle-structuren test', async () => {
    const out = parseText(`
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
        width -- €j * 20.
      ]
      €j :: €j + 1.
    ]
    ^^ if-else:
    €main-color :: #123abc.
    @als €main-color gelijk #123abc [
      .button [
        background -- #ffffff.
        color -- #ff0000.
      ]
    ]
    @anders [
      .button [
        background -- #ff0000.
        color -- #ffffff.
      ]
    ]
    `)

    expect(out).toBe(
        `(stylesheet (statement (forLus @voor €i van 1 tot 3 [ (statement (ruleset (selector .color_€i) [ (declaration width -- (value (value €i) * (value 20 pixels)) .) ])) ])) (statement (variableDeclaration €j :: (value 1) .)) (statement (whileLus @terwijl (check (value €j) kleiner (value 4)) [ (statement (ruleset (selector .box_€j) [ (declaration width -- (value (value €j) * (value 20)) .) ])) (statement (variableDeclaration €j :: (value (value €j) + (value 1)) .)) ])) (statement (variableDeclaration €main-color :: (value #123abc) .)) (statement (ifElse @als (check (value €main-color) gelijk (value #123abc)) [ (statement (ruleset (selector . button) [ (declaration background -- (value #ffffff) .) (declaration color -- (value #ff0000) .) ])) ] @anders [ (statement (ruleset (selector . button) [ (declaration background -- (value #ff0000) .) (declaration color -- (value #ffffff) .) ])) ])) <EOF>)`);
});