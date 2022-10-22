## Get country info by phone number

### Usage

```javascript
import cbp from 'country_by_phone'; // All
import {
  getLocation,
} from 'country_by_phone';          // Separate

console.log(cbp.getIso2('+7705311'));
// KZ

console.log(getLocation('+7705311'));
// Kazakhstan
```

### Remarks

- Full length of the phone number is not required. Five digits are enough
- Possible phone formats (equivalent):
  * _xxxxx_
  * **+**_xxxxx_
  * **00**_xxxxx_
- `require` not supported yet
