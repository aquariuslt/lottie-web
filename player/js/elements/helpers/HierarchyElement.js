/**
 * @file
 * Handles AE's layer parenting property.
 *
 */

function HierarchyElement() {
}

HierarchyElement.prototype = {
    /**
     * @function
     * Initializes hierarchy properties
     *
     */
    initHierarchy: function() {
        //element's parent list
        this.hierarchy = [];
        //if element is parent of another layer _isParent will be true
        this._isParent = false;
        this.checkParenting();
    },
    /**
     * @function
     * Sets layer's hierarchy.
     * @param {array} hierarchy
     * layer's parent list
     *
     */
    setHierarchy: function(hierarchy) {
        this.hierarchy = hierarchy;
    },
    /**
     * @function
     * Sets layer as parent.
     *
     */
    setAsParent: function() {
        this._isParent = true;
    },
    /**
     * @function
     * Searches layer's parenting chain
     * @notes
	 	 * 这里开始集成父节点属性
     */
    checkParenting: function() {
        if (this.data.parent !== undefined) {
            //console.log('check parenting from hierachy element:', this.data.parent);
            this.comp.buildElementParenting(this, this.data.parent, []);
        }
    }
};
