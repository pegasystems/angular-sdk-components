/*
 * Scaffolds an SDK component and performs the two registrations that are easy to forget:
 *   1. export from packages/angular-sdk-components/src/public-api.ts
 *   2. mapping in src/lib/_bridge/helpers/sdk-pega-component-map.ts
 *
 * Usage: node scripts/new-component.js <field|template|widget|infra|designSystemExtension> <kebab-name> <PegaComponentName>
 * Example: node scripts/new-component.js field star-rating StarRating
 */
const fs = require('node:fs');
const path = require('node:path');

const KINDS = ['field', 'template', 'widget', 'infra', 'designSystemExtension'];
const [kind, kebab, pegaName] = process.argv.slice(2);

if (!KINDS.includes(kind) || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(kebab || '') || !/^[A-Z][A-Za-z0-9]*$/.test(pegaName || '')) {
  console.error('Usage: node scripts/new-component.js <field|template|widget|infra|designSystemExtension> <kebab-name> <PegaComponentName>');
  process.exit(1);
}

const srcRoot = path.resolve(__dirname, '..', 'packages', 'angular-sdk-components', 'src');
const dir = path.join(srcRoot, 'lib', '_components', kind, kebab);
if (fs.existsSync(dir)) {
  console.error(`${path.relative(process.cwd(), dir)} already exists`);
  process.exit(1);
}

const className = `${kebab
  .split('-')
  .map(p => p[0].toUpperCase() + p.slice(1))
  .join('')}Component`;
const selector = `app-${kebab}`;
const depth = '../../../';

const fieldTs = `import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '${depth}_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '${depth}_helpers/event-util';
import { PConnFieldProps } from '${depth}_types/PConnProps.interface';

interface ${className.replace('Component', '')}Props extends PConnFieldProps {
  // additional props that only exist on this component
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: '${selector}',
  templateUrl: './${kebab}.component.html',
  styleUrls: ['./${kebab}.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, forwardRef(() => ComponentMapperComponent)]
})
export class ${className} extends FieldBase {
  configProps$: ${className.replace('Component', '')}Props;

  override updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ${className.replace('Component', '')}Props;
    this.updateComponentCommonProperties(this.configProps$);
    this.value$ = this.configProps$.value;
  }

  fieldOnChange() {
    this.pConn$.clearErrorMessages({ property: this.propName });
  }

  fieldOnBlur(event: any) {
    handleEvent(this.actionsApi, 'changeNblur', this.propName, event?.target?.value);
  }
}
`;

const fieldHtml = `@if (displayMode$) {
  @if (bVisible$ !== false) {
    <component-mapper name="FieldValueList" [props]="{ label$, value$, displayMode$ }"></component-mapper>
  }
} @else {
  @if (bVisible$ && !bReadonly$ && bHasForm$) {
    <div [formGroup]="formGroup$">
      <mat-form-field class="psdk-full-width" subscriptSizing="dynamic">
        <mat-label>{{ label$ }}</mat-label>
        <input
          matInput
          [placeholder]="placeholder"
          [required]="bRequired$"
          [attr.data-test-id]="testId"
          [formControl]="fieldControl"
          (change)="fieldOnChange()"
          (blur)="fieldOnBlur($event)"
        />
        @if (fieldControl.invalid) {
          <mat-error>{{ getErrorMessage() }}</mat-error>
        }
      </mat-form-field>
    </div>
  }
}
`;

const genericTs = `import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';

import { AngularPConnectData, AngularPConnectService } from '${depth}_bridge/angular-pconnect';

@Component({
  selector: '${selector}',
  templateUrl: './${kebab}.component.html',
  styleUrls: ['./${kebab}.component.scss']
})
export class ${className} implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  private angularPConnect = inject(AngularPConnectService);
  angularPConnectData: AngularPConnectData = {};
  configProps$: any;

  ngOnInit(): void {
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.updateSelf();
  }

  ngOnDestroy(): void {
    this.angularPConnectData.unsubscribeFn?.();
  }

  onStateChange() {
    if (this.angularPConnect.shouldComponentUpdate(this)) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
  }
}
`;

const genericHtml = `<div>{{ configProps$?.label }}</div>
`;

const specTs = `import { ComponentFixture, TestBed } from '@angular/core/testing';
${kind === 'field' ? "import { FormGroup } from '@angular/forms';\n" : ''}
import { createMockPConn } from '${'../'.repeat(4)}test-setup';
import { ${className} } from './${kebab}.component';

describe('${className}', () => {
  let fixture: ComponentFixture<${className}>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [${className}] }).compileComponents();
    fixture = TestBed.createComponent(${className});
    (fixture.componentInstance as any).pConn$ = createMockPConn();
    ${kind === 'field' ? '(fixture.componentInstance as any).formGroup$ = new FormGroup({});' : ''}
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`.replace(/\n\s*\n\s*fixture\.detectChanges/, '\n    fixture.detectChanges');

fs.mkdirSync(dir, { recursive: true });
const isField = kind === 'field';
fs.writeFileSync(path.join(dir, `${kebab}.component.ts`), isField ? fieldTs : genericTs);
fs.writeFileSync(path.join(dir, `${kebab}.component.html`), isField ? fieldHtml : genericHtml);
fs.writeFileSync(path.join(dir, `${kebab}.component.scss`), '');
fs.writeFileSync(path.join(dir, `${kebab}.component.spec.ts`), specTs);

// 1) public-api.ts: insert after the last export from the same kind folder (or append)
const apiPath = path.join(srcRoot, 'public-api.ts');
const exportLine = `export * from './lib/_components/${kind}/${kebab}/${kebab}.component';`;
const apiLines = fs.readFileSync(apiPath, 'utf8').split('\n');
let at = -1;
apiLines.forEach((l, i) => {
  if (l.includes(`/_components/${kind}/`)) at = i;
});
apiLines.splice(at >= 0 ? at + 1 : apiLines.length, 0, exportLine);
fs.writeFileSync(apiPath, apiLines.join('\n'));

// 2) component map: import + entry
const mapPath = path.join(srcRoot, 'lib', '_bridge', 'helpers', 'sdk-pega-component-map.ts');
let map = fs.readFileSync(mapPath, 'utf8');
const importLine = `import { ${className} } from '../../_components/${kind}/${kebab}/${kebab}.component';\n`;
const firstEntry = map.indexOf('const pegaSdkComponentMap');
const lastImportEnd = map.lastIndexOf('\nimport ', firstEntry);
const insertAt = map.indexOf('\n', lastImportEnd + 1) + 1;
map = map.slice(0, insertAt) + importLine + map.slice(insertAt);
map = map.replace(/\n};\n\nexport default pegaSdkComponentMap;/, `,\n  ${pegaName}: ${className}\n};\n\nexport default pegaSdkComponentMap;`);
map = map.replace(/,,\n/g, ',\n');
fs.writeFileSync(mapPath, map);

console.log(`Created ${path.relative(process.cwd(), dir)} and registered ${className} as "${pegaName}".`);
console.log('Next: npm run fix, then build-angular-sdk-components && npx api-extractor run --local');
