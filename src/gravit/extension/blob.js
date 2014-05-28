(function (_) {
    /**
     * The blob base class
     * @param {GStorage} storage the owner storage
     * @param {String} location the location
     * @param {String} name the name
     * @constructor
     * @version 1.0
     */
    function GBlob(storage, location, name) {
        this._storage = storage;
        this._location = location;
        this._name = name;
    };

    /**
     * @type {GStorage}
     * @private
     */
    GBlob.prototype._storage = null;

    /**
     * @type {String}
     * @private
     */
    GBlob.prototype._location = null;

    /**
     * @type {String}
     * @private
     */
    GBlob.prototype._name = null;

    /**
     * Get the underlying storage
     * @returns {GStorage}
     */
    GBlob.prototype.getStorage = function () {
        return this._storage;
    };

    /**
     * Get the underlying location
     * @returns {String}
     */
    GBlob.prototype.getLocation = function () {
        return this._location;
    };

    /**
     * Get the underlying name
     * @returns {String}
     */
    GBlob.prototype.getName = function () {
        return this._name;
    };

    /**
     * Restore the data from the blob
     * @param {Boolean} binary if true, the data is read as binary,
     * otherwise it is read as String
     * @param {Function} callback called with the data restored which
     * is either an ArrayBuffer for binary or a String
     * @return {String}
     */
    GBlob.prototype.restore = function (binary, done) {
        throw new Error('Not Supported.');
    };

    /**
     * Store data into the blob
     * @param {ArrayBuffer|String} data the data to store. If
     * binary is set to true, an ArrayBuffer is expected, otherwise a string
     * @param {Boolean} binary whether the data is binary or not
     * @param {Function} callback called when data was stored
     */
    GBlob.prototype.store = function (data, binary, done) {
        throw new Error('Not Supported.');
    };

    _.GBlob = GBlob;
})(this);
