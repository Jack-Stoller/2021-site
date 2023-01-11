/*

    The Cursor Effect


    Description:
        If this effect is loaded, it will replace
        the cursor with a custom cursor. This
        cursor is partically defined in the HTML
        document. The text around the cursor can
        be changed using the data-cursor-type
        attribute on any element. When the cursor
        hovers it, the cursor will change text

    Files:
        effects/cursor.css
        effects/cursor.js

*/


var CursorEffect = {

    //Config

    //The total time it should take to type any text element out in ms
    deafultCursorState: 'scroll',



    //Globals

    cursor: null,

    observer: new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (!!m.addedNodes)
                CursorEffect.domAdded(m.addedNodes);
        });
    }),

    //Events

    //Called as soon as the script is loaded
    //(Page may not be loaded completely yet)
    init: () => {
        //Start observing the DOM as is loads in
        CursorEffect.observer.observe(
            document.documentElement || document.body,
            {
                subtree: true,
                childList: true
            }
        );
    },

    domAdded: (listOfNodes) => {
        listOfNodes.forEach(n => {
            if (!!n && !!n.hasAttribute && !!n.hasAttribute('data-cursor-type'))
                CursorEffect.prepDom(n);
            else if (!!n && !!n.classList && n.classList.contains('cursor'))
                CursorEffect.prepCursor(n);
        });
    },



    //Functions

    /**
     * Sets the cursor element to global and sets default cursor type
     * @param {HTMLElement} cursor
     */
    prepCursor: (cursor) => {



        CursorEffect.cursor = cursor;

        CursorEffect.cursor.className = 'cursor active ' + CursorEffect.deafultCursorState;


        //If the cursor is not shown (touch devices), hide this cursor
        if (!matchMedia('(pointer:fine)').matches)
            CursorEffect.cursor.style.display = 'none';

        window.addEventListener('mousemove', (e) => {
            CursorEffect.cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
        });

        document.documentElement.addEventListener('mouseleave', (e) => {
            CursorEffect.cursor.classList.remove('active');
        });

        document.documentElement.addEventListener('mouseenter', (e) => {
            CursorEffect.cursor.classList.add('active');
        });
    },

    /**
     * Assigns mouse enter and leave events to change the cursor image
     * @param {HTMLElement} parent
     */
    prepDom: (parent) => {
        let cursorType = parent.getAttribute('data-cursor-type');

        parent.addEventListener('mouseenter', () => {
            CursorEffect.cursor.className = 'cursor active ' + cursorType;
        });

        parent.addEventListener('mouseleave', () => {
            CursorEffect.cursor.className = 'cursor active ' + CursorEffect.deafultCursorState;
        });
    }
};


CursorEffect.init();