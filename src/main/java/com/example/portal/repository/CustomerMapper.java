package com.example.portal.repository;

import com.example.portal.model.Customer;
import org.apache.ibatis.annotations.*;

@Mapper
public interface CustomerMapper {

    @Select("SELECT * FROM CUSTOMER WHERE cust_id = #{custId}")
    Customer findById(Integer custId);

    @Select("SELECT * FROM CUSTOMER WHERE cust_email = #{email}")
    Customer findByEmail(String email);

    @Select("SELECT * FROM CUSTOMER WHERE cust_name = #{name}")
    Customer findByName(String name);

    @Insert("INSERT INTO CUSTOMER (cust_name, cust_phone, cust_email, cust_address, cust_password) " +
            "VALUES (#{custName}, #{custPhone}, #{custEmail}, #{custAddress}, #{custPassword})")
    @Options(useGeneratedKeys = true, keyProperty = "custId")
    int insert(Customer customer);

    @Update("UPDATE CUSTOMER SET cust_name = #{custName}, cust_phone = #{custPhone}, " +
            "cust_email = #{custEmail}, cust_address = #{custAddress} " +
            "WHERE cust_id = #{custId}")
    int update(Customer customer);

    @Update("UPDATE CUSTOMER SET cust_password = #{password} WHERE cust_id = #{custId}")
    int updatePassword(Integer custId, String password);

    @Delete("DELETE FROM CUSTOMER WHERE cust_id = #{custId}")
    int delete(Integer custId);
}
