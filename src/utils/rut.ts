export const formatRUT = (value: string): string => {
  let rut = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length <= 1) return rut;
  const dv = rut.slice(-1);
  let body = rut.slice(0, -1);
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${dv}`;
};

export const validateRUT = (value: string): boolean => {
  const rut = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length < 2) return false;
  
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  const computedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
  
  return dv === computedDv;
};
