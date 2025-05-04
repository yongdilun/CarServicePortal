package com.example.portal.repository;

import com.example.portal.model.ServiceType;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ServiceMapper {
    @Select("SELECT * FROM SERVICE")
    List<ServiceType> findAll();

    @Select("SELECT * FROM SERVICE WHERE service_id = #{serviceId}")
    ServiceType findById(Integer serviceId);

    @Select("SELECT * FROM SERVICE WHERE service_type = #{type}")
    List<ServiceType> findByType(String type);

    @Select("SELECT * FROM SERVICE WHERE service_category = #{category}")
    List<ServiceType> findByCategory(String category);

    @Insert("INSERT INTO SERVICE (service_type, service_desc, service_category, service_price, service_duration) " +
            "VALUES (#{serviceType}, #{serviceDesc}, #{serviceCategory}, #{servicePrice}, #{serviceDuration})")
    @Options(useGeneratedKeys = true, keyProperty = "serviceId")
    int insert(ServiceType service);

    @Update("UPDATE SERVICE SET service_type = #{serviceType}, service_desc = #{serviceDesc}, " +
            "service_category = #{serviceCategory}, service_price = #{servicePrice}, " +
            "service_duration = #{serviceDuration} WHERE service_id = #{serviceId}")
    int update(ServiceType service);

    @Delete("DELETE FROM SERVICE WHERE service_id = #{serviceId}")
    int delete(Integer serviceId);
}
