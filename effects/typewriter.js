/*

    The Typewriter Effect


    Description:
        This effect is used for animated any text.
        It types the text in when the typed class
        is added to any element.

    Files:
        effects/typewriter.js

    Classes:
        .typewriter
            .typed
            .no-ani

*/

var TyperwriterEffect = {

    //Config

    //The total time it should take to type any text element out in ms
    letterTime: 10,



    //Globals

    elements: [],

    observer: new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (!!m.addedNodes)
                TyperwriterEffect.domAdded(m.addedNodes);

            if (m.type === 'attributes' && m.attributeName === 'class')
                TyperwriterEffect.classChange(m.target, m.oldValue);

        });
    }),

    //Events

    //Called as soon as the script is loaded
    //(Page may not be loaded completely yet)
    init: () => {
        //Start observing the DOM as is loads in
        TyperwriterEffect.observer.observe(
            document.documentElement || document.body,
            {
                subtree: true,
                childList: true,
                attributes: true
            }
        );
    },

    domAdded: (listOfNodes) => {
        listOfNodes.forEach(n => {
            if (!!n && !!n.classList && n.classList.contains('typewriter'))
                TyperwriterEffect.prepDom(n);
        });
    },

    classChange: (dom) => {
        for (let i = 0; i < TyperwriterEffect.elements.length; i++) {
            let el = TyperwriterEffect.elements[i];

            if (el.dom == dom) {

                if (
                    (
                        //If typed was added to the classlist and it isn't typed
                        !el.oldClassList.includes('typed') &&
                        dom.classList.contains('typed') &&
                        !el.controller.isTyped
                    ) || (
                        //If typed was removed from the classlist and it is typed
                        el.oldClassList.includes('typed') &&
                        !dom.classList.contains('typed') &&
                        el.controller.isTyped
                    )
                ) {
                    //Swap (type or untype)
                    el.controller.swap(!dom.classList.contains('no-ani'));

                    el.oldClassList = dom.className.split(' ');
                }


                break;
            }
        }
    },



    //Functions

    /**
     * Applies the typewriter effect to the following element. To trigger the effect,
     * give the element the class "typed"
     * @param {HTMLElement} parent Element to apply the typewriter effect to
     */
    prepDom: (parent) => {
        let typerwriterController = TyperwriterEffect.convertToTyperwriter(parent);

        TyperwriterEffect.elements.push({
            controller: typerwriterController,
            oldClassList: parent.className.split(' '),
            dom: parent
        });

        TyperwriterEffect.elements
    },


    /**
     * Converts the given element to a typerwriter element. Returns a callback to animate the typerwriter effect
     * @param {HTMLElement} parent
     * @returns A callback that when called will toggle the typewriter effect
     */
     convertToTyperwriter: (parent) => {
        let text = parent.textContent.trim();

        if (parent.classList.contains('typed'))
            parent.textContent = '';


        //Define the type hook in the context
        let typeText = (animate = true) => {
            if (!animate) {
                parent.textContent = text;
                return;
            }


            //Clear it just incase
            parent.textContent = '';


            let animateInterval;
            let i = 0;

            animateInterval = window.setInterval(() => {

                if (i >= text.length) {
                    window.clearInterval(animateInterval);
                    return;
                }

                parent.textContent = text.substr(0, i + 1);

                i++;

            }, TyperwriterEffect.letterTime);

            return animateInterval;
        }


        //Define the delete hook in the context
        let deleteText = (animate = true) => {
            if (!animate) {
                parent.textContent = '';
                return;
            }

            //Give it content just incase
            parent.textContent = '';


            let animateInterval;
            let i = 0;

            animateInterval = window.setInterval(() => {

                if (i >= text.length) {
                    window.clearInterval(animateInterval);
                    return;
                }

                parent.textContent = text.substr(0, text.length - i - 1);

                i++;

            }, TyperwriterEffect.letterTime);

            return animateInterval;
        }


        /**
         * This class is used to control the typewriter
         */
        class TyperwriterController {
            constructor(typeTextFn, deleteTextFn) {
                this.typeText = typeTextFn;
                this.deleteText = deleteTextFn;

                this.isTyped = false;
                this.lastInterval;
            }

            swap(animate = true) {

                window.clearInterval(this.lastInterval);

                if (!this.isTyped)
                    this.lastInterval = this.typeText(animate);
                else
                    this.lastInterval = this.deleteText(animate);

                this.isTyped = !this.isTyped;
            }
        }

        //Returns an typerwriter controller
        return new TyperwriterController(typeText, deleteText);
    },
};


TyperwriterEffect.init();