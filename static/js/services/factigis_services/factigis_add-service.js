import {getDetailsForPotencia} from '../../services/factigis_services/factigis_potenciaEmpalmes';
import token from '../../services/token-service';
import {factigis_findSEP} from '../../services/factigis_services/factigis_find-service';
import createQueryTask from '../../../js/services/createquerytask-service';
import layers from '../../services/layers-service';
import exportGraphicsToPDF from '../../services/factigis_services/factigis_exportToPdf';
import cookieHandler from 'cookie-handler';
import _ from 'lodash';


/* Potencia disponible = kva - 0,327*N^(-0,203)*N*5

  Ejemplo Trafo 150 con 108 Clientes:
  Potencia disponible = 150 - 0,327*108^(-0,203)*108*5
  Potencia disponible = 150 - 68,25846068
  Potencia disponible = 81,74153932

*/
function getFormatedDateNow(){
  var d = new Date();

  var str = "day/month/year, hour:minute:second"
    .replace('day', d.getDate() <10? '0'+ d.getDate() : d.getDate())
    .replace('month', (d.getMonth() + 1) <10? '0' + (d.getMonth()+1) : (d.getMonth()+1))
    .replace('year', d.getFullYear())
    .replace('hour', d.getHours() <10? '0'+ d.getHours() : d.getHours() )
    .replace('minute', d.getMinutes() <10? '0'+ d.getMinutes() : d.getMinutes())
    .replace('second', d.getSeconds() <10? '0'+ d.getSeconds() : d.getSeconds());
    console.log(str);
  return str;
}

function factigis_addNuevaDireccion(newAddress, newGeometry, callback){

  console.log(newAddress, newGeometry);

  let geox = newGeometry.geoUbicacionCasa.x;
  let geoy=  newGeometry.geoUbicacionCasa.y;
    const data = {
      f: 'json',
      adds: JSON.stringify([{ attributes: newAddress, geometry: {"x":geox , "y": geoy}}]),
      token: token.read()
    };

    jQuery.ajax({
      method: 'POST',
      url: "http://gisred.chilquinta.cl:5555/arcgis/rest/services/Mobile/Ingreso_externo_nuevo/FeatureServer/2/applyedits",
      dataType:'html',
      data: data
    })
    .done(d =>{
      let json = JSON.parse(d);
      console.log(json["addResults"][0].objectId);
      let arrObject = [];
      if(json["addResults"][0].objectId>0){
        return callback(true);

      }else{
        return callback(false);

      }

    })
    .fail(f=>{
      console.log(f,"no pase")
      callback(false)
    });



}

function factigis_addNuevaFactibilidad(factibilidad, callbackadd){
  var fact = {};
  //cuando es BT
  if(factibilidad.factigisTipoEmpalme=='BT'){
    getDetailsForPotencia(factibilidad.factigisPotencia, factibilidad.factigisEmpalme, factibilidad.factigisFase,
      (potenciaDetails)=>{
        factibilidad.factigisPotencia = potenciaDetails[0].label;
        factibilidad.capacidadInterruptor = potenciaDetails[0].capacidadInterruptor;
        factibilidad.capacidadEmpalme = potenciaDetails[0].capacidadEmpalme;

        //calcular distancias dir-clie-poste:
          //variables a usar en formula
            let x2 = factibilidad.factigisGeoPoste.x;
            let x1 = factibilidad.factigisGeoCliente.x;
            let y2 = factibilidad.factigisGeoPoste.y;
            let y1 = factibilidad.factigisGeoCliente.y;
            let x3 =factibilidad.factigisGeoDireccion.x;
            let y3 = factibilidad.factigisGeoDireccion.y;
          //rotulo conexión y medidor (ubicación)
            let res = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
          //medidor (ubicación) y direccion
            let res2 = Math.sqrt(Math.pow((x3-x1),2) + Math.pow((y3-y1),2));

            console.log("distancia_rotulo_medidor", Math.round(res));
            console.log("distancia_medidor_direccion", Math.round(res2));
            factibilidad.factigisDistRotMed = Math.round(res);
            factibilidad.factigisDistMedDir = Math.round(res2);

          //calcular potencias: solicitada x cantidad
            factibilidad.factigisPotenciaCalculada = factibilidad.factigisPotencia * factibilidad.factigisCantidadEmpalmes;
            factibilidad.factigisEstadoTramite = 'NUEVA';

          //agregar potencia disponible para SED

            buscarCantClienteSED(factibilidad.factigisSed, (cantidadClientes)=>{
              console.log("cant clientes ", cantidadClientes);
              var kva = buscarKVASED(factibilidad.factigisSed, (kva)=>{
                console.log("kvas:", kva);
                //cantidadClientes = 108;
                //kva = 150;
                let potenciaDisponible = kva - (0.327 * (Math.pow(cantidadClientes,-0.203))*cantidadClientes*5);
                console.log("La potencia disp es:",potenciaDisponible);
                factibilidad.factigisPotenciaDisponibleSED = potenciaDisponible;

                console.log("tengo la siguiente factibilidad",factibilidad.factigisTipoFactibilidad);
                if(potenciaDisponible < 0){
                  factibilidad.factigisTipoFactibilidad = 'FACTIBILIDAD ASISTIDA';
                }

                //agregar origen de factibilidad:
                factibilidad.factigisOrigen = 'OFICINA COMERCIAL';


                //agregar a rest srv
                console.log("quede con la siguiente factibilidad",factibilidad.factigisTipoFactibilidad);
                if(factibilidad.factigisTipoFactibilidad=="FACTIBILIDAD NORMAL"){
                  factibilidad.factigisTipoMejora = "FACTIBILIDAD DIRECTA";
                }else{
                  factibilidad.factigisTipoMejora = "POR DEFINIR";
                }

                console.log("agregar lo siguiente a arcgis srv", factibilidad);

                agregarFact(factibilidad,(isDone)=>{
                console.log(isDone[0],"valor en agregarFact");
                  if(isDone[0]){
                    console.log("pase ok, devolviendo a callbackadd");
                    let pasar = [];
                    pasar.push(true);
                    pasar.push(isDone[1])
                    pasar.push(isDone[2]);

                    let usrprfl = cookieHandler.get('usrprfl');
                    let historial = {
                      Estado_tramite:  factibilidad.factigisEstadoTramite,
                      ID_Factibilidad: isDone[1],
                      Fecha_cambio: getFormatedDateNow(),
                      Observacion: "ESTADO INICIAL",
                      Usuario:  usrprfl.USUARIO
                      }
                    agregarEstadoHistoria(historial, myhistorialCb =>{
                      console.log("hecho o no el historial",myhistorialCb);
                      return callbackadd(pasar);
                    });

                  //  return callbackadd(pasar);
                  }else{
                    console.log("hubo un problema agregando");
                  }

                });

              });

            });

    });
  }
  else{
    //cuando es MT
      factibilidad.capacidadInterruptor = 0;
      factibilidad.capacidadEmpalme = 0;

      //calcular distancias dir-clie-poste:
        //variables a usar en formula
          let x2 = factibilidad.factigisGeoPoste.x;
          let x1 = factibilidad.factigisGeoCliente.x;
          let y2 = factibilidad.factigisGeoPoste.y;
          let y1 = factibilidad.factigisGeoCliente.y;
          let x3 =factibilidad.factigisGeoDireccion.x;
          let y3 = factibilidad.factigisGeoDireccion.y;
        //rotulo conexión y medidor (ubicación)
          let res = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
        //medidor (ubicación) y direccion
          let res2 = Math.sqrt(Math.pow((x3-x1),2) + Math.pow((y3-y1),2));

          console.log("distancia_rotulo_medidor", Math.round(res));
          console.log("distancia_medidor_direccion", Math.round(res2));
          factibilidad.factigisDistRotMed = Math.round(res);
          factibilidad.factigisDistMedDir = Math.round(res2);

      //calcular potencias: solicitada x cantidad
          factibilidad.factigisPotenciaCalculada = factibilidad.factigisPotencia * factibilidad.factigisCantidadEmpalmes;
          factibilidad.factigisEstadoTramite = 'NUEVA';

          //agregar potencia disponible para SED

            buscarCantClienteSED(factibilidad.factigisSed, (cantidadClientes)=>{
              console.log("cant clientes ", cantidadClientes);
              var kva = buscarKVASED(factibilidad.factigisSed, (kva)=>{
                console.log("kvas:", kva);
                //cantidadClientes = 108;
                //kva = 150;
                let potenciaDisponible = kva - (0.327 * (Math.pow(cantidadClientes,-0.203))*cantidadClientes*5);
                console.log("La potencia disp es:",potenciaDisponible);

                console.log("tengo la siguiente factibilidad",factibilidad.factigisTipoFactibilidad);
                if(potenciaDisponible < 0){
                  factibilidad.factigisTipoFactibilidad = 'FACTIBILIDAD ASISTIDA';
                }
                factibilidad.factigisPotenciaDisponibleSED = potenciaDisponible;
                console.log("quede con la siguiente factibilidad",factibilidad.factigisTipoFactibilidad);

                if(factibilidad.factigisTipoFactibilidad=="FACTIBILIDAD NORMAL"){
                  factibilidad.factigisTipoMejora = "FACTIBILIDAD DIRECTA";
                }else{
                  factibilidad.factigisTipoMejora = "POR DEFINIR";
                }

                //agregar origen de factibilidad:
                factibilidad.factigisOrigen = 'OFICINA COMERCIAL';

                //agregar a rest srv
                //console.log("agregar lo siguiente a arcgis srv", factibilidad);
                agregarFact(factibilidad,(isDone)=>{
                  console.log(isDone[0],"valor en agregarFact");
                  if(isDone[0]){
                    let pasar = [];
                    pasar.push(true);
                    pasar.push(isDone[1]);
                    pasar.push(isDone[2]);
                    let usrprfl = cookieHandler.get('usrprfl');

                    let historial = {
                      Estado_tramite:  factibilidad.factigisEstadoTramite,
                      ID_Factibilidad: isDone[1],
                      Fecha_cambio: getFormatedDateNow(),
                      Observacion: "ESTADO INICIAL",
                      Usuario:  usrprfl.USUARIO
                      }
                    agregarEstadoHistoria(historial, myhistorialCb =>{
                      console.log("hecho o no el historial",myhistorialCb);
                      return callbackadd(pasar);
                    });



                  }else{
                    console.log("hubo un problema agregando");

                  }

                });

              });
              //factibilidad.factigisPotenciaDisponibleSED =

            });

  }
}

function agregarEstadoHistoria(historial,callback){

    const data = {
      f: 'json',
      adds: JSON.stringify([{ attributes: historial, geometry: {}}]),
      token: token.read()
    };

    jQuery.ajax({
      method: 'POST',
      url: "http://gisred.chilquinta.cl:5555/arcgis/rest/services/FACTIBILIDAD/FACTIGIS/FeatureServer/1/applyedits",
      dataType:'html',
      data: data
    })

    .done(d =>{
      let json = JSON.parse(d);
      console.log(json["addResults"][0].objectId);
      let arrObject = [];
      if(json["addResults"][0].objectId>0){
        return callback(true);

      }else{
        return callback(false);

      }

    })
    .fail(f=>{
      console.log(f,"no pase")
      callback(false)
    });

}

function agregarFact(f, callback){
  let opcionCampamento, opcionConcesion, opcionVialidad, opcionTransmision, opcionRestringida;
  console.log("llega de zonas:", "Camp:", f.factigisZonaCampamentos, "conce: ",f.factigisZonaConcesion,"vial:" ,f.factigisZonaVialidad, "trans:",f.factigisZonaTransmision, "rest",f.factigisZonaRestringida);
  if(f.factigisZonaCampamentos){
    opcionCampamento = 'NO';
  }else{
    opcionCampamento = 'SI';
  }

  if(f.factigisZonaConcesion){
    opcionConcesion = 'SI';
  }else{
    opcionConcesion = 'NO';
  }

  if(f.factigisZonaVialidad){
    opcionVialidad = 'NO';
  }else{
    opcionVialidad = 'SI';
  }

  if(f.factigisZonaTransmision){
    opcionTransmision = 'NO';
  }else{
    opcionTransmision = 'SI';
  }

  if(f.factigisZonaRestringida){
    opcionRestringida = 'NO';
  }else{
    opcionRestringida = 'SI';
  }

  var myAttributes = {
    Rut : f.factigisRut,
    Nombre : f.factigisNombre,
    Apellido : f.factigisApellido,
    Telefono : f.factigisTelefono,
    Email: f.factigisEmail,
    Tipo_cliente : f.factigisTipoCliente,
    Tipo_contribuyente : f.factigisContribuyente,
    Rotulo : f.factigisRotulo,
    Tramo : f.factigisTramo,
    Empalme :  f.factigisEmpalme,
    Fase : f.factigisFase,
    Potencia : f.factigisPotencia,
    Capacidad_empalme : f.capacidadEmpalme,
    Capacidad_interruptor : f.capacidadInterruptor,
    Tiempo_empalme : f.factigisTiempoEmpalme,
    Tipo_empalme: f.factigisTipoEmpalme,
    Cantidad_empalme : f.factigisCantidadEmpalmes,
    ID_Direccion : f.factigisIDDireccion,
    Direccion: f.factigisDireccion,
    Zona_campamentos: opcionCampamento,
    Zona_concesion : opcionConcesion,
    Zona_restringida : opcionRestringida,
    Zona_transmision : opcionTransmision,
    Zona_vialidad : opcionVialidad,
    Potencia_calculada : f.factigisPotenciaCalculada,
    DistRotuloMedidor: f.factigisDistRotMed,
    DistDireccionMedidor : f.factigisDistMedDir,
    Comuna : f.factigisComuna,
    Alimentador: f.factigisAlimentador,
    Idnodo : f.factigisIDNodo,
    Estado_tramite: f.factigisEstadoTramite,
    Tipo_factibilidad: f.factigisTipoFactibilidad,
    Tipo_mejora : f.factigisTipoMejora,
    Zona : f.factigisZona,
    Origen_factibilidad : f.factigisOrigen,
    Sed :f.factigisSed,
    PotenciaDispSed :f.factigisPotenciaDisponibleSED
  }

  console.log("agregando...",myAttributes);

  let geox = f.factigisGeoCliente.x;
  let geoy=  f.factigisGeoCliente.y;

  const data = {
    f: 'json',
    adds: JSON.stringify([{ "attributes": myAttributes, geometry: {"x":geox , "y": geoy}}]),
    token: token.read()
  };

  jQuery.ajax({
    method: 'POST',
    url: "http://gisred.chilquinta.cl:5555/arcgis/rest/services/FACTIBILIDAD/FACTIGIS/FeatureServer/0/applyedits",
    dataType:'html',
    data: data
  })
  .done(d =>{
    let json = JSON.parse(d);
    console.log(json["addResults"][0].objectId);
    let arrObject = [];

    if(json["addResults"][0].objectId>0){
      arrObject.push(true);
      arrObject.push(json["addResults"][0].objectId);
      arrObject.push(myAttributes);
      return callback(arrObject);
    }else{
      arrObject.push(false);
      arrObject.push(json["addResults"][0].objectId);
      arrObject.push([]);
      return callback(arrObject);

    }
  })
  .fail(f=>{
    console.log(f,"no pase")
    callback(false)
  });


}

function buscarCantClienteSED(sed, callback){
  var qTaskCC = new esri.tasks.QueryTask(layers.read_layer_nisInfo());
  var qCC = new esri.tasks.Query();

  qCC.where = "ARCGIS.dbo.CLIENTES_DATA_DATOS_006.resp_id_sed='"+ sed + "'";
  qTaskCC.executeForCount(qCC, (featureSet)=>{
    return callback(featureSet);

  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for cantidad clientes");

  });
}

function buscarKVASED(sed, callback){
  var qTaskva = new esri.tasks.QueryTask(layers.read_layer_infoSED());
  var qkva = new esri.tasks.Query();
  qkva.returnGeometry = false;
  qkva.where = "codigo='"+ sed + "'";
  qkva.outFields=["kva"];
  qTaskva.execute(qkva, (featureSet)=>{
    if(!featureSet.features.length){
      console.log("no hay kva para sed");
      return callback([]);
    }

    console.log("kva sed", sed, ":",featureSet.features[0].attributes.kva);
    return callback(featureSet.features[0].attributes.kva);

  }, (Errorq)=>{
    console.log(Errorq,"Error doing query for kva");

  });
}

export {factigis_addNuevaDireccion,factigis_addNuevaFactibilidad, agregarEstadoHistoria};