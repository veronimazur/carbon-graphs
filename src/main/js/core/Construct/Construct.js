"use strict";
import errors from "../../helpers/errors";

/**
 * The base construct interface from which all graphs can inherit.
 * Charts like:
 * * Graph API
 * * c3 graph abstractions
 * @interface
 * @class Construct
 */
export default class Construct {
    /**
     * Uses the input JSON for generating a graph.
     * Draw function that is called by the parent control. This draws the Axes, grid, legend and
     * labels for the chart construct.
     * @abstract
     * @function Construct#generate
     * @throws {module:errors.THROW_MSG_CONSTRUCT_GENERATE_NOT_IMPLEMENTED}
     * @param {Object} input - Input JSON
     * @returns {Object} - inherited class instance
     */
    generate(input) {
        throw new Error(errors.THROW_MSG_CONSTRUCT_GENERATE_NOT_IMPLEMENTED);
    }

    /**
     * Load a content onto the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     * @abstract
     * @function Construct#loadContent
     * @throws {module:errors.THROW_MSG_CONSTRUCT_LOAD_NOT_IMPLEMENTED}
     * @param {Object} graphContent - Graph content
     * @returns {Object} - inherited class instance
     */
    loadContent(graphContent) {
        throw new Error(errors.THROW_MSG_CONSTRUCT_LOAD_NOT_IMPLEMENTED);
    }

    /**
     * Remove a Content from the chart.
     * @abstract
     * @function Construct#unloadContent
     * @throws {module:errors.THROW_MSG_CONSTRUCT_UNLOAD_NOT_IMPLEMENTED}
     * @param {Object} graphContent - Graph content
     * @returns {Object} - inherited class instance
     */
    unloadContent(graphContent) {
        throw new Error(errors.THROW_MSG_CONSTRUCT_UNLOAD_NOT_IMPLEMENTED);
    }

    /**
     * Resizes the graph based on window resize event.
     * @abstract
     * @function Construct#resize
     * @throws {module:errors.THROW_MSG_CONSTRUCT_RESIZE_NOT_IMPLEMENTED}
     * @returns {Object} - inherited class instance
     */
    resize() {
        throw new Error(errors.THROW_MSG_CONSTRUCT_RESIZE_NOT_IMPLEMENTED);
    }

    /**
     * Destroys the graph.
     * @abstract
     * @function Construct#destroy
     * @throws {module:errors.THROW_MSG_CONSTRUCT_DESTROY_NOT_IMPLEMENTED}
     * @returns {Object} - inherited class instance
     */
    destroy() {
        throw new Error(errors.THROW_MSG_CONSTRUCT_DESTROY_NOT_IMPLEMENTED);
    }
}
