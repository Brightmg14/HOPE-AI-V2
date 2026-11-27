import type { Language } from './types'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    tagline: 'Healthcare information made accessible to everyone.',
    beneficiary: 'Continue as Beneficiary',
    staff: 'Continue as Staff',
    demoLogin: 'Demo login',
    beneficiaryLoginTitle: 'Beneficiary login',
    staffLoginTitle: 'Staff login',
    email: 'Email address',
    password: 'Password',
    login: 'Log in',
    close: 'Close login',
    demoLoginNote: 'Demo only: any email and password will continue. Credentials are not checked or saved.',
    welcome: 'Welcome',
    disclaimer: 'Demonstration only. Fictional clinic and beneficiary data. Not medical advice.',
  },
  af: {
    tagline: 'Gesondheidsorg-inligting toeganklik vir almal.',
    beneficiary: 'Gaan voort as Begunstigde',
    staff: 'Gaan voort as Personeel',
    demoLogin: 'Demonstrasie-aanmelding',
    beneficiaryLoginTitle: 'Begunstigde-aanmelding',
    staffLoginTitle: 'Personeel-aanmelding',
    email: 'E-posadres',
    password: 'Wagwoord',
    login: 'Meld aan',
    close: 'Sluit aanmelding',
    demoLoginNote: 'Slegs demonstrasie: enige e-posadres en wagwoord sal voortgaan. Besonderhede word nie nagegaan of gestoor nie.',
    welcome: 'Welkom',
    disclaimer: 'Slegs demonstrasie. Fiktiewe kliniek- en begunstigde-data. Nie mediese advies nie.',
  },
  xh: {
    tagline: 'Ulwazi lwezempilo lufikeleleka kuye wonke umntu.',
    beneficiary: 'Qhubeka njengoMxhamli',
    staff: 'Qhubeka njengeNkonzo',
    demoLogin: 'Ukungena kovavanyo',
    beneficiaryLoginTitle: 'Ukungena komxhamli',
    staffLoginTitle: 'Ukungena kwabasebenzi',
    email: 'Idilesi ye-imeyile',
    password: 'Igama lokugqithisa',
    login: 'Ngena',
    close: 'Vala ukungena',
    demoLoginNote: 'Umboniso kuphela: ungasebenzisa nayiphi na i-imeyile negama lokugqithisa. Iinkcukacha azijongwa okanye zigcinwe.',
    welcome: 'Wamkelekile',
    disclaimer: 'Lo mboniso kuphela. Idatha yeqonga kunye nabaxhamli iyintsomi. Asiyiyo ingcebiso yezonyango.',
  },
}

export function t(language: Language, key: string): string {
  return translations[language][key] ?? translations.en[key] ?? key
}
