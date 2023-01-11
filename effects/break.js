/*

    The Break Effect


    Description:
        This effect is used for animating most text.
        It beaks the text into peices and then uses
        CSS to explode it. The breaks are generated
        randomly each page load. clip-path is used
        to make the parts. This can be used on
        images as well.

    Files:
        effects/break.css
        effects/break.js

    Classes:
        .break
            .broken
            .no-ani

*/

var BreakEffect = {

    //Config

    //The max time that the element can take to break in perfect conditions in ms
    maxBreakWait: 2000,
    //Increase to add more breaks, decrease to have less broken pieces
    breakage: 3,
    //The amount of uniqueness for each piece. The more pieces, the lower this number should be
    //If this number is too high, triangles may become "negative"
    uniqueness: 15,
    //Should the mouse position be used for calcuating delay
    useMousePosForTransitions: false,
    //If the mouse position is not used, this is the delay range for each element in ms
    delayRange: 350,
    //The amount the delay can vary
    delayRangeVaration: 50,

    explosionConfig: {
        //The max distance a piece could fly in px
        maxSize: 400,
        //The min distance a piece could fly in px
        minSize: 50,
        //The furthest a piece can rotate
        maxRotation: 300,
        //The shortest a piece can roate
        minRotation: 0,
        //The largest a piece can become in %
        maxScale: 75,
        //The smallest a piece can become in %
        minScale: 10
    },

    //This should reflect the CSS transition time for transform and opacity in ms
    CSSTransitionTime: 500,



    //Globals

    mousePos: {x: 0, y: 0},
    windowSize: {width: window.innerWidth, height: window.innerHeight},

    brokenElements: [],

    observer: new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (!!m.addedNodes)
                BreakEffect.domAdded(m.addedNodes);

            if (m.type === 'attributes' && m.attributeName === 'class')
                BreakEffect.classChange(m.target, m.oldValue);

        });
    }),

    //Events

    //Called as soon as the script is loaded
    //(Page may not be loaded completely yet)
    init: () => {

        //Start observing the DOM as is loads in
        BreakEffect.observer.observe(
            document.documentElement || document.body,
            {
                subtree: true,
                childList: true,
                attributes: true
            }
        );


        //Add event listeners
        window.addEventListener('resize', () => {size = {width: window.innerWidth, height: window.innerHeight}});

        if (BreakEffect.useMousePosForTransitions)
            window.addEventListener('mousemove', (e) => {
                BreakEffect.mousePos.x = e.clientX;
                BreakEffect.mousePos.y = e.clientY;
            });
    },

    domAdded: (listOfNodes) => {
        listOfNodes.forEach(n => {
            if (!!n && !!n.classList && n.classList.contains('break'))
                BreakEffect.breakDom(n);
        });
    },

    classChange: (dom) => {
        for (let i = 0; i < BreakEffect.brokenElements.length; i++) {
            let el = BreakEffect.brokenElements[i];

            if (el.dom == dom) {

                if (
                    (
                        //If boken was added to the classlist and it isn't exploded
                        !el.oldClassList.includes('broken') &&
                        dom.classList.contains('broken') &&
                        !el.controller.isExploded
                    ) || (
                        //If boken was removed from the classlist and it is exploded
                        el.oldClassList.includes('broken') &&
                        !dom.classList.contains('broken') &&
                        el.controller.isExploded
                    )
                ) {
                    //Swap (explode or implode) with animation?
                    el.controller.swap(!dom.classList.contains('no-ani'));

                    el.oldClassList = dom.className.split(' ');
                }


                break;
            }
        }
    },



    //Functions

    /**
     * Applies the break effect to the following element. To trigger the effect,
     * give the element the class "broken"
     * @param {HTMLElement} parent Element to apply the break effect to
     */
    breakDom: (parent) => {
        let breakController = BreakEffect.convertToBreakable(parent);

        BreakEffect.brokenElements.push({
            controller: breakController,
            oldClassList: parent.className.split(' '),
            dom: parent
        });
    },


    /**
     * Converts the given element to an explodable element. Returns a callback to explode and implode infinity
     * @param {HTMLElement} parent
     * @returns A callback that when called will toggle the explosion effect
     */
    convertToBreakable: (parent) => {
        let text = parent.textContent.trim();
        let textArr = text.split('');

        //Clear the parent after the text has been saved
        parent.textContent = '';


        //Save each letter and all it's pieces for later use
        let letters = [];


        for (let i = 0; i < textArr.length; i++) {
            //This element will contain all the parts of the text
            //along with the full letter version
            let wrapperSpanEl = document.createElement('span');


            //Create the full letter version
            let fullSpanEl = document.createElement('span');

            fullSpanEl.textContent = textArr[i];

            wrapperSpanEl.appendChild(fullSpanEl);

            //Get the break map
            let breakMap = BreakEffect.generateBreakMap(BreakEffect.breakage, BreakEffect.uniqueness);

            //Save all the pieces for later usage
            let pieces = [];


            //Create a element for each of the pieces and apply a
            //clip-path to each
            for (let c = 0; c < breakMap.length; c++) {
                let tri = breakMap[c];

                let spanChildEl = document.createElement('span');
                spanChildEl.textContent = textArr[i];

                //Apply a clip path so just the piece is shown
                let clipPath = `polygon(${tri[0].x}% ${tri[0].y}%, ${tri[1].x}% ${tri[1].y}%, ${tri[2].x}% ${tri[2].y}%, ${tri[0].x}% ${tri[0].y}%)`;

                //Generate the random explosion info for later use
                pieces.push({
                    explode: BreakEffect.getRandomCircularCoords(BreakEffect.explosionConfig.minSize, BreakEffect.explosionConfig.maxSize),
                    rotation: BreakEffect.getRandomInt(BreakEffect.explosionConfig.maxRotation, BreakEffect.explosionConfig.minRotation),
                    scale: BreakEffect.getRandomInt(BreakEffect.explosionConfig.maxScale, BreakEffect.explosionConfig.minScale),
                    dom: spanChildEl
                });

                spanChildEl.style.clipPath = clipPath;


                wrapperSpanEl.appendChild(spanChildEl);
            }

            //Add the letter to the parent
            parent.appendChild(wrapperSpanEl);

            letters.push({
                fullLetter: fullSpanEl,
                pieces: pieces
            });
        }

        //Define the explode hook in the context
        let explode = (ani, ) => {

            maxDelays = [];

            //Loop each letter and then each piece
            for (let l = 0; l < letters.length; l++) {


                //Capture the max and min delay
                let minDelay = 0;
                let maxDelay = 0;

                for (let i = 0; i < letters[l].pieces.length; i++) {

                    let piece = letters[l].pieces[i];

                    let delay = 0;

                    if (BreakEffect.useMousePosForTransitions && ani) {
                        //Get the current position
                        let rect = piece.dom.getBoundingClientRect();

                        //Get the middle
                        let mid = {
                            x: rect.left + rect.width,
                            y: rect.top + rect.height,
                        };

                        //Get the distance to the mouse
                        let dist = BreakEffect.getDistance(mid, BreakEffect.mousePos);
                        delay = (dist / Math.max(BreakEffect.windowSize.width, BreakEffect.windowSize.height)) * BreakEffect.maxBreakWait;

                        piece.dom.style.transitionDelay = `${delay}ms`;
                    } else {
                        delay = BreakEffect.delayRange * (l / letters.length - 1) + BreakEffect.getRandomInt(-BreakEffect.delayRangeVaration, BreakEffect.delayRangeVaration);
                    }

                    if (!minDelay || delay < minDelay) minDelay = delay;
                    if (!maxDelay || delay > maxDelay) maxDelay = delay;

                    //Only if it should be animated
                    if (ani)
                        piece.dom.style.transitionDelay = `${delay}ms`;

                    piece.dom.style.transform = `
                        translate3d(${piece.explode.x}px, ${piece.explode.y}px, 0)
                        rotate(${piece.rotation}deg)
                        scale(${piece.scale}%)
                    `;

                    piece.dom.style.opacity = '0';
                }

                if (ani)
                    //Hide the full letter element at the start
                    letters[l].fullLetter.style.transitionDelay = `${minDelay}ms`;

                letters[l].fullLetter.style.opacity = `0`;

                //Max delays are tracked for imploding
                maxDelays.push(maxDelay);
            }

            return {
                maxDelays: maxDelays
            }
        }


        let implode = (ani, delays) => {
            for (let l = 0; l < letters.length; l++) {
                //Put back all the pieces
                for (let i = 0; i < letters[l].pieces.length; i++) {
                    letters[l].pieces[i].dom.style.transform = ``

                    letters[l].pieces[i].dom.style.opacity = '1';
                }

                if (ani)
                    //Show the full letter right after the last peice has been put back
                    letters[l].fullLetter.style.transitionDelay = `${delays[l] + BreakEffect.CSSTransitionTime}ms`;

                letters[l].fullLetter.style.opacity = `1`;
            }

            return {};
        }


        /**
         * This class is used to control an explosion
         * Call swap to first explode then implode.
         * The cycle continues forever.
         */
        class ExplosionController {
            constructor(explodeFn, implodeFn) {
                this.explode = explodeFn;
                this.implode = implodeFn;

                this.isExploded = false;

                //This is generated in the explosion and then used in the implodtion
                this.maxDelays = [];
            }

            swap(ani) {
                if (!this.isExploded)
                    this.maxDelays = this.explode(ani).maxDelays;
                else
                    this.implode(ani, this.maxDelays);

                this.isExploded = !this.isExploded;
            }
        }

        //Returns an explosion controller
        return new ExplosionController(explode, implode);
    },

    /**
     * Generates a map of triangles that look broken for a square with 100 by 100 units.
     * @param {float} pointDensity The number points to be created. Higher values give more breakss
     * @param {float} deviation The number of how unique each piece should be.
     * @returns {Array<Array<{x: float, y: float}>>} Array of triangles. Each triangle is an array with three point. Each point is an object with x and y values.
     */
    generateBreakMap(pointDensity, deviation) {

        let points = [];
        let triangles = [];

        for (let x = 0; x < pointDensity; x++) {

            let yRepeats = (!(x % 2)) ? pointDensity : pointDensity - 1;

            for (let y = 0; y < yRepeats; y++) {

                //Create the point
                points.push({
                    x: x * (100 / (pointDensity - 1)),
                    y: (!(x % 2)) ? y * (100 / (pointDensity - 1)) : y * (100 / (pointDensity - 1)) + (100 / (pointDensity - 1)) / 2
                });


                // If not in the first column and not the
                // top or bottom point in a large column
                if (x != 0 && ((x % 2) || (y != yRepeats - 1 && y != 0))) {
                    triangles.push([
                        points.length - 1,
                        points.length - 1 - pointDensity,
                        points.length - pointDensity
                    ]);
                }


                // If not in the first column and not the
                // top point
                if (x != 0 && y != 0) {
                    triangles.push([
                        points.length - 1,
                        points.length - 2,
                        points.length - 1 - pointDensity
                    ]);
                }


                // If not in the first column and is the
                // top point in a large column
                if (x != 0 && (!(x % 2) && y == 0)) {
                    triangles.push([
                        points.length - 1,
                        points.length - pointDensity,
                        points.length - pointDensity - pointDensity
                    ]);
                }

                // If not in the first column and is the
                // top point in a large column
                if (x != 0 && (!(x % 2) && y == yRepeats - 1)) {
                    triangles.push([
                        points.length - 1,
                        points.length - pointDensity - 1,
                        points.length - pointDensity - pointDensity
                    ]);
                }
            }
        }

        //Now move the nodes slightly

        for (let i = 0; i < points.length; i++) {

            //If not in the first or last column
            if ((i + 1) / pointDensity > 1 &&
                (i + 1) + pointDensity < pointDensity**2 - Math.floor(pointDensity / 2))
                points[i].x += BreakEffect.getRandomInt(-1 * deviation, deviation);

            //If not on the top row
            if (i % (pointDensity * 2 - 1) != 0 &&
                (i - pointDensity + 1) % (pointDensity * 2 - 1) != 0)
                points[i].y += BreakEffect.getRandomInt(-1 * deviation, deviation);

            if (points[i].x > 100) points[i].x = 100;
            if (points[i].y > 100) points[i].y = 100;
            if (points[i].x < 0) points[i].x = 0;
            if (points[i].y < 0) points[i].y = 0;
        }

        //Now evaluate the triangles

        let evaledTris = triangles.map(t => t.map(p => {
            return {
                x: Math.round(points[p].x),
                y: Math.round(points[p].y)
            }
        }));

        return evaledTris;
    },




    //Helper functions


    getRandomInt: (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },


    getRandomCircularCoords: (minRadius, maxRadius) => {
        let angle = BreakEffect.getRandomInt(0, 360) * (Math.PI / 180);
        let distance = BreakEffect.getRandomInt(minRadius, maxRadius);

        return {
            x: Math.round(distance * Math.cos(angle)),
            y: Math.round(distance * Math.sin(angle))
        };
    },

    getDistance: (Vector1, Vector2) => {
        return Math.sqrt((Vector1.x - Vector2.x)**2 + (Vector1.y - Vector2.y));
    }
};


BreakEffect.init();


//  DEBUG Code (because this thing is complex)

// Use this function to test the circular coords

// function test() {

//     const canvas = document.getElementById('mycanvas');

//     const size = 100;

//     canvas.width = size;
//     canvas.height = size;

//     console.log(canvas);

//     const ctx = canvas.getContext('2d');

//     ctx.fillStyle = 'rgba(255, 255, 255, 1)';

//     ctx.rect(50, 50, 1, 1);
//     ctx.fill();


//     for (let i = 0; i < 1000; i++) {
//         let coords = getRandomCircularCoords(40, 40);

//         ctx.rect(50 + coords.x, 50 + coords.y, 1, 1);
//         ctx.fill();
//     }
// }

//This code can be used to demo the generation
// function load() {
//     console.log('Test')

//     const canvas = document.getElementById('mycanvas');

//     const size = 100;

//     canvas.width = size;
//     canvas.height = size;

//     console.log(canvas);

//     const ctx = canvas.getContext('2d');


//     const pointDensity = 5;
//     const deviation = 10;


//     const triangles = generateBreakMap(pointDensity, deviation);


//     render();

//     function render() {
//         ctx.clearRect(0, 0, size, size);

//         ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
//         ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';

//         for (let i = 0; i < triangles.length; i++) {
//             ctx.beginPath();
//             ctx.moveTo(triangles[i][0].x, triangles[i][0].y);
//             ctx.lineTo(triangles[i][1].x, triangles[i][1].y);
//             ctx.lineTo(triangles[i][2].x, triangles[i][2].y);
//             ctx.lineTo(triangles[i][0].x, triangles[i][0].y);
//             ctx.fill();
//         }
//     }

// }
