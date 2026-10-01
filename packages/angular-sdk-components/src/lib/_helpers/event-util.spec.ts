import type { Mock } from 'vitest';
import { handleEvent } from './event-util';

describe('handleEvent', () => {
  let actions: { updateFieldValue: Mock; triggerFieldChange: Mock };

  beforeEach(() => {
    actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
  });

  it('updates the field value on "change" only', () => {
    handleEvent(actions, 'change', 'Name', 'a');
    expect(actions.updateFieldValue).toHaveBeenCalledExactlyOnceWith('Name', 'a');
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });

  it('triggers the field change on "blur" only', () => {
    handleEvent(actions, 'blur', 'Name', 'a');
    expect(actions.triggerFieldChange).toHaveBeenCalledExactlyOnceWith('Name', 'a');
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
  });

  it('updates then triggers on "changeNblur", in that order', () => {
    const calls: string[] = [];
    actions.updateFieldValue.mockImplementation(() => calls.push('update'));
    actions.triggerFieldChange.mockImplementation(() => calls.push('trigger'));

    handleEvent(actions, 'changeNblur', 'Name', 'a');

    expect(calls).toEqual(['update', 'trigger']);
  });

  it('ignores unknown event types', () => {
    handleEvent(actions, 'focus', 'Name', 'a');
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });
});
