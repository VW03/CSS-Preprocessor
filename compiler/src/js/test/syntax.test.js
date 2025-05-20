import { test, expect } from 'vitest';
import {compile} from "../compiler.js";

//Syntax testen die aantonen dat syntax-fouten op een gepaste manier gerapporteerd worden.
//-------------------------------------------------------------------//
test('Syntax unit test', async () => {
    const input = `
      @voor €i van 1 tot 3 [
      .color_€i [
        width -- €i * 20 sss.
      ]
    ]
    `
    let error;
    try {
        compile(input);
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Syntax error: enkel pixels en procent zijn geldige units!");
});
//-------------------------------------------------------------------//
test('Syntax euro test', async () => {
    const input = `
      $main-color :: #123abc.
    `
    let error;
    try {
        compile(input);
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Syntax error: VAR starten met een €!");
});
test('Syntax euro test 2', async () => {
    const input = `
      main-color :: #123abc.
    `
    let error;
    try {
        compile(input);
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Syntax error: VAR starten met een €!");
});
//-------------------------------------------------------------------//
test('Syntax operator test', async () => {
    const input = `
     €main-color :: #123abc.
    @als €main-color === #123abc [
      .button [
        background -- #ffffff.
        color -- #ff0000.
      ]
    ]
    `
    let error;
    try {
        console.log(compile(input));
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Syntax error: om iets te vergelijken kan je enkel kleiner,groter,gelijk of niet gebruiken!");
});
test('Syntax operator test 2', async () => {
    const input = `
     €main-color :: #123abc.
    @als €main-color #123abc [
      .button [
        background -- #ffffff.
        color -- #ff0000.
      ]
    ]
    `
    let error;
    try {
        console.log(compile(input));
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Syntax error: om iets te vergelijken kan je enkel kleiner,groter,gelijk of niet gebruiken!");
});