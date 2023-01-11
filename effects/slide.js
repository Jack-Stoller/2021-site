/*

    The Slide Effect


    Description:
        This effect is used for animated any text.
        It slides out veritcally with a delay for
        each letter.

    Files:
        effects/slide.css
        effects/slide.js

    Classes:
        .slidable
            .slid
            .no-ani

*/

var SlideEffect = {

    //Config

    //This is the time that the text will take to animation out in ms
    transitionTime: 500,



    //Globals
    elements: [],

    observer: new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (!!m.addedNodes)
                SlideEffect.domAdded(m.addedNodes);
        });
    }),

    //Events

    //Called as soon as the script is loaded
    //(Page may not be loaded completely yet)
    init: () => {

        //Start observing the DOM as is loads in
        SlideEffect.observer.observe(
            document.documentElement || document.body,
            {
                subtree: true,
                childList: true,
                attributes: false
            }
        );
    },

    domAdded: (listOfNodes) => {
        listOfNodes.forEach(n => {
            if (!!n && !!n.classList && n.classList.contains('slidable'))
                SlideEffect.convertToSlidable(n);
        });
    },



    //Functions

    /**
     * Converts the given element to an explodable element. Returns a callback to explode and implode infinity
     * @param {HTMLElement} parent
     */
    convertToSlidable: (parent) => {
        //This is the time difference between each letter
        let timeForEachLetter = SlideEffect.transitionTime / parent.textContent.length;

        //This is used to keep trace of transition timings
        let globalLetterIndex = 0;

        for (let i = 0; i < parent.childNodes.length; i++) {
            splitDom(parent.childNodes[i]);
        }

        function splitDom(dom) {

            if (dom.nodeType == Node.TEXT_NODE) {
                let text = dom.textContent.trim() + ' ';

                let textWrapper = document.createElement('span');

                for (let i = 0; i < text.length; i++) {
                    //Create the single letter version
                    let warpperEl = document.createElement('span');
                    let spanEl = document.createElement('span');

                    warpperEl.classList.add('slide-wrapper');

                    spanEl.textContent = text[i];

                    spanEl.style.transitionDelay = timeForEachLetter * globalLetterIndex + 'ms';

                    globalLetterIndex++;

                    warpperEl.appendChild(spanEl)

                    //Add the letter to the parent
                    textWrapper.appendChild(warpperEl);
                }


                //Replace the text node with an element span node
                dom.parentNode.insertBefore(textWrapper, dom);
                dom.parentNode.removeChild(dom);

                return;
            }


            //If the node is not a text node
            for (let i = 0; i < dom.childNodes.length; i++) {
                splitDom(dom.childNodes[i]);
            }
        }
    }
};


SlideEffect.init();