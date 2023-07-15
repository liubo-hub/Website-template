//Game
function wave() {
	document.body.style.setProperty('--eqz', this.value);
	if(this.value < 50) {
		document.body.style.setProperty('--deg', this.value);
	} else {
		document.body.style.setProperty('--deg', this.value * -1  - 100 );
	}
}

['click','input'].forEach( evt =>
    document.querySelector('#eqz').addEventListener(evt, wave, false)
);
