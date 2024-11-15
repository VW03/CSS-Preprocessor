#!/usr/bin/env bash
cd src/g4 | exit 1

java -jar /home/lars/bin/antlr-afasfafda.jar \
    -visitor                \
    -Dlanguage=JavaScript   \
    -o ../js/generated      \
    BasicJava.g4