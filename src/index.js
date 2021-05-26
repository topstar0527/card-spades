import * as App from 'app.jsx'
import * as lib from 'lib.js';

// This is _roughly_ just mimicking a UMD style webpack module
// TODO: Make this a UMD style bundle if create-react-app supports it.

window.Spades = App;
window.lib = lib;

