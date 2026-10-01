import { vi } from 'vitest';
import { stubComponentMapper, getMappedComponents } from '../../../../test-utils';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupComponent } from './group.component';

describe('GroupComponent', () => {
  let component: GroupComponent;
  let fixture: ComponentFixture<GroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GroupComponent]
    });
    fixture = TestBed.createComponent(GroupComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function setup(config: Record<string, any>, kids: any[] = []) {
    const pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getChildren = () => kids;
    pConn.getComputedVisibility = () => true;
    const fx = TestBed.createComponent(GroupComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    fx.detectChanges();
    return { fx, comp: fx.componentInstance, pConn };
  }

  const makeKid = (name: string) => {
    const kid = createMockChild({ getComponentName: () => name, setInheritedProp: vi.fn() });
    return { kid, pc: kid.getPConnect() };
  };

  it('updateSelf maps config props to component state', () => {
    const { comp } = setup({ showHeading: true, heading: 'Address', instructions: 'Fill in', visibility: true }, [makeKid('Text').kid]);
    expect(comp.showHeading$).toBe(true);
    expect(comp.heading$).toBe('Address');
    expect(comp.instructions$).toBe('Fill in');
    expect(comp.visibility$).toBe(true);
    expect(comp.arChildren$).toHaveLength(1);
  });

  it('falls back to the computed visibility when visibility is not configured', () => {
    const { pConn } = setup({});
    pConn.getComputedVisibility = () => false;
    const kids = [makeKid('Text').kid];
    pConn.getChildren = () => kids;
    const fx = TestBed.createComponent(GroupComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    fx.detectChanges();
    expect(fx.componentInstance.visibility$).toBe(false);
  });

  it('additionalProps exposes the computed visibility', () => {
    const { comp, pConn } = setup({});
    pConn.getComputedVisibility = () => false;
    expect(comp.additionalProps()).toEqual({ visibility: false });
  });

  it('renders a FieldGroup with heading, instructions and collapseOnLoad via component-mapper', async () => {
    await stubComponentMapper();
    const { fx } = setup({ showHeading: true, heading: 'Address', instructions: 'Fill in', visibility: true, collapseOnLoad: 'collapsed' }, [
      makeKid('Text').kid
    ]);
    const mapped = await getMappedComponents(fx);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].name).toBe('FieldGroup');
    expect(mapped[0].props).toMatchObject({ name: 'Address', instructions: 'Fill in', collapseOnLoad: 'collapsed' });
  });

  it('omits the group name when showHeading is false', async () => {
    await stubComponentMapper();
    const { fx } = setup({ showHeading: false, heading: 'Address', visibility: true }, [makeKid('Text').kid]);
    const mapped = await getMappedComponents(fx);
    expect(mapped[0].props.name).toBeUndefined();
  });

  it('renders nothing when not visible or when there are no children', async () => {
    await stubComponentMapper();
    const hidden = setup({ visibility: false }, [makeKid('Text').kid]);
    expect(await getMappedComponents(hidden.fx)).toHaveLength(0);
    const empty = setup({ visibility: true }, []);
    expect(await getMappedComponents(empty.fx)).toHaveLength(0);
  });

  it('renders each child through component-mapper using its component name', async () => {
    await stubComponentMapper();
    const { fx, comp } = setup({ visibility: true }, [makeKid('TextInput').kid, makeKid('Checkbox').kid]);
    comp.formGroup$ = undefined as any;
    const template = (await getMappedComponents(fx))[0].props.childrenTemplate;
    expect(template).toBeTruthy();
    const view = template.createEmbeddedView({});
    view.detectChanges();
    const names = (view.rootNodes as HTMLElement[]).flatMap(n => Array.from(n.querySelectorAll?.('component-mapper') ?? []));
    expect(names).toHaveLength(2);
    view.destroy();
  });

  it('DISPLAY_ONLY marks children display-only and read-only', () => {
    const a = makeKid('Text');
    const b = makeKid('Text');
    setup({ displayMode: 'DISPLAY_ONLY', visibility: true }, [a.kid, b.kid]);
    for (const { pc } of [a, b]) {
      expect(pc.setInheritedProp).toHaveBeenCalledWith('displayMode', 'DISPLAY_ONLY');
      expect(pc.setInheritedProp).toHaveBeenCalledWith('readOnly', true);
    }
  });

  it('DISPLAY_ONLY defaults visibility to true when not configured', () => {
    const { comp } = setup({ displayMode: 'DISPLAY_ONLY' }, [makeKid('Text').kid]);
    expect(comp.visibility$).toBe(true);
  });

  it('does not touch children when not DISPLAY_ONLY', () => {
    const a = makeKid('Text');
    setup({ visibility: true }, [a.kid]);
    expect(a.pc.setInheritedProp).not.toHaveBeenCalled();
  });
});
