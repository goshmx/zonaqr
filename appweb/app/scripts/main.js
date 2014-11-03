$('#btn_admin').on('click', function(){
    window.location.replace("administracion.html");
});

var radio, mapa, marker, markersArray = [];
var catalogo = [];

/**
 * @fileoverview Archivo de interaccion con google maps.
 *
 * @author Gosh
 * @version 0.1
 */



/**
 * Funcion de carga inicial de mapa
 * @description Inicializa la carga del mapa, marker de consulta y radio de accion.
 */
function inicia_mapa() {
    var posicion_inicial = new google.maps.LatLng(17.052728,-96.706424);
    var configuracion_mapa = {
        scaleControl: false,
        center: posicion_inicial,
        zoom: 15,
        disableDefaultUI: true,
        styles: [{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#d3d3d3"}]},{"featureType":"transit","stylers":[{"color":"#808080"},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#b3b3b3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"weight":1.8}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#d7d7d7"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ebebeb"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#a7a7a7"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#efefef"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#696969"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#737373"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#d6d6d6"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#dadada"}]}]
    };
    mapa = new google.maps.Map(document.getElementById('mapa'), configuracion_mapa);
    marker = new google.maps.Marker({
        map: mapa,
        position: posicion_inicial,
        draggable: false,
        icon: "http://maps.google.com/mapfiles/marker_black.png"
    });
    var configuracion_radio = {
        strokeColor: "#002a80",
        strokeOpacity: 0.1,
        strokeWeight: 1,
        fillColor: "#149bdf",
        fillOpacity: 0.15,
        map: mapa,
        center: posicion_inicial,
        radius: 1000
    };
    radio = new google.maps.Circle(configuracion_radio);
    define_posiciones(posicion_inicial);
    init();
}
google.maps.event.addDomListener(window, 'load', inicia_mapa);

function define_posiciones(pos){
    radio.setCenter(pos);
    $('#latitud').val(pos.lat());
    $('#longitud').val(pos.lng());
}

function inserta_punto(item){
    var posicion = new google.maps.LatLng(item.latitud,item.longitud);
    var marker = new MarkerWithLabel({
        position: posicion,
        map: mapa,
        icon: "images/"+catalogo[item.categoria],
        title: item.nombre,
        labelContent: item.nombre,
        labelAnchor: new google.maps.Point(22, 0),
        labelClass: "labels"
    });
    markersArray.push(marker);
}

function limpia_mapa() {
    if(markersArray){
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }
}

    $('#select_radio').on('change', function () {
        var nuevo_radio = parseFloat($(this).val()) * 1000;
        radio.setRadius((parseInt(nuevo_radio)));
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

function init()
{

    if(navigator.geolocation)
    {
        navigator.geolocation.watchPosition(updateLocation,handleLocationError,{timeout:30000, frequency: 30000});
    }
    else
    {
       alert("Ups no tienes geolocalizacion!");
    }
}

function updateLocation(position)
{
    startPos = position;
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var coords = new google.maps.LatLng(latitude,longitude);
    marker.setPosition(coords);

    define_posiciones(coords);
    carga_ubicaciones();
}

function handleLocationError(error)
{
    switch(error.code)
    {
        case 0:
            updateStatus("There was an error while retrieving your location: " + error.message);
            break;
        case 1:
            updateStatus("The user prevented this page from retrieving the location.");
            break;
        case 2:
            updateStatus("The browser was unable to determine your location: " + error.message);
            break;
        case 3:
            updateStatus("The browser timed out before retrieving the location.");
            break;
    }
}

function updateStatus(msg)
{
    console.log(msg);
}

var locacion =  {
    listado: function(datos){
        $('#lugares-list').html('');
        limpia_mapa();
        $.each( datos, function( i, item ) {
            locacion.mostrar(item);
        });
    },
    mostrar: function(dato){
        var html = '<div class="lugar-item" latitud="'+dato.latitud+'" id="'+dato.id+'" longitud="'+dato.longitud+'"><div class="categoria-item"><img src="images/'+catalogo[dato.categoria]+'"</div><h5>'+dato.nombre+'</h5><h6>a '+(dato.distance*1000).toFixed(2)+' metros de distancia</h6></div>';
        $('#lugares-list').append(html);
        inserta_punto(dato);
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

function carga_ubicaciones(){
    var latitud = $('#latitud').val();
    var longitud = $('#longitud').val();
    var radio = $('#select_radio').val();
    peticionApi('get',rest+'locacion/radio/1/'+latitud+'/'+longitud+'/'+radio).done(locacion.listado).fail(function(){console.log("Error");});
};


$('#lugares-list').on('click', '.lugar-item' ,function(){
    var latitud = $(this).attr("latitud");
    var longitud = $(this).attr("longitud");
    var id = $(this).attr("id");
    window.location.replace("consulta.html?id="+id);

});
