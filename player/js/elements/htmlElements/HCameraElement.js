function HCameraElement(data,globalData,comp){
    this.initFrame();
    this.initBaseData(data,globalData,comp);
    this.initHierarchy();
    var getProp = PropertyFactory.getProp;
    this.pe = getProp(this,data.pe,0,0,this);
    if(data.ks.p.s){
        this.px = getProp(this,data.ks.p.x,1,0,this);
        this.py = getProp(this,data.ks.p.y,1,0,this);
        this.pz = getProp(this,data.ks.p.z,1,0,this);
    }else{
        this.p = getProp(this,data.ks.p,1,0,this);
    }
    if(data.ks.a){
        this.a = getProp(this,data.ks.a,1,0,this);
    }
    if(data.ks.or.k.length && data.ks.or.k[0].to){
        var i,len = data.ks.or.k.length;
        for(i=0;i<len;i+=1){
            data.ks.or.k[i].to = null;
            data.ks.or.k[i].ti = null;
        }
    }
    this.or = getProp(this,data.ks.or,1,degToRads,this);
    this.or.sh = true;
    this.rx = getProp(this,data.ks.rx,0,degToRads,this);
    this.ry = getProp(this,data.ks.ry,0,degToRads,this);
    this.rz = getProp(this,data.ks.rz,0,degToRads,this);
    this.mat = new Matrix();
    this._prevMat = new Matrix();
    this._isFirstFrame = true;

    // TODO: find a better way to make the HCamera element to be compatible with the LayerInterface and TransformInterface.
    this.finalTransform = {
        mProp: this
    };
    console.log('camera layer data:', data);
    console.log('data.or:', data.ks.or);
    console.log('prop.or:', this.or);
}
extendPrototype([BaseElement, FrameElement, HierarchyElement], HCameraElement);

HCameraElement.prototype.setup = function() {
    var i, len = this.comp.threeDElements.length, comp;
    for(i=0;i<len;i+=1){
        //[perspectiveElem,container]
        comp = this.comp.threeDElements[i];
        if(comp.type === '3d') {
            comp.perspectiveElem.style.perspective = comp.perspectiveElem.style.webkitPerspective = this.pe.v+'px';
            comp.container.style.transformOrigin = comp.container.style.mozTransformOrigin = comp.container.style.webkitTransformOrigin = "0px 0px 0px";
            comp.perspectiveElem.style.transform = comp.perspectiveElem.style.webkitTransform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
        }
    }
};

HCameraElement.prototype.createElements = function(){
};

HCameraElement.prototype.hide = function(){
};

HCameraElement.prototype.renderFrame = function(){
    var _mdf = this._isFirstFrame;
    var i, len;
    if(this.hierarchy){
        len = this.hierarchy.length;
        for(i=0;i<len;i+=1){
            _mdf = this.hierarchy[i].finalTransform.mProp._mdf || _mdf;
        }
    }
    if(_mdf || this.pe._mdf || (this.p && this.p._mdf) || (this.px && (this.px._mdf || this.py._mdf || this.pz._mdf)) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or._mdf || (this.a && this.a._mdf)) {
        this.mat.reset();

        if(this.hierarchy){
            var mat;
            len = this.hierarchy.length - 1;
            for (i = len; i >= 0; i -= 1) {
                /*mat = this.hierarchy[i].finalTransform.mProp.v.props;
                //console.log(mat)
                this.mat.transform(-mat[0],-mat[1],-mat[2],-mat[3],-mat[4],-mat[5],-mat[6],-mat[7],-mat[8],-mat[9],-mat[10],-mat[11],-mat[12],-mat[13],-mat[14],mat[15]);
                //console.log(this.mat.props)*/
                var mTransf = this.hierarchy[i].finalTransform.mProp;
                this.mat.translate(-mTransf.p.v[0],-mTransf.p.v[1],mTransf.p.v[2]);
                this.mat.rotateX(-mTransf.or.v[0]).rotateY(-mTransf.or.v[1]).rotateZ(mTransf.or.v[2]);
                this.mat.rotateX(-mTransf.rx.v).rotateY(-mTransf.ry.v).rotateZ(mTransf.rz.v);
                this.mat.scale(1/mTransf.s.v[0],1/mTransf.s.v[1],1/mTransf.s.v[2]);
                this.mat.translate(mTransf.a.v[0],mTransf.a.v[1],mTransf.a.v[2]);
            }
        }


        if(this.p){
            // console.log('start render camera frame with calculated position :', this.p);
            // console.log('step 1. matrix translate:',-this.p.v[0],-this.p.v[1],this.p.v[2]);
            this.mat.translate(-this.p.v[0],-this.p.v[1],this.p.v[2]);
        }else{
            // console.log('matrix translate without p:',-this.px.v,-this.py.v,this.pz.v)
            this.mat.translate(-this.px.v,-this.py.v,this.pz.v);
        }
        if(this.a){
            // console.log('step 2. matrix transform with animation:', this.a.v);
            var diffVector = [this.p.v[0]-this.a.v[0],this.p.v[1]-this.a.v[1],this.p.v[2]-this.a.v[2]];
            // console.log('step 2 diffVector:', diffVector);
            var mag = Math.sqrt(Math.pow(diffVector[0],2)+Math.pow(diffVector[1],2)+Math.pow(diffVector[2],2));
            // console.log('step 2 mag:', mag);
            //var lookDir = getNormalizedPoint(getDiffVector(this.a.v,this.p.v));
            var lookDir = [diffVector[0]/mag,diffVector[1]/mag,diffVector[2]/mag]; // lootAt direction
            var lookLengthOnXZ = Math.sqrt( lookDir[2]*lookDir[2] + lookDir[0]*lookDir[0] );
            var m_rotationX = (Math.atan2( lookDir[1], lookLengthOnXZ ));
            var m_rotationY = (Math.atan2( lookDir[0], -lookDir[2]));
            // console.log('step 2 lookDir:', lookDir, 'lookLengthOnXZ:', lookLengthOnXZ, 'm_rotationX:',m_rotationX, 'm_rotationY:', m_rotationY);
            this.mat.rotateY(m_rotationY).rotateX(-m_rotationX);
        }
        this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
        // console.log('step 3 do rotation xyz:',-this.rx.v,-this.ry.v,this.rz.v);
        this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]);
        // this.mat.rotateX(-this.or.pv[0]*this.or.mult).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]);
        console.log('step 3 do orientation xyz:',-this.or.v[0],-this.or.v[1],this.or.v[2]);
        console.log(this.mat.toConsole());
        if(!window.ortemp){
            window.ortemp = {};
        }
        window.ortemp[window.renderFrameId] =[-this.or.v[0],-this.or.v[1],this.or.v[2]];

        // console.log('step 3 check or:', this.or.pv, this.or.mult);
        this.mat.translate(this.globalData.compSize.w/2,this.globalData.compSize.h/2,0);
        // console.log('step 3 do translate with globalCompositeSize:',this.globalData.compSize.w/2,this.globalData.compSize.h/2,0);
        this.mat.translate(0,0,this.pe.v);
        // console.log('step 3.5 do translate with pe.v?:', 0,0,this.pe.v);



        var hasMatrixChanged = !this._prevMat.equals(this.mat);
        if((hasMatrixChanged || this.pe._mdf) && this.comp.threeDElements) {
            len = this.comp.threeDElements.length;
            var comp;
            for(i=0;i<len;i+=1){
                comp = this.comp.threeDElements[i];
                if(comp.type === '3d') {
                    if(hasMatrixChanged) {
                        comp.container.style.transform = comp.container.style.webkitTransform = this.mat.toCSS();
                    }
                    if(this.pe._mdf) {
                        comp.perspectiveElem.style.perspective = comp.perspectiveElem.style.webkitPerspective = this.pe.v+'px';
                    }
                }
            }
            this.mat.clone(this._prevMat);
        }
    }
    this._isFirstFrame = false;
};

HCameraElement.prototype.prepareFrame = function(num) {
    this.prepareProperties(num, true);
};

HCameraElement.prototype.destroy = function(){
};
HCameraElement.prototype.getBaseElement = function(){return null;};
