import canada from './lib/canada.js';
import countries from './lib/countries.js';
import us from './lib/us.js';

// Add location
function addLocation(localInfo) {

  let text = localInfo.text;
  let location = false;

  switch (localInfo.type) {
    case 'area':
      location = getLoc(localInfo);
      while (!location && text.length > 3) {
        text = text.substring(0, text.length - 1);
        localInfo.text = text;
        location = getLoc(localInfo);
      }
      if (location) {
        chooseUsCanada(localInfo);
      }
      break;

    case 'country':
      localInfo.country_info = getCountryInfo(localInfo);
      location = localInfo.country_info.name;
      while (!location && text.length > 2) {
        text = text.substring(0, text.length - 1);
        localInfo.text = text;
        localInfo.country_info = getCountryInfo(localInfo);
        location = localInfo.country_info.name;
      }
      break;
  }

  if (!location) {
    localInfo.valid = false;
  }

  localInfo.location = location;
}

//Detect if Area Code or Country Code
function addType(localInfo) {
  const text = localInfo.text;
  const beg = text.substring(0, 1);
  const beg2 = text.substring(0, 2);
  let type = '';
  if (beg === '+' || beg2 === '00') {
    localInfo.text = text.substring(0, 5);
    type = 'country';
  } else {
    if (text.length < 3) {
      localInfo.valid = false;
    }
    localInfo.text = text.substring(0, 3);
    type = 'area';
  }
  localInfo.type = type;
}

//Check for US to process as area
function checkUS(localInfo) {
  let text = localInfo.text;
  const beginning = text.substring(0, 2);

  if (text !== '+1') {
    if (beginning === '+1') {
      text = text.replace('+1', '');
    }
    if (text.substring(0, 1) == '1') {
      text = text.substring(1, text.length);
    }
    if (text.length < 3) {
      localInfo.valid = false;
    }
  }

  localInfo.text = text;
}

//For US/Canada Area codes, add correct Country
function chooseUsCanada(localInfo) {

  const isCanada = canada.indexOf(localInfo.text) >= 0;
  const usIndex = getCountryInfo({
    text: '+1',
  })['index'];
  localInfo.country_info = countries[usIndex + (isCanada ? 2 : 1)];
}

//Allow only numerical and '+' characters
function cleanText(x) {
  let text = x.replace(/[^+0-9]/g, '');
  if (text.length > 5) {
    text = text.substring(0, 5);
  }
  return text;
}

// Get country info
function getCountryInfo(localInfo) {
  const code = localInfo.text.slice(1);
  const countryIndex = countries.findIndex((country) => country.code === code);

  if (countryIndex >= 0) {
    const countryInfo = countries[countryIndex];

    Object.defineProperty(countryInfo, 'index', {
      enumerable: true,
      value: countryIndex,
    });

    return countryInfo;
  }

  return {
    index: null,
  };
}

//Linear Search US Time Zones
function getLoc(localInfo) {
  const text = localInfo.text;
  let location = null;

  for (let usArea of us) {
    for (let x = 0; x < usArea.codes.length; x++) {
      if (text === usArea.codes[x]) {
        location = usArea.codes[x + 1];
        break;
      }
    }
  }

  if (location) {
    return location;
  }

  const tollFree = us[us.length - 1];
  for (let code of tollFree.codes) {
    if (code === text) {
      location = 'Toll Free or Other';
      break;
    }
  }

  return location;
}

export function getIso2(phone) {
  const localInfo = getLocalInfo(phone);
  return localInfo.valid ? localInfo.country_info.iso2 : null;
}

export function getLocation(phone) {
  const localInfo = getLocalInfo(phone);
  return localInfo.valid ? localInfo.location : null;
}

//Build Local Info object
export function getLocalInfo(phone, callback) {
  if (!phone) {
    return;
  }
  let text = standardizeCountry(cleanText(String(phone)));
  const localInfo = {
    text,
    valid: true,
    country_info: {
      index: null,
      iso2: null,
    },
    location: null,
  };
  //Check for US
  checkUS(localInfo);
  //Add Type (Area or Country)
  addType(localInfo);
  //Add Location and Country Info
  addLocation(localInfo);

  if (typeof callback === 'function') {
    callback(localInfo);
    return;
  }
  return localInfo;
}

// Correct 00 and replace for +
function standardizeCountry(x) {
  if (x.substring(0, 2) === '00') {
    x = x.replace('00', '+');
  }
  return x[0] === '+' ? x : `+${x}`;
}

export default {
  getIso2,
  getLocalInfo,
  getLocation,
};
