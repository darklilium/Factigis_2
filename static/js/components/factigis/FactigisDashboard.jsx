import React from 'react';
import ReactDOM from 'react-dom';
import {FactigisModuleList, excludeDataFactigis,FactigisInsertMyData} from '../../../js/services/factigis_services/factigisModuleList';
import cookieHandler from 'cookie-handler';
import {saveGisredLogin} from '../../services/login-service';
import _ from 'lodash';
import {Navbar, Nav, NavItem, NavDropdown, DropdownButton,FormGroup,FormControl,Button, MenuItem,Breadcrumb, CollapsibleNav} from 'react-bootstrap';

class FactigisDashboard extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      factigisModuleList: [],
      factigisNotAvList: []
    }

  }
  componentWillMount(){
    //if theres no cookie, the user cannot be in dashboard.
    if(!cookieHandler.get('usrprmssns')){
      window.location.href = "index.html";
      return;
    }
    //else , charge the modules that the user has permissions
    var myDashboardModules = cookieHandler.get('usrprmssns');
    var list = FactigisInsertMyData(FactigisModuleList(), myDashboardModules);
    let unicos = list.map(l=>{
      return l.module;
    });
    ////console.log("unicos",_.uniq(unicos), "lista", list, "asd", _.uniqWith(list, _.isEqual));


    this.setState({factigisModuleList: _.uniqWith(list, _.isEqual)});

    //and then save where the user is:

    const page = "REACT_FACTIGIS";
    const module = "DASHBOARD";
    //saveGisredLogin(userPermissions[0].username,page,module,localStorage.getItem('token'));

    //and load the other not available modules

    var myLi = _.uniqWith(myDashboardModules, _.isEqual);
    var mAll = FactigisModuleList();
    //console.log(myLi,mAll,"listas")
    var myPropList = ['module', 'alias',"widgets",'Available','Permission','Insert','Update','Delete','url','color','img'];
    var result = excludeDataFactigis(mAll,myLi,myPropList);
    //console.log("exclude",result)
    this.setState({factigisNotAvList: result});

  }

  render(){
    let whoLogged = cookieHandler.get('usrprfl');
    whoLogged = whoLogged.NOMBRE_COMPLETO.split(" ");

    var excludeModules = this.state.factigisNotAvList.map((m, index)=>{
        //console.log(m);
        let url = m.url;
        let urlName = m.alias;
        let imgSrc = m.img;
        let color = m.color;

        let divstyle = {
          'backgroundColor': 'gray',
          'fontcolor': 'white'
        };
         return  <div className="factigisDashboard_moduleContainer" style={divstyle} key={index}>
                    <div className="factigisDashboard-divimg"><img className="factigisDashboard-img" src={imgSrc}></img></div>
                    <h7 className="factigisDashboard-aLink" key={index} href={url}>{urlName}</h7><br/></div>;
    });
    var modules = this.state.factigisModuleList.map((m, index)=>{

        let url = m.url;
        let urlName = m.alias;
        let imgSrc = m.img;
        let color = m.color;
        let display;
        if (m.available=='yes'){
          display = 'flex';

        }else{
          display  = 'none';
        }
        let divstyle = {
          'backgroundColor': color,
          'fontcolor': 'white',
          'display': display
        };
         return  <div className="factigisDashboard_moduleContainer" style={divstyle} key={index}>
                    <div className="factigisDashboard-divimg"><img className="factigisDashboard-img" src={imgSrc}></img></div>
                    <a className="factigisDashboard-aLink" key={index} href={url}>{urlName}</a><br/></div>;
    });

    return (
    <div>
    <div className="wrapper_factibilidadTop">
      <Breadcrumb className="dashboard_breadcrum">
         <Breadcrumb.Item href="index.html">
           Inicio
         </Breadcrumb.Item>
         <Breadcrumb.Item active>
           Dashboard
         </Breadcrumb.Item>
         <Breadcrumb.Item active className="dashboard_whoLogged">
           Bienvenido: {whoLogged[0]}
         </Breadcrumb.Item>
      </Breadcrumb>

    </div>
      <div className="wrapper_factigisDashboard">
          {modules}
          {excludeModules}
      </div>
    </div>

  );
  }
}

export default FactigisDashboard;
