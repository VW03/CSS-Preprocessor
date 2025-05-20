import {compile} from "../compiler/src/js/compiler.js";

export default function loader(source) {
    const css = compile(source);
    return css;
};