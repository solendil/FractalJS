import binder from '../util/keybinder';

export default function setupKeyboard() {
  // 'this' is vue
  binder.bind('I', () => { this.ui.showInfobox = !this.ui.showInfobox; });
  binder.bind('esc', () => { this.ui.showSidebar = !this.ui.showSidebar; });
}
