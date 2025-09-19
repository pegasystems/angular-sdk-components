import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdvancedSearchService {
  initializeSearchFields(rawViewMetadata: any): any[] {
    const searchFieldsSet = new Set();
    const searchFields: any[] = [];

    rawViewMetadata.config.searchGroups.forEach((group: any) => {
      group.children.forEach((child: any) => {
        if (!searchFieldsSet.has(child.config.value) && !child.config.validator) {
          searchFields.push(child);
          searchFieldsSet.add(child.config.value);
        }
      });
    });

    return searchFields;
  }

  getLocalizedValue(key: string, context: string): string {
    // Mock implementation for localized value retrieval
    return `${context}: ${key}`;
  }
}
