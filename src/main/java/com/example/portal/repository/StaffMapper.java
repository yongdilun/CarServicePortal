package com.example.portal.repository;

import com.example.portal.model.Staff;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface StaffMapper {

    @Select("SELECT * FROM STAFF WHERE staff_id = #{staffId}")
    @Results({
        @Result(property = "staffId", column = "staff_id"),
        @Result(property = "staffName", column = "staff_name"),
        @Result(property = "staffRole", column = "staff_role"),
        @Result(property = "staffPhone", column = "staff_phone"),
        @Result(property = "staffPassword", column = "staff_password"),
        @Result(property = "outletId", column = "outlet_id"),
        @Result(property = "outlet", javaType = com.example.portal.model.ServiceOutlet.class,
                column = "outlet_id", one = @One(select = "com.example.portal.repository.ServiceOutletMapper.findById"))
    })
    Staff findById(Integer staffId);

    @Select("SELECT * FROM STAFF WHERE staff_name = #{name}")
    Staff findByName(String name);

    @Select("SELECT * FROM STAFF WHERE outlet_id = #{outletId}")
    @Results({
        @Result(property = "staffId", column = "staff_id"),
        @Result(property = "staffName", column = "staff_name"),
        @Result(property = "staffRole", column = "staff_role"),
        @Result(property = "staffPhone", column = "staff_phone"),
        @Result(property = "staffPassword", column = "staff_password"),
        @Result(property = "outletId", column = "outlet_id")
    })
    List<Staff> findByOutletId(Integer outletId);

    @Insert("INSERT INTO STAFF (staff_name, staff_role, staff_phone, staff_password, outlet_id) " +
            "VALUES (#{staffName}, #{staffRole}, #{staffPhone}, #{staffPassword}, #{outletId})")
    @Options(useGeneratedKeys = true, keyProperty = "staffId")
    int insert(Staff staff);

    @Update("UPDATE STAFF SET staff_name = #{staffName}, staff_role = #{staffRole}, " +
            "staff_phone = #{staffPhone}, outlet_id = #{outletId} WHERE staff_id = #{staffId}")
    int update(Staff staff);

    @Update("UPDATE STAFF SET staff_password = #{password} WHERE staff_id = #{staffId}")
    int updatePassword(Integer staffId, String password);

    @Delete("DELETE FROM STAFF WHERE staff_id = #{staffId}")
    int delete(Integer staffId);
}
