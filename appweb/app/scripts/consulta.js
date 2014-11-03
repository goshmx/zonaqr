var catalogo = [];

$('#btn_regresar').on('click', function(){
    window.location.replace("index.html");
});

function peticionApi(metodo,url,parametros) {
    var opcionesAjax ={
        type: metodo,
        url: url,
        dataType: "json"
    };
    if(typeof parametros != 'undefined'){
        opcionesAjax.data = parametros;
    };
    return $.ajax(opcionesAjax);
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

var locacion =  {
    consulta: function(id){
        peticionApi('get',rest+'locacion/consulta/'+id).done(locacion.mostrar).fail(function(){console.log("Error");});
    },
    mostrar: function(dato){
        if(dato.Error){ console.log("XD");window.location.replace("index.html"); }
        else{
            $('.informacion h1').html(dato.nombre);
            $('.informacion .lead').html(dato.descripcion);
            $('.ubicacion').html("<img class='foto_ubic' src='https://maps.googleapis.com/maps/api/staticmap?center=" + dato.latitud + "," + dato.longitud + "&zoom=16&size=400x400&sensor=false&markers=color:blue%7Clabel:S%7C" + dato.latitud + "," + dato.longitud + "'>");
            $('.direccion').html(dato.direccion);
            $('.como_llegar').html(dato.como_llegar);
            $('.historia').html(dato.historia);
            $('.core-header').css('background-image', 'url(' + dato.imagen + ')');
            streetview(dato.latitud, dato.longitud);
        }
    }
};

var catlocacion = {
    init: function(){
        peticionApi('get',rest+'catlocacion').done(catlocacion.listado).fail(function(){console.log("Error");});
    },
    listado: function (datos) {
        $.each(datos, function (i, item) {
            catalogo[item.id] = item.icono;
        });
    }
};
catlocacion.init();

function streetview(latitud, longitud) {
    var fenway = new google.maps.LatLng(latitud, longitud);
    var mapOptions = {
        center: fenway,
        zoom: 14
    };
    var map = new google.maps.Map(
        document.getElementById('map-canvas'), mapOptions);
    var panoramaOptions = {
        position: fenway,
        pov: {
            heading: 34,
            pitch: 10
        }
    };
    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
    map.setStreetView(panorama);
}

$(document).ready(function(){
    var id = getUrlParameter('id');
    locacion.consulta(id);
});