'use strict';

import Famous      from 'famous';
const FamousEngine = Famous.core.FamousEngine;
window.Famous      = Famous;

FamousEngine.init();

require('babelify/polyfill');
require('./app/index');