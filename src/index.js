const mix = require('laravel-mix');
const BuildFontelloTask = require('./BuildFontelloTask');

class LaravelMixFontello {
    name() {
        return ['white-sass-icons'];
    }

    dependencies() {
        return ['fontellizr', 'svgo', 'oslllo-svg-fixer'];
    }

    register(source, destination, config = 'resources/sass/config/_icons.scss') {
        Mix.addTask(new BuildFontelloTask({source, destination, config}));
    }
}

mix.extend('icons', new LaravelMixFontello);
