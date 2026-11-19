export function validateDraft(d) {
 if (!d || !['front','back'].includes(d.side)) throw Error('side');
 for(const [key,min,max] of [['quantity',1,10000],['print_width_cm',3,40],['scale_percent',10,65],['vertical_percent',28,64]]) {
  if(typeof d[key]!=='number'||!Number.isFinite(d[key])||d[key]<min||d[key]>max||(key==='quantity'&&!Number.isInteger(d[key]))) throw Error(key);
 }
 return true;
}
