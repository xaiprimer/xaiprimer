import React from "react";
import { useEffect, useRef } from "react";

import * as styles from "../styles/tool.module.scss";
import * as d3 from "d3";

import data from "../components/data-primer.json";

const ToolPage = () => {
  const svgEl = useRef();
  const g1El = useRef();

  useEffect(() => {
    let zoomLevel = 0;
    const xy = d3.scaleLinear().domain([0, 1]).range([0, 100]);
    const simulation = d3
      .forceSimulation()
      .force(
        "x",
        d3
          .forceX((d) => xy(+d._x))
          .strength((d) => (d.category === "tactic" ? 0 : 0.2))
      )
      .force(
        "y",
        d3
          .forceY((d) => xy(+d._y))
          .strength((d) => (d.category === "tactic" ? 0 : 0.2))
      )
      .force(
        "link",
        d3.forceLink().id((d) => d.id)
      )
      .force("collide", d3.forceCollide().radius(75).iterations(1))
      .on("tick", ticked)
      .velocityDecay(0.65)
      .alphaDecay(0.01)
      .stop();
    const zoom = d3.zoom().on("zoom", zoomed),
      svg = d3.select(svgEl.current).call(zoom),
      g1 = d3.select(g1El.current),
      bbox = svg.node().getBoundingClientRect(),
      width = bbox.width,
      height = bbox.height;

    let link = g1.selectAll(".link");
    let item = g1.selectAll(".item");

    update(makeClusters(data), []);

    svg
      .attr("viewbox", `0 0 ${width} ${height}`)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.01)
      )
      .transition()
      .duration(1000)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.15)
      );
    function zoomed(e) {
      const { x, y, k } = e.transform;
      const previousZoom = zoomLevel;
      if (k < 0.2) {
        zoomLevel = 0;
      } else if (k < 0.5) {
        zoomLevel = 1;
      } else {
        zoomLevel = 2;
      }
      g1.style("transform", `translate(${x}px,${y}px) scale(${k})`);

      if (previousZoom !== zoomLevel) {
        switch (zoomLevel) {
          case 0:
            update(makeClusters(data), []);
            svg.style("background-color", "#F9F9F9");
            break;
          case 1:
            const projects = makeItems(data, previousZoom !== 2);
            update(projects, []);
            svg.style("background-color", "#F5F5F5");
            break;
          case 2:
            const net = makeNetworks(data);
            update(net.nodes, net.links);
            svg.style("background-color", "#EBEBEB");
            break;
          default:
            // do nothing
        }
      }
    }

    function ticked() {
      item.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    }

    function update(nodes, links) {

      link = link.data(links, (d) => d.id);
      link.exit().transition().duration(250).style("opacity", "-0.5").remove();
      link = link
        .enter()
        .append("line")
        .classed("line", true)
        .attr("stroke", "black")
        .style("opacity", "0")
        .merge(link);

      link.transition().delay(500).duration(500).style("opacity", "1");

      item = item.data(nodes, (d) => d.id);
      item
        .exit()
        .transition()
        .duration(750)
        .style("opacity", "-0.5")
        .attr("transform", (d) => `translate(${d.fading_x}, ${d.fading_y})`)
        .remove();
      item = item
        .enter()
        .append("g")
        .classed("item", true)
        .style("opacity", "0")
        .merge(item);

      item.transition().duration(500).style("opacity", "1");

      item
        .selectAll("rect")
        .data(
          (d) => [d],
          (d) => d.id
        )
        .join("rect")
        .attr("width", 100)
        .attr("height", 100)
        .attr("x", -50)
        .attr("y", -50)
        .attr("fill", (d) =>
          d.category === "cluster"
            ? "#7765E3"
            : d.category === "tactic"
            ? "#FFFFFF"
            : "#E4FF1A"
        );

      item
        .selectAll("text")
        .data(
          (d) => [d],
          (d) => d.id
        )
        .join("text")
        .attr("fill", "black")
        .attr("font-size", 30)
        .attr("text-anchor", "middle")
        .text((d) => d.id);

      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    }

    function makeClusters(data) {
      const clusters = d3
        .flatRollup(
          data,
          (v) => [d3.mean(v, (d) => d._x), d3.mean(v, (d) => d._y)],
          (d) => d.cluster
        )
        .map((d) => ({
          id: d[0],
          _x: d[1][0],
          _y: d[1][1],
          x: xy(d[1][0]),
          y: xy(d[1][1]),
          fading_x: xy(d[1][0]),
          fading_y: xy(d[1][1]),
          category: "cluster",
        }));
      return clusters;
    }

    function makeItems(data, setCoordinates) {
      const clustersPositions = d3.flatRollup(
        data,
        (v) => [d3.mean(v, (d) => d._x), d3.mean(v, (d) => d._y)],
        (d) => d.cluster
      );

      data.forEach((d) => {
        const _clusterPosition = clustersPositions.find(
          (c) => c[0] === d.cluster
        );
        if (setCoordinates) {
          d.x = xy(_clusterPosition[1][0]);
          d.y = xy(_clusterPosition[1][1]);
        }
        d.fading_x = xy(_clusterPosition[1][0]);
        d.fading_y = xy(_clusterPosition[1][1]);
      });

      return data;
    }

    function makeNetworks(data) {
      const clustersPositions = d3.flatRollup(
        data,
        (v) => [d3.mean(v, (d) => d._x), d3.mean(v, (d) => d._y)],
        (d) => d.cluster
      );
      const tactics = d3.flatRollup(
        data,
        (v) => {
          const _arr = v.map((vv) => vv.alltactics.split(";")).flat();
          const _cluster = clustersPositions.find((c) => c[0] === v[0].cluster);
          return d3
            .flatGroup(_arr, (d) => d)
            .map((d) => ({
              id: _cluster[0] + "-" + d[0],
              label: d[0],
              _x: _cluster[1][0],
              _y: _cluster[1][1],
              x: xy(_cluster[1][0]),
              y: xy(_cluster[1][1]),
              fading_x: xy(_cluster[1][0]) + 0,
              fading_y: xy(_cluster[1][1]) + 0,
              category: "tactic",
            }));
        },
        (d) => d.cluster
      );
      const flatTactics = tactics.map((d) => d[1]).flat();

      const links = d3.flatRollup(
        data,
        (v) => {
          return v.map((d) => {
            const temp = d.cluster + "-" + d.id + "-";
            return d.alltactics.split(";").map((t) => ({
              id: temp + t,
              source: d,
              target: flatTactics.find((ft) => ft.id === d.cluster + "-" + t),
            }));
          });
        },
        (d) => d.cluster
      );
      const flatLinks = links.map((d) => d[1].flat()).flat();

      return { nodes: data.concat(flatTactics), links: flatLinks };
    }
  }, []);

  return (
    <>
      <svg ref={svgEl} className={styles.viz}>
        <g ref={g1El}></g>
      </svg>
    </>
  );
};

export default ToolPage;
