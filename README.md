# Laravel Mix white-sass icons

A Laravel Mix extension to automatically create icon fonts with SVGs from a folder.

## Installation

### NPM
```
npm i mix-white-sass-icons
```

### Yarn
```
yarn add mix-white-sass-icons
```

## Usage
In your `webpack.mix.js` file:

```js
require('mix-white-sass-icons');

// First argument is the folder with SVGs, second argument is the folder where the font files should be saved.
mix.icons('resources/icons', 'resources/fonts');
```