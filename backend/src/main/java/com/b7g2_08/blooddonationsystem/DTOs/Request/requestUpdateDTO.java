package com.b7g2_08.blooddonationsystem.DTOs.Request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public class requestUpdateDTO {

    @NotNull
    private Integer reqID;

    @NotNull(message = "quantities is required")
    @Size(min = 8, max = 8, message = "quantities must have one entry per blood type (8)")
    private List<@NotNull @PositiveOrZero Integer> quantities;

    @NotNull(message = "deadline is required")
    @FutureOrPresent(message = "deadline cannot be in the past")
    private LocalDate deadline;

    @NotNull
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
