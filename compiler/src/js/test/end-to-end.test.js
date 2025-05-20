import { test, expect } from 'vitest';
import {compile} from "../compiler.js";

//End-to-end testen die aantonen dat er correcte .css code voortkomt uit de .vwcss
//-------------------------------------------------------------------//
test('variabelen test', async () => {
    const input = `
     €main-color :: #123abc.
     header [
        background -- €main-color.
        width -- 100. ^^ full width
        height -- 50pixels.
      ]
    `
    const out = compile(input)

    expect(out).toBe(
        'header {\n' +
        '  background: #123abc;\n' +
        '  width: 100;\n' +
        '  height: 50px;\n' +
        '}');
});
//-------------------------------------------------------------------//
test('Kind selector test', async () => {
    const out = compile(`
    header > nav [
        color -- #123abc.
        width -- 100.
    ]
    `)

    expect(out).toBe(
        'header > nav {\n' +
        '  color: #123abc;\n' +
        '  width: 100;\n' +
        '}');
});
//-------------------------------------------------------------------//
test('nesting selector test', async () => {
    const out = compile(`
    ^^ nesting selector:
    div [ p [
        color -- #123abc.
    ]]
    `)
    expect(out).toBe(
        `div p {
  color: #123abc;
}`);
});
test('parent selector test', async () => {
    const out = compile(`
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
        `div p {
  color: #123abc;
}
div:has(> p) {
  background-color: #456def;
}`);
});
test('id+groep selector test', async () => {
    const out = compile(`
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
        `#header {
  background-color: #123abd;
}
h1,h2,h3 {
  color: #123abc;
}`);
});
test('klasse+element+attribuut selector test', async () => {
    const out = compile(`
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
        `.button {
  background-color: #123abd;
}
p {
  color: #123abd;
}
a[href] {
  color: #123abd;
}`);
});
//-------------------------------------------------------------------//
test('mixins test', async () => {
    const out = compile(`
    ^^ mixins
    @mixin button(€bg-color: #ffffff, €text-color: #ffffff) [
        background -- €bg-color.
        color -- €text-color.
        padding -- 10.
    ]
    .button @includeer button(#3498db, #123abc).
    `)

    expect(out).toBe(`.button {
  background: #3498db;
  color: #123abc;
  padding: 10;
}`);
});
//-------------------------------------------------------------------//
test('controle-structuren test', async () => {
    const out = compile(`
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
        width -- €j * 20 pixels.
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
        `.color_1 {
  width: 20px;
}
.color_2 {
  width: 40px;
}
.color_3 {
  width: 60px;
}
.box_1 {
  width: 20px;
}
.box_2 {
  width: 40px;
}
.box_3 {
  width: 60px;
}
.button {
  background: #ffffff;
  color: #ff0000;
}`);
});