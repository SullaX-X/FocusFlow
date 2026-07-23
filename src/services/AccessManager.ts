export const VALID_PROMO_CODES = ['Di_Madi_Барашек', 'Ima_Iman'];

export const AccessManager = {
  isPremium(): boolean {
    return localStorage.getItem('focusmoon_premium') === 'true';
  },

  unlockPremium(): void {
    localStorage.setItem('focusmoon_premium', 'true');
    // We can dispatch an event to notify components
    window.dispatchEvent(new Event('focusmoon_premium_unlocked'));
  },

  validateCode(code: string): boolean {
    if (VALID_PROMO_CODES.includes(code.trim())) {
      this.unlockPremium();
      return true;
    }
    return false;
  }
};
