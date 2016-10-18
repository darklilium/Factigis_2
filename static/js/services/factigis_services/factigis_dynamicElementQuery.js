
//extrae nombre y kva de sed
function factigis_findSedKvaName(sed, callback){

  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_layer_infoSED());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = false;
  qInterruptions.outFields=["*"];
  qInterruptions.where = "codigo=" + sed;

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{

    if(!featureSet.features.length){
      return callback([]);
    }
    console.log(featureSet.features);
    callback(featureSet.features);
  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for folio");
    callback([]);
  });
}

//saca propiedad de rotulo.
function factigis_find(rotulo, callback){

  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_rotulos2());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = false;
  qInterruptions.outFields=["*"];
  qInterruptions.where = "rotulo='" + rotulo  + "'";

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{

    if(!featureSet.features.length){
      return callback([]);
    }
    console.log(featureSet.features);
    callback(featureSet.features);
  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for folio");
    callback([]);
  });
}


export {factigis_findSedKvaName, }
