package com.example.portal.service;

import com.example.portal.model.ServiceAppointment;
import com.example.portal.model.Staff;
import com.example.portal.model.TimeSlot;
import com.example.portal.repository.ServiceAppointmentMapper;
import com.example.portal.repository.StaffMapper;
import com.example.portal.repository.TimeSlotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private final TimeSlotMapper timeSlotMapper;
    private final StaffMapper staffMapper;
    private final ServiceAppointmentMapper appointmentMapper;

    private static final LocalTime BUSINESS_HOURS_START = LocalTime.of(9, 0); // 9:00 AM
    private static final LocalTime BUSINESS_HOURS_END = LocalTime.of(17, 0);  // 5:00 PM
    private static final int SLOT_DURATION_MINUTES = 60; // 1 hour slots

    /**
     * Get available time slots for a specific date and outlet
     */
    public List<TimeSlot> getAvailableTimeSlots(Short year, Short month, Short day, Integer outletId) {
        // Get all staff members for the outlet
        List<Staff> staffMembers = staffMapper.findByOutletId(outletId);

        if (staffMembers.isEmpty()) {
            return Collections.emptyList();
        }

        // Get all appointments for the outlet on the specified date
        List<ServiceAppointment> appointments = appointmentMapper.findByOutletIdAndDate(outletId, year, month, day);

        // Calculate staff availability
        Map<Integer, List<TimeRange>> staffAvailability = calculateStaffAvailability(staffMembers, appointments, year, month, day);

        // Generate available time slots
        return generateAvailableTimeSlots(year, month, day, staffAvailability);
    }

    /**
     * Calculate availability for each staff member
     */
    private Map<Integer, List<TimeRange>> calculateStaffAvailability(
            List<Staff> staffMembers,
            List<ServiceAppointment> appointments,
            Short year, Short month, Short day) {

        Map<Integer, List<TimeRange>> staffAvailability = new HashMap<>();

        // Initialize availability for each staff member (full day)
        for (Staff staff : staffMembers) {
            if (staff.getStaffId() == 9999) continue; // Skip the unassigned staff

            List<TimeRange> availability = new ArrayList<>();
            availability.add(new TimeRange(BUSINESS_HOURS_START, BUSINESS_HOURS_END));
            staffAvailability.put(staff.getStaffId(), availability);
        }

        // Remove time ranges that are already booked
        for (ServiceAppointment appointment : appointments) {
            // Skip appointments that are cancelled or pending
            if ("CANCELLED".equals(appointment.getAppointmentStatus()) ||
                "PENDING".equals(appointment.getAppointmentStatus())) {
                continue;
            }

            // Skip appointments for unassigned staff
            if (appointment.getStaffId() == 9999) {
                continue;
            }

            Integer staffId = appointment.getStaffId();
            List<TimeRange> availability = staffAvailability.get(staffId);

            if (availability != null && appointment.getTimeSlot() != null) {
                LocalTime startTime = appointment.getTimeSlot().getTimeClocktime();

                // Calculate end time based on duration or estimated finish time
                LocalTime endTime;
                if (appointment.getEstimatedFinishTime() != null) {
                    endTime = appointment.getEstimatedFinishTime();
                } else {
                    endTime = startTime.plusMinutes(appointment.getAppointmentDuration());
                }

                // Update availability by removing the booked time range
                List<TimeRange> updatedAvailability = new ArrayList<>();

                for (TimeRange range : availability) {
                    // If appointment is completely outside this range, keep the range unchanged
                    if (endTime.isBefore(range.getStart()) || startTime.isAfter(range.getEnd())) {
                        updatedAvailability.add(range);
                        continue;
                    }

                    // If appointment starts after range start, keep the beginning part
                    if (startTime.isAfter(range.getStart())) {
                        updatedAvailability.add(new TimeRange(range.getStart(), startTime));
                    }

                    // If appointment ends before range end, keep the ending part
                    if (endTime.isBefore(range.getEnd())) {
                        updatedAvailability.add(new TimeRange(endTime, range.getEnd()));
                    }
                }

                staffAvailability.put(staffId, updatedAvailability);
            }
        }

        return staffAvailability;
    }

    /**
     * Generate available time slots based on staff availability
     */
    private List<TimeSlot> generateAvailableTimeSlots(
            Short year, Short month, Short day,
            Map<Integer, List<TimeRange>> staffAvailability) {

        // Generate all possible hourly time slots during business hours
        Set<LocalTime> allPossibleTimes = new HashSet<>();
        LocalTime current = BUSINESS_HOURS_START;
        while (current.isBefore(BUSINESS_HOURS_END)) {
            if (current.getMinute() == 0) { // Only add slots that start at the hour
                allPossibleTimes.add(current);
            }
            current = current.plusHours(1);
        }

        // For each possible time, check if at least one staff is available
        Set<LocalTime> availableTimes = new HashSet<>();
        for (LocalTime time : allPossibleTimes) {
            // A time slot is available if at least one staff member is available at that time
            boolean isTimeAvailable = false;

            // Check each staff's availability
            for (List<TimeRange> staffRanges : staffAvailability.values()) {
                // For each available time range of this staff
                for (TimeRange range : staffRanges) {
                    // Check if the time slot fits within this range
                    LocalTime slotEnd = time.plusMinutes(SLOT_DURATION_MINUTES);
                    if (!time.isBefore(range.getStart()) && !slotEnd.isAfter(range.getEnd())) {
                        isTimeAvailable = true;
                        break;
                    }
                }
                if (isTimeAvailable) {
                    break; // No need to check other staff if one is available
                }
            }

            if (isTimeAvailable) {
                availableTimes.add(time);
            }
        }

        // Convert to TimeSlot objects
        List<TimeSlot> timeSlots = new ArrayList<>();
        for (LocalTime time : availableTimes) {
            // Check if this time slot already exists in the database
            List<TimeSlot> existingSlots = timeSlotMapper.findByDateAndTime(year, month, day, time);

            if (!existingSlots.isEmpty()) {
                // Use existing time slot
                timeSlots.add(existingSlots.get(0));
            } else {
                // Create a new time slot
                TimeSlot slot = new TimeSlot();
                slot.setTimeYear(year);
                slot.setTimeQuarter(calculateQuarter(month));
                slot.setTimeMonth(month);
                slot.setTimeDay(day);
                slot.setTimeClocktime(time);

                // We don't insert it yet - we'll only create time slots when they're actually booked
                timeSlots.add(slot);
            }
        }

        return timeSlots.stream()
                .sorted(Comparator.comparing(TimeSlot::getTimeClocktime))
                .collect(Collectors.toList());
    }

    /**
     * Calculate the quarter based on the month
     */
    private Short calculateQuarter(Short month) {
        if (month <= 3) return 1;
        if (month <= 6) return 2;
        if (month <= 9) return 3;
        return 4;
    }

    /**
     * Create a new time slot or get an existing one
     */
    @Transactional
    public TimeSlot getOrCreateTimeSlot(Short year, Short month, Short day, LocalTime time) {
        // Check if this time slot already exists
        List<TimeSlot> existingSlots = timeSlotMapper.findByDateAndTime(year, month, day, time);

        if (!existingSlots.isEmpty()) {
            return existingSlots.get(0);
        }

        // Create a new time slot
        TimeSlot slot = new TimeSlot();
        slot.setTimeYear(year);
        slot.setTimeQuarter(calculateQuarter(month));
        slot.setTimeMonth(month);
        slot.setTimeDay(day);
        slot.setTimeClocktime(time);

        // Insert into database
        timeSlotMapper.insert(slot);

        return slot;
    }

    /**
     * Helper class to represent a time range
     */
    private static class TimeRange {
        private final LocalTime start;
        private final LocalTime end;

        public TimeRange(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }

        public LocalTime getStart() {
            return start;
        }

        public LocalTime getEnd() {
            return end;
        }
    }
}
