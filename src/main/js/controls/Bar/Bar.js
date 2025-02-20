"use strict";
import { GraphContent } from "../../core";
import { getDefaultValue } from "../../core/BaseConfig";
import constants from "../../helpers/constants";
import {
    prepareLabelShapeItem,
    removeLabelShapeItem
} from "../../helpers/label";
import { removeLegendItem } from "../../helpers/legend";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import BarConfig from "./BarConfig";
import { removeAxisInfoRowLabels } from "./helpers/axisInfoRowHelpers";
import {
    clear,
    draw,
    prepareLegendItems,
    processDataPoints,
    setGroupName
} from "./helpers/creationHelpers";
import { processGoalLines, translateRegion } from "./helpers/goalLineHelpers";
import { clickHandler, hoverHandler } from "./helpers/legendHelpers";
import { scaleOrdinalAxis, setBarOffsets } from "./helpers/resizeHelpers";
import {
    clearSelectionDatum,
    updateSelectionBars
} from "./helpers/selectionHelpers";
import {
    translateBarGraph,
    translateTextLabel
} from "./helpers/translateHelpers";

/**
 * Calculates the min and max values for Y Axis or Y2 Axis
 * @private
 * @param {Array} values - Datapoint values
 * @param {string} axis - y or y2
 * @returns {Object} - Contains min and max values for the data points
 */
const calculateValuesRange = (values, axis = constants.Y_AXIS) => {
    const min = Math.min(...values.map((i) => i.y));
    const max = Math.max(...values.map((i) => i.y));
    return {
        [axis]: {
            min: min < 0 ? min : 0,
            max: max > 0 ? max : 0
        }
    };
};

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} BarConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new BarConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();
/**
 * Initializes the necessary Bar constructor objects
 * @private
 * @param {Bar} control - Bar instance
 * @returns {Bar} Bar instance
 */
const initConfig = (control) => {
    control.config = {};
    control.ordinalScale = {
        x0: {},
        x1: {}
    };
    control.dataTarget = {};
    control.valuesRange = {};
    return control;
};

/**
 * A bar graph is a graph used to represent numerical values of data by
 * height or length of lines or rectangles of equal width
 *
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 * @module Bar
 * @class Bar
 */
class Bar extends GraphContent {
    /**
     * @constructor
     * @param {BarConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        initConfig(this);
        this.config = loadInput(input);
        this.config.yAxis = getDefaultValue(
            this.config.yAxis,
            constants.Y_AXIS
        );
        this.config.axisPadding = false;
        this.valuesRange = calculateValuesRange(
            this.config.values,
            this.config.yAxis
        );
    }

    /**
     * @inheritDoc
     */
    load(graph) {
        setGroupName(this.config, graph.content);
        scaleOrdinalAxis(this.ordinalScale, graph.config, graph.content);
        this.dataTarget = processDataPoints(graph.config, this.config);
        draw(
            graph.scale,
            this.ordinalScale,
            graph.config,
            graph.svg,
            this.dataTarget
        );
        updateSelectionBars(
            this.dataTarget.internalValuesSubset,
            graph.svg,
            graph.config
        );
        prepareLegendItems(
            graph.config,
            {
                clickHandler: clickHandler(
                    graph,
                    this,
                    graph.config,
                    graph.svg
                ),
                hoverHandler: hoverHandler(graph.config.shownTargets, graph.svg)
            },
            this.dataTarget,
            graph.legendSVG
        );
        prepareLabelShapeItem(
            graph.config,
            this.dataTarget,
            graph.axesLabelShapeGroup[this.config.yAxis]
        );
        return this;
    }

    /**
     * @inheritDoc
     */
    unload(graph) {
        clear(graph.svg, this.dataTarget.key);
        removeLegendItem(graph.legendSVG, this.dataTarget);
        removeLabelShapeItem(
            graph.axesLabelShapeGroup[this.config.yAxis],
            this.dataTarget
        );
        removeAxisInfoRowLabels(
            graph.svg.select(`.${styles.axisInfoRow}`),
            this.dataTarget.key
        );
        clearSelectionDatum(graph.svg, this.dataTarget.key);
        initConfig(this);
        return this;
    }

    /**
     * @inheritDoc
     */
    resize(graph) {
        scaleOrdinalAxis(this.ordinalScale, graph.config, graph.content);
        setBarOffsets(
            graph.content,
            graph.contentTargets,
            this,
            this.ordinalScale,
            graph.config
        );
        translateBarGraph(
            graph.scale,
            this.ordinalScale,
            graph.svg,
            this.dataTarget,
            graph.config
        );
        if (utils.notEmpty(this.dataTarget.axisInfoRow)) {
            translateTextLabel(
                this.ordinalScale,
                graph.scale,
                graph.config,
                graph.svg,
                this.dataTarget.axisInfoRow,
                this.dataTarget
            );
        }
        if (utils.notEmpty(this.dataTarget.regions)) {
            processGoalLines(
                graph.scale,
                this.ordinalScale,
                graph.config,
                this.dataTarget,
                this.config.yAxis
            );
            translateRegion(
                graph.scale,
                graph.config,
                graph.svg.selectAll(
                    `rect[aria-describedby=region_${this.dataTarget.key}]`
                )
            );
        }
        return this;
    }

    /**
     * @inheritDoc
     */
    redraw(graph) {
        clear(graph.svg, this.dataTarget.key);
        removeAxisInfoRowLabels(
            graph.svg.select(`.${styles.axisInfoRow}`),
            this.dataTarget.key
        );
        draw(
            graph.scale,
            this.ordinalScale,
            graph.config,
            graph.svg,
            this.dataTarget
        );
        return this;
    }
}

export default Bar;
