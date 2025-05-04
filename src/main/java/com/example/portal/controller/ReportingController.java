package com.example.portal.controller;

import com.example.portal.model.ServiceAppointment;
import com.example.portal.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/customer/{customerId}/history")
    public ResponseEntity<List<ServiceAppointment>> getCustomerServiceHistory(@PathVariable Integer customerId) {
        List<ServiceAppointment> history = reportingService.getCustomerServiceHistory(customerId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/services/popular")
    public ResponseEntity<List<Map<String, Object>>> getPopularServiceTypes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Map<String, Object>> popularServices = reportingService.getPopularServiceTypes(startDate, endDate);
        return ResponseEntity.ok(popularServices);
    }

    @GetMapping("/busy-periods")
    public ResponseEntity<Map<String, Object>> getBusyPeriodsAnalysis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> busyPeriods = reportingService.getBusyPeriodsAnalysis(startDate, endDate);
        return ResponseEntity.ok(busyPeriods);
    }

    @GetMapping("/staff/performance")
    public ResponseEntity<List<Map<String, Object>>> getStaffPerformanceMetrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Map<String, Object>> staffPerformance = reportingService.getStaffPerformanceMetrics(startDate, endDate);
        return ResponseEntity.ok(staffPerformance);
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReporting(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> revenue = reportingService.getRevenueReporting(startDate, endDate);
        return ResponseEntity.ok(revenue);
    }
}
