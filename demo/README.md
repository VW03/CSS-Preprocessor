### Dit is het demo project
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