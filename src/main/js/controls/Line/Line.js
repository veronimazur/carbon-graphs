"use strict";
import { GraphContent } from "../../core";
import { getDefaultValue } from "../../core/BaseConfig";
import constants from "../../helpers/constants";
import {
    prepareLabelShapeItem,
    removeLabelShapeItem
} from "../../helpers/label";
import { removeLegendItem } from "../../helpers/legend";
import {
    createRegion,
    hideAllRegions,
    removeRegion,
    shouldHideAllRegions,
    translateRegion
} from "../../helpers/region";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import {
    clear,
    clickHandler,
    draw,
    hoverHandler,
    prepareLegendItems,
    processDataPoints,
    translateLineGraph
} from "./helpers/helpers";
import LineConfig from "./LineConfig";

/**
 * @typedef {Object} Line
 * @typedef {Object} GraphContent
 * @typedef {Object} LineConfig
 */
/**
 * Calculates the min and max values for Y Axis or Y2 Axis.
 * First we filter out values that are `null`, this is a result of
 * datapoint being part of being in a non-contiguous series and then we
 * get the min and max values for the Y or Y2 axis domain.
 * @private
 * @param {Array} values - Datapoint values
 * @param {string} axis - y or y2
 * @returns {Object} - Contains min and max values for the data points for Y and Y2 axis
 */
const calculateValuesRange = (values, axis = constants.Y_AXIS) => {
    const yAxisValuesList = values.filter((i) => i.y !== null).map((i) => i.y);
    return {
        [axis]: {
            min: Math.min(...yAxisValuesList),
            max: Math.max(...yAxisValuesList)
        }
    };
};

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} LineConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new LineConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();

/**
 * A Line graph is a graph used to represent a collection of data
 * points connected by a line along the X and Y Axis.
 *
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 * @module Line
 * @class Line
 */
class Line extends GraphContent {
    /**
     * @constructor
     * @param {LineConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.config.yAxis = getDefaultValue(
            this.config.yAxis,
            constants.Y_AXIS
        );
        this.valuesRange = calculateValuesRange(
            this.config.values,
            this.config.yAxis
        );
        this.dataTarget = {};
    }

    /**
     * @inheritDoc
     */
    load(graph) {
        this.dataTarget = processDataPoints(graph.config, this.config);
        draw(graph.scale, graph.config, graph.svg, this.dataTarget);
        if (utils.notEmpty(this.dataTarget.regions)) {
            createRegion(
                graph.scale,
                graph.config,
                graph.svg.select(`.${styles.regionGroup}`),
                this.dataTarget.regions,
                `region_${this.dataTarget.key}`,
                this.config.yAxis
            );
        }
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
        clear(graph.svg, this.dataTarget);
        removeRegion(
            graph.svg.select(`.${styles.regionGroup}`),
            this.dataTarget
        );
        removeLegendItem(graph.legendSVG, this.dataTarget);
        removeLabelShapeItem(
            graph.axesLabelShapeGroup[this.config.yAxis],
            this.dataTarget
        );
        this.dataTarget = {};
        this.config = {};
        return this;
    }

    /**
     * @inheritDoc
     */
    resize(graph) {
        if (
            shouldHideAllRegions(
                this.dataTarget.regions,
                graph.config.shownTargets
            )
        ) {
            hideAllRegions(graph.svg);
        }
        translateRegion(
            graph.scale,
            graph.config,
            graph.svg.select(`.${styles.regionGroup}`)
        );
        translateLineGraph(graph.scale, graph.svg);
        return this;
    }

    /**
     * @inheritDoc
     */
    redraw(graph) {
        clear(graph.svg, this.dataTarget);
        draw(graph.scale, graph.config, graph.svg, this.dataTarget);
        return this;
    }
}

export default Line;
