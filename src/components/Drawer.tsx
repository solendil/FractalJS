import React from "react";
import { map } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { Root } from "../redux/reducer";
import { setDrawer, setTab } from "../redux/ui";
import Drawer from "@material-ui/core/Drawer";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import About from "./About";
import Fractal from "./Fractal";
import Palette from "./Palette";
import Settings from "./Settings";

export const WIDTH = 300;

function MyDrawer() {
  const dispatch = useDispatch();
  const { drawer, tab } = useSelector((state: Root) => ({
    drawer: state.ui.drawer,
    tab: state.ui.tab,
  }));

  const setTabAction = (_: any, tab: string) => {
    if (tab === "close") dispatch(setDrawer(false));
    else dispatch(setTab(tab));
  };

  const tabDef: { [key: string]: any } = {
    close: { icon: "arrow_back" },
    fractal: { icon: "home", component: <Fractal /> },
    palette: { icon: "invert_colors", component: <Palette /> },
    settings: { icon: "settings", component: <Settings /> },
    about: { icon: "info_outline", component: <About /> },
  };
  const htmlTabs = map(tabDef, (def, tabId) => (
    <Tab
      key={tabId}
      style={{
        minWidth: `${Math.floor(WIDTH / Object.keys(tabDef).length)}px`,
      }}
      value={tabId}
      icon={<i className="material-icons">{def.icon}</i>}
    />
  ));
  const content = tabDef[tab].component;

  return (
    <Drawer open={drawer} variant="persistent">
      <Tabs
        value={tab}
        onChange={setTabAction}
        indicatorColor="primary"
        textColor="primary"
      >
        {htmlTabs}
      </Tabs>
      {content}
    </Drawer>
  );
}

export default MyDrawer;
