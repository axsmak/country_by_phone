import {
  getLocalInfo,
} from './../index.js';
import phones from './phones.js';

export const list = Object.keys(phones).sort((a, b) => b.length - a.length);

for (let code of list) {
  if (phones.hasOwnProperty(code)) {
    let phone = code;
    for (let i = phone.length; i < 5; i++) {
      phone += '3';
    }
    const countries = getCountries(phone);
    const info = getLocalInfo(`+${phone}`);
    if (info.valid) {
      if (countries.indexOf(info.country_info.iso2) < 0) {
        if (info.country_info.iso2 === 'US') {
          console.info(`INFO TEST: USA area code +${code} expected in`, countries);
        } else {
          console.error(`WARN TEST: Wrong country ${info.country_info.iso2} for code +${code} expected in`, countries);
        }
      }
    } else {
      console.error(`FAIL TEST: Invalid code +${code} expected`, countries, info);
    }
  }
}

function getCountries(phone) {
  let starts = String(phone);
  let codeLength = 0;

  for (let code of list) {
    if (code.length !== codeLength) {
      codeLength = code.length;
      starts = starts.substring(0, codeLength);
    }

    if (code === starts) {
      return phones[code];
    }
  }
  return null;
}
