package com.example.portal.repository;

import com.example.portal.model.ServiceOutlet;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ServiceOutletMapper {

    @Select("SELECT * FROM SERVICEOUTLET")
    List<ServiceOutlet> findAll();

    @Select("SELECT * FROM SERVICEOUTLET WHERE outlet_id = #{outletId}")
    ServiceOutlet findById(Integer outletId);

    @Select("SELECT * FROM SERVICEOUTLET WHERE outlet_city = #{city}")
    List<ServiceOutlet> findByCity(String city);

    @Insert("INSERT INTO SERVICEOUTLET (outlet_name, outlet_address, outlet_city, outlet_state, outlet_postal_code) " +
            "VALUES (#{outletName}, #{outletAddress}, #{outletCity}, #{outletState}, #{outletPostalCode})")
    @Options(useGeneratedKeys = true, keyProperty = "outletId")
    int insert(ServiceOutlet outlet);

    @Update("UPDATE SERVICEOUTLET SET outlet_name = #{outletName}, outlet_address = #{outletAddress}, " +
            "outlet_city = #{outletCity}, outlet_state = #{outletState}, outlet_postal_code = #{outletPostalCode} " +
            "WHERE outlet_id = #{outletId}")
    int update(ServiceOutlet outlet);

    @Delete("DELETE FROM SERVICEOUTLET WHERE outlet_id = #{outletId}")
    int delete(Integer outletId);
}
