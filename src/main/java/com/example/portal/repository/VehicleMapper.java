package com.example.portal.repository;

import com.example.portal.model.Vehicle;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface VehicleMapper {

    @Select("SELECT * FROM VEHICLE WHERE veh_id = #{vehId}")
    Vehicle findById(Integer vehId);

    @Select("SELECT * FROM VEHICLE WHERE veh_plateno = #{plateNo}")
    Vehicle findByPlateNo(String plateNo);

    @Select("SELECT * FROM VEHICLE WHERE cust_id = #{custId}")
    List<Vehicle> findByCustomerId(Integer custId);

    @Select("SELECT * FROM VEHICLE")
    List<Vehicle> findAll();

    @Insert("INSERT INTO VEHICLE (veh_plateno, veh_model, veh_brand, veh_type, veh_year, cust_id) " +
            "VALUES (#{vehPlateno}, #{vehModel}, #{vehBrand}, #{vehType}, #{vehYear}, #{custId})")
    @Options(useGeneratedKeys = true, keyProperty = "vehId")
    int insert(Vehicle vehicle);

    @Update("UPDATE VEHICLE SET veh_plateno = #{vehPlateno}, veh_model = #{vehModel}, " +
            "veh_brand = #{vehBrand}, veh_type = #{vehType}, veh_year = #{vehYear}, " +
            "cust_id = #{custId} WHERE veh_id = #{vehId}")
    int update(Vehicle vehicle);

    @Delete("DELETE FROM VEHICLE WHERE veh_id = #{vehId}")
    int delete(Integer vehId);
}
