import React, { useState } from "react";
import ClassNames from "classnames";
import * as styles from "../../styles/tool.module.scss";
import {
  // BsChevronContract as CloseIcon,
  // BsChevronExpand as OpenIcon,
  BsX as ClosePanelIcon,
  BsArrowBarDown as OpenPanelIcon,
  BsMap as ToursIcon
} from "react-icons/bs";
import { Tabs, Tab } from "react-bootstrap";
import classNames from "classnames"

import Clusters from "../../images/clusters.svg";
import Projects from "../../images/projects.svg";
import Tactics from "../../images/tact.svg";

const Tools = ({ changeVizMode, explorationMode, setExplorationMode, makeTourStepViz, tours }) => {
  const [panel, openPanel] = useState(true);
  const togglePanel = () => {
    openPanel(!panel);
  };

  // setTimeout(() => {
  //   makeTourStepViz(tours[0].steps[0]);
  // }, 1000);

  // setTimeout(() => {
  //   makeTourStepViz(tours[0].steps[1]);
  // }, 7000);

  return (
    <div className={classNames(styles.tools)}>
      <div className={ClassNames(styles.panel, { [styles.open]: panel })}>
        <div className={ClassNames(styles.panelHeader)}>
          <h3 className={ClassNames("text-uppercase", styles.title)}>
            Exploration modes
          </h3>
          <div></div>
          {panel && (
            <ClosePanelIcon
              className={styles.closeBtn}
              onClick={() => togglePanel()}
            />
          )}
          {!panel && (
            <OpenPanelIcon
              className={styles.closeBtn}
              onClick={() => togglePanel()}
            />
          )}
        </div>
        <div>
          <Tabs
            activeKey={explorationMode}
            onSelect={(k) => {
              setExplorationMode(k);
              changeVizMode(k);
            }}
            id="explorationMode"
            className={ClassNames(styles.customTabs)}
          >
            <Tab eventKey="tours" title={<ToursIcon/>}>
              <h5>Take a guided tour</h5>
              {tours.map(d=><h6 key={d.id} onClick={()=>{makeTourStepViz(d.steps[0])}}>{d.title}</h6>)}
            </Tab>
            <Tab eventKey="clusters" title="Clusters">
              <img
                src={Clusters}
                className={ClassNames(styles.legend)}
                alt="legend"
              ></img>
            </Tab>
            <Tab eventKey="projects" title="Projects" className={ClassNames(styles.projects)}>
              <img
                src={Projects}
                className={ClassNames(styles.legend)}
                alt="legend"
              ></img>
            </Tab>
            <Tab eventKey="networks" title="Networks" className={ClassNames(styles.networks)}>
              <img
                src={Tactics}
                className={ClassNames(styles.legend)}
                alt="legend"
              ></img>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Tools;