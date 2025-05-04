package com.example.portal.service;

import com.example.portal.model.Staff;
import com.example.portal.repository.StaffMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffMapper staffMapper;
    private final PasswordEncoder passwordEncoder;

    public Staff findById(Integer staffId) {
        return staffMapper.findById(staffId);
    }

    public Staff findByName(String name) {
        return staffMapper.findByName(name);
    }

    public List<Staff> findByOutletId(Integer outletId) {
        return staffMapper.findByOutletId(outletId);
    }

    public boolean isNameAvailable(String name) {
        return staffMapper.findByName(name) == null;
    }

    @Transactional
    public Staff registerStaff(Staff staff) {
        // Encode the password
        staff.setStaffPassword(passwordEncoder.encode(staff.getStaffPassword()));

        // Insert the staff
        staffMapper.insert(staff);

        return staff;
    }

    @Transactional
    public boolean updateStaff(Staff staff) {
        return staffMapper.update(staff) > 0;
    }

    @Transactional
    public boolean updatePassword(Integer staffId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        return staffMapper.updatePassword(staffId, encodedPassword) > 0;
    }

    @Transactional
    public boolean deleteStaff(Integer staffId) {
        return staffMapper.delete(staffId) > 0;
    }

    public boolean checkPassword(Integer staffId, String rawPassword) {
        Staff staff = staffMapper.findById(staffId);
        if (staff == null) {
            return false;
        }

        return passwordEncoder.matches(rawPassword, staff.getStaffPassword());
    }

    public boolean checkPassword(String name, String rawPassword) {
        Staff staff = staffMapper.findByName(name);
        if (staff == null) {
            return false;
        }

        return passwordEncoder.matches(rawPassword, staff.getStaffPassword());
    }
}
