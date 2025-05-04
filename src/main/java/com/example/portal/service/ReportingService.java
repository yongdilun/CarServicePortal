package com.example.portal.service;

import com.example.portal.model.ServiceAppointment;
import com.example.portal.repository.ServiceAppointmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final ServiceAppointmentMapper appointmentMapper;

    // Get customer service history
    public List<ServiceAppointment> getCustomerServiceHistory(Integer customerId) {
        return appointmentMapper.findByCustomerId(customerId);
    }

    // Get popular service types
    public List<Map<String, Object>> getPopularServiceTypes(LocalDate startDate, LocalDate endDate) {
        List<ServiceAppointment> appointments = appointmentMapper.findAllWithDetails();

        // Filter by date range if provided
        if (startDate != null && endDate != null) {
            appointments = appointments.stream()
                .filter(appointment -> {
                    if (appointment.getTimeSlot() == null) return false;

                    LocalDate appointmentDate = LocalDate.of(
                        appointment.getTimeSlot().getTimeYear(),
                        appointment.getTimeSlot().getTimeMonth(),
                        appointment.getTimeSlot().getTimeDay()
                    );

                    return !appointmentDate.isBefore(startDate) && !appointmentDate.isAfter(endDate);
                })
                .collect(Collectors.toList());
        }

        // Group by service type and count
        Map<String, Long> serviceTypeCounts = appointments.stream()
            .filter(appointment -> appointment.getService() != null)
            .collect(Collectors.groupingBy(
                appointment -> appointment.getService().getServiceType(),
                Collectors.counting()
            ));

        // Convert to list of maps for easier JSON serialization
        List<Map<String, Object>> result = new ArrayList<>();
        serviceTypeCounts.forEach((serviceType, count) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("serviceType", serviceType);
            item.put("count", count);
            result.add(item);
        });

        // Sort by count in descending order
        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));

        return result;
    }

    // Get busy periods analysis
    public Map<String, Object> getBusyPeriodsAnalysis(LocalDate startDate, LocalDate endDate) {
        List<ServiceAppointment> appointments = appointmentMapper.findAllWithDetails();

        // Filter by date range if provided
        if (startDate != null && endDate != null) {
            appointments = appointments.stream()
                .filter(appointment -> {
                    if (appointment.getTimeSlot() == null) return false;

                    LocalDate appointmentDate = LocalDate.of(
                        appointment.getTimeSlot().getTimeYear(),
                        appointment.getTimeSlot().getTimeMonth(),
                        appointment.getTimeSlot().getTimeDay()
                    );

                    return !appointmentDate.isBefore(startDate) && !appointmentDate.isAfter(endDate);
                })
                .collect(Collectors.toList());
        }

        // Count appointments by day of week
        Map<String, Long> dayOfWeekCounts = new HashMap<>();
        String[] daysOfWeek = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        for (String day : daysOfWeek) {
            dayOfWeekCounts.put(day, 0L);
        }

        appointments.forEach(appointment -> {
            if (appointment.getTimeSlot() != null) {
                LocalDate appointmentDate = LocalDate.of(
                    appointment.getTimeSlot().getTimeYear(),
                    appointment.getTimeSlot().getTimeMonth(),
                    appointment.getTimeSlot().getTimeDay()
                );

                String dayOfWeek = appointmentDate.getDayOfWeek().toString();
                dayOfWeek = dayOfWeek.charAt(0) + dayOfWeek.substring(1).toLowerCase();

                dayOfWeekCounts.put(dayOfWeek, dayOfWeekCounts.getOrDefault(dayOfWeek, 0L) + 1);
            }
        });

        // Count appointments by hour of day
        Map<Integer, Long> hourOfDayCounts = new HashMap<>();
        for (int hour = 8; hour <= 18; hour++) {
            hourOfDayCounts.put(hour, 0L);
        }

        appointments.forEach(appointment -> {
            if (appointment.getTimeSlot() != null && appointment.getTimeSlot().getTimeClocktime() != null) {
                LocalTime time = appointment.getTimeSlot().getTimeClocktime();
                int hour = time.getHour();

                hourOfDayCounts.put(hour, hourOfDayCounts.getOrDefault(hour, 0L) + 1);
            }
        });

        // Count appointments by month
        Map<String, Long> monthCounts = new HashMap<>();
        String[] months = {"January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"};
        for (String month : months) {
            monthCounts.put(month, 0L);
        }

        appointments.forEach(appointment -> {
            if (appointment.getTimeSlot() != null) {
                int monthIndex = appointment.getTimeSlot().getTimeMonth() - 1;
                String month = months[monthIndex];

                monthCounts.put(month, monthCounts.getOrDefault(month, 0L) + 1);
            }
        });

        // Prepare result
        Map<String, Object> result = new HashMap<>();
        result.put("byDayOfWeek", dayOfWeekCounts);
        result.put("byHourOfDay", hourOfDayCounts);
        result.put("byMonth", monthCounts);

        return result;
    }

    // Get staff performance metrics
    public List<Map<String, Object>> getStaffPerformanceMetrics(LocalDate startDate, LocalDate endDate) {
        List<ServiceAppointment> appointments = appointmentMapper.findAllWithDetails();

        // Filter by date range if provided
        if (startDate != null && endDate != null) {
            appointments = appointments.stream()
                .filter(appointment -> {
                    if (appointment.getTimeSlot() == null) return false;

                    LocalDate appointmentDate = LocalDate.of(
                        appointment.getTimeSlot().getTimeYear(),
                        appointment.getTimeSlot().getTimeMonth(),
                        appointment.getTimeSlot().getTimeDay()
                    );

                    return !appointmentDate.isBefore(startDate) && !appointmentDate.isAfter(endDate);
                })
                .collect(Collectors.toList());
        }

        // Group by staff
        Map<Integer, List<ServiceAppointment>> appointmentsByStaff = appointments.stream()
            .filter(appointment -> appointment.getStaffId() != null)
            .collect(Collectors.groupingBy(ServiceAppointment::getStaffId));

        // Calculate metrics for each staff
        List<Map<String, Object>> result = new ArrayList<>();

        appointmentsByStaff.forEach((staffId, staffAppointments) -> {
            Map<String, Object> staffMetrics = new HashMap<>();

            // Get staff name from first appointment
            String staffName = staffAppointments.stream()
                .filter(appointment -> appointment.getStaff() != null)
                .map(appointment -> appointment.getStaff().getStaffName())
                .findFirst()
                .orElse("Unknown Staff");

            // Count total appointments
            long totalAppointments = staffAppointments.size();

            // Count completed appointments
            long completedAppointments = staffAppointments.stream()
                .filter(appointment -> "COMPLETED".equals(appointment.getAppointmentStatus()))
                .count();

            // Count cancelled appointments
            long cancelledAppointments = staffAppointments.stream()
                .filter(appointment -> "CANCELLED".equals(appointment.getAppointmentStatus()))
                .count();

            // Calculate completion rate
            double completionRate = totalAppointments > 0
                ? (double) completedAppointments / totalAppointments * 100
                : 0;

            // Populate metrics
            staffMetrics.put("staffId", staffId);
            staffMetrics.put("staffName", staffName);
            staffMetrics.put("totalAppointments", totalAppointments);
            staffMetrics.put("completedAppointments", completedAppointments);
            staffMetrics.put("cancelledAppointments", cancelledAppointments);
            staffMetrics.put("completionRate", Math.round(completionRate * 100) / 100.0); // Round to 2 decimal places

            result.add(staffMetrics);
        });

        // Sort by total appointments in descending order
        result.sort((a, b) -> Long.compare(
            (Long) b.get("totalAppointments"),
            (Long) a.get("totalAppointments")
        ));

        return result;
    }

    // Get revenue reporting
    public Map<String, Object> getRevenueReporting(LocalDate startDate, LocalDate endDate) {
        List<ServiceAppointment> appointments = appointmentMapper.findAllWithDetails();

        // Filter by date range and completed status
        appointments = appointments.stream()
            .filter(appointment -> {
                if (appointment.getTimeSlot() == null) return false;
                if (!"COMPLETED".equals(appointment.getAppointmentStatus())) return false;

                if (startDate != null && endDate != null) {
                    LocalDate appointmentDate = LocalDate.of(
                        appointment.getTimeSlot().getTimeYear(),
                        appointment.getTimeSlot().getTimeMonth(),
                        appointment.getTimeSlot().getTimeDay()
                    );

                    return !appointmentDate.isBefore(startDate) && !appointmentDate.isAfter(endDate);
                }

                return true;
            })
            .collect(Collectors.toList());

        // Calculate total revenue
        double totalRevenue = appointments.stream()
            .filter(appointment -> appointment.getService() != null && appointment.getService().getServicePrice() != null)
            .mapToDouble(appointment -> appointment.getService().getServicePrice())
            .sum();

        // Group by service type
        Map<String, Double> revenueByService = new HashMap<>();

        appointments.forEach(appointment -> {
            if (appointment.getService() != null && appointment.getService().getServicePrice() != null) {
                String serviceType = appointment.getService().getServiceType();
                double price = appointment.getService().getServicePrice();

                revenueByService.put(
                    serviceType,
                    revenueByService.getOrDefault(serviceType, 0.0) + price
                );
            }
        });

        // Group by month
        Map<String, Double> revenueByMonth = new HashMap<>();

        appointments.forEach(appointment -> {
            if (appointment.getTimeSlot() != null &&
                appointment.getService() != null &&
                appointment.getService().getServicePrice() != null) {

                int year = appointment.getTimeSlot().getTimeYear();
                int month = appointment.getTimeSlot().getTimeMonth();
                String monthKey = year + "-" + String.format("%02d", month);
                double price = appointment.getService().getServicePrice();

                revenueByMonth.put(
                    monthKey,
                    revenueByMonth.getOrDefault(monthKey, 0.0) + price
                );
            }
        });

        // Sort revenue by month
        Map<String, Double> sortedRevenueByMonth = new TreeMap<>(revenueByMonth);

        // Prepare result
        Map<String, Object> result = new HashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("revenueByService", revenueByService);
        result.put("revenueByMonth", sortedRevenueByMonth);

        return result;
    }
}
