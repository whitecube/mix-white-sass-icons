const fs = require('fs');
const os = require('os');
const { optimize } = require('svgo');
const fontello = require('fontellizr');
const SVGFixer = require('oslllo-svg-fixer');
const Task = require('laravel-mix/src/tasks/Task');
const FileCollection = require('laravel-mix/src/FileCollection');

class BuildFontelloTask extends Task {

    constructor(data) {
        super(data);
        let copy = this.data;
        this.files = new FileCollection(copy.source);
    }

    getOptimizedPath() {
        return this.data.source + '/_optimized';
    }

    run() {
        if (!this.data.source || !this.data.destination || this.isLooping()) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.makeDirectories(this.data.destination);

            this.lastBuild = Date.now();

            SVGFixer(this.data.source, this.getOptimizedPath(), {
                throwIfDestinationDoesNotExist: false
            }).fix().then(() => {
                this.optimizeSvgs();
                this.buildFontello();
            });
        });
    }

    optimizeSvgs() {
        const files = fs.readdirSync(this.getOptimizedPath());
        const path = this.getOptimizedPath();

        files.forEach(filename => {
            const filepath = path + '/' + filename;
            const contents = fs.readFileSync(filepath);
            const optimized = optimize(contents.toString(), {
                path: filepath,
            });
            fs.writeFileSync(filepath, optimized.data);
        });
    }

    buildFontello() {
        fontello({
            svgsSourceDir: this.getOptimizedPath(),
            fontsDestDir: this.data.destination,
            stylesDestDir: './tmp-fontello-css',
            fontelloConfig: {
                name: 'iconfont'
            }
        })
        .then(() => {
            this.writeConfig(this.data.config);
            fs.rmdirSync('./tmp-fontello-css', {recursive: true});
            this.resolve();
        });
    }

    isLooping() {
        if (!this.lastBuild) return false;

        let elapsed =  Date.now() - this.lastBuild;

        return elapsed < 10000;
    }

    makeDirectories(destination) {
        if (!fs.existsSync('./tmp-fontello-css')) {
            fs.mkdirSync('./tmp-fontello-css');
        }

        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
        }
    }

    writeConfig(configPath) {
        let fontelloCss = fs.readFileSync('./tmp-fontello-css/iconfont-codes.css', 'utf8');
        let config = '$ws_icon-list:' + os.EOL;

        let regex = /.icon-(.*):before { content: '(\\e...)'; }/g;
        let match;

        while ((match = regex.exec(fontelloCss)) != null) {
            config += '"' + match[1] + '" "' + match[2] + '",' + os.EOL;
        }

        config = config.slice(0, -2);
        config += ';'

        fs.writeFileSync(configPath, config);
    }

    onChange() {
        this.run();
    }
}

module.exports = BuildFontelloTask;
