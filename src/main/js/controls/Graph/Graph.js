"use strict";
import d3 from "d3";
import Construct from "../../core/Construct";
import {
    calculateAxesLabelSize,
    calculateAxesSize,
    createAxes,
    createAxisReferenceLine,
    createXAxisInfoRow,
    getAxesDataRange,
    getYAxisHeight
} from "../../helpers/axis";
import constants, { AXIS_TYPE } from "../../helpers/constants";
import errors from "../../helpers/errors";
import { createLegend } from "../../helpers/legend";
import { createRegionContainer } from "../../helpers/region";
import styles from "../../helpers/styles";
import GraphConfig, { processInput, validateContent } from "./GraphConfig";
import utils from "../../helpers/utils";
import { createDateline, redrawDatelineContent } from "../../helpers/dateline";
import {
    attachEventHandlers,
    createContentContainer,
    createDefs,
    createGrid,
    createLabel,
    d3RemoveElement,
    detachEventHandlers,
    determineHeight,
    scaleGraph,
    setAxisPadding,
    translateGraph,
    updateAxesDomain
} from "./helpers/helpers";

/**
 * @typedef {Object} Graph
 * @typedef {Object} GraphConfig
 */

const BASE_CANVAS_WIDTH_PADDING = constants.BASE_CANVAS_WIDTH_PADDING;
/**
 * Sets the canvas width
 * @private
 * @param {HTMLElement} container - d3 HTML element object which forms the chart container
 * @param {Object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasWidth = (container, config) => {
    config.canvasWidth = parseInt(container.style("width"), 10);
};

/**
 * Sets the canvas width. Canvas rests within a container.
 * On resize, the canvas is subjected to resizing but its sibling: Legend isnt.
 * @private
 * @param {Object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasHeight = (config) => {
    config.canvasHeight =
        getYAxisHeight(config) +
        (config.padding.bottom +
            config.padding.top +
            config.axisLabelHeights.x) *
            2;
};
/**
 * Checks if the min max range of the values have changed or otherwise
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {string} yAxis - y or y2
 * @returns {boolean} true if min-max range changed
 */
const isRangeModified = (config, yAxis = constants.Y_AXIS) =>
    config.axis[yAxis].dataRange.isRangeModified;
/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @throws {module:errors.THROW_MSG_NO_AXES_DATA_LOADED}
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new GraphConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();
/**
 * Executes the before init process checklist, needs to be called by parent control.
 *  Binds the chart id provided in the input JSON to graph container.
 *  Calculates the axes data ranges.
 *  Updates the axes domains.
 * @private
 * @param {Graph} control - Graph instance
 * @returns {Graph} Graph instance
 */
const beforeInit = (control) => {
    control.graphContainer = d3.select(control.config.bindTo);
    getAxesDataRange({}, "", control.config);
    updateAxesDomain(control.config);
    return control;
};

/**
 * Initializes the necessary Graph constructor objects
 * @private
 * @param {Graph} control - Graph instance
 * @returns {Graph} Graph instance
 */
const initConfig = (control) => {
    control.graphContainer = null;
    control.config = {
        axis: {
            x: {},
            y: {},
            y2: {}
        },
        shownTargets: {},
        dateline: []
    };
    control.axis = {
        axisInfoRow: {
            x: {}
        }
    };
    control.scale = {};
    control.svg = null;
    control.legendSVG = null;
    control.axesLabelShapeGroup = {};
    control.content = [];
    control.contentTargets = [];
    control.resizeHandler = null;
    return control;
};

/**
 * Executes the init process checklist, needs to be called by parent control.
 * Needs to be called post calling beforeInit
 *  Sets the canvas width within the graph container
 *  Determines the height for canvas
 *  Calculates Axes width and height
 *  Calculates Axes label width and height, positioning
 *  Creates and sets the d3 scale for the Graph
 * @private
 * @param {Graph} control - Graph instance
 * @returns {Graph} Graph instance
 */
const init = (control) => {
    control.config.height = determineHeight(
        control.config,
        control.config.dimension
    );
    setCanvasWidth(control.graphContainer, control.config);
    calculateAxesSize(control.config);
    calculateAxesLabelSize(control.config);
    setCanvasHeight(control.config);
    scaleGraph(control.scale, control.config);
    return control;
};

/**
 * A common API used to plot everything except the datapoints and legend themselves.
 * * Axes - X, Y and optional Y2 axis
 * * Grid - Horizontal and vertical
 * * X,Y,Y2 Axis ticks
 * * Axes Labels
 *
 * Lifecycle functions include:
 *  * BeforeInit
 *  * Init
 *  * Render
 *  * AfterInit
 * @module Graph
 * @class Graph
 */
class Graph extends Construct {
    /**
     * @constructor
     * @param {GraphConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        initConfig(this);
        this.generate(input);
    }

    /**
     * Draw function that is called by the parent control. This draws the Axes, grid, legend and
     * labels for the chart construct.
     * @description Since we dont have the concept of z-index in visualization,
     * the order of rendering should be following:
     *  * SVG container
     *  * Reference ranges
     *  * Grid
     *  * X-Axis
     *  * Y-Axes
     *  * Labels
     *  * Legend
     *  * Reference line when Y Axis shows/pads negative values
     *  * Data [In our case we have load and unload]
     * @param {Object} input - Input JSON
     * @returns {d3.selection} d3 selection node of svg.
     */
    generate(input) {
        this.config = loadInput(input);
        processInput(input, this.config, this.config.axis.x.type);
        beforeInit(this);
        init(this);
        const containerSVG = d3
            .select(this.config.bindTo)
            .append("div")
            .classed(styles.container, true);
        this.svg = containerSVG
            .insert("svg", ":first-child")
            .classed(styles.canvas, true)
            .attr("role", "img")
            .attr("height", this.config.canvasHeight)
            .attr(
                "width",
                this.config.padding.hasCustomPadding
                    ? this.config.canvasWidth
                    : this.config.canvasWidth - BASE_CANVAS_WIDTH_PADDING
            );
        createDefs(this.config, this.svg);
        createRegionContainer(this.config, this.svg);
        createGrid(this.axis, this.scale, this.config, this.svg);
        createContentContainer(this.config, this.svg);
        createAxes(this.axis, this.scale, this.config, this.svg);
        createXAxisInfoRow(this.axis, this.scale, this.config, this.svg);
        createLabel(this.config, this.svg, this);
        createAxisReferenceLine(this.axis, this.scale, this.config, this.svg);
        if (
            utils.notEmpty(this.config.dateline) &&
            this.config.axis.x.type === AXIS_TYPE.TIME_SERIES
        ) {
            createDateline(this.scale, this.config, this.svg);
        }
        if (this.config.showLegend) {
            /*
            If the consumer doesn't wish to show legend item then they can pass blank.
            The legend item wont be rendered at that point.
            The consumer can also choose to render legend into another container
            using "bindLegendTo" property
            */
            this.legendSVG = createLegend(
                this.config.bindLegendTo
                    ? d3.select(this.config.bindLegendTo)
                    : containerSVG
            );
        }
        attachEventHandlers(this);
        return this.svg;
    }

    /**
     * Resizes the graph canvas. Uses the clipPath def.
     * It scales the graph on resize, and translates the graph elements:
     *  Axes
     *  Grid
     *  Labels
     *  @returns {Graph} - Graph instance
     */
    resize() {
        setCanvasWidth(this.graphContainer, this.config);
        scaleGraph(this.scale, this.config);
        translateGraph(this);
        this.content.forEach((control) => control.resize(this));
        return this;
    }

    /**
     * Loads the content onto the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     * @param {Object} content - Graph content
     * @returns {Graph} - Graph instance
     */
    loadContent(content) {
        validateContent(this.content, content);
        this.content.push(content);
        this.contentTargets.push(content.config);
        setAxisPadding(this.config.axisPadding, content);
        getAxesDataRange(
            content,
            content.config.yAxis,
            this.config,
            this.content
        );
        if (isRangeModified(this.config, content.config.yAxis)) {
            updateAxesDomain(this.config, content);
        }
        content.load(this);
        if (
            utils.notEmpty(this.config.dateline) &&
            this.config.axis.x.type === AXIS_TYPE.TIME_SERIES
        ) {
            redrawDatelineContent(this.scale, this.config, this.svg);
        }
        this.resize();
        return this;
    }

    /**
     * Unloads the content from the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     * @param {Object} content - Graph content to be removed
     * @returns {Graph} - Graph instance
     */
    unloadContent(content) {
        const index = this.content.indexOf(content);
        if (index < 0) {
            throw new Error(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        }
        this.content.splice(index, 1);
        this.contentTargets.splice(index, 1);
        content.unload(this);
        this.resize();
        return this;
    }

    /**
     * Destroys the graph: Container and canvas.
     * @returns {Graph} - Graph instance
     */
    destroy() {
        detachEventHandlers(this);
        d3RemoveElement(this.graphContainer, `.${styles.canvas}`);
        d3RemoveElement(this.graphContainer, `.${styles.container}`);
        initConfig(this);
        return this;
    }
}

export default Graph;
