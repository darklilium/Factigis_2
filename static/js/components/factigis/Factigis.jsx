import React from 'react';
import ReactDOM from 'react-dom';
import Factigis_Add from '../factigis/Factigis_Add.jsx';
import mymap from '../../services/map-service';
import {addCertainLayer} from '../../services/layers-service';
import LayerList from '../../components/LayerList.jsx';
import layers from '../../services/layers-service';
import FModal from '../factigis/Factigis_Modal.jsx';
import cookieHandler from 'cookie-handler';


class Factigis extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      themap: {},
      permissions: []
    }
  }
  componentWillMount(){
    if(!cookieHandler.get('usrprmssns')){
      window.location.href = "index.html";
      return;
    }

    let modulePermissions = cookieHandler.get('usrprmssns');
    let widgetPermissions = modulePermissions.map(wp=>{
      return wp.widget;
    });
    console.log("my w.permis",widgetPermissions);
    this.setState({permissions: widgetPermissions});
  }
  componentDidMount(){

    var mapp = mymap.createMap("factigis_map_div","topo",-71.2905 ,-33.1009,9);
    this.setState({themap: mapp});

  /*  addCertainLayer("gis_cartografia", 11, "",(gis_cartografia)=>{
      gis_cartografia.on("click",(event)=>{console.log(event.graphic.attributes)});
    });
    addCertainLayer("gis_rotulos", 12, "",(gis_rotulos)=>{
      gis_rotulos.on("click",(event)=>{console.log(event.graphic.attributes)});
    });

    addCertainLayer("mobile_direccionesNuevas", 12, "",(mobile_direccionesNuevas)=>{
      mobile_direccionesNuevas.on("click",(event)=>{console.log(event.graphic)});
    });
*/

    //Add layer for old addresses
    var layerDirecciones = new esri.layers.ArcGISDynamicMapServiceLayer(layers.read_direccionesDyn(),{id:"factigis_direcciones"});
    layerDirecciones.setImageFormat("png32");
    layerDirecciones.setVisibleLayers([0]);

    mapp.addLayer(layerDirecciones);

    // add layer for new ones
    var layerDireccionesNew = new esri.layers.ArcGISDynamicMapServiceLayer(layers.read_direccionesNuevasMobile(),{id:"factigis_direccionesNew", minScale: 15000});
    layerDireccionesNew.setImageFormat("png32");
    layerDireccionesNew.setVisibleLayers([2]);
    mapp.addLayer(layerDireccionesNew);

    // add layer for pipes
    var layerRotulos = new esri.layers.ArcGISDynamicMapServiceLayer(layers.read_rotulos(),{id:"factigis_rotulos"});
    layerRotulos.setImageFormat("png32");
    layerRotulos.setVisibleLayers([0]);
    var layerDefs = [];
    layerDefs[0] = "tipo_nodo ='ele!poste' or tipo_nodo='ele!camara'";
    layerRotulos.setLayerDefinitions(layerDefs);
    mapp.addLayer(layerRotulos,2);


  }

  render(){
    const factigisRender =
          <div className="wrapper_factigis">
            <div className="wrapper_factibilidadLeft">
              <Factigis_Add themap={this.state.themap} permissions={this.state.permissions}/>
            </div>
            <div className="wrapper_factibilidadRight">
              <LayerList show={["check_factigis_transmision", "check_factigis_distribucion", "check_factigis_vialidad", "check_campamentos", "check_chqbasemap",
              "check_subestaciones","check_MT","check_BT"]} />

              <div className="factigis_map_div" id="factigis_map_div"></div>
            </div>
          </div>

    if(!cookieHandler.get('usrprmssns')){
      window.location.href = "index.html";
      return;
    }else {
      return (
        <div>{factigisRender}</div>
      );
    }


  }
}

export default Factigis;