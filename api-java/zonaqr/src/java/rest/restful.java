package rest;

import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.util.*;
import java.sql.*;

import org.json.JSONObject;
import org.json.JSONArray;

public class restful extends HttpServlet {
    private DAOrest control;    
    public String mensaje;
    public String tabla;
    public String metodo;
    public String id;

    public void init(ServletConfig config) throws ServletException
	{
    	super.init(config);
        this.control = new DAOrest();
	}      

    public boolean verifica_uri(String[] uri_split, String[] metodos){
      boolean tabla_valida = this.control.verifica_tabla(uri_split[1]);
          if(tabla_valida){
              this.mensaje = "ok";
              this.tabla = uri_split[1];
              try{
                  this.metodo = uri_split[2];
                  try{
                      try {
                          Integer.parseInt(uri_split[3]); 
                            this.id = uri_split[3];
                          } catch(NumberFormatException e) { 
                            this.id=null;
                          }
                      }
                      catch( IndexOutOfBoundsException e ){
                          this.id=null;
                      }
              }
              catch( IndexOutOfBoundsException e ){
                  this.metodo=null;
              }
              if(this.metodo!=null){
                  return Arrays.asList(metodos).contains(this.metodo);
              }else{
              return true;
              }
          }else{
              this.mensaje="Recurso no valido";
              this.tabla=null;
              this.metodo=null;
              this.id=null;
              return false;
          }
    }
    
    public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

      Connection conexion;
      conexion = this.control.conectar();
      JSONArray resultadoLista = new JSONArray();
      JSONObject resultadoObjeto = new JSONObject();
      response.addHeader("Access-Control-Allow-Origin", "*");
      response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
      response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
      response.addHeader("Access-Control-Max-Age", "1728000");
      response.setContentType("application/json");      

      String[] metodos_permitidos = {"listado","consulta","radio"};

      PrintWriter out = response.getWriter();
      String uri = request.getPathInfo();
      String[] uri_split = uri.split("/");

      if(uri_split.length > 1){
          boolean check_uri = this.verifica_uri(uri_split, metodos_permitidos);
          if(check_uri){
              if(this.metodo != null){
                  if(this.metodo.equals("listado")){
                      resultadoLista = this.control.listadoDB(this.tabla);
                      out.println(resultadoLista);
                  }
                  else if(this.metodo.equals("consulta")){
                      if(this.id == null){
                          resultadoObjeto.put("Error", "Recurso no disponible");
                          out.println(resultadoObjeto);
                      }
                      else{
                          resultadoObjeto = this.control.consultaDB(this.tabla, this.id);
                          out.println(resultadoObjeto);
                      }                      
                  }
                  else if(this.metodo.equals("radio")){
                      if(this.id == null){
                          resultadoObjeto.put("Error", "Recurso no disponible");
                          out.println(resultadoObjeto);
                      }
                      else{
                          String latitud = uri_split[4];
                          String longitud = uri_split[5];
                          String radio = uri_split[6];
                          resultadoLista = this.control.radioDB(this.tabla, latitud, longitud, radio);
                          out.println(resultadoLista);
                      }
                  }

              }else{
                resultadoLista = this.control.listadoDB(this.tabla);
                out.println(resultadoLista);
              }
          }
          else{
              resultadoObjeto.put("Error", "Recurso no disponible");
              out.println(resultadoObjeto);
          }
      }
      else{
          response.sendRedirect("/zonaqr/index.jsp");
      }
      out.close();
      this.control.desconectar(conexion);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

      Connection conexion;
      conexion = this.control.conectar();
      JSONArray resultadoLista = new JSONArray();
      JSONObject resultadoObjeto = new JSONObject();
      response.addHeader("Access-Control-Allow-Origin", "*");
      response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
      response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
      response.addHeader("Access-Control-Max-Age", "1728000");
      response.setContentType("application/json");

      ArrayList columnas_tabla;

      String[] metodos_permitidos = {"nuevo","editar","eliminar"};

      PrintWriter out = response.getWriter();
      String uri = request.getPathInfo();
      String[] uri_split = uri.split("/");

      if(uri_split.length > 1){
          boolean check_uri = this.verifica_uri(uri_split, metodos_permitidos);
          if(check_uri){
              if(this.metodo != null){
                  if(this.metodo.equals("nuevo")){
                      columnas_tabla = this.control.consulta_columnas(this.tabla);
                      boolean fields = false;
                      ArrayList columnas_query = new ArrayList();
                      ArrayList valores_query = new ArrayList();                      
                      for (int i = 0; i < columnas_tabla.size(); i++) {
                            if(!(columnas_tabla.get(i).equals("id") || columnas_tabla.get(i).equals("fecha"))){                                
                                if(request.getParameter((String)columnas_tabla.get(i)) != null){
                                    columnas_query.add(columnas_tabla.get(i));
                                    valores_query.add(request.getParameter((String)columnas_tabla.get(i)));
                                    fields=true;
                                }                                
                            }
                        }
                      if(fields==true){
                          if(this.control.altaDB(this.tabla, columnas_query.toString().replace("[", "").replace("]", ""), valores_query.toString().replace("[", "'").replace("]", "'").replace(",", "','"))){
                            resultadoObjeto.put("Estado OK", "Dato insertado exitosamente");
                            out.println(resultadoObjeto);
                          }
                          else{
                            resultadoObjeto.put("Error", "Ha ocurrido un error al momento de insertar, probablemente brujeria.");
                            out.println(resultadoObjeto);
                          }                          
                      }
                      else{
                          resultadoObjeto.put("Error", "Debes enviar al menos un valor para insertar");
                          out.println(resultadoObjeto);
                      }
                  }
                  else if(this.metodo.equals("editar")){
                      if(this.id == null){
                          resultadoObjeto.put("Error", "Recurso no disponible");
                          out.println(resultadoObjeto);
                          }
                          else{
                              columnas_tabla = this.control.consulta_columnas(this.tabla);
                              boolean fields = false;
                              ArrayList actualizacion_query = new ArrayList();
                              for (int i = 0; i < columnas_tabla.size(); i++) {
                                if(!(columnas_tabla.get(i).equals("id") || columnas_tabla.get(i).equals("fecha"))){
                                    if(request.getParameter((String)columnas_tabla.get(i)) != null){
                                        String update = columnas_tabla.get(i)+"='"+request.getParameter((String)columnas_tabla.get(i))+"'";
                                        actualizacion_query.add(update); 
                                        fields=true;
                                    }
                                }
                              }
                              if(fields==true){                                  
                                  if(this.control.actualizaDB(this.tabla, this.id, actualizacion_query.toString().replace("[", "").replace("]", ""))){
                                    resultadoObjeto.put("Estado OK", "Dato actualizado exitosamente");
                                    out.println(resultadoObjeto);
                                  }
                                  else{
                                    resultadoObjeto.put("Error", "Ha ocurrido un error al momento de insertar, probablemente brujeria.");
                                    out.println(resultadoObjeto);
                                  }
                              }
                              else{
                                  resultadoObjeto.put("Error", "Debes enviar al menos un valor para insertar");
                                  out.println(resultadoObjeto);
                              }
                        }
                  }
                  else if(this.metodo.equals("eliminar")){
                      if(this.id == null){
                          resultadoObjeto.put("Error", "Recurso no disponible");
                          out.println(resultadoObjeto);
                      }
                      else{
                          if(this.control.eliminaDB(this.tabla, this.id )){
                            resultadoObjeto.put("Estado OK", "Dato eliminado exitosamente");
                            out.println(resultadoObjeto);
                          }
                          else{
                            resultadoObjeto.put("Error", "Ha ocurrido un error al momento de eliminar, probablemente brujeria.");
                            out.println(resultadoObjeto);
                          }
                      }
                  }
              }else{
                resultadoLista = this.control.listadoDB(this.tabla);
                out.println(resultadoLista);
              }
          }
          else{
              resultadoObjeto.put("Error", "Recurso no disponible");
              out.println(resultadoObjeto);
          }         
      }
      else{
          response.sendRedirect("/zonaqr/index.jsp");
      }
      out.close();
      this.control.desconectar(conexion);
    }
}