//The time to lock page transtioning times
const TRANSITION_LOCK_TIME = 1500;

window.scrollTo(0,1);

window.onload = () => {
    registerNoiseMaps();
    registerPages();

    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) changePage(true);
        if (e.deltaY < 0) changePage(false);
    });
}


function registerNoiseMaps() {
    let introNoiseCanvas = document.getElementById('noiseBG');
    let introNoise = new NoiseMap({
        canvas: introNoiseCanvas,
        color: {
            r: 15,
            g: 15,
            b: 15,
            a: 255,
        },
        variance: 10,
        numberOfPregeneratedNoiseMaps: 1,
        width: () => window.innerWidth,
        height: () => window.innerHeight
    });
};


var locked = false;
var pages = [];
var currentPageIndex = 0;
var navEl;

function changePage(forward) {

    //Stop if its locked (still animated the previous page)
    if (locked)
        return;

    //Stop if the user is typeing
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))
        return;

    //Close any popup that is open
    hideMessage();

    //Close the nav menu
    hideNav();

    locked = true;

    let preIndex = currentPageIndex;

    if (forward) {
        currentPageIndex = (currentPageIndex + 1 < pages.length) ? currentPageIndex + 1 : 0;
    } else {
        //You can't go backwards from the start
        currentPageIndex = (currentPageIndex != 0) ? currentPageIndex - 1 : 0;
    }

    //Make sure it changed before it is animated
    if (preIndex != currentPageIndex) {
        pages[preIndex].hide();

        window.setTimeout(() => {
            pages[currentPageIndex].show();
        }, 750);
    }

    window.setTimeout(() => {
        locked = false
    }, TRANSITION_LOCK_TIME);
}

function gotoPage(index) {

    //Stop if its not a page or the current one
    if (index < 0 || index > pages.length || index == currentPageIndex)
        return;

    //Stop if its locked (still animated the previous page)
    if (locked)
        return;

    //Stop if the user is typeing
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))
        return;

    //Close any popup that is open
    hideMessage();

    //Close the nav menu
    hideNav();

    locked = true;

    let preIndex = currentPageIndex;

    currentPageIndex = index;

    //Make sure it changed before it is animated
    if (preIndex != currentPageIndex) {
        pages[preIndex].hide();

        window.setTimeout(() => {
            pages[currentPageIndex].show();
        }, 750);
    }

    window.setTimeout(() => {
        locked = false
    }, TRANSITION_LOCK_TIME);
}


function registerPages() {
    //This is NOT designed to be scalable
    //it works for what it does well, but
    //using a framework would be a much
    //better option. Since I'm not and I
    //need a smallish project, this is what
    //I ended up with.

    //Generic
    let genericShow = (page, shouldAni = true) => {
        page.classList.add('active');

        handleAniClasses(page, shouldAni);

        removeClassFromClass(page, 'break', 'broken');
        removeClassFromClass(page, 'slidable', 'slid');
        addClassToClass(page, 'circuit', 'active');
        addClassToClass(page, 'timeline', 'active');
        addClassToClass(page, 'fade', 'active');
    };

    let genericHide = (page, shouldAni = true) => {
        page.classList.remove('active');

        handleAniClasses(page, shouldAni);

        addClassToClass(page, 'break', 'broken');
        addClassToClass(page, 'slidable', 'slid');
        removeClassFromClass(page, 'circuit', 'active');
        removeClassFromClass(page, 'timeline', 'active');
        removeClassFromClass(page, 'fade', 'active');

    };

    let handleAniClasses = (page, shouldAni) => {
        if (shouldAni) {
            removeClassFromClass(page, 'break', 'no-ani');
            removeClassFromClass(page, 'slidable', 'no-ani');
            removeClassFromClass(page, 'circuit', 'no-ani');
            removeClassFromClass(page, 'timeline', 'no-ani');
            removeClassFromClass(page, 'fade', 'no-ani');
        } else {
            addClassToClass(page, 'break', 'no-ani');
            addClassToClass(page, 'slidable', 'no-ani');
            addClassToClass(page, 'circuit', 'no-ani');
            addClassToClass(page, 'timeline', 'no-ani');
            addClassToClass(page, 'fade', 'no-ani');
        }
    }

    navEl = document.getElementById('nav');

    pages = [
        new Page(document.getElementById('page1'), document.getElementById('page1Nav'), genericShow, genericHide),
        new Page(document.getElementById('page2'), document.getElementById('page2Nav'), genericShow, genericHide),
        new Page(document.getElementById('page3'), document.getElementById('page3Nav'), genericShow, genericHide),
        new Page(document.getElementById('page4'), document.getElementById('page4Nav'), genericShow, genericHide),
        new Page(document.getElementById('page5'), document.getElementById('page5Nav'), genericShow, genericHide)
    ];

    pages[0].show(false);

    for (let i = 1; i < pages.length; i++) {
        pages[i].hide(false);
    }
}

function addClassToClass(parent, classToSearch, classToAdd) {
    let els = parent.getElementsByClassName(classToSearch);

    for (let i = 0; i < els.length; i++) {
        els[i].classList.add(classToAdd);
    }
}

function removeClassFromClass(parent, classToSearch, classToRemove) {
    let els = parent.getElementsByClassName(classToSearch);

    //Loop backwards because this is a live list
    for (let i = els.length - 1; i >= 0; i--) {
        els[i].classList.remove(classToRemove);
    }
}


class Page {
    constructor(pageDom, navDom, showCallback, hideCallback) {
        this.dom = pageDom;
        this.navDom = navDom;

        this.showCallback = showCallback;
        this.hideCallback = hideCallback;
    }

    show(animate) {
        document.querySelector('nav > .item.active').classList.remove('active');

        this.navDom.classList.add('active');

        this.showCallback(this.dom, animate);
    }

    hide(animate) {
        this.hideCallback(this.dom, animate);
    }
}

function toggleSkillInfo(icon, show) {
    let info = icon.parentNode.children[3].children[0];
    let pbar = icon.parentNode.children[0];

    if (show) {
        pbar.classList.add('hover');
        info.classList.remove('no-ani');
        info.classList.add('typed');
    } else {
        //Adds no-ani so its an instant animation
        pbar.classList.remove('hover');
        info.classList.add('no-ani');
        info.classList.remove('typed');
    }
}

function toggleEventInfo(event, show) {
    let desc = event.children[2].children[0];

    console.log(desc)

    if (show) {
        desc.classList.remove('no-ani');
        desc.classList.add('typed');
    } else {
        //Adds no-ani so its an instant animation
        desc.classList.add('no-ani');
        desc.classList.remove('typed');
    }
}


var messageDom;

function showMessage(textContent) {
    //Get it the first time it needs it
    if (!messageDom)
        messageDom = document.querySelector('.extra-info.message');

    let type = document.createElement('div');

    type.textContent = textContent;

    messageDom.children[0].innerHTML = '';
    messageDom.children[0].appendChild(type);

    messageDom.classList.add('active');
}

function hideMessage() {
    if (messageDom)
        messageDom.classList.remove('active');
}

function toggleNav() {
    navEl.classList.toggle('active');
}

function showNav() {
    navEl.classList.add('active');
}

function hideNav() {
    navEl.classList.remove('active');
}


// Swipe Features

//Code adapted from givanse
//https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android#answer-23230280

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];

    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    var tolerence = 15;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 5 ) {
            /* left swipe */
            changePage(true);
        } else if ( xDiff < -1 * 5 ) {
            /* right swipe */
            changePage(false);
        }
    } else {
        if ( yDiff > 5 ) {
            /* up swipe */
            changePage(true);
        } else if ( yDiff < -1 * 5 ) {
            /* down swipe */
            changePage(false);
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};