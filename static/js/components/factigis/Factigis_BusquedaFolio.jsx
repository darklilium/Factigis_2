import React from 'react';
import ReactDOM from 'react-dom';
import ReactTabs from 'react-tabs';
import Select from 'react-select';
import {mymap} from '../../services/map-service';
import layers from '../../services/layers-service';
import Modal from 'react-modal';
import {factigis_findFolio} from '../../services/factigis_services/factigis_find-service';
import makeSymbol from '../../../js/utils/makeSymbol';
import $ from 'jquery';
import cookieHandler from 'cookie-handler';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class Factigis_BusquedaFolio extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      //passed as parameter from the parent component (factigisAdd), and saves the current map
      themap: this.props.themap,
      open: false,
      bf_folio: '',
      bf_rut: '',
      bf_nombre: '',
      bf_apellido: '',
      bf_telefono: '',
      bf_email: '',
      bf_tipoCliente: '',
      bf_tipoContribuyente: '',
      bf_rotulo: '',
      bf_direccion: '',
      bf_tramo: '',
      bf_tipoBTMT: '',
      bf_sed: '',
      bf_tipoEmpalme: '',
      bf_fase: '',
      bf_tiempoEmpalme: '',
      bf_cantidadEmpalme: '',
      bf_potenciaSolicitada: '',
      bf_potenciaDisponible: '',
      bf_potenciaCalculada: '',
      bf_zona: '',
      bf_tipoFactibilidad: '',
      bf_tipoMejora: '',
      bf_estadoTramite: '',
      bf_origenFactibilidad: '',
      problemsforAdding: '',
      printDisabled: true,
      bf_comunaCliente: ''
    }

  }

  onClick(){

    $("#iframeloading").show();
    console.log(this.state.bf_folio, "valor del txt para factibildad");
    var c = factigis_findFolio(this.state.bf_folio, cb=>{

      if(!cb.length){
        console.log("no hay registros para ese id");
        this.setState({problemsforAdding: 'No hay registros para este n° de folio', open:true});
         $("#iframeloading").hide();
         this.setState({printDisabled: true});
        return;
      }


      let reg = cb[0].attributes;
      let ubi = cb[0].geometry;
      this.setState({
        bf_rut: reg.Rut,
        bf_nombre: reg.Nombre,
        bf_apellido: reg.Apellido,
        bf_telefono: reg.Telefono,
        bf_email: reg.Email,
        bf_tipoCliente: reg.Tipo_cliente,
        bf_tipoContribuyente: reg.Tipo_contribuyente,
        bf_rotulo: reg.Rotulo,
        bf_direccion: reg.Direccion,
        bf_tipo: reg.Apellido,
        bf_tramo: reg.Tramo,
        bf_tipoBTMT: reg.Tipo_empalme,
        bf_sed: reg.Sed,
        bf_tipoEmpalme: reg.Empalme,
        bf_fase: reg.Fase,
        bf_tiempoEmpalme: reg.Tiempo_empalme,
        bf_cantidadEmpalme: reg.Cantidad_empalme,
        bf_potenciaSolicitada: reg.Potencia,
        bf_potenciaDisponible: reg.PotenciaDispSed,
        bf_potenciaCalculada: reg.Potencia_calculada,
        bf_zona: reg.Zona,
        bf_tipoFactibilidad: reg.Tipo_factibilidad,
        bf_tipoMejora: reg.Tipo_mejora,
        bf_estadoTramite: reg.Estado_tramite,
        bf_origenFactibilidad: reg.Origen_factibilidad,
        printDisabled: false,
        bf_comunaCliente: reg.Comuna
      });

      let map = this.state.themap;
      map.graphics.clear();
      var myPointSymbol = makeSymbol.makePoint();
      map.graphics.add(new esri.Graphic(ubi,myPointSymbol));
      map.centerAndZoom(ubi,20);
       $("#iframeloading").hide();
    });
  }

  onChange(e){
    this.setState({bf_folio: e.currentTarget.value});
    this.setState({printDisabled: true});
  }

  openModal () { this.setState({open: true}); }

  closeModal () { this.setState({open: false}); }

  onPrint(){
    let usrprfl = cookieHandler.get('usrprfl');
    cookieHandler.set('myLetter',
      [
        this.state.bf_direccion + ", "+ this.state.bf_comunaCliente,
        this.state.bf_nombre + " " +this.state.bf_apellido,
        usrprfl.NOMBRE_COMPLETO,
        this.state.bf_folio,
        usrprfl.CARGO,
        usrprfl.LUGAR_DE_TRABAJO,
        usrprfl.DEPARTAMENTO,
        usrprfl.COMUNA
      ]
    );

      window.open("factigisCarta.html");
  }

  render(){
    return (
      <div className="factigis_addDireccion-wrapper">
        <div className="factigisBF_searchTitle">
          <h7><b>Búsqueda de Factibilidad</b></h7>
          <img className="factigisBF_imgLoader" src="dist/css/images/ajax-loader.gif" alt="loading" id="iframeloading"/>
        </div>
        <hr className="factigis_hr-subtitle factigis_hr"/>
        <div className="factigis_BigGroupbox">

          <h8>*N° Folio:</h8>
          <div className="factigis_groupbox">
            <input id="factigis_txtFolio" onChange={this.onChange.bind(this)} value={this.state.bf_folio} className="factigis-input"  title="Indique el n° de folio de la factibilidad" type="text" placeholder="Indique el n° de folio de la factibilidad"  />
            <button onClick={this.onClick.bind(this)} className="factigis-selectFromMapButton factigis_btnSelectCalle btn btn-default" title="Buscar Factibilidad " type="button" >
            <span><i className="fa fa-search"></i></span></button>
            <button disabled={this.state.printDisabled} onClick={this.onPrint.bind(this)} className="factigis-selectFromMapButton factigis_btnSelectCalle btn btn-default" title="Buscar Factibilidad " type="button" >
            <span><i className="fa fa-print"></i></span></button>
          </div>
        </div>
        <h7><b>Datos de Factibilidad</b></h7>

        <hr className="factigis_hr-subtitle factigis_hr"/>
        <div className="factigis_BigGroupbox2">
          <h6><b>Datos de Cliente</b></h6>
          <hr className="factigis_hr-subtitle factigis_hr"/>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Rut:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_rut}</h5>
              </div>
              <div className="factigis_group">
              <h8 className="factigisBusqueda_h8">Comuna:</h8>
              <h5 className="factigisBusqueda_h5">{this.state.bf_comunaCliente}</h5>
              </div>
            </div>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Nombre Cliente:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_nombre}</h5>
              </div>

              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Apellido:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_apellido}</h5>
              </div>
            </div>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Telefono:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_telefono}</h5>
              </div>

              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Email:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_email}</h5>
              </div>
            </div>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Tipo Cliente:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tipoCliente}</h5>
              </div>

              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Tipo Contribuyente:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tipoContribuyente}</h5>
              </div>
            </div>
        </div>
        <div className="factigis_BigGroupbox2">
          <h6><b>Datos de Red</b></h6>
          <hr className="factigis_hr-subtitle factigis_hr"/>
          <div className="factigis_groupbox">
            <div className="factigis_group">
              <h8 className="factigisBusqueda_h8">Rótulo:</h8>
              <h5 className="factigisBusqueda_h5">{this.state.bf_rotulo}</h5>
            </div>
            <div className="factigis_group">
              <h8 className="factigisBusqueda_h8">Dirección:</h8>
              <h5 className="factigisBusqueda_h5">{this.state.bf_direccion}</h5>
            </div>

          </div>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Tipo:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tipoBTMT}</h5>
              </div>
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Tramo Conexion:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tramo}</h5>
              </div>
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">SED:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_sed}</h5>
              </div>
            </div>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Tipo (Empalme):</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tipoEmpalme}</h5>
              </div>
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Fase:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_fase}</h5>
              </div>

            </div>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Empalme (Prov-Defi):</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tiempoEmpalme}</h5>
              </div>
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Cantidad:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_cantidadEmpalme}</h5>
              </div>
            </div>

            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Potencia Solicitada:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_potenciaSolicitada}</h5>
              </div>

              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Potencia Disponible:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_potenciaDisponible}</h5>
              </div>

            </div>
            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Potencia Calculada:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_potenciaCalculada}</h5>
              </div>
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Zona:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_zona}</h5>
              </div>
            </div>
        </div>

          <div className="factigis_BigGroupbox2">
            <h6><b>Factibilidad: </b></h6>
            <hr className="factigis_hr-subtitle factigis_hr"/>
            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Tipo Factibilidad</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tipoFactibilidad}</h5>
              </div>

              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Tipo Mejora:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_tipoMejora}</h5>
              </div>
            </div>
            <div className="factigis_groupbox">
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Estado Tramite:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_estadoTramite}</h5>
              </div>
              <div className="factigis_group">
                <h8 className="factigisBusqueda_h8">Origen Factibilidad:</h8>
                <h5 className="factigisBusqueda_h5">{this.state.bf_origenFactibilidad}</h5>
              </div>
            </div>
          </div>
          <Modal isOpen={this.state.open} style={customStyles}>
            <h2 className="factigis_h2">Factibilidad</h2>
            <p>{this.state.problemsforAdding}</p>
            <br />
            <button className="factigis_submitButton btn btn-info" onClick={this.closeModal.bind(this)}>Close</button>
          </Modal>
        </div>
    );
  }
}

export default Factigis_BusquedaFolio;
