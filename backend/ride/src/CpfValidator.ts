export default class CpfValidator {
  validate(cpf: string) {
    if (!cpf) return false;
    cpf = this.sanitize(cpf);
    if (this.isInvalidLength(cpf)) return false;
    if (this.isAllDigitsTheSame(cpf)) return false;
    const dg1 = this.calculateDigit(cpf, 10);
    const dg2 = this.calculateDigit(cpf, 11);
    let checkDigit = this.extractDigit(cpf);
    const calculatedDigit = `${dg1}${dg2}`;
    return checkDigit == calculatedDigit;
  }

  sanitize(cpf: string) {
    return cpf.replace(/[^\d]+/g, "");
  }

  isInvalidLength(cpf: string) {
    return cpf.length !== 11;
  }

  isAllDigitsTheSame(cpf: string) {
    return cpf.split("").every((c) => c === cpf[0]);
  }

  extractDigit(cpf: string) {
    return cpf.slice(-2);
  }
  calculateDigit(cpf: string, factor: number) {
    let total = 0;
    for (const digit of cpf) {
      if (factor > 1) total += parseInt(digit) * factor--;
    }
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  }
}
