import layers from '../../services/layers-service';
import token from '../../services/token-service';

function crearRectangulo(geometry,delta){
  var rectangulo = new esri.geometry.Polygon(new esri.SpatialReference(geometry.spatialReference));
    rectangulo.addRing([ [geometry.x-1,geometry.y-1],[geometry.x-1,geometry.y+1],[geometry.x+1,geometry.y+1],[geometry.x+1,geometry.y-1],[geometry.x-1,geometry.y-1] ])

		return rectangulo;
}

function factigis_findDireccion(geometry,callback){

  var myRectangulo = crearRectangulo(geometry,1);
  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_direcciones());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["id_direccion","nombre_calle","numero"];
  qInterruptions.geometry = myRectangulo;
  qInterruptions.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{
    console.log(featureSet.features.length);
    if(!featureSet.features.length){
      return callback([]);
    }
    callback(featureSet.features);
  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for direccion");
    callback([]);
  });
}

function factigis_findRotulo(geometry,callback){

  var myRectangulo = crearRectangulo(geometry,1);
  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_rotulos2());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["*"];
  qInterruptions.geometry = myRectangulo;
  qInterruptions.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
  qInterruptions.where = "tipo_nodo = 'ele!poste' or tipo_nodo='ele!camara'";
  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{
    if(!featureSet.features.length){
      return callback([]);
    }
    callback(featureSet.features);
  }, (Errorq)=>{
    console.log("Error doing query for rotulos");
    callback([]);
  });
}

function factigis_findTramoBT(geometry, callback){
  console.log("buscando en bt");
  var myRectangulo = crearRectangulo(geometry,1);
  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_chqTramosBT());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["*"];
  qInterruptions.geometry = myRectangulo;
  qInterruptions.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{
    if(!featureSet.features.length){
      return callback([]);
    }
    return callback(featureSet.features);


  }, (Errorq)=>{
    console.log("Error doing query for tramos bt");
    return callback([]);
  });
}

function factigis_findTramoMT(geometry,callback){
  console.log("buscando en mt");
  var myRectangulo = crearRectangulo(geometry,1);
  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_chqTramosMT());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["*"];
  qInterruptions.geometry = myRectangulo;
  qInterruptions.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{
    if(!featureSet.features.length){
      return callback([]);
    }
    return callback(featureSet.features);

    //  console.log("en mt encontre:",featureSet);
  }, (Errorq)=>{
    console.log("Error doing query for tramos mt");
     return callback([]);
  });
}

function factigis_findTramo(geometry, callback){
  console.log(geometry,"esto es lo que tengo.");

  //BUSCAR EN BT PRIMERO
    console.log("buscando en bt...");
    var btFound = factigis_findTramoBT(geometry, bt=>{

      // si no hay en bt :
      if(!bt.length){
        //buscar en mt
        var mtFound = factigis_findTramoMT(geometry, mt=>{

          if(!mt.length){
            console.log("no hay nada en mt ni bt");
          }else{
            console.log("esto encontre en mt", mt);
            let redMT = [];
            redMT.descripcion = mt[0].attributes['ARCGIS.DBO.Tramos_MT_006.descripcion'];
            redMT.tension = mt[0].attributes['ARCGIS.DBO.Cabeceras_006.tension'];

            return callback(redMT);
          }
        });

      // si hay en bt
      }else{
        console.log("encontre en bt esto: ", bt);
        let redBT = [];
        redBT.descripcion = bt[0].attributes['descripcion'];
        redBT.tension = 'N/A';
        return callback(redBT);
      }

    });





}

function factigis_findCalle(geometry,callback){

  var myRectangulo = crearRectangulo(geometry,10);
  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_calles());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["OBJECTID","nombre"];
  qInterruptions.geometry = myRectangulo;
  qInterruptions.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{
    if(!featureSet.features.length){
      return callback([]);
    }
    callback(featureSet.features);
  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for direccion");
    callback([]);
  });
}

function factigis_findNewDireccion(geometry, callback){
  var myRectangulo = crearRectangulo(geometry,1);
  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_direccionesNuevasQuery());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["*"];
  qInterruptions.geometry = myRectangulo;
  qInterruptions.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{
    console.log("EN NEW",featureSet.features.length);
    if(!featureSet.features.length){
      return callback([]);
    }
    callback(featureSet.features);
  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for new direccion");
    callback([]);
  });

}

function factigis_findComuna(geometry, callback){
  var myRectangulo = crearRectangulo(geometry,1);
  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_comuna());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["*"];
  qInterruptions.geometry = myRectangulo;
  qInterruptions.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;

  qTaskInterruptions.execute(qInterruptions, (featureSet)=>{
    console.log(featureSet.features.length);
    if(!featureSet.features.length){
      return callback([]);
    }
    callback(featureSet.features);
  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for comuna");
    callback([]);
  });
}

function factigis_findFolio(folio, callback){

  var qTaskInterruptions = new esri.tasks.QueryTask(layers.read_agregarFactibilidad());
  var qInterruptions = new esri.tasks.Query();

  qInterruptions.returnGeometry = true;
  qInterruptions.outFields=["*"];
  qInterruptions.where = "OBJECTID =" + folio

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


export {factigis_findDireccion, factigis_findRotulo,factigis_findCalle, factigis_findNewDireccion,factigis_findTramo, factigis_findComuna, factigis_findFolio};