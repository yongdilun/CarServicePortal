package com.example.portal.model;

import lombok.Data;
import java.time.LocalTime;

@Data
public class TimeSlot {
    private Integer timeId;
    private Short timeYear;
    private Short timeQuarter;
    private Short timeMonth;
    private Short timeDay;
    private LocalTime timeClocktime;
}
