package com.b7g2_08.blooddonationsystem.DTOs.Request;

import java.time.LocalDate;
import java.util.List;

public class requestCreateDTO {
    protected List<Integer> quantities;

    protected LocalDate deadline;

    protected Integer hospitalID;

    public List<Integer> getQuantities() {
        return quantities;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public Integer getHospitalID() {
        return hospitalID;
    }
}
