# @ody/ui

Cross-platform design foundations for the Ody restaurant operations dashboard.

The system uses warm neutral surfaces for long working sessions, restrained
violet for primary actions, and a bright lime accent for live operational
signals. All values are centralized so dashboard screens and reusable React
Native components avoid scattered visual constants.

## Layout rules

- Use the 4-point spacing scale for all gaps and padding.
- Keep page content within `layout.contentMaxWidth`.
- Use a 12-column grid on desktop and a single column on compact screens.
- Keep interactive targets at least `layout.minimumTouchTarget` square.
- Prefer one primary action per view or modal.
- Use semantic colors only for their intended meaning.

## Elevation

- `subtle`: controls and quiet raised surfaces.
- `card`: dashboard cards and floating navigation.
- `overlay`: dialogs, drawers, menus, and toasts.
