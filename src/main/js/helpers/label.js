/**
 * @fileOverview
 * Axes Label helper functions.
 * @module label
 * @alias module:label
 */
"use strict";

import d3 from "d3";
import {
    d3RemoveElement,
    getColorForTarget
} from "../controls/Graph/helpers/helpers";
import { Shape } from "../core";
import { getDefaultSVGProps } from "../core/Shape";
import {
    getRotationForAxis,
    getY2AxisLabelShapeXPosition,
    getY2AxisLabelShapeYPosition,
    getYAxisLabelShapeXPosition,
    getYAxisLabelShapeYPosition,
    hasY2Axis
} from "./axis";
import constants, { SHAPES } from "./constants";
import styles from "./styles";
import utils from "./utils";

/**
 * Informs if a label needs truncation or otherwise
 * @private
 * @param {string} labelStr - A label
 * @param {number} [charLimit] - Maximum character length before truncation
 * @returns {boolean} true if needs truncation, false otherwise
 */
const shouldTruncateLabel = (
    labelStr,
    charLimit = constants.DEFAULT_LABEL_CHARACTER_LIMIT
) => labelStr.length > charLimit;
/**
 * Truncates the label string to the character limit provided, by default its
 * constants.DEFAULT_LABEL_CHARACTER_LIMIT
 * @private
 * @param {string} labelStr - A label
 * @param {number} charLimit - Maximum character length before truncation
 * @returns {string} A truncated string with ellipsis
 */
const truncateLabel = (
    labelStr,
    charLimit = constants.DEFAULT_LABEL_CHARACTER_LIMIT
) => labelStr.substring(0, charLimit).concat("...");
/**
 * Loads a shape within a label container to be shown below Y and Y2 axes.
 * @private
 * @param {Selection} shapeContainerPath - d3 path for label shape container
 * @param {Array} dataTarget - Data points
 * @returns {Selection} d3 path for label shape container
 */
const loadLabelShape = (shapeContainerPath, dataTarget) =>
    shapeContainerPath.append(() =>
        new Shape(dataTarget.shape || SHAPES.CIRCLE).getShapeElement(
            getDefaultSVGProps({
                svgStyles: `fill: ${getColorForTarget(dataTarget)};`,
                transformFn: (scale) => `scale(${scale})`,
                a11yAttributes: {
                    "aria-describedby": dataTarget.key
                }
            })
        )
    );
/**
 * Translates Y Axis label shape container to correct position. Typically this is
 * to the middle of the axis.
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Selection} shapeContainerPath - d3 path for label shape container
 * @returns {Selection} d3 path for label shape container
 */
const translateYAxisLabelShapeContainer = (config, shapeContainerPath) =>
    shapeContainerPath
        .transition()
        .call(constants.d3Transition)
        .attr(
            "transform",
            `translate(${getYAxisLabelShapeXPosition(
                config
            )}, ${getYAxisLabelShapeYPosition(
                config,
                shapeContainerPath
            )}) rotate(${getRotationForAxis(constants.Y_AXIS)})`
        );
/**
 * Translates Y2 Axis label shape container to correct position. Typically this is
 * to the middle of the axis. The values are shown in reverse direction
 * Rotate is -90 deg
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Selection} shapeContainerPath - d3 path for label shape container
 * @returns {Selection} d3 path for label shape container
 */
const translateY2AxisLabelShapeContainer = (config, shapeContainerPath) =>
    shapeContainerPath
        .transition()
        .call(constants.d3Transition)
        .attr(
            "transform",
            `translate(${getY2AxisLabelShapeXPosition(
                config
            )}, ${getY2AxisLabelShapeYPosition(
                config,
                shapeContainerPath
            )}) rotate(${getRotationForAxis(constants.Y2_AXIS)})`
        );
/**
 * Returns the d3 html element after appending axis label shape group for Y Axis
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Selection} shapeContainerPath - d3 html element
 * @returns {Selection} d3 html element
 */
const buildYAxisLabelShapeContainer = (config, shapeContainerPath) =>
    shapeContainerPath
        .append("g")
        .classed(styles.axisLabelYShapeContainer, true)
        .attr(
            "transform",
            `translate(0,0) rotate(${getRotationForAxis(constants.Y_AXIS)})`
        );
/**
 * Returns the d3 html element after appending axis label shape group for Y2 axis
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Selection} shapeContainerPath - d3 html element
 * @returns {Selection} d3 html element
 */
const buildY2AxisLabelShapeContainer = (config, shapeContainerPath) =>
    shapeContainerPath
        .append("g")
        .classed(styles.axisLabelY2ShapeContainer, true)
        .attr(
            "transform",
            `translate(0,0) rotate(${getRotationForAxis(constants.Y2_AXIS)})`
        );
/**
 * Translates all the shapes within the container to space correct beside each other
 * The amount of spacing is determined by constants.BASE_LABEL_ICON_SPACING
 * @private
 * @param {Selection} shapeContainerPath - d3 html element
 * @returns {Selection} d3 html element containing the label shape container with
 * correctly placed shapes
 */
const translateAllLabelShapeItem = (shapeContainerPath) =>
    shapeContainerPath
        .selectAll("svg")
        .transition()
        .call(constants.d3Transition)
        .each(function(data, index) {
            d3.select(this).attr(
                "x",
                () => constants.BASE_LABEL_ICON_SPACING * index
            );
        });
/**
 * Creates a shape and adds it to the label container - Y or Y2 axes.
 * This only places the shapes, we need to call translate separately
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Array} dataTarget - Data points
 * @param {Selection} shapeContainerPath - d3 html element of label item
 * @returns {undefined} - returns nothing
 */
const prepareLabelShapeItem = (config, dataTarget, shapeContainerPath) => {
    if (dataTarget.label && dataTarget.label.display && shapeContainerPath) {
        loadLabelShape(shapeContainerPath, dataTarget);
        translateAllLabelShapeItem(shapeContainerPath);
    }
};
/**
 * Removes the label item shape from label shapes container in the graph
 * @private
 * @param {Selection} shapeContainerPath - d3 svg object for label shape container
 * @param {Object} dataTarget - Data points object
 * @returns {undefined} - returns nothing
 */
const removeLabelShapeItem = (shapeContainerPath, dataTarget) => {
    if (utils.notEmpty(shapeContainerPath)) {
        d3RemoveElement(
            shapeContainerPath,
            `svg[aria-describedby="${dataTarget.key}"]`
        );
        translateAllLabelShapeItem(shapeContainerPath);
    }
};
/**
 * Translates the shape container after the shape items are loaded. This positions
 * it correctly to the center of the graph.
 * This is only for the container and not for the positioning the shapes within.
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Object} shapeContainerPath - d3 svg object for label shape container
 * @returns {undefined} - returns nothing
 */
const translateLabelShapeContainer = (config, shapeContainerPath) => {
    if (hasY2Axis(config.axis) && utils.notEmpty(shapeContainerPath)) {
        translateYAxisLabelShapeContainer(
            config,
            shapeContainerPath[constants.Y_AXIS]
        );
        translateY2AxisLabelShapeContainer(
            config,
            shapeContainerPath[constants.Y2_AXIS]
        );
    }
};

/**
 * @enum {Function}
 */
export {
    buildYAxisLabelShapeContainer,
    buildY2AxisLabelShapeContainer,
    prepareLabelShapeItem,
    translateLabelShapeContainer,
    removeLabelShapeItem,
    shouldTruncateLabel,
    truncateLabel
};
