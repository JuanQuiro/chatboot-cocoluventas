describe('PhoneValidator', () => {
  test('normaliza a E.164 VE', async () => {
    const mod = await import('../src/utils/phone-validator.js');
    const { PhoneValidator } = mod;
    const res = PhoneValidator.validate('04241234567', '58');
    expect(res.valid).toBe(true);
    expect(res.e164).toBe('+584241234567');
    expect(res.country).toBe('VE');
  });

  test('detecta invalido', async () => {
    const mod = await import('../src/utils/phone-validator.js');
    const { PhoneValidator } = mod;
    const res = PhoneValidator.validate('abc');
    expect(res.valid).toBe(false);
  });
});
