import { localizeText } from './localization';

describe('localizeText', () => {
  const create = (translations: Record<string, Record<string, string>>, ruleName?: string) => {
    const getLocalizationService = vi.fn((reference?: string) => ({
      getLocalizedText: (text: string) => translations[reference ?? 'default']?.[text] ?? text
    }));
    return { pConn: { getLocaleRuleName: () => ruleName, getLocalizationService } as any, getLocalizationService };
  };

  it('looks the text up under the explicit rule key and path', () => {
    const { pConn, getLocalizationService } = create({ 'RULE#fields': { Name: 'Nom' } });
    expect(localizeText(pConn, 'Name', 'fields', 'RULE')).toBe('Nom');
    expect(getLocalizationService).toHaveBeenCalledWith('RULE#fields');
  });

  it('uses the component locale rule when no rule key is given, ignoring the path without a rule', () => {
    const { pConn, getLocalizationService } = create({ VIEW: { Cancel: 'Annuler' } }, 'VIEW');
    expect(localizeText(pConn, 'Cancel', '', '')).toBe('Annuler');
    expect(getLocalizationService).toHaveBeenCalledWith('VIEW');
  });

  it('falls back to the default localization scope when the scoped lookup returns the text unchanged', () => {
    const { pConn } = create({ default: { Add: 'Ajouter' } }, 'VIEW');
    expect(localizeText(pConn, 'Add')).toBe('Ajouter');
  });

  it('returns the original text when nothing is translated', () => {
    const { pConn } = create({});
    expect(localizeText(pConn, 'Same')).toBe('Same');
  });
});
