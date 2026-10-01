---
name: sdk-change-detection
description: Decide and implement the correct Angular change-detection strategy (Default vs OnPush, markForCheck, signals) for SDK components in this zoneless app, and review components for stale-UI risks.
---

# Change detection in the SDK

The test app runs **zoneless** (`provideZonelessChangeDetection()`); consumers may differ. UI updates when Angular is notified: template events, `markForCheck()`, signals, `setInput`, async pipe. State assigned in a promise/timer/RxJS callback does **not** notify by itself.

## How updates reach components

1. Store change -> `AngularPConnectService` wrapped callback -> component `onStateChange()` -> `checkAndUpdate()` -> `updateSelf()` mutates properties.
2. After the callback the bridge calls `inComp.markForCheck?.()`; `FieldBase` implements it with its injected `ChangeDetectorRef`. Other base classes/components do not (call `markForCheck()` yourself if you opt in to OnPush).
3. Parent -> child: `<component-mapper>` uses `setInput`, which marks OnPush children dirty.

## Decision table

| Situation                                                                                                                                            | Strategy                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Field extending `FieldBase`, all state set in `updateSelf()`/event handlers                                                                          | `OnPush` (current convention for synchronous fields)                                                       |
| Field that assigns state in `.then`, `subscribe`, `setTimeout`, listeners (auto-complete, dropdown with data fetch, location, object/user reference) | Default, or OnPush + `this.markForCheck()` at every such assignment                                        |
| Presentational component with immutable `@Input()`s                                                                                                  | `OnPush`                                                                                                   |
| Widget with async data                                                                                                                               | Default, or OnPush + `ChangeDetectorRef.markForCheck()` after assignment (see `case-history.component.ts`) |
| Template/infra components                                                                                                                            | Default (rendering pipeline relies on it; changing needs E2E validation)                                   |
| Component mutating an object it received through an input                                                                                            | Default (OnPush will not see in-place mutation)                                                            |

## Checklist before adding OnPush

- [ ] grep the class for `.then(`, `subscribe(`, `setTimeout`, `addEventListener`, `async `, `valueChanges`, `PubSub`: each assignment path calls `markForCheck()`, or the component stays Default
- [ ] no in-place mutation of inputs; new references on change
- [ ] getters used in the template are pure
- [ ] a spec renders through a Default-strategy host and simulates a store update (recipe in `sdk-write-unit-tests`)
- [ ] state this in the hand-off: unit tests cannot prove real-engine re-render behaviour; **Playwright E2E (MediaCo portal + embedded) should be run before merging**

## Symptoms of a missed `markForCheck()`

UI shows old label/errors until the user clicks elsewhere; validation message appears late; list does not update after a fetch. Fix: call `markForCheck()` right after the assignment, or revert to Default.

## Signals (future)

Signal inputs/state are tracked in ADR 0002 as deferred (breaking for override consumers). Do not mix signal inputs into existing components without that decision.
