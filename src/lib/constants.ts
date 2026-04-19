export const EUROPEAN_COUNTRIES = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
]

export const LANGUAGES = [
  { code: 'nl', name: 'Dutch' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'ro', name: 'Romanian' },
]

export const TIMEZONES = [
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Brussels',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Helsinki',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Luxembourg',
  'Europe/Madrid',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Prague',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Europe/Zurich',
  'UTC',
]

export const CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
]

export const LIFECYCLE_STAGES = [
  { value: 'lead', label: 'Lead', color: 'blue' },
  { value: 'prospect', label: 'Prospect', color: 'purple' },
  { value: 'customer', label: 'Customer', color: 'green' },
  { value: 'evangelist', label: 'Evangelist', color: 'amber' },
  { value: 'churned', label: 'Churned', color: 'red' },
] as const

export const CONSENT_STATUSES = [
  { value: 'opted_in', label: 'Opted In', color: 'green' },
  { value: 'opted_out', label: 'Opted Out', color: 'red' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'unsubscribed', label: 'Unsubscribed', color: 'gray' },
] as const

export const LEGAL_BASES = [
  { value: 'consent', label: 'Consent (Art. 6.1.a GDPR)' },
  { value: 'legitimate_interest', label: 'Legitimate Interest (Art. 6.1.f GDPR)' },
  { value: 'contract', label: 'Contract (Art. 6.1.b GDPR)' },
  { value: 'legal_obligation', label: 'Legal Obligation (Art. 6.1.c GDPR)' },
] as const

export const PROJECT_TYPES = [
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'viewer', label: 'Viewer' },
] as const

export const INDUSTRIES = [
  'Advertising & Marketing',
  'Agriculture',
  'Automotive',
  'Construction',
  'Consumer Goods',
  'Education',
  'Energy & Utilities',
  'Financial Services',
  'Food & Beverage',
  'Healthcare',
  'Hospitality & Travel',
  'Insurance',
  'Legal Services',
  'Logistics & Transport',
  'Manufacturing',
  'Media & Entertainment',
  'Non-profit',
  'Professional Services',
  'Real Estate',
  'Retail & E-commerce',
  'SaaS & Technology',
  'Telecommunications',
  'Other',
]

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+',
]

export const CONTACT_SOURCES = [
  'organic_search',
  'paid_search',
  'social_media',
  'referral',
  'direct',
  'email_campaign',
  'event',
  'partner',
  'form',
  'csv_import',
  'api',
  'manual',
]
