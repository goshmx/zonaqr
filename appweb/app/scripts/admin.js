var map, marker;
var catlocacion = {
    init: function(){
        peticionApi('get',rest+'catlocacion').done(catlocacion.listado).fail(function(){console.log("Error");});
    },
    listado: function(datos){
        $('#tabla-categorias tbody').html('');
        if(datos.length > 0){
            $.each( datos, function( i, item ) {
                catlocacion.mostrar(item);
            });
        }else{
            $('#tabla-categorias tbody').html('<p align="center">Sin Categorias registradas</p>');
        }
    },
    mostrar: function(dato){
        var html = '<tr><td>'+dato.id+'</td><td>'+dato.categoria+'</td><td>'+dato.icono+'</td><td><button tid="'+dato.id+'" class="btn btn-sm btn-primary btn-accion btn-catlocacion-edit">Editar</button> <button tid="'+dato.id+'" class="btn btn-sm btn-danger btn-accion btn-catlocacion-delete">eliminar</button></td></tr>';
        $('#tabla-categorias tbody').append(html);
    },
    consulta: function(dato){
        $('.cont-form').show().removeClass('hide');
        $('.btn-nuevo').hide();
        $('#id_categoria').val(dato.id);
        $('#categoria').val(dato.categoria);
        $('#icono').val(dato.icono);
        $('.btn-catlocacion-guardar').addClass('hide');
        $('.btn-catlocacion-actualiza').removeClass('hide');
    },
    select: function(){
        $('#idcategoria').html('');
        peticionApi('get',rest+'catlocacion').done(catlocacion.rellenaSelect).fail(function(){console.log("Error");});
    },
    rellenaSelect: function(datos){
        $.each( datos, function( i, item ) {
            var html = '<option value="'+item.id+'">'+item.categoria+'</option>';
            $('#idcategoria').append(html);
        });
    }
};

var locacion =  {
    init: function(){
        peticionApi('get',rest+'locacion').done(locacion.listado).fail(function(){console.log("Error");});
    },
    listado: function(datos){
        $('#tabla-locaciones tbody').html('');
        if(datos.length > 0){
            $.each( datos, function( i, item ) {
                locacion.mostrar(item);
            });
        }else{
            $('#tabla-locaciones tbody').html('<p align="center">Sin Locaciones registradas</p>');
        }
    },
    mostrar: function(dato){
        if((dato.latitud != '') &&(dato.longitud != '')){
            var imagen = "<img src='https://maps.googleapis.com/maps/api/staticmap?center=" + dato.latitud + "," + dato.longitud + "&zoom=16&size=100x100&sensor=false&markers=color:blue%7Clabel:S%7C" + dato.latitud + "," + dato.longitud + "'>";
        } else{
            var imagen = "";
        }
        if(dato.imagen != ''){
            var foto = '<img class="foto" src="'+dato.imagen+'">';
        } else{
            var foto = "";
        }
        var html = '<tr><td>'+dato.id+'</td><td>'+dato.nombre+'</td><td class="hidden-xs">'+dato.descripcion+'</td><td>'+imagen+'<br>'+dato.direccion+'</td><td class="hidden-xs">'+dato.como_llegar+'</td><td class="hidden-xs">'+dato.historia+'</td><td class="hidden-xs">'+foto+'</td><td><button tid="'+dato.id+'" class="btn btn-sm btn-primary btn-accion btn-locacion-edit">Editar</button> <button tid="'+dato.id+'" class="btn btn-sm btn-danger btn-accion btn-locacion-delete">eliminar</button></td></tr>';
        $('#tabla-locaciones tbody').append(html);
    },
    consulta: function(dato){
        $('.cont-form').show().removeClass('hide');
        $('.btn-nuevo').hide();
        $('.btn-locacion-guardar').addClass('hide');
        $('.btn-locacion-actualiza').removeClass('hide');
        $('#id_locacion').val(dato.id);
        $('#nombre').val(dato.nombre);
        $('#descripcion').val(dato.descripcion);
        $('#categoria').val(dato.id);
        $('#latitud').val(dato.latitud);
        $('#longitud').val(dato.longitud);
        $('#direccion').val(dato.direccion);
        $('#como_llegar').val(dato.como_llegar);
        $('#historia').val(dato.historia);
        $('#imagen').val(dato.imagen);
        google.maps.event.trigger(map,'resize');
        marker.setPosition(new google.maps.LatLng(dato.latitud, dato.longitud));
        map.setCenter(new google.maps.LatLng(dato.latitud, dato.longitud));
    }
};




$('#btn_regresar').on('click', function(){
    window.location.replace("index.html");
});
$('.btn-nuevo').on('click', function(){
    $('.cont-form').show().removeClass('hide');
    $(this).hide();
    google.maps.event.trigger(map,'resize');
});
$('.btn-cancel').on('click', function(){
    cancela_formularios();
});
$('.btn_menu').on('click', function(){
    var url = $(this).attr('url');
    $('.panel').hide().addClass('hide');
    $('.'+url).show().removeClass('hide');
    catlocacion.select();
});

///Accciones CatLocacion
$('.btn-catlocacion-guardar').on('click', function(){
    var datos = $('#formulario-categorias').serialize();
    peticionApi('post',rest+'catlocacion/nuevo',datos).done(catlocacion.init).fail(function(){console.log("Error");});
    alert("Datos insertados!");
    cancela_formularios();
});

$('#tabla-categorias tbody').on('click','.btn-catlocacion-delete', function(){
    var id = $(this).attr('tid');
    peticionApi('post',rest+'catlocacion/eliminar/'+id).done(catlocacion.init).fail(function(){console.log("Error");});
    alert("Categoria Eliminada");
});

$('#tabla-categorias tbody').on('click','.btn-catlocacion-edit', function(){
    var id = $(this).attr('tid');
    peticionApi('get',rest+'catlocacion/consulta/'+id).done(catlocacion.consulta).fail(function(){console.log("Error");});
});

$('.btn-catlocacion-actualiza').on('click', function(){
    var id = $('#id_categoria').val();
    var datos = $('#formulario-categorias').serialize();
    peticionApi('post',rest+'catlocacion/editar/'+id,datos).done(catlocacion.init).fail(function(){console.log("Error");});
    cancela_formularios();
});

//Acciones Locacion
$('.btn-locacion-guardar').on('click', function(){
    $('#nombre, #como_llegar, #descripcion, #historia').val().replace(',','.').replace(" ","%20");
    var datos = $('#formulario-locaciones').serialize();
    peticionApi('post',rest+'locacion/nuevo',datos.replace("+","%20")).done(locacion.init).fail(function(){console.log("Error");});
    alert("Datos insertados!");
    cancela_formularios();
});

$('#tabla-locaciones tbody').on('click','.btn-locacion-delete', function(){
    var id = $(this).attr('tid');
    peticionApi('post',rest+'locacion/eliminar/'+id).done(locacion.init).fail(function(){console.log("Error");});
    alert("Locacion Eliminada");
});

$('#tabla-locaciones tbody').on('click','.btn-locacion-edit', function(){
    var id = $(this).attr('tid');
    peticionApi('get',rest+'locacion/consulta/'+id).done(locacion.consulta).fail(function(){console.log("Error");});
});

$('.btn-locacion-actualiza').on('click', function(){
    var id = $('#id_locacion').val();
    var datos = $('#formulario-locaciones').serialize();
    peticionApi('post',rest+'locacion/editar/'+id,datos).done(locacion.init).fail(function(){console.log("Error");});
    cancela_formularios();
});




catlocacion.init();
locacion.init();
catlocacion.select();



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

function limpiar_campos(){
    $('.input-app').val('');
}

function cancela_formularios(){
    limpiar_campos();
    $('.btn-catlocacion-guardar').removeClass('hide');
    $('.btn-catlocacion-actualiza').addClass('hide');
    $('.btn-locacion-guardar').removeClass('hide');
    $('.btn-locacion-actualiza').addClass('hide');
    $('.cont-form').hide().addClass('hide');
    $('.btn-nuevo').show();
}

function initialize() {
    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(17.06096368692176, -96.72480779266357)
    };
    $('#latitud').val(17.06096368692176);
    $('#longitud').val(-96.72480779266357);
    map = new google.maps.Map(document.getElementById('form-map'),
        mapOptions);
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(17.06096368692176, -96.72480779266357),
        map: map,
        title:"Ubicacion",
        draggable:true
    });
    google.maps.event.addListener(marker, 'dragend', function() {
        posicion = marker.getPosition();
        lat = posicion.lat();
        lon = posicion.lng();
        $('#latitud').val(lat);
        $('#longitud').val(lon);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);