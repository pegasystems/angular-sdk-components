/**
 * Localizes a string through the (non-deprecated) PConnect localization service.
 *
 * Replaces `pConn.getLocalizedValue(text, localePath, localeRuleKey)`, which is deprecated in PConnect and has these
 * semantics: look the text up under the given locale rule (or the component's own rule) and optional path, and fall back
 * to the component's default localization scope when that lookup returns the text unchanged.
 */
export function localizeText(pConn: typeof PConnect, text: string, localePath?: string, localeRuleKey?: string): string {
  const ruleKey = localeRuleKey || pConn.getLocaleRuleName();
  const localeReference = ruleKey && localePath ? `${ruleKey}#${localePath}` : ruleKey;
  const localized = pConn.getLocalizationService(localeReference).getLocalizedText(text);
  return localized === text ? pConn.getLocalizationService().getLocalizedText(text) : localized;
}
