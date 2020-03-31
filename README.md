
# rework of fractalJS

BIG GOAL:
- Make FJS run as-is on a modern stack
  - CRA + redux, MUI
- Mobile First & PWA

SECONDARY GOALS
- allow easier improvements in UX
- make a Node code path with tests
- improve old code constructs

# TODOS

- redo tab bar, fix drawer width, test on phone
- app icon, keywords, etc...
- build & optimize
- "share" panel

# DONE

- TSified everything... it makes types and stuff clearer inside the engine, though more cleanup work is still required
- fix tearing bug while mouse pan
- "color" panel
- zoom limit
- UX keyboard shortcuts
- touch set navigation; swipe; pinch
- "about" panel
- infobox with mouse info
- update Redux state when controller changes engine
- smooth rendering
- info box
- URL setup & init
- multistep rendering (antialias)
- mouse set navigation
- keyboard set navigation
- UX: burger & tabs & static panes (w/cra)
- Switch to Material-UI, because of
  - tons of perfect components
  - slider & other
  - future-proof
  - mobile first
- proper webworkers


