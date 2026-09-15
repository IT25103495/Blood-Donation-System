package com.b7g2_08.blooddonationsystem.DTOs.Request;

import java.time.LocalDate;
import java.util.List;

public class requestUpdateDTO {
    private Integer reqID;

    private List<Integer> quantities;

    private LocalDate deadline;

    private Integer hospitalID;

    public Integer getReqID() {
        return reqID;
    }

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
