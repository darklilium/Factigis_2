import {notifications} from '../utils/notifications';
import myLayers from './layers-service';
import token from '../services/token-service';
import createQueryTask from '../services/createquerytask-service';
import cookieHandler from 'cookie-handler';

function saveLogin(user,page,mod, tkn){

  const data = {
    f: 'json',
    adds: JSON.stringify([{ attributes: { "usuario": user, "pagina": page, "module": mod  }, geometry: {} }]),
    token: tkn
  };

  jQuery.ajax({
    method: 'POST',
    url: "http://gisred.chilquinta.cl:5555/arcgis/rest/services/Admin/LogAccesos/FeatureServer/1/applyedits",
    dataType:'html',
    data: data
  })
  .done(d =>{
    console.log(d,"pase");
  })
  .fail(f=>{
    console.log(f,"no pase")
  });
}


//for ap
function saveSettings(user){

  var getUserAccountSettings = createQueryTask({
    url: myLayers.read_logAccess(),
    whereClause: "usuario = '"+ user+ "'",
    returnGeometry: false
  });

  getUserAccountSettings((map,featureSet) =>{
      let myRegion = regionsExtent().filter(region =>{
      return region[0] ==  featureSet.features[0].attributes.widget;
    });
    //logo,comuna,latx,laty,zoom
    my_AP_Settings.write(
      featureSet.features[0].attributes.usuario, //logo
      featureSet.features[0].attributes.widget, //region
      myRegion[0][1], //latx
      myRegion[0][2], //laty
      myRegion[0][3]); //zoom


    window.location.href = "apchq.html";
  },(error)=>{
    console.log("Error getting the user settings");
  });
}



function saveGisredLogin(user,page,mod, tkn){

  const data = {
    f: 'json',
    adds: JSON.stringify([{ attributes: { "usuario": user, "pagina": page, "module": mod  }, geometry: {} }]),
    token: tkn
  };

  jQuery.ajax({
    method: 'POST',
    url: "http://gisred.chilquinta.cl:5555/arcgis/rest/services/Admin/LogAccesos/FeatureServer/1/applyedits",
    dataType:'html',
    data: data
  })
  .done(d =>{
    console.log(d,"pase");
  })
  .fail(f=>{
    console.log(f,"no pase")
  });
}

function getUserPermission(user, token, callback){


    var getPermission = createQueryTask({
      url: myLayers.read_logAccess(),
      whereClause: "usuario='"+ user + "' AND plataforma='WEB' AND aplicacion='FACTIGIS'"
    });

    getPermission((map, featureSet) => {
      if(!featureSet.features){
        return callback("NOPERMISSIONS");
      }
        let permissions = featureSet.features.map((permission)=>{
          let per = {
            "username": permission.attributes['usuario'],
            "application": permission.attributes['aplicacion'],
            "module": permission.attributes['modulo'],
            "widget": permission.attributes['widget'],
            "insert": permission.attributes['insert_'],
            "update": permission.attributes['update_'],
            "delete": permission.attributes['delete_'],
            "platform": permission.attributes['plataforma']
          };
          return per;
        });

        callback(permissions);

    },(errorQuery)=>{
        console.log("Error performing query for ap_getDataMedidores", errorQuery);
        callback("NOPERMISSIONS")
    });
}

function factigisLogin(user,pass){
  const url = myLayers.read_tokenURL();

  const data = {
    username: user,
    password: pass,
    client: 'requestip',
    expiration: 1440,
    format: 'jsonp'
  };

  $.ajax({
    method: 'POST',
    url: url,
    data: data,
    dataType: 'html'
  })
  .done(myToken => {


    if(myToken.indexOf('Exception') >= 0) {
      notifications('Login incorrecto, intente nuevamente.', 'Login_Error', '.notification-login');
      return;
    }
    if (myToken.indexOf('error') >= 0){
      notifications('Login incorrecto, intente nuevamente.', 'Login_Error', '.notification-login');
      return;
    }
    //IF EVERYTHING IS OK , GOING TO:
    console.log('writing token into system', myToken);
    token.write(myToken);
    //if the login is correct. Get user permission:
    getUserPermission(user, myToken, (UserPermissions)=>{


        if(UserPermissions=='NOPERMISSIONS'){
          console.log('User doesnt have permissions for any application, dashboard empty...');
          notifications("Usuario sin permisos","Login_Error", ".notification-login");
          //Save that the user is in dashboard
          let page = "REACT_GISRED";
          let module = "GISRED_DASHBOARD";
          // saveGisredLogin(user,page,module,myToken);
        }else{
          console.log('User has permissions...requesting service access and login in to FACTIGIS_DASHBOARD');

          token.write(myToken);
          cookieHandler.set('usrprmssns',UserPermissions);

          let profiles = [];
          profiles = UserPermissions.map(permission=>{
            return permission.module;
          });

          console.log("permisos encontrados",profiles);
          let goesTo = profiles.filter(profile =>{
            return profile == "REVISAR_FACTIBILIDAD" || profile=="REVISAR_HISTORIAL_FACTIBILIDAD";
          });
          console.log("encontrado perfil",goesTo);

          //va a dashboard o factigis directamente dependiendo permisos del usuario para los modulos y widgets.
            if(!goesTo.length){
              const page = "REACT_FACTIGIS";
              const module = "FACTIGIS_APP";
              // saveGisredLogin(user,page,module,myToken);
              notifications("Logging in...","Login_Success", ".notification-login");
                getProfile(user, userProfile =>{
                    console.log("esto llega",userProfile);
                  if(!userProfile.length){
                    console.log("El usuario no posee un perfil para el modulo");
                    return;
                  }
                  cookieHandler.set('usrprfl',userProfile[0].attributes);

                window.location.href = "factigis.html";
                });

            }else{
              //Save that the user is in dashboard
              const page = "REACT_FACTIGIS";
              const module = "FACTIGIS_DASHBOARD";
              // saveGisredLogin(user,page,module,myToken);
              notifications("Logging in...","Login_Success", ".notification-login");
              getProfile(user, userProfile =>{
                  console.log("esto llega",userProfile);
                if(!userProfile.length){
                  console.log("El usuario no posee un perfil para el modulo");
                  return;
                }
                cookieHandler.set('usrprfl',userProfile[0].attributes);
                window.location.href = "FactigisDashboard.html";
              });


            }
        }
    });

  })
  .fail(error => {
    console.log("Problem:" , error);
    notifications("Problema al iniciar sesión. Intente nuevamente.","Login_Failed", ".notification-login");
  });

  console.log('gisred login done');
}

function getProfile (user, userProfile){

  var getProf = createQueryTask({
    url: myLayers.read_factigisUserProfile(),
    whereClause: "USUARIO='"+ user +"'"
  });

  getProf((map, featureSet) => {

    if(!featureSet.features.length){
      return userProfile([]);
    }

    return userProfile(featureSet.features);
  });

}
export { saveGisredLogin,saveSettings, factigisLogin };
