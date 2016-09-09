import cookieHandler from 'cookie-handler';
import mymap from '../../services/map-service';
import layers from '../../services/layers-service';


function loadCurrentUserData(callback){
  let usrprfl = cookieHandler.get('usrprfl');
  //console.log(usrprfl);
  var qTaskFact = new esri.tasks.QueryTask(layers.read_agregarFactibilidad());
  var qFact = new esri.tasks.Query();
  qFact.where = "Zona= '" + usrprfl.ZONA_USUARIO + "' AND tipo_mejora <>'FACTIBILIDAD DIRECTA' AND Estado_tramite <> 'CERRADA'";
  qFact.returnGeometry = true;
  qFact.outFields = ["*"];
  qTaskFact.execute(qFact, (featureSet)=>{
    if(featureSet.features.length){

      return callback(featureSet.features)
    }else{
    console.log("no hay registros que cargar en la tabla", featureSet.features.length);
      return callback([])
    }

  }, (Errorq)=>{
    //console.log("error en query para obtener factibilidades según zona", comuna)
    return callback([]);

  });
}

function find_folioData(folio, callback){


  var qTaskFact = new esri.tasks.QueryTask(layers.read_agregarFactibilidad());
  var qFact = new esri.tasks.Query();
  qFact.where = "OBJECTID = " + folio ;
  qFact.returnGeometry = false;
  qFact.outFields = ["*"];
  qTaskFact.execute(qFact, (featureSet)=>{
    if(featureSet.features.length){

      return callback(featureSet.features)
    }else{
      //console.log("no hay", featureSet.features.length, comuna);
      return callback([])
    }

  }, (Errorq)=>{
    //console.log("error en query para obtener factibilidades según zona", comuna)
    return callback([]);

  });
}



export {loadCurrentUserData, find_folioData};
