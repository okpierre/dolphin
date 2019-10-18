declare const _LANGS_: string[];
declare const _VERSION_: string;
declare const _CODENAME_: string;
declare const _ENV_: string;

const address = new URL(location.href);

export const host = address.host;
export const hostname = address.hostname;
export const url = address.origin;
export const apiUrl = url + '/api';
export const wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://') + '/streaming';
export const lang = localStorage.getItem('lang');
export const langs = _LANGS_;
export const locale = JSON.parse(localStorage.getItem('locale'));
export const version = _VERSION_;
export const codename = _CODENAME_;
export const env = _ENV_;