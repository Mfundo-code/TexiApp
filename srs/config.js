// src/config.js
const BASE_URL = __DEV__ 
  ? 'http://192.168.0.137:8000' 
  : 'https://www.findtexi.com';

export const API_URL = `${BASE_URL}/api`;
export const GOOGLE_PLACES_API_KEY = 'AIzaSyC6a16EquAV6hWaRw4ZAmK222WLmpfncU4';