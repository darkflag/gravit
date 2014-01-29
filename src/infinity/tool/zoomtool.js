(function (_) {
    /**
     * The zoom tool
     * @class GXZoomTool
     * @extends GXTool
     * @constructor
     * @version 1.0
     */
    function GXZoomTool() {
        GXTool.call(this);
    }

    GObject.inherit(GXZoomTool, GXTool);

    /**
     * Global zoom tool options
     * @type {Object}
     * @version 1.0
     */
    GXZoomTool.options = {
        /**
         * The zoom step for zooming in/out. For example,
         * a value of 2.0 doubles the current zoom for each zoom-in
         * and halfs the current zoom for each zoom-out
         * @type {Number}
         * @version 1.0
         */
        zoomStep: 2.0
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXZoomTool
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * -2 = zoom out max, -1 = zoom out, 0 = no zoom, +1 = zoom in, +2 = zoom in max
     * @type {Number}
     * @private
     */
    GXZoomTool.prototype._zoomMode = false;

    /**
     * @type {GRect}
     * @private
     */
    GXZoomTool.prototype._dragArea = null;

    /**
     * @type {Boolean}
     * @private
     */
    GXZoomTool.prototype._dragCanceled = false;

    /** @override */
    GXZoomTool.prototype.getGroup = function () {
        return 'view';
    };

    /** @override */
    GXZoomTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M15.1,31.7l-2.8-2.8c1.2-1.9,1-4.4-0.7-6c-0.9-0.9-2.2-1.4-3.4-1.4c-1.2,0-2.5,0.5-3.4,1.4\n\tc-1.9,1.9-1.9,4.9,0,6.8c0.9,0.9,2.2,1.4,3.4,1.4c0.9,0,1.8-0.3,2.6-0.8l2.8,2.8c0.5,0.5,1.3,0.7,1.7,0.3\n\tC15.8,33,15.7,32.3,15.1,31.7z M5.5,29.1c-0.8-0.7-1.2-1.7-1.2-2.8c0-1.1,0.4-2.1,1.2-2.8s1.7-1.2,2.8-1.2c1.1,0,2.1,0.4,2.8,1.2\n\tc1.5,1.5,1.5,4.1,0,5.6c-0.7,0.7-1.7,1.2-2.8,1.2C7.3,30.3,6.3,29.9,5.5,29.1z"/>\n</svg>\n';
    };

    /** @override */
    GXZoomTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this).setTitle(new GLocale.Key(GXZoomTool, "title"));
    };

    /** @override */
    GXZoomTool.prototype.getActivationCharacters = function () {
        return ['Z'];
    };

    /** @override */
    GXZoomTool.prototype.getCursor = function () {
        switch (this._zoomMode) {
            case -2:
            case -1:
                return GUICursor.ZoomMinus;
            case +1:
            case +2:
                return GUICursor.ZoomPlus;
            default:
                return GUICursor.ZoomNone;
        }
    };

    /** @override */
    GXZoomTool.prototype.activate = function (view, layer) {
        GXTool.prototype.activate.call(this, view, layer);

        this._updateMode();

        layer.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        layer.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        layer.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        layer.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);

        gPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GXZoomTool.prototype.deactivate = function (view, layer) {
        GXTool.prototype.deactivate.call(this, view, layer);

        layer.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        layer.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        layer.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        layer.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);

        gPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GXZoomTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragArea && !this._dragCanceled ? false : true;
    };

    /** @override */
    GXZoomTool.prototype.cancel = function () {
        if (this._dragArea && !this._dragCanceled) {
            this._dragCanceled = true;
            if (!this._hasDragArea()) {
                this.invalidateArea(this._dragArea);
            }
        }
    };

    /** @override */
    GXZoomTool.prototype.paint = function (context) {
        if (!this._dragCanceled && this._hasDragArea()) {
            var x = Math.floor(this._dragArea.getX()) + 0.5;
            var y = Math.floor(this._dragArea.getY()) + 0.5;
            var w = Math.ceil(this._dragArea.getWidth()) - 1.0;
            var h = Math.ceil(this._dragArea.getHeight()) - 1.0;
            context.canvas.strokeRect(x, y, w, h);
        }
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    GXZoomTool.prototype._mouseDragStart = function (event) {
        if (this._zoomMode != 0) {
            this._dragCanceled = false;
        }
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXZoomTool.prototype._mouseDrag = function (event) {
        if (this._zoomMode != 0 && !this._dragCanceled) {
            if (this._hasDragArea()) {
                this.invalidateArea(this._dragArea);
            }

            this._dragArea = GRect.fromPoints(event.clientStart, event.client);

            if (this._hasDragArea()) {
                this.invalidateArea(this._dragArea);
            }
        }
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    GXZoomTool.prototype._mouseDragEnd = function (event) {
        if (this._zoomMode != 0 && !this._dragCanceled) {
            if (this._dragArea && !this._dragArea.isEmpty()) {
                // No need for additional invalidation as we're about to zoom which invalidates everything anyway
                var zoomRect = this._view.getViewTransform().mapRect(this._dragArea);
                this._view.zoomAll(zoomRect, this._zoomMode < 0 /*reverse*/);
                this._updateMode();
            } else if (this._hasDragArea()) {
                this.invalidateArea(this._dragArea);
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Release} event
     * @private
     */
    GXZoomTool.prototype._mouseRelease = function (event) {
        if (!this._dragArea || (this._dragArea && this._dragArea.isEmpty())) {
            var newZoom = null;
            switch (this._zoomMode) {
                case -2:
                    newZoom = GXSceneView.options.minZoomFactor;
                    break;
                case -1:
                    newZoom = this._view.getZoom() / GXZoomTool.options.zoomStep;
                    break;
                case +1:
                    newZoom = this._view.getZoom() * GXZoomTool.options.zoomStep;
                    break;
                case +2:
                    newZoom = GXSceneView.options.maxZoomFactor;
                    break;
                default:
                    break;
            }
            if (newZoom != null) {
                var zoomPoint = this._view.getViewTransform().mapPoint(event.client);
                this._view.zoomAt(zoomPoint, newZoom);
                this._updateMode();
            }
        }
        this._dragArea = null;
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    GXZoomTool.prototype._modifiersChanged = function (event) {
        this._updateMode();
    };

    GXZoomTool.prototype._updateMode = function () {
        var newMode = 0;
        if (gPlatform.modifiers.optionKey) {
            newMode = -1;
            if (gPlatform.modifiers.shiftKey) {
                newMode = -2;
            }
        } else {
            newMode = +1;
            if (gPlatform.modifiers.shiftKey) {
                newMode = +2;
            }
        }

        // Normalize zoom mode
        if (newMode < 0 && this._view.getZoom() <= GXSceneView.options.minZoomFactor) {
            newMode = 0;
        } else if (newMode > 0 && this._view.getZoom() >= GXSceneView.options.maxZoomFactor) {
            newMode = 0;
        }

        if (newMode != this._zoomMode) {
            this._zoomMode = newMode;
            this.updateCursor();
        }
    };

    /**
     * @private
     */
    GXZoomTool.prototype._hasDragArea = function () {
        return (this._dragArea && (this._dragArea.getHeight() > 0 || this._dragArea.getWidth() > 0));
    };

    /** override */
    GXZoomTool.prototype.toString = function () {
        return "[Object GXZoomTool]";
    };

    _.GXZoomTool = GXZoomTool;
})(this);