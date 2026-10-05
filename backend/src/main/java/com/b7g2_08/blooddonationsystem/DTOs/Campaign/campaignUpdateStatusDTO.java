package com.b7g2_08.blooddonationsystem.DTOs.Campaign;

import com.b7g2_08.blooddonationsystem.Enums.campStatus;
import jakarta.validation.constraints.NotNull;

public class campaignUpdateStatusDTO {

    @NotNull(message = "status is required")
    protected campStatus status;

    public campStatus getStatus()
    {
        return status;
    }


}
