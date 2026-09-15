package com.b7g2_08.blooddonationsystem.DTOs.Campaign;

import com.b7g2_08.blooddonationsystem.Enums.campStatus;

public class campaignStatusDTO {
    protected Integer campaignID;
    protected campStatus status;

    public Integer getCampaignID() {
        return campaignID;
    }

    public campStatus getCampaignStatus()
    {
        return status;
    }


}
