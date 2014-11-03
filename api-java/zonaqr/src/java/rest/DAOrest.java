/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package rest;

import java.sql.*;
import java.util.*;

import org.json.JSONObject;
import org.json.JSONArray;

/**
 *
 * @author TRON
 */
public class DAOrest {
    private Connection conexion;

	public Connection conectar()
	{
		try
		{
			Class.forName("com.mysql.jdbc.Driver");
			conexion = DriverManager.getConnection
			("jdbc:mysql://localhost:8889/zonaqr?user=root&password=root");
		}
		catch(ClassNotFoundException cnfe)
		{
			System.out.println(cnfe.getMessage());
		}
		catch(SQLException sqle)
		{
			System.out.println(sqle.getMessage());
		}
		return conexion;
	}
        
	public void desconectar(Connection conexion)
	{
		try
		{
			if(conexion!=null)
			{
				conexion.close();
				conexion=null;
			}
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}

        public boolean verifica_tabla(String tabla){
            try {
                DatabaseMetaData md = conexion.getMetaData();
                ResultSet rs = md.getTables(null, null, tabla, null);
                if (rs.next()) {
                  return true;
                }else{
                return false;
                }
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                sqle.printStackTrace();
                return false;
            }
            
        }
        
        public ArrayList consulta_columnas(String tabla){
            ArrayList columnas = new ArrayList();
            int i = 0;
            try {
                DatabaseMetaData md = conexion.getMetaData();
                ResultSet result = md.getColumns(null, null, tabla, null);
                while(result.next()){
                    columnas.add(result.getString("COLUMN_NAME"));
                    i++;
                }
                return columnas;
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                sqle.printStackTrace();
                return columnas;
            }
            
        }
        //Inserta en tabla
        public boolean altaDB(String tabla, String campos, String valores){
            try{
                Statement st = this.conexion.createStatement();
                st.executeUpdate("INSERT INTO "+tabla+"("+campos+") VALUES("+valores+");");
                return true;
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                sqle.printStackTrace();
                return false;
            }
        }

        public boolean actualizaDB(String tabla, String id, String actualizacion){
            try{
                Statement st = this.conexion.createStatement();
                st.executeUpdate("UPDATE "+tabla+" SET "+actualizacion+" WHERE id="+id+";");
                return true;
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                sqle.printStackTrace();
                return false;
            }
        }


        public boolean eliminaDB(String tabla, String id){
            try{
                Statement st = this.conexion.createStatement();
                st.executeUpdate("DELETE FROM "+tabla+" WHERE id="+id);
                return true;
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                sqle.printStackTrace();
                return false;
            }
        }


        //Consulta listado de una tabla
        public JSONArray radioDB(String tabla, String latitud, String longitud, String radio){
            ResultSet resultado = null;
            int total = 0;
            JSONArray jsonArray = new JSONArray();
            try {
                Statement st = this.conexion.createStatement();
                resultado = st.executeQuery("SELECT id, nombre, latitud, longitud, categoria, descripcion, ( 6371 * acos( cos( radians('"+latitud+"') ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians('"+longitud+"') ) + sin( radians('"+latitud+"') ) * sin( radians( latitud ) ) ) ) AS distance FROM "+tabla+" HAVING distance < '"+radio+"' ORDER BY distance");
                if (resultado.last()) {
                  total = resultado.getRow();
                  resultado.beforeFirst();
                }
                while (resultado.next()) {
                    int total_rows = resultado.getMetaData().getColumnCount();
                    JSONObject obj = new JSONObject();
                    for (int i = 0; i < total_rows; i++) {
                        obj.put(resultado.getMetaData().getColumnLabel(i + 1)
                                .toLowerCase(), resultado.getObject(i + 1));
                    }
                    jsonArray.put(obj);
                }
            return jsonArray;
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                return jsonArray;
            }
        }


        //Consulta listado de una tabla
        public JSONArray listadoDB(String tabla){
            ResultSet resultado = null;
            int total = 0;
            JSONArray jsonArray = new JSONArray();
            try {
                Statement st = this.conexion.createStatement();
                resultado = st.executeQuery("SELECT * FROM "+tabla);
                if (resultado.last()) {
                  total = resultado.getRow();
                  resultado.beforeFirst(); 
                }
                while (resultado.next()) {
                    int total_rows = resultado.getMetaData().getColumnCount();
                    JSONObject obj = new JSONObject();
                    for (int i = 0; i < total_rows; i++) {
                        obj.put(resultado.getMetaData().getColumnLabel(i + 1)
                                .toLowerCase(), resultado.getObject(i + 1));
                    }
                    jsonArray.put(obj);
                }
            return jsonArray;
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                return jsonArray;
            }
        }
        //Consulta datos de una tabla como referencia un ID
        public JSONObject consultaDB(String tabla, String id){
            ResultSet resultado = null;
            int total = 0;
            JSONObject jsonObject = new JSONObject();
            Integer identificador = Integer.parseInt(id);
            try {
                Statement st = this.conexion.createStatement();
                resultado = st.executeQuery("SELECT * FROM "+tabla+" WHERE id="+identificador);
                if (resultado.last()) {
                  total = resultado.getRow();
                  resultado.beforeFirst();
                }
                if(total>0){
                    while (resultado.next()) {
                        int total_rows = resultado.getMetaData().getColumnCount();
                        for (int i = 0; i < total_rows; i++) {
                            jsonObject.put(resultado.getMetaData().getColumnLabel(i + 1)
                                    .toLowerCase(), resultado.getObject(i + 1));
                        }
                    }
                }
                else {
                    jsonObject.put("Error","No hay elementos para el ID solicitado");
                }
            return jsonObject;
            }
            catch (SQLException sqle) {
                sqle.getMessage();
                return jsonObject;
            }
        }
}
