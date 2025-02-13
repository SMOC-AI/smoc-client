import ISO6391 from 'iso-639-1';
import { resolveAcceptLanguage } from 'resolve-accept-language';
import { z } from 'zod';

// Keep these sorted alphabetically
export const legacyLanguages = [
	'da',
	'en',
	'es',
	'fi',
	'no',
	'nn',
	'nb',
	'sv',
] as const;
export type LegacyLanguage = (typeof legacyLanguages)[number];

// BCP 47 language tags used in the UI
export const langs = [
	// Keep these sorted alphabetically
	'da-DK',
	'en-GB',
	'es-ES',
	'fi-FI',
	'nb-NO',
	'sv-SE',
] as const;
export const langSchema = z.enum(langs);
export type Lang = z.infer<typeof langSchema>;
export const defaultLang = 'en-GB' as Lang;

export const langStringSchema = z.record(langSchema, z.string());
export type LangString = z.infer<typeof langStringSchema>;

/**
 * Returns the preferred language from the Accept-Language header.
 * This is only used for statistics and machine learning.
 *
 * For the language to be used in the UI, use getUiLang instead.
 *
 * @param request
 * @returns
 */
export function getAcceptLanguage(request: Request): string {
	const acceptLanguage = request.headers.get('Accept-Language') || defaultLang;
	return preferredAcceptLanguage(acceptLanguage);
}

export function preferredAcceptLanguage(header: string): string {
	const languageTags = header.split(',');

	const languages = languageTags
		.map((tag) => {
			const [language, qualityStr] = tag.trim().split(';q=');
			const quality = qualityStr ? parseFloat(qualityStr) : 1.0;
			return { language, quality };
		})
		.sort((a, b) => {
			if (b.quality !== a.quality) {
				return b.quality - a.quality;
			}
			return a.language.localeCompare(b.language);
		})
		.map((lang) => lang.language);

	return languages[0] || defaultLang;
}

/**
 * Returns the language to be used in the UI.
 *
 * @param request
 * @param themeLang
 * @returns
 */
export function getUiLang(
	request: Request,
	forcedThemeLanguage: string | undefined | null,
): Lang {
	const queryLanguage = new URL(request.url).searchParams.get('language');
	if (queryLanguage) {
		return toLang(queryLanguage);
	}
	if (forcedThemeLanguage) {
		return toLang(forcedThemeLanguage);
	}
	const acceptLanguage = request.headers.get('Accept-Language');
	if (acceptLanguage) {
		return getAcceptLang(acceptLanguage);
	}
	return defaultLang;
}

/**
 * Returns a Lang based on the Accept-Language header.
 * If no match is found, the default language is returned.
 *
 * @param acceptLanguageHeader
 * @returns
 */
export function getAcceptLang(acceptLanguageHeader: string): Lang {
	const resolvedAcceptLanguage = resolveAcceptLanguage(
		acceptLanguageHeader,
		langs,
		defaultLang,
	);
	return toLang(resolvedAcceptLanguage);
}

/**
 * Converts a language to a Lang.
 *
 * @param language
 * @returns
 */
export function toLang(language: string): Lang {
	if (langs.includes(language as Lang)) {
		return language as Lang;
	}
	const legacyLanguage = language as LegacyLanguage;
	switch (legacyLanguage) {
		case 'en':
			return 'en-GB';
		case 'no':
		case 'nb':
		case 'nn':
			return 'nb-NO';
		case 'da':
			return 'da-DK';
		case 'sv':
			return 'sv-SE';
		case 'fi':
			return 'fi-FI';
		case 'es':
			return 'es-ES';
		default:
			return defaultLang;
	}
}

export type LangRecord<T> = Partial<Record<Lang, T>>;

export function getLangValue<T>(langRecord: LangRecord<T>, lang: Lang): T {
	if (Object.keys(langRecord).length === 0) {
		throw new Error(`No values in provided langRecord`);
	}
	const value = langRecord[lang as Lang] ?? langRecord[defaultLang as Lang];
	if (value === undefined || value === null) {
		throw new Error(
			`No value found for lang ${lang} or default lang ${defaultLang}: ${JSON.stringify(langRecord, null, 2)}`,
		);
	}
	return value;
}

export function createLangValue<T>(value: T): LangRecord<T> {
	return Object.fromEntries(
		langs.map((lang) => [lang, value]),
	) as LangRecord<T>;
}

export function toLanguageNameWithNative(lang: Lang): string {
	const iso = bcp47ToISO639_1(lang);
	const name = ISO6391.getName(iso);
	const nativeName = ISO6391.getNativeName(iso);
	return `${name} (${nativeName})`;
}

export function bcp47ToISO639_1(bcp47: Lang): string {
	// The first part of the BCP 47 tag usually corresponds to ISO 639-1
	return bcp47.split('-')[0];
}
