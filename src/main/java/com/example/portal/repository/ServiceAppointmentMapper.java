package com.example.portal.repository;

import com.example.portal.model.ServiceAppointment;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ServiceAppointmentMapper {

    @Results(id = "appointmentResultMap", value = {
        @Result(property = "appointmentId", column = "appointment_id"),
        @Result(property = "custId", column = "cust_id"),
        @Result(property = "serviceId", column = "service_id"),
        @Result(property = "outletId", column = "outlet_id"),
        @Result(property = "timeId", column = "time_id"),
        @Result(property = "vehId", column = "veh_id"),
        @Result(property = "staffId", column = "staff_id"),
        @Result(property = "appointmentCost", column = "appointment_cost"),
        @Result(property = "appointmentDuration", column = "appointment_duration"),
        @Result(property = "appointmentStatus", column = "appointment_status"),
        @Result(property = "estimatedFinishTime", column = "estimated_finish_time"),
        @Result(property = "customer", javaType = com.example.portal.model.Customer.class,
                column = "cust_id", one = @One(select = "com.example.portal.repository.CustomerMapper.findById")),
        @Result(property = "service", javaType = com.example.portal.model.ServiceType.class,
                column = "service_id", one = @One(select = "com.example.portal.repository.ServiceMapper.findById")),
        @Result(property = "outlet", javaType = com.example.portal.model.ServiceOutlet.class,
                column = "outlet_id", one = @One(select = "com.example.portal.repository.ServiceOutletMapper.findById")),
        @Result(property = "timeSlot", javaType = com.example.portal.model.TimeSlot.class,
                column = "time_id", one = @One(select = "com.example.portal.repository.TimeSlotMapper.findById")),
        @Result(property = "vehicle", javaType = com.example.portal.model.Vehicle.class,
                column = "veh_id", one = @One(select = "com.example.portal.repository.VehicleMapper.findById")),
        @Result(property = "staff", javaType = com.example.portal.model.Staff.class,
                column = "staff_id", one = @One(select = "com.example.portal.repository.StaffMapper.findById"))
    })

    @Select("SELECT * FROM SERVICEAPPOINTMENT WHERE appointment_id = #{appointmentId}")
    ServiceAppointment findById(Integer appointmentId);

    @Select("SELECT * FROM SERVICEAPPOINTMENT WHERE cust_id = #{custId}")
    List<ServiceAppointment> findByCustomerId(Integer custId);

    @Select("SELECT * FROM SERVICEAPPOINTMENT WHERE staff_id = #{staffId}")
    List<ServiceAppointment> findByStaffId(Integer staffId);

    @Select("SELECT sa.*, c.*, s.*, so.*, t.*, v.*, st.* " +
            "FROM SERVICEAPPOINTMENT sa " +
            "JOIN CUSTOMER c ON sa.cust_id = c.cust_id " +
            "JOIN SERVICE s ON sa.service_id = s.service_id " +
            "JOIN SERVICEOUTLET so ON sa.outlet_id = so.outlet_id " +
            "JOIN TIME t ON sa.time_id = t.time_id " +
            "JOIN VEHICLE v ON sa.veh_id = v.veh_id " +
            "JOIN STAFF st ON sa.staff_id = st.staff_id " +
            "WHERE sa.staff_id = #{staffId}")
    @ResultMap("appointmentResultMap")
    List<ServiceAppointment> findByStaffIdWithDetails(Integer staffId);

    @Select("SELECT sa.*, c.*, s.*, so.*, t.*, v.*, st.* " +
            "FROM SERVICEAPPOINTMENT sa " +
            "JOIN CUSTOMER c ON sa.cust_id = c.cust_id " +
            "JOIN SERVICE s ON sa.service_id = s.service_id " +
            "JOIN SERVICEOUTLET so ON sa.outlet_id = so.outlet_id " +
            "JOIN TIME t ON sa.time_id = t.time_id " +
            "JOIN VEHICLE v ON sa.veh_id = v.veh_id " +
            "JOIN STAFF st ON sa.staff_id = st.staff_id " +
            "WHERE sa.staff_id = #{staffId} " +
            "AND t.time_year = #{year} AND t.time_month = #{month} AND t.time_day = #{day}")
    @ResultMap("appointmentResultMap")
    List<ServiceAppointment> findByStaffIdAndDateWithDetails(Integer staffId, Short year, Short month, Short day);

    @Select("SELECT * FROM SERVICEAPPOINTMENT WHERE outlet_id = #{outletId}")
    List<ServiceAppointment> findByOutletId(Integer outletId);

    @Select("SELECT sa.*, c.*, s.*, so.*, t.*, v.*, st.* " +
            "FROM SERVICEAPPOINTMENT sa " +
            "JOIN CUSTOMER c ON sa.cust_id = c.cust_id " +
            "JOIN SERVICE s ON sa.service_id = s.service_id " +
            "JOIN SERVICEOUTLET so ON sa.outlet_id = so.outlet_id " +
            "JOIN TIME t ON sa.time_id = t.time_id " +
            "JOIN VEHICLE v ON sa.veh_id = v.veh_id " +
            "JOIN STAFF st ON sa.staff_id = st.staff_id " +
            "WHERE sa.outlet_id = #{outletId}")
    @ResultMap("appointmentResultMap")
    List<ServiceAppointment> findByOutletIdWithDetails(Integer outletId);

    @Select("SELECT sa.*, c.*, s.*, so.*, t.*, v.*, st.* " +
            "FROM SERVICEAPPOINTMENT sa " +
            "JOIN CUSTOMER c ON sa.cust_id = c.cust_id " +
            "JOIN SERVICE s ON sa.service_id = s.service_id " +
            "JOIN SERVICEOUTLET so ON sa.outlet_id = so.outlet_id " +
            "JOIN TIME t ON sa.time_id = t.time_id " +
            "JOIN VEHICLE v ON sa.veh_id = v.veh_id " +
            "JOIN STAFF st ON sa.staff_id = st.staff_id " +
            "WHERE sa.outlet_id = #{outletId} " +
            "AND t.time_year = #{year} AND t.time_month = #{month} AND t.time_day = #{day}")
    @ResultMap("appointmentResultMap")
    List<ServiceAppointment> findByOutletIdAndDate(Integer outletId, Short year, Short month, Short day);

    @Insert("INSERT INTO SERVICEAPPOINTMENT (cust_id, service_id, outlet_id, time_id, veh_id, staff_id, " +
            "appointment_cost, appointment_duration, appointment_status, estimated_finish_time) " +
            "VALUES (#{custId}, #{serviceId}, #{outletId}, #{timeId}, #{vehId}, #{staffId}, " +
            "#{appointmentCost}, #{appointmentDuration}, #{appointmentStatus}, #{estimatedFinishTime})")
    @Options(useGeneratedKeys = true, keyProperty = "appointmentId")
    int insert(ServiceAppointment appointment);

    @Update("UPDATE SERVICEAPPOINTMENT SET cust_id = #{custId}, service_id = #{serviceId}, " +
            "outlet_id = #{outletId}, time_id = #{timeId}, veh_id = #{vehId}, staff_id = #{staffId}, " +
            "appointment_cost = #{appointmentCost}, appointment_duration = #{appointmentDuration}, " +
            "appointment_status = #{appointmentStatus}, estimated_finish_time = #{estimatedFinishTime} " +
            "WHERE appointment_id = #{appointmentId}")
    int update(ServiceAppointment appointment);

    @Delete("DELETE FROM SERVICEAPPOINTMENT WHERE appointment_id = #{appointmentId}")
    int delete(Integer appointmentId);

    @Select("SELECT sa.*, c.*, s.*, so.*, t.*, v.*, st.* " +
            "FROM SERVICEAPPOINTMENT sa " +
            "JOIN CUSTOMER c ON sa.cust_id = c.cust_id " +
            "JOIN SERVICE s ON sa.service_id = s.service_id " +
            "JOIN SERVICEOUTLET so ON sa.outlet_id = so.outlet_id " +
            "JOIN TIME t ON sa.time_id = t.time_id " +
            "JOIN VEHICLE v ON sa.veh_id = v.veh_id " +
            "JOIN STAFF st ON sa.staff_id = st.staff_id " +
            "WHERE sa.appointment_id = #{appointmentId}")
    @ResultMap("appointmentResultMap")
    ServiceAppointment findByIdWithDetails(Integer appointmentId);

    @Select("SELECT sa.*, c.*, s.*, so.*, t.*, v.*, st.* " +
            "FROM SERVICEAPPOINTMENT sa " +
            "JOIN CUSTOMER c ON sa.cust_id = c.cust_id " +
            "JOIN SERVICE s ON sa.service_id = s.service_id " +
            "JOIN SERVICEOUTLET so ON sa.outlet_id = so.outlet_id " +
            "JOIN TIME t ON sa.time_id = t.time_id " +
            "JOIN VEHICLE v ON sa.veh_id = v.veh_id " +
            "LEFT JOIN STAFF st ON sa.staff_id = st.staff_id")
    @ResultMap("appointmentResultMap")
    List<ServiceAppointment> findAllWithDetails();
}
