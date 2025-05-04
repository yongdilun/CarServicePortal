package com.example.portal.controller;

import com.example.portal.model.*;
import com.example.portal.repository.*;
import com.example.portal.service.NotificationService;
import com.example.portal.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ServiceAppointmentController {

    private final ServiceAppointmentMapper appointmentMapper;
    private final CustomerMapper customerMapper;
    private final StaffMapper staffMapper;
    private final VehicleMapper vehicleMapper;
    private final ServiceMapper serviceMapper;
    private final ServiceOutletMapper outletMapper;
    private final TimeSlotMapper timeSlotMapper;
    private final TimeSlotService timeSlotService;
    private final NotificationService notificationService;

    // Customer endpoints
    @GetMapping("/customer/appointments")
    public ResponseEntity<?> getCustomerAppointments(@RequestParam Integer custId) {
        List<ServiceAppointment> appointments = appointmentMapper.findByCustomerId(custId);
        return ResponseEntity.ok(appointments);
    }

    @PostMapping("/customer/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody ServiceAppointment appointment) {
        // Validate customer
        Customer customer = customerMapper.findById(appointment.getCustId());
        if (customer == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid customer ID"));
        }

        // Validate vehicle
        Vehicle vehicle = vehicleMapper.findById(appointment.getVehId());
        if (vehicle == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid vehicle ID"));
        }

        // Validate service
        ServiceType service = serviceMapper.findById(appointment.getServiceId());
        if (service == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid service ID"));
        }

        // Validate outlet
        ServiceOutlet outlet = outletMapper.findById(appointment.getOutletId());
        if (outlet == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid outlet ID"));
        }

        // Get or create the time slot
        TimeSlot timeSlot;
        if (appointment.getTimeId() != null) {
            // If a time ID is provided, validate it
            timeSlot = timeSlotMapper.findById(appointment.getTimeId());
            if (timeSlot == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid time slot ID"));
            }
        } else if (appointment.getTimeSlot() != null) {
            // If time details are provided, get or create the time slot
            TimeSlot requestedSlot = appointment.getTimeSlot();
            if (requestedSlot.getTimeYear() == null || requestedSlot.getTimeMonth() == null ||
                requestedSlot.getTimeDay() == null || requestedSlot.getTimeClocktime() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Incomplete time slot information"));
            }

            // Get or create the time slot
            timeSlot = timeSlotService.getOrCreateTimeSlot(
                requestedSlot.getTimeYear(),
                requestedSlot.getTimeMonth(),
                requestedSlot.getTimeDay(),
                requestedSlot.getTimeClocktime()
            );

            // Set the time ID in the appointment
            appointment.setTimeId(timeSlot.getTimeId());
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Time slot information is required"));
        }

        // Set initial status to PENDING (waiting for staff confirmation)
        appointment.setAppointmentStatus("PENDING");

        // When a customer books an appointment, assign it to the "unassigned" staff
        // A real staff member will be assigned during confirmation
        appointment.setStaffId(9999); // Unassigned staff ID

        // Insert appointment
        appointmentMapper.insert(appointment);

        // Format date for notification
        String appointmentDate = timeSlot.getTimeYear() + "-" +
                                timeSlot.getTimeMonth() + "-" +
                                timeSlot.getTimeDay() + " at " +
                                timeSlot.getTimeClocktime();

        // Send notification to customer
        notificationService.notifyAppointmentBooked(
            customer.getCustId(),
            "customer",
            appointment.getAppointmentId(),
            service.getServiceType(),
            appointmentDate,
            customer.getCustEmail()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", appointment.getAppointmentId());
        response.put("status", appointment.getAppointmentStatus());
        response.put("message", "Appointment created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/customer/appointments/{id}")
    public ResponseEntity<?> getAppointmentDetails(@PathVariable Integer id) {
        ServiceAppointment appointment = appointmentMapper.findByIdWithDetails(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(appointment);
    }

    // Staff endpoints
    @GetMapping("/staff/appointments")
    public ResponseEntity<?> getStaffAppointments(@RequestParam Integer staffId) {
        // First, get the staff's outlet ID
        Staff staff = staffMapper.findById(staffId);
        if (staff == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid staff ID"));
        }

        // Get all appointments from the staff's outlet
        List<ServiceAppointment> appointments = appointmentMapper.findByOutletIdWithDetails(staff.getOutletId());
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/staff/appointments/schedule")
    public ResponseEntity<?> getStaffSchedule(
            @RequestParam Integer staffId,
            @RequestParam String date) {

        // Validate staff
        Staff staff = staffMapper.findById(staffId);
        if (staff == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid staff ID"));
        }

        try {
            // Parse the date
            String[] dateParts = date.split("-");
            if (dateParts.length != 3) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
            }

            Short year = Short.parseShort(dateParts[0]);
            Short month = Short.parseShort(dateParts[1]);
            Short day = Short.parseShort(dateParts[2]);

            // Get appointments for the staff on the specified date
            List<ServiceAppointment> appointments = appointmentMapper.findByStaffIdAndDateWithDetails(staffId, year, month, day);

            // Filter to only include confirmed appointments (SCHEDULED, IN_PROGRESS)
            List<ServiceAppointment> confirmedAppointments = appointments.stream()
                .filter(a -> "SCHEDULED".equals(a.getAppointmentStatus()) ||
                             "IN_PROGRESS".equals(a.getAppointmentStatus()))
                .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(confirmedAppointments);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
        }
    }

    @GetMapping("/staff/appointments/{id}")
    public ResponseEntity<?> getStaffAppointmentDetails(@PathVariable Integer id) {
        ServiceAppointment appointment = appointmentMapper.findByIdWithDetails(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(appointment);
    }

    @PutMapping("/staff/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> statusUpdate) {

        ServiceAppointment appointment = appointmentMapper.findById(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }

        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status cannot be empty"));
        }

        appointment.setAppointmentStatus(newStatus);
        appointmentMapper.update(appointment);

        // Get full appointment details for notification
        ServiceAppointment fullAppointment = appointmentMapper.findByIdWithDetails(id);

        // Use the simplified notification method
        notificationService.notifyCustomerAboutAppointment(fullAppointment, newStatus);

        return ResponseEntity.ok(Map.of(
            "id", appointment.getAppointmentId(),
            "status", appointment.getAppointmentStatus(),
            "message", "Appointment status updated successfully"
        ));
    }

    @PutMapping("/staff/appointments/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> confirmationData) {

        ServiceAppointment appointment = appointmentMapper.findById(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }

        // Only pending appointments can be confirmed
        if (!"PENDING".equals(appointment.getAppointmentStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Only pending appointments can be confirmed"
            ));
        }

        // Update the appointment status to SCHEDULED
        appointment.setAppointmentStatus("SCHEDULED");

        // Set the estimated finish time if provided
        String estimatedFinishTime = (String) confirmationData.get("estimatedFinishTime");
        if (estimatedFinishTime != null && !estimatedFinishTime.isEmpty()) {
            try {
                appointment.setEstimatedFinishTime(java.time.LocalTime.parse(estimatedFinishTime));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid time format for estimated finish time. Use HH:MM:SS format."
                ));
            }
        }

        // Update the staff ID if provided
        Integer staffId = null;
        if (confirmationData.get("staffId") != null) {
            try {
                staffId = Integer.parseInt(confirmationData.get("staffId").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid staff ID format"
                ));
            }

            // Validate that the staff exists
            Staff staff = staffMapper.findById(staffId);
            if (staff == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Staff with ID " + staffId + " not found"
                ));
            }

            appointment.setStaffId(staffId);
        }

        // Update the appointment
        appointmentMapper.update(appointment);

        // Get full appointment details for notification
        ServiceAppointment fullAppointment = appointmentMapper.findByIdWithDetails(id);

        // Use the simplified notification method for confirmation
        notificationService.notifyCustomerAboutAppointment(fullAppointment, "SCHEDULED");

        return ResponseEntity.ok(Map.of(
            "id", appointment.getAppointmentId(),
            "status", appointment.getAppointmentStatus(),
            "staffId", appointment.getStaffId(),
            "estimatedFinishTime", appointment.getEstimatedFinishTime() != null ?
                appointment.getEstimatedFinishTime().toString() : null,
            "message", "Appointment confirmed successfully"
        ));
    }

    // Public endpoints for services and outlets
    @GetMapping("/public/services")
    public ResponseEntity<?> getAllServices() {
        List<ServiceType> services = serviceMapper.findAll();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/public/outlets")
    public ResponseEntity<?> getAllOutlets() {
        List<ServiceOutlet> outlets = outletMapper.findAll();
        return ResponseEntity.ok(outlets);
    }

    @GetMapping("/public/timeslots")
    public ResponseEntity<?> getAvailableTimeSlots(
            @RequestParam Short year,
            @RequestParam Short month,
            @RequestParam Short day) {

        List<TimeSlot> timeSlots = timeSlotMapper.findByDate(year, month, day);
        return ResponseEntity.ok(timeSlots);
    }

    @GetMapping("/public/available-timeslots")
    public ResponseEntity<?> getAvailableTimeSlotsForOutlet(
            @RequestParam Short year,
            @RequestParam Short month,
            @RequestParam Short day,
            @RequestParam Integer outletId) {
        List<TimeSlot> availableTimeSlots = timeSlotService.getAvailableTimeSlots(year, month, day, outletId);
        return ResponseEntity.ok(availableTimeSlots);
    }
}
