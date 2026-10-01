import { TestBed } from '@angular/core/testing';

import { Utils } from './utils';

describe('Utils', () => {
  let utils: Utils;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [Utils] });
    utils = TestBed.inject(Utils);
  });

  describe('getBooleanValue', () => {
    it('parses boolean strings case-insensitively', () => {
      expect(utils.getBooleanValue('true')).toBeTrue();
      expect(utils.getBooleanValue('TRUE')).toBeTrue();
      expect(utils.getBooleanValue('false')).toBeFalse();
      expect(utils.getBooleanValue('yes')).toBeFalse();
    });

    it('returns non-string values unchanged', () => {
      expect(utils.getBooleanValue(true)).toBeTrue();
      expect(utils.getBooleanValue(false)).toBeFalse();
      expect(utils.getBooleanValue(undefined)).toBeUndefined();
    });
  });

  describe('getInitials', () => {
    it('uses first letters of first and last name', () => {
      expect(utils.getInitials('Ada Lovelace')).toBe('AL');
    });

    it('supports dotted user names', () => {
      expect(utils.getInitials('ada.lovelace')).toBe('AL');
    });

    it('handles single names and empty input', () => {
      expect(utils.getInitials('ada')).toBe('A');
      expect(utils.getInitials('')).toBe('');
    });
  });

  describe('getImageSrc', () => {
    it('builds the icon url and strips the pi- prefix', () => {
      expect(utils.getImageSrc('pi-home', 'https://host/')).toBe('https://host/assets/icons/home.svg');
      expect(utils.getImageSrc('pi plus', 'https://host/')).toBe('https://host/assets/icons/plus.svg');
    });

    it('maps line-chart to the chart-line icon', () => {
      expect(utils.getImageSrc('line-chart', '/')).toBe('/assets/icons/chart-line.svg');
    });
  });

  describe('getUniqueControlID', () => {
    it('returns increasing ids', () => {
      expect(utils.getUniqueControlID()).toBe('control-1');
      expect(utils.getUniqueControlID()).toBe('control-2');
    });
  });

  describe('transformListSourceItems', () => {
    it('prefers text over value and tolerates null', () => {
      expect(utils.transformListSourceItems([{ text: 'A', value: 'a' }, { value: 'b' }])).toEqual([{ text: 'A', value: 'A' }, { value: 'b' }]);
      expect(utils.transformListSourceItems(null as any)).toEqual([]);
    });
  });

  describe('getOptionList', () => {
    it('returns an empty list for missing or unknown list types', () => {
      expect(utils.getOptionList({}, {})).toEqual([]);
      expect(utils.getOptionList({ listType: 'other' }, {})).toEqual([]);
    });
  });

  describe('generateDate', () => {
    it('formats known date formats', () => {
      expect(utils.generateDate('2001-02-03', 'Date-Long-Custom-DD/MM/YYYY')).toBe('03/02/2001');
      expect(utils.generateDate('2001-02-03', 'Date-ISO-8601')).toBe('2001/02/03');
      expect(utils.generateDate('2001-02-03', 'Date-Long')).toBe('February 3, 2001');
    });

    it('returns empty values unchanged', () => {
      expect(utils.generateDate('', 'Date-Long')).toBe('');
      expect(utils.generateDate(null, 'Date-Long')).toBeNull();
    });
  });

  describe('static helpers', () => {
    it('isEmptyObject distinguishes empty from populated objects', () => {
      expect(Utils.isEmptyObject({})).toBeTrue();
      expect(Utils.isEmptyObject({ a: 1 })).toBeFalse();
    });

    it('reads the auth header from session storage', () => {
      sessionStorage.setItem('asdk_AH', 'Bearer x');
      expect(Utils.sdkGetAuthHeader()).toBe('Bearer x');
      sessionStorage.removeItem('asdk_AH');
    });
  });
});
