"use strict";
import d3 from "d3";
import { d3RemoveElement } from "../controls/Graph/helpers/helpers";
import {
    calculateVerticalPadding,
    getXAxisWidth,
    getXAxisXPosition
} from "./axis";
import constants from "./constants";
import errors from "./errors";
import styles from "./styles";
import { round2Decimals } from "./transformUtils";
import utils from "./utils";

/**
 * @module region
 * @alias module:region
 */

/**
 * Validates the input object provided for the rendering
 * regions in graph
 * @private
 * @param {Object} region - Region to be shown within graph
 * @param {string} targetAxis - Axis for which region needs to be shown
 * @returns {undefined} - returns nothing
 */
const validateRegion = (region, targetAxis) => {
    if (utils.isEmpty(region)) {
        throw new Error(errors.THROW_MSG_REGION_EMPTY);
    }
    if (utils.isEmpty(region.start) && utils.isEmpty(region.end)) {
        throw new Error(errors.THROW_MSG_REGION_START_END_MISSING);
    }
    if (
        utils.notEmpty(region.axis) &&
        ((region.axis !== constants.Y_AXIS &&
            region.axis !== constants.Y2_AXIS) ||
            region.axis !== targetAxis)
    ) {
        throw new Error(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
    }
    if (utils.isEmpty(region.axis) && constants.Y_AXIS !== targetAxis) {
        throw new Error(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
    }
    if (
        (region.start && !utils.isNumber(region.start)) ||
        (region.end && !utils.isNumber(region.end))
    ) {
        throw new Error(errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED);
    }
    if (Number(region.start) > Number(region.end)) {
        throw new Error(errors.THROW_MSG_REGION_START_MORE_END);
    }
};
/**
 * Removes region from region group SVG in the graph
 * @private
 * @param {Object} regionGroupSVG - d3 svg object
 * @param {Object} dataTarget - Data points object
 * @returns {Object} - d3 svg object
 */
const removeRegion = (regionGroupSVG, dataTarget) =>
    d3RemoveElement(
        regionGroupSVG,
        `[aria-describedby="region_${dataTarget.key}"]`,
        true
    );
/**
 * Creates container for regions to be rendered within.
 * Since regions are supposed to be rendered beneath grids,
 * we need to render them within a group. Since regions are part of
 * the content and not the graph in general, we cannot render them before rendering
 * the grids. Hence we are going to render a group when graph is rendered and then
 * when the content is ready to be rendered, we will side-load the regions along with
 * their respective unique ids
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Object} d3 svg path
 */
const createRegionContainer = (config, canvasSVG) =>
    canvasSVG.append("g").classed(styles.regionGroup, true);
/**
 * Creates regions based on input object provided. Region can be one or many.
 * Regions are rendered based on the content.
 * Criteria:
 * * Either start or end is mandatory.
 * * If start is not provided - 0 to end
 * * If end is not provided - start to INFINITY (end of the graph)
 * Color can be provided to identify the range.
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Object} regionGroupSVG - d3 object of region group svg
 * @param {Array} regionList - List of regions to be shown within graph
 * @param {string} uniqueKey - unique id of the content loaded in graph
 * @param {string} targetAxis - Axis for which region needs to be shown
 * @returns {Object} d3 svg path
 */
const createRegion = (
    scale,
    config,
    regionGroupSVG,
    regionList,
    uniqueKey,
    targetAxis = constants.Y_AXIS
) => {
    const regionPath = regionGroupSVG.selectAll("g").data(regionList);
    regionPath
        .enter()
        .append("rect")
        .each((d) => validateRegion(d, targetAxis))
        .classed(styles.region, true)
        .attr("aria-hidden", false)
        .attr("aria-describedby", uniqueKey)
        .attr("style", (d) => (d.color ? `fill: ${d.color};` : ""))
        .attr(constants.X_AXIS, getXAxisXPosition(config))
        .attr(constants.Y_AXIS, getYAxisRangePosition(scale, config))
        .attr("width", getXAxisWidth(config))
        .attr("height", function(d) {
            return getRegionHeight(d3.select(this), d, scale, config);
        });
    regionPath
        .exit()
        .transition()
        .call(constants.d3Transition)
        .remove();
};

/**
 * Returns the region axis or "y" as default
 * @private
 * @param {Object} region - Region to be shown within graph
 * @returns {string} Region axis or "y" as default
 */
const getRegionAxis = (region) => region.axis || constants.Y_AXIS;
/**
 * Returns the function which returns Y Axis Vertical position for Range
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {function(*=): number} Function which returns Y Axis Vertical position for Range
 */
const getYAxisRangePosition = (scale, config) => (bounds) =>
    bounds.end
        ? round2Decimals(scale[getRegionAxis(bounds)](bounds.end)) +
          calculateVerticalPadding(config)
        : calculateVerticalPadding(config);
/**
 * Returns the height for range based on Y Axes, start and end bounds
 * If start and end bounds arent provided then a "goal line" number is returned with
 * height worth of padding top
 * @private
 * @param {Object} regionPath - d3 object of region svg
 * @param {Object} bounds - Start and end values for region
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {number} Height of the region for Y axes
 */
const getRegionHeight = (regionPath, bounds, scale, config) => {
    const graphHeight = config.height;
    const upperBound = utils.getNumber(regionPath.attr(constants.Y_AXIS));
    const lowerBound = bounds.start
        ? round2Decimals(scale[getRegionAxis(bounds)](bounds.start)) +
          calculateVerticalPadding(config)
        : graphHeight + calculateVerticalPadding(config);
    // If start and end are the same then `padding.top` worth of height is
    // applied to make it seem like a goal line
    return (
        lowerBound - upperBound ||
        constants.DEFAULT_REGION_GOAL_LINE_STROKE_WIDTH
    );
};
/**
 * Translates region. Moves the "rect" according the new scale generated on-resize.
 * Width and height are also flexed accordingly.
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Object} regionGroupSVG - d3 object of region group svg
 * @returns {Object} d3 svg path
 */
const translateRegion = (scale, config, regionGroupSVG) =>
    regionGroupSVG
        .selectAll(`.${styles.region}`)
        .attr(constants.X_AXIS, getXAxisXPosition(config))
        .attr(constants.Y_AXIS, getYAxisRangePosition(scale, config))
        .transition()
        .call(constants.d3Transition)
        .attr("width", getXAxisWidth(config))
        .attr("height", function(d) {
            return getRegionHeight(d3.select(this), d, scale, config);
        });
/**
 * Decides if regions needs to be hidden based on count of displayed targets in graph
 * @private
 * @param {Array} regionList - List of regions to be shown within graph
 * @param {Array} graphTargets - List of all the items in the Graph
 * @returns {boolean} true if displayed targets are more than 1, false otherwise
 */
const shouldHideAllRegions = (regionList, graphTargets) =>
    utils.notEmpty(regionList) && graphTargets.length > 1;
/**
 * Checks if only 1 content item is present in the graph
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @returns {boolean} true if displayed targets is equal to 1, false otherwise
 */
const isSingleTargetDisplayed = (graphTargets) => graphTargets.length === 1;
/**
 * Hides all the regions within a graph
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Object} d3 svg path
 */
const hideAllRegions = (canvasSVG) =>
    canvasSVG.selectAll(`.${styles.region}`).attr("aria-hidden", true);
/**
 * Hides/shows the region given the region path and unique identifier of the region
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - Data points set unique key
 * @param {boolean} shouldShow - true if enabled
 * @returns {Object} d3 svg path
 */
const showHideRegion = (canvasSVG, key, shouldShow) =>
    canvasSVG
        .selectAll(`.${styles.region}[aria-describedby="${key}"]`)
        .attr("aria-hidden", !shouldShow);
/**
 * Toggles region based on current display status for that region.
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - Data points set unique key
 * @returns {Object} d3 svg path
 */
const toggleRegion = (canvasSVG, key) =>
    canvasSVG
        .selectAll(`.${styles.region}[aria-describedby="region_${key}"]`)
        .attr("aria-hidden", function() {
            return !(d3.select(this).attr("aria-hidden") === "true");
        });
/**
 * Show/hide regions based on the following criteria:
 * * If more than 1 target is displayed -> Hide regions
 * * If only 1 target is displayed -> show the region using unique data set key
 * @private
 * @param {Array} shownTargets - Targets/data sets that are currently displayed in graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Object} d3 svg path
 */
const processRegions = (shownTargets, canvasSVG) =>
    isSingleTargetDisplayed(shownTargets)
        ? toggleRegion(canvasSVG, ...shownTargets)
        : hideAllRegions(canvasSVG);
/**
 * Handler for show/hide region(s) when hovered over a legend item
 * @private
 * @param {Array} shownTargets - Targets/data sets that are currently displayed in graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - Data points set unique key
 * @param {string} hoverState - state of mouse hover => enter or leave
 * @returns {undefined} - returns nothing
 */
const regionLegendHoverHandler = (shownTargets, canvasSVG, key, hoverState) => {
    const shouldShow =
        hoverState === constants.HOVER_EVENT.MOUSE_ENTER &&
        shownTargets.indexOf(key) > -1;
    canvasSVG
        .selectAll(`.${styles.region}[aria-describedby="region_${key}"]`)
        .classed(styles.regionHighlight, shouldShow);
};

/**
 * @enum {Function}
 */
export {
    createRegionContainer,
    createRegion,
    hideAllRegions,
    isSingleTargetDisplayed,
    showHideRegion,
    processRegions,
    removeRegion,
    regionLegendHoverHandler,
    shouldHideAllRegions,
    translateRegion,
    validateRegion
};
