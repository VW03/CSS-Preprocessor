#!/usr/bin/env bash

java -jar ~/Downloads/antlr-4.13.2-complete.jar \
    -visitor                \
    -Dlanguage=JavaScript   \
    -o ./out      \
    VeWiGrammar.g4
