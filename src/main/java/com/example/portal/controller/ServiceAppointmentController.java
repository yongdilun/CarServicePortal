package com.example.portal.controller;

import com.example.portal.model.*;
import com.example.portal.repository.*;
import com.example.portal.service.NotificationService;
import com.example.portal.service.ServiceOutletService;
import com.example.portal.service.ServiceService;
import com.example.portal.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(ServiceAppointmentController.class);

    private final ServiceAppointmentMapper appointmentMapper;
    private final CustomerMapper customerMapper;
    private final StaffMapper staffMapper;
    private final VehicleMapper vehicleMapper;
    private final TimeSlotMapper timeSlotMapper;
    private final TimeSlotService timeSlotService;
    private final NotificationService notificationService;
    private final ServiceService serviceService;
    private final ServiceOutletService outletService;

    // Customer endpoints
    @GetMapping("/customer/appointments")
    public ResponseEntity<?> getCustomerAppointments(@RequestParam Integer custId) {
        List<ServiceAppointment> appointments = appointmentMapper.findByCustomerIdWithDetails(custId);
        return ResponseEntity.ok(appointments);
    }

    @PostMapping("/customer/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody ServiceAppointment appointment) {
        logger.debug("Creating appointment: {}", appointment);

        try {
            // Validate customer
            Integer custId = appointment.getCustId();
            if (custId == null) {
                logger.warn("Customer ID is missing in appointment request");
                return ResponseEntity.badRequest().body(Map.of("error", "Customer ID is required"));
            }

            Customer customer = customerMapper.findById(custId);
            if (customer == null) {
                logger.warn("Invalid customer ID: {}", custId);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid customer ID"));
            }

            // Validate vehicle
            Integer vehId = appointment.getVehId();
            if (vehId == null) {
                logger.warn("Vehicle ID is missing in appointment request");
                return ResponseEntity.badRequest().body(Map.of("error", "Vehicle ID is required"));
            }

            Vehicle vehicle = vehicleMapper.findById(vehId);
            if (vehicle == null) {
                logger.warn("Invalid vehicle ID: {}", vehId);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid vehicle ID"));
            }

            // Validate service
            Integer serviceId = appointment.getServiceId();
            if (serviceId == null) {
                logger.warn("Service ID is missing in appointment request");
                return ResponseEntity.badRequest().body(Map.of("error", "Service ID is required"));
            }

            logger.debug("Appointment service field before findById: {}", appointment.getService());
            logger.debug("Appointment serviceId: {}, type: {}", serviceId, serviceId != null ? serviceId.getClass().getName() : "null");

            ServiceType service = null;
            try {
                // First, try to get the service from the database
                service = serviceService.findById(serviceId);
                logger.debug("Service retrieved: {}", service);

                if (service == null) {
                    // If service is null, try to create a new ServiceType with the ID
                    logger.warn("Service not found in database, creating a temporary service object");
                    service = new ServiceType();
                    service.setServiceId(serviceId);
                    service.setServiceType("Service #" + serviceId);
                }
            } catch (Exception e) {
                logger.error("Error retrieving service with ID {}: {}", serviceId, e.getMessage(), e);

                // Create a temporary service object to continue the process
                logger.warn("Creating a temporary service object due to error");
                service = new ServiceType();
                service.setServiceId(serviceId);
                service.setServiceType("Service #" + serviceId);
            }

            // Service will never be null at this point due to the fallback mechanism
            logger.debug("Using service: {}", service);

            // Validate outlet
            Integer outletId = appointment.getOutletId();
            if (outletId == null) {
                logger.warn("Outlet ID is missing in appointment request");
                return ResponseEntity.badRequest().body(Map.of("error", "Outlet ID is required"));
            }

            ServiceOutlet outlet = null;
            try {
                // First, try to get the outlet from the database
                outlet = outletService.findById(outletId);
                logger.debug("Outlet retrieved: {}", outlet);

                if (outlet == null) {
                    // If outlet is null, try to create a new ServiceOutlet with the ID
                    logger.warn("Outlet not found in database, creating a temporary outlet object");
                    outlet = new ServiceOutlet();
                    outlet.setOutletId(outletId);
                    outlet.setOutletName("Outlet #" + outletId);
                }
            } catch (Exception e) {
                logger.error("Error retrieving outlet with ID {}: {}", outletId, e.getMessage(), e);

                // Create a temporary outlet object to continue the process
                logger.warn("Creating a temporary outlet object due to error");
                outlet = new ServiceOutlet();
                outlet.setOutletId(outletId);
                outlet.setOutletName("Outlet #" + outletId);
            }

            // Outlet will never be null at this point due to the fallback mechanism
            logger.debug("Using outlet: {}", outlet);

            // Get or create the time slot
            TimeSlot timeSlot;
            if (appointment.getTimeId() != null) {
                // If a time ID is provided, validate it
                timeSlot = timeSlotMapper.findById(appointment.getTimeId());
                if (timeSlot == null) {
                    logger.warn("Invalid time slot ID: {}", appointment.getTimeId());
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid time slot ID"));
                }
            } else if (appointment.getTimeSlot() != null) {
                // If time details are provided, get or create the time slot
                TimeSlot requestedSlot = appointment.getTimeSlot();
                if (requestedSlot.getTimeYear() == null || requestedSlot.getTimeMonth() == null ||
                    requestedSlot.getTimeDay() == null || requestedSlot.getTimeClocktime() == null) {
                    logger.warn("Incomplete time slot information: {}", requestedSlot);
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
                logger.warn("No time slot information provided");
                return ResponseEntity.badRequest().body(Map.of("error", "Time slot information is required"));
            }

            // Set initial status to PENDING (waiting for staff confirmation)
            appointment.setAppointmentStatus("PENDING");

            // When a customer books an appointment, assign it to the "unassigned" staff
            // A real staff member will be assigned during confirmation
            appointment.setStaffId(9999); // Unassigned staff ID

            // Insert appointment
            logger.debug("Inserting appointment into database: {}", appointment);
            appointmentMapper.insert(appointment);
            logger.debug("Appointment inserted with ID: {}", appointment.getAppointmentId());

            // Format date for notification
            String appointmentDate = timeSlot.getTimeYear() + "-" +
                                    timeSlot.getTimeMonth() + "-" +
                                    timeSlot.getTimeDay() + " at " +
                                    timeSlot.getTimeClocktime();

            // Send notification to customer
            logger.debug("Sending appointment booking notification to customer: {}", customer.getCustId());
            String serviceTypeName = service != null ? service.getServiceType() : "service";
            logger.debug("Using service type name for notification: {}", serviceTypeName);

            notificationService.notifyAppointmentBooked(
                customer.getCustId(),
                "customer",
                appointment.getAppointmentId(),
                serviceTypeName,
                appointmentDate,
                customer.getCustEmail()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("id", appointment.getAppointmentId());
            response.put("status", appointment.getAppointmentStatus());
            response.put("message", "Appointment created successfully");

            logger.debug("Appointment creation successful: {}", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "An unexpected error occurred while creating the appointment: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/customer/appointments/{id}")
    public ResponseEntity<?> getCustomerAppointmentDetails(@PathVariable Integer id) {
        ServiceAppointment appointment = appointmentMapper.findByIdWithDetails(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(appointment);
    }

    // Generic appointment endpoint that can be used by any client
    @GetMapping("/appointments/{id}")
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

        try {
            logger.debug("Confirming appointment ID: {} with data: {}", id, confirmationData);

            ServiceAppointment appointment = appointmentMapper.findById(id);
            if (appointment == null) {
                logger.warn("Appointment not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }

            // Only pending appointments can be confirmed
            if (!"PENDING".equals(appointment.getAppointmentStatus())) {
                logger.warn("Cannot confirm appointment with status: {}", appointment.getAppointmentStatus());
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
                    logger.debug("Parsing estimated finish time: {}", estimatedFinishTime);
                    appointment.setEstimatedFinishTime(java.time.LocalTime.parse(estimatedFinishTime));
                } catch (Exception e) {
                    logger.error("Invalid time format: {}", estimatedFinishTime, e);
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid time format for estimated finish time. Use HH:MM:SS format."
                    ));
                }
            } else {
                logger.warn("No estimated finish time provided for appointment: {}", id);
            }

            // Update the staff ID if provided
            Integer staffId = null;
            if (confirmationData.get("staffId") != null) {
                try {
                    staffId = Integer.parseInt(confirmationData.get("staffId").toString());
                    logger.debug("Staff ID provided: {}", staffId);
                } catch (NumberFormatException e) {
                    logger.error("Invalid staff ID format: {}", confirmationData.get("staffId"), e);
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid staff ID format"
                    ));
                }

                // Validate that the staff exists
                Staff staff = staffMapper.findById(staffId);
                if (staff == null) {
                    logger.warn("Staff not found with ID: {}", staffId);
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Staff with ID " + staffId + " not found"
                    ));
                }

                appointment.setStaffId(staffId);
            } else {
                logger.warn("No staff ID provided for appointment: {}", id);
            }

            // Update the appointment
            logger.debug("Updating appointment in database: {}", appointment);
            int updated = appointmentMapper.update(appointment);
            logger.debug("Appointment updated, rows affected: {}", updated);

            // Get full appointment details for notification
            ServiceAppointment fullAppointment = appointmentMapper.findByIdWithDetails(id);
            if (fullAppointment == null) {
                logger.warn("Could not retrieve full appointment details for ID: {}", id);
            }

            // Use the simplified notification method for confirmation
            try {
                logger.debug("Sending notification for confirmed appointment: {}", id);
                notificationService.notifyCustomerAboutAppointment(fullAppointment, "SCHEDULED");
            } catch (Exception e) {
                // Log but don't fail the confirmation if notification fails
                logger.error("Failed to send notification for appointment confirmation: {}", e.getMessage(), e);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", appointment.getAppointmentId());
            response.put("status", appointment.getAppointmentStatus());
            response.put("staffId", appointment.getStaffId());
            response.put("estimatedFinishTime", appointment.getEstimatedFinishTime() != null ?
                appointment.getEstimatedFinishTime().toString() : null);
            response.put("message", "Appointment confirmed successfully");

            logger.debug("Appointment confirmation successful: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error confirming appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "An unexpected error occurred while confirming the appointment: " + e.getMessage()
            ));
        }
    }

    // Public endpoints for services and outlets
    @GetMapping("/public/services")
    public ResponseEntity<?> getAllServices() {
        List<ServiceType> services = serviceService.findAllServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/public/outlets")
    public ResponseEntity<?> getAllOutlets() {
        List<ServiceOutlet> outlets = outletService.findAllOutlets();
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
