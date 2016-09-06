//COMUNA - ZONA

function FactigisZonas(){
  return [
    ["SANTO DOMINGO",'SAN ANTONIO'],
    ["SAN ANTONIO",'SAN ANTONIO'],
    ["CARTAGENA",'SAN ANTONIO'],
    ["EL TABO", 'SAN ANTONIO'],
    ["VALPARAISO",'VALPARAISO'],
    ["VIÑA DEL MAR",'COSTA'],
    ["CONCON",'COSTA'],
    ["QUINTERO", 'COSTA'],
    ["PUCHUNCAVI", 'COSTA'],
    ["VILLA ALEMANA", 'MARGA MARGA'],
    ["QUILPUE",'MARGA MARGA'],
    ["LIMACHE", "QUILLOTA"],
    ["OLMUE","QUILLOTA"],
    ["HIJUELAS", "QUILLOTA"],
    ["LA CALERA", "QUILLOTA"],
    ["LA CRUZ","QUILLOTA"],
    ["QUILLOTA", "QUILLOTA"],
    ["NOGALES", "QUILLOTA"],
    ["CATEMU", "LOS ANDES"],
    ["PANQUEHUE",  "LOS ANDES"],
    ["LLAYLLAY",  "LOS ANDES"],
    ["SAN FELIPE",  "LOS ANDES"],
    ["RINCONADA",  "LOS ANDES"],
    ["SANTA MARIA",  "LOS ANDES"],
    ["SAN ESTEBAN",  "LOS ANDES"],
    ["CALLE LARGA",  "LOS ANDES"],
    ["LOS ANDES",  "LOS ANDES"]
  ];

}


function getZona(comuna){
  let zona = FactigisZonas().filter(zona =>{
    return zona[0] ==  comuna;
  });
  //console.log(zona[0][1]);
  return zona[0][1];
}

export {FactigisZonas, getZona};
