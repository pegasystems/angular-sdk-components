// Angular-dependent test helpers. Kept out of test-setup.ts, which is loaded as a polyfill before Angular's test environment exists.
import { vi } from 'vitest';
import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Makes <component-mapper> inert (it keeps its inputs but no longer instantiates real components) so a component can be
 * tested in isolation from the rest of the rendering pipeline. Call from a beforeEach; Vitest restores the spy automatically.
 */
export async function stubComponentMapper(): Promise<void> {
  const { ComponentMapperComponent } = await import('./lib/_bridge/component-mapper/component-mapper.component');
  vi.spyOn(ComponentMapperComponent.prototype, 'loadComponent').mockImplementation(() => undefined);
}

/** The `name` and `props` of every <component-mapper> rendered by the fixture (use together with stubComponentMapper). */
export async function getMappedComponents(fixture: ComponentFixture<unknown>): Promise<{ name?: string; props: any }[]> {
  const { ComponentMapperComponent } = await import('./lib/_bridge/component-mapper/component-mapper.component');
  return fixture.debugElement.queryAll(By.directive(ComponentMapperComponent)).map((d: DebugElement) => ({
    name: d.componentInstance.name,
    props: d.componentInstance.props
  }));
}
