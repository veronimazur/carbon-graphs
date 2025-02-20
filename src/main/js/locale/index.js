"use strict";
import { default as de } from "./de-DE";
import { default as au } from "./en-AU";
import { default as ca } from "./en-CA";
import { default as gb } from "./en-GB";
import { default as us } from "./en-US";
import { default as es } from "./es-ES";
import { default as fr } from "./fr-FR";
import { default as jp } from "./ja-JP";
import { default as br } from "./pt-BR";

/**
 * Tick format is null for default d3 tick formatting
 * @private
 * @type {null}
 */
export const DEFAULT_TICK_FORMAT = null;
/**
 * `en_US` default locale.
 * Axes revert to this locale if none is provided
 * @private
 * @type {Object}
 */
export const DEFAULT_LOCALE = us;
/**
 * Locale objects serving as a default set. Consumer can provide a set of properties that
 * axes ticks will honor when the locale is set.
 * @public
 * @property {Object} de_DE Carbon locale DE
 * @property {Object} en_AU Carbon locale AU
 * @property {Object} en_CA Carbon locale CA
 * @property {Object} en_GB Carbon locale GB
 * @property {Object} en_US Carbon locale default
 * @property {Object} es_ES Carbon locale ES
 * @property {Object} fr_FR Carbon locale FR
 * @property {Object} pt_BR Carbon locale BR
 * @property {Object} ja_JP Carbon locale JP
 * @type {{de_DE: *, en_AU: *, en_CA: *, en_GB: *, en_US: *, es_ES: *, fr_FR: *, pt_BR: *, ja_JP: *}}
 */
const LOCALE = {
    de_DE: de,
    en_AU: au,
    en_CA: ca,
    en_GB: gb,
    en_US: us,
    es_ES: es,
    fr_FR: fr,
    pt_BR: br,
    ja_JP: jp
};
export default LOCALE;
