

/*-------------- Constants -------------*/


/*---------- Variables (state) ---------*/


/*----- Cached Element References  -----*/


/*-------------- Functions -------------*/


/*----------- Event Listeners ----------*/

const audioOn = document.getElementById('sound-on');
const audioOff = document.getElementById('sound-off');
let audioMuted = false;

[audioOn, audioOff].forEach(b => b.addEventListener('click', (e) => {
    if (audioMuted) {
        audioOn.style.filter = 'invert(100%)';
        audioOff.style.filter = 'invert(30%)';
        console.log('sound on');
        audioMuted = false;
    } else {
        audioOff.style.filter = 'invert(100%)';
        audioOn.style.filter = 'invert(30%)';
        console.log('sound off');
        audioMuted = true;
    };
    
    
}));
