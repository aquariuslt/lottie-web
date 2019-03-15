function ITextElement() {
}

ITextElement.prototype.initElement = function(data, globalData, comp) {
    this.lettersChangedFlag = true;
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.textProperty = new TextProperty(this, data.t, this.dynamicProperties);
    this.textAnimator = new TextAnimatorProperty(data.t, this.renderType, this);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.createRenderableComponents();
    this.createContent();
    this.hide();
    this.textAnimator.searchProperties(this.dynamicProperties);
};

ITextElement.prototype.prepareFrame = function(num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    if (this.textProperty._mdf || this.textProperty._isFirstFrame) {

        this.buildNewText();
        this.textProperty._isFirstFrame = false;
        this.textProperty._mdf = false;
    }
};

ITextElement.prototype.createPathShape = function(matrixHelper, shapes) {
    var j, jLen = shapes.length;
    var k, kLen, pathNodes;
    var shapeStr = '';
    for (j = 0; j < jLen; j += 1) {
        pathNodes = shapes[j].ks.k;
        shapeStr += buildShapeString(pathNodes, pathNodes.i.length, true, matrixHelper);
    }
    return shapeStr;
};

ITextElement.prototype.updateDocumentData = function(newData, index) {
    this.textProperty.updateDocumentData(newData, index);
};

ITextElement.prototype.canResizeFont = function(_canResize) {
    this.textProperty.canResizeFont(_canResize);
};

ITextElement.prototype.setMinimumFontSize = function(_fontSize) {
    this.textProperty.setMinimumFontSize(_fontSize);
};

ITextElement.prototype.applyTextPropertiesToMatrix = function(documentData, matrixHelper, lineNumber, xPos, yPos) {
    // //console.log('===before apply===');
    // matrixHelper.showCurrentPos();
    //console.log('do apply text properties to matrix');
    if (documentData.ps) {
        //console.log('if not do pre translate with x y:', documentData.ps[0], documentData.ps[1], documentData.ascent);
        matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
    }
    matrixHelper.translate(0, -documentData.ls, 0);

    // 因为对Canvas实现了一次居中，所以在transform 之后需要微调
    //console.log('documentData.j:', documentData.j);
    switch (documentData.j) {
        case 1:
            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]), 0, 0);
            break;
        case 2:
            ////console.log('translate x to make center:', documentData.justifyOffset, documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]) / 2);
            // //console.log('line widths:', documentData.lineWidths[lineNumber]);
            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]) / 2, 0, 0);
            break;
    }
    // //console.log(xPos, yPos);
    matrixHelper.translate(xPos, yPos, 0);
    // //console.log('===after apply===');
    // //console.log('current point position:', matrixHelper);
};

ITextElement.prototype.buildColor = function(colorData) {
    return 'rgb(' + Math.round(colorData[0] * 255) + ',' + Math.round(colorData[1] * 255) + ',' + Math.round(colorData[2] * 255) + ')';
};

ITextElement.prototype.emptyProp = new LetterProps();

ITextElement.prototype.destroy = function() {

};
