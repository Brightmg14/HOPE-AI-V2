import type { Language } from './types'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    tagline: 'Healthcare information made accessible to everyone.',
    beneficiary: 'Continue as Beneficiary',
    staff: 'Continue as Staff',
    welcome: 'Welcome',
    disclaimer: 'Demonstration only. Fictional clinic and beneficiary data. Not medical advice.',
  },
  af: {
    tagline: 'Gesondheidsorg-inligting toeganklik vir almal.',
    beneficiary: 'Gaan voort as Begunstigde',
    staff: 'Gaan voort as Personeel',
    welcome: 'Welkom',
    disclaimer: 'Slegs demonstrasie. Fiktiewe kliniek- en begunstigde-data. Nie mediese advies nie.',
  },
  xh: {
    tagline: 'Ulwazi lwezempilo lufikeleleka kuye wonke umntu.',
    beneficiary: 'Qhubeka njengoMxhamli',
    staff: 'Qhubeka njengeNkonzo',
    welcome: 'Wamkelekile',
    disclaimer: 'Lo mboniso kuphela. Idatha yeqonga kunye nabaxhamli iyintsomi. Asiyiyo ingcebiso yezonyango.',
  },
}

export function t(language: Language, key: string): string {
  return translations[language][key] ?? translations.en[key] ?? key
}
