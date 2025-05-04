package com.example.portal.controller;

import com.example.portal.model.Staff;
import com.example.portal.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable Integer id) {
        Staff staff = staffService.findById(id);
        if (staff != null) {
            return ResponseEntity.ok(staff);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Staff> getStaffByName(@PathVariable String name) {
        Staff staff = staffService.findByName(name);
        if (staff != null) {
            return ResponseEntity.ok(staff);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/outlet/{outletId}")
    public ResponseEntity<List<Staff>> getStaffByOutletId(@PathVariable Integer outletId) {
        List<Staff> staffList = staffService.findByOutletId(outletId);
        return ResponseEntity.ok(staffList);
    }
}
