# Agenda audit and improvement plan

Date: 2026-09-17

## Executive finding

The active route renders `AgendaHub`, not the older `Agenda` implementation. The
calendar already had drag-to-move, day/week/month/list views, filtering, export,
and a shared context-action primitive. The main usability failure was that the
calendar did not expose a complete action model: event context menus offered
only “open details”, blank slots had no right-click action, and the list view's
visible action button did not open anything.

## Audit observations

| Area | Finding | Impact | Decision |
| --- | --- | --- | --- |
| Event actions | Right-click technically existed through `ContextActions`, but only opened the details panel | Users cannot complete common work from the calendar | Use one action menu for right-click, ⋯, keyboard, and long-press |
| Empty space | Month days and time slots had double-click booking only | Discoverability is low; touch and mouse users have no equivalent shortcut | Add context actions for new booking and opening the day |
| List view | ⋯ button was present inside a clickable row but had no menu | Broken affordance and wasted action space | Wire list rows to the same context menu |
| Status flow | Status changes required opening the edit dialog | Too many steps for reception workflow | Add safe quick transitions for confirm, waiting, complete, and cancel |
| Accessibility | Menu supports Escape and arrow navigation; calendar cells lacked a shared action surface | Keyboard and assistive-technology behavior was inconsistent | Preserve menu focus behavior and add semantic labels to blank cells |
| Mobile | Long-press support existed in the shared primitive | Good foundation, but only useful when actions are complete | Keep the mobile bottom-sheet behavior and expand its actions |
| Data integrity | Drag updates optimistically and reverts on failure | Good feedback pattern, but status changes needed the same protection | Apply optimistic update + rollback to quick status changes |

## Implemented in this pass

- Expanded agenda event menus with details, patient, edit, messaging, and
  status actions appropriate to the current appointment.
- Added right-click/long-press menus to empty month days, week time slots, and
  day time slots.
- Added “new appointment” and “open this day” actions to blank calendar space.
- Wired the list view's action affordance to the same menu system.
- Added optimistic quick status changes with rollback and user notification on
  failure.
- Made `ContextActions` forward normal DOM event props so wrapped calendar cells
  retain double-click, drag, and drop behavior.

## Recommended next iterations

1. Add a first-class appointment editor for room/resource, notes, recurrence,
   and conflict resolution once those fields exist in the data model.
2. Replace the professional ID abbreviation with a loaded staff-name lookup.
3. Add keyboard focus movement across calendar cells and an explicit “create at
   this time” shortcut for the focused slot.
4. Add confirmation for cancellation and undo for quick status changes.
5. Add automated browser coverage for right-click, long-press, list ⋯, blank-slot
   booking, and optimistic rollback.
6. Add server-side conflict validation for professional/resource overlap before
   allowing a drag or quick booking to be committed.

## Definition of done for the agenda

An operator should be able to find a patient, understand the schedule state,
open or modify an appointment, communicate with the patient, change its
operational status, and create a booking from any visible day or time slot using
mouse, keyboard, or touch—without relying on hidden gestures or dead controls.
