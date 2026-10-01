import { handleEvent } from './event-util';

describe('handleEvent', () => {
  let actions: { updateFieldValue: jasmine.Spy; triggerFieldChange: jasmine.Spy };

  beforeEach(() => {
    actions = { updateFieldValue: jasmine.createSpy('updateFieldValue'), triggerFieldChange: jasmine.createSpy('triggerFieldChange') };
  });

  it('updates the field value on "change" only', () => {
    handleEvent(actions, 'change', 'Name', 'a');
    expect(actions.updateFieldValue).toHaveBeenCalledOnceWith('Name', 'a');
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });

  it('triggers the field change on "blur" only', () => {
    handleEvent(actions, 'blur', 'Name', 'a');
    expect(actions.triggerFieldChange).toHaveBeenCalledOnceWith('Name', 'a');
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
  });

  it('updates then triggers on "changeNblur", in that order', () => {
    const calls: string[] = [];
    actions.updateFieldValue.and.callFake(() => calls.push('update'));
    actions.triggerFieldChange.and.callFake(() => calls.push('trigger'));

    handleEvent(actions, 'changeNblur', 'Name', 'a');

    expect(calls).toEqual(['update', 'trigger']);
  });

  it('ignores unknown event types', () => {
    handleEvent(actions, 'focus', 'Name', 'a');
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });
});
