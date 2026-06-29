# BMI Studio

Calcolatore BMI con interfaccia web moderna, eseguibile anche come app desktop tramite Electron.

## Requisiti

- Node.js 20+
- npm

## Installazione dipendenze
```bash
npm i
```

## Avvio in modalita web

```bash
npm run dev
```

## Avvio in modalita desktop (sviluppo)

```bash
npm run electron-dev
```

## Build web (non funziona)

```bash
npm run build-web
```

## Build installer Windows (.exe)

```bash
npm run build-win
```

L'installer viene generato nella cartella `release/`.

## Come condividerlo

Per mandarlo a qualcuno, invia il file `release/BMI Studio Setup 1.0.0.exe`.

Usa lo zip solo se ti serve una versione portabile senza installazione; in quel caso devi comprimere la cartella `release/win-unpacked/` e non il solo installer.
