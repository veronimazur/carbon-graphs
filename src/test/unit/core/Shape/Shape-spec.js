"use strict";
import sinon from "sinon";
import { Shape } from "../../../../main/js/core";
import { getDefaultSVGProps } from "../../../../main/js/core/Shape";
import constants, { SHAPES } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { toNumber } from "../../controls/helpers/commonHelpers";

describe("Shape", () => {
    it("returns path for Carbon Native shapes", () => {
        Object.keys(SHAPES).forEach((i) => {
            const shapeSVG = new Shape(SHAPES[i]).getShapeElement();
            const shapePath = shapeSVG.childNodes[0];
            expect(shapeSVG.nodeName === "svg").toBeTruthy();
            expect(
                toNumber(shapeSVG.getAttribute("x")) === SHAPES[i].options.x
            ).toBeTruthy();
            expect(
                toNumber(shapeSVG.getAttribute("y")) === SHAPES[i].options.y
            ).toBeTruthy();
            expect(shapeSVG.classList.contains(styles.svgIcon)).toBeTruthy();
            expect(shapeSVG.getAttribute("role") === "img").toBeTruthy();
            expect(shapePath.nodeName === "path").toBeTruthy();
            expect(
                shapePath.getAttribute("d") === SHAPES[i].path.d
            ).toBeTruthy();
        });
    });
    it("returns path for custom shape", () => {
        const customShape = {
            path: {
                d: "SOME_CUSTOM_PATH"
            },
            options: { x: -15, y: -15, scale: 0.28 }
        };
        const shapeSVG = new Shape(customShape).getShapeElement();
        const shapePath = shapeSVG.childNodes[0];
        expect(shapeSVG.nodeName === "svg").toBeTruthy();
        expect(
            toNumber(shapeSVG.getAttribute("x")) === customShape.options.x
        ).toBeTruthy();
        expect(
            toNumber(shapeSVG.getAttribute("y")) === customShape.options.y
        ).toBeTruthy();
        expect(shapeSVG.classList.contains(styles.svgIcon)).toBeTruthy();
        expect(shapeSVG.getAttribute("role") === "img").toBeTruthy();
        expect(shapePath.nodeName === "path").toBeTruthy();
        expect(shapePath.getAttribute("d") === customShape.path.d).toBeTruthy();
    });
    it("returns path for custom shape with attributes", () => {
        const customShape = {
            path: {
                d: "SOME_CUSTOM_PATH",
                id: "uid_1",
                class: "path-style"
            },
            options: { x: -15, y: -15, scale: 0.28 }
        };
        const shapeSVG = new Shape(customShape).getShapeElement();
        const shapePath = shapeSVG.childNodes[0];
        expect(shapePath.nodeName === "path").toBeTruthy();
        expect(shapePath.getAttribute("d") === customShape.path.d).toBeTruthy();
        expect(
            shapePath.getAttribute("id") === customShape.path.id
        ).toBeTruthy();
        expect(shapePath.classList).toContain(customShape.path.class);
    });
    it("returns paths for custom shape with multiple paths", () => {
        const customShape = {
            path: [
                {
                    d: "SOME_CUSTOM_PATH",
                    fill: "#000"
                },
                {
                    d: "SOME_CUSTOM_PATH 2",
                    fill: "#FFFFFF"
                }
            ],
            options: { x: -15, y: -15, scale: 0.28 }
        };
        const shapeSVG = new Shape(customShape).getShapeElement();
        const shapePathObj1 = shapeSVG.childNodes[0];
        const shapePathObj2 = shapeSVG.childNodes[1];
        expect(shapeSVG.nodeName === "svg").toBeTruthy();
        expect(
            toNumber(shapeSVG.getAttribute("x")) === customShape.options.x
        ).toBeTruthy();
        expect(
            toNumber(shapeSVG.getAttribute("y")) === customShape.options.y
        ).toBeTruthy();
        expect(shapeSVG.classList.contains(styles.svgIcon)).toBeTruthy();
        expect(shapeSVG.getAttribute("role") === "img").toBeTruthy();
        expect(shapePathObj1.nodeName === "path").toBeTruthy();
        expect(
            shapePathObj1.getAttribute("d") === customShape.path[0].d
        ).toBeTruthy();
        expect(
            shapePathObj1.getAttribute("fill") === customShape.path[0].fill
        ).toBeTruthy();
        expect(shapePathObj2.nodeName === "path").toBeTruthy();
        expect(
            shapePathObj2.getAttribute("d") === customShape.path[1].d
        ).toBeTruthy();
        expect(
            shapePathObj2.getAttribute("fill") === customShape.path[1].fill
        ).toBeTruthy();
    });
    it("applies a11y attributes to SVG", () => {
        const customShape = {
            path: {
                d: "SOME_CUSTOM_PATH"
            },
            options: { x: -15, y: -15, scale: 0.28 }
        };
        const shapeSVG = new Shape(customShape).getShapeElement(
            getDefaultSVGProps({
                a11yAttributes: {
                    "aria-hidden": false,
                    "aria-describedby": "uid_1"
                }
            })
        );
        expect(shapeSVG.nodeName === "svg").toBeTruthy();
        expect(shapeSVG.getAttribute("aria-hidden")).toBe("false");
        expect(shapeSVG.getAttribute("aria-describedby")).toBe("uid_1");
    });
    it("applies viewBox attribute to SVG", () => {
        const customShape = {
            path: {
                d: "SOME_CUSTOM_PATH"
            },
            options: { x: -15, y: -15, scale: 0.28 }
        };
        const shapeSVG = new Shape(customShape).getShapeElement(
            getDefaultSVGProps(),
            true
        );
        expect(shapeSVG.nodeName === "svg").toBeTruthy();
        expect(shapeSVG.getAttribute("viewBox")).toBe(constants.VIEW_BOX_SIZE);
    });
    it("applies transform attributes to all SVG paths", () => {
        const transformHandlerSpy = sinon.spy();
        const customShape = {
            path: [
                {
                    d: "SOME_CUSTOM_PATH"
                },
                {
                    d: "SOME_CUSTOM_PATH 2"
                }
            ],
            options: { x: -15, y: -15, scale: 0.28 }
        };
        const shapeSVG = new Shape(customShape).getShapeElement(
            getDefaultSVGProps({ transformFn: transformHandlerSpy })
        );
        expect(shapeSVG.nodeName === "svg").toBeTruthy();
        expect(transformHandlerSpy.calledTwice).toBeTruthy();
    });
    it("applies transform attributes to all SVG paths", () => {
        const transformHandlerSpy = sinon.spy();
        const customShape = {
            path: [
                {
                    d: "SOME_CUSTOM_PATH"
                },
                {
                    d: "SOME_CUSTOM_PATH 2"
                }
            ],
            options: { x: -15, y: -15, scale: 0.28 }
        };
        const shapeSVG = new Shape(customShape).getShapeElement(
            getDefaultSVGProps({ transformFn: transformHandlerSpy })
        );
        expect(shapeSVG.nodeName === "svg").toBeTruthy();
        expect(transformHandlerSpy.calledTwice).toBeTruthy();
    });
    describe("Moveto path", () => {
        it("tear drop", () => {
            const shapeSVG = new Shape(SHAPES.TEAR_DROP).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(
                SHAPES.TEAR_DROP.path.d
            );
        });
        it("tear drop alternate", () => {
            const shapeSVG = new Shape(SHAPES.TEAR_ALT).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(
                SHAPES.TEAR_ALT.path.d
            );
        });
        it("triangle alternate", () => {
            const shapeSVG = new Shape(SHAPES.TRIANGLE_DOWN).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(
                SHAPES.TRIANGLE_DOWN.path.d
            );
        });
        it("triangle", () => {
            const shapeSVG = new Shape(SHAPES.TRIANGLE).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(
                SHAPES.TRIANGLE.path.d
            );
        });
        it("x shape", () => {
            const shapeSVG = new Shape(SHAPES.X).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(SHAPES.X.path.d);
        });
        it("rhombus shape", () => {
            const shapeSVG = new Shape(SHAPES.RHOMBUS).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(
                SHAPES.RHOMBUS.path.d
            );
        });
        it("vertical bar shape", () => {
            const shapeSVG = new Shape(SHAPES.VERTICAL_BAR).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(
                SHAPES.VERTICAL_BAR.path.d
            );
        });
        it("square shape", () => {
            const shapeSVG = new Shape(SHAPES.SQUARE).getShapeElement();
            expect(shapeSVG.firstChild.getAttribute("d")).toBe(
                SHAPES.SQUARE.path.d
            );
        });
    });
    describe("Validates a shape", () => {
        it("throws error if path is empty", () => {
            expect(() => {
                new Shape({}).getShapeElement();
            }).toThrowError(errors.THROW_MSG_SHAPE_PATH_EMPTY);
        });
        it("throws error if options is empty", () => {
            expect(() => {
                new Shape({
                    path: {
                        d: "DUMMY"
                    }
                }).getShapeElement();
            }).toThrowError(errors.THROW_MSG_SHAPE_OPTIONS_EMPTY);
        });
        it("throws error if options properties are empty", () => {
            expect(() => {
                new Shape({
                    path: {
                        d: "DUMMY"
                    },
                    options: { oops: null }
                }).getShapeElement();
            }).toThrowError(errors.THROW_MSG_SHAPE_OPTIONS_PROPERTY_INVALID);
            expect(() => {
                new Shape({
                    path: {
                        d: "DUMMY"
                    },
                    options: { x: 10 }
                }).getShapeElement();
            }).toThrowError(errors.THROW_MSG_SHAPE_OPTIONS_PROPERTY_INVALID);
            expect(() => {
                new Shape({
                    path: {
                        d: "DUMMY"
                    },
                    options: { x: 10, y: 10 }
                }).getShapeElement();
            }).toThrowError(errors.THROW_MSG_SHAPE_OPTIONS_PROPERTY_INVALID);
            expect(() => {
                new Shape({
                    path: {
                        d: "DUMMY"
                    },
                    options: { x: 10, y: 10, scale: 2 }
                }).getShapeElement();
            }).not.toThrowError(
                errors.THROW_MSG_SHAPE_OPTIONS_PROPERTY_INVALID
            );
        });
    });
});
