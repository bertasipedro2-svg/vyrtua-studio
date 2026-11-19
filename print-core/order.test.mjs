import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDraft} from './order.mjs';
const valid={side:'front',quantity:1,print_width_cm:20,scale_percent:28,vertical_percent:42};
test('valid draft',()=>assert.equal(validateDraft(valid),true));
for(const [key,value] of [['side','left'],['quantity',0],['quantity',1.5],['quantity','1'],['print_width_cm',41],['scale_percent',NaN],['vertical_percent',27]]) test(key+': '+String(value),()=>assert.throws(()=>validateDraft({...valid,[key]:value})));
