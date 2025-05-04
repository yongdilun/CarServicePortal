package com.example.portal.repository;

import com.example.portal.model.TimeSlot;
import org.apache.ibatis.annotations.*;

import java.time.LocalTime;
import java.util.List;

@Mapper
public interface TimeSlotMapper {

    @Select("SELECT * FROM TIME WHERE time_id = #{timeId}")
    TimeSlot findById(Integer timeId);

    @Select("SELECT * FROM TIME WHERE time_year = #{year} AND time_month = #{month} AND time_day = #{day}")
    List<TimeSlot> findByDate(Short year, Short month, Short day);

    @Select("SELECT * FROM TIME WHERE time_year = #{year} AND time_month = #{month} " +
            "AND time_day = #{day} AND time_clocktime = #{time}")
    List<TimeSlot> findByDateAndTime(Short year, Short month, Short day, LocalTime time);

    @Insert("INSERT INTO TIME (time_year, time_quarter, time_month, time_day, time_clocktime) " +
            "VALUES (#{timeYear}, #{timeQuarter}, #{timeMonth}, #{timeDay}, #{timeClocktime})")
    @Options(useGeneratedKeys = true, keyProperty = "timeId")
    int insert(TimeSlot timeSlot);

    @Update("UPDATE TIME SET time_year = #{timeYear}, time_quarter = #{timeQuarter}, " +
            "time_month = #{timeMonth}, time_day = #{timeDay}, time_clocktime = #{timeClocktime} " +
            "WHERE time_id = #{timeId}")
    int update(TimeSlot timeSlot);

    @Delete("DELETE FROM TIME WHERE time_id = #{timeId}")
    int delete(Integer timeId);
}
