/*

    The Noise Effect


    Description:
        This effect is used to generate the Noise
        background for a canvas.

    Files:
        effects/noise.js

*/

class NoiseMap {
    constructor(options = {}) {
        //Enforce required parameters
        ['canvas', 'color', 'variance', 'width', 'height'].forEach(p => { if (!Object.keys(options).includes(p)) console.error(`${p} is required!`); });

        ['r', 'g', 'b', 'a'].forEach(p => { if (!Object.keys(options.color).includes(p)) console.error(`${p} is required! The given color must have r, g, b, a values.`); })

        this.color = options.color;
        this.numberOfPregeneratedNoiseMaps = ('numberOfPregeneratedNoiseMaps' in options) ? options.numberOfPregeneratedNoiseMaps : 10;

        this.widthFunction = options.width;
        this.heightFunction = options.height;

        this.canvas = options.canvas;
        this.ctx = this.canvas.getContext('2d');

        this.variance = options.variance;

        window.addEventListener('resize', () => {
            this.setup();
            this.render();
        });

        this.setup();


        this.render();
    }

    setup() {
        this.canvas.width = this.widthFunction();
        this.canvas.height = this.heightFunction();

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.noiseMaps = [];
        this.noiseMapIndex = 0;

        this.generateNoiseMaps();
    }

    generateNoiseMaps() {
        this.noiseMaps = [];

        for (let i = 0; i < this.numberOfPregeneratedNoiseMaps; i++) {
            this.noiseMaps.push(this.generateSingleNoiseMap());
        }
    }

    generateSingleNoiseMap() {
        let imageData = this.ctx.createImageData(this.width, this.height);
        for (var i = 0; i < this.width * this.height * 4; i += 4){
            let v = Math.floor(Math.random() * this.variance) - (this.variance / 2);

            imageData.data[i + 0] = this.color.r + v;
            imageData.data[i + 1] = this.color.g + v;
            imageData.data[i + 2] = this.color.b + v;
            imageData.data[i + 3] = this.color.a;
        }

        return imageData;
    }

    render() {

        this.noiseMapIndex++;
        if (this.noiseMapIndex >= this.numberOfPregeneratedNoiseMaps) this.noiseMapIndex = 0;

        this.ctx.putImageData(this.noiseMaps[this.noiseMapIndex], 0, 0);

        //If there is only a single noise map generated, there is no need to cycle.
        if (this.numberOfPregeneratedNoiseMaps != 1)
            window.requestAnimationFrame(() => {this.render()});
    }
}